// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const createPullRequest = require(`../../lib/create-github-pr.js`);
const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const getOutObjectFromEditorData = require(`../../lib/get-out-object-from-editor-data.js`);

/**
 * Takes the input from the fixture editor client side script and creates a pull request with the new fixture.
 * @param {object} request Passed from Express.
 * @param {object} response Passed from Express.
 */
module.exports = async function addFixtures(request, response) {
  let pullRequestUrl;
  let error;

  const outObject = getOutObjectFromEditorData(request.body.fixtures);

  if (request.body.createPullRequest) {
    try {
      pullRequestUrl = await createPullRequest(outObject);
    }
    catch (err) {
      error = err.message;
    }
    finally {
      response.status(201).json({
        pullRequestUrl,
        error
      });
    }
  }
  else {
    const errors = Object.values(outObject.errors)[0];
    const warnings = Object.values(outObject.warnings)[0];
    const [fixtureKey, fixtureJsonObject] = Object.entries(outObject.fixtures)[0];

    response.status(201).json({
      errors,
      warnings,
      fixtureKey,
      fixtureJson: fixtureJsonStringify(fixtureJsonObject)
    });
  }
};