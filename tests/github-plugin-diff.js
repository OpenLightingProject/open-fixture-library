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

// load any undefined environment variables
env(path.join(__dirname, '..', '.env'));

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

github.pullRequests.getFiles({
  owner: repoOwner,
  repo: repoName,
  number: process.env.TRAVIS_PULL_REQUEST,
  per_page: 100
}, (err, res) => {
  console.log(err);
  for (let file of res.data) {
    if (file.status === 'modified') {
      if (file.filename.match(/fixtures\/(.+)\/(.+)\.json/)) {
        diffFixture(file.filename, 0);
      }
      else if (file.filename.match(/plugins\/(.+)\.js/)) {
        const plugin = path.basename(file.filename, '.js');
        if (plugins.includes(plugin)) {
          diffPluginOutputs({
            plugin: plugin,
            ref: process.env.TRAVIS_BRANCH,
            fixtures: testFixtures
          });
        }
      }
    }
  }
});

function diffFixture(fixture, pluginIndex) {
  if (pluginIndex in plugins) {
    diffPluginOutputs(
      {
        plugin: plugins[pluginIndex],
        ref: process.env.TRAVIS_BRANCH,
        fixtures: [fixture]
      },
      (outputData) => {
        diffFixture(fixture, pluginIndex + 1);
      }
    );
  }
}