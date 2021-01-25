const https = require(`https`);
const Ajv = require(`ajv`);
const getAjvErrorMessages = require(`../../../lib/get-ajv-error-messages.js`);

const SUPPORTED_OFL_VERSION = require(`../export.js`).supportedOflVersion;
const SCHEMA_BASE_URL = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${SUPPORTED_OFL_VERSION}/schemas/`;
const SCHEMA_FILES = [`capability.json`, `channel.json`, `definitions.json`, `fixture.json`];

const schemaPromises = getSchemas();

/**
 * @typedef {Object} ExportFile
 * @property {String} name File name, may include slashes to provide a folder structure.
 * @property {String} content File content.
 * @property {String} mimetype File mime type.
 * @property {Array.<Fixture>|null} fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @property {String|null} mode Mode's shortName if given file only describes a single mode.
 */

/**
 * @param {ExportFile} exportFile The file returned by the plugins' export module.
 * @param {Array.<ExportFile>} allExportFiles An array of all export files.
 * @returns {Promise.<undefined, Array.<String>|String>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
module.exports = async function testSchemaConformity(exportFile, allExportFiles) {
  const schemas = await schemaPromises;
  const ajv = new Ajv({
    schemas,
    format: `full`,
    formats: {
      'color-hex': ``,
    },
    verbose: true,
  });
  const schemaValidate = ajv.getSchema(`https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`);

  const schemaValid = schemaValidate(JSON.parse(exportFile.content));
  if (!schemaValid) {
    throw getAjvErrorMessages(schemaValidate.errors, `fixture`);
  }
};

/**
 * @returns {Promise.<Array.<Object>>} Asynchronously downloaded and JSON parsed schemas. Already tweaked to handle Millumin's deviations from the supported schema version.
 */
async function getSchemas() {
  const schemasJson = await Promise.all(SCHEMA_FILES.map(
    filename => downloadSchema(SCHEMA_BASE_URL + filename),
  ));

  const fixtureSchema = schemasJson[SCHEMA_FILES.indexOf(`fixture.json`)];
  const channelSchema = schemasJson[SCHEMA_FILES.indexOf(`channel.json`)];

  // allow automatically added properties (but don't validate them)
  fixtureSchema.properties.fixtureKey = true;
  fixtureSchema.properties.manufacturerKey = true;
  fixtureSchema.properties.oflURL = true;

  // allow changed schema property
  fixtureSchema.patternProperties[`^\\$schema$`].const = `${SCHEMA_BASE_URL}fixture.json`;
  fixtureSchema.patternProperties[`^\\$schema$`].enum = undefined;

  // allow new colors from schema version 11.1.0
  // see https://github.com/OpenLightingProject/open-fixture-library/pull/763
  channelSchema.properties.color.enum.push(`Warm White`, `Cold White`);

  return schemasJson;
}

/**
 * @param {String} url The schema URL to fetch
 * @returns {Promise.<Object>} A promise resolving to the JSON Schema object.
 */
function downloadSchema(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      let body = ``;
      response.on(`data`, chunk => {
        body += chunk;
      });
      response.on(`end`, () => resolve(JSON.parse(body)));
    });

    request.on(`error`, error => reject(error));
  });
}
