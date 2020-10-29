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

  for (const manKey of Object.keys(manufacturers)) {
    if (manKey !== `$schema`) {
      manufacturerData[manKey] = {
        name: manufacturers[manKey].name,
        fixtureCount: register.manufacturers[manKey].length,
        color: register.colors[manKey],
      };
    }
  }

  return {
    body: manufacturerData,
  };
}


module.exports = { getManufacturers };
