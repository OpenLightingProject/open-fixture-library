#!/usr/bin/node
const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const exportPlugins = require('../plugins/plugins.js').export;
const Fixture = require('../lib/model/Fixture.js');

const args = minimist(process.argv.slice(2), {
  string: ['p'],
  boolean: 'h',
  alias: { p: 'plugin', h: 'help' }
});

const helpMessage = [
  `Usage: ${process.argv[1]} -p <plugin name> <fixture> [<more fixtures>]`,
  'Options:',
  '  --plugin, -p: Which plugin should be used to export fixtures.',
  '                E. g. ecue or qlcplus',
  '  --help,   -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!args.plugin) {
  console.error(colors.red('[Error]') + ' No plugin specified. See --help for usage.');
  process.exit(1);
}

if (args._.length === 0) {
  console.error(colors.red('[Error]') + ' No fixtures specified. See --help for usage.');
  process.exit(1);
}

if (!(args.plugin in exportPlugins)) {
  console.error(colors.red('[Error]') + ` Plugin '${args.plugin}' does not exist or does not support exporting.`);
  process.exit(1);
}

const fixtures = args._.map(relativePath => {
  const absolutePath = path.join(process.env.PWD, relativePath);
  return [
    path.basename(path.dirname(absolutePath)), // man key
    path.basename(absolutePath, path.extname(absolutePath)) // fix key
  ];
});

exportPlugins[args.plugin].export(
  fixtures.map(([man, fix]) => Fixture.fromRepository(man, fix)),
  {
    baseDir: path.join(__dirname, '..')
  }
).forEach(file => {
  console.log('\n' + colors.yellow(`File name: '${file.name}'`));
  console.log(file.content);
});