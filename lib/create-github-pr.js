import { Octokit } from '@octokit/rest';

import fixtureJsonStringify from './fixture-json-stringify.js';
import { getObjectSortedByKeys } from './register.js';

import './load-env-file.js';

/** @typedef {import('./types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * @param {FixtureCreateResult} fixtureCreateResult The object like returned by an import plugin.
 * @param {String|null} [githubUsername=null] GitHub user name of the fixture submitter.
 * @param {String|null} [githubComment=null] Additional comment for the pull request.
 * @returns {Promise.<String, Error>} A promise that resolves to the pull request URL, or rejects with an error.
 */
export default async function createPullRequest(fixtureCreateResult, githubUsername = null, githubComment = null) {
  const {
    manufacturers,
    fixtures,
    warnings,
    errors,
  } = fixtureCreateResult;

  const repository = process.env.NODE_ENV === `production` ? `open-fixture-library` : `ofl-test`;

  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error(`.env file does not contain GITHUB_USER_TOKEN variable`);
    throw new Error(`GitHub user token was not set`);
  }

  const timestamp = new Date().toISOString().replace(/:/g, `-`).replace(/\..+/, ``);
  const branchName = `branch${timestamp}`;

  const changedFiles = [];
  const githubErrors = [];

  const githubClient = new Octokit({
    auth: `token ${userToken}`,
  });

  try {
    console.log(`get latest commit hash ...`);
    const latestCommitHash = (await githubClient.rest.git.getRef({
      owner: `OpenLightingProject`,
      repo: repository,
      ref: `heads/master`,
    })).data.object.sha;
    console.log(latestCommitHash);

    console.log(`create new branch '${branchName}' ...`);
    await githubClient.rest.git.createRef({
      owner: `OpenLightingProject`,
      repo: repository,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitHash,
    });
    console.log(`done`);

    const user = await getGithubUserInfo();

    const skipCi = Object.keys(fixtures).length > 0;
    await addOrUpdateFile(`fixtures/manufacturers.json`, `manufacturers.json`, oldFileContent => {
      const mergedManufacturers = Object.assign(
        oldFileContent ? JSON.parse(oldFileContent) : {
          $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json`,
        },
        manufacturers,
      );

      return prettyJsonStringify(getObjectSortedByKeys(mergedManufacturers));
    }, user, skipCi);


    const fixtureEntries = Object.entries(fixtures);
    let index = 0;
    for (const [fixtureKey, fixture] of fixtureEntries) {
      await addOrUpdateFile(
        `fixtures/${fixtureKey}.json`,
        `fixture '${fixtureKey}'`,
        oldFileContent => fixtureJsonStringify(fixture),
        user,
        index !== fixtureEntries.length - 1, // all but the last fixture should skip CI
      );
      index++;
    }

    console.log(`create pull request ...`);

    const addedFixtures = changedFiles.filter(line => line.startsWith(`Add fixture`));
    let title = `Add ${addedFixtures.length} new fixtures`;
    if (addedFixtures.length === 1) {
      title = addedFixtures[0];
    }

    const result = await githubClient.rest.pulls.create({
      owner: `OpenLightingProject`,
      repo: repository,
      title,
      body: getPrDescriptionMarkdown(user),
      head: branchName,
      base: `master`,
    });
    console.log(`done`);

    console.log(`add labels to pull request ...`);
    await githubClient.rest.issues.addLabels({
      owner: `OpenLightingProject`,
      repo: repository,
      'issue_number': result.data.number,
      labels: [`new-fixture`, `via-editor`],
    });
    console.log(`done`);

    const pullRequestUrl = result.data.html_url;
    console.log(`View the pull request at ${pullRequestUrl}`);

    return pullRequestUrl;
  }
  catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }


  /**
   * @returns {Object|null} GitHub user information about the submitter, or null if it is not a valid GitHub user.
   */
  async function getGithubUserInfo() {
    if (!githubUsername) {
      return null;
    }

    console.log(`get info for GitHub user @${githubUsername} ...`);

    try {
      const user = (await githubClient.rest.users.getByUsername({
        username: githubUsername,
      })).data;

      console.log(`done (name: ${user.name}, email: ${user.email})`);
      return user;
    }
    catch {
      console.log(`error getting user`);
      return null;
    }
  }

  /**
   * @param {Object|null} user GitHub user information about the submitter, or null if they are not a GitHub user.
   * @returns {String} The pull request description body markdown.
   */
  function getPrDescriptionMarkdown(user) {
    let body = changedFiles.map(line => `* ${line}`).join(`\n`);

    if (githubErrors.length > 0) {
      body += `\n\n### Errors:\n* :warning: ${githubErrors.join(`\n* :warning: `)}`;
    }

    const fixtureWarningsErrors = getFixtureWarningsErrorsMarkdownList();
    if (fixtureWarningsErrors.length > 0) {
      body += `\n\n### Fixture warnings / errors\n\n`;
      body += fixtureWarningsErrors;
    }

    if (githubComment) {
      body += `\n\n### User comment\n\n`;
      body += githubComment;
    }

    body += `\n\nThank you ${getSubmitterNameMarkdown(user)}!`;

    return body;
  }


  /**
   * @returns {String} A Markdown list of all fixture warnings and errors.
   */
  function getFixtureWarningsErrorsMarkdownList() {
    let markdownList = ``;

    for (const fixtureKey of Object.keys(fixtures)) {
      const fixtureErrors = errors[fixtureKey] || [];
      const fixtureWarnings = warnings[fixtureKey] || [];

      const messages = fixtureErrors.map(
        error => `  - :x: ${error}`,
      ).concat(fixtureWarnings.map(
        warning => `  - :warning: ${warning}`,
      ));

      if (messages.length > 0) {
        markdownList += `* ${fixtureKey}\n${messages.join(`\n`)}\n`;
      }
    }

    return markdownList;
  }

  /**
   * @param {Object|null} user GitHub user information about the submitter, or null if they are not a GitHub user.
   * @returns {String} The submitter of the fixture(s), or the first author of the first fixture.
   */
  function getSubmitterNameMarkdown(user) {
    if (user) {
      return `@${user.login}`;
    }

    if (githubUsername) {
      return `**${githubUsername}**`;
    }

    return Object.values(fixtures)
      .flatMap(fixture => fixture.meta.authors)
      .filter((author, index, list) => list.indexOf(author) === index) // filter out duplicates
      .map(author => `**${author}**`)
      .join(` and `);
  }


  /**
   * @callback newContentFunction
   * @param {String|null} oldFileContent The text content of the old file, or null if it has not existed yet.
   * @returns {String} The new file text content.
   */

  /**
   * @param {String} filename The path of the file (relative to the repository root) to add or update.
   * @param {String} displayName A shorter file name to display in commit messages and PR body.
   * @param {newContentFunction} newContentFunction The callback to get the new file content from.
   * @param {Object|null} user GitHub user information about the submitter, or null if they are not a GitHub user.
   * @param {Boolean} [excludeFromCi=false] True if this commit should be excluded from the CI (continuous integration tests).
   * @returns {Promise} Promise that is resolved when the file is successfully / erroneously updated / added.
   */
  async function addOrUpdateFile(filename, displayName, newContentFunction, user, excludeFromCi = false) {
    const appendToCommitMessage = excludeFromCi ? `\n\n[skip ci]` : ``;

    let action;
    let sha;
    let newFileContent;

    console.log(`does ${displayName} exist?`);

    try {
      const result = await githubClient.rest.repos.getContent({
        owner: `OpenLightingProject`,
        repo: repository,
        path: filename,
      });

      console.log(`yes -> update it ...`);

      const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString(`utf8`);
      newFileContent = newContentFunction(oldFileContent);

      if (oldFileContent === newFileContent) {
        console.log(`no need to update, files are the same`);
        return;
      }

      action = `Update`;
      sha = result.data.sha;
    }
    catch {
      console.log(`no -> create it ...`);
      action = `Add`;
      newFileContent = newContentFunction(null);
    }

    const committer = user && user.email ? {
      name: user.name,
      email: user.email,
    } : undefined;

    try {
      await githubClient.rest.repos.createOrUpdateFileContents({
        owner: `OpenLightingProject`,
        repo: repository,
        path: filename,
        message: `${action} ${displayName} via editor${appendToCommitMessage}`,
        content: encodeBase64(newFileContent),
        sha,
        branch: branchName,
        committer,
      });

      console.log(`done`);
      changedFiles.push(`${action} ${displayName}`);
    }
    catch (error) {
      console.error(`Error (${action.toLowerCase()} ${displayName}): ${error.message}`);
      githubErrors.push(`Error (${action.toLowerCase()} ${displayName}): \`${error.message}\``);
    }
  }
}


/**
 * @param {String} string The string to encode in base 64.
 * @returns {String} The encoded string.
 */
function encodeBase64(string) {
  return Buffer.from(string).toString(`base64`);
}

/**
 * JSON.stringify with an extra newline character at the end.
 * @param {Object} object JSON object.
 * @returns {String} String representing the given object.
 */
function prettyJsonStringify(object) {
  const string = JSON.stringify(object, null, 2);

  return `${string}\n`;
}
