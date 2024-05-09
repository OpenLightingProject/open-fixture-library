#!/usr/bin/env node

import '../../lib/load-env-file.js';

import diffPluginOutputs from '../../lib/diff-plugin-outputs.js';
import importJson from '../../lib/import-json.js';
import * as pullRequest from './pull-request.js';


/**
 * @typedef {object} Task
 * @property {string} manufacturerFixture The combined manufacturer / fixture key.
 * @property {string} currentPluginKey The plugin key in the current repo version.
 * @property {string} comparePluginKey The plugin key that should be compared against.
 */

// generate diff tasks describing the diffed plugins, fixtures and the reason for diffing (which component has changed)
try {
  await pullRequest.checkEnv();
  await pullRequest.init();
  const changedComponents = await pullRequest.fetchChangedComponents();

  const tasks = await getDiffTasks(changedComponents);

  if (tasks.length === 0) {
    await pullRequest.updateComment({
      fileUrl: new URL(import.meta.url),
      name: `Plugin export diff`,
      lines: [],
    });
    process.exit(0);
  }

  const lines = [
    `You can view your uncommitted changes in plugin exports manually by executing:`,
    `\`$ node cli/diff-plugin-outputs.js -p <plugin-key> [-c <compare-plugin-key>] <fixtures>\``,
    ``,
  ];

  const tooLongMessage = `⚠️ The output of the script is too long to fit in this comment, please run it yourself locally!`;

  for (const task of tasks) {
    const taskResultLines = await performTask(task);

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
    name: `Plugin export diff`,
    lines,
  });
}
catch (error) {
  console.error(error);
  process.exit(1);
}



/**
 * @param {object} changedComponents The PR's changed OFL components.
 * @returns {Promise<Task[]>} A Promise that resolves to an array of diff tasks to perform.
 */
async function getDiffTasks(changedComponents) {
  const testFixtures = await importJson(`../test-fixtures.json`, import.meta.url);
  const testFixtureKeys = testFixtures.map(fixture => `${fixture.man}/${fixture.key}`);

  const plugins = await importJson(`../../plugins/plugins.json`, import.meta.url);
  const usablePlugins = plugins.exportPlugins.filter(
    // don't diff new plugins and the ofl plugin (which essentially exports the source files)
    pluginKey => !changedComponents.added.exports.includes(pluginKey) && pluginKey !== `ofl`,
  );
  const addedFixtures = new Set(changedComponents.added.fixtures.map(([manufacturer, key]) => `${manufacturer}/${key}`));
  const usableTestFixtures = testFixtureKeys.filter(testFixture => !addedFixtures.has(testFixture));

  /** @type {Task[]} */
  return [...getTasksForModel(), ...(await getTasksForPlugins()), ...getTasksForFixtures()]
    .filter((task, index, array) => {
      const firstEqualTask = array.find(otherTask =>
        task.manufacturerFixture === otherTask.manufacturerFixture &&
        task.currentPluginKey === otherTask.currentPluginKey &&
        task.comparePluginKey === otherTask.comparePluginKey,
      );

      // remove duplicates
      return task === firstEqualTask;
    })
    .sort((a, b) => {
      const manufacturerFixtureCompare = a.manufacturerFixture.localeCompare(b.manufacturerFixture);
      const currentPluginCompare = a.currentPluginKey.localeCompare(b.currentPluginKey);
      const comparePluginCompare = a.comparePluginKey.localeCompare(b.comparePluginKey);

      if (manufacturerFixtureCompare !== 0) {
        return manufacturerFixtureCompare;
      }

      if (currentPluginCompare !== 0) {
        return currentPluginCompare;
      }

      return comparePluginCompare;
    });

  /**
   * @returns {Task[]} What export diff tasks have to be done due to changes in the model. May be empty.
   */
  function getTasksForModel() {
    const tasks = [];

    if (changedComponents.added.model ||
      changedComponents.modified.model ||
      changedComponents.removed.model) {

      for (const manufacturerFixture of usableTestFixtures) {
        tasks.push(...usablePlugins.map(pluginKey => ({
          manufacturerFixture,
          currentPluginKey: pluginKey,
          comparePluginKey: pluginKey,
        })));
      }
    }

    return tasks;
  }

  /**
   * @returns {Promise<Task[]>} A Promise that resolves to what export diff tasks have to be done due to changes in plugins. May be empty.
   */
  async function getTasksForPlugins() {
    const tasks = [];

    const changedPlugins = changedComponents.modified.exports;
    for (const changedPlugin of changedPlugins) {
      tasks.push(...usableTestFixtures.map(manufacturerFixture => ({
        manufacturerFixture,
        currentPluginKey: changedPlugin,
        comparePluginKey: changedPlugin,
      })));
    }

    const addedPlugins = changedComponents.added.exports;
    const removedPlugins = changedComponents.removed.exports;
    for (const addedPlugin of addedPlugins) {
      const pluginData = await importJson(`../../plugins/${addedPlugin}/plugin.json`, import.meta.url);

      if (pluginData.previousVersions) {
        const previousVersions = Object.keys(pluginData.previousVersions);
        const lastVersion = previousVersions.at(-1);

        if (removedPlugins.includes(lastVersion) || (plugins.exportPlugins.includes(lastVersion) && !addedPlugins.includes(lastVersion))) {
          tasks.push(...usableTestFixtures.map(manufacturerFixture => ({
            manufacturerFixture,
            currentPluginKey: addedPlugin,
            comparePluginKey: lastVersion,
          })));
        }
      }
    }

    return tasks;
  }

  /**
   * @returns {Task[]} What export diff tasks have to be done due to changes in fixtures. May be empty.
   */
  function getTasksForFixtures() {
    const tasks = [];

    for (const [manufacturerKey, fixtureKey] of changedComponents.modified.fixtures) {
      tasks.push(...usablePlugins.map(pluginKey => ({
        manufacturerFixture: `${manufacturerKey}/${fixtureKey}`,
        currentPluginKey: pluginKey,
        comparePluginKey: pluginKey,
      })));
    }

    return tasks;
  }
}

