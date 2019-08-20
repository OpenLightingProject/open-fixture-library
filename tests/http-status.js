#!/usr/bin/env node

const chalk = require(`chalk`);

require(`../lib/load-env-file.js`);

const SiteCrawler = require(`../lib/site-crawler.js`);

(async () => {
  const testStartTime = new Date();

  try {
    const crawler = new SiteCrawler();

    console.log(chalk.blue.bold(`Starting OFL server ...`));
    try {
      await crawler.startServer();
    }
    catch (error) {
      throw `${chalk.redBright(`Failed to start OFL server. Maybe you forgot running 'make all' or there is already a running server?`)} ${error.message}`;
    }
    console.log();

    const passingLinks = [];
    const failingLinks = [];

    crawler.on(`passingPage`, url => {
      passingLinks.push(url);
      console.log(`${chalk.greenBright(`[PASS]`)} ${url}`);
    });
    crawler.on(`failingPage`, (url, error) => {
      failingLinks.push(`${url} (${chalk.redBright(error)})`);
      console.log(`${chalk.redBright(`[FAIL]`)} ${url} (${chalk.redBright(error)})`);
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

    let statusStr = chalk.greenBright(`[PASS]`);
    let exitCode = 0;
    let periodOrColon = `.`;
    if (failingLinks.length > 0) {
      statusStr = chalk.redBright(`[FAIL]`);
      exitCode = 1;
      periodOrColon = `:`;
    }
    console.log(statusStr, `${failingLinks.length} of ${passingLinks.length + failingLinks.length} tested internal links failed${periodOrColon}`);
    failingLinks.forEach(link => console.log(`- ${link}`));
    console.log();

    const testTime = new Date() - testStartTime;
    console.log(chalk.greenBright.bold(`Test took ${testTime / 1000}s.`));
    process.exit(exitCode);
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
