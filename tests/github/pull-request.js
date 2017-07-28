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
for (let envVar of requiredEnvVars) {
  if (!(envVar in process.env)) {
    console.error(`Environment variable ${envVar} is required for this script. Please define it in your system or in the .env file.`);
    process.exit(1);
  }
}

if (process.env.TRAVIS_PULL_REQUEST === 'false') {
  console.error('Github tests can only be run in pull request builds.');
  process.exit(0);
}
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

github.authenticate({
  type: 'token',
  token: process.env.GITHUB_USER_TOKEN
});

const repoOwner = process.env.TRAVIS_REPO_SLUG.split('/')[0];
const repoName = process.env.TRAVIS_REPO_SLUG.split('/')[1];

module.exports.init = function init() {
  return github.pullRequests.get({
    owner: repoOwner,
    repo: repoName,
    number: process.env.TRAVIS_PULL_REQUEST
  })
  .then(pr => {
    // save PR for later use
    module.exports.data = pr.data;
    return this.data;
  });
}

module.exports.fetchChangedComponents = function getChangedComponents() {
  // fetch changed files in 100er blocks
  let filePromises = [];
  for (let i = 0; i < this.data.changed_files / 100; i++) {
    filePromises.push(
      github.pullRequests.getFiles({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        'per_page': 100,
        page: i
      })
    );
  }

  // check which model components, plugins and fixtures have been changed in the PR
  return Promise.all(filePromises)
  .then(fileBlocks => {
    let changedComponents = {
      added: {
        model: false,
        imports: [], // array of plugin keys
        exports: [], // array of plugin keys
        exportTests: [], // array of [plugin key, test key]
        fixtures: [] // array of [man key, fix key]
      },
      modified: {
        model: false,
        imports: [], // array of plugin keys
        exports: [], // array of plugin keys
        exportTests: [], // array of [plugin key, test key]
        fixtures: [] // array of [man key, fix key]
      },
      removed: {
        model: false,
        imports: [], // array of plugin keys
        exports: [], // array of plugin keys
        exportTests: [], // array of [plugin key, test key]
        fixtures: [] // array of [man key, fix key]
      }
    };

    for (const block of fileBlocks) {
      for (const file of block.data) {
        const changedData = changedComponents[file.status];
        const segments = file.filename.split('/');

        if (segments[0] === 'lib' && segments[1] === 'model') {
          changedData.model = true;
          continue;
        }

        if (segments[0] === 'plugin' && segments[2] === 'import.js') {
          changedData.imports.push(segments[1]);
          continue;
        }

        if (segments[0] === 'plugin' && segments[2] === 'export.js') {
          changedData.exports.push(segments[1]);
          continue;
        }

        if (segments[0] === 'plugin' && segments[2] === 'exportTests') {
          changedData.exportTests.push([segmenst[1], segments[3]]);
          continue;
        }

        if (segments[0] === 'fixtures' && segments.length === 3) {
          changedData.fixtures.push([
            segments[1],
            path.basename(segments[2], path.extname(segments[2]))
          ]);
        }
      }
    }

    return changedComponents;
  });
}

/**
 * test is an object of this structere: {
 *   key: 'unique-test-key',
 *   name: 'shown test name',
 *   lines: 'test message'
 * }
 */
module.exports.updateComment = function updateComment(test) {
  const commentBeginning = `<!-- GITHUB-TEST: ${test.key} -->`;

  let lines = [
    commentBeginning,
    `Last updated at ${new Date(Date.now()).toLocaleString()} with commit ${process.env.TRAVIS_COMMIT}.`,
    `# ${test.name}`,
    ''
  ];
  lines = lines.concat(test.lines);
  const message = lines.join('\n');

  console.log(`Creating test comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}`);
  github.issues.createComment({
    owner: repoOwner,
    repo: repoName,
    number: process.env.TRAVIS_PULL_REQUEST,
    body: message
  });

  let commentPromises = [];
  for (let i = 0; i < module.exports.data.comments / 100; i++) {
    commentPromises.push(
      github.issues.getComments({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        per_page: 100,
        page: i
      })
    );
  }
  
  return Promise.all(commentPromises)
  .then(commentBlocks => {
    for (const block of commentBlocks) {
      for (const comment of block.data) {
        // this comment was created by this test script
        if (comment.body.startsWith(commentBeginning)) {
          console.log(`Deleting old test comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}`);
          github.issues.deleteComment({
            owner: repoOwner,
            repo: repoName,
            id: comment.id
          });
        }
      }
    }
  });
}