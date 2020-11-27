/* Based on the ofl export plugin */

const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const namedColors = require(`color-name-list`);

const { Entity, NullChannel } = require(`../../lib/model.js`);

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

const manufacturers = require(`../../fixtures/manufacturers.json`);
const units = new Set([`K`, `deg`, `%`, `ms`, `Hz`, `m^3/min`, `rpm`]);
const excludeKeys = new Set([`comment`, `name`, `helpWanted`, `type`, `effectName`, `effectPreset`, `shutterEffect`, `wheel`, `isShaking`, `fogType`, `menuClick`]);

module.exports.version = `1.0.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = async function exportAGLight(fixtures, options) {
  const displayedPluginVersion = options.displayedPluginVersion || module.exports.version;

  const library = {
    version: displayedPluginVersion,
    fixtures: fixtures.map(fixture => {
      const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
      jsonData.fixtureKey = fixture.key;
      jsonData.manufacturer = manufacturers[fixture.manufacturer.key];
      jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

      if (!jsonData.availableChannels) {
        jsonData.availableChannels = {};
      }

      transformMatrixChannels(jsonData, fixture);
      transformSingleCapabilityToArray(jsonData);
      transformNonNumericValues(jsonData);

      return jsonData;
    }),
  };
  return [{
    name: `aglight_fixture_library.json`,
    content: fixtureJsonStringify(library),
    mimetype: `application/aglight-fixture-library`,
    fixtures,
  }];
};

/**
 * Resolves matrix channels in modes' channel lists.
 * It also adds the resolved template channels to `availableChannels` and adds a `pixelKey` property.
 * @param {Object} fixtureJson The fixture JSON object where the resolved matrix channels should be saved to.
 * @param {Fixture} fixture The fixture whose template channels should be resolved.
 */
function transformMatrixChannels(fixtureJson, fixture) {
  fixture.modes.forEach((mode, index) => {
    fixtureJson.modes[index].channels = mode.channelKeys;
  });

  const availableAndMatrixChannels = fixture.coarseChannels.filter(
    channel => !(channel instanceof NullChannel),
  );

  fixtureJson.availableChannels = Object.fromEntries(
    availableAndMatrixChannels.map(channel => {
      let channelJsonObject = JSON.parse(JSON.stringify(channel.jsonObject));

      if (channel.pixelKey) {
        channelJsonObject = Object.assign({}, channelJsonObject, {
          pixelKey: channel.pixelKey,
        });
      }

      return [channel.key, channelJsonObject];
    }),
  );

  delete fixtureJson.templateChannels;
}

/**
 * All channels with a single capability are converted to `capabilities: [capability]`,
 * and a `singleCapability` attribute with the value true is added.
 * @param {Object} fixtureJson The fixture whose channels should be processed
 */
function transformSingleCapabilityToArray(fixtureJson) {
  for (const channel of Object.values(fixtureJson.availableChannels)) {
    if (channel.capability) {
      channel.capabilities = [channel.capability];
      channel.singleCapability = true;
      delete channel.capability;
    }
  }
}

/**
 * Replace capability properties' entity strings with unitless numbers, and
 * ColorIntensity capabilities' color property with its hex value.
 * @param {Object} fixtureJson The fixture whose capabilities should be processed
 */
function transformNonNumericValues(fixtureJson) {
  for (const channel of Object.values(fixtureJson.availableChannels)) {
    for (const capability of channel.capabilities) {
      for (const [key, value] of Object.entries(capability)) {
        if (key === `color`) {
          processColor(capability);
        }
        else if (typeof value === `string` && !excludeKeys.has(key)) {
          capability[key] = getEntityNumber(value);
        }
      }
    }
  }

  /**
   * @param {Object} capability The capability where the color name in the color attribute should be replaced with its hex value
   */
  function processColor(capability) {
    const namedColor = namedColors.find(color => color.name === capability.color);
    if (namedColor && namedColor.hex) {
      capability.color = namedColor.hex;
    }
    else {
      // If the color was not found, just ignore it
      // console.log(`#### color not found`, capability.color);
    }
  }

  /**
   * @param {String} entityString The property value where the entity number should be extracted from.
   * @returns {Number|String} A unitless number, or the original property value if it can't be parsed as an entity.
   */
  function getEntityNumber(entityString) {
    try {
      const entity = Entity.createFromEntityString(entityString);

      if (entity.keyword !== null) {
        return entityString;
      }

      if (entity.unit === `s`) {
        return entity.number * 1000;
      }

      if (units.has(entity.unit)) {
        return entity.number;
      }
    }
    catch {
      // string could not be parsed as an entity
    }

    return entityString;
  }
}
