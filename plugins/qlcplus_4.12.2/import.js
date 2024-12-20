import xml2js from 'xml2js';

import importJson from '../../lib/import-json.js';
import {
  capabilityPresets,
  getCapabilityFromCapabilityPreset,
  getCapabilityFromChannelPreset,
  importHelpers,
} from './presets.js';

const qlcplusGoboAliasesPromise = importJson(`../../resources/gobos/aliases/qlcplus.json`, import.meta.url);

export const version = `1.1.1`;

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

  const xml = await xml2js.parseStringPromise(buffer.toString());

  const qlcPlusFixture = xml.FixtureDefinition;
  fixture.name = qlcPlusFixture.Model[0];

  const manufacturerKey = slugify(qlcPlusFixture.Manufacturer[0]);
  const fixtureKey = `${manufacturerKey}/${slugify(fixture.name)}`;

  const oflManufacturers = await importJson(`../../fixtures/manufacturers.json`, import.meta.url);

  const manufacturers = {};
  if (!(manufacturerKey in oflManufacturers)) {
    manufacturers[manufacturerKey] = {
      name: qlcPlusFixture.Manufacturer[0],
    };
    warnings.push(`Please check if manufacturer is correct and add manufacturer URL.`);
  }

  fixture.categories = getOflCategories(qlcPlusFixture);

  const authors = qlcPlusFixture.Creator[0].Author[0].split(/,\s*/);
  if (!authors.includes(authorName)) {
    authors.push(authorName);
  }

  fixture.meta = {
    authors,
    createDate: timestamp,
    lastModifyDate: timestamp,
    importPlugin: {
      plugin: `qlcplus_4.12.1`,
      date: timestamp,
      comment: `created by ${qlcPlusFixture.Creator[0].Name[0]} (version ${qlcPlusFixture.Creator[0].Version[0]})`,
    },
  };

  if (!(`Mode` in qlcPlusFixture)) {
    qlcPlusFixture.Mode = [];
  }
  if (!(`Channel` in qlcPlusFixture)) {
    qlcPlusFixture.Channel = [];
  }

  addOflFixturePhysical(fixture, qlcPlusFixture);

  fixture.matrix = getOflMatrix(qlcPlusFixture);
  fixture.wheels = await getOflWheels(qlcPlusFixture);
  fixture.availableChannels = {};
  fixture.templateChannels = {};

  for (const channel of qlcPlusFixture.Channel) {
    addOflChannel(fixture, channel, qlcPlusFixture);
  }

  mergeFineChannels(fixture, qlcPlusFixture, warnings);

  fixture.modes = qlcPlusFixture.Mode.map(mode => getOflMode(mode, fixture.physical, warnings));

  addSwitchingChannels(fixture, qlcPlusFixture);

  cleanUpFixture(fixture, qlcPlusFixture);

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
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @returns {string[]} The OFL fixture categories.
 */
function getOflCategories(qlcPlusFixture) {
  const category = qlcPlusFixture.Type[0];

  if (category.startsWith(`LED Bar`)) {
    return [`Pixel Bar`];
  }

  return [category];
}

/**
 * Adds a global physical object to the OFL fixture object, if necessary.
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 */
function addOflFixturePhysical(fixture, qlcPlusFixture) {
  const allModesHavePhysical = qlcPlusFixture.Mode.every(mode => `Physical` in mode);
  const firstPhysicalMode = qlcPlusFixture.Mode.find(mode => `Physical` in mode);
  const hasModePhysical = firstPhysicalMode !== undefined;
  const hasGlobalPhysical = `Physical` in qlcPlusFixture;

  if (hasGlobalPhysical || (hasModePhysical && !allModesHavePhysical)) {
    fixture.physical = getOflPhysical(hasGlobalPhysical ? qlcPlusFixture.Physical[0] : firstPhysicalMode.Physical[0]);

    if (qlcPlusFixture.Type[0] === `LED Bar (Pixels)`) {
      fixture.physical.matrixPixels = {
        spacing: [0, 0, 0],
      };
    }
  }
}

/**
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @returns {object} The OFL matrix object (may be empty).
 */
