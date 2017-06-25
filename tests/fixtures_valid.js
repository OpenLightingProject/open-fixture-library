#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const util = require('util');
const colors = require('colors');

const fixturePath = path.join(__dirname, '..', 'fixtures');
const schemas = require(path.join(fixturePath, 'schema'));
const checkFixture = require(path.join(__dirname, 'fixture_valid')).checkFixture;

let usedShortNames = [];

let promises = [];

// search fixture files
for (const man of fs.readdirSync(fixturePath)) {
  const manDir = path.join(fixturePath, man);

  // files in manufacturer directory
  if (fs.statSync(manDir).isDirectory()) {
    for (const fixture of fs.readdirSync(manDir)) {
      if (path.extname(fixture) === '.json') {
        handleFixtureFile(path.join(man, fixture))
      }
    }
  }
}

function handleFixtureFile(name) {
  const filename = path.join(fixturePath, name);

  promises.push(new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (readError, data) => {
      if (readError) {
        resolve({
          name: name,
          errors: [
            printError('File could not be read.' readError)
          ]
        });
      }

      try {
        handleFixture(name, JSON.parse(data), resolve);
      }
      catch (parseError) {
        resolve({
          name: name,
          errors: [
            printError('File could not be parsed.' parseError)
          ]
        });
      }
    });
  }));
}

function handleFixture(name, fixture, resolve) {
  const result = checkFixture(fixture, usedShortNames);
  usedShortNames = result.usedShortNames;

  resolve({
    name: name,
    errors: result.errors,
    warnings: result.warnings
  });
}


// print results
Promise.all(promises).then(results => {
  let fails = 0;
  let warnings = 0;
  for (const result of results) {
    const failed = 'errors' in result && result.errors.length > 0;

    console.log(
      failed ? colors.red('[FAIL]') : colors.green('[PASS]'),
      result.name
    );

    if (failed) {
      fails++;

      for (const error of result.errors) {
        console.log('└', colors.red('Error:'), error);
      }
    }

    if ('warnings' in result) {
      for (const warning of result.warnings) {
        warnings++;
        console.log('└', colors.yellow('Warning:'), warning);
      }
    }
  }

  // newline before summary
  console.log();

  if (warnings === 1) {
    console.log(colors.yellow('[INFO]'), `There is 1 unresolved warning.`);
  }
  else if (warnings > 1) {
    console.log(colors.yellow('[INFO]'), `There are ${warnings} unresolved warnings.`);
  }

  if (fails === 0) {
    console.log(colors.green('[PASS]'), `All ${results.length} tested fixtures were valid.`);
    process.exit(0);
  }

  console.error(colors.red('[FAIL]'), `${fails} of ${results.length} tested fixtures failed.`);
  process.exit(1);
});


function printError(description, error) {
  return description + ' ' + util.inspect(error, false, null);
}