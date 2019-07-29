#!/usr/bin/env node

const path = require(`path`);
const childProcess = require(`child_process`);
const chalk = require(`chalk`);

require(`../lib/load-env-file.js`);

const SiteCrawler = require(`../lib/site-crawler.js`);

(async () => {
  const testStartTime = new Date();

  try {
    console.log(chalk.blue.bold(`Starting OFL server ...`));
    let serverProcess;
    try {
      serverProcess = await startServer();
    }
    catch (error) {
      throw `${chalk.redBright(`Failed to start OFL server. Maybe you forgot running 'make nuxt-build' or there is already a running server?`)} ${error.message}`;
    }
    console.log();

    console.log(chalk.blue.bold(`Start crawling the website ...`));

    const passingLinks = [];
    const failingLinks = [];

    const crawler = new SiteCrawler();
    crawler.on(`passingPage`, url => {
      passingLinks.push(url);
      console.log(`${chalk.greenBright(`[PASS]`)} ${url}`);
    });
    crawler.on(`failingPage`, (url, error) => {
      failingLinks.push(`${url} (${chalk.redBright(error)})`);
      console.log(`${chalk.redBright(`[FAIL]`)} ${url} (${chalk.redBright(error)})`);
    });
    await crawler.run();
    console.log();

    const onServerClosed = new Promise((resolve, reject) => {
      serverProcess.on(`close`, resolve);
    });
    serverProcess.kill();
    await onServerClosed; // wait until server has been stopped and stdout/stderr were written to console
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


/**
 * Starts the production OFL server by creating a new child process.
 * Also logs the server's stdout/stderr to console when it stops.
 * Make sure that 'make nuxt-build' has been called before this function is executed!
 *
 * @returns {Promise} Promise that resolves as soon as the OFL server is up and running, or rejects if the process stops with an error before.
 */
async function startServer() {
  let serverProcess;

  const onServerData = new Promise((resolve, reject) => {
    serverProcess = childProcess.execFile(`node`, [path.join(__dirname, `..`, `main.js`)], {
      env: process.env
    }, (error, stdout, stderr) => {
      if (error && !error.killed) {
        reject(error);
        return;
      }

      if (stdout) {
        console.log(chalk.blueBright(`Server output (stdout):`));
        console.log(stdout);
      }

      if (stderr) {
        console.log(chalk.blueBright(`Server errors (stderr):`));
        console.log(stderr);
      }
    });

    // wait until server has started
    serverProcess.stdout.on(`data`, resolve);
  });
  await onServerData;

  return serverProcess;
}