function getOflMatrix(qlcPlusFixture) {
  const matrix = {};

  const physicalLayouts = qlcPlusFixture.Mode.concat(qlcPlusFixture)
    .filter(object => `Physical` in object && `Layout` in object.Physical[0])
    .map(object => object.Physical[0].Layout[0]);

  if (physicalLayouts) {
    const maxWidth = Math.max(...physicalLayouts.map(layout => Number.parseInt(layout.$.Width, 10)));
    const maxHeight = Math.max(...physicalLayouts.map(layout => Number.parseInt(layout.$.Height, 10)));

    matrix.pixelCount = [maxWidth, maxHeight, 1];
  }

  return matrix;
}

const slotTypeFunctions = {
  Open: {
    isSlotType: (capability, channelGroup, capabilityPreset) => capability._ === `Open` || capability.$.Res1 === `Others/open.svg` || capability.$.Res === `Others/open.svg`,
    addSlotProperties: (capability, slot) => {},
  },
  Gobo: {
    isSlotType: (capability, channelGroup, capabilityPreset) => (capabilityPreset ? capabilityPreset === `GoboMacro` : channelGroup === `Gobo`),
    addSlotProperties: async (capability, slot) => {
      const goboResource = capability.$.Res1 || capability.$.Res || null;
      let useResourceName = false;

      if (goboResource) {
        const qlcplusGoboAliases = await qlcplusGoboAliasesPromise;
        const goboKey = qlcplusGoboAliases[goboResource];

        if (goboKey) {
          slot.resource = `gobos/${goboKey}`;

          const resource = await importJson(`../../resources/gobos/${goboKey}.json`, import.meta.url);

          if (resource.name === capability._) {
            useResourceName = true;
          }
        }
        else {
          slot.resource = `gobos/aliases/qlcplus/${goboResource}`;
        }
      }

      if (!useResourceName) {
        slot.name = capability._;
      }
    },
  },
  Color: {
    isSlotType: (capability, channelGroup, capabilityPreset) => (capabilityPreset ? [`ColorMacro`, `ColorDoubleMacro`].includes(capabilityPreset) : channelGroup === `Colour`),
    addSlotProperties: (capability, slot) => {
      slot.name = capability._;

      const colors = [`Color`, `Color2`, `Res1`, `Res2`]
        .filter(attribute => attribute in capability.$)
        .map(attribute => capability.$[attribute]);

      if (colors.length > 0) {
        slot.colors = colors;
      }
    },
  },
  Prism: {
    isSlotType: (capability, channelGroup, capabilityPreset) => (capabilityPreset ? capabilityPreset === `PrismEffectOn` : channelGroup === `Prism`),
    addSlotProperties: (capability, slot) => {
      slot.name = capability._;

      if (`Res1` in capability.$) {
        slot.facets = Number.parseInt(capability.$.Res1, 10);
      }
    },
  },

  // default (has to be the last element!)
  Unknown: {
    isSlotType: (capability, channelGroup, capabilityPreset) => true,
    addSlotProperties: (capability, slot) => {
      slot.name = capability._;
    },
  },
};

/**
 * Try to extract (guessed) wheels from all channels / capabilities.
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @returns {Promise<object | undefined>} A Promise that resolves to the OFL wheels object or undefined if there are no wheels.
 */
async function getOflWheels(qlcPlusFixture) {
  const wheels = {};

  const wheelChannels = qlcPlusFixture.Channel.filter(channel => {
    const channelName = channel.$.Name;

    const hasGoboPresetCapability = (channel.Capability || []).some(
      capability => [`GoboMacro`, `GoboShakeMacro`].includes(capability.$.Preset),
    );

    const isWheelChannel = /wheel\b/i.test(channelName) || hasGoboPresetCapability;
    const isRotationChannel = /rotation|index/i.test(channelName) || (`Group` in channel && channel.Group[0]._ === `Speed`);

    return isWheelChannel && !isRotationChannel;
  });

  for (const channel of wheelChannels) {
    wheels[channel.$.Name] = {
      slots: await getSlots(channel),
    };
  }

  return Object.keys(wheels).length > 0 ? wheels : undefined;


  /**
   * @param {object} qlcPlusChannel The QLC+ channel object.
   * @returns {Promise<object[]>} A Promise that resolves to an array of OFL slot objects.
   */
  async function getSlots(qlcPlusChannel) {
    const slots = [];

    for (const capability of (qlcPlusChannel.Capability || [])) {
      if (/\bc?cw\b|rainbow|stop|(?:counter|anti)?[ -]?clockwise|rotat|spin/i.test(capability._)) {
        // skip rotation capabilities
        continue;
      }

      const capabilityPreset = capability.$.Preset || ``;

      if (/^(?:GoboShakeMacro|ColorWheelIndex)$|^Rotation/.test(capabilityPreset)) {
        continue;
      }

      const foundSlotType = Object.keys(slotTypeFunctions).find(
        slotType => slotTypeFunctions[slotType].isSlotType(capability, qlcPlusChannel.Group[0]._, capabilityPreset),
      );

      const slot = {
        type: foundSlotType,
      };

      await slotTypeFunctions[foundSlotType].addSlotProperties(capability, slot);

      slots.push(slot);
    }

    return slots;
  }
}


