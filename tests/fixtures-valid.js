#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const util = require('util');
const colors = require('colors');

const schemas = require('../fixtures/schema.js');
const checkFixture = require('./fixture-valid.js');

const usedShortNames = new Set();

let promises = [];

// search fixture files
const fixturePath = path.join(__dirname, '..', 'fixtures');
for (const manKey of fs.readdirSync(fixturePath)) {
  const manDir = path.join(fixturePath, manKey);

  // files in manufacturer directory
  if (fs.statSync(manDir).isDirectory()) {
    for (const file of fs.readdirSync(manDir)) {
      if (path.extname(file) === '.json') {
        const fixKey = path.basename(file, '.json');
        handleFixtureFile(manKey, fixKey);
      }
    }
  }
}

function handleFixtureFile(manKey, fixKey) {
  const filename = manKey + '/' + fixKey + '.json';
  let result = {
    name: filename,
    errors: [],
    warnings: []
  };

  const filepath = path.join(fixturePath, filename);

  promises.push(new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (readError, data) => {
      if (readError) {
        result.errors.push(getErrorString('File could not be read.', readError));
        return resolve(result);
      }

      let fixtureJson;
      try {
        fixtureJson = JSON.parse(data);
      }
      catch (parseError) {
        result.errors.push(getErrorString('File could not be parsed as JSON.', parseError));
        return resolve(result);
      }

      try {
        Object.assign(result, checkFixture(manKey, fixKey, fixtureJson, usedShortNames));
      }
      catch (validateError) {
        result.errors.push(getErrorString('Fixture could not be validated.', validateError));
      }
      return resolve(result);
    });
  }));
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
      result.errors.push(getErrorString('File could not be read.', readError));
      return resolve(result);
    }

    let manufacturers;
    try {
      manufacturers = JSON.parse(data);
    }
    catch (parseError) {
      result.errors.push(getErrorString('File could not be parsed.', parseError));
      return resolve(result);
    }

    const schemaErrors = schemas.Manufacturers.errors(manufacturers);
    if (schemaErrors !== false) {
      result.errors = [getErrorString('File does not match schema.', schemaErrors)];
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


function getErrorString(description, error) {
  return description + ' ' + util.inspect(error, false, null);
}
