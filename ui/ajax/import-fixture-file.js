const multer = require(`multer`);
const path = require(`path`);
const promisify = require(`util`).promisify;

const importPlugins = require(`../../plugins/plugins.json`).importPlugins;
const { checkFixture } = require(`../../tests/fixture-valid.js`);
const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const createPullRequest = require(`../../lib/create-github-pr.js`);

const upload = multer({
  limits: {
    fileSize: 1024 * 1024 // 1MB
  }
}).single(`file`);

/**
 * Takes the input from the "import fixture file" form and creates a pull request with the new fixtures.
 * @param {!object} request Passed from Express.
 * @param {!object} response Passed from Express.
 */
module.exports = async function importFixtureFile(request, response) {
  let pullRequestUrl = null;
  let errorMsg = null;
  let fixtureResult = null;

  try {
    // make request.file and request.body available
    // could throw a "file too large" error
    await promisify(upload)(request, response);

    if (request.body.honeypot !== ``) {
      throw new Error(`Do not fill the "Ignore" fields!`);
    }

    if (!request.body.plugin || !importPlugins.includes(request.body.plugin)) {
      throw new Error(`Please select a valid import plugin.`);
    }

    const plugin = require(path.join(__dirname, `../../plugins`, request.body.plugin, `import.js`));
    fixtureResult = await plugin.import(request.file.buffer, request.file.originalname, request.body.author).catch(
      parseError => {
        parseError.message = `Parse error (${parseError.message})`;
        throw parseError;
      }
    );

    fixtureResult.errors = {};

    for (const key of Object.keys(fixtureResult.fixtures)) {
      const [manKey, fixKey] = key.split(`/`);

      const checkResult = checkFixture(manKey, fixKey, fixtureResult.fixtures[key]);

      fixtureResult.warnings[key] = fixtureResult.warnings[key].concat(checkResult.warnings);
      fixtureResult.errors[key] = checkResult.errors;
    }

    pullRequestUrl = await createPullRequest(fixtureResult);
  }
  catch (error) {
    errorMsg = error.message;

    console.error(`Import failed`, error);
    console.log(fixtureJsonStringify(fixtureResult));
  }

  if (request.body.isAjax) {
    response.status(201).json({
      pullRequestUrl,
      error: errorMsg
    });
    return;
  }

  response.redirect(302, `/import-fixture-file?pullRequestUrl=${encodeURIComponent(pullRequestUrl)}&error=${encodeURIComponent(errorMsg)}`);
};
