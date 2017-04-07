const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const del = require('node-delete');
const zip = require('node-zip');
const colors = require('colors');
const diff = require('diff');

module.exports = function(args, resolve) {
  let outputData = {
    removedFiles: [],
    addedFiles: [],
    changedFiles: {}
  };

  console.log(`== Diffing the output of ${args.fixtures.length} fixture(s) ==\n`);

  // get manufacturer and fixture data later used by export plugins
  const options = {
    manufacturers: JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'fixtures', 'manufacturers.json')
    )),
    baseDir: path.join(__dirname, '..'),
  }
  let library = [];
  for (let fixture of args.fixtures) {
    // fixture path is relative to user's working directory
    const fixPath = path.join(process.env.PWD, fixture);
    library.push({
      manufacturerKey: path.basename(path.dirname(fixPath)),
      fixtureKey: path.basename(fixPath, path.extname(fixPath)),
    });
  }

  // delete old temp folder and recreate it
  const tempDir = path.join(__dirname, '..', 'tmp');
  del.sync([tempDir]);
  fs.mkdirSync(tempDir);
  const currentOut = path.join(tempDir, 'current_output');
  const compareOut = path.join(tempDir, 'compare_output');

  const scriptName = path.join('plugins', args.plugin + '.js');

  // export with current plugin script
  exportFixtures(
    currentOut,
    path.join(__dirname, '..', scriptName),
    options,
    library
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
      exportFixtures(
        compareOut,
        compareScript,
        options,
        library
      );
      del(path.join(__dirname, 'plugins'));

      // make recursive diff
      diffDir('', compareOut, currentOut, outputData);
      findAddedFiles('', compareOut, currentOut, outputData);
      console.log('Done.');

      if (resolve) {
        resolve(outputData);
      }
    }
  );
}

// diffs recursively compare output vs. current output
function diffDir(subdir, compareOut, currentOut, outputData) {
  const dir = path.join(compareOut, subdir);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(subdir, file);
    const filePathCompare = path.join(compareOut, filePath);
    const filePathCurrent = path.join(currentOut, filePath);

    if (!fs.existsSync(filePathCurrent)) {
      console.log(colors.red(`File or directory ${filePath} was removed.`))
      outputData.removedFiles.push(filePath);
    }
    else {
      if (fs.lstatSync(filePathCompare).isDirectory()) {
        diffDir(filePath, compareOut, currentOut, outputData);
      }
      else {
        const fileCompare = fs.readFileSync(filePathCompare, 'utf-8');
        const fileCurrent = fs.readFileSync(filePathCurrent, 'utf-8');
        const diffs = diff.diffWords(fileCompare, fileCurrent);

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

        outputData.changedFiles[filePath] = diff.createPatch(
          filePath,
          fileCompare,
          fileCurrent
        );
      }
    }
  }
}

// checks if files exist in current output but not in compare output
// -> that's the diff that's not covered by diffDir(..)
function findAddedFiles(subdir, compareOut, currentOut, outputData) {
  const dir = path.join(currentOut, subdir);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(subdir, file);
    const filePathCompare = path.join(compareOut, filePath);
    const filePathCurrent = path.join(currentOut, filePath);

    if (!fs.existsSync(filePathCompare)) {
      console.log(colors.green(`File or directory ${filePath} was added.`))
      outputData.addedFiles.push(filePath);
    }
    else if (fs.lstatSync(filePathCurrent).isDirectory()) {
      findAddedFiles(filePath, compareOut, currentOut, outputData);
    }
  }
}


function exportFixtures(outputPath, pluginScript, options, library) {
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