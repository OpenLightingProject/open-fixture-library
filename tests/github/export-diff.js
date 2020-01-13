#!/usr/bin/node

const path = require(`path`);

const diffPluginOutputs = require(`../../lib/diff-plugin-outputs.js`);
const plugins = require(`../../plugins/plugins.json`);
const exportPlugins = plugins.exportPlugins.filter(pluginKey => pluginKey !== `ofl`); // don't diff (essentially) the source files
const pullRequest = require(`./pull-request.js`);

require(`../../lib/load-env-file.js`);

const testFixtures = require(`../test-fixtures.json`).map(
  fixture => `${fixture.man}/${fixture.key}`
);

/**
 * @typedef {Object} Task
 * @property {String} manFix The combined manufacturer / fixture key.
 * @property {String} currentPluginKey The plugin key in the current repo version.
 * @property {String} comparePluginKey The plugin key that should be compared against.
 */

// generate diff tasks describing the diffed plugins, fixtures and the reason for diffing (which component has changed)
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

    const tasks = getDiffTasks(changedComponents);

    if (tasks.length === 0) {
      await pullRequest.updateComment({
        filename: path.relative(path.join(__dirname, `../../`), __filename),
        name: `Plugin export diff`,
        lines: []
      });
      return;
    }

    const lines = [
      `You can view your uncommitted changes in plugin exports manually by executing:`,
      `\`$ node cli/diff-plugin-outputs.js -p <plugin-key> [-c <compare-plugin-key>] <fixtures>\``,
      ``
    ];

    const tooLongMessage = `:warning: The output of the script is too long to fit in this comment, please run it yourself locally!`;

    for (const task of tasks) {
      const taskResultLines = await performTask(task);

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
      name: `Plugin export diff`,
      lines
    });
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
})();



/**
 * @param {Object} changedComponents The PR's changed OFL components.
 * @returns {Array.<Task>} An array of diff tasks to perform.
 */
function getDiffTasks(changedComponents) {
  const usablePlugins = exportPlugins.filter(plugin => !changedComponents.added.exports.includes(plugin));
  const addedFixtures = changedComponents.added.fixtures.map(([man, key]) => `${man}/${key}`);
  const usableTestFixtures = testFixtures.filter(testFixture => !addedFixtures.includes(testFixture));

  /** @type {Array.<Task>} */
  return getTasksForModel().concat(getTasksForPlugins(), getTasksForFixtures())
    .filter((task, index, arr) => {
      const firstEqualTask = arr.find(otherTask =>
        task.manFix === otherTask.manFix &&
        task.currentPluginKey === otherTask.currentPluginKey &&
        task.comparePluginKey === otherTask.comparePluginKey
      );

      // remove duplicates
      return task === firstEqualTask;
    })
    .sort((a, b) => {
      const manFixCompare = a.manFix.localeCompare(b.manFix);
      const currentPluginCompare = a.currentPluginKey.localeCompare(b.currentPluginKey);
      const comparePluginCompare = a.comparePluginKey.localeCompare(b.comparePluginKey);

      if (manFixCompare !== 0) {
        return manFixCompare;
      }

      if (currentPluginCompare !== 0) {
        return currentPluginCompare;
      }

      return comparePluginCompare;
    });

  /**
   * @returns {Array.<Task>} What export diff tasks have to be done due to changes in the model. May be empty.
   */
  function getTasksForModel() {
    const tasks = [];

    if (changedComponents.added.model ||
      changedComponents.modified.model ||
      changedComponents.removed.model) {

      for (const manFix of usableTestFixtures) {
        tasks.push(...usablePlugins.map(pluginKey => ({
          manFix,
          currentPluginKey: pluginKey,
          comparePluginKey: pluginKey
        })));
      }
    }

    return tasks;
  }

  /**
   * @returns {Array.<Task>} What export diff tasks have to be done due to changes in plugins. May be empty.
   */
  function getTasksForPlugins() {
    const tasks = [];

    const changedPlugins = changedComponents.modified.exports;
    for (const changedPlugin of changedPlugins) {
      tasks.push(...usableTestFixtures.map(manFix => ({
        manFix,
        currentPluginKey: changedPlugin,
        comparePluginKey: changedPlugin
      })));
    }

    const addedPlugins = changedComponents.added.exports;
    const removedPlugins = changedComponents.removed.exports;
    for (const addedPlugin of addedPlugins) {
      const pluginData = require(`../../plugins/${addedPlugin}/plugin.json`);

      if (pluginData.previousVersions) {
        const previousVersions = Object.keys(pluginData.previousVersions);
        const lastVersion = previousVersions[previousVersions.length - 1];

        if (removedPlugins.includes(lastVersion) || (plugins.exportPlugins.includes(lastVersion) && !addedPlugins.includes(lastVersion))) {
          tasks.push(...usableTestFixtures.map(manFix => ({
            manFix,
            currentPluginKey: addedPlugin,
            comparePluginKey: lastVersion
          })));
        }
      }
    }

    return tasks;
  }

  /**
   * @returns {Array.<Task>} What export diff tasks have to be done due to changes in fixtures. May be empty.
   */
  function getTasksForFixtures() {
    const tasks = [];

    for (const [manKey, fixKey] of changedComponents.modified.fixtures) {
      tasks.push(...usablePlugins.map(pluginKey => ({
        manFix: `${manKey}/${fixKey}`,
        currentPluginKey: pluginKey,
        comparePluginKey: pluginKey
      })));
    }

    return tasks;
  }
}

