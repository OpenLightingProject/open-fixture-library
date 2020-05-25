#!/usr/bin/env node

const chalk = require(`chalk`);

const usedVariables = [
  `ALLOW_SEARCH_INDEXING`,
  `GITHUB_USER_TOKEN`,
  `GITHUB_BROKEN_LINKS_ISSUE_NUMBER`,
  `NODE_ENV`,
  `PORT`,
  `TRAVIS_BRANCH`,
  `TRAVIS_COMMIT`,
  `TRAVIS_JOB_WEB_URL`,
  `TRAVIS_PULL_REQUEST`,
  `TRAVIS_PULL_REQUEST_SLUG`,
  `TRAVIS_REPO_SLUG`,
];

console.log(`This scripts lists all environment variables that are used in the Open Fixture Library.\n`);

console.log(`Process environment variables:`);
printVariables();
console.log();

require(`../lib/load-env-file`);

console.log(`Environment variables after reading .env:`);
printVariables();

/**
 * Prints all used environment variables and their values / unset
 */
function printVariables() {
  for (const key of usedVariables) {
    let str = chalk.yellow(key);

    if (key in process.env) {
      str += `=${chalk.green(process.env[key])}`;
    }
    else {
      str += chalk.red(` is unset`);
    }

    console.log(str);
  }
}