/**
 * @param {Task} task The export diff task to fulfill.
 * @returns {Promise<string[]>} An array of message lines.
 */
async function performTask(task) {
  const output = await diffPluginOutputs(task.currentPluginKey, task.comparePluginKey, process.env.GITHUB_PR_BASE_REF, [task.manufacturerFixture]);
  const changeFlags = getChangeFlags(output);
  const emoji = getEmoji(changeFlags);

  const pluginDisplayName = task.currentPluginKey === task.comparePluginKey ? task.currentPluginKey : `${task.comparePluginKey}->${task.currentPluginKey}`;

  const lines = [
    `<details>`,
    `<summary>${emoji} <strong>${task.manufacturerFixture}:</strong> ${pluginDisplayName}</summary>`,
  ];

  if (changeFlags.nothingChanged) {
    lines.push(`Outputted files not changed.`);
  }
  else {
    lines.push(`<blockquote>`);

    if (changeFlags.hasRemoved) {
      lines.push(
        `<strong>Removed files</strong>`,
        `<ul>`,
        ...output.removedFiles.map(file => `<li>${file}</li>`),
        `</ul>`,
      );
    }

    if (changeFlags.hasAdded) {
      lines.push(
        `<strong>Added files</strong>`,
        `<ul>`,
        ...output.addedFiles.map(file => `<li>${file}</li>`),
        `</ul>`,
      );
    }

    for (const file of Object.keys(output.changedFiles)) {
      lines.push(
        `<details>`,
        `<summary><strong>Changed outputted file <code>${file}</code></strong></summary>`,
        ``,
        `\`\`\`diff`,
        output.changedFiles[file],
        `\`\`\``,
        `</details>`,
      );
    }

    lines.push(`</blockquote>`);
  }

  lines.push(`</details>`);

  return lines;
}

/**
 * @typedef {object} ChangeFlags
 * @property {boolean} hasRemoved Whether any files were removed.
 * @property {boolean} hasAdded Whether any files were added.
 * @property {boolean} hasChanged Whether any files were changed.
 * @property {boolean} nothingChanged Whether changed at all.
 */

/**
 * @param {object} diffOutput Output object from {@link diffPluginOutputs}.
 * @returns {ChangeFlags} Object with change flags.
 */
function getChangeFlags(diffOutput) {
  const hasRemoved = diffOutput.removedFiles.length > 0;
  const hasAdded = diffOutput.addedFiles.length > 0;
  const hasChanged = Object.keys(diffOutput.changedFiles).length > 0;

  return {
    hasRemoved,
    hasAdded,
    hasChanged,
    nothingChanged: !hasRemoved && !hasAdded && !hasChanged,
  };
}

/**
 * @param {ChangeFlags} changeFlags Object with flags that tell what changed.
 * @returns {string} String containing a GitHub emoji depicting the changes.
 */
function getEmoji(changeFlags) {
  if (changeFlags.nothingChanged) {
    return `💤`;
  }

  if (changeFlags.hasChanged || (changeFlags.hasAdded && changeFlags.hasRemoved)) {
    return `🆚`;
  }

  if (changeFlags.hasAdded) {
    return `🆕`;
  }

  return `❌`;
}
