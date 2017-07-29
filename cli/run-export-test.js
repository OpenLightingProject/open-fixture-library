#!/usr/bin/node
const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const plugins = require('../plugins/plugins.js').all;
const Fixture = require('../lib/model/Fixture.js');

const args = minimist(process.argv.slice(2), {
  string: ['p'],
  alias: { p: 'plugin' }
});

if (!args.plugin) {
  console.error([
    `Usage: node ${path.relative(process.cwd(), __filename)} -p <plugin>`,
    'Options:',
    '  --plugin,   -e: Key of the plugin whose export tests should be called'
  ].join('\n'));
  process.exit(1);
}

const fixtures = require('../tests/test-fixtures.json').map(
  fixture => Fixture.fromRepository(fixture.man, fixture.key)
);

const plugin = plugins[args.plugin];
const files = plugin.export.export(fixtures);

for (const testKey of Object.keys(plugin.exportTests)) {
  const test = plugin.exportTests[testKey];
  const filePromises = files.map(file =>
    test(file.content)
    .then(() => colors.green('[PASS] ') + file.name)
    .catch(err => {
      let lines = [colors.red('[FAIL] ') + file.name];
      const errors = Array.isArray(err) ? err : [err];
      for (const error of errors) {
        lines.push(`- ${error}`);
      }
      return lines.join('\n');
    })
  );

  Promise.all(filePromises)
  .then(fileLines => {
    console.log(colors.yellow(`Test ${testKey}`));
    console.log(fileLines.concat('').join('\n'));
  });
}