#!/usr/bin/node
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  string: ['p', 'r'],
  boolean: 'h',
  alias: { p: 'plugin', r: 'ref', h: 'help' },
  default: { r: 'HEAD~1' },
  unknown: function () { },
});

if (args.help) {
  const helpMessage = [
    'This script compares the output of the given fixtures with another version in the current repository.',
    'Fixtures have to be declared with the path to its file in the fixtures/ directory.',
    `Usage: ${process.argv[1]} -p <plugin name> [-r <git reference>] <fixture> [<more fixtures>]`,
    'Options:',
    '  --plugin, -p: Which plugin should be used to output fixtures.',
    '                E. g. ecue or qlcplus',
    '  --ref,    -r: The Git reference with which the current repo should be compared.',
    '                E. g. 02ba13, HEAD~1 or master.',
    '                Defaults to HEAD~1.',
    '  --help,   -h: Show this help message.',
  ];
  console.log(helpMessage.join('\n'));
  process.exit(0);
}

if (!args.plugin) {
  console.error('Error, plugin has to be specified using --plugin');
  process.exit(1);
}

require(path.join(__dirname, '..', 'lib', 'diff-plugin-outputs'))({
  plugin: args.plugin,
  ref: args.ref,
  fixtures: args._,
})