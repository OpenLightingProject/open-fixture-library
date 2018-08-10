#!/usr/bin/node

const path = require(`path`);

const { fixtureFromRepository } = require(`../../lib/model.js`);
const pullRequest = require(`./pull-request.js`);

const plugins = require(`../../plugins/plugins.json`);

let exportTests = [];
for (const pluginKey of Object.keys(plugins.data)) {
  const plugin = plugins.data[pluginKey];

  exportTests = exportTests.concat(plugin.exportTests.map(
    testKey => [pluginKey, testKey]
  ));
}

const testFixtures = require(`../test-fixtures.json`).map(
  fixture => [fixture.man, fixture.key]
);

/**
 * @typedef {object} Task
 * @property {string} manKey
 * @property {string} fixKey
 * @property {string} pluginKey
 * @property {string} testKey
 */

pullRequest.checkEnv()
  .catch(error => {
    console.error(error);
    process.exit(0); // if the environment is not correct, just exit without failing
  })
  .then(() => pullRequest.init())
  .then(prData => pullRequest.fetchChangedComponents())
  .then(changedComponents => {
    /** @type {Array.<Task>} */
    const tasks = getTasksForModel(changedComponents)
      .concat(getTasksForPlugins(changedComponents))
      .concat(getTasksForExportTests(changedComponents))
      .concat(getTasksForFixtures(changedComponents))
      .filter((task, index, arr) => {
        const firstEqualTask = arr.find(otherTask =>
          task.manKey === otherTask.manKey &&
          task.fixKey === otherTask.fixKey &&
          task.pluginKey === otherTask.pluginKey &&
          task.testKey === otherTask.testKey
        );

        // remove duplicates
        return task === firstEqualTask;
      })
      .sort((a, b) => {
        const manCompare = a.manKey.localeCompare(b.manKey);
        const fixCompare = a.fixKey.localeCompare(b.fixKey);
        const pluginCompare = a.pluginKey.localeCompare(b.pluginKey);
        const testCompare = a.testKey.localeCompare(b.testKey);

        if (manCompare !== 0) {
          return manCompare;
        }

        if (fixCompare !== 0) {
          return fixCompare;
        }

        if (pluginCompare !== 0) {
          return pluginCompare;
        }

        return testCompare;
      });

    return Promise.all(tasks.map(task => getTaskPromise(task)));
  })
  .then(taskResults => {
    let lines = [];

    if (taskResults.some(result => result.length > 0)) {
      lines.push(
        `Test the exported files of selected fixtures against the plugins' export tests.`,
        `You can run a plugin's export tests by executing:`,
        `\`$ node cli/run-export-test.js -p <plugin name> <fixtures>\``,
        ``
      );

      for (const taskResult of taskResults) {
        lines = lines.concat(taskResult);
      }
    }

    return pullRequest.updateComment({
      filename: path.relative(path.join(__dirname, `../../`), __filename),
      name: `Export files validity`,
      lines: lines
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


/**
 * @param {!object} changedComponents What components have been changed in this PR.
 * @returns {!Array.<Task>} What export valid tasks have to be done due to changes in the model. May be empty.
 */
function getTasksForModel(changedComponents) {
  let tasks = [];

  if (changedComponents.added.model ||
    changedComponents.modified.model ||
    changedComponents.renamed.model ||
    changedComponents.removed.model) {

    for (const [manKey, fixKey] of testFixtures) {
      tasks = tasks.concat(exportTests.map(([pluginKey, testKey]) => ({
        manKey,
        fixKey,
        pluginKey,
        testKey
      })));
    }
  }

  return tasks;
}

/**
 * @param {!object} changedComponents What components have been changed in this PR.
 * @returns {!Array.<Task>} What export valid tasks have to be done due to changes in plugins. May be empty.
 */
function getTasksForPlugins(changedComponents) {
  let tasks = [];

  const changedPlugins = changedComponents.added.exports.concat(changedComponents.modified.exports);

  for (const changedPlugin of changedPlugins) {
    const pluginExportTests = plugins.data[changedPlugin].exportTests;

    for (const [manKey, fixKey] of testFixtures) {
      tasks = tasks.concat(pluginExportTests.map(testKey => ({
        manKey,
        fixKey,
        pluginKey: changedPlugin,
        testKey
      })));
    }
  }

  return tasks;
}

/**
 * @param {!object} changedComponents What components have been changed in this PR.
 * @returns {!Array.<Task>} What export valid tasks have to be done due to changes in export tests. May be empty.
 */
function getTasksForExportTests(changedComponents) {
  let tasks = [];

  const changedExportTests = changedComponents.added.exportTests.concat(changedComponents.modified.exportTests);

  for (const [manKey, fixKey] of testFixtures) {
    tasks = tasks.concat(changedExportTests.map(([pluginKey, testKey]) => ({
      manKey,
      fixKey,
      pluginKey,
      testKey
    })));
  }

  return tasks;
}

/**
 * @param {!object} changedComponents What components have been changed in this PR.
 * @returns {!Array.<Task>} What export valid tasks have to be done due to changes in fixtures. May be empty.
 */
function getTasksForFixtures(changedComponents) {
  let tasks = [];

  const fixtures = changedComponents.added.fixtures.concat(changedComponents.modified.fixtures, changedComponents.renamed.fixtures);

  for (const [manKey, fixKey] of fixtures) {
    tasks = tasks.concat(exportTests.map(([pluginKey, testKey]) => ({
      manKey,
      fixKey,
      pluginKey,
      testKey
    })));
  }

  return tasks;
}

/**
 * @param {Task} task The export valid task to fulfill.
 * @returns {Promise} A promise resolving with an array of message lines.
 */
function getTaskPromise(task) {
  const plugin = require(path.join(__dirname, `../../plugins/${task.pluginKey}/export.js`));
  const test = require(path.join(__dirname, `../../plugins/${task.pluginKey}/exportTests/${task.testKey}.js`));
  const files = plugin.export([fixtureFromRepository(task.manKey, task.fixKey)]);

  let failed = false;
  return Promise.all(files.map(
    file => test(file)
      .then(() => {
        return `    <li>:heavy_check_mark: ${file.name}</li>`;
      })
      .catch(err => {
        failed = true;
        const errors = Array.isArray(err) ? err : [err];
        return `    <li><details><summary>:x: ${file.name}</summary>${errors.join(`<br />\n`)}</details></li>`;
      })
  ))
    .then(resultLines => {
      const emoji = failed ? `:x:` : `:heavy_check_mark:`;

      return [
        `<details>`,
        `  <summary>${emoji} <strong>${task.manKey} / ${task.fixKey}:</strong> ${task.pluginKey} / ${task.testKey}</summary>`,
        `  <ul>`
      ].concat(resultLines).concat([
        `  </ul>`,
        `</details>`
      ]);
    });
}
