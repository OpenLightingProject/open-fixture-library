const Octokit = require(`@octokit/rest`);

require(`../../lib/load-env-file.js`);

const requiredEnvVars = [
  `GITHUB_USER_TOKEN`,
  `TRAVIS_REPO_SLUG`,
  `TRAVIS_PULL_REQUEST`,
  `TRAVIS_BRANCH`,
  `TRAVIS_COMMIT`
];

let githubClient;

let repoOwner;
let repoName;
let prData;

/**
 * Checks if the environment variables for GitHub operations are correct.
 * @returns {Promise} Rejects an error message if the environment is not correct.
 */
module.exports.checkEnv = async function checkEnv() {
  for (const envVar of requiredEnvVars) {
    if (!(envVar in process.env)) {
      throw `Environment variable ${envVar} is required for this script. Please define it in your system or in the .env file.`;
    }
  }

  if (process.env.TRAVIS_PULL_REQUEST === `false`) {
    throw `Github tests can only be run in pull request builds.`;
  }
};

module.exports.init = async function init() {
  await module.exports.checkEnv();

  repoOwner = process.env.TRAVIS_REPO_SLUG.split(`/`)[0];
  repoName = process.env.TRAVIS_REPO_SLUG.split(`/`)[1];

  githubClient = new Octokit({
    auth: `token ${process.env.GITHUB_USER_TOKEN}`
  });

  const pr = await githubClient.pullRequests.get({
    owner: repoOwner,
    repo: repoName,
    'pull_number': process.env.TRAVIS_PULL_REQUEST
  });

  // save PR for later use
  prData = pr.data;

  return pr.data;
};

module.exports.fetchChangedComponents = async function fetchChangedComponents() {
  // fetch changed files in 100er blocks
  const filePromises = [];
  for (let i = 0; i < this.data.changed_files / 100; i++) {
    filePromises.push(githubClient.pullRequests.listFiles({
      owner: repoOwner,
      repo: repoName,
      'pull_number': process.env.TRAVIS_PULL_REQUEST,
      'per_page': 100,
      page: i + 1
    }));
  }

  // check which model components, plugins and fixtures have been changed in the PR
  const fileBlocks = await Promise.all(filePromises);

  const changedComponents = {
    added: {
      schema: false,
      model: false,
      imports: [], // array of plugin keys
      exports: [], // array of plugin keys
      exportTests: [], // array of [plugin key, test key]
      fixtures: [] // array of [man key, fix key]
    },
    modified: {
      schema: false,
      model: false,
      imports: [], // array of plugin keys
      exports: [], // array of plugin keys
      exportTests: [], // array of [plugin key, test key]
      fixtures: [] // array of [man key, fix key]
    },
    removed: {
      schema: false,
      model: false,
      imports: [], // array of plugin keys
      exports: [], // array of plugin keys
      exportTests: [], // array of [plugin key, test key]
      fixtures: [] // array of [man key, fix key]
    }
  };

  for (const block of fileBlocks) {
    block.data.forEach(handleFileData);
  }

  return changedComponents;

  /**
   * Forwards the file's status and path to handleFile(...) with the specialty of splitting renamed files into added/removed.
   * @param {object} fileData The file object from GitHub.
   */
  function handleFileData(fileData) {
    if (fileData.status === `renamed`) {
      // Handling renamed files would be a bit tricky, as we also had to store the previous filename.
      // That's why we simply treat the old file name as removed and the new one as added.
      handleFile(`added`, fileData.filename);
      handleFile(`removed`, fileData.previous_filename);
    }
    else {
      handleFile(fileData.status, fileData.filename);
    }
  }

  /**
   * Parse the file type by its path and update the change summary of the file's status accordingly.
   * @param {'added'|'removed'|'modified'} fileStatus What happened with the file in this pull request.
   * @param {string} filePath The file name, relative to the repository's root.
   */
  function handleFile(fileStatus, filePath) {
    const changeSummary = changedComponents[fileStatus];
    const segments = filePath.split(`/`);

    if (segments[0] === `lib` && segments[1] === `model`) {
      changeSummary.model = true;
      return;
    }

    if (segments[0] === `plugins` && segments[2] === `import.js`) {
      changeSummary.imports.push(segments[1]); // plugin key
      return;
    }

    if (segments[0] === `plugins` && segments[2] === `export.js`) {
      changeSummary.exports.push(segments[1]); // plugin key
      return;
    }

    if (segments[0] === `plugins` && segments[2] === `exportTests`) {
      changeSummary.exportTests.push([
        segments[1], // plugin key
        segments[3].split(`.`)[0] // test key
      ]);
      return;
    }

    if (segments[0] === `schemas`) {
      changeSummary.schema = true;
      return;
    }

    if (segments[0] === `fixtures` && segments.length === 3) {
      changeSummary.fixtures.push([
        segments[1], // man key
        segments[2].split(`.`)[0] // fix key
      ]);
    }
  }
};

/**
 * Creates a new comment in the PR if test.lines is not empty and if there is not already an exactly equal comment.
 * Deletes old comments from the same test (determined by test.filename).
 * @param {object} test Information about the test script that wants to update the comment.
 * @param {string} test.filename Relative path from OFL root dir to test file: 'tests/github/test-file-name.js'
 * @param {string} test.name Heading to be used in the comment
 * @param {array.<string>} test.lines The comment's lines of text
 * @returns {Promise} A Promise that is fulfilled as soon as all GitHub operations have finished
 */
module.exports.updateComment = async function updateComment(test) {
  let lines = [
    `<!-- GITHUB-TEST: ${test.filename} -->`,
    `# ${test.name}`,
    `(Output of test script \`${test.filename}\`.)`,
    ``
  ];
  lines = lines.concat(test.lines);
  const message = lines.join(`\n`);

  const commentPromises = [];
  for (let i = 0; i < prData.comments / 100; i++) {
    commentPromises.push(
      githubClient.issues.listComments({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        'per_page': 100,
        page: i + 1
      })
    );
  }

  const commentBlocks = await Promise.all(commentPromises);

  let equalFound = false;
  const promises = [];

  const comments = [].concat(...commentBlocks.map(block => block.data));
  comments.forEach(comment => {
    // get rid of \r linebreaks
    comment.body = comment.body.replace(/\r/g, ``);

    // the comment was created by this test script
    if (lines[0] === comment.body.split(`\n`)[0]) {
      if (!equalFound && message === comment.body && test.lines.length > 0) {
        equalFound = true;
        console.log(`Test comment with same content already exists at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}.`);
      }
      else {
        console.log(`Deleting old test comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}.`);
        promises.push(githubClient.issues.deleteComment({
          owner: repoOwner,
          repo: repoName,
          'comment_id': comment.id
        }));
      }
    }
  });

  if (!equalFound && test.lines.length > 0) {
    console.log(`Creating test comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}.`);
    promises.push(githubClient.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST,
      body: message
    }));
  }

  return await Promise.all(promises);
};

module.exports.getTestFixturesMessage = function getTestFixturesMessage(fixtures) {
  let lines = [];
  lines.push(`Tested with the following minimal collection of [test fixtures](https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/fixture-features.md) that cover all fixture features:`);
  lines = lines.concat(fixtures.map(fix => `- ${fix}`), ``);
  return lines;
};
