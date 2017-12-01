#!/usr/bin/node

const path = require('path');
const colors = require('colors');


try {
  require('child_process').execSync(`make -B -C ${path.join(__dirname, '..')}`);
}
catch (error) {
  console.error(`${colors.red('[FAIL]')} Unable to run Makefile:`, error);
  process.exit(1);
}
finally {
  try {
    require('child_process').execSync('git diff --exit-code', {
      cwd: path.join(__dirname, '..')
    });
  }
  catch (error) {
    console.error(`${colors.red('[FAIL]')} Make targets are not up-to-date or there are other unstaged changes. Please run \`make -B\` and stage (git add) all changes.`);
    process.exit(1);
  }
  finally {
    console.log(`${colors.green('[PASS]')} Make targets are up-to-date.`);
    process.exit(0);
  }
}