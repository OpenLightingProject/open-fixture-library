const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const { CoarseChannel } = require(`../../lib/model.js`);

module.exports.version = `0.4.0`;

// needed for export test
module.exports.supportedOflVersion = `7.3.0`;

/**
 * @param {array.<Fixture>} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<array.<object>, Error>} The generated files.
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

    if (jsonData.physical) {
      jsonData.physical = getDowngradedFixturePhysical(fixture);
    }

    delete jsonData.wheels;

    // resolve all pixel key constraints
    if (jsonData.matrix && jsonData.matrix.pixelGroups) {
      Object.keys(jsonData.matrix.pixelGroups).forEach(groupKey => {
        jsonData.matrix.pixelGroups[groupKey] = fixture.matrix.pixelGroups[groupKey];
      });
    }

    if (jsonData.availableChannels) {
      Object.keys(jsonData.availableChannels).forEach(
        chKey => downgradeChannel(jsonData.availableChannels, chKey, fixture)
      );
    }

    if (jsonData.templateChannels) {
      Object.keys(jsonData.templateChannels).forEach(
        chKey => downgradeChannel(jsonData.templateChannels, chKey, fixture)
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
 * @param {array.<string>} categories The fixture's categories array.
 * @returns {array.<string>} A filtered categories array.
 */
function getDowngradedCategories(categories) {
  const replaceCats = {
    'Barrel Scanner': `Effect`
  };
  const ignoredCats = [`Pixel Bar`, `Stand`];

  const downgradedCategories = categories.map(cat => {
    if (ignoredCats.includes(cat)) {
      return null;
    }

    if (cat in replaceCats) {
      cat = replaceCats[cat];

      if (categories.includes(cat)) {
        // replaced category is already used
        return null;
      }
    }

    return cat;
  }).filter(cat => cat !== null);

  if (downgradedCategories.length === 0) {
    downgradedCategories.push(`Other`);
  }

  return downgradedCategories;
}

/**
 * Replaces the fixture's physical JSON object with one that fits to OFL schema version 7.3.0.
 * Specifically, the outdated focus property (with type, panMax and tiltMax) is generated and added if needed.
 * @param {Fixture} fixture The fixture whose physical data should be downgraded.
 * @returns {object} The downgraded physical JSON object.
 */
function getDowngradedFixturePhysical(fixture) {
  const jsonPhysical = JSON.parse(JSON.stringify(fixture.physical.jsonObject));

  const focusTypesCategories = {
    Head: `Moving Head`,
    Mirror: `Scanner`,
    Barrel: `Barrel Scanner`,
    Fixed: null
  };
  const [type] = Object.entries(focusTypesCategories).find(
    ([focusType, category]) => fixture.categories.includes(category)
  ) || [null];

  const [panMax, tiltMax] = [`Pan`, `Tilt`].map(panOrTilt => {
    const capabilities = [];
    fixture.coarseChannels.forEach(ch => {
      if (ch.capabilities) {
        capabilities.push(...ch.capabilities);
      }
    });

    const hasContinuousCapability = capabilities.some(cap => cap.type === `${panOrTilt}Continuous`);
    if (hasContinuousCapability) {
      return `infinite`;
    }

    const panTiltCapabilities = capabilities.filter(cap => cap.type === panOrTilt && cap.angle[0].unit === `deg`);
    const minAngle = Math.min(...panTiltCapabilities.map(cap => Math.min(cap.angle[0].number, cap.angle[1].number)));
    const maxAngle = Math.max(...panTiltCapabilities.map(cap => Math.max(cap.angle[0].number, cap.angle[1].number)));
    const panTiltMax = maxAngle - minAngle;

    if (panTiltMax > -Infinity) {
      return panTiltMax;
    }

    return null;
  });

  const focus = {
    type,
    panMax,
    tiltMax
  };

  // remove null properties
  Object.entries(focus).filter(
    ([key, value]) => value === null
  ).forEach(
    ([key, value]) => delete focus[key]
  );

  if (Object.keys(focus).length > 0) {
    jsonPhysical.focus = focus;

    if (jsonPhysical.matrixPixels) {
      // remove matrixPixels and add them again after focus
      const matrixPixels = jsonPhysical.matrixPixels;
      delete jsonPhysical.matrixPixels;
      jsonPhysical.matrixPixels = matrixPixels;
    }
  }

  return jsonPhysical;
}

/**
 * Replaces the specified channel in the specified channels object with a downgraded version for schema 7.1.0.
 * @param {object} channelObject Either availableChannels or templateChannels.
 * @param {string} channelKey A key that exists in given channelObject and specifies the channel that should be downgraded.
 * @param {Fixture} fixture The fixture the channel belongs to.
 */
function downgradeChannel(channelObject, channelKey, fixture) {
  const jsonChannel = channelObject[channelKey];
  const channel = new CoarseChannel(channelKey, jsonChannel, fixture);

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

    channel.capabilities.forEach(cap => {
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
    });
  }

  /**
   * @returns {boolean} Whether or not it is needed to include capabilities in a downgraded version of this channel
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
 * @param {object} obj The object where the property should be created.
 * @param {string} property The name of the property added to obj.
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
