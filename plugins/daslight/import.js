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

  const sslFixture = Array.isArray(xml.DLMFILE.SSLLIBRARY) ? xml.DLMFILE.SSLLIBRARY[0] : xml.DLMFILE.SSLLIBRARY;
  const sslProperties = Array.isArray(sslFixture.SSLPROPERTIES) ? sslFixture.SSLPROPERTIES[0] : sslFixture.SSLPROPERTIES;
  fixture.name = sslProperties.$.SSLRDMFIXTURENAME;
  
  // Generate shortName from fixture name
  fixture.shortName = generateShortName(fixture.name);

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

  fixture.categories = getOflCategories(sslFixture);

  const authors = sslProperties.$.SSLCREATOR ? sslProperties.$.SSLCREATOR.split(/,\s*/) : [];
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

  fixture.matrix = getOflMatrix(sslFixture);

  const sslChannels = getUniqueSslChannels(sslFixture);

  fixture.wheels = getOflWheels(sslChannels);

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
  const sslModesContainer = Array.isArray(sslFixture.SSLMODES) ? sslFixture.SSLMODES[0] : sslFixture.SSLMODES;
  const sslModes = Array.isArray(sslModesContainer.SSLMODE) ? sslModesContainer.SSLMODE : [sslModesContainer.SSLMODE];
  for (const sslMode of sslModes) {
    const mode = {
      name: `${sslMode.$.SSLNBCHANNEL}-channel`,
      shortName: `${sslMode.$.SSLNBCHANNEL}-ch`,
      channels: (Array.isArray(sslMode.SSLCHANNEL) ? sslMode.SSLCHANNEL : [sslMode.SSLCHANNEL]).map(sslChannel => sslChannel.$.SSLCHANNELNAME),
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
    const fineChannel = /fine/i.test(sslChannelName) || sslChannelName.startsWith(`µ`);
    if (fineChannel) {
      continue;
    }
    const channel = {};
    const hasFineChannel = `${sslChannelName} fine` in sslChannels || `µ${sslChannelName}` in sslChannels;
    if (hasFineChannel) {
      const fineChannelName = `${sslChannelName} fine` in sslChannels ? `${sslChannelName} fine` : `µ${sslChannelName}`;
      channel.fineChannelAliases = [fineChannelName];
    }

    const foundChannelType = Object.keys(channelTypeFunctions).find(
      channelType => channelTypeFunctions[channelType].isChannelType(sslChannelName),
    );

    channelTypeFunctions[foundChannelType].addChannelCapabilities(sslChannel, sslProperties, channel, sslChannelName);

    availableChannels[sslChannelName] = channel;
  }

  return availableChannels;
}

/**
 * Adds a global physical object to the OFL fixture object, if necessary.
 * @param {object} sslFixture The SSL fixture object.
 * @returns {object} The OFL fixture physical.
 */
