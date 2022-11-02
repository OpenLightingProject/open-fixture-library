import childProcess from 'child_process';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

import chalk from 'chalk';
import directoryCompare from 'dir-compare';
import disparity from 'disparity';
import JSZip from 'jszip';

/**
 * @typedef {object} PluginDiffOutput
 * @property {string[]} removedFiles Removed outputted files' paths.
 * @property {string[]} addedFiles Added outputted files' paths.
 * @property {object} changedFiles Changed outputted files' paths pointing to their diff.
 */

/**
 * Exports the given fixtures with the current version of the given currentPlugin and diffs the results
 * against the files exported with the comparePlugin at the state of the given Git reference.
 * @param {string} currentPluginKey The key of a currently present plugin.
 * @param {string} comparePluginKey The key of a plugin that needs to be present in the given Git reference.
 * @param {string} ref The Git reference to compare with, for example `master`, `HEAD~1` or a commit reference.
 * @param {string[]} fixtures Paths to the compared fixtures, relative to the current working directory.
 * @returns {Promise<PluginDiffOutput>} Information what output files were removed, added or changed plus the diffs for changed files.
 */
export default async function diffPluginOutputs(currentPluginKey, comparePluginKey, ref, fixtures) {
  const date = new Date();

  // get manufacturer and fixture data later used by export plugins
  fixtures = fixtures.map(relativePath => {
    const absolutePath = path.join(process.cwd(), relativePath);
    return [
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)), // fix key
    ];
  });

  console.log(`## Diffing plugin output`);
  console.log(`# current plugin:`, currentPluginKey);
  console.log(`# compare plugin:`, comparePluginKey);
  console.log(`# ref:`, ref);
  console.log(`# fixtures:`, fixtures.map(([manufacturer, fixture]) => `${manufacturer}/${fixture}`).join(`, `));
  console.log();

  const temporaryDirectoryUrl = new URL(`../tmp/`, import.meta.url);
  if (process.cwd().startsWith(fileURLToPath(temporaryDirectoryUrl))) {
    console.error(chalk.red(`[Error]`), `This script can't be run from inside the tmp directory.`);
    process.exit(1);
  }

  const currentOutUrl = new URL(`current_output/`, temporaryDirectoryUrl);
  const compareOutUrl = new URL(`compare_output/`, temporaryDirectoryUrl);

  // delete old temp folder (if it exists) and recreate it
  await rm(temporaryDirectoryUrl, {
    recursive: true,
    force: true,
  });
  await mkdir(temporaryDirectoryUrl, { recursive: true });

  // export with current plugin script
  try {
    await exportFixtures(currentOutUrl, currentPluginKey, new URL(`../`, import.meta.url));
  }
  catch (error) {
    console.error(chalk.red(`[Error]`), `Exporting with current plugin script failed:`, error);
    process.exit(1);
  }

  // get compare script and fixture files as archive
  const compareArchiveUrl = new URL(`compare.zip`, temporaryDirectoryUrl);
  const unzipDirectoryUrl = new URL(`compareFiles/`, temporaryDirectoryUrl);

  try {
    await promisify(childProcess.exec)(`git archive ${ref} -o ${fileURLToPath(compareArchiveUrl)}`, {
      cwd: fileURLToPath(new URL(`../`, import.meta.url)),
      encoding: `utf-8`,
    });
  }
  catch (error) {
    console.error(chalk.red(`[Error]`), `Failed to download compare plugin script:`, error.message);
    process.exit(1);
  }

  // unzip compare archive
  await mkdir(unzipDirectoryUrl, { recursive: true });
  const compareArchiveData = await readFile(compareArchiveUrl);
  const zip = await JSZip.loadAsync(compareArchiveData);

  await Promise.all(Object.values(zip.files).map(async file => {
    if (file.dir) {
      return;
    }

    const filePath = fileURLToPath(new URL(file.name, unzipDirectoryUrl));
    await mkdir(path.dirname(filePath), { recursive: true });
    const fileBuffer = await file.async(`nodebuffer`);
    await writeFile(filePath, fileBuffer);
  }));

  // delete compare archive
  await rm(compareArchiveUrl, {
    recursive: true,
    force: true,
  });

  // export with compare plugin script
  try {
    await exportFixtures(compareOutUrl, comparePluginKey, unzipDirectoryUrl);
  }
  catch (error) {
    console.error(chalk.red(`[Error]`), `Exporting with compare plugin script failed:`, error);
    process.exit(1);
  }

  // find the differences
  const outputData = await findDifferences(fileURLToPath(currentOutUrl), fileURLToPath(compareOutUrl));

  console.log(`Done.`);
  return outputData;


  /**
   *
   * @param {URL} outputUrl The path where to output the exported fixtures.
   * @param {string} pluginKey The plugin key.
   * @param {URL} baseDirectory The OFL root directory.
   * @returns {Promise<any, Error>} A Promise that resolves when all exported fixtures are saved to the filesystem.
   */
  async function exportFixtures(outputUrl, pluginKey, baseDirectory) {
    const plugin = await import(new URL(`plugins/${pluginKey}/export.js`, baseDirectory));
    const { fixtureFromRepository } = await import(new URL(`lib/model.js`, baseDirectory));

    // support export plugins before https://github.com/OpenLightingProject/open-fixture-library/pull/1623/commits/391e6045c6f0fcc0009bec924801b91790d3472c
    const exportFunction = plugin.exportFixtures || plugin.export;

    const outFiles = await exportFunction(
      await Promise.all(fixtures.map(
        ([manufacturer, fixture]) => fixtureFromRepository(manufacturer, fixture),
      )),
      {
        baseDirectory,
        date,
        displayedPluginVersion: `dummy version by diff-plugin-outputs`,
      },
    );

    return Promise.all(outFiles.map(async outFile => {
      const outFilePath = fileURLToPath(new URL(outFile.name, outputUrl));
      await mkdir(path.dirname(outFilePath), { recursive: true });
      await writeFile(outFilePath, outFile.content);
    }));
  }
}

