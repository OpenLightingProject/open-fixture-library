#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import minimist from 'minimist';

import importJson from '../lib/import-json.js';
import { fixtureFromFile, fixtureFromRepository } from '../lib/model.js';

const failLabel = chalk.red(`[FAIL]`);
const passLabel = chalk.green(`[PASS]`);

try {
  const plugins = await importJson(`../plugins/plugins.json`, import.meta.url);
  const testFixtures = await importJson(`../tests/test-fixtures.json`, import.meta.url);

  const cliArguments = minimist(process.argv.slice(2), {
    string: [`p`],
    boolean: [`h`],
    alias: { p: `plugin`, h: `help` },
  });

  const scriptName = import.meta.url.split(`/`).pop();

  const helpMessage = [
    `Run the plugin's export tests against the specified fixtures`,
    `(or the test fixtures, if no fixtures are specified).`,
    `Usage: node ${scriptName} -p <plugin> [ <fixtures> ]`,
    `Options:`,
    `  --plugin,   -p: Key of the plugin whose export tests should be called`,
    `  --help,     -h: Show this help message.`,
  ].join(`\n`);

  if (cliArguments.help) {
    console.log(helpMessage);
    process.exit(0);
  }

  if (!cliArguments.plugin) {
    console.error(chalk.red(`[Error]`), `Plugin has to be specified using --plugin`);
    console.log(helpMessage);
    process.exit(1);
  }

  if (!plugins.exportPlugins.includes(cliArguments.plugin)) {
    console.error(chalk.red(`[Error]`), `Plugin '${cliArguments.plugin}' is not a valid export plugin.\nAvailable export plugins:`, plugins.exportPlugins.join(`, `));
    process.exit(1);
  }

  const pluginData = plugins.data[cliArguments.plugin];
  if (pluginData.exportTests.length === 0) {
    console.log(chalk.green(`[PASS]`), `Plugin '${cliArguments.plugin}' has no export tests.`);
    process.exit(0);
  }

  const fixtures = cliArguments._.length === 0
    ? testFixtures.map(fixture => fixtureFromRepository(fixture.man, fixture.key))
    : cliArguments._.map(relativePath => fixtureFromFile(path.join(process.cwd(), relativePath)));

  const exportPlugin = await import(`../plugins/${cliArguments.plugin}/export.js`);

  const files = await exportPlugin.exportFixtures(
    await Promise.all(fixtures),
    {
      baseDirectory: fileURLToPath(new URL(`../`, import.meta.url)),
      date: new Date(),
    },
  );

  await Promise.all(pluginData.exportTests.map(async testKey => {
    const { default: exportTest } = await import(`../plugins/${cliArguments.plugin}/exportTests/${testKey}.js`);

    const outputPerFile = await Promise.all(files.map(async file => {
      try {
        await exportTest(file, files);
        return `${passLabel} ${file.name}`;
      }
      catch (testError) {
        const errors = Array.isArray(testError) ? testError : [testError];

        return [
          `${failLabel} ${file.name}`,
          ...errors.map(error => `- ${error}`),
        ].join(`\n`);
      }
    }));

    console.log();
    console.log(chalk.yellow(`Test ${testKey}`));
    console.log(outputPerFile.join(`\n`));
  }));
}
catch (error) {
  console.error(chalk.red(`[Error]`), `Exporting failed:`, error);
  process.exit(1);
}
