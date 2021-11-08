#!/usr/bin/env node

import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import importJson from '../lib/import-json.js';

const plugins = {
  importPlugins: [],
  exportPlugins: [],
  data: {},
};

const allPreviousVersions = {};

const pluginDirectoryUrl = new URL(`../plugins/`, import.meta.url);

const directoryEntries = await readdir(pluginDirectoryUrl, { withFileTypes: true });
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
plugins.data = Object.fromEntries(
  Object.keys(plugins.data).sort().map(key => [key, plugins.data[key]]),
);

const filePath = fileURLToPath(new URL(`plugins.json`, pluginDirectoryUrl));

try {
  await writeFile(filePath, `${JSON.stringify(plugins, null, 2)}\n`, `utf8`);
  console.log(chalk.green(`[Success]`), `Updated plugin data file`, filePath);
  process.exit(0);
}
catch (error) {
  console.error(chalk.red(`[Fail]`), `Could not write plugin data file.`, error);
  process.exit(1);
}


/**
 * Reads information from the plugin's `plugin.json` file into `plugins` and `allPreviousVersions`.
 * @param {string} pluginKey The plugin key.
 */
async function readPluginJson(pluginKey) {
  try {
    const pluginJson = await importJson(`${pluginKey}/plugin.json`, pluginDirectoryUrl);
    plugins.data[pluginKey].name = pluginJson.name;

    if (pluginJson.previousVersions) {
      for (const [key, name] of Object.entries(pluginJson.previousVersions)) {
        allPreviousVersions[key] = {
          name,
          outdated: true,
          newPlugin: pluginKey,
        };
      }
    }
  }
  catch (error) {
    console.error(`Plugin ${pluginKey} does not contain a valid plugin.json file:`, error);
    process.exit(1);
  }
}

/**
 * Reads information from the plugin's `import.js` file (if it exists) into `plugins`.
 * @param {string} pluginKey The plugin key.
 */
async function readPluginImport(pluginKey) {
  try {
    const importPlugin = await import(new URL(`${pluginKey}/import.js`, pluginDirectoryUrl));
    plugins.importPlugins.push(pluginKey);
    plugins.data[pluginKey].importPluginVersion = importPlugin.version;
  }
  catch (error) {
    if (error.code === `ERR_MODULE_NOT_FOUND`) {
      // ignore non-existing file
      return;
    }

    console.error(`Import plugin ${pluginKey} could not be parsed:`, error.message);
    process.exit(1);
  }
}

/**
 * Reads information from the plugin's `export.js` file (if it exists) into `plugins`.
 * @param {string} pluginKey The plugin key.
 */
async function readPluginExport(pluginKey) {
  try {
    const exportPlugin = await import(new URL(`${pluginKey}/export.js`, pluginDirectoryUrl));
    plugins.exportPlugins.push(pluginKey);
    plugins.data[pluginKey].exportPluginVersion = exportPlugin.version;
    plugins.data[pluginKey].exportTests = [];
  }
  catch (error) {
    if (error.code === `ERR_MODULE_NOT_FOUND`) {
      // ignore non-existing file
      return;
    }

    console.error(`Export plugin ${pluginKey} could not be parsed:`, error.message);
    process.exit(1);
  }
}

/**
 * Adds the plugin's export tests (if any) to `plugins`.
 * @param {string} pluginKey The plugin key.
 */
async function readPluginExportTests(pluginKey) {
  try {
    const exportTestFiles = await readdir(new URL(`${pluginKey}/exportTests/`, pluginDirectoryUrl));
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

    console.error(`Export tests for plugin ${pluginKey} could not be read:`, error.message);
    process.exit(1);
  }
}
