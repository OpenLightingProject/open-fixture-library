import register from '~~/fixtures/register.json' with { type: 'json' };
import manufacturers from '~~/fixtures/manufacturers.json' with { type: 'json' };

defineRouteMeta({
  openAPI: {
    operationId: 'getSearchResults',
    description: 'Return search results for given parameters.',
    tags: ['root'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              searchQuery: { type: 'string' },
              manufacturersQuery: { type: 'array', items: { type: 'string' } },
              categoriesQuery: { type: 'array', items: { type: 'string' } },
            },
            required: ['searchQuery', 'manufacturersQuery', 'categoriesQuery'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Fixture keys matching the queries.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { searchQuery, manufacturersQuery, categoriesQuery } = body;

  const results = Object.keys(register.filesystem).filter(
    key => queryMatch(searchQuery, key) && manufacturerMatch(manufacturersQuery, key) && categoryMatch(categoriesQuery, key),
  );

  return results;
});

function queryMatch(searchQuery, fixtureKey) {
  const manufacturer = fixtureKey.split('/')[0];
  const fixtureData = register.filesystem[fixtureKey];

  return fixtureKey.includes(searchQuery.toLowerCase()) || `${manufacturers[manufacturer]?.name} ${fixtureData.name}`.toLowerCase().includes(searchQuery.toLowerCase());
}

function manufacturerMatch(manufacturersQuery, fixtureKey) {
  const manufacturer = fixtureKey.split('/')[0];

  return manufacturersQuery.length === 0 ||
    (manufacturersQuery.length === 1 && manufacturersQuery[0] === '') ||
    manufacturersQuery.includes(manufacturer);
}

function categoryMatch(categoriesQuery, fixtureKey) {
  return categoriesQuery.length === 0 ||
    (categoriesQuery.length === 1 && categoriesQuery[0] === '') ||
    categoriesQuery.some(
      category => register.categories[category]?.includes(fixtureKey),
    );
}
