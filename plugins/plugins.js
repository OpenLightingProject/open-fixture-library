const path = require('path');
const fs = require('fs');

let plugins = [];

for (const pluginKey of fs.readdirSync(__dirname)) {
  let plugin = {
    key: pluginKey,
    import: null,
    export: null,
    exportTests: []
  };

  const pluginPath = path.join(__dirname, pluginKey);

  // files are not plugins
  if (!fs.statSync(pluginPath).isDirectory()) {
    continue;
  }

  const importPath = path.join(pluginPath, 'import.js');
  try {
    plugin.import = require(importPath);
  }
  catch (error) {
    console.info(error.message);
  }

  const exportPath = path.join(pluginPath, 'export.js');
  try {
    plugin.export = require(exportPath);
  }
  catch (error) {
    console.info(error.message);
  }

  const exportTestsPath = path.join(pluginPath, 'exportTests');
  try {
    for (const test of fs.readdirSync(exportTestsPath)) {
      const testKey = path.basename(test, path.extname(test));
      plugin.exportTests.push({
        key: testKey,
        test: require(path.join(exportTestsPath, test))
      });
    }
  }
  catch (error) {
    console.info(error.message);
  }

  plugins.push(plugin);
}

module.exports.all = plugins;

let exportFunctions = {};
for (const plugin of plugins) {
  if (plugin.export !== null) {
    exportFunctions[plugin.key] = plugin.export;
  }
}
module.exports.export = exportFunctions;

let importFunctions = {};
for (const plugin of plugins) {
  if (plugin.import !== null) {
    importFunctions[plugin.key] = plugin.import;
  }
}
module.exports.import = importFunctions;