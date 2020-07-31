/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */

const plugins = require(`../../../../plugins/plugins.json`);

/**
 * Returns general information about import and export plugins.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
 */
function getPluginByKey(ctx, request, response) {
  const { pluginKey } = ctx.request.params;

  if (!(pluginKey in plugins.data)) {
    response.status(404).json({ error: `Plugin not found` });
    return;
  }

  if (plugins.data[pluginKey].outdated) {
    response.redirect(301, `./${plugins.data[pluginKey].newPlugin}`);
    return;
  }

  const pluginData = require(`../../../../plugins/${pluginKey}/plugin.json`);

  response.json({
    pluginKey,
    name: pluginData.name,
    previousVersions: pluginData.previousVersions || {},
    description: pluginData.description.join(`\n`),
    links: pluginData.links,
    fixtureUsage: pluginData.fixtureUsage && pluginData.fixtureUsage.join(`\n`),
    fileLocations: pluginData.fileLocations,
    additionalInfo: pluginData.additionalInfo && pluginData.additionalInfo.join(`\n`),
    helpWanted: pluginData.helpWanted,
    exportPluginVersion: plugins.data[pluginKey].exportPluginVersion,
    importPluginVersion: plugins.data[pluginKey].importPluginVersion,
  });
}


module.exports = { getPluginByKey };
