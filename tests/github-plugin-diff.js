#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const env = require('node-env-file');
const GitHubApi = require('github');

const diffPluginOutputs = require('../lib/diff-plugin-outputs.js');
const exportPlugins = Object.keys(require('../plugins/plugins.js').export);


// These fixtures have the most possible different functions,
// so they are good for testing plugin output.
// (Testing all fixtures would be overkill.)
const testFixtures = require('./test-fixtures.json').map(
  fixture => `${fixture.man}/${fixture.key}`
);

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

if (process.env.TRAVIS_PULL_REQUEST === 'false') {
  console.error('This test can only be run on pull requests.');
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

let fixtureData = {};
let pluginData = {};

const identification = '<!-- github-plugin-diff -->';
let pullRequestData;
let diffTasks = [];

github.pullRequests.get({
  owner: repoOwner,
  repo: repoName,
  number: process.env.TRAVIS_PULL_REQUEST,
})
.then(pr => {
  // save PR for later use
  pullRequestData = pr.data;

  // fetch comments in 100er packages
  let filePromises = [];
  for (let i = 0; i < pullRequestData.changed_files / 100; i++) {
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
  return Promise.all(filePromises);
})
// check which model components, plugins and fixtures have been changed in the PR
.then(filePackages => {
  return new Promise((resolve, reject) => {
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

    for (const package of filePackages) {
      for (const file of package.data) {
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

    resolve(changedComponents);
  });
})
// generate diff tasks describing the diffed plugins, fixtures and the reason for diffing (which component has changed)
.then(changedComponents => {
  return new Promise((resolve, reject) => {
    const allPlugins = exportPlugins.filter(plugin => !changedComponents.added.plugins.includes(plugin));
    const allTestFixtures = testFixtures.filter(fixture => !changedComponents.added.fixtures.includes(fixture));

    if (changedComponents.modified.model) {
      diffTasks.push({
        type: 'model',
        plugins: allPlugins,
        fixtures: allTestFixtures
      });
    }
    else {
      for (const plugin of changedComponents.modified.plugins) {
        diffTasks.push({
          type: 'plugin',
          plugins: [plugin],
          fixtures: allTestFixtures
        });
      }
    }

    for (const fixture of changedComponents.modified.fixtures) {
      diffTasks.push({
        type: 'fixture',
        plugins: allPlugins,
        fixtures: [fixture]
      });
    }

    resolve();
  });
})
// run the diff tasks (if there are some)
.then(() => {
  if (diffTasks.length === 0) {
    console.log('Model, plugins and fixtures not modified.');
    process.exit(0);
  }

  return Promise.all(diffTasks.map(task => {
    return new Promise((resolve, reject) => {
      Promise.all(task.plugins.map(plugin => diffPluginOutputs(plugin, process.env.TRAVIS_BRANCH, task.fixtures)))
      .then(outputs => {
        task.outputs = outputs;
        resolve(task);
      });
    });
  }));
})
// check if there already is a comment by this test script
.then(() => {
  // fetch comments in 100er packages
  let commentPromises = [];
  for (let i = 0; i < pullRequestData.comments / 100; i++) {
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
  return Promise.all(commentPromises);
})
.then(commentPackages => {
  return new Promise((resolve, reject) => {
    for (const package of commentPackages) {
      for (const comment of package.data) {
        // get rid of \r linebreaks
        comment.body = comment.body.replace(/[\r]/g, '');

        // this comment was created by this test script
        if (comment.body.startsWith(identification)) {
          resolve(comment);
          return;
        }
      }
    }
    resolve(null);
  });
})
// generate comment message and update or send new comment
.then(comment => {
  let message = [];
  message.push(`${identification}`);
  message.push(`Last updated at ${new Date(Date.now()).toLocaleString()} with commit ${process.env.TRAVIS_COMMIT}`, '');
  message.push('# Diff plugin outputs test', '');

  for (const task of diffTasks) {
    switch (task.type) {
      case 'model':
        message = message.concat(getModelTaskMessage(task));
        break;

      case 'plugin':
        message = message.concat(getPluginTaskMessage(task));
        break;

      case 'fixture':
        message = message.concat(getFixtureTaskMessage(task));
        break;
    }
  }

  if (comment == null) {
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
      id: comment.id,
      body: message.join('\n')
    });
    github.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      number: process.env.TRAVIS_PULL_REQUEST,
      body: `*[Updated plugin output diff comment](${comment.html_url})*`
    });
  }
})
.catch(error => {
  console.error(error);
});

function getModelTaskMessage(task) {
  let lines = [];

  lines.push('## Model modified in this PR');
  lines.push('As the model affects all plugins, the output of all plugins is checked.', '');
  lines = lines.concat(getTestFixturesMessage(task.fixtures));

  for (let i = 0; i < task.plugins.length; i++) {
    lines = lines.concat(getPluginMessage(task.plugins[i], task.outputs[i]));
  }
  
  return lines;
}

function getPluginTaskMessage(task) {
  let lines = [];

  lines.push(`## Plugin \`${task.plugins[0]}\` modified in this PR`);
  lines = lines.concat(getTestFixturesMessage(task.fixtures));
  lines = lines.concat(getOutputMessage(task.outputs[0]), '');
  
  return lines;
}

function getFixtureTaskMessage(task) {
  let lines = [];

  lines.push(`## Fixture \`${task.fixtures[0]}\` modified in this PR`);
  lines.push('Fixture output to all plugins is checked.', '');

  for (let i = 0; i < task.plugins.length; i++) {
    lines = lines.concat(getPluginMessage(task.plugins[i], task.outputs[i]));
  }
  
  return lines;
}

function getTestFixturesMessage(fixtures) {
  let lines = [];
  lines.push('Tested with the following test fixtures that provide a possibly wide variety of different fixture features:');
  lines = lines.concat(fixtures.map(fix => `- ${fix}`), '');
  return lines;
}

function getPluginMessage(plugin, output) {
  let lines = [];

  lines.push(`### Plugin \`${plugin}\``);
  lines = lines.concat(getOutputMessage(output), '');

  return lines;
}

function getOutputMessage(output) {
  let lines = [];

  const hasRemoved = output.removedFiles.length > 0;
  const hasAdded = output.addedFiles.length > 0;
  const hasChanged = Object.keys(output.changedFiles).length > 0;

  if (hasRemoved || hasAdded || hasChanged) {
    if (hasRemoved) {
      lines.push('*Removed files*');
      for (let file of output.removedFiles) {
        lines.push(`- ${file}`);
      }
    }

    if (hasAdded) {
      lines.push('*Added files*');
      for (let file of output.addedFiles) {
        lines.push(`- ${file}`);
      }
    }

    // omit heading if there are no files removed or added
    if (hasChanged && (hasRemoved || hasAdded)) {
      lines.push('*Changed files*');
    }
    for (let file of Object.keys(output.changedFiles)) {
      lines.push('```diff');
      lines.push(output.changedFiles[file]);
      lines.push('```');
    }
  }
  else {
    lines.push('Output files not changed.');
  }

  return lines;
}