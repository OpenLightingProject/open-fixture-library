const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const importJson = require(`../../lib/import-json.js`);

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

module.exports.version = require(`../../schemas/fixture.json`).version;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.exportFixtures = async function exportOfl(fixtures, options) {
  const displayedPluginVersion = options.displayedPluginVersion || module.exports.version;

  const usedManufacturers = new Set();

  // one JSON file for each fixture
  const files = fixtures.map(fixture => {
    usedManufacturers.add(fixture.manufacturer.key);


    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
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
  });

  const manufacturers = await importJson(`../../fixtures/manufacturers.json`, __dirname);

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
};
