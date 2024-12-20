import { fixtureSchema } from '../../lib/esm-shim.cjs';
import fixtureJsonStringify from '../../lib/fixture-json-stringify.js';
import importJson from '../../lib/import-json.js';

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

export const version = fixtureSchema.version;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const displayedPluginVersion = options.displayedPluginVersion || version;

  const usedManufacturers = new Set();

  // one JSON file for each fixture
  const files = fixtures.map(fixture => {
    usedManufacturers.add(fixture.manufacturer.key);

    try {
      return getFixtureFile(fixture, displayedPluginVersion);
    }
    catch (error) {
      throw new Error(`Exporting fixture ${fixture.manufacturer.key}/${fixture.key} failed: ${error}`, {
        cause: error,
      });
    }
  });

  const manufacturers = await importJson(`../../fixtures/manufacturers.json`, import.meta.url);

  // manufacturers.json file
  const usedManufacturerData = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${displayedPluginVersion}/schemas/manufacturers.json`,
  };
  for (const manufacturer of Object.keys(manufacturers).sort()) {
    if (usedManufacturers.has(manufacturer)) {
      usedManufacturerData[manufacturer] = manufacturers[manufacturer];
    }
  }
  files.push({
    name: `manufacturers.json`,
    content: `${JSON.stringify(usedManufacturerData, null, 2)}\n`,
    mimetype: `application/ofl-manufacturers`,
  });

  return files;
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @param {string} displayedPluginVersion The plugin version that should be displayed in the exported file.
 * @returns {object} The generated fixture JSON file.
 */
function getFixtureFile(fixture, displayedPluginVersion) {
  const jsonData = structuredClone(fixture.jsonObject);
  jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${displayedPluginVersion}/schemas/fixture.json`;

  jsonData.fixtureKey = fixture.key;
  jsonData.manufacturerKey = fixture.manufacturer.key;
  jsonData.oflURL = fixture.url;

  return {
    name: `${fixture.manufacturer.key}/${fixture.key}.json`,
    content: fixtureJsonStringify(jsonData),
    mimetype: `application/ofl-fixture`,
    fixtures: [fixture],
  };
}
