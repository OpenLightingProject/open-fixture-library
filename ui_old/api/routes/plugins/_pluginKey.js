import importJson from '../../../../lib/import-json.js';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns general information about import and export plugins.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getPluginByKey({ request }) {
  let { pluginKey } = request.params;

  const plugins = await importJson(`../../../../plugins/plugins.json`, import.meta.url);

  if (!(pluginKey in plugins.data)) {
    return {
      statusCode: 404,
      body: {
        error: `Plugin not found`,
      },
    };
  }

  if (plugins.data[pluginKey].outdated) {
    pluginKey = plugins.data[pluginKey].newPlugin;
  }

  const pluginData = await importJson(`../../../../plugins/${pluginKey}/plugin.json`, import.meta.url);

  return {
    body: {
      key: pluginKey,
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
    },
  };
}
