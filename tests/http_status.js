const fs = require('fs');
const path = require('path');
const http = require('http');
const colors = require('colors');

let failed = false;

// define which pages should have which status code
const statusCodes = {
  '200': [
    '',
    'manufacturers',
    'categories',
    'about',
    'search'
  ],
  '404': [
    'e',
    'f'
  ]
}
// add manufacturers and fixtures
const manufacturersIndex = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'index_manufacturers.json'), 'utf8'));
for (let man in manufacturersIndex) {
  statusCodes['200'].push(man);

  for (fixture of manufacturersIndex[man]) {
    statusCodes['200'].push(path.join(man, fixture));
  }
}


// start server
const serverProcess = require('child_process').execFile(
  'node',
  [path.join(__dirname, '..', 'index.js')]
);
serverProcess.stdout.on('data', chunk => {
  console.log('Server message (stdout):');
  console.log(chunk);
});
serverProcess.stderr.on('data', chunk => {
  console.error(colors.red('Server error (stderr)'));
  console.error(chunk);
  failed = true;
});
console.log(`Starting server with process id ${serverProcess.pid}`);

// wait 2s before starting tests
require('timers').setTimeout(() => {
  console.log('start tests');

  const promises = [];
  for (let code in statusCodes) {
    for (let page of statusCodes[code]) {
      promises.push(new Promise((resolve, reject) => {
        const url = 'http://localhost:5000/' + page;
        http.get(url, res => {
          if (res.statusCode == code) {
            console.log(colors.green('PASS') + ` ${url} (${res.statusCode})`);
            resolve(true);
          }
          else {
            console.error(colors.red('FAIL') + `in ${url} (${res.statusCode}, ${code} expected)`);
            resolve(false);
          }
        });
      }));
    }
  }

  Promise.all(promises).then(results => {
    fails = 0;
    for (let result of results) {
      if (!result) {
        fails++;
      }
    }

    if (fails == 0) {
      console.log(colors.green(`All ${results.length} tests passed.`));
    }
    else {
      console.error(colors.red(`${fails} of ${results.length} tests failed.`));
      failed = true;
    }

    serverProcess.on('exit', (code, signal) => {
      process.exit(failed || signal > 0 ? 1 : 0);
    }, 5000);
    serverProcess.kill();

  });

}, 2000)