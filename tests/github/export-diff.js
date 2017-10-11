#!/usr/bin/node

const path = require('path');

const diffPluginOutputs = require('../../lib/diff-plugin-outputs.js');
const exportPlugins = Object.keys(require('../../plugins/plugins.js').export);
const pullRequest = require('./pull-request.js');

const testFixtures = require('../test-fixtures.json').map(
  fixture => `${fixture.man}/${fixture.key}`
);

// generate diff tasks describing the diffed plugins, fixtures and the reason for diffing (which component has changed)
pullRequest.checkEnv()
.catch(error => {
  console.error(error);
  console.exit(0); // if the environment is not correct, just exit without failing
})
.then(() => pullRequest.init())
.then(prData => pullRequest.fetchChangedComponents())
.then(changedComponents => {
  const allPlugins = exportPlugins.filter(plugin => !changedComponents.added.exports.includes(plugin));
  const allTestFixtures = testFixtures.filter(fixture => !changedComponents.added.fixtures.includes(fixture));

  let lines = [];

  if (changedComponents.modified.model) {
    lines = lines.concat(getModelMessage(allPlugins, allTestFixtures));
  }
  else {
    for (const plugin of changedComponents.modified.exports) {
      lines = lines.concat(getPluginMessage(plugin, allTestFixtures));
    }
  }

  for (const fixture of changedComponents.modified.fixtures) {
    lines = lines.concat(getFixtureMessage(allPlugins, `${fixture[0]}/${fixture[1]}`));
  }

  if (lines.length > 0) {
    lines = [
      'You can run view your uncommited changes in plugin exports manually by executing:',
      '`$ node cli/diff-plugin-outputs.js -p <plugin name> <fixtures>`',
      ''
    ].concat(lines);
  }

  return pullRequest.updateComment({
    filename: path.relative(path.join(__dirname, '../../'), __filename),
    name: 'Plugin export diff',
    lines: lines
  });
})
.catch(error => {
  console.error(error);
  process.exit(1);
});

function getModelMessage(plugins, fixtures) {
  let lines = [];

  lines.push('## Model modified in this PR');
  lines.push('As the model affects all plugins, the output of all plugins is checked.', '');
  lines = lines.concat(pullRequest.getTestFixturesMessage(fixtures));

  for (const plugin of plugins) {
    lines = lines.concat(getSubPluginMessage(plugin, fixtures));
  }
  
  return lines;
}

function getPluginMessage(plugin, fixtures) {
  let lines = [];

  const diffMessage = getDiffMessage(plugin, fixtures);
  if (diffMessage.length === 1) {
    // no changes
    lines.push(`## :information_source: Plugin \`${plugin}\` modified in this PR`);
  }
  else {
    lines.push(`## :warning: Plugin \`${plugin}\` modified in this PR`);
  }
  lines = lines.concat(pullRequest.getTestFixturesMessage(fixtures));
  lines = lines.concat(diffMessage, '');
  
  return lines;
}

function getFixtureMessage(plugins, fixture) {
  let lines = [];

  lines.push(`## Fixture \`${fixture}\` modified in this PR`);
  lines.push('Fixture output to all plugins is checked.', '');

  for (const plugin of plugins) {
    lines = lines.concat(getSubPluginMessage(plugin, [fixture]));
  }
  
  return lines;
}

function getSubPluginMessage(plugin, fixtures) {
  let lines = [];

  const diffMessage = getDiffMessage(plugin, fixtures);
  if (diffMessage.length === 1) {
    // no changes
    lines.push(`### :information_source: Plugin \`${plugin}\``);
  }
  else {
    lines.push(`### :warning: Plugin \`${plugin}\``);
  }
  lines = lines.concat(diffMessage, '');

  return lines;
}

function getDiffMessage(plugin, fixtures) {
  let lines = [];

  const output = diffPluginOutputs(plugin, process.env.TRAVIS_BRANCH, fixtures);

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
  
  for (const file of Object.keys(output.changedFiles)) {
    lines.push('<details>');
    lines.push(`<summary><b>Changed outputted file <code>${file}</code></b></summary>`, '');
    lines.push('```diff');
    lines.push(output.changedFiles[file]);
    lines.push('```');
    lines.push('</details>');
  }

  return lines;
}
