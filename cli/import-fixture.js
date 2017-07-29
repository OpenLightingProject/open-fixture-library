#!/usr/bin/node

const fs = require('fs');
const minimist = require('minimist');

const checkFixture = require('../tests/fixture-valid.js').checkFixture;
const importPlugins = require('../plugins/plugins.js').import;

const args = minimist(process.argv.slice(2), {
  boolean: 'p',
  alias: { p: 'plugin' }
});

const filename = args._[0];

if (args._.length !== 1 || !(args.plugin in importPlugins)) {
  console.error(`Usage: ${process.argv[1]} -p <plugin> <filename>\n\navailable plugins: ${Object.keys(importPlugins).join(', ')}`);
  process.exit(1);
}

fs.readFile(filename, 'utf8', (error, data) => {
  if (error) {
    console.error('read error', error);
    process.exit(1);
    return;
  }

  new Promise((resolve, reject) => {
    importPlugins[args.plugin].import(data, filename, resolve, reject);
  }).then(result => {
    result.errors = {};

    for (const fixKey of Object.keys(result.fixtures)) {
      const checkResult = checkFixture(result.fixtures[fixKey]);

      result.warnings[fixKey] = result.warnings[fixKey].concat(checkResult.warnings);
      result.errors[fixKey] = checkResult.errors;
    }

    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error(error);
  });
});