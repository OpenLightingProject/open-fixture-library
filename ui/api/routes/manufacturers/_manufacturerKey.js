/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */

const manufacturers = require(`../../../../fixtures/manufacturers.json`);
const register = require(`../../../../fixtures/register.json`);

/**
 * Returns information about a specific manufacturer.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
 */
function getManufacturerByKey(ctx, request, response) {
  const { manufacturerKey } = ctx.request.params;

  if (!(manufacturerKey in manufacturers) || manufacturerKey === `$schema`) {
    response.status(404).json({ error: `Manufacturer not found` });
    return;
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

  response.json(manufacturer);
}


module.exports = { getManufacturerByKey };
