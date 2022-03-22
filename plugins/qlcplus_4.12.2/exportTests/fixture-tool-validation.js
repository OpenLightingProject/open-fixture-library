import { execFile as execFileAsync } from 'child_process';
import { mkdir, mkdtemp, writeFile } from 'fs/promises';
import https from 'https';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import importJson from '../../../lib/import-json.js';

const execFile = promisify(execFileAsync);

const FIXTURE_TOOL_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/fixtures/scripts/fixtures-tool.py`;
const FIXTURE_TOOL_DIR_PREFIX = path.join(os.tmpdir(), `ofl-qlcplus5-fixture-tool-`);
const FIXTURE_TOOL_PATH = `resources/fixtures/scripts/fixtures-tool.py`;
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
  await mkdir(path.join(directory, `resources/fixtures/scripts`), { recursive: true });
  await downloadFixtureTool(directory);

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
  const output = await execFile(path.join(directory, FIXTURE_TOOL_PATH), [`--validate`, `.`], {
    cwd: path.join(directory, `resources/fixtures`),
  });

  const lastLine = output.stdout.split(`\n`).filter(line => line !== ``).pop();

  if (lastLine !== `1 definitions processed. 0 errors detected`) {
    throw output.stdout;
  }
}


/**
 * Download the QLC+ fixture tool from GitHub, or use local version if already present.
 * @param {string} directory The absolute path of the temporary directory.
 * @returns {Promise} A Promise that resolves when the fixture tool is usable.
 */
function downloadFixtureTool(directory) {
  return new Promise((resolve, reject) => {
    https.get(FIXTURE_TOOL_URL, response => {
      let data = ``;
      response.on(`data`, chunk => {
        data += chunk;
      });
      response.on(`end`, async () => {
        try {
          await writeFile(path.join(directory, FIXTURE_TOOL_PATH), data, {
            mode: 0o755,
          });
          resolve();
        }
        catch (error) {
          reject(error);
        }
      });
    }).on(`error`, error => reject(error));
  });
}
