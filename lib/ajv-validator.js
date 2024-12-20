import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/** @typedef {import('ajv').ValidateFunction} ValidateFunction */

import importJson from './import-json.js';

const ajv = new Ajv({
  verbose: true,
  strict: false,
  allErrors: true,
  discriminator: true,
});
addFormats(ajv);
ajv.addKeyword(`version`);
ajv.addFormat(`color-hex`, true);

// eslint-disable-next-line unicorn/prefer-top-level-await -- https://github.com/unjs/jiti/issues/72
const loadSchemasPromise = (async () => {
  const schemas = await Promise.all([
    importJson(`../schemas/capability.json`, import.meta.url),
    importJson(`../schemas/channel.json`, import.meta.url),
    importJson(`../schemas/definitions.json`, import.meta.url),
    importJson(`../schemas/fixture-redirect.json`, import.meta.url),
    importJson(`../schemas/fixture.json`, import.meta.url),
    importJson(`../schemas/gobo.json`, import.meta.url),
    importJson(`../schemas/manufacturers.json`, import.meta.url),
    importJson(`../schemas/matrix.json`, import.meta.url),
    importJson(`../schemas/plugin.json`, import.meta.url),
    importJson(`../schemas/wheel-slot.json`, import.meta.url),
  ]);
  ajv.addSchema(schemas);
})();


/**
 * @param {string} schemaName The name of the schema to load.
 * @returns {ValidateFunction} The validate function for the specified schema.
 */
export default async function getAjvValidator(schemaName) {
  await loadSchemasPromise;

  const schemaId = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/${schemaName}.json`;
  const validationFunction = ajv.getSchema(schemaId);

  if (!validationFunction) {
    throw new Error(`Schema '${schemaName}' not found.`);
  }

  return validationFunction;
}
