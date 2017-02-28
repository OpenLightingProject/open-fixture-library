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
    'search',
    'search?q=bla'
  ],
  '404': [
    'bla',
    'about/bla',
    'manufacturers/gruft',
    'gruft/bla',
    'gruft/thunder-wash-600-rgb',
    'gruft/ventilator/bla',
  ]
}
// add manufacturers and fixtures
const register = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'register.json'), 'utf8'));
for (const man in register.manufacturers) {
  statusCodes['200'].push(man);

  for (const fixture of register.manufacturers[man]) {
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

  let promises = [];
  for (const code in statusCodes) {
    for (const page of statusCodes[code]) {
      promises.push(new Promise((resolve, reject) => {
        const url = 'http://localhost:5000/' + page;
        http.get(url, res => {
          if (res.statusCode == code) {
            console.log(colors.green('[PASS]') + ` ${url} (${res.statusCode})`);
            resolve(true);
          }
          else {
            console.error(colors.red('[FAIL]') + ` ${url} (got ${res.statusCode}, expected ${code})`);
            resolve(false);
          }
        });
      }));
    }
  }

  Promise.all(promises).then(results => {
    let fails = 0;
    for (const result of results) {
      if (!result) {
        fails++;
      }
    }

    if (fails == 0) {
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

}, 2000)