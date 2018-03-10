#!/usr/bin/node

const path = require(`path`);
const fs = require(`fs`);
const colors = require(`colors`);

const plugins = {
  importPlugins: [],
  exportPlugins: [],
  data: {}
};

const pluginDir = path.join(__dirname, `../plugins`);
for (const pluginKey of fs.readdirSync(pluginDir)) {
  const pluginPath = path.join(pluginDir, pluginKey);

  // files are not plugins
  if (!fs.statSync(pluginPath).isDirectory()) {
    continue;
  }

  const data = {
    name: null,
    exportTests: []
  };

  const importPath = path.join(pluginPath, `import.js`);
  if (fs.existsSync(importPath)) {
    try {
      const importPlugin = require(importPath);
      plugins.importPlugins.push(pluginKey);
      data.name = importPlugin.name;
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

      if (!data.name) {
        data.name = exportPlugin.name;
      }
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

  plugins.data[pluginKey] = data;
}

const filename = path.join(pluginDir, `plugins.json`);
fs.writeFile(filename, JSON.stringify(plugins, null, 2), `utf8`, error => {
  if (error) {
    console.error(`${colors.red(`[Fail]`)} Could not write plugin data file.`, error);
    process.exit(1);
  }
  console.log(`${colors.green(`[Success]`)} Updated plugin data file ${filename}`);
  process.exit(0);
});
