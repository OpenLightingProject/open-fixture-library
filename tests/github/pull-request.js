const fs = require('fs');
const path = require('path');
const env = require('node-env-file');
const GitHubApi = require('github');

// load any undefined environment variables and complain about missing ones
const envFile = path.join(__dirname, '../../.env');
if (fs.existsSync(envFile)) {
  env(envFile);
}
const requiredEnvVars = [
  'GITHUB_USER_TOKEN',
  'TRAVIS_REPO_SLUG',
  'TRAVIS_PULL_REQUEST',
  'TRAVIS_BRANCH',
  'TRAVIS_COMMIT'
];

const github = new GitHubApi({
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'Open Fixture Library'
  },
  followRedirects: false,
  timeout: 5000
});

let repoOwner;
let repoName;

module.exports.checkEnv = function checkEnv() {
  return new Promise((resolve, reject) => {
    for (const envVar of requiredEnvVars) {
      if (!(envVar in process.env)) {
        reject(`Environment variable ${envVar} is required for this script. Please define it in your system or in the .env file.`);
        return;
      }
    }

    if (process.env.TRAVIS_PULL_REQUEST === 'false') {
      reject('Github tests can only be run in pull request builds.');
      return;
    }
    resolve();
  });
};

module.exports.init = function init() {
  return module.exports.checkEnv().then(() => {
    repoOwner = process.env.TRAVIS_REPO_SLUG.split('/')[0];
    repoName = process.env.TRAVIS_REPO_SLUG.split('/')[1];

    github.authenticate({
      type: 'token',
      token: process.env.GITHUB_USER_TOKEN
    });

    return github.pullRequests.get({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST
    });
  })
  .then(pr => {
    // save PR for later use
    module.exports.data = pr.data;
    return this.data;
  });
};

module.exports.fetchChangedComponents = function getChangedComponents() {
  // fetch changed files in 100er blocks
  let filePromises = [];
  for (let i = 0; i < this.data.changed_files / 100; i++) {
    filePromises.push(github.pullRequests.getFiles({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST,
      'per_page': 100,
      page: i
    }));
  }

  // check which model components, plugins and fixtures have been changed in the PR
  return Promise.all(filePromises)
  .then(fileBlocks => {
    let changedComponents = {
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
      for (const file of block.data) {
        addFileToChangedData(changedComponents[file.status], file.filename);
      }
    }

    return changedComponents;
  });
};

function addFileToChangedData(changedData, filename) {
  const segments = filename.split('/');
  
  if (segments[0] === 'lib' && segments[1] === 'model') {
    changedData.model = true;
    return;
  }

  if (segments[0] === 'plugins' && segments[2] === 'import.js') {
    changedData.imports.push(segments[1]); // plugin key
    return;
  }

  if (segments[0] === 'plugins' && segments[2] === 'export.js') {
    changedData.exports.push(segments[1]); // plugin key
    return;
  }

  if (segments[0] === 'plugins' && segments[2] === 'exportTests') {
    changedData.exportTests.push([
      segments[1], // plugin key
      segments[3].split('.')[0] // test key
    ]);
    return;
  }
  
  if (segments[0] === 'fixtures' && segments[1] === 'schema.js') {
    changedData.schema = true;
    return;
  }
  
  if (segments[0] === 'fixtures' && segments.length === 3) {
    changedData.fixtures.push([
      segments[1], // man key
      segments[2].split('.')[0] // fix key
    ]);
  }
}

/**
 * Creates a new comment in the PR if test.lines is not empty and if there is not already an exactly equal comment.
 * Deletes old comments from the same test (determined by test.filename).
 * @param {!object} test Information about the test script that wants to update the comment.
 * @param {!string} test.filename Relative path from OFL root dir to test file: 'tests/github/test-file-name.js'
 * @param {!string} test.name Heading to be used in the comment
 * @param {!string[]} test.lines The comment's lines of text
 */
module.exports.updateComment = function updateComment(test) {
  let lines = [
    `<!-- GITHUB-TEST: ${test.filename} -->`,
    `# ${test.name}`,
    `(Output of test script \`${test.filename}\`.)`,
    ''
  ];
  lines = lines.concat(test.lines);
  const message = lines.join('\n');

  let commentPromises = [];
  for (let i = 0; i < module.exports.data.comments / 100; i++) {
    commentPromises.push(
      github.issues.getComments({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        'per_page': 100,
        page: i
      })
    );
  }
  
  return Promise.all(commentPromises)
  .then(commentBlocks => {
    let equalFound = false;

    for (const block of commentBlocks) {
      for (const comment of block.data) {
        // get rid of \r linebreaks
        comment.body = comment.body.replace(/\r/g, '');

        // the comment was created by this test script
        if (lines[0] === comment.body.split('\n')[0]) {
          if (!equalFound && message === comment.body && test.lines.length > 0) {
            equalFound = true;
            console.log(`Test comment with same content already exists at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}.`);
          }
          else {
            console.log(`Deleting old test comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}.`);
            github.issues.deleteComment({
              owner: repoOwner,
              repo: repoName,
              id: comment.id
            });
          }
        }
      }
    }

    if (!equalFound && test.lines.length > 0) {
      console.log(`Creating test comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}.`);
      return github.issues.createComment({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        body: message
      });
    }

    return Promise.resolve();
  });
};

module.exports.getTestFixturesMessage = function getTestFixturesMessage(fixtures) {
  let lines = [];
  lines.push('Tested with the following [test fixtures](https://github.com/FloEdelmann/open-fixture-library/wiki/Test-fixtures) that provide a possibly wide variety of different fixture features:');
  lines = lines.concat(fixtures.map(fix => `- ${fix}`), '');
  return lines;
};