const parserPerChannelType = {
  Nothing: () => ({
    type: `NoFunction`,
  }),
  Intensity: ({ qlcPlusChannel, capabilityName }) => {
    const capability = {};

    if (`Colour` in qlcPlusChannel && qlcPlusChannel.Colour[0] !== `Generic`) {
      capability.type = `ColorIntensity`;
      capability.color = qlcPlusChannel.Colour[0];
    }
    else {
      capability.type = `Intensity`;
    }

    if (!/^(?:intensity|dimmer)$/i.test(capabilityName)) {
      capability.comment = capabilityName;
    }

    return capability;
  },
  Colour: ({ channelName, qlcPlusCapability, capabilityName, index }) => {
    const capability = {};

    if (/wheel\b/i.test(channelName)) {
      capability.type = `WheelSlot`;
      capability.slotNumber = index + 1;

      capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

      if (`speed` in capability || `speedStart` in capability) {
        capability.type = `WheelRotation`;
        delete capability.slotNumber;
      }

      return capability;
    }

    capability.type = `ColorPreset`;
    capability.comment = capabilityName;

    if (`Color` in qlcPlusCapability.$) {
      capability.colors = [qlcPlusCapability.$.Color];

      if (`Color2` in qlcPlusCapability.$) {
        capability.colors.push(qlcPlusCapability.$.Color2);
      }
    }

    return capability;
  },
  Gobo: ({ capabilityName, channelNameInWheels, index }) => {
    if (/shake\b|shaking\b/i.test(capabilityName)) {
      return capabilityPresets.GoboShakeMacro.importCapability({ capabilityName, index });
    }

    const capability = {
      type: `WheelSlot`,
      slotNumber: index + 1,
    };

    capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

    if (`speed` in capability || `speedStart` in capability) {
      capability.type = channelNameInWheels ? `WheelRotation` : `WheelSlotRotation`;
      delete capability.slotNumber;
    }

    return capability;
  },
  Effect: ({ capabilityName }) => {
    const capability = {
      type: `Effect`,
      effectName: ``, // set it first here so effectName is before speedStart/speedEnd
    };
    capability.effectName = importHelpers.getSpeedGuessedComment(capabilityName, capability);

    if (capability.effectName === ``) {
      delete capability.effectName;
      if (capability.type === `Effect`) {
        capability.type = `Speed`;
      }
    }
    else if (capability.type === `Rotation`) {
      capability.comment = capability.effectName;
      delete capability.effectName;
    }
    else if (/\bsound\b/i.test(capability.effectName)) {
      capability.soundControlled = true;
    }

    return capability;
  },
  Maintenance: ({ capabilityName }) => ({
    type: `Maintenance`,
    comment: capabilityName,
  }),
  Pan: ({ channelName, capabilityName, panMax }) => {
    if (/continuous/i.test(channelName)) {
      const capability = {
        type: `PanContinuous`,
      };
      capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

      if (!(`speed` in capability || `speedStart` in capability)) {
        capability.speedStart = `slow CW`;
        capability.speedEnd = `fast CW`;
        capability.helpWanted = `Are the automatically added speed values correct?`;
      }

      return capability;
    }

    return Object.assign(importHelpers.getPanTiltCap(`Pan`, panMax), {
      comment: capabilityName,
    });
  },
  Tilt: ({ channelName, capabilityName, tiltMax }) => {
    if (/continuous/i.test(channelName)) {
      const capability = {
        type: `TiltContinuous`,
      };
      capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

      if (!(`speed` in capability || `speedStart` in capability)) {
        capability.speedStart = `slow CW`;
        capability.speedEnd = `fast CW`;
        capability.helpWanted = `Are the automatically added speed values correct?`;
      }

      return capability;
    }

    return Object.assign(importHelpers.getPanTiltCap(`Tilt`, tiltMax), {
      comment: capabilityName,
    });
  },
  Prism: ({ capabilityName }) => ({
    type: `Prism`,
    comment: capabilityName,
  }),
  Shutter: ({ capabilityName }) => {
    const capability = {
      type: `ShutterStrobe`,
    };

    const shutterEffects = {
      Closed: /^(?:blackout|(?:shutter |strobe )?closed?)$/i,
      Open: /^(?:(?:shutter |strobe )?open|full?)$/i,
      Pulse: /puls/i,
      RampUp: /ramp\s*up/i,
      RampDown: /ramp\s*down/i,
    };

    capability.shutterEffect = Object.keys(shutterEffects).find(
      shutterEffect => capabilityName.match(shutterEffects[shutterEffect]),
    ) || `Strobe`;

    if ([`Open`, `Closed`].includes(capability.shutterEffect)) {
      // short circuit, there's no need to test for randomTiming or speed
      return capability;
    }

    if (/random/i.test(capabilityName)) {
      capability.randomTiming = true;
    }

    capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

    if (!(`speed` in capability || `speedStart` in capability)) {
      capability.speedStart = `slow`;
      capability.speedEnd = `fast`;
      capability.helpWanted = `Are the automatically added speed values correct?`;
    }

    return capability;
  },
  Speed: ({ channelName, capabilityName }) => {
    const capability = {};

    if (/pan\/?tilt/i.test(channelName)) {
      capability.type = `PanTiltSpeed`;
    }
    else if (/strobe/i.test(channelName) || /strobe/i.test(capabilityName)) {
      if (/speed|rate/i.test(channelName)) {
        capability.type = `StrobeSpeed`;
      }
      else {
        capability.type = `ShutterStrobe`;
        capability.shutterEffect = `Strobe`;
      }
    }
    else {
      capability.type = `Speed`;
    }

    capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

    if (!(`speed` in capability || `speedStart` in capability)) {
      capability.speedStart = `slow`;
      capability.speedEnd = `fast`;
      capability.helpWanted = `Are the automatically added speed values correct?`;
    }

    return capability;
  },
};

