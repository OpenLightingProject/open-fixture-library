const importJson = require(`../../../../lib/import-json.js`);
const { checkFixture } = require(`../../../../tests/fixture-valid.js`);

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */
/** @typedef {import('../../../../lib/types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * @typedef {Object} RequestBody
 * @property {String} plugin Import plugin key.
 * @property {String} fileName Imported file's name.
 * @property {String} fileContentBase64 Imported file's content, as base64 encoded string.
 * @property {String} author Author's name.
 */

/**
 * Imports the uploaded fixture file and responds with a FixtureCreateResult.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
async function importFixtureFile({ request }) {
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
  const { importPlugins } = await importJson(`../../../../plugins/plugins.json`, __dirname);

  if (!body.plugin || !importPlugins.includes(body.plugin)) {
    throw new Error(`'${body.plugin}' is not a valid import plugin.`);
  }

  const plugin = require(`../../../../plugins/${body.plugin}/import.js`);
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

  const oflManufacturers = await importJson(`../../../../fixture/manufacturer.json`);

  for (const [key, fixture] of Object.keys(result.fixtures)) {
    const [manufacturerKey, fixtureKey] = key.split(`/`);

    const checkResult = await checkFixture(manufacturerKey, fixtureKey, fixture);

    if (!(manufacturerKey in result.manufacturers)) {
      result.manufacturers[manufacturerKey] = oflManufacturers[manufacturerKey];
    }

    result.warnings[key] = result.warnings[key].concat(checkResult.warnings);
    result.errors[key] = checkResult.errors;
  }

  return result;
}

module.exports = { importFixtureFile };
