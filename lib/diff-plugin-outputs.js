const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const del = require('node-delete');
const Zip = require('node-zip');
const colors = require('colors');
const diff = require('diff');

module.exports = function(args, resolve) {
  let outputData = {
    removedFiles: [],
    addedFiles: [],
    changedFiles: {}
  };

  // get manufacturer and fixture data later used by export plugins
  const fixtureDir = path.join(__dirname, '..', 'fixtures');
  const manufacturers = JSON.parse(fs.readFileSync(
    path.join(fixtureDir, 'manufacturers.json')
  ));
  let library = [];
  let fixtures = [];
  for (let fixture of args.fixtures) {
    // fixture path is relative to user's working directory
    const fixPath = path.join(process.env.PWD, fixture);
    library.push({
      manufacturerKey: path.basename(path.dirname(fixPath)),
      fixtureKey: path.basename(fixPath, path.extname(fixPath))
    });
    fixtures.push(path.join('fixtures', path.relative(fixtureDir, fixPath)));
  }

  console.log();
  console.log('## Diffing plugin output');
  console.log(`# plugin: ${args.plugin}`);
  console.log(`# ref: ${args.ref}`);
  console.log(`# fixtures: ${fixtures}`);
  console.log();

  // delete old temp folder and recreate it
  const tempDir = path.join(__dirname, '..', 'tmp');
  if (process.env.PWD.match(tempDir)) {
    console.error(colors.red('[Error]') + ' This script can\'t be run from inside the tmp directory.');
    process.exit(1);
  }
  del.sync([tempDir], {force: true});
  fs.mkdirSync(tempDir);
  const currentOut = path.join(tempDir, 'current_output');
  const compareOut = path.join(tempDir, 'compare_output');

  const scriptName = path.join('plugins', args.plugin + '.js');

  // export with current plugin script
  exportFixtures(
    currentOut,
    path.join(__dirname, '..', scriptName),
    path.join(__dirname, '..')
  );

  // get compare script and fixture files as archive
  const compareArchive = path.join(tempDir, 'compare.zip');
  try {
    childProcess.execSync(
      `git archive ${args.ref} ${scriptName} ${fixtures.join(' ')} -o ${compareArchive}`,
      {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf-8'
      }
    );
  }
  catch (e) {
    console.error(colors.red('[Error]') + ` Failed downloading compare plugin script: ${e.message}`);
    process.exit(1);
  }

  // unzip archive
  const unzip = new Zip(fs.readFileSync(compareArchive));
  const unzipDir = path.join(tempDir, 'compareFiles');
  fs.mkdirSync(unzipDir);
  fs.mkdirSync(path.join(unzipDir, 'fixtures'));
  for (let file in unzip.files) {
    file = unzip.files[file];
    const filePath = path.join(unzipDir, file.name);

    if (!file.dir) {
      fs.writeFileSync(filePath, file.asNodeBuffer());
    }
    else if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
  }
  del.sync(compareArchive, {force: true});

  // also copy current defaults.js (will be needed by plugin script)
  fs.writeFileSync(
    path.join(unzipDir, 'fixtures', 'defaults.js'),
    fs.readFileSync(path.join(fixtureDir, 'defaults.js'))
  );

  // export with compare plugin script
  exportFixtures(
    compareOut,
    path.join(unzipDir, scriptName),
    unzipDir
  );

  // make recursive diff
  diffDir('');
  findAddedFiles('');
  console.log('Done.');

  if (resolve) {
    resolve(outputData);
  }

  // diffs recursively compare output vs. current output
  function diffDir(subdir) {
    const dir = path.join(compareOut, subdir);
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(subdir, file);
      const filePathCompare = path.join(compareOut, filePath);
      const filePathCurrent = path.join(currentOut, filePath);

      if (!fs.existsSync(filePathCurrent)) {
        console.log(colors.red(`File or directory ${filePath} was removed.`));
        outputData.removedFiles.push(filePath);
      }
      else {
        if (fs.lstatSync(filePathCompare).isDirectory()) {
          diffDir(filePath);
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

            outputData.changedFiles[filePath] = diff.createPatch(
              filePath,
              fileCompare,
              fileCurrent
            );
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
        console.log(colors.green(`File or directory ${filePath} was added.`));
        outputData.addedFiles.push(filePath);
      }
      else if (fs.lstatSync(filePathCurrent).isDirectory()) {
        findAddedFiles(filePath);
      }
    }
  }


  function exportFixtures(outputPath, pluginScript, baseDir) {
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
    const outFiles = plugin.export(library, {
      manufacturers: manufacturers,
      baseDir: baseDir
    });
    for (let outFile of outFiles) {
      const outFilePath = path.join(outputPath, outFile.name);
      if (!fs.existsSync(path.dirname(outFilePath))) {
        fs.mkdirSync(path.dirname(outFilePath));
      }
      fs.writeFileSync(outFilePath, outFile.content);
    }
  }
};