/**
 * Adds a QLC+ channel to the OFL fixture's availableChannels object.
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusChannel The QLC+ channel object.
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 */
function addOflChannel(fixture, qlcPlusChannel, qlcPlusFixture) {
  const channel = {
    fineChannelAliases: [],
    dmxValueResolution: `8bit`,
    defaultValue: Number.parseInt(qlcPlusChannel.$.Default, 10) || 0,
  };

  const physicals = qlcPlusFixture.Mode.concat(qlcPlusFixture)
    .filter(object => `Physical` in object)
    .map(object => object.Physical[0]);

  const [panMax, tiltMax] = [`PanMax`, `TiltMax`].map(
    property => Math.max(...physicals.map(physical => {
      if (physical.Focus && property in physical.Focus[0].$) {
        return Number.parseInt(physical.Focus[0].$[property], 10) || 0;
      }
      return 0;
    })),
  );

  const channelName = qlcPlusChannel.$.Name;
  const channelPreset = qlcPlusChannel.$.Preset;

  if (channelPreset) {
    channel.capabilities = [getCapabilityFromChannelPreset(channelPreset, channelName, panMax, tiltMax)];
  }
  else if (`Capability` in qlcPlusChannel) {
    channel.capabilities = qlcPlusChannel.Capability.map(
      capability => getOflCapability(capability),
    );
  }
  else {
    channel.capabilities = [getOflCapability({
      _: `0-100%`,
      $: {
        Min: `0`,
        Max: `255`,
      },
    })];
  }

  fixture.availableChannels[channelName] = channel;


  /**
   * @param {object} qlcPlusCapability The QLC+ capability object.
   * @returns {object} The OFL capability object.
   */
  function getOflCapability(qlcPlusCapability) {
    const capability = {
      dmxRange: [Number.parseInt(qlcPlusCapability.$.Min, 10), Number.parseInt(qlcPlusCapability.$.Max, 10)],
      type: ``,
    };

    const trimmedChannelName = qlcPlusChannel.$.Name.trim();
    const channelType = qlcPlusChannel.Group[0]._;
    const capabilityName = (qlcPlusCapability._ || ``).trim();

    const capabilityData = {
      qlcPlusChannel,
      channelName: trimmedChannelName,
      channelType,
      channelNameInWheels: trimmedChannelName in (fixture.wheels || {}),
      qlcPlusCapability,
      capabilityName,
      index: qlcPlusChannel.Capability?.indexOf(qlcPlusCapability) ?? 0,
      res1: qlcPlusCapability.$.Res1,
      res2: qlcPlusCapability.$.Res2,
      panMax,
      tiltMax,
    };

    const capabilityPreset = qlcPlusCapability.$.Preset;

    if (capabilityPreset && capabilityPreset !== `Alias`) {
      Object.assign(capability, getCapabilityFromCapabilityPreset(capabilityPreset, capabilityData));
    }
    else if (/^(?:nothing|no func(?:tion)?|unused|not used|empty|no strobe|no prism|no frost)$/i.test(capabilityName)) {
      capability.type = `NoFunction`;
    }
    else if (channelType in parserPerChannelType) {
      // try to parse capability based on channel type
      Object.assign(capability, parserPerChannelType[channelType](capabilityData));
    }
    else {
      capability.type = `Generic`,
      capability.comment = capabilityName;
    }

    deleteCommentIfUnnecessary();

    return capability;


    /**
     * Deletes the capability's comment if it adds no valuable information.
     */
    function deleteCommentIfUnnecessary() {
      if (!(`comment` in capability)) {
        return;
      }

      const zeroToHundredRegex = /^0%?\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*100%$/i;

      if (capability.comment === trimmedChannelName || capability.comment.length === 0 || zeroToHundredRegex.test(capability.comment)) {
        delete capability.comment;
      }
    }
  }
}

