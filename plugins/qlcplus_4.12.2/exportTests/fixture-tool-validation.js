const https = require(`https`);
const path = require(`path`);
const fs = require(`fs`);
const os = require(`os`);
const mkdirp = require(`mkdirp`);
const { promisify } = require(`util`);

const mkdtemp = promisify(fs.mkdtemp);
const writeFile = promisify(fs.writeFile);
const execFile = promisify(require(`child_process`).execFile);

const qlcplusGoboAliases = require(`../../../resources/gobos/aliases/qlcplus.json`);


const FIXTURE_TOOL_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/fixtures/scripts/fixtures-tool.py`;
const FIXTURE_TOOL_DIR_PREFIX = path.join(os.tmpdir(), `ofl-qlcplus5-fixture-tool-`);
const FIXTURE_TOOL_PATH = `resources/fixtures/scripts/fixtures-tool.py`;
const EXPORTED_FIXTURE_PATH = `resources/fixtures/manufacturer/fixture.qxf`;

/**
 * @typedef {Object} ExportFile
 * @property {String} name File name, may include slashes to provide a folder structure.
 * @property {String} content File content.
 * @property {String} mimetype File mime type.
 * @property {Array.<Fixture>|null} fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @property {String|null} mode Mode's shortName if given file only describes a single mode.
 */

/**
 * @param {ExportFile} exportFile The file returned by the plugins' export module.
 * @param {Array.<ExportFile>} allExportFiles An array of all export files.
 * @returns {Promise.<undefined, Array.<String>|String>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
module.exports = async function testFixtureToolValidation(exportFile, allExportFiles) {
  if (exportFile.name.startsWith(`gobos/`)) {
    return;
  }

  // create a unique temporary directory to avoid race conditions when multiple running tests access the same files
  const directory = await mkdtemp(FIXTURE_TOOL_DIR_PREFIX);

  // download fixtures-tool.py into fixtures/scripts directory
  await mkdirp(path.join(directory, `resources/fixtures/scripts`));
  await downloadFixtureTool(directory);

  // write exported fixture.qxf into fixtures/manufacturer directory
  await mkdirp(path.join(directory, `resources/fixtures/manufacturer`));
  await writeFile(path.join(directory, EXPORTED_FIXTURE_PATH), exportFile.content);

  // store used gobos in the gobos/ directory
  const qlcplusGobos = [`gobos/Others/open.svg`, `gobos/Others/rainbow.png`].concat(
    Object.keys(qlcplusGoboAliases).map(gobo => `gobos/${gobo}`),
    allExportFiles.filter(file => file.name.startsWith(`gobos/`)).map(file => file.name)
  );

  for (const gobo of qlcplusGobos) {
    const goboPath = path.join(directory, `resources`, gobo);
    const goboDirectory = path.dirname(goboPath);

    await mkdirp(goboDirectory);
    await writeFile(goboPath, ``);
  }

  // call the fixture tool
  const output = await execFile(path.join(directory, FIXTURE_TOOL_PATH), [`--validate`, `.`], {
    cwd: path.join(directory, `resources/fixtures`)
  });

  const lastLine = output.stdout.split(`\n`).filter(line => line !== ``).pop();

  if (lastLine !== `1 definitions processed. 0 errors detected`) {
    throw output.stdout;
  }
};


/**
 * Download the QLC+ fixture tool from GitHub, or use local version if already present.
 * @param {String} directory The absolute path of the temporary directory.
 * @returns {Promise} A Promise that resolves when the fixture tool is usable.
 */
function downloadFixtureTool(directory) {
  return new Promise((resolve, reject) => {
    https.get(FIXTURE_TOOL_URL, res => {
      let data = ``;
      res.on(`data`, chunk => {
        data += chunk;
      });
      res.on(`end`, async () => {
        try {
          await writeFile(path.join(directory, FIXTURE_TOOL_PATH), data, {
            mode: 0o755
          });
          resolve();
        }
        catch (err) {
          reject(err);
        }
      });
    }).on(`error`, err => {
      reject(err);
    });
  });
}
