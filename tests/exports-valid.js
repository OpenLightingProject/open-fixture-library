#!/usr/bin/node

const colors = require('colors');

const plugins = require('../plugins/plugins.js').all;
const Fixture = require('../lib/model/Fixture.js');
const testFixtures = require('../tests/test-fixtures.json').map(
  fixture => Fixture.fromRepository(fixture.man, fixture.key)
);

let fails = 0;

for (const plugin of plugins) {
  if (plugin.export !== null && plugin.exportTests.length > 0) {
    console.log(colors.yellow(`Validating ${plugin.export.name}'s export`));

    const exportFiles = plugin.export.export(testFixtures);
    for (const file of exportFiles) {
      console.log(file.name)

      for (const test of plugin.exportTests) {
        const result = test.test(file.content);
        if (result.passed) {
          console.log('└', colors.green('[PASS]'), test.key);
        }
        else {
          console.log('└', colors.red('[FAIL]'), `${test.key}: ${result.message}`);
          fails++;
        }
      }
    }

    console.log();
  }
}

if (fails === 0) {
  console.log(colors.green('[PASS]'), 'All exported files passed.');
  process.exit(0);
}

console.log(colors.red('[FAIL]'), `${fails} test(s) failed.`);
process.exit(1);