/**
 * @param {object} qlcPlusPhysical The QLC+ mode's physical object.
 * @param {object | undefined} [oflFixturePhysical={}] The OFL fixture's physical object.
 * @returns {object} The OFL mode's physical object.
 */
function getOflPhysical(qlcPlusPhysical, oflFixturePhysical = {}) {
  const physical = {};

  addDimensions();
  addTechnical();

  if (`Bulb` in qlcPlusPhysical) {
    addBulb();
  }

  if (`Lens` in qlcPlusPhysical) {
    addLens();
  }

  for (const section of [`bulb`, `lens`]) {
    if (JSON.stringify(physical[section]) === `{}`) {
      delete physical[section];
    }
  }

  return physical;


  /**
   * Handles the Dimensions section.
   */
  function addDimensions() {
    if (!(`Dimensions` in qlcPlusPhysical)) {
      return;
    }

    const width = Number.parseFloat(qlcPlusPhysical.Dimensions[0].$.Width);
    const height = Number.parseFloat(qlcPlusPhysical.Dimensions[0].$.Height);
    const depth = Number.parseFloat(qlcPlusPhysical.Dimensions[0].$.Depth);
    const weight = Number.parseFloat(qlcPlusPhysical.Dimensions[0].$.Weight);

    const dimensionsArray = [width, height, depth];

    if (width + height + depth !== 0 && JSON.stringify(dimensionsArray) !== JSON.stringify(oflFixturePhysical.dimensions)) {
      physical.dimensions = dimensionsArray;
    }

    if (weight !== 0 && oflFixturePhysical.weight !== weight) {
      physical.weight = weight;
    }
  }

  /**
   * Handles the Technical section.
   */
  function addTechnical() {
    if (!(`Technical` in qlcPlusPhysical)) {
      return;
    }

    const power = Number.parseFloat(qlcPlusPhysical.Technical[0].$.PowerConsumption);
    if (power !== 0 && oflFixturePhysical.power !== power) {
      physical.power = power;
    }

    let DMXconnector = qlcPlusPhysical.Technical[0].$.DmxConnector;

    // remove whitespace
    if (DMXconnector === `3.5 mm stereo jack`) {
      DMXconnector = `3.5mm stereo jack`;
    }

    if (![``, `Other`, oflFixturePhysical.DMXconnector].includes(DMXconnector)) {
      physical.DMXconnector = DMXconnector;
    }
  }

  /**
   * Handles the Bulb section.
   */
  function addBulb() {
    physical.bulb = {};

    const type = qlcPlusPhysical.Bulb[0].$.Type;
    if (![``, `Other`, getOflFixturePhysicalProperty(`bulb`, `type`)].includes(type)) {
      physical.bulb.type = type;
    }

    const colorTemperature = Number.parseFloat(qlcPlusPhysical.Bulb[0].$.ColourTemperature);
    if (colorTemperature && getOflFixturePhysicalProperty(`bulb`, `colorTemperature`) !== colorTemperature) {
      physical.bulb.colorTemperature = colorTemperature;
    }

    const lumens = Number.parseFloat(qlcPlusPhysical.Bulb[0].$.Lumens);
    if (lumens && getOflFixturePhysicalProperty(`bulb`, `lumens`) !== lumens) {
      physical.bulb.lumens = lumens;
    }
  }

  /**
   * Handles the Lens section.
   */
  function addLens() {
    physical.lens = {};

    const name = qlcPlusPhysical.Lens[0].$.Name;
    if (![``, `Other`, getOflFixturePhysicalProperty(`lens`, `name`)].includes(name)) {
      physical.lens.name = name;
    }

    const degMin = Number.parseFloat(qlcPlusPhysical.Lens[0].$.DegreesMin);
    const degMax = Number.parseFloat(qlcPlusPhysical.Lens[0].$.DegreesMax);
    const degreesMinMax = [degMin, degMax];

    if ((degMin !== 0 || degMax !== 0)
      && (JSON.stringify(getOflFixturePhysicalProperty(`lens`, `degreesMinMax`)) !== JSON.stringify(degreesMinMax))) {
      physical.lens.degreesMinMax = degreesMinMax;
    }
  }

  /**
   * Helper function to get data from the OFL fixture's physical data.
   * @param {string} section The section object property name.
   * @param {string} property The property name in the section,
   * @returns {any} The property data, or undefined.
   */
  function getOflFixturePhysicalProperty(section, property) {
    if (!(section in oflFixturePhysical)) {
      return undefined;
    }

    return oflFixturePhysical[section][property];
  }
}

