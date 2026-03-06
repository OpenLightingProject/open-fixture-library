import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import plugins from '~~/plugins/plugins.json' with { type: 'json' };

defineRouteMeta({
  openAPI: {
    operationId: 'getPluginByKey',
    description: 'Returns information about a specific plugin.',
    tags: ['plugins'],
    parameters: [
      {
        name: 'pluginKey',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
      },
      '404': {
        description: 'Plugin not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const pluginKey = getRouterParam(event, 'pluginKey');

  if (!(pluginKey in plugins.data)) {
    setResponseStatus(event, 404);
    return { error: 'Plugin not found' };
  }

  let resolvedKey = pluginKey;
  if (plugins.data[pluginKey].outdated) {
    resolvedKey = plugins.data[pluginKey].newPlugin;
  }

  try {
    // Get the project root directory properly for both dev and production
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Navigate up to project root from .output/server/api/v1/plugins/[pluginKey].ts
    const projectRoot = join(__dirname, '../..');
    
    const pluginPath = join(projectRoot, 'plugins', resolvedKey, 'plugin.json');
    const pluginJson = readFileSync(pluginPath, 'utf8');
    const pluginData = JSON.parse(pluginJson);
    
    // Add validation to ensure required properties exist
    if (!pluginData || !pluginData.name) {
      throw new Error('Plugin data missing required name property');
    }
    
    return {
      key: resolvedKey,
      name: pluginData.name,
      previousVersions: pluginData.previousVersions || {},
      description: Array.isArray(pluginData.description) ? pluginData.description.join('\n') : pluginData.description || '',
      links: pluginData.links || {},
      fixtureUsage: pluginData.fixtureUsage && Array.isArray(pluginData.fixtureUsage) ? pluginData.fixtureUsage.join('\n') : pluginData.fixtureUsage || '',
      fileLocations: pluginData.fileLocations || {},
      additionalInfo: pluginData.additionalInfo && Array.isArray(pluginData.additionalInfo) ? pluginData.additionalInfo.join('\n') : pluginData.additionalInfo || '',
      helpWanted: pluginData.helpWanted || '',
      exportPluginVersion: plugins.data[pluginKey].exportPluginVersion,
      importPluginVersion: plugins.data[pluginKey].importPluginVersion,
    };
  } catch (error) {
    console.error(`Error loading plugin ${resolvedKey}:`, error);
    setResponseStatus(event, 500);
    return { error: `Failed to load plugin ${resolvedKey}` };
  }
});
