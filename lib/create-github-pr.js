import './load-env-file.js';

import { Octokit } from '@octokit/rest';

import fixtureJsonStringify from './fixture-json-stringify.js';
import { getObjectSortedByKeys } from './register.js';

/** @typedef {import('./types.js').FixtureCreateResult} FixtureCreateResult */

const repository = process.env.NODE_ENV === `production` ? `open-fixture-library` : `ofl-test`;

/** @type {string} */
let branchName;

/** @type {string[]} */
let changedFiles;

/** @type {string[]} */
let githubErrors;

/** @type {Octokit} */
let githubClient;

/**
 * @param {FixtureCreateResult} fixtureCreateResult The object like returned by an import plugin.
 * @param {string | null} [githubUsername=null] GitHub user name of the fixture submitter.
 * @param {string | null} [githubComment=null] Additional comment for the pull request.
 * @returns {Promise<string, Error>} A promise that resolves to the pull request URL, or rejects with an error.
 */
export default async function createPullRequest(fixtureCreateResult, githubUsername = null, githubComment = null) {
  const {
    manufacturers,
    fixtures,
    warnings,
    errors,
  } = fixtureCreateResult;

  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error(`.env file does not contain GITHUB_USER_TOKEN variable`);
    throw new Error(`GitHub user token was not set`);
  }

  const timestamp = new Date().toISOString().replaceAll(`:`, `-`).replace(/\..+/, ``);
  branchName = `branch${timestamp}`;

  changedFiles = [];
  githubErrors = [];

  githubClient = new Octokit({
    auth: `token ${userToken}`,
  });

  try {
    console.log(`get latest commit hash ...`);
    const latestCommitRef = await githubClient.rest.git.getRef({
      owner: `OpenLightingProject`,
      repo: repository,
      ref: `heads/master`,
    });
    const latestCommitHash = latestCommitRef.data.object.sha;
    console.log(latestCommitHash);

    console.log(`create new branch '${branchName}' ...`);
    await githubClient.rest.git.createRef({
      owner: `OpenLightingProject`,
      repo: repository,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitHash,
    });
    console.log(`done`);

    const user = await getGithubUserInfo(githubUsername);

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
        `fixture \`${fixtureKey}\``,
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

    const fixtureWarningsErrorsMarkdown = getFixtureWarningsErrorsMarkdownList(fixtures, errors, warnings);
    const submitterNameMarkdown = getSubmitterNameMarkdown(user, githubUsername, fixtures);

    const result = await githubClient.rest.pulls.create({
      owner: `OpenLightingProject`,
      repo: repository,
      title,
      body: getPrDescriptionMarkdown(submitterNameMarkdown, fixtureWarningsErrorsMarkdown, githubComment),
      head: branchName,
      base: `master`,
      draft: true,
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
}


/**
 * @param {string | null} username The passed GitHub username.
 * @returns {object | null} GitHub user information about the submitter, or null if it is not a valid GitHub user.
 */
async function getGithubUserInfo(username) {
  if (!username) {
    return null;
  }

  console.log(`get info for GitHub user @${username} ...`);

  try {
    const { data: user } = await githubClient.rest.users.getByUsername({ username });
    console.log(`done (name: ${user.name}, email: ${user.email})`);
    return user;
  }
  catch {
    console.log(`error getting user`);
    return null;
  }
}


/**
 * @param {string} submitterNameMarkdown The Markdown to display the submitter's name.
 * @param {string} fixtureWarningsErrorsMarkdown A Markdown list of all fixture warnings and errors. May be empty
 * @param {string} githubComment Additional comment for the pull request.
 * @returns {string} The pull request description body markdown.
 */
function getPrDescriptionMarkdown(submitterNameMarkdown, fixtureWarningsErrorsMarkdown, githubComment) {
  let body = changedFiles.map(line => `* ${line}`).join(`\n`);

  if (githubErrors.length > 0) {
    const githubErrorList = githubErrors.map(error => `* ⚠️ ${error}`).join(`\n`);
    body += `\n\n### Errors:\n${githubErrorList}`;
  }

  if (fixtureWarningsErrorsMarkdown.length > 0) {
    body += `\n\n### Fixture warnings / errors\n\n`;
    body += fixtureWarningsErrorsMarkdown;
  }

  if (githubComment) {
    body += `\n\n### User comment\n\n`;
    body += githubComment;
  }

  body += `\n\nThank you ${submitterNameMarkdown}!`;

  return body;
}


/**
 * @param {Record<string, any>} fixtures The fixtures to add to the pull request.
 * @param {Record<string, any>} errors The errors to add to the pull request.
 * @param {Record<string, any>} warnings The warnings to add to the pull request.
 * @returns {string} A Markdown list of all fixture warnings and errors.
 */
function getFixtureWarningsErrorsMarkdownList(fixtures, errors, warnings) {
  let markdownList = ``;

  for (const fixtureKey of Object.keys(fixtures)) {
    const fixtureErrors = errors[fixtureKey] || [];
    const fixtureWarnings = warnings[fixtureKey] || [];

    const messages = [
      ...fixtureErrors.map(error => `  - ❌ ${error}`),
      ...fixtureWarnings.map(warning => `  - ⚠️ ${warning}`),
    ].join(`\n`);

    if (messages.length > 0) {
      markdownList += `* ${fixtureKey}\n${messages}\n`;
    }
  }

  return markdownList;
}


/**
 * @param {object | null} user GitHub user information about the submitter, or null if they are not a GitHub user.
 * @param {string} githubUsername The passed GitHub username.
 * @param {Record<string, any>} fixtures The fixtures to add to the pull request.
 * @returns {string} The submitter of the fixture(s), or the first author of the first fixture.
 */
function getSubmitterNameMarkdown(user, githubUsername, fixtures) {
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
 * @param {string | null} oldFileContent The text content of the old file, or null if it has not existed yet.
 * @returns {string} The new file text content.
 */

/**
 * @param {string} filename The path of the file (relative to the repository root) to add or update.
 * @param {string} displayName A shorter file name to display in commit messages and PR body.
 * @param {newContentFunction} newContentFunction The callback to get the new file content from.
 * @param {object | null} user GitHub user information about the submitter, or null if they are not a GitHub user.
 * @param {boolean} [excludeFromCi=false] True if this commit should be excluded from the CI (continuous integration tests).
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


/**
 * @param {string} string The string to encode in base 64.
 * @returns {string} The encoded string.
 */
function encodeBase64(string) {
  return Buffer.from(string).toString(`base64`);
}

/**
 * JSON.stringify with an extra newline character at the end.
 * @param {object} object JSON object.
 * @returns {string} String representing the given object.
 */
function prettyJsonStringify(object) {
  const string = JSON.stringify(object, null, 2);

  return `${string}\n`;
}