/**
 * @param {object} qlcPlusMode The QLC+ mode object.
 * @param {object | undefined} oflFixturePhysical The OFL fixture's physical object.
 * @param {string[]} warningsArray This fixture's warnings array in the `out` object.
 * @returns {object} The OFL mode object.
 */
function getOflMode(qlcPlusMode, oflFixturePhysical, warningsArray) {
  const mode = {
    name: qlcPlusMode.$.Name.replaceAll(/\s+mode|mode\s+/gi, ``),
  };

  const match = mode.name.match(/(\d+)(?:\s+|-|)(?:channels?|chan|ch)/i);
  if (match) {
    const [matchedPart, numberOfChannels] = match;
    mode.shortName = mode.name.replace(matchedPart, `${numberOfChannels}ch`);
    mode.name = mode.name.replace(matchedPart, `${numberOfChannels}-channel`);
  }

  if (`Physical` in qlcPlusMode) {
    const physical = getOflPhysical(qlcPlusMode.Physical[0], oflFixturePhysical);

    if (JSON.stringify(physical) !== `{}`) {
      mode.physical = physical;
    }
  }

  mode.channels = [];
  for (const channel of (qlcPlusMode.Channel || [])) {
    mode.channels[Number.parseInt(channel.$.Number, 10)] = channel._;
  }

  addHeadWarnings(qlcPlusMode, mode, warningsArray);

  return mode;
}

/**
 * @param {object} qlcPlusMode The QLC+ mode object.
 * @param {object} mode The corresponding OFL mode object.
 * @param {string[]} warningsArray This fixture's warnings array in the `out` object.
 */
function addHeadWarnings(qlcPlusMode, mode, warningsArray) {
  if (`Head` in qlcPlusMode) {
    for (const [index, head] of qlcPlusMode.Head.entries()) {
      if (head.Channel === undefined) {
        continue;
      }

      const channelList = head.Channel.map(channel => mode.channels[Number.parseInt(channel, 10)]).join(`, `);

      warningsArray.push(`Please add ${mode.name} mode's Head #${index + 1} to the fixture's matrix. The included channels were ${channelList}.`);
    }
  }
}

