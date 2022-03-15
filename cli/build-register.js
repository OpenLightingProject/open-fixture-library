#!/usr/bin/env node

import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

import importJson from '../lib/import-json.js';
import { Register } from '../lib/register.js';

let register;
let manufacturers;

const fixturesPath = fileURLToPath(new URL(`../fixtures/`, import.meta.url));

try {
  manufacturers = await importJson(`../fixtures/manufacturers.json`, import.meta.url);
  register = new Register(manufacturers);

  await addFixturesToRegister();
}
catch (readError) {
  console.error(`Read error:`, readError);
  process.exit(1);
}

const registerFilename = path.join(fixturesPath, (process.argv.length === 3 ? process.argv[2] : `register.json`));
const fileContents = `${JSON.stringify(register.getAsSortedObject(), null, 2)}\n`;

try {
  await writeFile(registerFilename, fileContents, `utf8`);
  console.log(chalk.green(`[Success]`), `Updated register file`, registerFilename);
  process.exit(0);
}
catch (error) {
  console.error(chalk.red(`[Fail]`), `Could not write register file.`, error);
  process.exit(1);
}


/**
 * Loop through all manufacturer directories and fixture files and add them to the register.
 */
async function addFixturesToRegister() {
  const directoryEntries = await readdir(fixturesPath, { withFileTypes: true });
  const manufacturerKeys = directoryEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

  for (const manufacturerKey of manufacturerKeys) {
    register.addManufacturer(manufacturerKey, manufacturers[manufacturerKey]);

    const manufacturerDirectory = path.join(fixturesPath, manufacturerKey);
    const fixtureFiles = await readdir(manufacturerDirectory);
    for (const filename of fixtureFiles) {
      if (path.extname(filename) !== `.json`) {
        continue;
      }

      const fixtureKey = path.basename(filename, `.json`);
      const fixtureData = await importJson(`${manufacturerKey}/${filename}`, fixturesPath);

      if (fixtureData.$schema.endsWith(`/fixture-redirect.json`)) {
        const redirectToData = await importJson(`${fixtureData.redirectTo}.json`, fixturesPath);

        register.addFixtureRedirect(manufacturerKey, fixtureKey, fixtureData, redirectToData);
      }
      else {
        register.addFixture(manufacturerKey, fixtureKey, fixtureData);
      }
    }
  }
}
