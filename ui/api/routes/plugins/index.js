/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */

const plugins = require(`../../../../plugins/plugins.json`);

/**
 * Returns general information about import and export plugins.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
 */
function getPlugins(ctx, request, response) {
  response.status(200).json(plugins);
}


module.exports = { getPlugins };
