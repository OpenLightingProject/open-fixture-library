const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);

const { CoarseChannel } = require(`../../lib/model.js`);
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

module.exports.version = `0.4.0`;

// needed for export test
module.exports.supportedOflVersion = `7.3.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
*/
module.exports.export = async function exportMillumin(fixtures, options) {
  // one JSON file for each fixture
  const outFiles = fixtures.map(fixture => {
    const oflJson = JSON.parse(JSON.stringify(fixture.jsonObject));
    const milluminJson = {};

    milluminJson.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${module.exports.supportedOflVersion}/schemas/fixture.json`;
    milluminJson.name = oflJson.name;
    addIfValidData(milluminJson, `shortName`, oflJson.shortName);
    milluminJson.categories = getDowngradedCategories(oflJson.categories);
    milluminJson.meta = oflJson.meta;
    addIfValidData(milluminJson, `comment`, oflJson.comment);

    if (oflJson.links && oflJson.links.manual) {
      milluminJson.manualURL = fixture.getLinksOfType(`manual`)[0];
    }

    addIfValidData(milluminJson, `helpWanted`, oflJson.helpWanted);
    addIfValidData(milluminJson, `rdm`, oflJson.rdm);
    addIfValidData(milluminJson, `physical`, getDowngradedFixturePhysical(oflJson.physical || {}, fixture));
    addIfValidData(milluminJson, `matrix`, getDowngradedMatrix(oflJson.matrix, fixture));

    if (oflJson.availableChannels) {
      milluminJson.availableChannels = {};
      Object.entries(oflJson.availableChannels).forEach(([chKey, jsonChannel]) => {
        milluminJson.availableChannels[chKey] = getDowngradedChannel(chKey, jsonChannel, fixture);
      });
    }

    if (oflJson.templateChannels) {
      milluminJson.templateChannels = {};
      Object.entries(oflJson.templateChannels).forEach(([chKey, jsonChannel]) => {
        milluminJson.templateChannels[chKey] = getDowngradedChannel(chKey, jsonChannel, fixture);
      });
    }

    milluminJson.modes = oflJson.modes;

    milluminJson.fixtureKey = fixture.key;
    milluminJson.manufacturerKey = fixture.manufacturer.key;
    milluminJson.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: fixtureJsonStringify(milluminJson),
      mimetype: `application/ofl-fixture`,
      fixtures: [fixture]
    };
  });

  return outFiles;
};

/**
 * Replaces the fixture's categories array with one that only includes categories
 * from the supported OFL schema version.
 * @param {Array.<String>} categories The fixture's categories array.
 * @returns {Array.<String>} A filtered categories array.
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
 * Replaces the fixture's physical JSON object with one that fits to the supported OFL schema version.
 * Specifically, the outdated focus property (with type, panMax and tiltMax) is generated and added if needed.
 * @param {Object} jsonPhysical The physical JSON that should be downgraded. May be an empty object.
 * @param {Fixture} fixture The fixture whose physical data should be downgraded.
 * @returns {Object} The downgraded physical JSON object.
 */
function getDowngradedFixturePhysical(jsonPhysical, fixture) {
  const focusTypesCategories = {
    Head: `Moving Head`,
    Mirror: `Scanner`,
    Barrel: `Barrel Scanner`,
    Fixed: null
  };
  const type = Object.keys(focusTypesCategories).find(
    focusType => fixture.categories.includes(focusTypesCategories[focusType])
  ) || null;

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

  // don't return empty objects
  if (Object.keys(jsonPhysical).length > 0) {
    return jsonPhysical;
  }
  return null;
}

/**
 * @param {Object|undefined} jsonMatrix The matrix JSON data (if present) that should be downgraded.
 * @param {Fixture} fixture The fixture the matrix belongs to.
 * @returns {Object} A downgraded version of the specified matrix object.
 */
function getDowngradedMatrix(jsonMatrix, fixture) {
  if (jsonMatrix && jsonMatrix.pixelGroups) {
    Object.keys(jsonMatrix.pixelGroups).forEach(groupKey => {
      jsonMatrix.pixelGroups[groupKey] = fixture.matrix.pixelGroups[groupKey];
    });
  }

  return jsonMatrix;
}

/**
 * @param {String} channelKey A key that exists in given channelObject and specifies the channel that should be downgraded.
 * @param {Object} jsonChannel The channel JSON data that should be downgraded.
 * @param {Fixture} fixture The fixture the channel belongs to.
 * @returns {Object} A downgraded version of the specified channel object.
 */
function getDowngradedChannel(channelKey, jsonChannel, fixture) {
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

  return downgradedChannel;

  /**
   * @returns {Boolean} Whether or not it is needed to include capabilities in a downgraded version of this channel
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
 * @param {Object} obj The object where the property should be created.
 * @param {String} property The name of the property added to obj.
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
