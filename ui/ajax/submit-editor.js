// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const createPullRequest = require(`../../lib/create-github-pr.js`);
const getOutObjectFromEditorData = require(`../../lib/get-out-object-from-editor-data.js`);

/**
 * Takes the input from the fixture editor client side script and converts it to an OFL fixture JSON.
 * If indicated in the request, a GitHub pull request is created.
 * Otherwise, fixture errors and warnings from fixture-valid are returned.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
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

    response.status(201).json({
      errors,
      warnings
    });
  }
};
