#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const del = require('node-delete');
const minimist = require('minimist');
const git = require('simple-git')();

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
    `Usage: ${process.argv[1]} <-p plugin> [-r ref] <fixtures>`,
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


// get manufacturer and fixture data
const options = {
  manufacturers: JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'fixtures', 'manufacturers.json')
  )),
  baseDir: path.join(__dirname, '..'),
}
let library = [];
for (let fixture of args._) {
  const fixPath = path.join(process.env.PWD, fixture);
  library.push({
    manufacturerKey: path.basename(path.dirname(fixPath)),
    fixtureKey: path.basename(fixPath, path.extname(fixPath)),
  });
}

const pluginScript = path.join(__dirname, '..', 'plugins', args.plugin + '.js');

const currentOut = path.join(__dirname, 'current_output');
del.sync([currentOut]);
exportFixtures(currentOut);

// get compare plugin script
git.checkout([args.ref, '--', pluginScript]);
const compareOut = path.join(__dirname, 'compare_output');
del.sync([compareOut]);
exportFixtures(compareOut);

// restore plugin script
git.reset(['HEAD', pluginScript]);
git.checkout(['--', pluginScript]);

// get compare plugin script:
// $ git checkout 0ece5c4 -- plugins/ecue.js

// restore plugin script:
// $ git checkout -- plugins/ecue.js

function exportFixtures(outputPath) {
  delete require.cache[require.resolve(pluginScript)]
  let plugin = require(pluginScript);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  const outFiles = plugin.export(library, options);
  for (let outFile of outFiles) {
    const outFilePath = path.join(outputPath, outFile.name);
    if (!fs.existsSync(path.dirname(outFilePath))) {
      fs.mkdirSync(path.dirname(outFilePath));
    }
    console.log(outFilePath);
    fs.writeFileSync(outFilePath, outFile.content);
  }
}