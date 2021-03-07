#!/usr/bin/env node

const path = require(`path`);

const { fixtureFromRepository } = require(`../../lib/model.js`);
const importJson = require(`../../lib/import-json.js`);
const pullRequest = require(`./pull-request.js`);

let plugins;
let exportTests;
let testFixtures;

let testErrored = false;

/**
 * @typedef {Object} Task
 * @property {String} manufacturerKey The manufacturer key of the fixture that should be tested.
 * @property {String} fixtureKey The key of the fixture that should be tested.
 * @property {String} pluginKey The key of the export plugin whose output should be tested.
 * @property {String} testKey The key of the export test that should be executed.
 */

(async () => {
  try {
    await pullRequest.checkEnv();
    await pullRequest.init();
    const changedComponents = await pullRequest.fetchChangedComponents();

    plugins = await importJson(`../../plugins/plugins.json`, __dirname);

    exportTests = [];
    for (const exportPluginKey of plugins.exportPlugins) {
      const plugin = plugins.data[exportPluginKey];

      exportTests.push(...plugin.exportTests.map(
        testKey => [exportPluginKey, testKey],
      ));
    }

    testFixtures = (await importJson(`../test-fixtures.json`, __dirname)).map(
      fixture => [fixture.man, fixture.key],
    );

    const tasks = getTasksForModel(changedComponents)
      .concat(getTasksForPlugins(changedComponents))
      .concat(getTasksForExportTests(changedComponents))
      .concat(getTasksForFixtures(changedComponents))
      .filter((task, index, array) => {
        const firstEqualTask = array.find(otherTask =>
          task.manufacturerKey === otherTask.manufacturerKey &&
          task.fixtureKey === otherTask.fixtureKey &&
          task.pluginKey === otherTask.pluginKey &&
          task.testKey === otherTask.testKey,
        );

        // remove duplicates
        return task === firstEqualTask;
      })
      .sort((a, b) => {
        const manufacturerCompare = a.manufacturerKey.localeCompare(b.manufacturerKey);
        const fixtureCompare = a.fixtureKey.localeCompare(b.fixtureKey);
        const pluginCompare = a.pluginKey.localeCompare(b.pluginKey);
        const testCompare = a.testKey.localeCompare(b.testKey);

        if (manufacturerCompare !== 0) {
          return manufacturerCompare;
        }

        if (fixtureCompare !== 0) {
          return fixtureCompare;
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
        lines: [],
      });
      return;
    }

    const lines = [
      `Test the exported files of selected fixtures against the plugins' export tests.`,
      `You can run a plugin's export tests by executing:`,
      `\`$ node cli/run-export-test.js -p <plugin name> <fixtures>\``,
      ``,
    ];

    const tooLongMessage = `:warning: The output of the script is too long to fit in this comment, please run it yourself locally!`;

    for (const task of tasks) {
      const taskResultLines = await getTaskPromise(task);

      // GitHub's official maximum comment length is 2**16 = 65_536, but it's actually 2**18 = 262_144.
      // We keep 2144 characters extra space as we don't count the comment header (added by our pull request module).
      if (lines.concat(taskResultLines, tooLongMessage).join(`\r\n`).length > 260_000) {
        lines.push(tooLongMessage);
        break;
      }

      lines.push(...taskResultLines);
    }

    await pullRequest.updateComment({
      filename: path.relative(path.join(__dirname, `../../`), __filename),
      name: `Export files validity`,
      lines,
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
 * @param {Object} changedComponents What components have been changed in this PR.
 * @returns {Array.<Task>} What export valid tasks have to be done due to changes in the model. May be empty.
 */
function getTasksForModel(changedComponents) {
  const tasks = [];

  if (changedComponents.added.model ||
    changedComponents.modified.model ||
    changedComponents.removed.model) {

    for (const [manufacturerKey, fixtureKey] of testFixtures) {
      tasks.push(...exportTests.map(([pluginKey, testKey]) => ({
        manufacturerKey,
        fixtureKey,
        pluginKey,
        testKey,
      })));
    }
  }

  return tasks;
}

/**
 * @param {Object} changedComponents What components have been changed in this PR.
 * @returns {Array.<Task>} What export valid tasks have to be done due to changes in plugins. May be empty.
 */
function getTasksForPlugins(changedComponents) {
  const tasks = [];

  const changedPlugins = changedComponents.added.exports.concat(changedComponents.modified.exports);

  for (const changedPlugin of changedPlugins) {
    const pluginExportTests = plugins.data[changedPlugin].exportTests;

    for (const [manufacturerKey, fixtureKey] of testFixtures) {
      tasks.push(...pluginExportTests.map(testKey => ({
        manufacturerKey,
        fixtureKey,
        pluginKey: changedPlugin,
        testKey,
      })));
    }
  }

  return tasks;
}

/**
 * @param {Object} changedComponents What components have been changed in this PR.
 * @returns {Array.<Task>} What export valid tasks have to be done due to changes in export tests. May be empty.
 */
function getTasksForExportTests(changedComponents) {
  const tasks = [];

  const changedExportTests = changedComponents.added.exportTests.concat(changedComponents.modified.exportTests);

  for (const [manufacturerKey, fixtureKey] of testFixtures) {
    tasks.push(...changedExportTests.map(([pluginKey, testKey]) => ({
      manufacturerKey,
      fixtureKey,
      pluginKey,
      testKey,
    })));
  }

  return tasks;
}

/**
 * @param {Object} changedComponents What components have been changed in this PR.
 * @returns {Array.<Task>} What export valid tasks have to be done due to changes in fixtures. May be empty.
 */
function getTasksForFixtures(changedComponents) {
  const tasks = [];

  const fixtures = changedComponents.added.fixtures.concat(changedComponents.modified.fixtures);

  for (const [manufacturerKey, fixtureKey] of fixtures) {
    tasks.push(...exportTests.map(([pluginKey, testKey]) => ({
      manufacturerKey,
      fixtureKey,
      pluginKey,
      testKey,
    })));
  }

  return tasks;
}

/**
 * @param {Task} task The export valid task to fulfill.
 * @returns {Promise} A promise resolving with an array of message lines.
 */
async function getTaskPromise(task) {
  const plugin = require(`../../plugins/${task.pluginKey}/export.js`);
  const test = require(`../../plugins/${task.pluginKey}/exportTests/${task.testKey}.js`);
  let emoji = `:heavy_check_mark:`;
  const detailListItems = [];

  try {
    const files = await plugin.exportFixtures(
      [await fixtureFromRepository(task.manufacturerKey, task.fixtureKey)],
      {
        baseDirectory: path.join(__dirname, `../..`),
        date: new Date(),
      },
    );

    const resultListItems = await Promise.all(files.map(async file => {
      try {
        await test(file, files);
        return `:heavy_check_mark: ${file.name}`;
      }
      catch (error) {
        emoji = `:x:`;
        const errors = [].concat(error);
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
    `  <summary>${emoji} <strong>${task.manufacturerKey} / ${task.fixtureKey}:</strong> ${task.pluginKey} / ${task.testKey}</summary>`,
    `  <ul>`,
    ...detailListItems.map(listItem => `    <li>${listItem}</li>`),
    `  </ul>`,
    `</details>`,
  ];
}
