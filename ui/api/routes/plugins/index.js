const importJson = require(`../../../../lib/import-json.js`);

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns general information about import and export plugins.
 * @param {OpenApiBackendContext} context Passed from OpenAPI Backend.
 * @returns {Promise.<ApiResponse>} The handled response.
 */
async function getPlugins(context) {
  const plugins = await importJson(`../../../../plugins/plugins.json`, __dirname);

  return {
    body: plugins,
  };
}


module.exports = { getPlugins };
