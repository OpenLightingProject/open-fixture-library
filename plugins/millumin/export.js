const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const { Channel } = require(`../../lib/model.js`);

module.exports.name = `Millumin`;
module.exports.version = `0.3.0`;

// needed for export test
module.exports.supportedOflVersion = `7.3.0`;

/**
 * @param {!Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {!object} options Global options, including:
 * @param {!string} options.baseDir Absolute path to OFL's root directory.
 * @param {?Date} options.date The current time.
 * @returns {!Promise.<!Array.<object>, !Error>} The generated files.
*/
module.exports.export = function exportMillumin(fixtures, options) {
  // one JSON file for each fixture
  const outFiles = fixtures.map(fixture => {
    let jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${module.exports.supportedOflVersion}/schemas/fixture.json`;

    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturerKey = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    jsonData.categories = getDowngradedCategories(jsonData.categories);

    if (jsonData.links) {
      if (jsonData.links.manual) {
        // replace links with manual URL in keys array
        const jsonKeys = Object.keys(jsonData);
        jsonKeys[jsonKeys.indexOf(`links`)] = `manualURL`;
        jsonData.manualURL = fixture.getLinksOfType(`manual`)[0];

        // reorder JSON properties in jsonKeys order
        const reorderedJsonData = {};
        jsonKeys.forEach(key => {
          reorderedJsonData[key] = jsonData[key];
        });
        jsonData = reorderedJsonData;
      }
      else {
        delete jsonData.links;
      }
    }

    if (jsonData.availableChannels) {
      Object.keys(jsonData.availableChannels).forEach(
        chKey => downgradeChannel(jsonData.availableChannels, chKey)
      );
    }

    if (jsonData.templateChannels) {
      Object.keys(jsonData.templateChannels).forEach(
        chKey => downgradeChannel(jsonData.templateChannels, chKey)
      );
    }

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: fixtureJsonStringify(jsonData),
      mimetype: `application/ofl-fixture`,
      fixtures: [fixture]
    };
  });

  return Promise.resolve(outFiles);
};

/**
 * Replaces the fixture's categories array with one that only includes categories
 * from OFL schema version 7.3.0.
 * @param {!array.<!string>} categories The fixture's categories array.
 * @returns {!array.<!string>} A filtered categories array.
 */
function getDowngradedCategories(categories) {
  const addedCategories = [`Pixel Bar`, `Stand`];

  const filteredCategories = categories.filter(
    category => !addedCategories.includes(category)
  );

  if (filteredCategories.length === 0) {
    filteredCategories.push(`Other`);
  }

  return filteredCategories;
}

/**
 * Replaces the specified channel in the specified channels object with a downgraded version for schema 7.1.0.
 * @param {!object} channelObject Either availableChannels or templateChannels.
 * @param {!string} channelKey A key that exists in given channelObject and specifies the channel that should be downgraded.
 */
function downgradeChannel(channelObject, channelKey) {
  const jsonChannel = channelObject[channelKey];
  const channel = new Channel(channelKey, jsonChannel, null);

  const downgradedChannel = {};

  addIfValidData(downgradedChannel, `name`, jsonChannel.name);
  downgradedChannel.type = channel.type === `NoFunction` ? `Nothing` : channel.type;
  addIfValidData(downgradedChannel, `color`, channel.color);
  addIfValidData(downgradedChannel, `fineChannelAliases`, jsonChannel.fineChannelAliases);
  addIfValidData(downgradedChannel, `defaultValue`, channel.hasDefaultValue, channel.defaultValue);
  addIfValidData(downgradedChannel, `highlightValue`, channel.hasHighlightValue, channel.highlightValue);
  addIfValidData(downgradedChannel, `invert`, channel.isInverted);
  addIfValidData(downgradedChannel, `constant`, channel.isConstant);
  addIfValidData(downgradedChannel, `crossfade`, channel.canCrossfade);
  addIfValidData(downgradedChannel, `precedence`, jsonChannel.precedence);

  channelObject[channelKey] = downgradedChannel;

  if (capabilitiesNeeded()) {
    downgradedChannel.capabilities = [];

    for (const cap of channel.capabilities) {
      const downgradedCap = {
        range: [cap.rawDmxRange.start, cap.rawDmxRange.end],
        name: cap.name
      };

      addIfValidData(downgradedCap, `menuClick`, cap.jsonObject.menuClick);
      if (cap.colors && cap.colors.allColors.length <= 2) {
        downgradedCap.color = cap.colors.allColors[0];

        if (cap.colors.allColors[1]) {
          downgradedCap.color2 = cap.colors.allColors[1];
        }
      }
      addIfValidData(downgradedCap, `helpWanted`, cap.jsonObject.helpWanted);
      addIfValidData(downgradedCap, `switchChannels`, cap.jsonObject.switchChannels);

      downgradedChannel.capabilities.push(downgradedCap);
    }
  }

  /**
   * @returns {!boolean} Whether or not it is needed to include capabilities in a downgraded version of this channel
   */
  function capabilitiesNeeded() {
    const trivialCapabilityTypes = [`Intensity`, `ColorIntensity`, `Pan`, `Tilt`, `NoFunction`];
    if (channel.capabilities.length === 1 && trivialCapabilityTypes.includes(channel.capabilities[0].type)) {
      return false;
    }

    return true;
  }
}

/**
 * Saves the given data (or value, if given) into obj[property] if data is valid,
 * i.e. it is neither undefined, nor null, nor false.
 * @param {!object} obj The object where the property should be created.
 * @param {!string} property The name of the property added to obj.
 * @param {*} data If this is valid, the property is added to obj.
 * @param {*} [value=undefined] The property value, if data is valid. Defaults to data.
 */
function addIfValidData(obj, property, data, value = undefined) {
  if (value === undefined) {
    value = data;
  }

  if (data !== undefined && data !== null && data !== false) {
    obj[property] = value;
  }
}
