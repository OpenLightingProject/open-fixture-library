#!/usr/bin/node

const path = require('path');

const Fixture = require('../../lib/model/Fixture.js');
const pullRequest = require('./pull-request.js');

const plugins = require('../../plugins/plugins.js').all;
const testFixtures = require('../test-fixtures.json').map(
  fixture => [fixture.man, fixture.key]
);

pullRequest.init()
.then(prData => {
  return pullRequest.fetchChangedComponents();
})
.then(changedComponents => {
  let validateTasks = [];

  if (changedComponents.added.model ||
      changedComponents.modified.model ||
      changedComponents.removed.model) {
    validateTasks.push({
      type: 'model',
      promise: getPromise(testFixtures)
    });
  }
  else {
    const plugins = changedComponents.added.exports.concat(changedComponents.modified.exports);
    validateTasks = validateTasks.concat(plugins.map(plugin => ({
      type: 'plugin',
      plugin: plugin,
      promise: getPluginPromise(plugin, testFixtures)
    })));

    // only export tests that are not covered by plugin tasks (which run all tests)
    const exportTests = changedComponents.added.exportTests.concat(changedComponents.modified.exportTests) // stored as [plugin, test]
      .filter(([plugin, test]) => !plugins.includes(plugin));
    validateTasks = validateTasks.concat(exportTests.map(test => ({
      type: 'export-test',
      plugin: test[0],
      test: test[1],
      promise: getExportTestPromise(test[0], test[1], testFixtures)
    })));
  }

  const fixtures = changedComponents.added.fixtures.concat(changedComponents.modified.fixtures);
  validateTasks = validateTasks.concat(fixtures.map(fixture => ({
    type: 'fixture',
    fixture: fixture,
    promise: getPromise([fixture])
  })));

  return validateTasks;
})
.then(validateTasks => {
  const messagePromises = validateTasks.map(task => {
    return task.promise
    .then(results => {
      return getTaskMessage(task, results.results);
    })
  });
  return Promise.all(messagePromises);
})
.then(messages => {
  let lines = [
    'Test the exported files of selected fixtures against the plugins\' export tests.',
    ''
  ];

  for (const message of messages) {
    lines = lines.concat(message);
  }

  return pullRequest.updateComment({
    filename: path.relative(path.join(__dirname, '../../'), __filename),
    name: 'Exports valid',
    lines: lines
  });
})
.catch(error => {
  console.error(error);
  process.exit(0);
});

function getPromise(fixtures) {
  return Promise.all(Object.keys(plugins).map(plugin => getPluginPromise(plugin, fixtures)))
  .then(results => {
    return {
      name: 'model',
      results: results
    }
  });
}

function getPluginPromise(pluginKey, fixtures) {
  const plugin = plugins[pluginKey];
  return Promise.all(Object.keys(plugin.exportTests).map(
    testKey => getExportTestPromise(pluginKey, testKey, fixtures)
  ))
  .then(results => {
    return {
      name: pluginKey,
      results: results
    }
  });
}

function getExportTestPromise(pluginKey, testKey, fixtures) {
  const plugin = plugins[pluginKey];
  const exportTest = plugin.exportTests[testKey];
  const files = plugin.export.export(fixtures.map(
    ([manKey, fixKey]) => Fixture.fromRepository(manKey, fixKey)
  ));

  return Promise.all(files.map(file => exportTest(file.content)))
  .then(results => {
    return {
      name: testKey,
      results: files.map((file, index) => ({
        name: file.name,
        result: results[index]
      }))
    };
  });
}

function getTaskMessage(task, results) {
  let lines = [];
  switch (task.type) {
    case 'model':
      lines.push('## Model changed in this PR');
      break;

    case 'plugin':
      lines.push(`## Plugin \`${task.plugin}\` changed in this PR`);
      break;
      
    case 'export-test':
      lines.push(`## Export test \`${task.plugin}\`/\`${task.test}\` changed in this PR`);
      break;
      
    case 'fixture':
      lines.push(`## Fixture \`${task.fixture[0]}/${task.fixture[1]}\` changed in this PR`);
  }

  if (task.type !== 'fixture') {
    lines = lines.concat(pullRequest.getTestFixturesMessage(
      testFixtures.map(([man, fix]) => `${man}/${fix}`)
    ));
  }

  lines.push('### Test results');
  for (const result of results) {
    lines = lines.concat(getResultMessage(result));
  }
  lines.push('');

  return lines;
}

function getResultMessage(result, indent = '') {
  let lines = [];

  if ('results' in result) {
    lines.push(`${indent}- ${result.name}`);
    for (const results of result.results) {
      lines = lines.concat(getResultMessage(results, indent + '  '));
    }
  }
  else {
    if (result.result.passed) {
      lines.push(`${indent}- :white_check_mark: ${result.name}`);
    }
    else {
      lines.push(
        `${indent}- :x: ${result.name}`,
        `${indent}  <details>`,
        `${indent}  <summary>Show errors</summary>`,
        `${indent}  <ul>`
      );
      for (const error of result.result.errors) {
        const errorText = error.replace('\n', '');
        lines.push(`${indent}  <li>${errorText}</li>`);
      }
      lines.push(
        `${indent}  </ul>`,
        `${indent}  </details>`
      );
    }
  }

  return lines;
}