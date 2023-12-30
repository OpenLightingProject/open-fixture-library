import createPullRequest from '../../../../lib/create-github-pr.js';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */
/** @typedef {import('../../../../lib/types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * @typedef {object} RequestBody
 * @property {FixtureCreateResult} fixtureCreateResult The fixtures (and manufacturers) with warnings and errors, to submit.
 * @property {string} githubUsername Author's GitHub username
 * @property {string} githubComment Author's comment.
 */

/**
 * Creates a GitHub pull request with the given fixture data.
 * Includes warnings, errors, GitHub username and GitHub comment in the PR description.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
export async function submitFixtures({ request }) {
  try {
    const pullRequestUrl = await createPullRequest(
      request.requestBody.fixtureCreateResult,
      request.requestBody.githubUsername,
      request.requestBody.githubComment,
    );
    return {
      statusCode: 201,
      body: {
        pullRequestUrl,
      },
    };
  }
  catch (error) {
    return {
      statusCode: 500,
      body: {
        error: `${error.toString()}\n${error.stack}`,
      },
    };
  }
}
