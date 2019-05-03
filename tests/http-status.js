#!/usr/bin/node

const path = require(`path`);
const chalk = require(`chalk`);
const childProcess = require(`child_process`);
const blc = require(`broken-link-checker`);

const pullRequest = require(`./github/pull-request.js`);

const exportPluginKeys = require(`../plugins/plugins.json`).exportPlugins;

const BASE_URL = `http://localhost:5000/`;

// disable certificate errors
// this is unsafe, but there apparently is no better alternative
// see https://github.com/request/request/issues/3106
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// initialize link checker
let startTime;
const foundLinks = {};
const fails = {
  internal: new Set(),
  external: new Set()
};

const resolvedUrls = {}; // original urls pointing to resolved ones

const siteChecker = new blc.SiteChecker({
  honorRobotExclusions: false,
  maxSocketsPerHost: 3,
  rateLimit: 25,
  filterLevel: 3,

  // from fork of broken-link-checker, see https://github.com/stevenvachon/broken-link-checker/pull/120
  headRetryCodes: [404, 405],

  excludedKeywords: [
    // canonical URLs
    `https://open-fixture-library.org/*`,

    // form targets are not meant to be called without parameters / with GET instead of POST
    `http://localhost:5000/ajax/*`,

    // otherwise these would somehow be checked for every fixture, and we can
    // safely assume that these are correct and long-lasting links
    `https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug`,
    `https://www.heise.de/embetty`,

    ...exportPluginKeys.map(pluginKey => `${BASE_URL}*${pluginKey}`)
  ]
}, {
  html(tree, robots, response, pageUrl, customData) {
    resolvedUrls[pageUrl] = response.url;
    if (!(response.url in foundLinks)) {
      foundLinks[response.url] = [];
    }
  },
  link(result, customData) {
    let location = chalk.cyan(`(ex)`);
    let failStr = chalk.yellow(`[WARN]`);
    if (result.internal) {
      location = chalk.magenta(`(in)`);
      failStr = chalk.red(`[FAIL]`);
    }

    if ((result.internal && result.brokenReason === `HTTP_201`) || (!result.internal && !result.broken)) {
      foundLinks[result.base.resolved].push(` └ ${chalk.green(`[PASS]`)} ${location} ${result.url.resolved}`);
    }
    else if (result.broken) {
      foundLinks[result.base.resolved].push(` └ ${failStr} ${location} ${result.url.resolved}`);
      foundLinks[result.base.resolved].push(`    └ ${chalk.red(blc[result.brokenReason])}`);
      fails[result.internal ? `internal` : `external`].add(result.url.resolved);
    }
  },
  page(error, pageUrl, customData) {
    if (!(pageUrl in resolvedUrls)) {
      resolvedUrls[pageUrl] = pageUrl;
      foundLinks[pageUrl] = [];
    }

    const resolvedUrl = resolvedUrls[pageUrl];

    if (error) {
      console.log(`${chalk.red(`[FAIL]`)} ${resolvedUrl}\n └ ${error}`);
      fails.internal.add(resolvedUrl);
    }
    else {
      foundLinks[resolvedUrl].unshift(`${chalk.green(`[PASS]`)} ${resolvedUrl}`);
      console.log(foundLinks[resolvedUrl].join(`\n`));
    }
  },
  end() {
    const testTime = new Date() - startTime;
    console.log(`\nThe test took ${testTime / 1000}s.`);

    serverProcess.kill();
  }
});


// start server
const serverProcess = childProcess.execFile(`node`, [path.join(__dirname, `..`, `main.js`)], {
  env: process.env
}, (error, stdout, stderr) => {
  // when the server process stops

  console.log();
  if (stdout) {
    console.log(chalk.yellow(`Server output (stdout):`));
    console.log(stdout);
  }
  if (stderr) {
    console.log(chalk.red(`Server errors (stderr):`));
    console.log(stderr);
  }

  let statusStr = chalk.green(`[PASS]`);
  let exitCode = 0;

  const lines = [
    `There were ${fails.internal.size} internal and ${fails.external.size} external links failing.`,
    ``
  ];
  fails.internal.forEach(link => lines.push(`- ${link}`));
  fails.external.forEach(link => lines.push(`- ${link}`));

  let githubCommentLines = [];

  if (fails.internal.size > 0) {
    statusStr = chalk.red(`[FAIL]`);
    exitCode = 1;
  }
  else if (fails.external.size > 0) {
    statusStr = chalk.yellow(`[WARN]`);
    githubCommentLines = lines;
  }

  // try to create/delete a GitHub comment
  pullRequest.checkEnv()
    .then(() => pullRequest.init()
      .then(prData => pullRequest.updateComment({
        filename: path.relative(path.join(__dirname, `../`), __filename),
        name: `Broken links`,
        lines: githubCommentLines
      }))
      .catch(error => {
        console.error(`Creating / updating the GitHub PR comment failed.`, error);
      })
    )
    .then(() => {
      console.log(statusStr, lines.join(`\n`));
      process.exit(exitCode);
    })
    .catch(() => {}); // PR env variables not set, no GitHub comment created/deleted
});
console.log(`Started server with process id ${serverProcess.pid}.`);


// start checking links after first stdout data from server
serverProcess.stdout.on(`data`, startLinkChecker);
function startLinkChecker(data) {
  serverProcess.stdout.removeListener(`data`, startLinkChecker);

  console.log(`${data}\nStarting HTTP requests ...\n`);

  startTime = new Date();
  siteChecker.enqueue(BASE_URL);
}
