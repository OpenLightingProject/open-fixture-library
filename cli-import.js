#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const checkFixture = require(path.join(__dirname, 'tests', 'fixture_valid')).checkFixture;
const createPullRequest = require(path.join(__dirname, 'lib', 'create-github-pr'));

let importPlugins = {};
for (const filename of fs.readdirSync(path.join(__dirname, 'plugins'))) {
  const plugin = require(path.join(__dirname, 'plugins', filename));
  if ('import' in plugin) {
    importPlugins[path.basename(filename, '.js')] = plugin;
  }
}

const args = minimist(process.argv.slice(2), {
  boolean: 'p',
  alias: { p: 'pr' }
});

const selectedPlugin = args._[0];
const filename = args._[1];
const makePR = args.pr;

if (args._.length !== 2 || !(selectedPlugin in importPlugins)) {
  console.error(`Usage: ${process.argv[1]} <plugin> <filename> [--pr]\n\navailable plugins: ${Object.keys(importPlugins).join(', ')}`);
  process.exit(1);
}

fs.readFile(filename, 'utf8', (error, data) => {
  if (error) {
    console.error('read error', error);
    process.exit(1);
    return;
  }

  new Promise((resolve, reject) => {
    importPlugins[selectedPlugin].import(data, filename, resolve, reject);
  }).then(result => {
    result.errors = {};

    for (const fixKey in result.fixtures) {
      const checkResult = checkFixture(result.fixtures[fixKey]);

      result.warnings[fixKey] = result.warnings[fixKey].concat(checkResult.warnings);
      result.errors[fixKey] = checkResult.errors;
    }

    console.log(JSON.stringify(result, null, 2));
    if (makePR) {
      createPullRequest(result, (error, pullRequestUrl) => {
        if (error) {
          console.error('cli Error: ' + error);
          return;
        }

        console.log('cli URL: ' + pullRequestUrl);
      });
    }
  }).catch(error => {
    console.error(error);
  });
});