/**
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @param {string[]} warningsArray This fixture's warnings array in the `out` object.
 */
function mergeFineChannels(fixture, qlcPlusFixture, warningsArray) {
  const fineChannelRegex = /\s*fine\s*|\s*16[\s_-]*bit\s*/i;

  const fineChannels = qlcPlusFixture.Channel.filter(
    channel => (`Group` in channel && channel.Group[0].$.Byte === `1`) || (`Preset` in channel.$ && channel.$.Preset.endsWith(`Fine`)),
  );

  for (const qlcPlusFineChannel of fineChannels) {
    const channelKey = qlcPlusFineChannel.$.Name;

    try {
      const coarseChannelKey = getCoarseChannelKey(qlcPlusFineChannel);
      if (!coarseChannelKey) {
        throw new Error(`The corresponding coarse channel could not be detected.`);
      }

      fixture.availableChannels[coarseChannelKey].fineChannelAliases.push(channelKey);

      const fineChannel = fixture.availableChannels[channelKey];
      if (fineChannel.capabilities.length > 1) {
        throw new Error(`Merge its capabilities into channel '${coarseChannelKey}'.`);
      }

      delete fixture.availableChannels[channelKey];
    }
    catch (error) {
      warningsArray.push(`Please check 16bit channel '${channelKey}': ${error.message}`);
    }
  }


  /**
   * @param {string} qlcPlusFineChannel The key of the fine channel.
   * @returns {string | null} The key of the corresponding coarse channel, or null if it could not be detected.
   */
  function getCoarseChannelKey(qlcPlusFineChannel) {
    const fineChannelKey = qlcPlusFineChannel.$.Name;

    // try deducing coarse channel from fine channel preset
    if (`Preset` in qlcPlusFineChannel.$) {
      const coarseChannelPreset = qlcPlusFineChannel.$.Preset.slice(0, -4);

      const coarseChannels = qlcPlusFixture.Channel.filter(
        coarseChannel => coarseChannel.$.Preset === coarseChannelPreset,
      );
      if (coarseChannels.length === 1) {
        return coarseChannels[0].$.Name;
      }
    }

    // try deducing coarse channel from fine channel group
    if (`Group` in qlcPlusFineChannel) {
      const fineChannelGroupName = qlcPlusFineChannel.Group[0]._;

      const coarseChannels = qlcPlusFixture.Channel.filter(coarseChannel => {
        if (!(`Group` in coarseChannel)) {
          return false;
        }

        const coarseChannelGroupName = coarseChannel.Group[0]._;
        const coarseChannelGroupByte = coarseChannel.Group[0].$.Byte;

        return coarseChannelGroupName === fineChannelGroupName && coarseChannelGroupByte === `0`;
      });

      if (coarseChannels.length === 1) {
        return coarseChannels[0].$.Name;
      }
    }

    // last option: try deducing coarse channel from fine channel name

    if (!fineChannelRegex.test(fineChannelKey)) {
      return null;
    }

    // e.g. "Pan" instead of "Pan Fine"
    const coarseChannelKey = fineChannelKey.replace(fineChannelRegex, ``);

    return Object.keys(fixture.availableChannels).find(
      key => key === coarseChannelKey || key.replace(fineChannelKey, ``).match(/^(?:\s+|\s+coarse)$/i),
    );
  }
}

/**
 * Add switchChannels from capability Aliases to channels' capabilities and
 * update the channel keys in modes.
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusFixture The QCL+ fixture object.
 */
function addSwitchingChannels(fixture, qlcPlusFixture) {
  for (const qlcPlusChannel of qlcPlusFixture.Channel) {
    if (!hasAliases(qlcPlusChannel)) {
      continue;
    }

    const switchChannels = [];
    for (const [index, capability] of qlcPlusChannel.Capability.entries()) {
      for (const alias of (capability.Alias || [])) {
        const switchChannel = switchChannels.find(channel => channel.default === alias.$.Channel && channel.modes.includes(alias.$.Mode));
        if (switchChannel) {
          switchChannel.switchTo[index] = alias.$.With;
        }
        else {
          switchChannels.push({
            default: alias.$.Channel,
            modes: [alias.$.Mode],
            switchTo: {
              [index]: alias.$.With,
            },
          });
        }
      }
    }

    mergeSimilarSwitchChannels(switchChannels);
    replaceSwitchingChannelsInModes(switchChannels, fixture.modes);
    addSwitchChannelsToCapabilities(switchChannels, fixture.availableChannels[qlcPlusChannel.$.Name]);
  }
}

