/* eslint-disable radix */
/* Based on the ofl export plugin */

const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const colors = require(`./colors`);

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

const manufacturers = require(`../../fixtures/manufacturers.json`);

module.exports.version = `1.0.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = async function exportAGLight(fixtures, options) {
    console.log(options);
    const displayedPluginVersion = options.displayedPluginVersion || module.exports.version;

    const library = {
        version: displayedPluginVersion,
        fixtures: [],
    };
    // one JSON file for each fixture
    library.fixtures = fixtures.map(fixture => {

        const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
        jsonData.fixtureKey = fixture.key;
        jsonData.manufacturer = manufacturers[fixture.manufacturer.key];
        jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

        return jsonData;
    });

    return [{
        name: `aglight_fixture_library.json`,
        content: fixtureJsonStringify(library),
        mimetype: `application/aglight-fixture-library`,
        fixtures,
    }];
};