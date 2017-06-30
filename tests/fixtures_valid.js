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
        handleFixtureFile(path.join(man, fixture));
      }
    }
  }
}

function handleFixtureFile(name) {
  let result = {
    name: name,
    errors: [],
    warnings: []
  };
  const filename = path.join(fixturePath, name);

  promises.push(new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (readError, data) => {
      if (readError) {
        result.errors.push(printError('File could not be read.', readError));
        return resolve(result);
      }

      try {
        return resolve(handleFixture(result, JSON.parse(data)));
      }
      catch (parseError) {
        result.errors.push(printError('File could not be parsed.', parseError));
        return resolve(result);
      }
    });
  }));
}

function handleFixture(result, fixture) {
  Object.assign(result, checkFixture(fixture, usedShortNames));
  usedShortNames = result.usedShortNames;
  return result;
}

// check manufacturers file
promises.push(new Promise((resolve, reject) => {
  let result = {
    name: 'manufacturers.json',
    errors: [],
    warnings: []
  };
  const filename = path.join(fixturePath, result.name);

  fs.readFile(filename, 'utf8', (readError, data) => {
    if (readError) {
      result.errors.push(printError('File could not be read.', readError));
      return resolve(result);
    }

    let manufacturers;
    try {
      manufacturers = JSON.parse(data);
    }
    catch (parseError) {
      result.errors.push(printError('File could not be parsed.', parseError));
      return resolve(result);
    }

    const schemaErrors = schemas.Manufacturers.errors(manufacturers);
    if (schemaErrors !== false) {
      result.errors = [printError('File does not match schema.', schemaErrors)];
    }

    return resolve(result);
  });
}));


// print results
Promise.all(promises).then(results => {
  let totalFails = 0;
  let totalWarnings = 0;

  // each file
  for (const result of results) {
    const failed = result.errors.length > 0;

    console.log(
      failed ? colors.red('[FAIL]') : colors.green('[PASS]'),
      result.name
    );

    totalFails += failed ? 1 : 0;
    for (const error of result.errors) {
      console.log('└', colors.red('Error:'), error);
    }

    totalWarnings += result.warnings.length;
    for (const warning of result.warnings) {
      console.log('└', colors.yellow('Warning:'), warning);
    }
  }

  // newline
  console.log();

  // summary
  if (totalWarnings > 0) {
    console.log(colors.yellow('[INFO]'), `${totalWarnings} unresolved warning(s)`);
  }

  if (totalFails === 0) {
    console.log(colors.green('[PASS]'), `All ${results.length} tested files were valid.`);
    process.exit(0);
  }

  console.error(colors.red('[FAIL]'), `${totalFails} of ${results.length} tested files failed.`);
  process.exit(1);
});


function printError(description, error) {
  return description + ' ' + util.inspect(error, false, null);
}