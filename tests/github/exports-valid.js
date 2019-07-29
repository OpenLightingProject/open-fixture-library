#!/usr/bin/node

const path = require(`path`);

const { fixtureFromRepository } = require(`../../lib/model.js`);
const pullRequest = require(`./pull-request.js`);

const plugins = require(`../../plugins/plugins.json`);

const exportTests = [];
for (const exportPluginKey of plugins.exportPlugins) {
  const plugin = plugins.data[exportPluginKey];

  exportTests.push(...plugin.exportTests.map(
    testKey => [exportPluginKey, testKey]
  ));
}

const testFixtures = require(`../test-fixtures.json`).map(
  fixture => [fixture.man, fixture.key]
);

let testErrored = false;

/**
 * @typedef {object} Task
 * @property {string} manKey
 * @property {string} fixKey
 * @property {string} pluginKey
 * @property {string} testKey
 */

(async () => {
  try {
    await pullRequest.checkEnv();
  }
  catch (error) {
    console.error(error);
    process.exit(0); // if the environment is not correct, just exit without failing
  }

  try {
    await pullRequest.init();
    const changedComponents = await pullRequest.fetchChangedComponents();

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

    if (tasks.length === 0) {
      await pullRequest.updateComment({
        filename: path.relative(path.join(__dirname, `../../`), __filename),
        name: `Export files validity`,
        lines: []
      });
      return;
    }

    const lines = [
      `Test the exported files of selected fixtures against the plugins' export tests.`,
      `You can run a plugin's export tests by executing:`,
      `\`$ node cli/run-export-test.js -p <plugin name> <fixtures>\``,
      ``
    ];

    const tooLongMessage = `:warning: The output of the script is too long to fit in this comment, please run it yourself locally!`;

    for (const task of tasks) {
      const taskResultLines = await getTaskPromise(task);

      // GitHub's official maximum comment length is 2^16=65536, but it's actually 2^18=262144.
      // We keep 2144 characters extra space as we don't count the comment header (added by our pull request module).
      if (lines.concat(taskResultLines, tooLongMessage).join(`\r\n`).length > 260000) {
        lines.push(tooLongMessage);
        break;
      }

      lines.push(...taskResultLines);
    }

    await pullRequest.updateComment({
      filename: path.relative(path.join(__dirname, `../../`), __filename),
      name: `Export files validity`,
      lines
    });

    if (testErrored) {
      throw new Error(`Unable to export some fixtures.`);
    }
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
})();


/**
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {array.<Task>} What export valid tasks have to be done due to changes in the model. May be empty.
 */
function getTasksForModel(changedComponents) {
  let tasks = [];

  if (changedComponents.added.model ||
    changedComponents.modified.model ||
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
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {array.<Task>} What export valid tasks have to be done due to changes in plugins. May be empty.
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
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {array.<Task>} What export valid tasks have to be done due to changes in export tests. May be empty.
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
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {array.<Task>} What export valid tasks have to be done due to changes in fixtures. May be empty.
 */
function getTasksForFixtures(changedComponents) {
  let tasks = [];

  const fixtures = changedComponents.added.fixtures.concat(changedComponents.modified.fixtures);

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
async function getTaskPromise(task) {
  const plugin = require(path.join(__dirname, `../../plugins/${task.pluginKey}/export.js`));
  const test = require(path.join(__dirname, `../../plugins/${task.pluginKey}/exportTests/${task.testKey}.js`));
  let emoji = `:heavy_check_mark:`;
  const detailListItems = [];

  try {
    const files = await plugin.export([fixtureFromRepository(task.manKey, task.fixKey)], {
      baseDir: path.join(__dirname, `../..`),
      date: new Date()
    });

    const resultListItems = await Promise.all(files.map(async file => {
      try {
        await test(file);
        return `:heavy_check_mark: ${file.name}`;
      }
      catch (err) {
        emoji = `:x:`;
        const errors = [].concat(err);
        return `<details><summary>:x: ${file.name}</summary>${errors.join(`<br />\n`)}</details>`;
      }
    }));
    detailListItems.push(...resultListItems);
  }
  catch (error) {
    emoji = `:heavy_exclamation_mark:`;
    detailListItems.push(`Unable to export fixture: ${error.message}`);
    testErrored = true;
  }

  return [
    `<details>`,
    `  <summary>${emoji} <strong>${task.manKey} / ${task.fixKey}:</strong> ${task.pluginKey} / ${task.testKey}</summary>`,
    `  <ul>`,
    ...detailListItems.map(listItem => `    <li>${listItem}</li>`),
    `  </ul>`,
    `</details>`
  ];
}
