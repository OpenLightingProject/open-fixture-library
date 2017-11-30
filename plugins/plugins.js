const path = require('path');
const fs = require('fs');

const plugins = {};

for (const pluginKey of fs.readdirSync(__dirname)) {
  const plugin = {
    import: null,
    export: null,
    exportTests: {}
  };

  const pluginPath = path.join(__dirname, pluginKey);

  // files are not plugins
  if (!fs.statSync(pluginPath).isDirectory()) {
    continue;
  }

  const importPath = path.join(pluginPath, 'import.js');
  if (fs.existsSync(importPath)) {
    try {
      plugin.import = require(importPath);
    }
    catch (error) {
      console.error(error.message);
    }
  }

  const exportPath = path.join(pluginPath, 'export.js');
  if (fs.existsSync(exportPath)) {
    try {
      plugin.export = require(exportPath);
    }
    catch (error) {
      console.error(error.message);
    }
  }

  const exportTestsPath = path.join(pluginPath, 'exportTests');
  if (fs.existsSync(exportTestsPath)) {
    try {
      for (const test of fs.readdirSync(exportTestsPath)) {
        const testKey = path.basename(test, path.extname(test));
        plugin.exportTests[testKey] = require(path.join(exportTestsPath, test));
      }
    }
    catch (error) {
      console.error(error.message);
    }
  }

  plugins[pluginKey] = plugin;
}

module.exports.all = plugins;

const exportFunctions = {};
for (const pluginKey of Object.keys(plugins)) {
  const plugin = plugins[pluginKey];
  if (plugin.export !== null) {
    exportFunctions[pluginKey] = plugin.export;
  }
}
module.exports.export = exportFunctions;

const importFunctions = {};
for (const pluginKey of Object.keys(plugins)) {
  const plugin = plugins[pluginKey];
  if (plugin.import !== null) {
    importFunctions[pluginKey] = plugin.import;
  }
}
module.exports.import = importFunctions;
