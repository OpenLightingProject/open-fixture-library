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
  let messagePromises = [];

  if (changedComponents.added.model ||
      changedComponents.modified.model ||
      changedComponents.removed.model) {
    messagePromises.push(getModelMessagePromise());
  }
  else {
    const plugins = changedComponents.added.exports.concat(changedComponents.modified.exports);
    messagePromises = messagePromises.concat(plugins.map(
      plugin => getPluginMessagePromise(plugin)
    ));

    // only export tests that are not covered by plugin tasks (which run all tests)
    const exportTests = changedComponents.added.exportTests.concat(changedComponents.modified.exportTests) // stored as [plugin, test]
      .filter(([plugin, test]) => !plugins.includes(plugin));
    messagePromises = messagePromises.concat(exportTests.map(
      ([plugin, test]) => getExportTestMessagePromise(plugin, test)
    ));
  }

  const fixtures = changedComponents.added.fixtures.concat(changedComponents.modified.fixtures);
  messagePromises = messagePromises.concat(fixtures.map(
    fixture => getFixtureMessagePromise(fixture)
  ));

  return Promise.all(messagePromises);
})
.then(messages => {
  let lines = [
    'Test the exported files of selected fixtures against the plugins\' export tests.',
    ''
  ];

  for (const messageLines of messages) {
    lines = lines.concat(messageLines, '');
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

function getModelMessagePromise() {
  const pluginListPromises = Object.keys(plugins).map(
    pluginKey => getPluginListPromise(pluginKey, testFixtures)
  );

  return Promise.all(pluginListPromises)
  .then(pluginLists => {
    let modelMessageLines = ['## Model changed in this PR'];
    modelMessageLines = appendTestFixturesInfo(modelMessageLines);

    for (const pluginListLines of pluginLists) {
      modelMessageLines = modelMessageLines.concat(pluginListLines);
    }

    return modelMessageLines;
  });
}

function getPluginMessagePromise(pluginKey) {
  const plugin = plugins[pluginKey];
  const exportTestListPromises = Object.keys(plugin.exportTests).map(
    testKey => getExportTestListPromise(plugin, testKey, testFixtures)
  );

  return Promise.all(exportTestListPromises)
  .then(exportTestLists => {
    let pluginMessageLines = [`## Plugin \`${pluginKey}\` changed in this PR`];
    pluginMessageLines = appendTestFixturesInfo(pluginMessageLines);
    
    for (const exportTestListLines of exportTestLists) {
      pluginMessageLines = pluginMessageLines.concat(exportTestListLines);
    }

    return pluginMessageLines;
  });
}

function getExportTestMessagePromise(pluginKey, testKey) {
  const plugin = plugins[pluginKey];
  const files = plugin.export.export(testFixtures.map(
    fix => Fixture.fromRepository(fix[0], fix[1])
  ));

  const test = plugin.exportTests[testKey];
  const fileResultPromises = files.map(
    file => getFileResultPromise(test, file)
  );

  return Promise.all(fileResultPromises)
  .then(fileResults => {
    let exportTestMessageLines = [`## Export test \`${pluginKey}\`/\`${testKey}\` changed in this PR`];
    exportTestMessageLines = appendTestFixturesInfo(exportTestMessageLines);
    
    for (const fileResultLines of fileResults) {
      exportTestMessageLines = exportTestMessageLines.concat(fileResultLines);
    }

    return exportTestMessageLines;
  });
}

function getFixtureMessagePromise(fixture) {
  const pluginListPromises = Object.keys(plugins).map(
    pluginKey => getPluginListPromise(pluginKey, [fixture])
  );

  return Promise.all(pluginListPromises)
  .then(pluginLists => {
    let fixtureMessageLines = [`## Fixture \`${fixture[0]}/${fixture[1]}\` changed in this PR`];

    for (const pluginListLines of pluginLists) {
      fixtureMessageLines = fixtureMessageLines.concat(pluginListLines);
    }

    return fixtureMessageLines;
  });
}

function appendTestFixturesInfo(lines) {
  return lines.concat(
    pullRequest.getTestFixturesMessage(
      testFixtures.map(fix => `${fix[0]}/${fix[1]}`)
    ),
    '### Test results'
  );
}


function getPluginListPromise(pluginKey, fixtures) {
  const plugin = plugins[pluginKey];
  const exportTestListPromises = Object.keys(plugin.exportTests).map(
    testKey => getExportTestListPromise(plugin, testKey, fixtures, '  ')
  );

  return Promise.all(exportTestListPromises)
  .then(exportTestLists => {
    let pluginListLines = [`- ${pluginKey}`];
    
    for (const exportTestListLines of exportTestLists) {
      pluginListLines = pluginListLines.concat(exportTestListLines);
    }

    return pluginListLines;
  });
}

function getExportTestListPromise(plugin, testKey, fixtures, indent = '') {
  const files = plugin.export.export(fixtures.map(
    fix => Fixture.fromRepository(fix[0], fix[1])
  ));

  const test = plugin.exportTests[testKey];
  const fileResultPromises = files.map(
    file => getFileResultPromise(test, file, indent + '  ')
  );

  return Promise.all(fileResultPromises)
  .then(fileResults => {
    let exportTestLines = [`${indent}- ${testKey}`];
    
    for (const fileResultLines of fileResults) {
      exportTestLines = exportTestLines.concat(fileResultLines);
    }

    return exportTestLines;
  });
}

function getFileResultPromise(test, file, indent = '') {
  return test(file.content)
  .then(testResult => {
    if (testResult.passed) {
      return [`${indent}- :white_check_mark: ${file.name}`];
    }
    
    let fileResultLines = [
      `${indent}- :x: ${file.name}`,
      `${indent}  <details>`,
      `${indent}  <summary>Show errors</summary>`,
      `${indent}  <ul>`
    ];

    for (const error of testResult.errors) {
      const errorText = error.replace('\n', '');
      fileResultLines.push(`${indent}  <li>${errorText}</li>`);
    }

    fileResultLines.push(
      `${indent}  </ul>`,
      `${indent}  </details>`
    );

    return fileResultLines;
  });
}