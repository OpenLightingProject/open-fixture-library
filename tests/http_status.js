#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const url = require('url');
const colors = require('colors');

let failed = false;

const linkRegex = /<a [^>]*href="([^"]+)"/g;

let exportPlugins = [];
for (const filename of fs.readdirSync(path.join(__dirname, '..', 'plugins'))) {
  if ('export' in require(path.join(__dirname, '..', 'plugins', filename))) {
    exportPlugins.push(path.basename(filename, '.js'));
  }
}

// define which pages should have which status code
const statusCodes = {
  '200': [
    '/',
    '/manufacturers',
    '/categories',
    '/about',
    '/search',
    '/search?q=bla'
  ],
  '201': [],
  '404': [
    '/bla',
    '/about/bla',
    '/categories/bla',
    '/categories/Blinder/bla',
    '/manufacturers/gruft',
    '/gruft/bla',
    '/gruft/thunder-wash-600-rgb',
    '/gruft/ventilator/bla'
  ]
};
// add manufacturers and fixtures
const register = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'register.json'), 'utf8'));
for (const man in register.manufacturers) {
  statusCodes['200'].push('/' + man);

  for (const fixture of register.manufacturers[man]) {
    statusCodes['200'].push(`/${man}/${fixture}`);

    for (const plugin of exportPlugins) {
      statusCodes['201'].push(`/${man}/${fixture}.${plugin}`);
    }
  }
}
for (const cat in register.categories) {
  statusCodes['200'].push('/categories/' + cat);
  if (cat !== encodeURIComponent(cat)) {
    statusCodes['200'].push('/categories/' + encodeURIComponent(cat));
  }
}

let foundLinks = [];
let foundLinkPromises = [];


// start server
const serverProcess = require('child_process').execFile(
  'node',
  [path.join(__dirname, '..', 'main.js')],
  {
    env: process.env
  }
);
serverProcess.stdout.on('data', chunk => {
  console.log('Server message (stdout): ' + chunk);
});
serverProcess.stderr.on('data', chunk => {
  console.error(colors.red('Server error (stderr): ') + chunk);
  failed = true;
});
console.log(`Starting server with process id ${serverProcess.pid}`);

// wait 2s before starting tests
require('timers').setTimeout(() => {
  console.log('start tests');

  let promises = [];
  for (const code in statusCodes) {
    for (const page of statusCodes[code]) {
      promises.push(testPage(page, [code], false));
    }
  }

  Promise.all(promises).then(results => {
    console.log('\n\nFound links:');
    Promise.all(foundLinkPromises).then(results2 => {
      results = results.concat(results2);

      let fails = 0;
      for (const result of results) {
        if (!result) {
          fails++;
        }
      }

      if (fails === 0) {
        console.log('\n' + colors.green('[PASS]') + ` All ${results.length} tests passed.`);
      }
      else {
        console.error('\n' + colors.red('[FAIL]') + ` ${fails} of ${results.length} tests failed.`);
        failed = true;
      }

      serverProcess.on('exit', (code, signal) => {
        process.exit(failed || signal > 0 ? 1 : 0);
      }, 5000);
      serverProcess.kill();
    });
  });

}, 2000);

function testPage(page, allowedCodes, isFoundLink) {
  const path = url.resolve('http://localhost:5000', page);
  const urlObject = url.parse(path);

  if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
    // we can only handle the HTTP and HTTPS protocols
    console.error(colors.red('[FAIL]') + ` ${path} (protocol '${urlObject.protocol}' is not supported)`);
    failed = true;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    (urlObject.protocol === 'http:' ? http : https).get(path, res => {
      if (allowedCodes.indexOf('' + res.statusCode) === -1) {
        console.error(colors.red('[FAIL]') + ` ${path} (was ${isFoundLink ? '' : 'not '}a found link, got ${res.statusCode}, expected one of ${allowedCodes})`);
        resolve(false);
        res.resume();
        return;
      }

      console.log(colors.green('[PASS]') + ` ${path} (${res.statusCode})`);

      if (res.statusCode === 302) {
        console.warn(colors.yellow('[WARN]') + '   return code 302 (moved temporarily)');
      }

      if (isFoundLink) {
        resolve(true);
        res.resume();
        return;
      }

      res.setEncoding('utf8');

      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        let match = linkRegex.exec(rawData);

        while (match) {
          // found a link

          if (match[1].startsWith('#')  // do not test same-page links
            || foundLinks.indexOf(match[1]) !== -1  // already found earlier
            || staticTestPagesContain(match[1])  // already defined above
            ) {
            continue;
          }

          foundLinkPromises.push(testPage(match[1], ['200', '201', '302'], true));
          foundLinks.push(match[1]);

          match = linkRegex.exec(rawData);
        }

        resolve(true);
      });
    });
  });
}

function staticTestPagesContain(page) {
  return Object.keys(statusCodes).some(code => statusCodes[code].indexOf(page) !== -1);
}