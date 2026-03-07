import plugins from '~~/plugins/plugins.json' with { type: 'json' };

defineRouteMeta({
  openAPI: {
    operationId: 'getPlugins',
    description: 'Returns general information about import and export plugins.',
    tags: ['plugins'],
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                importPlugins: { type: 'array', items: { type: 'string' } },
                exportPlugins: { type: 'array', items: { type: 'string' } },
                data: { type: 'object' },
              },
              required: ['importPlugins', 'exportPlugins', 'data'],
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(() => plugins);
