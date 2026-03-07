import register from '~~/fixtures/register.json' with { type: 'json' };
import manufacturers from '~~/fixtures/manufacturers.json' with { type: 'json' };

defineRouteMeta({
  openAPI: {
    operationId: 'getManufacturers',
    description: 'Returns general information about all manufacturers.',
    tags: ['manufacturers'],
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  fixtureCount: { type: 'integer' },
                  color: { type: 'string' },
                },
                required: ['name', 'fixtureCount', 'color'],
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(() => {
  const manufacturerData = {};

  for (const manufacturerKey of Object.keys(manufacturers)) {
    if (manufacturerKey !== '$schema') {
      manufacturerData[manufacturerKey] = {
        name: manufacturers[manufacturerKey].name,
        fixtureCount: register.manufacturers[manufacturerKey]?.length || 0,
        color: register.colors[manufacturerKey],
      };
    }
  }

  return manufacturerData;
});
