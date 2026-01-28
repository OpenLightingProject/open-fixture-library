import importJson from '../../../../lib/import-json.js';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns information about a specific manufacturer.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getManufacturerByKey({ request }) {
  const { manufacturerKey } = request.params;

  const manufacturers = await importJson(`../../../../fixtures/manufacturers.json`, import.meta.url);
  if (!(manufacturerKey in manufacturers) || manufacturerKey === `$schema`) {
    return {
      statusCode: 404,
      body: {
        error: `Manufacturer not found`,
      },
    };
  }

  const register = await importJson(`../../../../fixtures/register.json`, import.meta.url);
  const manufacturer = {
    ...manufacturers[manufacturerKey],
    key: manufacturerKey,
    color: register.colors[manufacturerKey],
    fixtures: (register.manufacturers[manufacturerKey] || []).map(
      fixtureKey => ({
        key: fixtureKey,
        name: register.filesystem[`${manufacturerKey}/${fixtureKey}`].name,
        categories: Object.keys(register.categories).filter(
          category => register.categories[category].includes(`${manufacturerKey}/${fixtureKey}`),
        ),
      }),
    ),
  };

  return {
    body: manufacturer,
  };
}
