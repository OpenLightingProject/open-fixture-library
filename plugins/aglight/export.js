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
    const units = [`K`, `deg`, `%`, `ms`, `Hz`, `m^3/min`];
    const excludeKeys = [`comment`, `name`, `helpWanted`, `type`, `effectName`, `effectPreset`, `shutterEffect`];
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
                        } else if (capability[k2] === `slow`) {
                            capability[k2] = 1;
                        } else if (capability[k2] === `fast`) {
                            capability[k2] = 0.1;
                        } else if (capability[k2] === `low`) {
                            capability[k2] = 0.1;
                        } else if (capability[k2] === `high`) {
                            capability[k2] = 1;
                        } else if (capability[k2] === `long`) {
                            capability[k2] = 1;
                        } else if (capability[k2] === `short`) {
                            capability[k2] = 0.1;
                        } else if (capability[k2] === `big`) {
                            capability[k2] = 1;
                        } else if (capability[k2] === `small`) {
                            capability[k2] = 0.1;
                        } else if (capability[k2] === `instant`) {
                            capability[k2] = 0.01;
                        } else if (capability[k2] === `wide`) {
                            capability[k2] = 1;
                        } else if (capability[k2] === `narrow`) {
                            capability[k2] = 0.1;
                        } else if (capability[k2] === `far`) {
                            capability[k2] = 1;
                        } else if (capability[k2] === `near`) {
                            capability[k2] = 0.1;
                        } else if (capability[k2] === `off`) {
                            capability[k2] = false;
                        } else if (capability[k2] === `on`) {
                            capability[k2] = true;
                        } else if (capability[k2] === `closed`) {
                            capability[k2] = false;
                        } else if (capability[k2] === `open`) {
                            capability[k2] = true;
                        } else if (capability[k2] === `out`) {
                            capability[k2] = false;
                        } else if (capability[k2] === `in`) {
                            capability[k2] = true;
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
          else {
            // ToDo some more here
            console.log(k2, capability[k2]);
          }
        }
      }
    }
  }
}
return content;
}