/**
 * @param {string} currentOut The output directory of the current version.
 * @param {string} compareOut The output directory of the compare version.
 * @returns {Promise<PluginDiffOutput>} The plugin diff output object.
 */
async function findDifferences(currentOut, compareOut) {
  const diffResult = await directoryCompare.compare(compareOut, currentOut, {
    compareContent: true,
  });

  /** @type {PluginDiffOutput} */
  const outputData = {
    removedFiles: [],
    addedFiles: [],
    changedFiles: {},
  };

  for (const difference of diffResult.diffSet) {
    let name;

    switch (difference.state) {
      case `equal`: {
        continue;
      }
      case `left`: {
        name = getRelativePath(difference.relativePath, difference.name1, difference.type1);

        console.log(chalk.red(`File or directory ${name} was removed.`));

        outputData.removedFiles.push(name);
        continue;
      }
      case `right`: {
        name = getRelativePath(difference.relativePath, difference.name2, difference.type2);

        console.log(chalk.green(`File or directory ${name} was added.`));

        outputData.addedFiles.push(name);
        continue;
      }
      case `distinct`: {
        name = getRelativePath(difference.relativePath, difference.name2, difference.type2);
        const file1 = await readFile(path.join(difference.path1, difference.name1), `utf8`);
        const file2 = await readFile(path.join(difference.path2, difference.name2), `utf8`);

        console.log(chalk.yellow(`Diff for ${name}`));
        console.log(disparity.unified(file1, file2));

        outputData.changedFiles[name] = disparity.unifiedNoColor(file1, file2);
        continue;
      }
    }
  }

  return outputData;
}

/**
 * @param {string} relativePath The relative path to the directory containing the item. relativePath in diffSet.
 * @param {string} name The item's name. name1/name2 in diffSet.
 * @param {'file' | 'directory'} type Specifies if the item is a file or a directory. type1/type2 in diffSet.
 * @returns {string} The relative path to the item itself. Ends with an '/' if the item is a directory.
 */
function getRelativePath(relativePath, name, type) {
  if (type === `directory`) {
    return path.join(`.`, relativePath, name, `/`); // the '.' removes a '/' in the beginning of the relative path
  }
  return path.join(`.`, relativePath, name);
}
