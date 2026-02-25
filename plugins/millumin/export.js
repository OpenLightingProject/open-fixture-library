import fixtureJsonStringify from '../../lib/fixture-json-stringify.js';

import CoarseChannel from '../../lib/model/CoarseChannel.js';
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

export const version = `0.4.0`;

// needed for export test
export const supportedOflVersion = `7.3.0`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  // one JSON file for each fixture
  return fixtures.map(fixture => {
    try {
      return getFixtureFile(fixture);
    }
    catch (error) {
      throw new Error(`Exporting fixture ${fixture.manufacturer.key}/${fixture.key} failed: ${error}`, {
        cause: error,
      });
    }
  });
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @returns {object} The generated fixture JSON file.
 */
function getFixtureFile(fixture) {
  const oflJson = structuredClone(fixture.jsonObject);
  const milluminJson = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${supportedOflVersion}/schemas/fixture.json`,
    name: oflJson.name,
  };

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
    milluminJson.availableChannels = Object.fromEntries(Object.entries(oflJson.availableChannels).map(
      ([channelKey, jsonChannel]) => [channelKey, getDowngradedChannel(channelKey, jsonChannel, fixture)],
    ));
  }

  if (oflJson.templateChannels) {
    milluminJson.templateChannels = Object.fromEntries(Object.entries(oflJson.templateChannels).map(
      ([channelKey, jsonChannel]) => [channelKey, getDowngradedChannel(channelKey, jsonChannel, fixture)],
    ));
  }

  milluminJson.modes = oflJson.modes;

  milluminJson.fixtureKey = fixture.key;
  milluminJson.manufacturerKey = fixture.manufacturer.key;
  milluminJson.oflURL = fixture.url;

  return {
    name: `${fixture.manufacturer.key}/${fixture.key}.json`,
    content: fixtureJsonStringify(milluminJson),
    mimetype: `application/ofl-fixture`,
    fixtures: [fixture],
  };
}

/**
 * Replaces the fixture's categories array with one that only includes categories
 * from the supported OFL schema version.
 * @param {string[]} categories The fixture's categories array.
 * @returns {string[]} A filtered categories array.
 */
function getDowngradedCategories(categories) {
  const replaceCategories = {
    'Barrel Scanner': `Effect`,
  };
  const ignoredCategories = new Set([`Pixel Bar`, `Stand`]);

  const downgradedCategories = categories.flatMap(category => {
    if (ignoredCategories.has(category)) {
      return [];
    }

    if (category in replaceCategories) {
      category = replaceCategories[category];

      if (categories.includes(category)) {
        // replaced category is already used
        return [];
      }
    }

    return category;
  });

  if (downgradedCategories.length === 0) {
    downgradedCategories.push(`Other`);
  }

  return downgradedCategories;
}

/**
 * Replaces the fixture's physical JSON object with one that fits to the supported OFL schema version.
 * Specifically, the outdated focus property (with type, panMax and tiltMax) is generated and added if needed.
 * @param {object} jsonPhysical The physical JSON that should be downgraded. May be an empty object.
 * @param {Fixture} fixture The fixture whose physical data should be downgraded.
 * @returns {object} The downgraded physical JSON object.
 */
function getDowngradedFixturePhysical(jsonPhysical, fixture) {
  const focusTypesCategories = {
    Head: `Moving Head`,
    Mirror: `Scanner`,
    Barrel: `Barrel Scanner`,
    Fixed: null,
  };
  const type = Object.keys(focusTypesCategories).find(
    focusType => fixture.categories.includes(focusTypesCategories[focusType]),
  ) || null;

  const [panMax, tiltMax] = [`Pan`, `Tilt`].map(panOrTilt => {
    const capabilities = fixture.coarseChannels.flatMap(channel => channel.capabilities || []);

    const hasContinuousCapability = capabilities.some(capability => capability.type === `${panOrTilt}Continuous`);
    if (hasContinuousCapability) {
      return `infinite`;
    }

    const panTiltCapabilities = capabilities.filter(capability => capability.type === panOrTilt && capability.angle[0].unit === `deg`);
    const minAngle = Math.min(...panTiltCapabilities.map(capability => Math.min(capability.angle[0].number, capability.angle[1].number)));
    const maxAngle = Math.max(...panTiltCapabilities.map(capability => Math.max(capability.angle[0].number, capability.angle[1].number)));
    const panTiltMax = maxAngle - minAngle;

    if (panTiltMax > Number.NEGATIVE_INFINITY) {
      return panTiltMax;
    }

    return null;
  });

  const focus = {
    type,
    panMax,
    tiltMax,
  };

  // remove null properties
  for (const [key, value] of Object.entries(focus)) {
    if (value === null) {
      delete focus[key];
    }
  }

  if (Object.keys(focus).length > 0) {
    jsonPhysical.focus = focus;

    if (jsonPhysical.matrixPixels) {
      // remove matrixPixels and add them again after focus
      const matrixPixels = jsonPhysical.matrixPixels;
      delete jsonPhysical.matrixPixels;
      jsonPhysical.matrixPixels = matrixPixels;
    }
  }

  delete jsonPhysical.powerConnectors;

  // don't return empty objects
  if (Object.keys(jsonPhysical).length > 0) {
    return jsonPhysical;
  }
  return null;
}

/**
 * @param {object | undefined} jsonMatrix The matrix JSON data (if present) that should be downgraded.
 * @param {Fixture} fixture The fixture the matrix belongs to.
 * @returns {object} A downgraded version of the specified matrix object.
 */
function getDowngradedMatrix(jsonMatrix, fixture) {
  if (jsonMatrix && jsonMatrix.pixelGroups) {
    for (const groupKey of Object.keys(jsonMatrix.pixelGroups)) {
      jsonMatrix.pixelGroups[groupKey] = fixture.matrix.pixelGroups[groupKey];
    }
  }

  return jsonMatrix;
}

/**
 * @param {string} channelKey A key that exists in given channelObject and specifies the channel that should be downgraded.
 * @param {object} jsonChannel The channel JSON data that should be downgraded.
 * @param {Fixture} fixture The fixture the channel belongs to.
 * @returns {object} A downgraded version of the specified channel object.
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

    for (const capability of channel.capabilities) {
      const downgradedCapability = {
        range: [capability.rawDmxRange.start, capability.rawDmxRange.end],
        name: capability.name,
      };

      addIfValidData(downgradedCapability, `menuClick`, capability.jsonObject.menuClick);
      if (capability.colors && capability.colors.allColors.length <= 2) {
        downgradedCapability.color = capability.colors.allColors[0];

        if (capability.colors.allColors[1]) {
          downgradedCapability.color2 = capability.colors.allColors[1];
        }
      }
      addIfValidData(downgradedCapability, `helpWanted`, capability.jsonObject.helpWanted);
      addIfValidData(downgradedCapability, `switchChannels`, capability.jsonObject.switchChannels);

      downgradedChannel.capabilities.push(downgradedCapability);
    }
  }

  return downgradedChannel;

  /**
   * @returns {boolean} Whether or not it is needed to include capabilities in a downgraded version of this channel
   */
  function capabilitiesNeeded() {
    const trivialCapabilityTypes = [`Intensity`, `ColorIntensity`, `Pan`, `Tilt`, `NoFunction`];
    return channel.capabilities.length !== 1 || !trivialCapabilityTypes.includes(channel.capabilities[0].type);
  }
}

/**
 * Saves the given data (or value, if given) into obj[property] if data is valid,
 * i.e. it is neither undefined, nor null, nor false.
 * @param {object} object The object where the property should be created.
 * @param {string} property The name of the property added to obj.
 * @param {any} data If this is valid, the property is added to obj.
 * @param {any} value The property value, if data is valid. Defaults to `data`.
 */
function addIfValidData(object, property, data, value) {
  if (value === undefined) {
    value = data;
  }

  if (data !== undefined && data !== null && data !== false) {
    object[property] = value;
  }
}