function addOflFixturePhysical(sslFixture) {
  const sslProperties = Array.isArray(sslFixture.SSLPROPERTIES) ? sslFixture.SSLPROPERTIES[0] : sslFixture.SSLPROPERTIES;

  const physical = {};

  // Dimensions (convert cm to mm and reorder to [width, height, depth])
  if (sslProperties.$.SSLSIZEX && sslProperties.$.SSLSIZEY && sslProperties.$.SSLSIZEZ &&
      sslProperties.$.SSLSIZEX !== `0` && sslProperties.$.SSLSIZEY !== `0` && sslProperties.$.SSLSIZEZ !== `0`) {
    physical.dimensions = [
      Number.parseInt(sslProperties.$.SSLSIZEX, 10) * 10, // width
      Number.parseInt(sslProperties.$.SSLSIZEY, 10) * 10, // height  
      Number.parseInt(sslProperties.$.SSLSIZEZ, 10) * 10, // depth
    ];
  }

  // Weight (SSL seems to not have this, would be 0)
  // Power
  if (sslProperties.$.SSLLAMPPOWER && sslProperties.$.SSLLAMPPOWER !== `0`) {
    physical.power = Number.parseInt(sslProperties.$.SSLLAMPPOWER, 10);
  }

  // Bulb information
  const bulb = {};
  if (sslProperties.$.SSLLAMPTEMP && sslProperties.$.SSLLAMPTEMP !== `0`) {
    bulb.colorTemperature = Number.parseInt(sslProperties.$.SSLLAMPTEMP, 10);
  }
  if (sslProperties.$.SSLLAMPTYPE) {
    const lampType = sslProperties.$.SSLLAMPTYPE;
    const lampPower = sslProperties.$.SSLLAMPPOWER;
    if (lampType === `LED` && lampPower) {
      bulb.type = `${lampPower}W ${lampType}`;
    } else {
      bulb.type = lampType;
    }
  }
  if (Object.keys(bulb).length > 0) {
    physical.bulb = bulb;
  }

  // Lens information
  if (sslProperties.$.SSLBEAMOPENING && sslProperties.$.SSLBEAMOPENING !== `0`) {
    const beamAngle = Number.parseInt(sslProperties.$.SSLBEAMOPENING, 10);
    physical.lens = {
      degreesMinMax: [beamAngle, beamAngle],
    };
  }

  return Object.keys(physical).length > 0 ? physical : undefined;
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
  const sslModesContainer = Array.isArray(sslFixture.SSLMODES) ? sslFixture.SSLMODES[0] : sslFixture.SSLMODES;
  const sslModes = Array.isArray(sslModesContainer.SSLMODE) ? sslModesContainer.SSLMODE : [sslModesContainer.SSLMODE];
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
  
  // SSL colors appear to be in BGR format, so we need to swap bytes
  // eslint-disable-next-line no-bitwise
  const red = (color >>> 16) & 0xFF;
  // eslint-disable-next-line no-bitwise
  const green = (color >>> 8) & 0xFF;
  // eslint-disable-next-line no-bitwise
  const blue = color & 0xFF;
  
  // Reorder to RGB
  // eslint-disable-next-line no-bitwise
  const rgbColor = (blue << 16) | (green << 8) | red;
  
  const hexColor = rgbColor.toString(16).padStart(6, `0`).toUpperCase();
  return `#${hexColor}`;
}

const slotTypeFunctions = {
  Open: {
    isSlotType: (sslPreset, channelGroup) => {
      const presetName = sslPreset.$.SSLPRESETNAME?.toLowerCase() || ``;
      return presetName.includes(`open`) || presetName.includes(`white`);
    },
    addSlotProperties: (sslPreset, slot) => {
      // Open slot doesn't need additional properties
    },
  },
  Color: {
    isSlotType: (sslPreset, channelGroup) => {
      return /color.*wheel/i.test(channelGroup) && sslPreset.$.SSLPRESETCOLOR;
    },
    addSlotProperties: (sslPreset, slot) => {
      slot.name = sslPreset.$.SSLPRESETNAME || `Color`;
      if (sslPreset.$.SSLPRESETCOLOR) {
        slot.colors = [decimalToHexColor(sslPreset.$.SSLPRESETCOLOR)];
      }
    },
  },
  Gobo: {
    isSlotType: (sslPreset, channelGroup) => {
      return /gobo.*wheel/i.test(channelGroup) || /static.*gobo/i.test(channelGroup);
    },
    addSlotProperties: (sslPreset, slot) => {
      slot.name = sslPreset.$.SSLPRESETNAME || `Gobo`;
      // Could add gobo image reference here if available in SSL
    },
  },
  Prism: {
    isSlotType: (sslPreset, channelGroup) => {
      return /prism/i.test(channelGroup);
    },
    addSlotProperties: (sslPreset, slot) => {
      slot.name = sslPreset.$.SSLPRESETNAME || `Prism`;
      // Try to extract facet count from name
      const facetMatch = slot.name.match(/(\d+)/);
      if (facetMatch) {
        slot.facets = Number.parseInt(facetMatch[1], 10);
      }
    },
  },

  // default (has to be the last element!)
  Unknown: {
    isSlotType: (sslPreset, channelGroup) => true,
    addSlotProperties: (sslPreset, slot) => {
      slot.name = sslPreset.$.SSLPRESETNAME || `Unknown`;
    },
  },
};

