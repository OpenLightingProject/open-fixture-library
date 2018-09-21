const fixtureJsonStringify = require(`./fixture-json-stringify.js`);
const { Register, getObjectSortedByKeys } = require(`./register.js`);

require(`./load-env-file.js`);

const githubClient = new require(`@octokit/rest`)();

/**
 * @typedef importPluginReturn
 * @type {object}
 * @property {object} manufacturers like in manufacturers.json
 * @property {object} fixtures Object keys are of the form 'manufacturerKey/fixtureKey', the value is like in fixture JSON files.
 * @property {string|null} submitter GitHub user name of the fixture submitter.
 */

/**
 * @param {importPluginReturn} out The object like returned by an import plugin.
 * @returns {Promise<string, Error>} A promise that resolves to the pull request URL, or rejects with an error.
 */
module.exports = function createPullRequest(out) {
  const repository = process.env.NODE_ENV === `production` ? `open-fixture-library` : `ofl-test`;

  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error(`.env file does not contain GITHUB_USER_TOKEN variable`);
    return Promise.reject(new Error(`GitHub user token was not set`));
  }

  let pullRequestUrl;

  const timestamp = new Date().toISOString().replace(/:/g, `-`).replace(/\..+/, ``);
  const branchName = `branch${timestamp}`;

  const changedFiles = [];
  const warnings = [];

  githubClient.authenticate({
    type: `token`,
    token: userToken
  });


  console.log(`get latest commit hash ...`);
  return githubClient.gitdata.getReference({
    owner: `OpenLightingProject`,
    repo: repository,
    ref: `heads/master`
  })
    .then(result => {
      const latestCommitHash = result.data.object.sha;
      console.log(latestCommitHash);

      console.log(`create new branch '${branchName}' ...`);
      return githubClient.gitdata.createReference({
        owner: `OpenLightingProject`,
        repo: repository,
        ref: `refs/heads/${branchName}`,
        sha: latestCommitHash
      });
    })
    .then(() => {
      console.log(`done`);

      return addOrUpdateFile(`fixtures/manufacturers.json`, `manufacturers.json`, oldFileContent => {
        if (oldFileContent == null) {
          return prettyJsonStringify(out.manufacturers);
        }

        out.manufacturers = Object.assign({}, JSON.parse(oldFileContent), out.manufacturers);
        delete out.manufacturers.$schema;

        return prettyJsonStringify(getObjectSortedByKeys(out.manufacturers));
      }, true);
    })
    .then(() => {
      let chain = Promise.resolve();

      for (const fixtureKey of Object.keys(out.fixtures)) {
        chain = chain.then(() => addOrUpdateFile(
          `fixtures/${fixtureKey}.json`,
          `fixture '${fixtureKey}'`,
          oldFileContent => fixtureJsonStringify(out.fixtures[fixtureKey]),
          true
        ));
      }

      return chain;
    })
    .then(() => addOrUpdateFile(`fixtures/register.json`, `register.json`, oldFileContent => {
      const oldRegister = oldFileContent !== null ? JSON.parse(oldFileContent) : null;
      const register = new Register(out.manufacturers, oldRegister);

      // add new manufacturer RDM IDs to register
      Object.keys(out.manufacturers).forEach(manKey => {
        register.addManufacturer(manKey, out.manufacturers[manKey]);
      });

      // add new fixtures to register
      Object.keys(out.fixtures).forEach(fixtureKey => {
        const [manKey, fixKey] = fixtureKey.split(`/`);
        const fixData = out.fixtures[fixtureKey];
        register.addFixture(manKey, fixKey, fixData);
      });

      return prettyJsonStringify(register.getAsSortedObject());
    }))
    .then(() => {
      console.log(`create pull request ...`);

      const addedFixtures = changedFiles.filter(line => line.startsWith(`Add fixture`));
      let title = `Add ${addedFixtures.length} new fixtures`;
      if (addedFixtures.length === 1) {
        title = addedFixtures[0];
      }

      let body = changedFiles.map(line => `* ${line}`).join(`\n`);

      if (warnings.length > 0) {
        body += `\n\n### Warnings:\n* ${warnings.join(`\n* `)}`;
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

      return githubClient.pullRequests.create({
        owner: `OpenLightingProject`,
        repo: repository,
        title: title,
        body: body,
        head: branchName,
        base: `master`
      });
    })
    .then(result => {
      console.log(`done`);
      pullRequestUrl = result.data.html_url;

      console.log(`add labels to pull request ...`);
      return githubClient.issues.addLabels({
        owner: `OpenLightingProject`,
        repo: repository,
        number: result.data.number,
        labels: [`new-fixture`, `via-editor`]
      });
    })
    .then(() => {
      console.log(`done`);
      console.log(`View the pull request at ${pullRequestUrl}`);
      return pullRequestUrl;
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
      return Promise.reject(error);
    });


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
  function addOrUpdateFile(filename, displayName, newContentFunction, excludeFromCi = false) {
    console.log(`does ${displayName} exist?`);

    const appendToCommitMessage = excludeFromCi ? `\n\n[skip ci]` : ``;

    return githubClient.repos.getContent({
      owner: `OpenLightingProject`,
      repo: repository,
      path: filename
    })
      .then(result => {
        console.log(`yes -> update it ...`);

        const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString(`utf8`);
        const newFileContent = newContentFunction(oldFileContent);

        if (oldFileContent === newFileContent) {
          console.log(`no need to update, files are the same`);
          return Promise.resolve();
        }

        return githubClient.repos.updateFile({
          owner: `OpenLightingProject`,
          repo: repository,
          path: filename,
          message: `Update ${displayName} via editor${appendToCommitMessage}`,
          content: encodeBase64(newFileContent),
          sha: result.data.sha,
          branch: branchName
        })
          .then(() => {
            console.log(`done`);
            changedFiles.push(`Update ${displayName}`);
          })
          .catch(error => {
            console.error(`Error updating ${displayName}: ${error.message}`);
            warnings.push(`* Error updating ${displayName}: \`${error.message}\``);
          });
      })
      .catch(error => {
        console.log(`no -> create it ...`);
        return githubClient.repos.createFile({
          owner: `OpenLightingProject`,
          repo: repository,
          path: filename,
          message: `Add ${displayName} via editor${appendToCommitMessage}`,
          content: encodeBase64(newContentFunction(null)),
          branch: branchName
        })
          .then(() => {
            console.log(`done`);
            changedFiles.push(`Add ${displayName}`);
          })
          .catch(error => {
            console.error(`Error adding ${displayName}: ${error.message}`);
            warnings.push(`* Error adding ${displayName}: \`${error.message}\``);
          });
      });
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
 * @param {object} obj JSON object.
 * @returns {string} String representing the given object.
 */
function prettyJsonStringify(obj) {
  const str = JSON.stringify(obj, null, 2);

  return `${str}\n`;
}


