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

      const fixtures = changedComponents.added.fixtures.concat(changedComponents.modified.fixtures, changedComponents.renamed.fixtures);

      for (const [manKey, fixKey] of fixtures) {
        tasks = tasks.concat(usablePlugins.map(pluginKey => ({
          manFix: `${manKey}/${fixKey}`,
          pluginKey
        })));
      }

      return tasks;
    }
  })
  .then(tasks => {
    let resultLines = [];
    tasks.forEach(task => {
      resultLines = resultLines.concat(performTask(task));
    });

    return pullRequest.updateComment({
      filename: path.relative(path.join(__dirname, `../../`), __filename),
      name: `Plugin export diff`,
      lines: [
        `You can run view your uncommited changes in plugin exports manually by executing:`,
        `\`$ node cli/diff-plugin-outputs.js -p <plugin name> <fixtures>\``,
        ``
      ].concat(resultLines)
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


/**
 * @param {Task} task The export diff task to fulfill.
 * @returns {Array.<string>} An array of message lines.
 */
function performTask(task) {
  const output = diffPluginOutputs(task.pluginKey, process.env.TRAVIS_BRANCH, [task.manFix]);

  const hasRemoved = output.removedFiles.length > 0;
  const hasAdded = output.addedFiles.length > 0;
  const hasChanged = Object.keys(output.changedFiles).length > 0;


  const emoji = (hasRemoved || hasAdded || hasChanged) ? `:x:` : `:heavy_check_mark:`;

  let lines = [
    `<details>`,
    `<summary>${emoji} <strong>${task.manFix} ${task.pluginKey}</strong></summary>`
  ];

  if (!hasRemoved && !hasAdded && !hasChanged) {
    lines.push(`Outputted files not changed.`);
  }

  if (hasRemoved) {
    lines.push(`*Removed files*`);
    lines = lines.concat(output.removedFiles.map(file => `- ${file}`), ``);
  }

  if (hasAdded) {
    lines.push(`*Added files*`);
    lines = lines.concat(output.addedFiles.map(file => `- ${file}`), ``);
  }

  for (const file of Object.keys(output.changedFiles)) {
    lines.push(`<details>`);
    lines.push(`<summary><strong>Changed outputted file <code>${file}</code></strong></summary>`, ``);
    lines.push(`\`\`\`diff`);
    lines.push(output.changedFiles[file]);
    lines.push(`\`\`\``);
    lines.push(`</details>`);
  }

  lines.push(`</details>`);

  return lines;
}
