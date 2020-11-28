#!/usr/bin/env node

const chalk = require(`chalk`);

const usedVariables = [
  `ALLOW_SEARCH_INDEXING`,
  `GITHUB_USER_TOKEN`,
  `GITHUB_BROKEN_LINKS_ISSUE_NUMBER`,
  `NODE_ENV`,
  `PORT`,
  `GITHUB_PR_NUMBER`,
  `GITHUB_REPOSITORY`,
  `GITHUB_RUN_ID`,
  `GITHUB_REF`,
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
    console.log(chalk.yellow(key) + (key in process.env
      ? `=${chalk.green(process.env[key])}`
      : chalk.red(` is unset`)
    ));
  }
}
