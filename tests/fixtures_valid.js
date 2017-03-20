#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const util = require('util')
const colors = require('colors');

const fixturePath = path.join(__dirname, '..', 'fixtures');
const schemas = require(path.join(fixturePath, 'schema'));
const checkFixture = require(path.join(__dirname, 'fixture_valid')).checkFixture;

let usedShortNames = [];

let promises = [];
for (const man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    for (const fixture of fs.readdirSync(manDir)) {
      if (path.extname(fixture) == '.json') {
        promises.push(handleFile(path.join(manDir, fixture)));
      }
    }
  }
}

// check defaults
promises.push(new Promise((resolve, reject) => {
  const filename = path.join(fixturePath, 'defaults.js');
  handleFixture(require(filename), filename, resolve);
}));

// check manufacturers file
promises.push(new Promise((resolve, reject) => {
  const filename = path.join(fixturePath, 'manufacturers.json');

  fs.readFile(filename, 'utf8', (readError, data) => {
    if (readError) {
      return resolveError(`File '${filename}' could not be read.`, readError, resolve);
    }

    let manufacturers;

    try {
      manufacturers = JSON.parse(data);
    }
    catch (parseError) {
      return resolveError(`File '${filename}' could not be parsed.`, parseError, resolve);
    }

    const schemaErrors = schemas.Manufacturers.errors(manufacturers);
    if (schemaErrors !== false) {
      return resolveError(`File '${filename}' does not match schema.`, schemaErrors, resolve);
    }

    resolve(filename);
  });
}));

function handleFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (readError, data) => {
      if (readError) {
        return resolveError(`File '${filename}' could not be read.`, readError, resolve);
      }

      let fixture;

      try {
        fixture = JSON.parse(data);
      }
      catch (parseError) {
        return resolveError(`File '${filename}' could not be parsed.`, parseError, resolve);
      }

      handleFixture(fixture, filename, resolve);
    });
  });
}

function handleFixture(fixture, filename, resolve) {
  const result = checkFixture(require(filename), usedShortNames);
  usedShortNames = usedShortNames.concat(result.usedShortNames);

  for (const error of result.errors) {
    resolveError(error.description + ` (${filename})`, error.error, resolve);
  }
  for (const warning of result.warnings) {
    console.warn(colors.yellow('Warning: ') + warning);
  }

  if (result.errors.length == 0) {
    resolve(filename);
  }
}

function resolveError(str, error, resolve) {
  if (error) {
    console.error(colors.red('[FAIL] ') + str + '\n', util.inspect(error, false, null));
  }
  else {
    console.error(colors.red('[FAIL] ') + str);
  }
  resolve(null);
}


Promise.all(promises).then(results => {
  let fails = 0;
  for (const filename of results) {
    if (filename === null) {
      fails++;
    }
    else {
      console.log(colors.green('[PASS]') + ' ' + filename);
    }
  }

  if (fails == 0) {
    console.log('\n' + colors.green('[PASS]') + ` All ${results.length} tested fixtures were valid.`);
    process.exit(0);
  }

  console.error('\n' + colors.red('[FAIL]') + ` ${fails} of ${results.length} tested fixtures failed.`);
  process.exit(1);
});