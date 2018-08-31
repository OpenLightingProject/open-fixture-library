#!/usr/bin/node

const path = require(`path`);
const colors = require(`colors`);
const childProcess = require(`child_process`);
const blc = require(`broken-link-checker`);
const pullRequest = require(`./github/pull-request.js`);


// initialize link checker
let startTime;
const foundLinks = {};
const fails = {
  internal: new Set(),
  external: new Set()
};

const siteChecker = new blc.SiteChecker({
  honorRobotExclusions: false,
  maxSocketsPerHost: 3,
  rateLimit: 25,
  filterLevel: 3
}, {
  html(tree, robots, response, pageUrl, customData) {
    foundLinks[pageUrl] = [];
  },
  link(result, customData) {
    let location = colors.cyan(`(ex)`);
    let failStr = colors.yellow(`[WARN]`);
    if (result.internal) {
      location = colors.magenta(`(in)`);
      failStr = colors.red(`[FAIL]`);
    }

    if ((result.internal && result.brokenReason === `HTTP_201`) || (!result.internal && !result.broken)) {
      foundLinks[result.base.resolved].push(` └ ${colors.green(`[PASS]`)} ${location} ${result.url.resolved}`);
    }
    else if (result.broken) {
      foundLinks[result.base.resolved].push(` └ ${failStr} ${location} ${result.url.resolved}`);
      foundLinks[result.base.resolved].push(`    └ ${colors.red(blc[result.brokenReason])}`);
      fails[result.internal ? `internal` : `external`].add(result.url.resolved);
    }
  },
  page(error, pageUrl, customData) {
    if (error) {
      console.log(`${colors.red(`[FAIL]`)} ${pageUrl}\n └ ${error}`);
      fails.internal.add(pageUrl);
    }
    else {
      foundLinks[pageUrl].unshift(`${colors.green(`[PASS]`)} ${pageUrl}`);
      console.log(foundLinks[pageUrl].join(`\n`));
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

  if (error) {
    console.log(colors.red(`Error]`), `Server process errored:`, error);
    process.exit(1);
  }

  console.log();
  if (stdout) {
    console.log(colors.yellow(`Server output (stdout):`));
    console.log(stdout);
  }
  if (stderr) {
    console.log(colors.red(`Server errors (stderr):`));
    console.log(stderr);
  }

  let statusStr = colors.green(`[PASS]`);
  let exitCode = 0;

  const lines = [
    `There were ${fails.internal.size} internal and ${fails.external.size} external links failing.`,
    ``
  ];
  fails.internal.forEach(link => lines.push(`- ${link}`));
  fails.external.forEach(link => lines.push(`- ${link}`));

  let githubCommentLines = [];

  if (fails.internal.size > 0) {
    statusStr = colors.red(`[FAIL]`);
    exitCode = 1;
  }
  else if (fails.external.size > 0) {
    statusStr = colors.yellow(`[WARN]`);
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
    .finally(() => {
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
  siteChecker.enqueue(`http://localhost:5000/`);
}