/**
 * @param {object} qlcPlusChannel The QLC+ channel object to check.
 * @returns {boolean} True if there is at least one capability with an Alias attribute, false otherwise.
 */
function hasAliases(qlcPlusChannel) {
  return (qlcPlusChannel.Capability || []).some(capability => capability.$.Preset === `Alias`);
}

/**
 * @param {object[]} switchChannels The array of switch channels.
 */
function mergeSimilarSwitchChannels(switchChannels) {
  for (const [switchChannelIndex, switchChannel] of switchChannels.entries()) {
    const switchToEntries = Object.entries(switchChannel.switchTo);

    for (let index = switchChannelIndex + 1; index < switchChannels.length; index++) {
      const otherSwitchChannel = switchChannels[index];

      if (otherSwitchChannel.default !== switchChannel.default) {
        continue;
      }

      const otherSwitchTo = otherSwitchChannel.switchTo;
      const switchToSame = switchToEntries.length === Object.keys(otherSwitchTo).length && switchToEntries.every(
        ([capabilityIndex, switchToChannel]) => otherSwitchTo[capabilityIndex] === switchToChannel,
      );

      if (!switchToSame) {
        continue;
      }

      switchChannel.modes.push(...otherSwitchChannel.modes);
      switchChannels.splice(index, 1);
      index--;
    }

    const alternatives = new Set([switchChannel.default, ...Object.values(switchChannel.switchTo)]);
    switchChannel.key = [...alternatives].join(` / `);
  }
}

/**
 * Replaces references to all switch channels' default channels with the switch
 * channel itself. If multiple switch channels have the same key, appends the
 * mode names to make them unique.
 * @param {object[]} switchChannels The array of switch channels.
 * @param {object[]} oflModes The array of OFL modes.
 */
function replaceSwitchingChannelsInModes(switchChannels, oflModes) {
  for (const switchChannel of switchChannels) {
    const swChannelsWithSameKey = switchChannels.filter(channel => channel.key === switchChannel.key);

    if (swChannelsWithSameKey.length > 1) {
      for (const channel of swChannelsWithSameKey) {
        const channelModes = channel.modes.join(`, `);
        channel.key += ` (${channelModes})`;
      }
    }

    const usingModes = oflModes.filter(mode => switchChannel.modes.includes(mode.name));
    for (const mode of usingModes) {
      const index = mode.channels.indexOf(switchChannel.default);

      mode.channels[index] = switchChannel.key;
    }
  }
}

/**
 * @param {object[]} switchChannels The array of switch channels.
 * @param {object} oflTriggerChannel The OFL trigger channel.
 */
function addSwitchChannelsToCapabilities(switchChannels, oflTriggerChannel) {
  for (const [index, capability] of oflTriggerChannel.capabilities.entries()) {
    capability.switchChannels = Object.fromEntries(switchChannels.map(
      switchChannel => [switchChannel.key, switchChannel.switchTo[index] || switchChannel.default],
    ));
  }
}

/**
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusFixture The QCL+ fixture object.
 */
function cleanUpFixture(fixture, qlcPlusFixture) {
  // delete empty fineChannelAliases arrays and unnecessary dmxValueResolution properties
  for (const channelKey of Object.keys(fixture.availableChannels)) {
    const channel = fixture.availableChannels[channelKey];

    if (channel.capabilities.length === 1) {
      channel.capability = channel.capabilities[0];
      delete channel.capabilities;
      delete channel.capability.dmxRange;

      if (!(`defaultValue` in channel) || channel.defaultValue === 0) {
        delete channel.dmxValueResolution;
      }
    }

    if (channel.fineChannelAliases.length === 0) {
      delete channel.fineChannelAliases;
      delete channel.dmxValueResolution;
    }
  }

  const fixtureUsesHeads = qlcPlusFixture.Mode.some(mode => `Head` in mode);
  if (!fixtureUsesHeads) {
    delete fixture.matrix;
    delete fixture.templateChannels;
  }
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
