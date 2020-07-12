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

        let jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
        jsonData.fixtureKey = fixture.key;
        jsonData.manufacturer = manufacturers[fixture.manufacturer.key];
        jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

        jsonData = transformSingleCapabilityToArray(jsonData);
        jsonData = transformNonNumericValues(jsonData);

        return jsonData;
    });
    return [{
        name: `aglight_fixture_library.json`,
        content: fixtureJsonStringify(library),
        mimetype: `application/aglight-fixture-library`,
        fixtures,
    }];
};

/**
 * @param {Object} content The fixture data
 * @returns {Object} The transformed fixture
 */
function transformSingleCapabilityToArray(content) {
    if (content.availableChannels) {
        for (const k of Object.keys(content.availableChannels)) {
            if (content.availableChannels[k].capability) {
                content.availableChannels[k].capabilities = [content.availableChannels[k].capability];
                content.availableChannels[k].singleCapability = true;
                delete content.availableChannels[k].capability;
            }
        }
    }
    return content;
}

/**
 * @param {Object} content The fixture data
 * @returns {Object} The transformed fixture
 */
// eslint-disable-next-line complexity
function transformNonNumericValues(content) {
    const units = [`K`, `deg`, `%`, `ms`, `Hz`, `m^3/min`, `rpm`];
    const excludeKeys = [`comment`, `name`, `helpWanted`, `type`, `effectName`, `effectPreset`, `shutterEffect`, `wheel`, `isShaking`, `fogType`, `menuClick`];
    const replacements = {
        slow: 1,
        "slow CW": 1,
        "slow CCW": -1,
        "slow reverse": -1,
        fast: 0.1,
        "fast CW": 0.1,
        "fast CCW": -0.1,
        "fast reverse": -0.1,
        low: 0.1,
        high: 1,
        weak: 0.1,
        strong: 1,
        long: 1,
        short: 0.1,
        big: 1,
        small: 0.1,
        instant: 0.01,
        wide: 1,
        narrow: 0.1,
        far: 1,
        near: 0.1,
        bright: 1,
        dark: 0.1,
        default: 0,
        warm: 1,
        cold: 0,
        center: 0,
        CTO: 0,
        CTB: 0,
        right: 1,
        left: -1,
        center: 0,
        top: 1,
        bottom: -1,
        off: false,
        on: true,
        open: true,
        closed: false,
        out: false,
        in: true,
        stop: false,
        start: true,

    };
    if (content.availableChannels) {
        for (const k of Object.keys(content.availableChannels)) {
            for (const capability of content.availableChannels[k].capabilities) {
                for (const k2 of Object.keys(capability)) {
                    if ((typeof capability[k2] === `string`) && (!excludeKeys.includes(k2))) {
                        for (const u of units) {
                            if ((typeof capability[k2] === `string`) && capability[k2].endsWith(u)) {
                                capability[k2].replace(u, ``);
                                capability[k2] = parseInt(capability[k2]);
                            }
                        }
                        if ((typeof capability[k2] === `string`) && capability[k2].endsWith(`s`)) {
                            capability[k2].replace(`s`, ``);
                            capability[k2] = parseInt(capability[k2]) * 1000;
                        } else if (parseInt(capability[k2])) {
                            capability[k2] = parseInt(capability[k2]);
                        } else if (replacements[capability[k2]] !== undefined) {
                            capability[`${k2}_comment`] = capability[k2];
                            capability[k2] = replacements[capability[k2]];
                        } else if (k2 === `color`) {
                            if (colors[capability[k2].toLowerCase()]) {
                                capability[k2] = colors[capability[k2].toLowerCase()];
                            } else if (colors[capability[k2].toLowerCase().replace(/ /g, ``)]) {
                                capability[k2] = colors[capability[k2].toLowerCase().replace(/ /g, ``)];
                            } else if (colors[`${capability[k2].toLowerCase()} 1`]) {
                                capability[k2] = colors[`${capability[k2].toLowerCase()} 1`];
                            } else if (colors[`${capability[k2].toLowerCase().replace(/ /g, ``)} 1`]) {
                capability[k2] = colors[`${capability[k2].toLowerCase().replace(/ /g, ``)} 1`];
              }
              else {
                console.log(`#### color not found`, capability[k2]);
              }
            }
            else if (typeof capability[k2] !== `number`) {
              // ToDo some more here
              console.log(k2, capability[k2], typeof capability[k2]);
            }
          }
        }
      }
    }
  }
  return content;
}