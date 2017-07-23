#!/usr/bin/node

const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const testFixtures = require('../tests/test-fixtures.json').map(
  fixture => `${fixture.man}/${fixture.key}`
);

const args = minimist(process.argv.slice(2), {
  string: ['p', 'r'],
  boolean: ['h', 't'],
  alias: { p: 'plugin', r: 'ref', h: 'help', t: 'test-fix' },
  default: { r: 'HEAD' }
});

const helpMessage = [
  'This script compares the output of the given fixtures with another version in the current repository.',
  'Fixtures have to be declared with the path to its file in the fixtures/ directory.',
  `Usage: node ${path.relative(process.cwd(), __filename)} -p <plugin name> [-r <git reference>] [ -t | <fixture> [<more fixtures>] ]`,
  'Options:',
  '  --plugin,   -p: Which plugin should be used to output fixtures.',
  '                  E. g. ecue or qlcplus',
  '  --ref,      -r: The Git reference with which the current repo should be compared.',
  '                  E. g. 02ba13, HEAD~1 or master.',
  '                  Defaults to HEAD.',
  '  --test-fix, -t: Use the test fixtures instead of specifing custom fixtures.',
  '  --help,     -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!args.plugin) {
  console.error(colors.red('[Error]') + ' Plugin has to be specified using --plugin');
  console.log(helpMessage);
  process.exit(1);
}

if (args._.length === 0 && !args.t) {
  console.log(colors.yellow('[Warning]') + ' No fixtures specified. See --help for usage.');
}

require('../lib/diff-plugin-outputs.js')(args.plugin, args.ref, args.t ? testFixtures : args._);