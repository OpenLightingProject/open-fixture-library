#!/usr/bin/env node
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import chalk from 'chalk';
import minimist from 'minimist';

import importJson from '../lib/import-json.js';
import { fixtureFromRepository } from '../lib/model.js';

try {
  const cliArguments = minimist(process.argv.slice(2), {
    string: [`p`, `o`],
    boolean: [`h`, `a`],
    alias: { p: `plugin`, h: `help`, a: `all-fixtures`, o: `output-dir` },
  });

  await checkCliArguments(cliArguments);

  let fixtures;
  if (cliArguments.a) {
    const register = await importJson(`../fixtures/register.json`, import.meta.url);
    fixtures = Object.keys(register.filesystem).filter(
      fixtureKey => !(`redirectTo` in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === `SameAsDifferentBrand`,
    ).map(fixtureKey => fixtureKey.split(`/`));
  }
  else {
    fixtures = cliArguments._.map(relativePath => {
      const absolutePath = path.join(process.cwd(), relativePath);
      return [
        path.basename(path.dirname(absolutePath)), // man key
        path.basename(absolutePath, path.extname(absolutePath)), // fix key
      ];
    });
  }

  const outDirectory = cliArguments.o ? path.resolve(process.cwd(), cliArguments.o) : null;

  const plugin = await import(`../plugins/${cliArguments.plugin}/export.js`);
  const files = await plugin.exportFixtures(
    await Promise.all(fixtures.map(
      ([manufacturer, fixture]) => fixtureFromRepository(manufacturer, fixture),
    )),
    {
      baseDirectory: fileURLToPath(new URL(`../`, import.meta.url)),
      date: new Date(),
    },
  );
  for (const file of files) {
    if (cliArguments.o) {
      const filePath = path.join(outDirectory, file.name);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, file.content);
      console.log(`Created file ${filePath}`);
    }
    else {
      console.log();
      console.log(chalk.yellow(`File name: '${file.name}'`));
      console.log(file.content);
    }
  }
}
catch (error) {
  console.error(chalk.red(`[Error]`), `Exporting failed:`, error);
  process.exit(1);
}


/**
 * @param {Record<string, any>} cliArguments Command line interface arguments parsed by minimist.
 */
async function checkCliArguments(cliArguments) {
  const helpMessage = [
    `Usage: ${process.argv[1]} -p <plugin name> [ -a | <fixture> [<more fixtures>] ]`,
    `Options:`,
    `  --plugin,       -p: Which plugin should be used to export fixtures.`,
    `                      E. g. ecue or qlcplus`,
    `  --all-fixtures, -a: Use all fixtures from register`,
    `  --output-dir,   -o: If set, save outputted files in this directory`,
    `                      instead of printing the contents in the console`,
    `  --help,         -h: Show this help message.`,
  ].join(`\n`);

  if (cliArguments.help) {
    console.log(helpMessage);
    process.exit(0);
  }

  if (!cliArguments.plugin) {
    console.error(chalk.red(`[Error]`), `No plugin specified. See --help for usage.`);
    process.exit(1);
  }

  if (cliArguments._.length === 0 && !cliArguments.a) {
    console.error(chalk.red(`[Error]`), `No fixtures specified. See --help for usage.`);
    process.exit(1);
  }

  const plugins = await importJson(`../plugins/plugins.json`, import.meta.url);

  if (!plugins.exportPlugins.includes(cliArguments.plugin)) {
    console.error(chalk.red(`[Error]`), `Plugin '${cliArguments.plugin}' does not exist or does not support exporting.\n\navailable plugins:`, plugins.exportPlugins.join(`, `));
    process.exit(1);
  }
}
