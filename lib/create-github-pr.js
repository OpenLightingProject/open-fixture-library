const fixtureJsonStringify = require(`./fixture-json-stringify.js`);
const { getObjectSortedByKeys } = require(`./register.js`);

require(`./load-env-file.js`);

const Octokit = require(`@octokit/rest`);

/**
 * @typedef importPluginReturn
 * @type {Object}
 * @property {Object} manufacturers like in manufacturers.json
 * @property {Object} fixtures Object keys are of the form 'manufacturerKey/fixtureKey', the value is like in fixture JSON files.
 * @property {string|null} submitter GitHub user name of the fixture submitter.
 */

/**
 * @param {importPluginReturn} out The object like returned by an import plugin.
 * @returns {Promise.<string, Error>} A promise that resolves to the pull request URL, or rejects with an error.
 */
module.exports = async function createPullRequest(out) {
  const repository = process.env.NODE_ENV === `production` ? `open-fixture-library` : `ofl-test`;

  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error(`.env file does not contain GITHUB_USER_TOKEN variable`);
    throw new Error(`GitHub user token was not set`);
  }

  const timestamp = new Date().toISOString().replace(/:/g, `-`).replace(/\..+/, ``);
  const branchName = `branch${timestamp}`;

  const changedFiles = [];
  const warnings = [];

  const githubClient = new Octokit({
    auth: `token ${userToken}`
  });

  try {
    console.log(`get latest commit hash ...`);
    const latestCommitHash = (await githubClient.gitdata.getRef({
      owner: `OpenLightingProject`,
      repo: repository,
      ref: `heads/master`
    })).data.object.sha;
    console.log(latestCommitHash);

    console.log(`create new branch '${branchName}' ...`);
    await githubClient.gitdata.createRef({
      owner: `OpenLightingProject`,
      repo: repository,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitHash
    });
    console.log(`done`);

    const skipCi = Object.keys(out.fixtures).length > 0;
    await addOrUpdateFile(`fixtures/manufacturers.json`, `manufacturers.json`, oldFileContent => {
      const manufacturers = Object.assign(
        oldFileContent ? JSON.parse(oldFileContent) : {
          $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json`
        },
        out.manufacturers
      );

      // save all manufacturers for later
      out.manufacturers = JSON.parse(JSON.stringify(manufacturers));
      delete out.manufacturers.$schema;

      return prettyJsonStringify(getObjectSortedByKeys(manufacturers));
    }, skipCi);


    const fixtures = Object.entries(out.fixtures);
    let index = 0;
    for (const [fixtureKey, fixture] of fixtures) {
      await addOrUpdateFile(
        `fixtures/${fixtureKey}.json`,
        `fixture '${fixtureKey}'`,
        oldFileContent => fixtureJsonStringify(fixture),
        index !== fixtures.length - 1 // all but the last fixture should skip CI
      );
      index++;
    }

    console.log(`create pull request ...`);

    const addedFixtures = changedFiles.filter(line => line.startsWith(`Add fixture`));
    let title = `Add ${addedFixtures.length} new fixtures`;
    if (addedFixtures.length === 1) {
      title = addedFixtures[0];
    }

    const result = await githubClient.pullRequests.create({
      owner: `OpenLightingProject`,
      repo: repository,
      title: title,
      body: getPrDescriptionMarkdown(),
      head: branchName,
      base: `master`
    });
    console.log(`done`);

    console.log(`add labels to pull request ...`);
    await githubClient.issues.addLabels({
      owner: `OpenLightingProject`,
      repo: repository,
      number: result.data.number,
      labels: [`new-fixture`, `via-editor`]
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
   * @returns {string} The pull request description body markdown.
   */
  function getPrDescriptionMarkdown() {
    let body = changedFiles.map(line => `* ${line}`).join(`\n`);

    if (warnings.length > 0) {
      body += `\n\n### Warnings:\n* :warning: ${warnings.join(`\n* :warning: `)}`;
    }

    const fixtureWarningsErrors = getFixtureWarningsErrorsMarkdownList();
    if (fixtureWarningsErrors.length) {
      body += `\n\n### Fixture warnings / errors\n\n`;
      body += fixtureWarningsErrors;
    }

    if (out.comment) {
      body += `\n\n### User comment\n\n`;
      body += out.comment;
    }

    body += `\n\nThank you ${getSubmitterNameMarkdown()}!`;

    return body;
  }


  /**
   * @returns {string} A Markdown list of all fixture warnings and errors.
   */
  function getFixtureWarningsErrorsMarkdownList() {
    let markdownList = ``;

    if (!(`errors` in out)) {
      out.errors = {};
    }
    if (!(`warnings` in out)) {
      out.warnings = {};
    }

    for (const fixtureKey of Object.keys(out.fixtures)) {
      const fixtureErrors = out.errors[fixtureKey] || [];
      const fixtureWarnings = out.warnings[fixtureKey] || [];

      const messages = fixtureErrors.map(
        error => `  - :x: ${error}`
      ).concat(fixtureWarnings.map(
        warning => `  - :warning: ${warning}`
      ));

      if (messages.length) {
        markdownList += `* ${fixtureKey}\n${messages.join(`\n`)}\n`;
      }
    }

    return markdownList;
  }

  /**
   * @returns {string} The submitter of the fixture(s), or the first author of the first fixture.
   */
  function getSubmitterNameMarkdown() {
    if (out.submitter) {
      return /^[a-zA-Z0-9]+$/.test(out.submitter) ? `@${out.submitter}` : `**${out.submitter}**`;
    }

    const firstFixtureKey = Object.keys(out.fixtures)[0];
    const firstFixtureAuthor = out.fixtures[firstFixtureKey].meta.authors[0];

    return `**${firstFixtureAuthor}**`;
  }


  /**
   * @callback newContentFunction
   * @param {string|null} oldFileContent The text content of the old file, or null if it has not existed yet.
   * @return {string} The new file text content.
   */

  /**
   * @param {string} filename The path of the file (relative to the repository root) to add or update.
   * @param {string} displayName A shorter file name to display in commit messages and PR body.
   * @param {newContentFunction} newContentFunction The callback to get the new file content from.
   * @param {boolean} [excludeFromCi=false] True if this commit should be excluded from the CI (continuous integration tests).
   * @returns {Promise} Promise that is resolved when the file is successfully / erroneously updated / added.
   */
  async function addOrUpdateFile(filename, displayName, newContentFunction, excludeFromCi = false) {
    console.log(`does ${displayName} exist?`);

    const appendToCommitMessage = excludeFromCi ? `\n\n[skip ci]` : ``;

    try {
      const result = await githubClient.repos.getContents({
        owner: `OpenLightingProject`,
        repo: repository,
        path: filename
      });

      console.log(`yes -> update it ...`);

      const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString(`utf8`);
      const newFileContent = newContentFunction(oldFileContent);

      if (oldFileContent === newFileContent) {
        console.log(`no need to update, files are the same`);
        return;
      }

      try {
        await githubClient.repos.updateFile({
          owner: `OpenLightingProject`,
          repo: repository,
          path: filename,
          message: `Update ${displayName} via editor${appendToCommitMessage}`,
          content: encodeBase64(newFileContent),
          sha: result.data.sha,
          branch: branchName
        });

        console.log(`done`);
        changedFiles.push(`Update ${displayName}`);
      }
      catch (error) {
        console.error(`Error updating ${displayName}: ${error.message}`);
        warnings.push(`Error updating ${displayName}: \`${error.message}\``);
      }
    }
    catch (error) {
      console.log(`no -> create it ...`);

      try {
        await githubClient.repos.createFile({
          owner: `OpenLightingProject`,
          repo: repository,
          path: filename,
          message: `Add ${displayName} via editor${appendToCommitMessage}`,
          content: encodeBase64(newContentFunction(null)),
          branch: branchName
        });

        console.log(`done`);
        changedFiles.push(`Add ${displayName}`);
      }
      catch (error) {
        console.error(`Error adding ${displayName}: ${error.message}`);
        warnings.push(`Error adding ${displayName}: \`${error.message}\``);
      }
    }
  }
};


/**
 * @param {string} string The string to encode in base 64.
 * @returns {string} The encoded string.
 */
function encodeBase64(string) {
  return Buffer.from(string).toString(`base64`);
}

/**
 * JSON.stringify with an extra newline character at the end.
 * @param {Object} obj JSON object.
 * @returns {string} String representing the given object.
 */
function prettyJsonStringify(obj) {
  const str = JSON.stringify(obj, null, 2);

  return `${str}\n`;
}


