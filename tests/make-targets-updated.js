#!/usr/bin/node

const path = require('path');
const colors = require('colors');

try {
  require('child_process').execSync('make --question', {
    cwd: path.join(__dirname, '..')
  });
}
catch (e) {
  console.error(`${colors.red('[FAIL]')} Make targets are not up-to-date. Please run \`make\` in the project's root directory.`);
  process.exit(1);
}
finally {
  console.log(`${colors.green('[PASS]')} Make targets are up-to-date.`);
  process.exit(0);
}