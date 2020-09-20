const manufacturers = require(`../../../../fixtures/manufacturers.json`);
const register = require(`../../../../fixtures/register.json`);

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns information about a specific manufacturer.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
function getManufacturerByKey({ request }) {
  const { manufacturerKey } = request.params;

  if (!(manufacturerKey in manufacturers) || manufacturerKey === `$schema`) {
    return {
      statusCode: 404,
      body: {
        error: `Manufacturer not found`,
      },
    };
  }

  const manufacturer = Object.assign({}, manufacturers[manufacturerKey], {
    key: manufacturerKey,
    color: register.colors[manufacturerKey],
    fixtures: (register.manufacturers[manufacturerKey] || []).map(
      fixKey => ({
        key: fixKey,
        name: register.filesystem[`${manufacturerKey}/${fixKey}`].name,
        categories: Object.keys(register.categories).filter(
          cat => register.categories[cat].includes(`${manufacturerKey}/${fixKey}`),
        ),
      }),
    ),
  });

  return {
    body: manufacturer,
  };
}


module.exports = { getManufacturerByKey };
