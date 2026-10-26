import importJson from '../../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../../index.js' */

/**
 * Returns the number of fixtures in the library.
 * @param {OpenApiBackendContext} context - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getFixtureCount(context) {
  const register = await importJson('../../../../fixtures/register.json', import.meta.url);

  return {
    body: {
      count: Object.keys(register.filesystem).filter(
        (fixtureKey) => !('redirectTo' in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === 'SameAsDifferentBrand',
      ).length,
    },
  };
}
