#!/usr/bin/node

const path = require(`path`);
const {
  readdir,
  readFile,
  stat,
  writeFile,
} = require(`fs/promises`);
const chalk = require(`chalk`);

const plugins = {
  importPlugins: [],
  exportPlugins: [],
  data: {},
};

const allPreviousVersions = {};

const pluginDirectory = path.join(__dirname, `../plugins`);

(async () => {
  const directoryEntries = await readdir(pluginDirectory, { withFileTypes: true });
  const pluginKeys = directoryEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

  for (const pluginKey of pluginKeys) {
    plugins.data[pluginKey] = {};

    await readPluginJson(pluginKey);
    await readPluginImport(pluginKey);
    await readPluginExport(pluginKey);
    await readPluginExportTests(pluginKey);
  }

  for (const [key, data] of Object.entries(allPreviousVersions)) {
    if (key in plugins.data) {
      plugins.data[key].newPlugin = data.newPlugin;
    }
    else {
      plugins.data[key] = data;
    }
  }

  // sort plugin data object by key
  const sortedPluginData = {};
  Object.keys(plugins.data).sort().forEach(key => {
    sortedPluginData[key] = plugins.data[key];
  });
  plugins.data = sortedPluginData;

  const filename = path.join(pluginDirectory, `plugins.json`);

  try {
    await writeFile(filename, `${JSON.stringify(plugins, null, 2)}\n`, `utf8`);
    console.log(chalk.green(`[Success]`), `Updated plugin data file`, filename);
    process.exit(0);
  }
  catch (error) {
    console.error(chalk.red(`[Fail]`), `Could not write plugin data file.`, error);
    process.exit(1);
  }
})();


/**
 * Reads information from the plugin's `plugin.json` file into `plugins` and `allPreviousVersions`.
 * @param {String} pluginKey The plugin key.
 */
async function readPluginJson(pluginKey) {
  const pluginJsonPath = path.join(pluginDirectory, pluginKey, `plugin.json`);
  try {
    const pluginJson = JSON.parse(await readFile(pluginJsonPath));
    plugins.data[pluginKey].name = pluginJson.name;

    if (pluginJson.previousVersions) {
      Object.entries(pluginJson.previousVersions).forEach(([key, name]) => {
        allPreviousVersions[key] = {
          name,
          outdated: true,
          newPlugin: pluginKey,
        };
      });
    }
  }
  catch (error) {
    console.error(`Plugin ${pluginKey} does not contain a valid plugin.json file:`, error);
    process.exit(1);
  }
}

/**
 * Reads information from the plugin's `import.js` file (if it exists) into `plugins`.
 * @param {String} pluginKey The plugin key.
 */
async function readPluginImport(pluginKey) {
  const importPath = path.join(pluginDirectory, pluginKey, `import.js`);
  try {
    await stat(importPath);
    const importPlugin = require(importPath);
    plugins.importPlugins.push(pluginKey);
    plugins.data[pluginKey].importPluginVersion = importPlugin.version;
  }
  catch (error) {
    if (error.code === `ENOENT`) {
      // ignore non-existing file
      return;
    }

    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Reads information from the plugin's `export.js` file (if it exists) into `plugins`.
 * @param {String} pluginKey The plugin key.
 */
async function readPluginExport(pluginKey) {
  const exportPath = path.join(pluginDirectory, pluginKey, `export.js`);
  try {
    await stat(exportPath);
    const exportPlugin = require(exportPath);
    plugins.exportPlugins.push(pluginKey);
    plugins.data[pluginKey].exportPluginVersion = exportPlugin.version;
    plugins.data[pluginKey].exportTests = [];
  }
  catch (error) {
    if (error.code === `ENOENT`) {
      // ignore non-existing file
      return;
    }

    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Adds the plugin's export tests (if any) to `plugins`.
 * @param {String} pluginKey The plugin key.
 */
async function readPluginExportTests(pluginKey) {
  const exportTestsPath = path.join(pluginDirectory, pluginKey, `exportTests`);
  try {
    const exportTestFiles = await readdir(exportTestsPath);
    for (const test of exportTestFiles) {
      const testKey = path.basename(test, path.extname(test));
      plugins.data[pluginKey].exportTests.push(testKey);
    }
  }
  catch (error) {
    if (error.code === `ENOENT`) {
      // ignore non-existing directory
      return;
    }

    console.error(error.message);
    process.exit(1);
  }
}
