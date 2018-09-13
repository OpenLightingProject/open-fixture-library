const https = require(`https`);
const Ajv = require(`ajv`);

const SUPPORTED_OFL_VERSION = require(`../export.js`).supportedOflVersion;
const SCHEMA_BASE_URL = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${SUPPORTED_OFL_VERSION}/schemas/`;
const SCHEMA_FILES = [`capability.json`, `channel.json`, `definitions.json`, `fixture.json`];

const schemaPromises = SCHEMA_FILES.map(filename => getSchema(SCHEMA_BASE_URL + filename));

/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {string} exportFile.content File content.
 * @param {string} exportFile.mimetype File mime type.
 * @param {array.<Fixture>|null} exportFile.fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {string|null} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {Promise.<undefined, array.<string>|!string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
**/
module.exports = function testSchemaConformity(exportFile) {
  return Promise.all(schemaPromises).then(schemas => {
    const fixtureSchema = schemas[SCHEMA_FILES.indexOf(`fixture.json`)];

    // allow automatically added properties (but don't validate them)
    fixtureSchema.properties.fixtureKey = true;
    fixtureSchema.properties.manufacturerKey = true;
    fixtureSchema.properties.oflURL = true;

    // allow changed schema property
    fixtureSchema.patternProperties[`^\\$schema$`].enum[0] = `${SCHEMA_BASE_URL}fixture.json`;

    const ajv = new Ajv({ schemas });
    const schemaValidate = ajv.getSchema(`https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`);

    const schemaValid = schemaValidate(JSON.parse(exportFile.content));
    if (!schemaValid) {
      return Promise.reject(JSON.stringify(schemaValidate.errors, null, 2));
    }

    return Promise.resolve();
  });
};

/**
 *
 * @param {string} url The schema URL to fetch
 * @returns {Promise<object>} A promise resolving to the JSON Schema object.
 */
function getSchema(url) {
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

    request.on(`error`, err => reject(err));
  });
}
