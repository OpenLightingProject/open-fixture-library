const plugins = require(`../../../../plugins/plugins.json`);

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns general information about import and export plugins.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
function getPlugins(ctx) {
  return {
    body: plugins,
  };
}


module.exports = { getPlugins };
