const fs = require(`fs`);
const path = require(`path`);
const childProcess = require(`child_process`);
const Zip = require(`node-zip`);
const colors = require(`colors`);
const disparity = require(`disparity`);
const dirCompare = require(`dir-compare`);
const promisify = require(`util`).promisify;
const mkdirp = promisify(require(`mkdirp`));
const del = promisify(require(`node-delete`));

module.exports = function(plugin, ref, fixtures) {
  const date = new Date();

  // get manufacturer and fixture data later used by export plugins
  fixtures = fixtures.map(relativePath => {
    const absolutePath = path.join(process.cwd(), relativePath);
    return [
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)) // fix key
    ];
  });

  console.log(`## Diffing plugin output`);
  console.log(`# plugin:`, plugin);
  console.log(`# ref:`, ref);
  console.log(`# fixtures:`, fixtures.map(([man, fix]) => `${man}/${fix}`).join(`, `));
  console.log();

  const tempDir = path.join(__dirname, `..`, `tmp`);
  if (process.cwd().match(tempDir)) {
    console.error(`${colors.red(`[Error]`)} This script can't be run from inside the tmp directory.`);
    process.exit(1);
  }

  const currentOut = path.join(tempDir, `current_output`);
  const compareOut = path.join(tempDir, `compare_output`);
  const scriptName = path.join(`plugins`, plugin, `export.js`);

  // delete old temp folder and recreate it
  return del([tempDir], { force: true })
    .then(() => mkdirp(tempDir))

    // export with current plugin script
    .then(() => exportFixtures(
      currentOut,
      path.join(__dirname, `..`, scriptName),
      path.join(__dirname, `..`)
    ))
    .catch(error => {
      console.error(`${colors.red(`[Error]`)} Exporting with current plugin script failed:`, error);
      process.exit(1);
    })

    // get compare script and fixture files as archive
    .then(() => {
      const compareArchivePath = path.join(tempDir, `compare.zip`);
      const unzipDir = path.join(tempDir, `compareFiles`);

      return promisify(childProcess.exec)(`git archive ${ref} -o ${compareArchivePath}`, {
        cwd: path.join(__dirname, `..`),
        encoding: `utf-8`
      })
        .catch(error => {
          console.error(`${colors.red(`[Error]`)} Failed to download compare plugin script: ${error.message}`);
          process.exit(1);
        })

        // unzip compare archive
        .then(() => mkdirp(unzipDir))
        .then(() => promisify(fs.readFile)(compareArchivePath))
        .then(compareArchive => {
          const unzip = new Zip(compareArchive);

          Object.keys(unzip.files).forEach(fileName => {
            const file = unzip.files[fileName];
            const filePath = path.join(unzipDir, file.name);

            if (!file.dir) {
              mkdirp.sync(path.dirname(filePath));
              fs.writeFileSync(filePath, file.asNodeBuffer());
            }
          });
        })

        // delete compare archive
        .then(() => {
          return del(compareArchivePath, { force: true });
        })

        // export with compare plugin script
        .then(() => {
          return exportFixtures(
            compareOut,
            path.join(unzipDir, scriptName),
            unzipDir
          );
        })
        .catch(error => {
          console.error(`${colors.red(`[Error]`)} Exporting with compare plugin script failed:`, error);
          process.exit(1);
        });
    })

    // find the differences
    .then(() => dirCompare.compare(compareOut, currentOut, {
      compareContent: true
    }))
    .then(diffResult => {
      const outputData = {
        removedFiles: [],
        addedFiles: [],
        changedFiles: {}
      };

      for (const difference of diffResult.diffSet) {
        let name;

        switch (difference.state) {
          case `equal`:
            continue;

          case `left`:
            name = getRelativePath(difference.relativePath, difference.name1, difference.type1);

            console.log(colors.red(`File or directory ${name} was removed.`));

            outputData.removedFiles.push(name);
            continue;

          case `right`:
            name = getRelativePath(difference.relativePath, difference.name2, difference.type2);

            console.log(colors.green(`File or directory ${name} was added.`));

            outputData.addedFiles.push(name);
            continue;

          case `distinct`: {
            name = getRelativePath(difference.relativePath, difference.name2, difference.type2);
            const file1 = fs.readFileSync(path.join(difference.path1, difference.name1), `utf8`);
            const file2 = fs.readFileSync(path.join(difference.path2, difference.name2), `utf8`);

            console.log(colors.yellow(`Diff for ${name}`));
            console.log(disparity.unified(file1, file2));

            outputData.changedFiles[name] = disparity.unifiedNoColor(file1, file2);
            continue;
          }
        }
      }

      console.log(`Done.`);
      return outputData;
    });


  /**
   *
   * @param {!string} outputPath The path where to output the exported fixtures.
   * @param {!string} pluginScript The path of the plugin export script.
   * @param {!string} baseDir The OFL root directory.
   * @returns {!Promise.<null, !Error>} A Promise that resolves when all exported fixtures are saved to the filesystem.
   */
  function exportFixtures(outputPath, pluginScript, baseDir) {
    let plugin;
    try {
      plugin = require(pluginScript);
    }
    catch (error) {
      return Promise.reject(error);
    }

    const { fixtureFromRepository } = require(path.join(baseDir, `lib`, `model.js`));

    return plugin.export(fixtures.map(([man, fix]) => fixtureFromRepository(man, fix)), {
      baseDir: baseDir,
      date: date
    })
      .then(outFiles => Promise.all(
        outFiles.map(outFile => {
          const outFilePath = path.join(outputPath, outFile.name);
          return mkdirp(path.dirname(outFilePath))
            .then(() => promisify(fs.writeFile)(outFilePath, outFile.content));
        })
      ));
  }
};

/**
 * @param {!string} relativePath The relative path to the directory containing the item. relativePath in diffSet.
 * @param {!string} name The item's name. name1/name2 in diffSet.
 * @param {'file'|'directory'} type Specifies if the item is a file or a directory. type1/type2 in diffSet.
 * @returns {!string} The relative path to the item itself. Ends with an '/' if the item is a directory.
 */
function getRelativePath(relativePath, name, type) {
  if (type === `directory`) {
    return path.join(`.`, relativePath, name, `/`); // the '.' removes a '/' in the beginning of the relative path
  }
  return path.join(`.`, relativePath, name);
}
