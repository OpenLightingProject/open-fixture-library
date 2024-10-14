#!/usr/bin/env node

import { fileURLToPath } from 'url';

import importJson from '../../lib/import-json.js';
import { fixtureFromRepository } from '../../lib/model.js';
import * as pullRequest from './pull-request.js';

let plugins;
let exportTests;
let testFixtureKeys;

let testErrored = false;

/**
 * @typedef {object} Task
 * @property {string} manufacturerKey The manufacturer key of the fixture that should be tested.
 * @property {string} fixtureKey The key of the fixture that should be tested.
 * @property {string} pluginKey The key of the export plugin whose output should be tested.
 * @property {string} testKey The key of the export test that should be executed.
 */

try {
  await pullRequest.checkEnv();
  await pullRequest.init();
  const changedComponents = await pullRequest.fetchChangedComponents();

  plugins = await importJson(`../../plugins/plugins.json`, import.meta.url);

  exportTests = [];
  for (const exportPluginKey of plugins.exportPlugins) {
    const plugin = plugins.data[exportPluginKey];

    exportTests.push(...plugin.exportTests.map(
      testKey => [exportPluginKey, testKey],
    ));
  }

  const testFixtures = await importJson(`../test-fixtures.json`, import.meta.url);
  testFixtureKeys = testFixtures.map(fixture => [fixture.man, fixture.key]);

  const tasks = [
    ...getTasksForModel(changedComponents),
    ...getTasksForPlugins(changedComponents),
    ...getTasksForExportTests(changedComponents),
    ...getTasksForFixtures(changedComponents),
  ]
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
      fileUrl: new URL(import.meta.url),
      name: `Export files validity`,
      lines: [],
    });
    process.exit(0);
  }

  const lines = [
    `Test the exported files of selected fixtures against the plugins' export tests.`,
    `You can run a plugin's export tests by executing:`,
    `\`$ node cli/run-export-test.js -p <plugin name> <fixtures>\``,
    ``,
  ];

  const tooLongMessage = `⚠️ The output of the script is too long to fit in this comment, please run it yourself locally!`;

  for (const task of tasks) {
    const taskResultLines = await getTaskPromise(task);

    // GitHub's official maximum comment length is 2**16 = 65_536, but it's actually 2**18 = 262_144.
    // We keep 2144 characters extra space as we don't count the comment header (added by our pull request module).
    if ([...lines, ...taskResultLines, tooLongMessage].join(`\r\n`).length > 260_000) {
      lines.push(tooLongMessage);
      break;
    }

    lines.push(...taskResultLines);
  }

  await pullRequest.updateComment({
    fileUrl: new URL(import.meta.url),
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


/**
 * @param {[pluginKey: string, testKey: string][]} tests An array of export tests.
 * @param {string} manufacturerKey The manufacturer key of the fixture that should be tested.
 * @param {string} fixtureKey The key of the fixture that should be tested.
 * @returns {Task[]} An array of export valid tasks.
 */
function mapExportTestsToTasks(tests, manufacturerKey, fixtureKey) {
  return tests.map(([pluginKey, testKey]) => ({
    manufacturerKey,
    fixtureKey,
    pluginKey,
    testKey,
  }));
}

/**
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {Task[]} What export valid tasks have to be done due to changes in the model. May be empty.
 */
function getTasksForModel(changedComponents) {
  const tasks = [];

  if (changedComponents.added.model ||
    changedComponents.modified.model ||
    changedComponents.removed.model) {

    for (const [manufacturerKey, fixtureKey] of testFixtureKeys) {
      tasks.push(...mapExportTestsToTasks(exportTests, manufacturerKey, fixtureKey));
    }
  }

  return tasks;
}

/**
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {Task[]} What export valid tasks have to be done due to changes in plugins. May be empty.
 */
function getTasksForPlugins(changedComponents) {
  const tasks = [];

  const changedPlugins = [...changedComponents.added.exports, ...changedComponents.modified.exports];

  for (const changedPlugin of changedPlugins) {
    const pluginExportTests = plugins.data[changedPlugin].exportTests;

    for (const [manufacturerKey, fixtureKey] of testFixtureKeys) {
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
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {Task[]} What export valid tasks have to be done due to changes in export tests. May be empty.
 */
function getTasksForExportTests(changedComponents) {
  const tasks = [];

  const changedExportTests = [...changedComponents.added.exportTests, ...changedComponents.modified.exportTests];

  for (const [manufacturerKey, fixtureKey] of testFixtureKeys) {
    tasks.push(...mapExportTestsToTasks(changedExportTests, manufacturerKey, fixtureKey));
  }

  return tasks;
}

/**
 * @param {object} changedComponents What components have been changed in this PR.
 * @returns {Task[]} What export valid tasks have to be done due to changes in fixtures. May be empty.
 */
function getTasksForFixtures(changedComponents) {
  const tasks = [];

  const fixtures = [...changedComponents.added.fixtures, ...changedComponents.modified.fixtures];

  for (const [manufacturerKey, fixtureKey] of fixtures) {
    tasks.push(...mapExportTestsToTasks(exportTests, manufacturerKey, fixtureKey));
  }

  return tasks;
}

/**
 * @param {Task} task The export valid task to fulfill.
 * @returns {Promise} A promise resolving with an array of message lines.
 */
async function getTaskPromise(task) {
  const plugin = await import(`../../plugins/${task.pluginKey}/export.js`);
  const { default: test } = await import(`../../plugins/${task.pluginKey}/exportTests/${task.testKey}.js`);

  let emoji = `✔️`;
  const detailListItems = [];

  try {
    const files = await plugin.exportFixtures(
      [await fixtureFromRepository(task.manufacturerKey, task.fixtureKey)],
      {
        baseDirectory: fileURLToPath(new URL(`../../`, import.meta.url)),
        date: new Date(),
      },
    );

    const resultListItems = await Promise.all(files.map(async file => {
      try {
        await test(file, files);
        return `✔️ ${file.name}`;
      }
      catch (error) {
        emoji = `❌`;
        const errors = [error].flat().join(`<br />\n`);
        return `<details><summary>❌ ${file.name}</summary>${errors}</details>`;
      }
    }));
    detailListItems.push(...resultListItems);
  }
  catch (error) {
    emoji = `❗`;
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
