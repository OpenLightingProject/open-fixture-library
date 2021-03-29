const Ajv = require(`ajv`);
const addFormats = require(`ajv-formats`);

/** @typedef {import('ajv').ValidateFunction} ValidateFunction */

const importJson = require(`./import-json.js`);

const ajv = new Ajv({
  verbose: true,
  strict: false,
});
addFormats(ajv);
ajv.addKeyword(`version`);
ajv.addFormat(`color-hex`, true);

const loadSchemasPromise = Promise.all([
  importJson(`../schemas/capability.json`, __dirname),
  importJson(`../schemas/channel.json`, __dirname),
  importJson(`../schemas/definitions.json`, __dirname),
  importJson(`../schemas/fixture-redirect.json`, __dirname),
  importJson(`../schemas/fixture.json`, __dirname),
  importJson(`../schemas/gobo.json`, __dirname),
  importJson(`../schemas/manufacturers.json`, __dirname),
  importJson(`../schemas/matrix.json`, __dirname),
  importJson(`../schemas/plugin.json`, __dirname),
  importJson(`../schemas/wheel-slot.json`, __dirname),
]).then(schemas => {
  ajv.addSchema(schemas);
});


/**
 * @param {String} schemaName The name of the schema to load.
 * @returns {ValidateFunction} The validate function for the specified schema.
 */
module.exports = async function getAjvValidator(schemaName) {
  await loadSchemasPromise;

  const schemaId = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/${schemaName}.json`;
  const validationFunction = ajv.getSchema(schemaId);

  if (!validationFunction) {
    throw new Error(`Schema '${schemaName}' not found.`);
  }

  return validationFunction;
};
