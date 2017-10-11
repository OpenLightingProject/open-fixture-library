#!/usr/bin/node

const path = require('path');
const colors = require('colors');
const childProcess = require('child_process');
const blc = require('broken-link-checker');


// initialize link checker
let startTime;
let foundLinks = {};
let fails = {
  internal: 0,
  external: 0
};

const siteChecker = new blc.SiteChecker({
  honorRobotExclusions: false,
  maxSocketsPerHost: 3,
  rateLimit: 25,
  filterLevel: 3
}, {
  html: function(tree, robots, response, pageUrl, customData) {
    foundLinks[pageUrl] = [];
  },
  link: function(result, customData) {
    let location = colors.cyan('(ex)');
    let failStr = colors.yellow('[WARN]');
    if (result.internal) {
      location = colors.magenta('(in)');
      failStr = colors.red('[FAIL');
    }

    if ((result.internal && result.brokenReason === 'HTTP_201') || (!result.internal && !result.broken)) {
      foundLinks[result.base.resolved].push(` └ ${colors.green('[PASS]')} ${location} ${result.url.resolved}`);
    }
    else if (result.broken) {
      foundLinks[result.base.resolved].push(` └ ${failStr} ${location} ${result.url.resolved}`);
      foundLinks[result.base.resolved].push(`    └ ${colors.red(blc[result.brokenReason])}`);
      fails[result.internal ? 'internal' : 'external']++;
    }
  },
  page: function(error, pageUrl, customData) {
    if (error) {
      console.log(`${colors.red('[FAIL]')} ${pageUrl}\n └ ${error}`);
      fails.internal++;
    }
    else {
      foundLinks[pageUrl].unshift(`${colors.green('[PASS]')} ${pageUrl}`);
      console.log(foundLinks[pageUrl].join('\n'));
    }
  },
  end: function() {
    const testTime = new Date() - startTime;
    console.log(`\nThe test took ${testTime/1000}s.`);

    const status = fails.internal > 0 ? colors.red('[FAIL]') : (fails.external > 0 ? colors.yellow('[WARN]') : colors.green('[PASS]'));
    console.log(status, `There were ${fails.internal} internal and ${fails.external} external fails.`);

    serverProcess.kill();
  }
});


// start server
const serverProcess = childProcess.execFile(path.join(__dirname, '../main.js'), (error, stdout, stderr) => {
  // this is all executed when the process stops
  console.log();

  if (stdout) {
    console.log(colors.yellow('Server output (stdout):'));
    console.log(stdout);
  }
  if (stderr) {
    console.log(colors.red('Server errors (stderr):'));
    console.log(stderr);
  }

  process.exit(fails.internal > 0 ? 1 : 0);
});
console.log(`Started server with process id ${serverProcess.pid}.`);


// start checking links after first stdout data from server
serverProcess.stdout.on('data', data => {
  serverProcess.stdout.removeAllListeners();

  console.log(`${data}\nStarting HTTP requests ...\n`);

  startTime = new Date();
  siteChecker.enqueue('http://localhost:5000/');
});
