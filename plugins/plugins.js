const path = require('path');
const fs = require('fs');

let plugins = {
  import: {},
  export: {}
};

for (const plugin of fs.readdirSync(__dirname)) {
  const pluginPath = path.join(__dirname, plugin);
  const importPath = path.join(pluginPath, 'import.js');
  const exportPath = path.join(pluginPath, 'export.js');

  // files are not plugins
  if (!fs.statSync(pluginPath).isDirectory()) {
    continue;
  }

  try {
    plugins.import[plugin] = require(importPath);
  }
  catch (error) {
    console.info(error.message);
  }

  try {
    plugins.export[plugin] = require(exportPath);
  }
  catch (error) {
    console.info(error.message);
  }
}

module.exports = plugins;