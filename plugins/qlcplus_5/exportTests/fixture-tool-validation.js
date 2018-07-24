const https = require(`https`);
const path = require(`path`);
const fs = require(`fs`);
const os = require(`os`);
const { promisify } = require(`util`);

const mkdirp = promisify(require(`mkdirp`));
const mkdtemp = promisify(fs.mkdtemp);
const writeFile = promisify(fs.writeFile);
const execFile = promisify(require(`child_process`).execFile);


const FIXTURE_TOOL_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/fixtures/scripts/fixtures-tool.py`;
const FIXTURE_TOOL_DIR_PREFIX = path.join(os.tmpdir(), `ofl-qlcplus5-fixture-tool-`);
const FIXTURE_TOOL_PATH = `resources/fixtures/scripts/fixtures-tool.py`;
const EXPORTED_FIXTURE_PATH = `resources/fixtures/manufacturer/fixture.qxf`;

module.exports = function testFixtureToolValidation(exportFileData) {
  let directory;

  return mkdtemp(FIXTURE_TOOL_DIR_PREFIX)
    .then(tmpDir => {
      directory = tmpDir;
    })
    .then(() => mkdirp(path.join(directory, `resources/fixtures/scripts`)))
    .then(() => mkdirp(path.join(directory, `resources/fixtures/manufacturer`)))
    .then(() => mkdirp(path.join(directory, `resources/gobos/Others`)))
    .then(() => writeFile(path.join(directory, `resources/gobos/Others/rainbow.png`), ``))
    .then(() => downloadFixtureTool(directory))
    .then(() => writeFile(path.join(directory, EXPORTED_FIXTURE_PATH), exportFileData))
    .then(() => execFile(path.join(directory, FIXTURE_TOOL_PATH), [`--validate`, `.`], {
      cwd: path.join(directory, `resources/fixtures`)
    }))
    .then(output => {
      const lastLine = output.stdout.split(`\n`).filter(line => line !== ``).pop();

      if (lastLine !== `1 definitions processed. 0 errors detected`) {
        return Promise.reject(output.stdout);
      }

      return Promise.resolve();
    });
};


/**
 * Download the QLC+ fixture tool from GitHub, or use local version if already present.
 * @param {!string} directory The absolute path of the temporary directory.
 * @returns {!Promise} A Promise that resolves when the fixture tool is usable.
 */
function downloadFixtureTool(directory) {
  return new Promise((resolve, reject) => {
    https.get(FIXTURE_TOOL_URL, res => {
      let data = ``;
      res.on(`data`, chunk => {
        data += chunk;
      });
      res.on(`end`, () => {
        writeFile(path.join(directory, FIXTURE_TOOL_PATH), data, {
          mode: 0o755
        }).then(resolve).catch(reject);
      });
    }).on(`error`, err => {
      reject(err);
    });
  });
}
