#!/usr/bin/node

const path = require(`path`);
const fs = require(`fs`);
const chalk = require(`chalk`);

const plugins = {
  importPlugins: [],
  exportPlugins: [],
  data: {}
};

const allPreviousVersions = {};

const pluginDir = path.join(__dirname, `../plugins`);
for (const pluginKey of fs.readdirSync(pluginDir)) {
  const pluginPath = path.join(pluginDir, pluginKey);

  // files are not plugins
  if (!fs.statSync(pluginPath).isDirectory()) {
    continue;
  }

  const data = {
    name: null
  };
  plugins.data[pluginKey] = data;

  const pluginJsonPath = path.join(pluginPath, `plugin.json`);
  if (fs.existsSync(pluginJsonPath)) {
    const pluginJson = require(pluginJsonPath);

    data.name = pluginJson.name;

    if (pluginJson.previousVersions) {
      Object.entries(pluginJson.previousVersions).forEach(([key, name]) => {
        allPreviousVersions[key] = {
          name,
          outdated: true,
          newPlugin: pluginKey
        };
      });
    }
  }
  else {
    console.error(`Plugin ${pluginKey} does not contain a plugin.json file.`);
    process.exit(1);
  }

  const importPath = path.join(pluginPath, `import.js`);
  if (fs.existsSync(importPath)) {
    try {
      const importPlugin = require(importPath);
      plugins.importPlugins.push(pluginKey);
      data.importPluginVersion = importPlugin.version;
    }
    catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

  const exportPath = path.join(pluginPath, `export.js`);
  if (fs.existsSync(exportPath)) {
    try {
      const exportPlugin = require(exportPath);
      plugins.exportPlugins.push(pluginKey);
      data.exportPluginVersion = exportPlugin.version;
      data.exportTests = [];
    }
    catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

  const exportTestsPath = path.join(pluginPath, `exportTests`);
  if (fs.existsSync(exportTestsPath)) {
    try {
      for (const test of fs.readdirSync(exportTestsPath)) {
        const testKey = path.basename(test, path.extname(test));
        data.exportTests.push(testKey);
      }
    }
    catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
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
Object.keys(plugins.data).sort().forEach(key => (sortedPluginData[key] = plugins.data[key]));
plugins.data = sortedPluginData;

const filename = path.join(pluginDir, `plugins.json`);
fs.writeFile(filename, `${JSON.stringify(plugins, null, 2)}\n`, `utf8`, error => {
  if (error) {
    console.error(`${chalk.red(`[Fail]`)} Could not write plugin data file.`, error);
    process.exit(1);
  }
  console.log(`${chalk.green(`[Success]`)} Updated plugin data file ${filename}`);
  process.exit(0);
});
