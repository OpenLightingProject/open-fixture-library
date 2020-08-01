/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */

const manufacturers = require(`../../../../fixtures/manufacturers.json`);
import register from '../../../../fixtures/register.json';

/**
 * Returns general information about all manufacturers.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
 */
function getManufacturers(ctx, request, response) {
  const manufacturerData = {};

  for (const manKey of Object.keys(manufacturers)) {
    if (manKey !== `$schema`) {
      manufacturerData[manKey] = {
        name: manufacturers[manKey].name,
        fixtureCount: register.manufacturers[manKey].length,
        color: register.colors[manKey],
      };
    }
  }

  response.status(200).json(manufacturerData);
}


module.exports = { getManufacturers };
