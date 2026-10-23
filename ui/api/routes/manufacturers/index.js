import importJson from '../../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../../index.js' */

/**
 * Returns general information about all manufacturers.
 * @param {OpenApiBackendContext} context - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getManufacturers(context) {
  const manufacturers = await importJson('../../../../fixtures/manufacturers.json', import.meta.url);
  const register = await importJson('../../../../fixtures/register.json', import.meta.url);

  const manufacturerData = {};

  for (const [manufacturerKey, manufacturer] of Object.entries(manufacturers)) {
    if (manufacturerKey !== '$schema') {
      manufacturerData[manufacturerKey] = {
        name: manufacturer.name,
        fixtureCount: register.manufacturers[manufacturerKey].length,
        color: register.colors[manufacturerKey],
      };
    }
  }

  return {
    body: manufacturerData,
  };
}