const channelTypeFunctions = {
  Pan: {
    isChannelType: sslChannelName => /pan/i.test(sslChannelName) && !/fine/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      channel.defaultValue = `50%`;
      channel.capability = {
        type: /continuous/i.test(sslChannel.$.SSLCHANNELNAME) ? `PanContinuous` : `Pan`,
        angleStart: `0deg`,
        angleEnd: `${sslProperties.$.SSLAMPLIPAN}deg`,
      };
    },
  },
  Tilt: {
    isChannelType: sslChannelName => /tilt/i.test(sslChannelName) && !/fine/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      channel.defaultValue = `50%`;
      channel.capability = {
        type: /continuous/i.test(sslChannel.$.SSLCHANNELNAME) ? `TiltContinuous` : `Tilt`,
        angleStart: `0deg`,
        angleEnd: `${sslProperties.$.SSLAMPLITILT}deg`,
      };
    },
  },
  Dimmer: {
    isChannelType: sslChannelName => /dimmer/i.test(sslChannelName) && !/fine/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      channel.capability = { type: `Intensity` };
    },
  },
  Shutter: {
    isChannelType: sslChannelName => /shutter/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      if (sslChannel.SSLPRESETS && sslChannel.SSLPRESETS.SSLPRESET) {
        channel.capabilities = getCapabilitiesFromPresets(sslChannel.SSLPRESETS.SSLPRESET);
      }
      else {
        channel.capability = { type: `ShutterStrobe` };
      }
    },
  },
  ColorWheel: {
    isChannelType: sslChannelName => /color.*wheel/i.test(sslChannelName) || (/color/i.test(sslChannelName) && /wheel/i.test(sslChannelName)),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      if (sslChannel.SSLPRESETS && sslChannel.SSLPRESETS.SSLPRESET) {
        channel.capabilities = getCapabilitiesFromPresets(sslChannel.SSLPRESETS.SSLPRESET);
      }
      else {
        channel.capability = { type: `WheelSlot`, wheel: sslChannelName };
      }
    },
  },
  GoboWheel: {
    isChannelType: sslChannelName => /gobo.*wheel/i.test(sslChannelName) || (/gobo/i.test(sslChannelName) && /wheel/i.test(sslChannelName)),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      if (sslChannel.SSLPRESETS && sslChannel.SSLPRESETS.SSLPRESET) {
        channel.capabilities = getCapabilitiesFromPresets(sslChannel.SSLPRESETS.SSLPRESET);
      }
      else {
        channel.capability = { type: `WheelSlot`, wheel: sslChannelName };
      }
    },
  },
  Rotation: {
    isChannelType: sslChannelName => /rotation/i.test(sslChannelName) || /rot/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      if (sslChannel.SSLPRESETS && sslChannel.SSLPRESETS.SSLPRESET) {
        channel.capabilities = getCapabilitiesFromPresets(sslChannel.SSLPRESETS.SSLPRESET);
      }
      else {
        channel.capability = { type: `WheelRotation` };
      }
    },
  },
  ColorMixing: {
    isChannelType: sslChannelName => /^(red|green|blue|white|amber|uv|cyan|magenta|yellow|cto)$/i.test(sslChannelName),
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      channel.capability = { type: `ColorIntensity`, color: sslChannelName.toLowerCase() };
    },
  },
  // default (has to be the last element!)
  Unknown: {
    isChannelType: sslChannelName => true,
    addChannelCapabilities: (sslChannel, sslProperties, channel, sslChannelName) => {
      if (sslChannel.SSLPRESETS && sslChannel.SSLPRESETS.SSLPRESET) {
        channel.capabilities = getCapabilitiesFromPresets(sslChannel.SSLPRESETS.SSLPRESET);
      }
      else {
        channel.capability = { type: `Generic` };
      }
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
  
  // Check if channel has presets
  if (!sslChannel.SSLPRESETS) {
    return slots;
  }
  
  // Handle the array structure of SSLPRESETS
  const presetsContainer = Array.isArray(sslChannel.SSLPRESETS) ? sslChannel.SSLPRESETS[0] : sslChannel.SSLPRESETS;
  
  if (!presetsContainer || !presetsContainer.SSLPRESET) {
    return slots;
  }
  
  const presets = Array.isArray(presetsContainer.SSLPRESET) ? presetsContainer.SSLPRESET : [presetsContainer.SSLPRESET];
  
  for (const sslPreset of presets) {
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
    // Detect wheel channels more comprehensively
    const isColorWheel = /color.*wheel/i.test(sslChannelName);
    const isGoboWheel = (/gobo.*wheel/i.test(sslChannelName) || /static.*gobo/i.test(sslChannelName)) && !/shake/i.test(sslChannelName);
    const isPrismWheel = /^prism$/i.test(sslChannelName);
    const isShakeChannel = /shake/i.test(sslChannelName);
    const isControlChannel = /rotation$/i.test(sslChannelName); // Channels that control rotation, not wheels themselves

    if ((isColorWheel || isGoboWheel || isPrismWheel) && !isShakeChannel && !isControlChannel) {
      // Map SSL wheel names to standard OFL names
      let wheelName = sslChannelName;
      if (sslChannelName === `Rotation Gobo Wheel`) {
        wheelName = `Gobo Wheel 1`;
      } else if (sslChannelName === `Static Gobo Wheel`) {
        wheelName = `Gobo Wheel 2`;
      } else if (sslChannelName === `Prism`) {
        wheelName = `Prism Wheel`;
      }
      
      wheels[wheelName] = {
        slots: getSlots(sslChannel),
      };
    }
  }

  return Object.keys(wheels).length > 0 ? wheels : undefined;
}

/**
 * @param {object} sslFixture The SSL fixture object.
 * @returns {string[]} An array of OFL categories.
 */
function getOflCategories(sslFixture) {
  const categories = [];

  const sslProperties = Array.isArray(sslFixture.SSLPROPERTIES) ? sslFixture.SSLPROPERTIES[0] : sslFixture.SSLPROPERTIES;

  // Basic categorization based on fixture properties
  if (sslProperties.$.SSLAMPLIPAN && sslProperties.$.SSLAMPLIPAN !== `0`) {
    categories.push(`Moving Head`);
  }
  else {
    categories.push(`Static`);
  }

  // Check for specific channel types to refine categories
  const sslModesContainer = Array.isArray(sslFixture.SSLMODES) ? sslFixture.SSLMODES[0] : sslFixture.SSLMODES;
  const sslModes = Array.isArray(sslModesContainer.SSLMODE) ? sslModesContainer.SSLMODE : [sslModesContainer.SSLMODE];
  const allChannels = new Set();

  for (const sslMode of sslModes) {
    const sslChannels = Array.isArray(sslMode.SSLCHANNEL) ? sslMode.SSLCHANNEL : [sslMode.SSLCHANNEL];
    for (const sslChannel of sslChannels) {
      allChannels.add(sslChannel.$.SSLCHANNELNAME.toLowerCase());
    }
  }

  if ([...allChannels].some(name => /gobo/i.test(name))) {
    categories.push(`Gobo`);
  }

  if ([...allChannels].some(name => /color/i.test(name))) {
    categories.push(`Color Changer`);
  }

  return categories.length > 0 ? categories : [`Other`];
}

/**
 * Converts SSL presets to OFL capabilities.
 * @param {object[]} sslPresets Array of SSL preset objects.
 * @returns {object[]} Array of OFL capability objects.
 */
function getCapabilitiesFromPresets(sslPresets) {
  const presets = Array.isArray(sslPresets) ? sslPresets : [sslPresets];
  const capabilities = [];

  for (const preset of presets) {
    const capability = {
      dmxRange: [Number.parseInt(preset.$.SSLPRESETDMXSTART, 10), Number.parseInt(preset.$.SSLPRESETDMXEND, 10)],
    };

    const presetName = preset.$.SSLPRESETNAME?.toLowerCase() || ``;
    const presetType = Number.parseInt(preset.$.SSLPRESETTYPE, 10);

    addPresetCapabilityProperties(capability, preset, presetName, presetType, capabilities.length);

    capabilities.push(capability);
  }

  return capabilities;
}

/**
 * Adds capability properties based on SSL preset type and name.
 * @param {object} capability The capability object to modify.
 * @param {object} preset The SSL preset object.
 * @param {string} presetName The lowercase preset name.
 * @param {number} presetType The preset type number.
 * @param {number} slotIndex The current slot index for numbering.
 */
function addPresetCapabilityProperties(capability, preset, presetName, presetType, slotIndex) {
  // Handle special cases first
  if (presetName.includes(`open`) && presetType !== 19) {
    capability.type = `ShutterStrobe`;
    capability.shutterEffect = `Open`;
    return;
  }
  if (presetName.includes(`closed`) && presetType !== 20) {
    capability.type = `ShutterStrobe`;
    capability.shutterEffect = `Closed`;
    return;
  }
  if (presetName.includes(`strobe`) && presetType !== 21) {
    capability.type = `ShutterStrobe`;
    capability.shutterEffect = `Strobe`;
    return;
  }
  if (presetName.includes(`rotation`) && presetType !== 11) {
    addContinuousRotationCapabilityProperties(capability, presetName);
    return;
  }

  // Handle by preset type
  switch (presetType) {
    case 1:
    case 2: {
      addColorCapabilityProperties(capability, preset, slotIndex);
      break;
    }
    case 4: {
      capability.type = `Intensity`;
      break;
    }
    case 7: {
      addGoboCapabilityProperties(capability, preset, slotIndex);
      break;
    }
    case 9: {
      addRotationIndexCapabilityProperties(capability, preset);
      break;
    }
    case 11: {
      addContinuousRotationCapabilityProperties(capability, presetName);
      break;
    }
    case 19: {
      capability.type = `ShutterStrobe`;
      capability.shutterEffect = `Open`;
      break;
    }
    case 20: {
      capability.type = `ShutterStrobe`;
      capability.shutterEffect = `Closed`;
      break;
    }
    case 21: {
      capability.type = `ShutterStrobe`;
      capability.shutterEffect = `Strobe`;
      if (preset.$.SSLPRESETPARAMMIN && preset.$.SSLPRESETPARAMMAX) {
        capability.speed = `${preset.$.SSLPRESETPARAMMIN}Hz slow to ${preset.$.SSLPRESETPARAMMAX}Hz fast`;
      }
      break;
    }
    default: {
      addGenericCapabilityProperties(capability, preset);
      break;
    }
  }
}

/**
 * Adds color capability properties.
 * @param {object} capability The capability object.
 * @param {object} preset The SSL preset object.
 * @param {number} slotIndex The slot index.
 */
function addColorCapabilityProperties(capability, preset, slotIndex) {
  capability.type = `WheelSlot`;
  capability.slotNumber = slotIndex + 1;
  if (preset.$.SSLPRESETCOLOR) {
    capability.colors = [decimalToHexColor(preset.$.SSLPRESETCOLOR)];
  }
  if (preset.$.SSLPRESETNAME) {
    capability.name = preset.$.SSLPRESETNAME;
  }
}

/**
 * Adds gobo capability properties.
 * @param {object} capability The capability object.
 * @param {object} preset The SSL preset object.
 * @param {number} slotIndex The slot index.
 */
function addGoboCapabilityProperties(capability, preset, slotIndex) {
  capability.type = `WheelSlot`;
  capability.slotNumber = slotIndex + 1;
  if (preset.$.SSLPRESETNAME) {
    capability.name = preset.$.SSLPRESETNAME;
  }
}

/**
 * Adds rotation index capability properties.
 * @param {object} capability The capability object.
 * @param {object} preset The SSL preset object.
 */
function addRotationIndexCapabilityProperties(capability, preset) {
  capability.type = `WheelRotation`;
  capability.wheel = `Gobo`;
  if (preset.$.SSLPRESETPARAMMIN && preset.$.SSLPRESETPARAMMAX) {
    capability.angle = `${preset.$.SSLPRESETPARAMMIN}deg to ${preset.$.SSLPRESETPARAMMAX}deg`;
  }
}

/**
 * Adds continuous rotation capability properties.
 * @param {object} capability The capability object.
 * @param {string} presetName The preset name.
 */
function addContinuousRotationCapabilityProperties(capability, presetName) {
  capability.type = `WheelRotation`;
  capability.wheel = `Gobo`;
  if (presetName.includes(`left`) || presetName.includes(`anti`)) {
    capability.speed = `slow CCW to fast CCW`;
  }
  else if (presetName.includes(`right`)) {
    capability.speed = `slow CW to fast CW`;
  }
}

/**
 * Adds generic capability properties.
 * @param {object} capability The capability object.
 * @param {object} preset The SSL preset object.
 */
function addGenericCapabilityProperties(capability, preset) {
  capability.type = `Generic`;
  if (preset.$.SSLPRESETNAME) {
    capability.comment = preset.$.SSLPRESETNAME;
  }
}

/**
 * Generates a short name from the fixture name.
 * @param {string} fixtureName The full fixture name.
 * @returns {string} A short name for the fixture.
 */
function generateShortName(fixtureName) {
  // Extract key parts and numbers from the fixture name
  return fixtureName
    .replace(/[^\w\d\s]/g, ``) // Remove special chars
    .split(/\s+/) // Split on whitespace
    .map(word => {
      // Keep numbers and first few letters of words
      if (/^\d+$/.test(word)) return word;
      if (word.length <= 3) return word.toUpperCase();
      return word.substring(0, 3).toUpperCase();
    })
    .join(``)
    .substring(0, 8); // Limit length
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
