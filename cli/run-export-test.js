#!/usr/bin/node
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const plugins = require('../plugins/plugins.js').all;
const Fixture = require('../lib/model/Fixture.js');

const testFixtures = require('../tests/test-fixtures.json');

const args = minimist(process.argv.slice(2), {
  string: ['p'],
  boolean: ['h'],
  alias: { p: 'plugin', h: 'help' }
});

const helpMessage = [
  'Run the plugin\'s export tests against the specified fixtures',
  '(or the test fixtures, if no fixtures are specified).',
  `Usage: node ${path.relative(process.cwd(), __filename)} -p <plugin> [ <fixtures> ]`,
  'Options:',
  '  --plugin,   -p: Key of the plugin whose export tests should be called',
  '  --help,     -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!args.plugin) {
  console.error(`${colors.red('[Error]')} Plugin has to be specified using --plugin`);
  console.log(helpMessage);
  process.exit(1);
}

let fixtures;
if (args._.length === 0) {
  fixtures = testFixtures.map(
    fixture => Fixture.fromRepository(fixture.man, fixture.key)
  );
}
else {
  fixtures = args._.map(relativePath => {
    const absolutePath = path.join(process.cwd(), relativePath);
    return new Fixture(
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)), // fix key
      JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
    );
  });
}

const plugin = plugins[args.plugin];
const files = plugin.export.export(fixtures, {});

for (const testKey of Object.keys(plugin.exportTests)) {
  const test = plugin.exportTests[testKey];
  const filePromises = files.map(file =>
    test(file)
      .then(() => colors.green('[PASS] ') + file.name)
      .catch(errors => {
        const lines = [colors.red('[FAIL] ') + file.name];
        for (const error of errors) {
          lines.push(`- ${error}`);
        }
        return lines.join('\n');
      })
  );

  Promise.all(filePromises)
    .then(fileLines => {
      console.log(`\n${colors.yellow(`Test ${testKey}`)}`);
      console.log(fileLines.join('\n'));
    });
}
