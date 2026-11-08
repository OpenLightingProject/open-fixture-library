import importJson from '../../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../../index.js' */

/**
 * Returns fixture information for a specific category.
 * @param {OpenApiBackendContext} ctx - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getCategoryByName({ request }) {
  const { categoryName } = request.params;

  const register = await importJson('../../../../fixtures/register.json', import.meta.url);
  if (!Object.hasOwn(register.categories, categoryName)) {
    return {
      statusCode: 404,
      body: {
        error: 'Category not found',
      },
    };
  }

  const manufacturers = await importJson('../../../../fixtures/manufacturers.json', import.meta.url);
  const fixtures = register.categories[categoryName].map((fullFixtureKey) => {
    const [manufacturerKey] = fullFixtureKey.split('/', 2);

    return {
      key: fullFixtureKey,
      name: `${manufacturers[manufacturerKey].name} ${register.filesystem[fullFixtureKey].name}`,
      categories: Object.keys(register.categories).filter(
        (category) => register.categories[category].includes(fullFixtureKey),
      ),
      color: register.colors[manufacturerKey],
    };
  });

  return {
    body: { fixtures },
  };
}
