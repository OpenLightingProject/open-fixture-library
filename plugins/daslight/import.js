import xml2js from 'xml2js';
import importJson from '../../lib/import-json.js';
import ARACrypt from './crypt.js';

export const version = `0.0.1`;

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise<object, Error>} A Promise resolving to an out object
 */
export async function importFixtures(buffer, filename, authorName) {
  const timestamp = new Date().toISOString().replace(/T.*/, ``);

  const warnings = [];

  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
  };

  const crypto = new ARACrypt();
  const decrypt = await crypto.transformBuffer(buffer);
  const xml = await xml2js.parseStringPromise(decrypt.toString());

  if (!(`DLMFILE` in xml) || !(`SSLLIBRARY` in xml.DLMFILE)) {
    throw new Error(`Nothing to import.`);
  }

  const sslFixture = xml.DLMFILE.SSLLIBRARY;
  const sslProperties = sslFixture.SSLPROPERTIES;
  fixture.name = sslProperties.$.SSLRDMFIXTURENAME;

  const manufacturerKey = slugify(sslProperties.$.SSLRDMMANUFACTURERNAME);
  const fixtureKey = `${manufacturerKey}/${slugify(fixture.name)}`;

  const oflManufacturers = await importJson(`../../fixtures/manufacturers.json`, import.meta.url);

  const manufacturers = {};
  if (!(manufacturerKey in oflManufacturers)) {
    manufacturers[manufacturerKey] = {
      name: sslProperties.$.SSLRDMMANUFACTURERNAME,
    };
    warnings.push(`Please check if manufacturer is correct and add manufacturer URL.`);
  }

  fixture.categories = {};

  const authors = sslProperties.$.SSLCREATOR;
  if (!authors.includes(authorName)) {
    authors.push(authorName);
  }

  fixture.meta = {
    authors,
    createDate: timestamp,
    lastModifyDate: timestamp,
    importPlugin: {
      plugin: `daslight`,
      date: timestamp,
      comment: `created by ${sslProperties.$.SSLCREATOR} (${xml.DLMFILE.$.TYPE} version ${xml.DLMFILE.$.VERSION})`,
    },
  };

  fixture.physical = addOflFixturePhysical(sslFixture); // WIP

  fixture.matrix = getOflMatrix(sslFixture); // WIP

  const sslChannels = getUniqueSslChannels(sslFixture);

  fixture.wheels = await getOflWheels(sslChannels); // WIP

  fixture.availableChannels = getOflChannels(sslChannels, sslProperties);

  fixture.modes = getOflModes(sslFixture);

  return {
    manufacturers,
    fixtures: {
      [fixtureKey]: fixture,
    },
    warnings: {
      [fixtureKey]: warnings,
    },
  };
}

/**
 * Adds a modes to the OFL fixture object.
 * @param {object} sslFixture Object containing SSL fixture.
 * @returns {object} The OFL fixture physical.
 */
function getOflModes(sslFixture) {
  const modes = [];
  for (const sslMode of sslFixture.SSLMODES.SSLMODE) {
    const mode = {
      name: `${sslMode.$.SSLNBCHANNEL}-channel`,
      shortName: `${sslMode.$.SSLNBCHANNEL}-ch`,
      channels: sslMode.SSLCHANNEL.map(sslChannel => sslChannel.$.SSLCHANNELNAME),
    };
    modes.push(mode);
  }

  return modes;
}

/**
 * Adds a global physical object to the OFL fixture object, if necessary.
 * @param {object} sslChannels Object containing unique SSL channels.
 * @param {object} sslProperties The SSL fixture properties
 * @returns {object} The OFL fixture physical.
 */
function getOflChannels(sslChannels, sslProperties) {
  const availableChannels = {};
  for (const [sslChannelName, sslChannel] of Object.entries(sslChannels)) {
    const fineChannel = /fine/i.test(sslChannelName);
    if (fineChannel) {
      continue;
    }
    const channel = {};
    const hasFineChannel = `${sslChannelName} fine` in sslChannel;
    channel.fineChannelAliases = hasFineChannel ? [`${sslChannelName} fine`] : undefined;

    const foundChannelType = Object.keys(channelTypeFunctions).find(
      channelType => channelTypeFunctions[channelType].isChannelType(sslChannelName),
    );

    channelTypeFunctions[foundChannelType].addChannelCapabilities(sslChannel, sslProperties, channel);

  }

  return availableChannels;
}

/**
 * Adds a global physical object to the OFL fixture object, if necessary.
 * @param {object} sslFixture The SSL fixture object.
 * @returns {object} The OFL fixture physical.
 */
function addOflFixturePhysical(sslFixture) {
  return {
    power: sslFixture.SSLPROPERTIES.$.SSLLAMPPOWER,
    bulb: {
      colorTemperature: sslFixture.SSLPROPERTIES.$.SSLLAMPTEMP,
    },
  };
}

/**
 * @param {object} sslFixture The fixture Object
 * @returns {object} The OFL matrix object (may be empty).
 */
function getOflMatrix(sslFixture) {
  return {};
}

/**
 * @param {object} sslFixture The fixture Object
 * @returns {object} The list of unique channels of the fixture.
 */
