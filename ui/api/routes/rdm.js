import importJson from '../../../lib/import-json.js';
/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../index.js' */

/**
 * Returns the manufacturer and fixture matching the given RDM IDs.
 * @param {OpenApiBackendContext} context - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getRdmLookup({ request }) {
  const { manufacturerId, modelId } = request.query;

  const register = await importJson('../../../fixtures/register.json', import.meta.url);
  const rdmManufacturer = register.rdm[String(manufacturerId)];

  if (!rdmManufacturer) {
    return {
      body: {
        manufacturerKey: null,
        manufacturerName: null,
        fixtureKey: null,
      },
    };
  }

  const manufacturers = await importJson('../../../fixtures/manufacturers.json', import.meta.url);
  const fixtureKey = modelId ? rdmManufacturer.models[String(modelId)] : undefined;

  return {
    body: {
      manufacturerKey: rdmManufacturer.key,
      manufacturerName: manufacturers[rdmManufacturer.key].name,
      fixtureKey: fixtureKey ?? null,
    },
  };
}
