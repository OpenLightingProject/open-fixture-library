import importJson from '../../../../lib/import-json.js';
import { checkFixture } from '../../../../tests/fixture-valid.js';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */
/** @typedef {import('../../../../lib/types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * @typedef {object} RequestBody
 * @property {string} plugin Import plugin key.
 * @property {string} fileName Imported file's name.
 * @property {string} fileContentBase64 Imported file's content, as base64 encoded string.
 * @property {string} author Author's name.
 */

/**
 * Imports the uploaded fixture file and responds with a FixtureCreateResult.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
export async function importFixtureFile({ request }) {
  try {
    const fixtureCreateResult = await importFixture(request.requestBody);
    return {
      statusCode: 201,
      body: fixtureCreateResult,
    };
  }
  catch (error) {
    return {
      statusCode: 400,
      body: {
        error: error.message,
      },
    };
  }
}


/**
 * @param {RequestBody} body The JSON request body.
 * @returns {FixtureCreateResult} The imported fixtures (and manufacturers) with warnings and errors.
 */
async function importFixture(body) {
  const { importPlugins } = await importJson(`../../../../plugins/plugins.json`, import.meta.url);

  if (!body.plugin || !importPlugins.includes(body.plugin)) {
    throw new Error(`'${body.plugin}' is not a valid import plugin.`);
  }

  const plugin = await import(`../../../../plugins/${body.plugin}/import.js`);
  const { manufacturers, fixtures, warnings } = await plugin.importFixtures(
    Buffer.from(body.fileContentBase64, `base64`),
    body.fileName,
    body.author,
  ).catch(parseError => {
    parseError.message = `Parse error (${parseError.message})`;
    throw parseError;
  });

  /** @type {FixtureCreateResult} */
  const result = {
    manufacturers,
    fixtures,
    warnings,
    errors: {},
  };

  const oflManufacturers = await importJson(`../../../../fixtures/manufacturers.json`, import.meta.url);

  for (const [key, fixture] of Object.entries(result.fixtures)) {
    const [manufacturerKey, fixtureKey] = key.split(`/`);

    const checkResult = await checkFixture(manufacturerKey, fixtureKey, fixture);

    if (!(manufacturerKey in result.manufacturers)) {
      result.manufacturers[manufacturerKey] = oflManufacturers[manufacturerKey];
    }

    result.warnings[key] = [...result.warnings[key], ...checkResult.warnings];
    result.errors[key] = checkResult.errors;
  }

  return result;
}