function getUniqueSslChannels(sslFixture) {
  const sslModes = Array.isArray(sslFixture.SSLMODES.SSLMODE) ? sslFixture.SSLMODES.SSLMODE : [sslFixture.SSLMODES.SSLMODE];
  const channels = {};
  const channelNames = new Set();

  for (const sslMode of sslModes) {
    const sslChannels = Array.isArray(sslMode.SSLCHANNEL) ? sslMode.SSLCHANNEL : [sslMode.SSLCHANNEL];
    for (const sslChannel of sslChannels) {
      const channelName = sslChannel.$.SSLCHANNELNAME;
      if (!channelNames.has(channelName)) {
        channels[channelName] = sslChannel;
        channelNames.add(channelName);
      }
    }
  }

  return channels;
}

/**
 * @param {number} decimal The decimal to convert to a hex color.
 * @returns {string} hex color
 */
function decimalToHexColor(decimal) {
  // eslint-disable-next-line no-bitwise
  const unsigned = decimal >>> 0;
  // eslint-disable-next-line no-bitwise
  const color = unsigned & 0xFF_FF_FF;
  const hexColor = color.toString(16).padStart(6, `0`).toUpperCase();
  return `#${hexColor}`;
}

const slotTypeFunctions = {
  Open: {
    isSlotType: (sslPreset, channelGroup) => (channelGroup === `Color` && sslPreset.$.SSLPRESETNAME === `white`) || sslPreset.$.SSLPRESETNAME === `Open`,
    addSlotProperties: (sslPreset, slot) => {},
  },
  Gobo: {
    isSlotType: (sslPreset, channelGroup) => (channelGroup === `Gobo`),
    addSlotProperties: (sslPreset, slot) => {},
  },
  Color: {
    isSlotType: (sslPreset, channelGroup) => (channelGroup === `Color`),
    addSlotProperties: (sslPreset, slot) => {
      slot.name = sslPreset.$.SSLPRESETNAME;
      slot.colors = [decimalToHexColor(sslPreset.$.SSLPRESETCOLOR)];
    },
  },
  // tbd
  Prism: {
    isSlotType: (sslPreset, channelGroup, capabilityPreset) => (capabilityPreset ? capabilityPreset === `PrismEffectOn` : channelGroup === `Prism`),
    addSlotProperties: (sslPreset, slot) => {},
  },

  // default (has to be the last element!)
  Unknown: {
    isSlotType: (sslPreset, channelGroup) => true,
    addSlotProperties: (sslPreset, slot) => {
      slot.name = sslPreset.$.SSLPRESETNAME;
    },
  },
};

const channelTypeFunctions = {
  Pan: {
    isChannelType: sslChannelName => sslChannelName === /pan/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel) => {
      channel.defaultValue = `50%`;
      channel.capability = { type: /continuous/i.test(sslChannel.$.SSLCHANNELNAME) ? `PanContinuous` : `Pan`, angleStart: `0deg`, angleEnd: `${sslProperties.$.SSLAMPLIPAN}deg` };
    },
  },
  Tilt: {
    isChannelType: sslChannelName => sslChannelName === /tilt$\b/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel) => {
      channel.capability = { type: `Tilt`, angleStart: `0deg`, angleEnd: `${sslProperties.$.SSLAMPLITILT}deg` };
    },
  },
  Dimmer: {
    isChannelType: sslChannelName => sslChannelName === /dimmer$\b/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel) => {
      channel.capability = { type: `Intensity` };
    },
  },
  // default (has to be the last element!)
  Unknown: {
    isChannelType: sslChannelName => true,
    addChannelCapabilities: (sslChannel, sslProperties, channel) => {
      channel.capability = { type: `Unknown` };
    },
  },
};

/**
 * @param {object} sslChannel The ssl channel object.
 * @returns {object[]} An array of OFL slot objects.
 */
function getSlots(sslChannel) {
  const slots = [];
  const channelGroup = sslChannel.$.SSLCHANNELNAME;
  for (const sslPreset of (sslChannel.SSLPRESETS.SSLPRESET || [])) {
    const presetName = sslPreset.$.SSLPRESETNAME || ``;

    if (/\bc?cw\b|rainbow|stop|(?:counter|anti)?[ -]?clockwise|right|left|rotoff|rotat|spin/i.test(presetName)) {
      // skip rotation capabilities
      continue;
    }
    if (sslPreset.$.SSLPRESETCOLOR2) {
      // skip halves
      continue;
    }

    const foundSlotType = Object.keys(slotTypeFunctions).find(
      slotType => slotTypeFunctions[slotType].isSlotType(sslPreset, channelGroup, presetName),
    );

    const slot = {
      type: foundSlotType,
    };

    slotTypeFunctions[foundSlotType].addSlotProperties(sslPreset, slot);

    slots.push(slot);
  }

  return slots;
}

/**
 * Try to extract (guessed) wheels from all channels / capabilities.
 * @param {object} sslChannels Keu value Object of unique channels.
 * @returns {Promise<object | undefined>} A Promise that resolves to the OFL wheels object or undefined if there are no wheels.
 */
function getOflWheels(sslChannels) {
  const wheels = {};

  for (const [sslChannelName, sslChannel] of Object.entries(sslChannels)) {
    const isWheelChannel = /gobo$\b|color$\b|wheel\b/i.test(sslChannelName);
    const isRotationChannel = /rotation/i.test(sslChannelName);
    const isShakeChannel = /shake/i.test(sslChannelName);

    if (isWheelChannel && !isRotationChannel && !isShakeChannel) {
      wheels[sslChannelName] = {
        slots: getSlots(sslChannel),
      };
    }
  }

  return Object.keys(wheels).length > 0 ? wheels : undefined;
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
