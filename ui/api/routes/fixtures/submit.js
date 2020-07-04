const createPullRequest = require(`../../../../lib/create-github-pr.js`);

/** @typedef {import('../../../../lib/types.js').FixtureCreateResult} FixtureCreateResult */
/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */

/**
 * @typedef {Object} RequestBody
 * @property {FixtureCreateResult} fixtureCreateResult The fixtures (and manufacturers) with warnings and errors, to submit.
 * @property {String} githubUsername Author's GitHub username
 * @property {String} githubComment Author's comment.
 */

/**
 * Creates a GitHub pull request with the given fixture data.
 * Includes warnings, errors, GitHub username and GitHub comment in the PR description.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @param {Object} request Passed from Express.
 * @param {RequestBody} request.body The fixture data to submit, along with additional info for the pull request.
 * @param {Object} response Passed from Express.
 */
async function submitFixtures(ctx, request, response) {
  try {
    const pullRequestUrl = await createPullRequest(
      request.body.fixtureCreateResult,
      request.body.githubUsername,
      request.body.githubComment,
    );
    response.status(201).json({
      pullRequestUrl,
    });
  }
  catch (error) {
    response.status(500).json({
      error: error.message,
    });
  }
}

module.exports = { submitFixtures };
