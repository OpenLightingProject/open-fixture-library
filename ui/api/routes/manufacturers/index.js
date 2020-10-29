const manufacturers = require(`../../../../fixtures/manufacturers.json`);
import register from '../../../../fixtures/register.json';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */

/**
 * Returns general information about all manufacturers.
 * @param {OpenApiBackendContext} context Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
function getManufacturers(context) {
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


module.exports = { getManufacturers };
