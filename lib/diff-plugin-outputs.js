const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const del = require('node-delete');
const Zip = require('node-zip');
const colors = require('colors');
const disparity = require('disparity');
const dirCompare = require('dir-compare');

module.exports = function(plugin, ref, fixtures) {
  const date = new Date();

  const outputData = {
    removedFiles: [],
    addedFiles: [],
    changedFiles: {}
  };

  // get manufacturer and fixture data later used by export plugins
  fixtures = fixtures.map(relativePath => {
    const absolutePath = path.join(process.env.PWD, relativePath);
    return [
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)) // fix key
    ];
  });

  console.log();
  console.log('## Diffing plugin output');
  console.log('# plugin:', plugin);
  console.log('# ref:', ref);
  console.log('# fixtures:', fixtures.map(([man, fix]) => `${man}/${fix}`).join(', '));
  console.log();

  // delete old temp folder and recreate it
  const tempDir = path.join(__dirname, '..', 'tmp');
  if (process.env.PWD.match(tempDir)) {
    console.error(`${colors.red('[Error]')} This script can't be run from inside the tmp directory.`);
    process.exit(1);
  }
  del.sync([tempDir], {force: true});
  fs.mkdirSync(tempDir);
  const currentOut = path.join(tempDir, 'current_output');
  const compareOut = path.join(tempDir, 'compare_output');

  const scriptName = path.join('plugins', plugin, 'export.js');

  // export with current plugin script
  exportFixtures(
    currentOut,
    path.join(__dirname, '..', scriptName),
    path.join(__dirname, '..')
  );

  // get compare script and fixture files as archive
  const compareArchive = path.join(tempDir, 'compare.zip');
  try {
    childProcess.execSync(`git archive ${ref} -o ${compareArchive}`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8'
    });
  }
  catch (e) {
    console.error(`${colors.red('[Error]')} Failed to download compare plugin script: ${e.message}`);
    process.exit(1);
  }

  // unzip archive
  const unzip = new Zip(fs.readFileSync(compareArchive));
  const unzipDir = path.join(tempDir, 'compareFiles');
  fs.mkdirSync(unzipDir);
  for (let file of Object.keys(unzip.files)) {
    file = unzip.files[file];
    const filePath = path.join(unzipDir, file.name);

    if (file.dir) {
      fs.mkdirSync(filePath);
    }
    else {
      fs.writeFileSync(filePath, file.asNodeBuffer());
    }
  }
  del.sync(compareArchive, {force: true});

  // export with compare plugin script
  exportFixtures(
    compareOut,
    path.join(unzipDir, scriptName),
    unzipDir
  );

  // find the differences
  const differences = dirCompare.compareSync(compareOut, currentOut, {
    compareContent: true
  }).diffSet;
  for (const difference of differences) {
    let name;

    switch (difference.state) {
      case 'equal':
        continue;

      case 'left':
        name = getRelativePath(difference.relativePath, difference.name1, difference.type1);

        console.log(colors.red(`File or directory ${name} was removed.`));

        outputData.removedFiles.push(name);
        continue;

      case 'right':
        name = getRelativePath(difference.relativePath, difference.name2, difference.type2);

        console.log(colors.red(`File or directory ${name} was added.`));

        outputData.addedFiles.push(name);
        continue;

      case 'distinct': {
        name = getRelativePath(difference.relativePath, difference.name2, difference.type2);
        const file1 = fs.readFileSync(path.join(difference.path1, difference.name1), 'utf8');
        const file2 = fs.readFileSync(path.join(difference.path2, difference.name2), 'utf8');

        console.log(colors.yellow(`Diff for ${name}`));
        console.log(disparity.unified(file1, file2));

        outputData.changedFiles[name] = disparity.unifiedNoColor(file1, file2);
        continue;
      }
    }
  }

  console.log('Done.');
  return outputData;

  function exportFixtures(outputPath, pluginScript, baseDir) {
    let plugin;
    try {
      plugin = require(pluginScript);
    }
    catch (e) {
      console.error(e.message);
      return;
    }

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    const Fixture = require(path.join(baseDir, 'lib', 'model', 'Fixture.js'));
    const outFiles = plugin.export(fixtures.map(([man, fix]) => Fixture.fromRepository(man, fix)), {
      baseDir: baseDir,
      date: date
    });

    for (const outFile of outFiles) {
      const outFilePath = path.join(outputPath, outFile.name);
      if (!fs.existsSync(path.dirname(outFilePath))) {
        fs.mkdirSync(path.dirname(outFilePath));
      }
      fs.writeFileSync(outFilePath, outFile.content);
    }
  }
};

/**
 * @param {!string} relativePath The relative path to the directory containing the item. relativePath in diffSet.
 * @param {!string} name The item's name. name1/name2 in diffSet.
 * @param {'file'|'directory'} type Specifies if the item is a file or a directory. type1/type2 in diffSet.
 * @return {!string} The relative path to the item itself. Ends with an '/' if the item is a directory.
 */
function getRelativePath(relativePath, name, type) {
  if (type === 'directory') {
    return path.join('.', relativePath, name, '/'); // the '.' removes a '/' in the beggining of the relative path
  }
  return path.join('.', relativePath, name);
}
