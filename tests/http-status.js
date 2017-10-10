#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const URL = require('url'); // the util class
const Url = URL.URL; // the URL instance class
const colors = require('colors');

let urls = [];

// define which pages should have which status code
// all specific manufacturer, fixture and category pages are added as well
// only include pages that can include further links (e.g. no download pages)
let knownPages = {
  '/': 200,
  '/fixture-editor': 200,
  '/manufacturers': 200,
  '/manufacturers/gruft': 404,
  '/categories': 200,
  '/categories/bla': 404,
  '/categories/Blinder/bla': 404,
  '/about': 200,
  '/about/bla': 404,
  '/search': 200,
  '/search?q=bla': 200,
  '/gruft/bla': 404,
  '/gruft/thunder-wash-600-rgb': 404,
  '/gruft/ventilator/bla': 404,
  '/bla': 404
};
const register = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'register.json'), 'utf8'));
for (const man of Object.keys(register.manufacturers)) {
  // add manufacturer page
  knownPages['/' + man] = 200;

  for (const fixture of register.manufacturers[man]) {
    // add fixture page
    knownPages[`/${man}/${fixture}`] = 200;
  }
}
for (const cat of Object.keys(register.categories)) {
  // add category page
  knownPages['/categories/' + cat] = 200;
  if (cat !== encodeURIComponent(cat)) {
    knownPages['/categories/' + encodeURIComponent(cat)] = 200;
  }
}

// start server
const serverProcess = require('child_process').execFile(path.join(__dirname, '../main.js'), (error, stdout, stderr) => {
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
});
console.log(`Started server with process id ${serverProcess.pid}.`);

// wait 5s for the server to be ready
setTimeout(startTests, 5000);
function startTests() {
  console.log('Starting HTTP requests ...' + '\n');
  let startTime = new Date();
  
  let lastPagePromise = Promise.resolve();
  for (const knownPage of Object.keys(knownPages)) {
    const url = URL.parse(URL.resolve('http://localhost:5000', knownPage));
    const expectedCode = knownPages[knownPage];

    lastPagePromise = lastPagePromise.then(() => getPagePromise(url, expectedCode))
    .catch(() => {
      console.log('There was a fail.');
    });
  }

  lastPagePromise.then(() => {
    serverProcess.kill();

    let testTime = new Date() - startTime;
    console.log(`\nThe test took ${testTime/1000}s.`);
    console.log(urls.sort().join('\n'));
  });
}

/**
 * Tests the given url if it returns the correct status code. Also tests found links in the html content.
 * Outputs its results immediately to console.
 * @param {!Url} url An Url object pointing to the page which has to be tested.
 * @param {!number} expectedCode If the given url doesn't respond with this status code, the test for this page fails.
 * @return {!Promise} A Promise that will resolve if the test and all internal links pass, else it will reject.
 */
