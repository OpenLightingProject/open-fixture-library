#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const env = require('node-env-file');
const GitHubApi = require('github');
const diffPluginOutputs = require(path.join(__dirname, '..', 'lib', 'diff-plugin-outputs'));

// These fixtures have the most possible different functions,
// so they are good for testing plugin output.
// (Testing all fixtures would be overkill.)
const testFixtures = [
  'fixtures/cameo/thunder-wash-600-w.json',
  'fixtures/lightmaxx/vega-zoom-wash.json'
]

// load any undefined environment variables and complain about missing ones
const envFile = path.join(__dirname, '..', '.env');
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

if (process.env.TRAVIS_PULL_REQUEST == 'false') {
  console.error('This test can only be run on pull requests.');
  process.exit(0);
}

// get export plugins (used when all plugins should be used)
let plugins = [];
const pluginDir = path.join(__dirname, '..', 'plugins');
for (const filename of fs.readdirSync(pluginDir)) {
  if (require(path.join(pluginDir, filename)).export) {
    plugins.push(path.basename(filename, '.js'));
  }
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

let fixtureData = {};
let pluginData = {};

const identification = '<!-- github-plugin-diff -->';
let prComment = null;

new Promise((resolve, reject) => {
  getTestComment(1);

  function getTestComment(page) {
    github.issues.getComments({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST,
      per_page: 100,
      page: page
    }, (err, res) => {
      if (res.data.length > 0) {
        for (let comment of res.data) {
          // get rid of \r linebreaks
          comment.body = comment.body.replace(/[\r]/g, '');

          if (comment.body.startsWith(identification)) {
            prComment = comment;
            const secondLine = comment.body.split('\n')[1];
            return resolve(secondLine.match(/<!-- commit = (.*) -->/)[1]);
          }
        }
        getTestComment(page + 1);
      }
      else {
        resolve(process.env.TRAVIS_BRANCH);
      }
    });
  }
})
.then(ref => {
  return github.repos.compareCommits({
    owner: repoOwner,
    repo: repoName,
    base: ref,
    head: process.env.TRAVIS_COMMIT
  });
})
.then(res => {
  return new Promise((resolve, reject) => {
    criticalFiles(
      res.data.files,
      fixtureFilename => {
        return resolve();
      },
      pluginFilename => {
        return resolve();
      },
      reject
    );
  });
})
.then(() => {
  return new Promise((resolve, reject) => {
    getFiles(1, []);

    function getFiles(page, files) {
      github.pullRequests.getFiles({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        per_page: 100,
        page: page
      }, (err, res) => {
        if (res.data.length > 0) {
          getFiles(page + 1, files.concat(res.data));
        }
        else {
          criticalFiles(
            files,
            fixtureFilename => {
              fixtureData[fixtureFilename] = {};
              diffFixture(fixtureFilename, 0);
            },
            pluginFilename => {
              const plugin = path.basename(pluginFilename, '.js');
              if (plugins.includes(plugin)) {
                diffPluginOutputs({
                  plugin: plugin,
                  ref: process.env.TRAVIS_BRANCH,
                  fixtures: testFixtures
                }, (outputData) => {
                  pluginData[plugin] = outputData;
                });
              }
            },
            resolve
          );

          function diffFixture(fixture, pluginIndex) {
            if (pluginIndex in plugins) {
              diffPluginOutputs({
                plugin: plugins[pluginIndex],
                ref: process.env.TRAVIS_BRANCH,
                fixtures: [fixture]
              },
              (outputData) => {
                fixtureData[fixture][plugins[pluginIndex]] = outputData;
                diffFixture(fixture, pluginIndex + 1);
              });
            }
          }
        }
      });
    }
  });
})
.catch(() => {
  console.log('No changes in plugin or fixture files since last commit.');
  process.exit(0);
})
.then(() => {
  let message = [];
  message.push(`${identification}`);
  message.push(`<!-- commit = ${process.env.TRAVIS_COMMIT} -->`);
  message.push('Last updated: ' + new Date(Date.now()).toLocaleString());
  message.push('## Diff plugin outputs test');

  if (Object.keys(fixtureData) == 0 && Object.keys(pluginData) == 0) {
    message.push('*No fixture or plugin files were changed in this PR.*')
  }
  else {
    for (let fixture in fixtureData) {
      message.push(`### Modified \`${fixture}\` in this PR`);

      let hasContent = false;
      for (let plugin in fixtureData[fixture]) {
        const pluginMessage = printPlugin(fixtureData[fixture][plugin])
        if (pluginMessage.length > 0) {
          hasContent = true;
          message.push(`#### Output changed for plugin \`${plugin}\``);
          message = message.concat(pluginMessage);
        }
      }

      if (!hasContent) {
        message.push('Output files not changed.');
      }
    }

    for (let plugin in pluginData) {
      message.push(`### Modified plugin \`${plugin}\` in this PR`);

      const pluginMessage = printPlugin(pluginData[plugin]);
      if (pluginMessage.length > 0) {
        message.push(`Plugins are always tested with the following fixtures: ${testFixtures}`);
        message = message.concat(pluginMessage);
      }
      else {
        message.push('Output files not changed.');
      }
    }
  }

  function printPlugin(outputData) {
    let pluginMessage = [];

    const hasRemoved = outputData.removedFiles.length > 0;
    const hasAdded = outputData.addedFiles.length > 0;
    const hasChanged = Object.keys(outputData.changedFiles).length > 0;
    if (hasRemoved || hasAdded || hasChanged) {
      if (hasRemoved) {
        pluginMessage += '*Removed files*';
        for (let file of outputData.removedFiles) {
          pluginMessage.push(`- ${file}`);
        }
        pluginMessage += '';
      }

      if (hasAdded) {
        pluginMessage.push('*Added files*');
        for (let file of outputData.addedFiles) {
          pluginMessage.push(`- ${file}`);
        }
        pluginMessage += '';
      }

      if (hasChanged && (hasRemoved || hasAdded)) {
        pluginMessage.push('*Changed files*');
      }
      for (let file in outputData.changedFiles) {
        pluginMessage.push('```diff');
        pluginMessage.push(`${outputData.changedFiles[file]}`);
        pluginMessage.push('```');
      }
    }

    return pluginMessage;
  }

  if (prComment == null) {
    console.log(`Creating comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST}`);
    github.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST,
      body: message.join('\n')
    });
  }
  else {
    console.log(`Updating comment at ${process.env.TRAVIS_REPO_SLUG}#${process.env.TRAVIS_PULL_REQUEST} and creating notify comment`);
    github.issues.editComment({
      owner: repoOwner,
      repo: repoName,
      id: prComment.id,
      body: message.join('\n')
    });
    github.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST,
      body: `*[Updated plugin output diff comment](${prComment.html_url})*`
    });
  }
});

function criticalFiles(files, fixtureCallback, pluginCallback, endCallback) {
  for (let file of files) {
    if (file.status === 'modified') {
      const filename = file.filename;
      if (filename.match(/fixtures\/(.+)\/(.+)\.json/)) {
        fixtureCallback(filename);
      }
      else if (filename.match(/plugins\/(.+)\.js/)) {
        pluginCallback(filename);
      }
    }
  }
  endCallback();
}