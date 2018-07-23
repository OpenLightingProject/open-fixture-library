const https = require(`https`);
const path = require(`path`);
const fs = require(`fs`);
const os = require(`os`);
const { promisify } = require(`util`);

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const execFile = promisify(require(`child_process`).execFile);


const FIXTURE_TOOL_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/fixtures/scripts/fixtures-tool.py`;
const FIXTURE_TOOL_DIR = path.join(os.tmpdir(), `ofl-qlcplus5-fixture-tool`);
const FIXTURE_TOOL_FILENAME = `fixtures-tool.py`;
const FIXTURE_TOOL_PATH = path.join(FIXTURE_TOOL_DIR, FIXTURE_TOOL_FILENAME);

const DUMMY_DIR = path.join(FIXTURE_TOOL_DIR, `fixtures`);
const DUMMY_FILENAME = path.join(DUMMY_DIR, `manufacturer`);

const EXPORTED_FIXTURE_DIR = path.join(FIXTURE_TOOL_DIR, `manufacturer`);
const EXPORTED_FIXTURE_FILENAME = path.join(EXPORTED_FIXTURE_DIR, `fixture.qxf`);

module.exports = function testFixtureToolValidation(exportFileData) {
  return downloadFixtureTool()
    .then(() => createDirectoryStructure())
    .then(() => writeFile(EXPORTED_FIXTURE_FILENAME, exportFileData))
    .then(() => execFile(FIXTURE_TOOL_PATH, [`--validate`, DUMMY_DIR], {
      cwd: FIXTURE_TOOL_DIR
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
 * @returns {!Promise} A Promise that resolves when the fixture tool is usable.
 */
function downloadFixtureTool() {
  if (fs.existsSync(FIXTURE_TOOL_PATH)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    https.get(FIXTURE_TOOL_URL, res => {
      let data = ``;
      res.on(`data`, chunk => {
        data += chunk;
      });
      res.on(`end`, () => {
        fs.mkdir(FIXTURE_TOOL_DIR, mkdirErr => {
          if (mkdirErr) {
            reject(mkdirErr);
            return;
          }

          fs.writeFile(FIXTURE_TOOL_PATH, data, {
            mode: 0o755
          }, writeErr => {
            if (writeErr) {
              reject(writeErr);
              return;
            }

            resolve();
          });
        });
      });
    }).on(`error`, err => {
      reject(err);
    });
  });
}

/**
 * @returns {!Promise} A Promise that resolves when the directory structure is created.
 */
function createDirectoryStructure() {
  const allowExistError = err => {
    if (err.code === `EEXIST`) {
      return Promise.resolve();
    }

    return Promise.reject();
  };

  return mkdir(DUMMY_DIR)
    .catch(allowExistError)
    .then(() => writeFile(DUMMY_FILENAME, ``))
    .then(() => mkdir(EXPORTED_FIXTURE_DIR))
    .catch(allowExistError);
}
