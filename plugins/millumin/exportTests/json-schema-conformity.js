const https = require(`https`);
const Ajv = require(`ajv`);

const SCHEMA_BASE_URL = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-7.0.0/schemas/`;
const SCHEMA_FILES = [`capability.json`, `channel.json`, `definitions.json`, `fixture.json`];

module.exports = function testSchemaConformity(exportFileData) {
  const schemaPromises = SCHEMA_FILES.map(filename => getSchema(SCHEMA_BASE_URL + filename));

  return Promise.all(schemaPromises).then(schemas => {
    const fixtureSchema = schemas[SCHEMA_FILES.indexOf(`fixture.json`)];

    // allow automatically added properties (but don't validate them)
    fixtureSchema.properties.fixtureKey = true;
    fixtureSchema.properties.manufacturerKey = true;
    fixtureSchema.properties.oflURL = true;

    // allow changed schema property
    fixtureSchema.patternProperties[`^\\$schema$`].enum[0] = `${SCHEMA_BASE_URL}fixture.json`;

    // TODO: quick fix while #514 is not merged
    const capabilitySchema = schemas[SCHEMA_FILES.indexOf(`capability.json`)];
    capabilitySchema.$id = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/capability.json`;

    const ajv = new Ajv({ schemas });
    const schemaValidate = ajv.getSchema(`https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`);

    const schemaValid = schemaValidate(JSON.parse(exportFileData));
    if (!schemaValid) {
      return Promise.reject(JSON.stringify(schemaValidate.errors, null, 2));
    }

    return Promise.resolve();
  });
};

/**
 *
 * @param {!string} url The schema URL to fetch
 * @returns {!Promise<!object>} A promise resolving to the JSON Schema object.
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
