#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const minimist = require('minimist');
const del = require('node-delete');
const zip = require('node-zip');
const colors = require('colors');
const diff = require('diff');

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

console.log(`== Diffing the output of ${args._.length} fixture(s) ==\n`);


// get manufacturer and fixture data later used by export plugins
const options = {
  manufacturers: JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'fixtures', 'manufacturers.json')
  )),
  baseDir: path.join(__dirname, '..'),
}
let library = [];
for (let fixture of args._) {
  // fixture path is relative to user's working directory
  const fixPath = path.join(process.env.PWD, fixture);
  library.push({
    manufacturerKey: path.basename(path.dirname(fixPath)),
    fixtureKey: path.basename(fixPath, path.extname(fixPath)),
  });
}

const scriptName = path.join('plugins', args.plugin + '.js');
const currentOut = path.join(__dirname, 'current_output');
const compareOut = path.join(__dirname, 'compare_output');

// export with current plugin script
del.sync([currentOut]);
exportFixtures(
  currentOut,
  path.join(__dirname, '..', scriptName)
);

// get compare plugin script
const compareArchive = path.join(__dirname, `${args.plugin}-compare.zip`);
child_process.exec(
  `git archive ${args.ref} ${scriptName} -o ${compareArchive}`,
  {
    cwd: path.join(__dirname, '..')
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error downloading compare plugin script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error downloading compare plugin script: ${stderr}`);
      return;
    }
    if (stdout) {
      console.log(stdout);
    }

    // unzip archive to get compare script file
    const unzip = new zip(fs.readFileSync(compareArchive));
    const compareScript = path.join(__dirname, scriptName);
    if (!fs.existsSync(path.dirname(compareScript))) {
      fs.mkdirSync(path.dirname(compareScript));
    }
    fs.writeFileSync(compareScript, unzip.files[scriptName].asNodeBuffer());
    del(compareArchive);

    // export with compare plugin script
    del.sync([compareOut]);
    exportFixtures(
      compareOut,
      compareScript
    );
    del(path.join(__dirname, 'plugins'));

    // make recursive diff
    diffDir('');
    findAddedFiles('');
    console.log('Done.');
  }
)

// diffs recursively compare output vs. current output
function diffDir(subdir) {
  const dir = path.join(compareOut, subdir);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(subdir, file);
    const filePathCompare = path.join(compareOut, filePath);
    const filePathCurrent = path.join(currentOut, filePath);

    if (!fs.existsSync(filePathCurrent)) {
      console.log(colors.red(`File or directory ${filePath} was removed.`))
    }
    else {
      if (fs.lstatSync(filePathCompare).isDirectory()) {
        diffDir(filePath);
      }
      else {
        const diffs = diff.diffWords(
          fs.readFileSync(filePathCompare, 'utf-8'),
          fs.readFileSync(filePathCurrent, 'utf-8')
        );

        if (diffs.length > 1) {
          console.log(colors.yellow(`Diff for ${filePath}`));
          diffs.forEach(function(part) {
            if (part.added) {
              process.stdout.write(colors.green(part.value));
            }
            else if (part.removed) {
              process.stdout.write(colors.red(part.value));
            }
            else {
              process.stdout.write(colors.grey(part.value));
            }
          });
          console.log();
        }
      }
    }
  }
}

// checks if files exist in current output but not in compare output
// -> that's the diff that's not covered by diffDir(..)
function findAddedFiles(subdir) {
  const dir = path.join(currentOut, subdir);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(subdir, file);
    const filePathCompare = path.join(compareOut, filePath);
    const filePathCurrent = path.join(currentOut, filePath);

    if (!fs.existsSync(filePathCompare)) {
      console.log(colors.green(`File or directory ${filePath} was added.`))
    }
    else if (fs.lstatSync(filePathCurrent).isDirectory()) {
      findAddedFiles(filePath);
    }
  }
}


function exportFixtures(outputPath, pluginScript) {
  try {
    fs.accessSync(pluginScript, fs.constants.R_OK);
  }
  catch (e) {
    console.error(e.message);
    return;
  }

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
    fs.writeFileSync(outFilePath, outFile.content);
  }
}