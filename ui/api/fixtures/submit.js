const createPullRequest = require(`../../../lib/create-github-pr.js`);

/** @typedef {import('./types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * @typedef {Object} RequestBody
 * @property {FixtureCreateResult} fixtureCreateResult
 * @property {String} githubUsername Author's GitHub username
 * @property {String} githubComment Author's comment.
 */

/**
 * Takes the input from the fixture editor client side script and converts it to an OFL fixture JSON.
 * If indicated in the request, a GitHub pull request is created.
 * Otherwise, fixture errors and warnings from fixture-valid are returned.
 * @param {Object} request Passed from Express.
 * @param {RequestBody} request.body The fixture data to submit, along with additional info for the pull request.
 * @param {Object} response Passed from Express.
 */
module.exports = async function addFixtures(request, response) {
  try {
    const pullRequestUrl = await createPullRequest(
      request.body.fixtureCreateResult,
      request.body.githubUsername,
      request.body.githubComment
    );
    response.status(201).json({
      pullRequestUrl
    });
  }
  catch (error) {
    response.status(500).json({
      error: error.message
    });
  }
};
