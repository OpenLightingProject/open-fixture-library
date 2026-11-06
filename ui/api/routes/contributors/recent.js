import importJson from '../../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../../index.js' */

/**
 * Returns the five most recent contributors.
 * @param {OpenApiBackendContext} context - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getRecentContributors(context) {
  const register = await importJson('../../../../fixtures/register.json', import.meta.url);
  const manufacturers = await importJson('../../../../fixtures/manufacturers.json', import.meta.url);

  return {
    body: Object.keys(register.contributors).slice(0, 5).map(
      (contributor) => {
        const latestFixtureKey = register.lastUpdated.find(
          (fixtureKey) => register.contributors[contributor].fixtures.includes(fixtureKey),
        );
        const manufacturerKey = latestFixtureKey.split('/', 1)[0];
        const fixture = register.filesystem[latestFixtureKey];

        return {
          name: contributor,
          fixtureCount: register.contributors[contributor].fixtures.length,
          latestFixtureKey,
          latestFixtureName: `${manufacturers[manufacturerKey].name} ${fixture.name}`,
        };
      },
    ),
  };
}