function getPagePromise(url, expectedCode) {
  let result = {
    passed: true,
    errorMessage: null,
    links: [],
    internalLinks: new Map(),
    externalLinks: new Map()
  };
  
  return getPage(url)
  .catch(errorMessage => {
    logItem(0, colors.red('[FAIL]'), url.href);
    logItem(1, colors.red('Error:'), errorMessage);
    return Promise.reject();
  })
  .then(([res, data]) => {
    if (res.statusCode !== expectedCode) {
      logItem(0, colors.red('[FAIL]'), url.href);
      logItem(1, colors.red('Error:'), `Wrong status code: ${res.statusCode} instead of ${expectedCode}`);
      return Promise.reject();
    }

    logItem(0, colors.green('[PASS]'), url.href);

    const positiveCodes = [200, 201, 302];
    const foundUrls = [...findUrls(data, url)];
    const internalUrls = foundUrls.filter(
      foundUrl => foundUrl.hostname === url.hostname && !positiveCodes.includes(knownPages[foundUrl.pathname]) // internal links unless they belong to the knownPages and have a positive status code
    );
    const externalUrls = foundUrls.filter(
      foundUrl => foundUrl.hostname !== url.hostname
    );

    let lastLinkPromise = Promise.resolve();

    if (internalUrls.length > 0) {
      lastLinkPromise = lastLinkPromise.then(() => {
        logItem(1, 'Found internal links:');
      });

      for (const foundUrl of internalUrls) {
        lastLinkPromise = lastLinkPromise.then(() => getPage(foundUrl)
        .then(([res, data]) => {
          if (!positiveCodes.includes(res.statusCode)) {
            return Promise.reject();
          }
          logItem(2, colors.green('[PASS]'), foundUrl.href);
        })
        .catch(() => {
          logItem(2, colors.red('[FAIL]'), foundUrl.href);
        }));
      }
    }

    if (externalUrls.length > 0) {
      lastLinkPromise = lastLinkPromise.then(() => {
        logItem(1, 'Found external links:');
      });

      for (const foundUrl of externalUrls) {
        lastLinkPromise = lastLinkPromise.then(() => getPage(foundUrl)
        .then(([res, data]) => {
          if (!positiveCodes.includes(res.statusCode)) {
            return Promise.reject();
          }
          logItem(2, colors.green('[PASS]'), foundUrl.href);
        })
        .catch(() => {
          logItem(2, colors.red('[FAIL]'), foundUrl.href);
        }));
      }
    }

    return lastLinkPromise;
  });
}

/**
 * @param {!Url} url Which url to fetch
 * @return {!Promise} A promise resolving with the response and the data or rejecting if it wasn't possible to get a response.
 */
function getPage(url) {
  urls.push(url.href);
  const httpOrHttps = (url.protocol === 'http:' ? http : https);
  const agent = (url.protocol === 'http:' ? httpAgent : httpsAgent);

  return new Promise((resolve, reject) => {
    try {
      const req = httpOrHttps.get(Object.assign({}, url, {
        agent: agent
      }), res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve([res, data]);
        });
      });

      req.setTimeout(30000, () => {
        reject('Server didn\'t respond within timeout of 30s.');
      });
      
      req.on('error', err => {
        reject(`Unable sending request: ${err.message}`);
      });
    }
    catch (err) {
      reject(`Unable sending request: ${err.message}`);
    }
  });
}

/**
 * Searches for <a> elements in the text and returns the found href links.
 * @param {!string} text The html document.
 * @param {!Url} sourceUrl The Url of the original html document.
 * @return {!Set.<Url>} The found urls. Doesn't include anchors.
 */
function findUrls(text, sourceUrl) {
  const linkRegex = /<a\b[^>]* href="([^"]+)"/g;
  let match;
  let foundUrls = new Set();

  // run for each match in the text
  while ((match = linkRegex.exec(text)) !== null) {
    const url = URL.parse(URL.resolve(sourceUrl, match[1]));

    if (url.hash === null) {
      foundUrls.add(url);
    }
  }

  return foundUrls;
}

/**
 * Logs the text to console with correct level indentation and a └ for not-top-level items.
 * @param {!number} level An integer declaring the indentation level. 0 means top-level.
 * @param {...!string} texts The messages to log. May contain newlines. Multiple messages are combined with a space.
 */
function logItem(level, ...texts) {
  let prefix = '';
  for (let i = 1; i < level; i++) {
    prefix += '  ';
  }
  if (level > 0) {
    prefix += ' └ ';
  }

  for (const line of texts.join(' ').split('\n')) {
    console.log(prefix + line);
  }
}



/*

// wait 2s before starting tests
setTimeout(() => {
  let promises = [];
  for (const code of Object.keys(statusCodes)) {
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
        let match;

        while ((match = linkRegex.exec(rawData)) !== null) {
          // found a link

          if (match[1].startsWith('#')  // do not test same-page links
            || foundLinks.indexOf(match[1]) !== -1  // already found earlier
            || Object.keys(statusCodes).some(code => statusCodes[code].indexOf(page) !== -1)  // already defined above
            ) {
            continue;
          }

          foundLinkPromises.push(testPage(match[1], ['200', '201', '302'], true));
          foundLinks.push(match[1]);
        }

        resolve(true);
      });
    });
  });
}
*/