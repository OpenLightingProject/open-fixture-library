#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const dmxcontrol = require(path.join(__dirname, 'plugins', 'dmxcontrol3'));
const checkFixture = require(path.join(__dirname, 'tests', 'fixture_valid')).checkFixture;

if (process.argv.length !== 3) {
  return;
}

const fixturesDir = path.join(process.env.PWD, process.argv[2]);

const promises = [];
for (const file of fs.readdirSync(fixturesDir)) {
  const filename = path.join(fixturesDir, file);

  if (!fs.lstatSync(filename).isDirectory()) {
    promises.push(
      new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (error, data) => {
          if (error) {
            console.error('read error', error);
            process.exit(1);
            return;
          }
          resolve(data);
        });
      })
      .then(data => {
        return new Promise((resolve, reject) => {
          dmxcontrol.import(data, file, resolve, reject);
        });
      })
    );
  }
}
Promise.all(promises).then(fixtures => {
  const result = {
    warnings: {},
    errors: {}, 
  };
  for (const fixture of fixtures) {
    fixture.errors = {};

    for (const fixKey in fixture.warnings) {
      const checkResult = checkFixture(fixture.fixtures[fixKey]);

      fixture.warnings[fixKey] = fixture.warnings[fixKey].concat(checkResult.warnings);
      fixture.errors[fixKey] = checkResult.errors;

      const warnings = fixture.warnings[fixKey];
      if (warnings.length > 0) {
        if (!(fixKey in result.warnings)) {
          result.warnings[fixKey] = {};
        }
        result.warnings[fixKey][fixture.fixtures[fixKey].modes[0].name] = warnings;
      }

      const errors = fixture.errors[fixKey];
      if (errors.length > 0) {
        if (!(fixKey in result.errors)) {
          result.errors[fixKey] = {};
        }
        result.errors[fixKey][fixture.fixtures[fixKey].modes[0].name] = errors;
      }
    }
  }
  console.log(JSON.stringify(result, null, 2));
}).catch(error => {
  console.error(error);
});