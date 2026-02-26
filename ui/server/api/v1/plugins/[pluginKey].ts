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

  const pluginData = await import(`~~/plugins/${resolvedKey}/plugin.json`, { with: { type: 'json' } });

  return {
    key: resolvedKey,
    name: pluginData.default.name,
    previousVersions: pluginData.default.previousVersions || {},
    description: pluginData.default.description.join('\n'),
    links: pluginData.default.links,
    fixtureUsage: pluginData.default.fixtureUsage && pluginData.default.fixtureUsage.join('\n'),
    fileLocations: pluginData.default.fileLocations,
    additionalInfo: pluginData.default.additionalInfo && pluginData.default.additionalInfo.join('\n'),
    helpWanted: pluginData.default.helpWanted,
    exportPluginVersion: plugins.data[pluginKey].exportPluginVersion,
    importPluginVersion: plugins.data[pluginKey].importPluginVersion,
  };
});
