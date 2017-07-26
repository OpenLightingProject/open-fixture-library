const fs = require('fs');
const path = require('path');
const env = require('node-env-file');
const GitHubApi = require('github');

const identification = '<!-- github-plugin-diff -->';

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
    return module.exports.data = pr.data;
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
        per_page: 100,
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
        plugins: [], // array of plugin keys
        fixtures: [] // array of [man key, fix key]
      },
      modified: {
        model: false,
        plugins: [], // array of plugin keys
        fixtures: [] // array of [man key, fix key]
      },
      removed: {
        model: false,
        plugins: [], // array of plugin keys
        fixtures: [] // array of [man key, fix key]
      }
    };

    for (const block of fileBlocks) {
      for (const file of block.data) {
        const matchModel = file.filename.match(/lib\/model\/([^\/]+)\.js/);
        if (matchModel) {
          changedComponents[file.status].model = true;
          continue;
        }

        const matchPlugin = file.filename.match(/plugins\/([^\/]+)\/export\.js/);
        if (matchPlugin) {
          changedComponents[file.status].plugins.push(matchPlugin[1]);
          continue;
        }
        
        const matchFixture = file.filename.match(/fixtures\/([^\/]+\/[^\/]+)\.json/);
        if (matchFixture) {
          changedComponents[file.status].fixtures.push(matchFixture[1]);
        }
      }
    }

    return changedComponents;
  })
}

module.exports.getComment = function(getComment) {
  let commentPromises = [];
  for (let i = 0; i < this.data.comments / 100; i++) {
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
        // get rid of \r linebreaks
        comment.body = comment.body.replace(/\r/g, '');
  
        // this comment was created by this test script
        if (comment.body.startsWith(identification)) {
          return comment;
        }
      }
    }
    return null;
  });
}

/**
 * test is an object of this structere: {
 *   key: 'unique test key',
 *   name: 'shown test name',
 *   lines: 'test message'
 * }
 */
module.exports.updateComment = function updateComment(test) {
  const message = [
    identification,
    `Last updated at ${new Date(Date.now()).toLocaleString()} with commit ${process.env.TRAVIS_COMMIT}.`,
    ''
  ].concat(test.lines).join('\n');

  this.getComment()
  .then(comment => {
    if (comment == null) {
      console.log(`Creating comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}`);
      github.issues.createComment({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        body: message
      });
    }
    else {
      console.log(`Updating comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST} and creating notify comment`);
      github.issues.editComment({
        owner: repoOwner,
        repo: repoName,
        id: comment.id,
        body: message
      });
      github.issues.createComment({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        body: `*[Updated plugin output diff comment](${comment.html_url})*`
      });
    }
  });
}