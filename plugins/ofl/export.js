const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

const manufacturers = require(`../../fixtures/manufacturers.json`);

module.exports.version = require(`../../schemas/fixture.json`).version;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = async function exportOfl(fixtures, options) {
  const displayedPluginVersion = options.displayedPluginVersion || module.exports.version;

  const usedManufacturers = new Set();

  // one JSON file for each fixture
  const files = fixtures.map(fixture => {
    usedManufacturers.add(fixture.manufacturer.key);


    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${displayedPluginVersion}/schemas/fixture.json`;

    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturerKey = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: fixtureJsonStringify(jsonData),
      mimetype: `application/ofl-fixture`,
      fixtures: [fixture],
    };
  });

  // manufacturers.json file
  const usedManufacturerData = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${displayedPluginVersion}/schemas/manufacturers.json`,
  };
  for (const man of Object.keys(manufacturers).sort()) {
    if (usedManufacturers.has(man)) {
      usedManufacturerData[man] = manufacturers[man];
    }
  }
  files.push({
    name: `manufacturers.json`,
    content: `${JSON.stringify(usedManufacturerData, null, 2)}\n`,
    mimetype: `application/ofl-manufacturers`,
  });

  return files;
};
