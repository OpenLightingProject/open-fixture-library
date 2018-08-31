#!/usr/bin/node

const path = require(`path`);

const diffPluginOutputs = require(`../../lib/diff-plugin-outputs.js`);
const exportPlugins = require(`../../plugins/plugins.json`).exportPlugins.filter(pluginKey => pluginKey !== `ofl`); // don't diff (essentially) the source files
const pullRequest = require(`./pull-request.js`);

require(`../../lib/load-env-file.js`);

const testFixtures = require(`../test-fixtures.json`).map(
  fixture => `${fixture.man}/${fixture.key}`
);

/**
 * @typedef {object} Task
 * @property {string} manFix
 * @property {string} pluginKey
 */

// generate diff tasks describing the diffed plugins, fixtures and the reason for diffing (which component has changed)
pullRequest.checkEnv()
  .catch(error => {
    console.error(error);
    process.exit(0); // if the environment is not correct, just exit without failing
  })
  .then(() => pullRequest.init())
  .then(prData => pullRequest.fetchChangedComponents())
  .then(changedComponents => {
    const usablePlugins = exportPlugins.filter(plugin => !changedComponents.added.exports.includes(plugin));
    const addedFixtures = changedComponents.added.fixtures.map(([man, key]) => `${man}/${key}`);
    const usableTestFixtures = testFixtures.filter(testFixture => !addedFixtures.includes(testFixture));

    /** @type {Array.<Task>} */
    const tasks = getTasksForModel()
      .concat(getTasksForPlugins())
      .concat(getTasksForFixtures())
      .filter((task, index, arr) => {
        const firstEqualTask = arr.find(otherTask =>
          task.manFix === otherTask.manFix &&
          task.pluginKey === otherTask.pluginKey
        );

        // remove duplicates
        return task === firstEqualTask;
      })
      .sort((a, b) => {
        const manFixCompare = a.manFix.localeCompare(b.manFix);
        const pluginCompare = a.pluginKey.localeCompare(b.pluginKey);

        if (manFixCompare !== 0) {
          return manFixCompare;
        }

        return pluginCompare;
      });

    return tasks;

    /**
     * @returns {!Array.<Task>} What export diff tasks have to be done due to changes in the model. May be empty.
     */
    function getTasksForModel() {
      let tasks = [];

      if (changedComponents.added.model ||
        changedComponents.modified.model ||
        changedComponents.renamed.model ||
        changedComponents.removed.model) {

        for (const manFix of usableTestFixtures) {
          tasks = tasks.concat(usablePlugins.map(pluginKey => ({
            manFix,
            pluginKey
          })));
        }
      }

      return tasks;
    }

    /**
     * @returns {!Array.<Task>} What export diff tasks have to be done due to changes in plugins. May be empty.
     */
    function getTasksForPlugins() {
      let tasks = [];

      const changedPlugins = changedComponents.added.exports.concat(changedComponents.modified.exports);

      for (const changedPlugin of changedPlugins) {
        tasks = tasks.concat(usableTestFixtures.map(manFix => ({
          manFix,
          pluginKey: changedPlugin
        })));
      }

      return tasks;
    }

    /**
     * @returns {!Array.<Task>} What export diff tasks have to be done due to changes in fixtures. May be empty.
     */
    function getTasksForFixtures() {
      let tasks = [];

      for (const [manKey, fixKey] of changedComponents.modified.fixtures) {
        tasks = tasks.concat(usablePlugins.map(pluginKey => ({
          manFix: `${manKey}/${fixKey}`,
          pluginKey
        })));
      }

      return tasks;
    }
  })
  .then(async tasks => {
    if (tasks.length === 0) {
      return pullRequest.updateComment({
        filename: path.relative(path.join(__dirname, `../../`), __filename),
        name: `Plugin export diff`,
        lines: []
      });
    }

    let lines = [
      `You can run view your uncommitted changes in plugin exports manually by executing:`,
      `\`$ node cli/diff-plugin-outputs.js -p <plugin name> <fixtures>\``,
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

      lines = lines.concat(taskResultLines);
    }

    return pullRequest.updateComment({
      filename: path.relative(path.join(__dirname, `../../`), __filename),
      name: `Plugin export diff`,
      lines
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


/**
 * @param {!Task} task The export diff task to fulfill.
 * @returns {!Promise.<!Array.<string>>} An array of message lines.
 */
async function performTask(task) {
  const output = await diffPluginOutputs(task.pluginKey, process.env.TRAVIS_BRANCH, [task.manFix]);
  const changeFlags = getChangeFlags(output);
  const emoji = getEmoji(changeFlags);

  let lines = [
    `<details>`,
    `<summary>${emoji} <strong>${task.manFix}:</strong> ${task.pluginKey}</summary>`
  ];

  if (changeFlags.nothingChanged) {
    lines.push(`Outputted files not changed.`);
  }
  else {
    lines.push(`<blockquote>`);

    if (changeFlags.hasRemoved) {
      lines.push(`<strong>Removed files</strong>`);
      lines = lines.concat(`<ul>`, output.removedFiles.map(file => `<li>${file}</li>`), `</ul>`);
    }

    if (changeFlags.hasAdded) {
      lines.push(`<strong>Added files</strong>`);
      lines = lines.concat(`<ul>`, output.addedFiles.map(file => `<li>${file}</li>`), `</ul>`);
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
 * @typedef ChangeFlags
 * @type !object
 * @property {!boolean} hasRemoved Whether any files were removed.
 * @property {!boolean} hasAdded Whether any files were added.
 * @property {!boolean} hasChanged Whether any files were changed.
 * @property {!boolean} nothingChanged Whether changed at all.
 */

/**
 * @param {!object} diffOutput Output object from @see diffPluginOutputs.
 * @returns {!ChangeFlags} Object with change flags.
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
 * @param {!ChangeFlags} changeFlags Object with flags that tell what changed.
 * @returns {!string} String containing a GitHub emoji depicting the changes.
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
