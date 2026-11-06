import importJson from '../../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../../index.js' */

/**
 * Returns the five most recently updated fixtures.
 * @param {OpenApiBackendContext} context - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getLastUpdatedFixtures(context) {
  const register = await importJson('../../../../fixtures/register.json', import.meta.url);
  const manufacturers = await importJson('../../../../fixtures/manufacturers.json', import.meta.url);

  return {
    body: register.lastUpdated.slice(0, 5).map(
      (fixtureKey) => {
        const fixture = register.filesystem[fixtureKey];
        const manufacturerKey = fixtureKey.split('/', 1)[0];

        return {
          key: fixtureKey,
          name: `${manufacturers[manufacturerKey].name} ${fixture.name}`,
          action: fixture.lastAction,
          date: fixture.lastActionDate,
          color: register.colors[manufacturerKey],
        };
      },
    ),
  };
}
