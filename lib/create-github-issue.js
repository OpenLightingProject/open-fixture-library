require(`./load-env-file.js`);

const githubClient = new require(`@octokit/rest`)();

/**
 * @param {string} title The issue heading.
 * @param {string} body Further text describing the issue (may include markdown and newlines).
 * @param {array.<string>|null} labels Array of label names the created issue should be tagged with.
 * @returns {Promise.<string, Error>} A promise that resolves to the issue URL, or rejects with an error.
 */
module.exports = async function createIssue(title, body, labels = []) {
  const repository = process.env.NODE_ENV === `production` ? `open-fixture-library` : `ofl-test`;

  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error(`.env file does not contain GITHUB_USER_TOKEN variable`);
    throw new Error(`GitHub user token was not set`);
  }

  githubClient.authenticate({
    type: `token`,
    token: userToken
  });

  const result = await githubClient.issues.create({
    owner: `OpenLightingProject`,
    repo: repository,
    title: title,
    body: body,
    labels: labels
  });

  return result.data.html_url;
};
