import register from '~~/fixtures/register.json' with { type: 'json' };
import manufacturers from '~~/fixtures/manufacturers.json' with { type: 'json' };

defineRouteMeta({
  openAPI: {
    operationId: 'getManufacturerByKey',
    description: 'Returns information about a specific manufacturer.',
    tags: ['manufacturers'],
    parameters: [
      {
        name: 'manufacturerKey',
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
              properties: {
                key: { type: 'string' },
                name: { type: 'string' },
                website: { type: 'string' },
                color: { type: 'string' },
                fixtures: { type: 'array' },
              },
            },
          },
        },
      },
      '404': {
        description: 'Manufacturer not found',
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

export default defineEventHandler((event) => {
  const manufacturerKey = getRouterParam(event, 'manufacturerKey');

  if (!(manufacturerKey in manufacturers) || manufacturerKey === '$schema') {
    setResponseStatus(event, 404);
    return { error: 'Manufacturer not found' };
  }

  const manufacturer = {
    ...manufacturers[manufacturerKey],
    key: manufacturerKey,
    color: register.colors[manufacturerKey],
    fixtures: (register.manufacturers[manufacturerKey] || []).map(
      fixtureKey => ({
        key: fixtureKey,
        name: register.filesystem[`${manufacturerKey}/${fixtureKey}`]?.name,
        categories: Object.keys(register.categories).filter(
          category => register.categories[category]?.includes(`${manufacturerKey}/${fixtureKey}`),
        ),
      }),
    ),
  };

  return manufacturer;
});
