#!/usr/bin/node

const diffPluginOutputs = require('../../lib/diff-plugin-outputs.js');
const exportPlugins = Object.keys(require('../../plugins/plugins.js').export);
const pullRequest = require('./pull-request');

const testFixtures = require('../test-fixtures.json').map(
  fixture => `${fixture.man}/${fixture.key}`
);

let diffTasks = [];

// generate diff tasks describing the diffed plugins, fixtures and the reason for diffing (which component has changed)
pullRequest.init()
.then(prData => {
  return pullRequest.fetchChangedComponents()
})
.then(changedComponents => {
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
})
// run the diff tasks (if there are some) and make comment
.then(() => {
  if (diffTasks.length === 0) {
    console.log('Model, plugins and fixtures not modified.');
    process.exit(0);
  }

  for (const task of diffTasks) {
    task.outputs = task.plugins.map(plugin => diffPluginOutputs(plugin, process.env.TRAVIS_BRANCH, task.fixtures));
  }
  
  let lines = [];

  for (const task of diffTasks) {
    switch (task.type) {
      case 'model':
        lines = lines.concat(getModelTaskMessage(task));
        break;

      case 'plugin':
        lines = lines.concat(getPluginTaskMessage(task));
        break;

      case 'fixture':
        lines = lines.concat(getFixtureTaskMessage(task));
        break;
    }
  }

  return pullRequest.updateComment({
    key: 'export-diff',
    name: 'Plugin export diff',
    lines: lines
  });
})
.catch(error => {
  console.error(error);
  process.exit(1);
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

  if (!hasRemoved && !hasAdded && !hasChanged) {
    lines.push('Outputted files not changed.');
  }

  if (hasRemoved) {
    lines.push('*Removed files*');
    lines = lines.concat(output.removedFiles.map(file => `- ${file}`), '');
  }

  if (hasAdded) {
    lines.push('*Added files*');
    lines = lines.concat(output.addedFiles.map(file => `- ${file}`), '');
  }
  
  for (let file of Object.keys(output.changedFiles)) {
    lines.push('<details>');
    lines.push(`<summary><b>Changed outputted file <code>${file}</code></b></summary>`, '');
    lines.push('```diff');
    lines.push(output.changedFiles[file]);
    lines.push('```');
    lines.push('</details>');
  }

  return lines;
}