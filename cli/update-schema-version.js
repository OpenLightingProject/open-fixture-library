#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const fixturePath = path.join(__dirname, '../fixtures');
const fixtures = Object.keys(require('../fixtures/register.json').filesystem);
const files = fixtures.map(manFix => path.join(fixturePath, `${manFix}.json`)).concat(path.join(fixturePath, 'schema.js'));

const args = minimist(process.argv.slice(2), {
  string: ['v'],
  boolean: ['h'],
  alias: { v: 'version', h: 'help' }
});

const helpMessage = [
  'Updates all fixtures and the fixture schema to specified version number.',
  `Usage: node ${path.relative(process.cwd(), __filename)} -v <version number>`,
  'Options:',
  '  --version,  -v: Semver version in x.y.z format.',
  '                  E. g. 1.0.0 or 7.12.3',
  '  --help,     -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!args.version || args.version.match(/\d+\.\d+\.\d+/) === null) {
  console.error(colors.red('[Error]'), '--version must be set to a valid value');
  console.log(helpMessage);
  process.exit(1);
}

const schema = `https://github.com/FloEdelmann/open-fixture-library/blob/${args.version}/fixtures/schema.js`;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  content = updateParameter(content, 'schema', schema);
  content = updateParameter(content, 'schemaVersion', args.version);

  console.log(`Updated ${file}`);
  fs.writeFileSync(file, content, 'utf8');
}

function updateParameter(jsonString, parameter, value) {
  // the groups around the value aren't touched
  const regex = new RegExp(`(["']${parameter}["']:[ ]+["'])[^"']+(["'])`, 'g');
  return jsonString.replace(regex, `$1${value}$2`);
}