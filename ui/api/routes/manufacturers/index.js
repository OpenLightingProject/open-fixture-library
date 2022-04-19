import importJson from '../../../../lib/import-json.js';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns general information about all manufacturers.
 * @param {OpenApiBackendContext} context Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getManufacturers(context) {
  const manufacturers = await importJson(`../../../../fixtures/manufacturers.json`, import.meta.url);
  const register = await importJson(`../../../../fixtures/register.json`, import.meta.url);

  const manufacturerData = {};

  for (const manufacturerKey of Object.keys(manufacturers)) {
    if (manufacturerKey !== `$schema`) {
      manufacturerData[manufacturerKey] = {
        name: manufacturers[manufacturerKey].name,
        fixtureCount: register.manufacturers[manufacturerKey].length,
        color: register.colors[manufacturerKey],
      };
    }
  }

  return {
    body: manufacturerData,
  };
}
