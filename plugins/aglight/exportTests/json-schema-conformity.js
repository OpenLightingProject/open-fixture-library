import https from 'https';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import getAjvErrorMessages from '../../../lib/get-ajv-error-messages.js';

const BASE_OFL_SCHEMA_VERSION = '12.2.1';
const REPO_BASE_URL = 'https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library';
const SCHEMA_BASE_URL = `${REPO_BASE_URL}/schema-${BASE_OFL_SCHEMA_VERSION}/schemas/`;

const SCHEMA_FILES = [
  'capability.json',
  'channel.json',
  'definitions.json',
  'fixture.json',
  'gobo.json',
  'matrix.json',
  'wheel-slot.json',
];

const schemas = await getSchemas();

/**
 * @typedef {object} ExportFile
 * @property {string} name File name, may include slashes to provide a folder structure.
 * @property {string} content File content.
 * @property {string} mimetype File mime type.
 * @property {Fixture[] | null} fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @property {string | null} mode Mode's shortName if given file only describes a single mode.
 */

/**
 * @param {ExportFile} exportFile - The file returned by the plugins' export module.
 * @param {ExportFile[]} allExportFiles - An array of all export files.
 * @returns {Promise<void, string[] | string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
export default async function testJsonSchemaConformity(exportFile, allExportFiles) {
  const ajv = new Ajv({
    schemas,
    strict: false,
    verbose: true,
  });
  addFormats(ajv);
  ajv.addFormat('color-hex', true);

  const schemaValidate = ajv.getSchema(`${REPO_BASE_URL}/master/schemas/fixture.json`);

  const fixtures = JSON.parse(exportFile.content).fixtures;
  for (const fixture of fixtures) {
    const schemaValid = schemaValidate(fixture);
    if (!schemaValid) {
      throw getAjvErrorMessages(schemaValidate.errors, 'fixture');
    }
  }
}

/**
 * @returns {Promise<object[]>} The supported OFL schemas, adjusted for AGLight's export format.
 */
async function getSchemas() {
  const schemasJson = await Promise.all(SCHEMA_FILES.map(
    (filename) => downloadSchema(SCHEMA_BASE_URL + filename),
  ));

  const channelSchema = schemasJson[SCHEMA_FILES.indexOf('channel.json')];
  const definitionsSchema = schemasJson[SCHEMA_FILES.indexOf('definitions.json')];
  const fixtureSchema = schemasJson[SCHEMA_FILES.indexOf('fixture.json')];

  // Allow AGLight's fixture-identifying fields and embedded manufacturer data
  fixtureSchema.properties.fixtureKey = true;
  fixtureSchema.properties.manufacturer = true;
  fixtureSchema.properties.oflURL = true;

  // AGLight resolves template channels and marks their source pixel
  fixtureSchema.properties.templateChannels = undefined;
  fixtureSchema.dependencies = undefined;
  channelSchema.properties.pixelKey = true;

  // AGLight represents single-capability channels as one-item capability arrays
  channelSchema.properties.singleCapability = { const: true };
  channelSchema.properties.capabilities.minItems = 1;
  channelSchema.properties.capabilities.items.required = undefined;
  channelSchema.oneOf = undefined;
  channelSchema.required = ['capabilities'];

  // AGLight embeds resolved gobo resource objects instead of resource strings
  definitionsSchema.goboResourceString = { type: 'object' };

  // AGLight turns supported entity strings into unitless numeric values.
  for (const [entityName, entitySchema] of Object.entries(definitionsSchema.entities)) {
    definitionsSchema.entities[entityName] = {
      anyOf: [
        entitySchema,
        { type: 'number' },
      ],
    };
  }

  return schemasJson;
}

/**
 * @param {string} url - The schema URL to download.
 * @returns {Promise<object>} The downloaded and JSON parsed schema.
 */
function downloadSchema(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => resolve(JSON.parse(body)));
    });

    request.on('error', (error) => reject(error));
  });
}
