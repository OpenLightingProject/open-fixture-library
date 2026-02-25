#!/usr/bin/env node

import '../lib/load-env-file.js';

import chalk from 'chalk';

import SiteCrawler from '../lib/site-crawler.js';

const testStartTime = Date.now();

try {
  const crawler = new SiteCrawler();

  console.log(chalk.blue.bold(`Starting OFL server ...`));
  try {
    await crawler.startServer();
  }
  catch (error) {
    const header = chalk.redBright(`Failed to start OFL server. Maybe you forgot running 'npm run build' or there is already a running server?`);
    throw `${header} ${error.message}`;
  }
  console.log();

  const passingLinks = [];
  const failingLinks = [];

  crawler.addEventListener(`passingPage`, ({ url }) => {
    passingLinks.push(url);
    console.log(chalk.greenBright(`[PASS]`), url);
  });
  crawler.addEventListener(`failingPage`, ({ url, error }) => {
    failingLinks.push(`${url} (${chalk.redBright(error)})`);
    console.log(chalk.redBright(`[FAIL]`), `${url} (${chalk.redBright(error)})`);
  });

  console.log(chalk.blue.bold(`Start crawling the website ...`));
  await crawler.crawl();
  console.log();

  const { stdout, stderr } = await crawler.stopServer();
  if (stdout) {
    console.log(chalk.blueBright(`Server output (stdout):`));
    console.log(stdout);
  }
  if (stderr) {
    console.log(chalk.blueBright(`Server errors (stderr):`));
    console.log(stderr);
  }
  console.log();

  let statusString = chalk.greenBright(`[PASS]`);
  let exitCode = 0;
  let periodOrColon = `.`;
  if (failingLinks.length > 0) {
    statusString = chalk.redBright(`[FAIL]`);
    exitCode = 1;
    periodOrColon = `:`;
  }
  console.log(statusString, `${failingLinks.length} of ${passingLinks.length + failingLinks.length} tested internal links failed${periodOrColon}`);
  for (const link of failingLinks) {
    console.log(`- ${link}`);
  }
  console.log();

  const testTime = Date.now() - testStartTime;
  console.log(chalk.greenBright.bold(`Test took ${testTime / 1000}s.`));
  process.exit(exitCode);
}
catch (error) {
  console.error(error);
  process.exit(1);
}
