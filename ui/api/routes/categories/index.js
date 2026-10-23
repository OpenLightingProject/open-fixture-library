import importJson from '../../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../../index.js' */

/**
 * Returns general information about all fixture categories.
 * @param {OpenApiBackendContext} context - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getCategories(context) {
  const register = await importJson('../../../../fixtures/register.json', import.meta.url);

  return {
    body: Object.keys(register.categories).toSorted((categoryA, categoryB) => categoryA.localeCompare(categoryB, 'en')).map(
      (category) => ({
        name: category,
        fixtureCount: register.categories[category].length,
      }),
    ),
  };
}