/**
 * @param {Task} task The export diff task to fulfill.
 * @returns {Promise.<Array.<String>>} An array of message lines.
 */
async function performTask(task) {
  const output = await diffPluginOutputs(task.currentPluginKey, task.comparePluginKey, process.env.TRAVIS_BRANCH, [task.manFix]);
  const changeFlags = getChangeFlags(output);
  const emoji = getEmoji(changeFlags);

  const pluginDisplayName = task.currentPluginKey === task.comparePluginKey ? task.currentPluginKey : `${task.comparePluginKey}->${task.currentPluginKey}`;

  const lines = [
    `<details>`,
    `<summary>${emoji} <strong>${task.manFix}:</strong> ${pluginDisplayName}</summary>`
  ];

  if (changeFlags.nothingChanged) {
    lines.push(`Outputted files not changed.`);
  }
  else {
    lines.push(`<blockquote>`);

    if (changeFlags.hasRemoved) {
      lines.push(`<strong>Removed files</strong>`);
      lines.push(`<ul>`, ...output.removedFiles.map(file => `<li>${file}</li>`), `</ul>`);
    }

    if (changeFlags.hasAdded) {
      lines.push(`<strong>Added files</strong>`);
      lines.push(`<ul>`, ...output.addedFiles.map(file => `<li>${file}</li>`), `</ul>`);
    }

    for (const file of Object.keys(output.changedFiles)) {
      lines.push(`<details>`);
      lines.push(`<summary><strong>Changed outputted file <code>${file}</code></strong></summary>`, ``);
      lines.push(`\`\`\`diff`);
      lines.push(output.changedFiles[file]);
      lines.push(`\`\`\``);
      lines.push(`</details>`);
    }

    lines.push(`</blockquote>`);
  }

  lines.push(`</details>`);

  return lines;
}

/**
 * @typedef {Object} ChangeFlags
 * @property {Boolean} hasRemoved Whether any files were removed.
 * @property {Boolean} hasAdded Whether any files were added.
 * @property {Boolean} hasChanged Whether any files were changed.
 * @property {Boolean} nothingChanged Whether changed at all.
 */

/**
 * @param {Object} diffOutput Output object from {@link diffPluginOutputs}.
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
    nothingChanged: !hasRemoved && !hasAdded && !hasChanged
  };
}

/**
 * @param {ChangeFlags} changeFlags Object with flags that tell what changed.
 * @returns {String} String containing a GitHub emoji depicting the changes.
 */
function getEmoji(changeFlags) {
  if (changeFlags.nothingChanged) {
    return `:zzz:`;
  }

  if (changeFlags.hasChanged || (changeFlags.hasAdded && changeFlags.hasRemoved)) {
    return `:vs:`;
  }

  if (changeFlags.hasAdded) {
    return `:new:`;
  }

  return `:x:`;
}
