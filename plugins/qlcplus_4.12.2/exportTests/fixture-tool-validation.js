import { execFile as execFileAsync } from 'child_process';
import { mkdir, mkdtemp, writeFile } from 'fs/promises';
import https from 'https';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import importJson from '../../../lib/import-json.js';

const execFile = promisify(execFileAsync);

const GITHUB_BASE_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/`;
const FIXTURE_TOOL_DIR_PREFIX = path.join(os.tmpdir(), `ofl-qlcplus5-fixture-tool-`);
const FIXTURE_TOOL_PATH = `resources/fixtures/scripts/fixtures-tool.py`;
const COLOR_FILTERS_PATH = `resources/colorfilters/namedrgb.qxcf`;
const EXPORTED_FIXTURE_PATH = `resources/fixtures/manufacturer/fixture.qxf`;

/**
 * @typedef {object} ExportFile
 * @property {string} name File name, may include slashes to provide a folder structure.
 * @property {string} content File content.
 * @property {string} mimetype File mime type.
 * @property {Fixture[] | null} fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @property {string | null} mode Mode's shortName if given file only describes a single mode.
 */

/**
 * @param {ExportFile} exportFile The file returned by the plugins' export module.
 * @param {ExportFile[]} allExportFiles An array of all export files.
 * @returns {Promise<void, string[] | string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
export default async function testFixtureToolValidation(exportFile, allExportFiles) {
  if (exportFile.name.startsWith(`gobos/`)) {
    return;
  }

  // create a unique temporary directory to avoid race conditions when multiple running tests access the same files
  const directory = await mkdtemp(FIXTURE_TOOL_DIR_PREFIX);

  // download fixtures-tool.py into fixtures/scripts directory
  const fixtureToolPath = path.resolve(directory, FIXTURE_TOOL_PATH);
  await mkdir(path.dirname(fixtureToolPath), { recursive: true });
  const fixtureToolContent = await downloadFile(GITHUB_BASE_URL + FIXTURE_TOOL_PATH);
  await writeFile(fixtureToolPath, fixtureToolContent, { mode: 0o755 });

  // download namedrgb.qxcf into colorfilters directory
  const colorFiltersPath = path.resolve(directory, COLOR_FILTERS_PATH);
  await mkdir(path.dirname(colorFiltersPath), { recursive: true });
  const namedRgbContent = await downloadFile(GITHUB_BASE_URL + COLOR_FILTERS_PATH);
  await writeFile(colorFiltersPath, namedRgbContent);

  // write exported fixture.qxf into fixtures/manufacturer directory
  await mkdir(path.join(directory, `resources/fixtures/manufacturer`), { recursive: true });
  await writeFile(path.join(directory, EXPORTED_FIXTURE_PATH), exportFile.content);

  // store used gobos in the gobos/ directory
  const qlcplusGoboAliases = await importJson(`../../../resources/gobos/aliases/qlcplus.json`, import.meta.url);
  const qlcplusGobos = [
    `gobos/Others/open.svg`,
    `gobos/Others/rainbow.png`,
    ...Object.keys(qlcplusGoboAliases).map(gobo => `gobos/${gobo}`),
    ...allExportFiles.filter(file => file.name.startsWith(`gobos/`)).map(file => file.name),
  ];

  for (const gobo of qlcplusGobos) {
    const goboPath = path.join(directory, `resources`, gobo);
    const goboDirectory = path.dirname(goboPath);

    await mkdir(goboDirectory, { recursive: true });
    await writeFile(goboPath, ``);
  }

  // call the fixture tool
  const output = await execFile(fixtureToolPath, [`--validate`, `.`], {
    cwd: path.join(directory, `resources/fixtures`),
  }).catch(error => {
    if (error.stdout) {
      return {
        stdout: error.stdout,
        stderr: error.stderr,
      };
    }
    throw error;
  });

  const lastLine = output.stdout.split(`\n`).findLast(line => line !== ``);

  if (lastLine !== `1 definitions processed. 0 errors detected`) {
    throw output.stdout;
  }
}


/**
 * @param {string} url The URL to download the file from.
 * @returns {Promise<string>} A Promise that resolves to the downloaded file's content.
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      let data = ``;
      response.on(`data`, chunk => {
        data += chunk;
      });
      response.on(`end`, () => resolve(data));
    }).on(`error`, error => reject(error));
  });
}
