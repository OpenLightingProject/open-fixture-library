#!/usr/bin/node

const fs = require('fs');
const minimist = require('minimist');

const checkFixture = require('../tests/fixture-valid.js');
const importPlugins = require('../plugins/plugins.js').import;
const createPullRequest = require('../lib/create-github-pr.js');

const args = minimist(process.argv.slice(2), {
  string: 'p',
  boolean: 'c',
  alias: {
    p: 'plugin',
    c: 'create-pull-request'
  }
});

const filename = args._[0];

if (args._.length !== 1 || !(args.plugin in importPlugins)) {
  console.error(`Usage: ${process.argv[1]} -p <plugin> [--create-pull-request] <filename>\n\navailable plugins: ${Object.keys(importPlugins).join(', ')}`);
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

    for (const key of Object.keys(result.fixtures)) {
      const [manKey, fixKey] = key.split('/');

      const checkResult = checkFixture(manKey, fixKey, result.fixtures[key]);

      result.warnings[key] = result.warnings[key].concat(checkResult.warnings);
      result.errors[key] = checkResult.errors;
    }

    if (args['create-pull-request']) {
      createPullRequest(result, (error, pullRequestUrl) => {
        if (error) {
          console.log(JSON.stringify(result, null, 2));
          console.error('Error: ' + error);
          return;
        }

        console.log('URL: ' + pullRequestUrl);
      });
    }
    else {
      console.log(JSON.stringify(result, null, 2));
    }
  }).catch(error => {
    console.error(error);
  });
});
