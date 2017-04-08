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
  'cameo/outdoor-par-tri-12.json'
]

// load any undefined environment variables and complain about missing ones
env(path.join(__dirname, '..', '.env'));
const requiredEnvVars = [
  'GITHUB_USER_TOKEN',
  'TRAVIS_REPO_SLUG',
  'TRAVIS_PULL_REQUEST',
  'TRAVIS_EVENT_TYPE',
  'TRAVIS_BRANCH'
];
for (let envVar of requiredEnvVars) {
  if (!(envVar in process.env)) {
    console.error(`Environment variable ${envVar} is required for this script. Please define it in your system or in the .env file.`);
    process.exit(1);
  }
}

if (process.env.TRAVIS_EVENT_TYPE != 'pull_request') {
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

github.pullRequests.getFiles({
  owner: repoOwner,
  repo: repoName,
  number: process.env.TRAVIS_PULL_REQUEST,
  per_page: 100
}, (err, res) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  let criticalFiles = [];
  for (let file of res.data) {
    if (file.status === 'modified') {
      const filename = file.filename;
      if (filename.match(/fixtures\/(.+)\/(.+)\.json/)) {
        fixtureData[filename] = {};
        diffFixture(filename, 0);
      }
      else if (filename.match(/plugins\/(.+)\.js/)) {
        criticalFiles.push(filename);
        const plugin = path.basename(filename, '.js');
        if (plugins.includes(plugin)) {
          diffPluginOutputs({
            plugin: plugin,
            ref: process.env.TRAVIS_BRANCH,
            fixtures: testFixtures
          }, (outputData) => {
            pluginData[plugin] = outputData;
          });
        }
      }
    }
  }

  const identification = '<!-- github-plugin-diff -->';
  let message = `${identification}\n`;

  for (let fixture in fixtureData) {
    message += `## Modified \`${fixture}\` in this PR\n`;

    let hasContent = false;
    for (let plugin in fixtureData[fixture]) {
      const outputData = fixtureData[fixture][plugin];

      const hasRemoved = outputData.removedFiles.length > 0;
      const hasAdded = outputData.addedFiles.length > 0;
      const hasChanged = Object.keys(outputData.changedFiles).length > 0;
      if (hasRemoved || hasAdded || hasChanged) {
        hasContent = true;
        message += `### Output for plugin \`${plugin}\`\n`;

        if (hasRemoved) {
          message += '#### Removed files\n';
          for (let file of outputData.removedFiles) {
            message += `- ${file}\n`;
          }
        }
        if (hasAdded) {
          message += '#### Added files\n';
          for (let file of outputData.addedFiles) {
            message += `- ${file}\n`;
          }
        }
        for (let file in outputData.changedFiles) {
          message += `#### Changed file \`${file}\`\n`;
          message += '```diff\n';
          message += `${outputData.changedFiles[file]}\n`;
          message += '```\n';
        }
      }
    }

    if (!hasContent) {
      message += 'Output files not changed.'
    }
  }

  for (let plugin in pluginData) {
    message += `## Modified plugin \`${plugin}\` in this PR\n`;

    const outputData = pluginData[plugin];

    const hasRemoved = outputData.removedFiles.length > 0;
    const hasAdded = outputData.addedFiles.length > 0;
    const hasChanged = Object.keys(outputData.changedFiles).length > 0;
    if (hasRemoved || hasAdded || hasChanged) {
      if (hasRemoved) {
        message += '### Removed files\n';
        for (let file of outputData.removedFiles) {
          message += `- ${file}\n`;
        }
      }
      if (hasAdded) {
        message += '### Added files\n';
        for (let file of outputData.addedFiles) {
          message += `- ${file}\n`;
        }
      }
      for (let file in outputData.changedFiles) {
        message += `### Changed file \`${file}\`\n`;
        message += '```diff\n';
        message += `${outputData.changedFiles[file]}\n`;
        message += '```\n';
      }
    }
  }

  getLatestComment(1, [], comments => {
    let lastEqualsMessage = false;
    for (let comment of comments) {
      if (comment.body.match(identification)) {
        lastEqualsMessage = comment.body.replace(/[\r]/g, '') === message;
        console.log(lastEqualsMessage);
      }
    }

    if (!lastEqualsMessage) {
      github.issues.createComment({
        owner: repoOwner,
        repo: repoName,
        number: process.env.TRAVIS_PULL_REQUEST,
        body: message
      });
    }
  });
});

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

function getLatestComment(page, data, resolve) {
  github.issues.getComments({
    owner: repoOwner,
    repo: repoName,
    number: process.env.TRAVIS_PULL_REQUEST,
    per_page: 100,
    page: page
  }, (err, res) => {
    if (res.data.length > 0) {
      getLatestComment(page + 1, data.concat(res.data), resolve);
    }
    else {
      resolve(data);
    }
  });
}