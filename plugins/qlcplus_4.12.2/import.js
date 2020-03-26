const xml2js = require(`xml2js`);
const promisify = require(`util`).promisify;

const oflManufacturers = require(`../../fixtures/manufacturers.json`);
const qlcplusGoboAliases = require(`../../resources/gobos/aliases/qlcplus.json`);

const {
  getCapabilityFromChannelPreset,
  getCapabilityFromCapabilityPreset,
  capabilityPresets,
  importHelpers
} = require(`./presets.js`);

module.exports.version = `1.0.0`;

/**
 * @param {Buffer} buffer The imported file.
 * @param {String} filename The imported file's name.
 * @param {String} authorName The importer's name.
 * @returns {Promise.<Object, Error>} A Promise resolving to an out object
 */
module.exports.import = async function importQlcPlus(buffer, filename, authorName) {
  const parser = new xml2js.Parser();
  const timestamp = new Date().toISOString().replace(/T.*/, ``);

  const warnings = [];

  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`
  };

  const xml = await promisify(parser.parseString)(buffer.toString());

  const qlcPlusFixture = xml.FixtureDefinition;
  fixture.name = qlcPlusFixture.Model[0];

  const manKey = slugify(qlcPlusFixture.Manufacturer[0]);
  const fixKey = `${manKey}/${slugify(fixture.name)}`;

  const manufacturers = {};
  if (!(manKey in oflManufacturers)) {
    manufacturers[manKey] = {
      name: qlcPlusFixture.Manufacturer[0]
    };
    warnings.push(`Please check if manufacturer is correct and add manufacturer URL.`);
  }

  fixture.categories = getOflCategories(qlcPlusFixture);

  const authors = qlcPlusFixture.Creator[0].Author[0].split(/,\s*/);
  if (!authors.includes(authorName)) {
    authors.push(authorName);
  }

  fixture.meta = {
    authors: authors,
    createDate: timestamp,
    lastModifyDate: timestamp,
    importPlugin: {
      plugin: `qlcplus_4.12.1`,
      date: timestamp,
      comment: `created by ${qlcPlusFixture.Creator[0].Name[0]} (version ${qlcPlusFixture.Creator[0].Version[0]})`
    }
  };

  if (!(`Mode` in qlcPlusFixture)) {
    qlcPlusFixture.Mode = [];
  }
  if (!(`Channel` in qlcPlusFixture)) {
    qlcPlusFixture.Channel = [];
  }

  addOflFixturePhysical(fixture, qlcPlusFixture);

  fixture.matrix = getOflMatrix(qlcPlusFixture);
  fixture.wheels = getOflWheels(qlcPlusFixture);
  fixture.availableChannels = {};
  fixture.templateChannels = {};

  qlcPlusFixture.Channel.forEach(channel => addOflChannel(fixture, channel, qlcPlusFixture));

  mergeFineChannels(fixture, qlcPlusFixture, warnings);

  fixture.modes = qlcPlusFixture.Mode.map(mode => getOflMode(mode, fixture.physical, warnings));

  addSwitchingChannels(fixture, qlcPlusFixture);

  cleanUpFixture(fixture, qlcPlusFixture);

  return {
    manufacturers,
    fixtures: {
      [fixKey]: fixture
    },
    warnings: {
      [fixKey]: warnings
    }
  };
};

/**
 * @param {Object} qlcPlusFixture The QLC+ fixture object.
 * @returns {Array.<String>} The OFL fixture categories.
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
 * @param {Object} fixture The OFL fixture object.
 * @param {Object} qlcPlusFixture The QLC+ fixture object.
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
        spacing: [0, 0, 0]
      };
    }
  }
}

/**
 * @param {Object} qlcPlusFixture The QLC+ fixture object.
 * @returns {Object} The OFL matrix object (may be empty).
 */
function getOflMatrix(qlcPlusFixture) {
  const matrix = {};

  const physicalLayouts = qlcPlusFixture.Mode.concat(qlcPlusFixture)
    .filter(obj => `Physical` in obj && `Layout` in obj.Physical[0])
    .map(obj => obj.Physical[0].Layout[0]);

  if (physicalLayouts) {
    const maxWidth = Math.max(...physicalLayouts.map(layout => parseInt(layout.$.Width)));
    const maxHeight = Math.max(...physicalLayouts.map(layout => parseInt(layout.$.Height)));

    matrix.pixelCount = [maxWidth, maxHeight, 1];
  }

  return matrix;
}

const slotTypeFunctions = {
  Open: {
    isSlotType: (cap, chGroup, capPreset) => cap._ === `Open` || cap.$.Res1 === `Others/open.svg` || cap.$.Res === `Others/open.svg`,
    addSlotProperties: (cap, slot) => {}
  },
  Gobo: {
    isSlotType: (cap, chGroup, capPreset) => (capPreset ? capPreset === `GoboMacro` : chGroup === `Gobo`),
    addSlotProperties: (cap, slot) => {
      const goboRes = cap.$.Res1 || cap.$.Res || null;
      let useResourceName = false;

      if (goboRes) {
        const goboKey = qlcplusGoboAliases[goboRes];

        if (goboKey) {
          slot.resource = `gobos/${goboKey}`;

          const resource = require(`../../resources/gobos/${goboKey}.json`);

          if (resource.name === cap._) {
            useResourceName = true;
          }
        }
        else {
          slot.resource = `gobos/aliases/qlcplus/${goboRes}`;
        }
      }

      if (!useResourceName) {
        slot.name = cap._;
      }
    }
  },
  Color: {
    isSlotType: (cap, chGroup, capPreset) => (capPreset ? [`ColorMacro`, `ColorDoubleMacro`].includes(capPreset) : chGroup === `Colour`),
    addSlotProperties: (cap, slot) => {
      slot.name = cap._;

      const colors = [`Color`, `Color2`, `Res1`, `Res2`]
        .filter(attr => attr in cap.$)
        .map(attr => cap.$[attr]);

      if (colors.length > 0) {
        slot.colors = colors;
      }
    }
  },
  Prism: {
    isSlotType: (cap, chGroup, capPreset) => (capPreset ? capPreset === `PrismEffectOn` : chGroup === `Prism`),
    addSlotProperties: (cap, slot) => {
      slot.name = cap._;

      if (`Res1` in cap.$) {
        slot.facets = parseInt(cap.$.Res1);
      }
    }
  },

  // default (has to be the last element!)
  Unknown: {
    isSlotType: (cap, chGroup, capPreset) => true,
    addSlotProperties: (cap, slot) => {
      slot.name = cap._;
    }
  }
};

/**
 * Try to extract (guessed) wheels from all channels / capabilities.
 * @param {Object} qlcPlusFixture The QLC+ fixture object.
 * @returns {Object|undefined} The OFL wheels object or undefined if there are no wheels.
 */
function getOflWheels(qlcPlusFixture) {
  const wheels = {};

  qlcPlusFixture.Channel.forEach(channel => {
    const channelName = channel.$.Name;

    const hasGoboPresetCap = (channel.Capability || []).some(
      cap => [`GoboMacro`, `GoboShakeMacro`].includes(cap.$.Preset)
    );

    const isWheelChannel = /wheel\b/i.test(channelName) || hasGoboPresetCap;
    const isRotationChannel = /(rotation|index)/i.test(channelName) || (`Group` in channel && channel.Group[0]._ === `Speed`);

    if (isWheelChannel && !isRotationChannel) {
      wheels[channelName] = {
        slots: getSlots(channel)
      };
    }
  });

  return Object.keys(wheels).length > 0 ? wheels : undefined;


  /**
   * @param {Object} qlcPlusChannel The QLC+ channel object.
   * @returns {Array.<Object>} An array of OFL slot objects.
   */
  function getSlots(qlcPlusChannel) {
    const slots = [];

    (qlcPlusChannel.Capability || []).forEach(capability => {
      if (/\bC?CW\b|rainbow|stop|(?:counter|anti)?[ -]?clockwise|rotat|spin/i.test(capability._)) {
        // skip rotation capabilities
        return;
      }

      const capabilityPreset = capability.$.Preset || ``;

      if (/^(GoboShakeMacro|ColorWheelIndex)$|^Rotation/.test(capabilityPreset)) {
        return;
      }

      const foundSlotType = Object.keys(slotTypeFunctions).find(
        slotType => slotTypeFunctions[slotType].isSlotType(capability, qlcPlusChannel.Group[0]._, capabilityPreset)
      );

      const slot = {
        type: foundSlotType
      };

      slotTypeFunctions[foundSlotType].addSlotProperties(capability, slot);

      slots.push(slot);
    });

    return slots;
  }
}


const parserPerChannelType = {
  Nothing: () => ({
    type: `NoFunction`
  }),
  Intensity: ({ qlcPlusChannel, capabilityName }) => {
    const cap = {};

    if (`Colour` in qlcPlusChannel && qlcPlusChannel.Colour[0] !== `Generic`) {
      cap.type = `ColorIntensity`;
      cap.color = qlcPlusChannel.Colour[0];
    }
    else {
      cap.type = `Intensity`;
    }

    if (!capabilityName.match(/^(?:intensity|dimmer)$/i)) {
      cap.comment = capabilityName;
    }

    return cap;
  },
  Colour: ({ channelName, qlcPlusCapability, capabilityName, index }) => {
    const cap = {};

    if (channelName.match(/wheel\b/i)) {
      cap.type = `WheelSlot`;
      cap.slotNumber = index + 1;

      cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap, true);

      if (`speedStart` in cap) {
        cap.type = `WheelRotation`;
        delete cap.slotNumber;
      }

      return cap;
    }

    cap.type = `ColorPreset`;
    cap.comment = capabilityName;

    if (`Color` in qlcPlusCapability.$) {
      cap.colors = [qlcPlusCapability.$.Color];

      if (`Color2` in qlcPlusCapability.$) {
        cap.colors.push(qlcPlusCapability.$.Color2);
      }
    }

    return cap;
  },
  Gobo: ({ capabilityName, channelNameInWheels, index }) => {
    if (/shake\b|shaking\b/i.test(capabilityName)) {
      return capabilityPresets.GoboShakeMacro.importCapability({ capabilityName, index });
    }

    const cap = {
      type: `WheelSlot`,
      slotNumber: index + 1
    };

    cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap, true);

    if (`speedStart` in cap) {
      cap.type = channelNameInWheels ? `WheelRotation` : `WheelSlotRotation`;
      delete cap.slotNumber;
    }

    return cap;
  },
  Effect: ({ capabilityName }) => {
    const cap = {
      type: `Effect`,
      effectName: `` // set it first here so effectName is before speedStart/speedEnd
    };
    cap.effectName = importHelpers.getSpeedGuessedComment(capabilityName, cap, false);

    if (/\bsound\b/i.test(cap.effectName)) {
      cap.soundControlled = true;
    }

    return cap;
  },
  Maintenance: ({ capabilityName }) => ({
    type: `Maintenance`,
    comment: capabilityName
  }),
  Pan: ({ channelName, capabilityName, panMax }) => {
    if (channelName.match(/continuous/i)) {
      const cap = {
        type: `PanContinuous`
      };
      cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap, true);
      return cap;
    }

    return Object.assign(importHelpers.getPanTiltCap(`Pan`, panMax), {
      comment: capabilityName
    });
  },
  Tilt: ({ channelName, capabilityName, tiltMax }) => {
    if (channelName.match(/continuous/i)) {
      const cap = {
        type: `TiltContinuous`
      };
      cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap, true);
      return cap;
    }

    return Object.assign(importHelpers.getPanTiltCap(`Tilt`, tiltMax), {
      comment: capabilityName
    });
  },
  Prism: ({ capabilityName }) => ({
    type: `Prism`,
    comment: capabilityName
  }),
  Shutter: ({ capabilityName }) => {
    const cap = {
      type: `ShutterStrobe`
    };

    if (capabilityName.match(/^(?:Blackout|(?:Shutter |Strobe )?Closed?)$/i)) {
      cap.shutterEffect = `Closed`;
      return cap;
    }

    if (capabilityName.match(/^(?:(?:Shutter |Strobe )?Open|Full?)$/i)) {
      cap.shutterEffect = `Open`;
      return cap;
    }

    if (capabilityName.match(/puls/i)) {
      cap.shutterEffect = `Pulse`;
    }
    else if (capabilityName.match(/ramp\s*up/i)) {
      cap.shutterEffect = `RampUp`;
    }
    else if (capabilityName.match(/ramp\s*down/i)) {
      cap.shutterEffect = `RampDown`;
    }
    else {
      cap.shutterEffect = `Strobe`;
    }

    if (capabilityName.match(/random/i)) {
      cap.randomTiming = true;
    }

    cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap, false);

    return cap;
  },
  Speed: ({ channelName, capabilityName }) => {
    const cap = {};

    if (channelName.match(/pan(?:\/)?tilt/i)) {
      cap.type = `PanTiltSpeed`;
    }
    else {
      cap.type = `Speed`;
    }

    cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap, false);

    return cap;
  }
};

/**
 * Adds a QLC+ channel to the OFL fixture's availableChannels object.
 * @param {Object} fixture The OFL fixture object.
 * @param {Object} qlcPlusChannel The QLC+ channel object.
 * @param {Object} qlcPlusFixture The QLC+ fixture object.
 */
function addOflChannel(fixture, qlcPlusChannel, qlcPlusFixture) {
  const channel = {
    fineChannelAliases: [],
    dmxValueResolution: `8bit`,
    defaultValue: parseInt(qlcPlusChannel.$.Default) || 0
  };

  const physicals = qlcPlusFixture.Mode.concat(qlcPlusFixture)
    .filter(obj => `Physical` in obj)
    .map(obj => obj.Physical[0]);

  const [panMax, tiltMax] = [`PanMax`, `TiltMax`].map(
    prop => Math.max(...physicals.map(physical => {
      if (physical.Focus && prop in physical.Focus[0].$) {
        return parseInt(physical.Focus[0].$[prop]) || 0;
      }
      return 0;
    }))
  );

  const channelName = qlcPlusChannel.$.Name;
  const channelPreset = qlcPlusChannel.$.Preset;

  if (channelPreset) {
    channel.capabilities = [getCapabilityFromChannelPreset(channelPreset, channelName, panMax, tiltMax)];
  }
  else if (`Capability` in qlcPlusChannel) {
    channel.capabilities = qlcPlusChannel.Capability.map(
      cap => getOflCapability(cap)
    );
  }
  else {
    channel.capabilities = [getOflCapability({
      _: `0-100%`,
      $: {
        Min: `0`,
        Max: `255`
      }
    })];
  }

  fixture.availableChannels[channelName] = channel;


  /**
   * @param {Object} qlcPlusCapability The QLC+ capability object.
   * @returns {Object} The OFL capability object.
   */
  function getOflCapability(qlcPlusCapability) {
    const cap = {
      dmxRange: [parseInt(qlcPlusCapability.$.Min), parseInt(qlcPlusCapability.$.Max)],
      type: ``
    };

    const trimmedChannelName = qlcPlusChannel.$.Name.trim();
    const channelType = qlcPlusChannel.Group[0]._;
    const capabilityName = (qlcPlusCapability._ || ``).trim();

    const capData = {
      qlcPlusChannel,
      channelName: trimmedChannelName,
      channelType,
      channelNameInWheels: trimmedChannelName in (fixture.wheels || {}),
      qlcPlusCapability,
      capabilityName,
      index: qlcPlusChannel.Capability.indexOf(qlcPlusCapability),
      res1: qlcPlusCapability.$.Res1,
      res2: qlcPlusCapability.$.Res2,
      panMax,
      tiltMax
    };

    const capPreset = qlcPlusCapability.$.Preset;

    if (capPreset && capPreset !== `Alias`) {
      Object.assign(cap, getCapabilityFromCapabilityPreset(capPreset, capData));
    }
    else if (/^(?:nothing|no func(?:tion)?|unused|not used|empty|no strobe|no prism|no frost)$/i.test(capabilityName)) {
      cap.type = `NoFunction`;
    }
    else if (channelType in parserPerChannelType) {
      // try to parse capability based on channel type
      Object.assign(cap, parserPerChannelType[channelType](capData));
    }
    else {
      cap.type = `Generic`,
      cap.comment = capabilityName;
    }

    deleteCommentIfUnnecessary();

    return cap;


    /**
     * Deletes the capability's comment if it adds no valuable information.
     */
    function deleteCommentIfUnnecessary() {
      if (!(`comment` in cap)) {
        return;
      }

      const zeroToHundredRegex = /^0%?\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*100%$/i;

      if (cap.comment === trimmedChannelName || cap.comment.length === 0 || zeroToHundredRegex.test(cap.comment)) {
        delete cap.comment;
      }
    }
  }
}

/**
 * @param {Object} qlcPlusPhysical The QLC+ mode's physical object.
 * @param {Object|undefined} [oflFixPhysical={}] The OFL fixture's physical object.
 * @returns {Object} The OFL mode's physical object.
 */
function getOflPhysical(qlcPlusPhysical, oflFixPhysical = {}) {
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

    const width = parseFloat(qlcPlusPhysical.Dimensions[0].$.Width);
    const height = parseFloat(qlcPlusPhysical.Dimensions[0].$.Height);
    const depth = parseFloat(qlcPlusPhysical.Dimensions[0].$.Depth);
    const weight = parseFloat(qlcPlusPhysical.Dimensions[0].$.Weight);

    const dimensionsArray = [width, height, depth];

    if (width + height + depth !== 0 && JSON.stringify(dimensionsArray) !== JSON.stringify(oflFixPhysical.dimensions)) {
      physical.dimensions = dimensionsArray;
    }

    if (weight !== 0.0 && oflFixPhysical.weight !== weight) {
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

    const power = parseFloat(qlcPlusPhysical.Technical[0].$.PowerConsumption);
    if (power !== 0 && oflFixPhysical.power !== power) {
      physical.power = power;
    }

    let DMXconnector = qlcPlusPhysical.Technical[0].$.DmxConnector;

    // remove whitespace
    if (DMXconnector === `3.5 mm stereo jack`) {
      DMXconnector = `3.5mm stereo jack`;
    }

    if (![``, `Other`, oflFixPhysical.DMXconnector].includes(DMXconnector)) {
      physical.DMXconnector = DMXconnector;
    }
  }

  /**
   * Handles the Bulb section.
   */
  function addBulb() {
    physical.bulb = {};

    const type = qlcPlusPhysical.Bulb[0].$.Type;
    if (![``, `Other`, getOflFixPhysicalProperty(`bulb`, `type`)].includes(type)) {
      physical.bulb.type = type;
    }

    const colorTemp = parseFloat(qlcPlusPhysical.Bulb[0].$.ColourTemperature);
    if (colorTemp && getOflFixPhysicalProperty(`bulb`, `colorTemperature`) !== colorTemp) {
      physical.bulb.colorTemperature = colorTemp;
    }

    const lumens = parseFloat(qlcPlusPhysical.Bulb[0].$.Lumens);
    if (lumens && getOflFixPhysicalProperty(`bulb`, `lumens`) !== lumens) {
      physical.bulb.lumens = lumens;
    }
  }

  /**
   * Handles the Lens section.
   */
  function addLens() {
    physical.lens = {};

    const name = qlcPlusPhysical.Lens[0].$.Name;
    if (![``, `Other`, getOflFixPhysicalProperty(`lens`, `name`)].includes(name)) {
      physical.lens.name = name;
    }

    const degMin = parseFloat(qlcPlusPhysical.Lens[0].$.DegreesMin);
    const degMax = parseFloat(qlcPlusPhysical.Lens[0].$.DegreesMax);
    const degreesMinMax = [degMin, degMax];

    if ((degMin !== 0.0 || degMax !== 0.0)
      && (JSON.stringify(getOflFixPhysicalProperty(`lens`, `degreesMinMax`)) !== JSON.stringify(degreesMinMax))) {
      physical.lens.degreesMinMax = degreesMinMax;
    }
  }

  /**
   * Helper function to get data from the OFL fixture's physical data.
   * @param {String} section The section object property name.
   * @param {String} property The property name in the section,
   * @returns {*} The property data, or undefined.
   */
  function getOflFixPhysicalProperty(section, property) {
    if (!(section in oflFixPhysical)) {
      return undefined;
    }

    return oflFixPhysical[section][property];
  }
}

/**
 * @param {Object} qlcPlusMode The QLC+ mode object.
 * @param {Object|undefined} oflFixPhysical The OFL fixture's physical object.
 * @param {Array.<String>} warningsArray This fixture's warnings array in the `out` object.
 * @returns {Object} The OFL mode object.
 */
function getOflMode(qlcPlusMode, oflFixPhysical, warningsArray) {
  const mode = {
    name: qlcPlusMode.$.Name.replace(/\s+(mode)|(mode)\s+/ig, ``)
  };

  const match = mode.name.match(/(\d+)(?:\s+|-)?(?:channels?|chan|ch)/i);
  if (match) {
    const [matchedPart, numberOfChannels] = match;
    mode.shortName = mode.name.replace(matchedPart, `${numberOfChannels}ch`);
    mode.name = mode.name.replace(matchedPart, `${numberOfChannels}-channel`);
  }

  if (`Physical` in qlcPlusMode) {
    const physical = getOflPhysical(qlcPlusMode.Physical[0], oflFixPhysical);

    if (JSON.stringify(physical) !== `{}`) {
      mode.physical = physical;
    }
  }

  mode.channels = [];
  for (const ch of (qlcPlusMode.Channel || [])) {
    mode.channels[parseInt(ch.$.Number)] = ch._;
  }

  if (`Head` in qlcPlusMode) {
    qlcPlusMode.Head.forEach((head, index) => {
      if (head.Channel === undefined) {
        return;
      }

      const channelList = head.Channel.map(ch => mode.channels[parseInt(ch)]).join(`, `);

      warningsArray.push(`Please add ${mode.name} mode's Head #${index + 1} to the fixture's matrix. The included channels were ${channelList}.`);
    });
  }

  return mode;
}

/**
 * @param {Object} fixture The OFL fixture object.
 * @param {Object} qlcPlusFixture The QLC+ fixture object.
 * @param {Array.<String>} warningsArray This fixture's warnings array in the `out` object.
 */
function mergeFineChannels(fixture, qlcPlusFixture, warningsArray) {
  const fineChannelRegex = /\s*fine\s*|\s*16[-_\s]*bit\s*/i;

  const fineChannels = qlcPlusFixture.Channel.filter(
    channel => (`Group` in channel && channel.Group[0].$.Byte === `1`) || (`Preset` in channel.$ && channel.$.Preset.endsWith(`Fine`))
  );

  for (const qlcPlusFineChannel of fineChannels) {
    const chKey = qlcPlusFineChannel.$.Name;

    try {
      const coarseChannelKey = getCoarseChannelKey(qlcPlusFineChannel);
      if (!coarseChannelKey) {
        throw new Error(`The corresponding coarse channel could not be detected.`);
      }

      fixture.availableChannels[coarseChannelKey].fineChannelAliases.push(chKey);

      const fineChannel = fixture.availableChannels[chKey];
      if (fineChannel.capabilities.length > 1) {
        throw new Error(`Merge its capabilities into channel '${coarseChannelKey}'.`);
      }

      delete fixture.availableChannels[chKey];
    }
    catch (error) {
      warningsArray.push(`Please check 16bit channel '${chKey}': ${error.message}`);
    }
  }


  /**
   * @param {String} qlcPlusFineChannel The key of the fine channel.
   * @returns {String|null} The key of the corresponding coarse channel, or null if it could not be detected.
   */
  function getCoarseChannelKey(qlcPlusFineChannel) {
    const fineChannelKey = qlcPlusFineChannel.$.Name;

    // try deducing coarse channel from fine channel preset
    if (`Preset` in qlcPlusFineChannel.$) {
      const coarseChannelPreset = qlcPlusFineChannel.$.Preset.slice(0, -4);

      const coarseChannels = qlcPlusFixture.Channel.filter(
        coarseChannel => coarseChannel.$.Preset === coarseChannelPreset
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
        const coarseChannelGroupByte = parseInt(coarseChannel.Group[0].$.Byte);

        return coarseChannelGroupName === fineChannelGroupName && coarseChannelGroupByte === 0;
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
      key => key === coarseChannelKey || key.replace(fineChannelKey, ``).match(/^(?:\s+|\s+coarse)$/i)
    );
  }
}

/**
 * Add switchChannels from capability Aliases to channels' capabilities and
 * update the channel keys in modes.
 * @param {Object} fixture The OFL fixture object.
 * @param {Object} qlcPlusFixture The QCL+ fixture object.
 */
function addSwitchingChannels(fixture, qlcPlusFixture) {
  qlcPlusFixture.Channel.forEach(qlcPlusChannel => {
    const hasAliases = (qlcPlusChannel.Capability || []).some(cap => cap.$.Preset === `Alias`);
    if (!hasAliases) {
      return;
    }

    const switchChannels = [];
    qlcPlusChannel.Capability.forEach((cap, index) => {
      (cap.Alias || []).forEach(alias => {
        const switchChannel = switchChannels.find(ch => ch.default === alias.$.Channel && ch.modes.includes(alias.$.Mode));
        if (switchChannel) {
          switchChannel.switchTo[index] = alias.$.With;
        }
        else {
          switchChannels.push({
            default: alias.$.Channel,
            modes: [alias.$.Mode],
            switchTo: {
              [index]: alias.$.With
            }
          });
        }
      });
    });

    // try to merge similar switchChannels
    switchChannels.forEach((switchChannel, index) => {
      const switchToEntries = Object.entries(switchChannel.switchTo);

      for (let i = index + 1; i < switchChannels.length; i++) {
        const otherSwitchChannel = switchChannels[i];

        if (otherSwitchChannel.default !== switchChannel.default) {
          continue;
        }

        const otherSwitchTo = otherSwitchChannel.switchTo;
        const switchToSame = switchToEntries.length === Object.keys(otherSwitchTo).length && switchToEntries.every(
          ([capIndex, switchToChannel]) => otherSwitchTo[capIndex] === switchToChannel
        );

        if (!switchToSame) {
          continue;
        }

        switchChannel.modes.push(...otherSwitchChannel.modes);
        switchChannels.splice(i, 1);
        i--;
      }

      const alternatives = new Set([switchChannel.default, ...Object.values(switchChannel.switchTo)]);
      switchChannel.key = Array.from(alternatives).join(` / `);
    });

    // append mode names to switching channel keys if necessary, update switching channels in modes
    switchChannels.forEach(switchChannel => {
      const swChannelsWithSameKey = switchChannels.filter(ch => ch.key === switchChannel.key);

      if (swChannelsWithSameKey.length > 1) {
        swChannelsWithSameKey.forEach(ch => {
          ch.key += ` (${ch.modes.join(`, `)})`;
        });
      }

      const usingModes = fixture.modes.filter(mode => switchChannel.modes.includes(mode.name));
      usingModes.forEach(mode => {
        const index = mode.channels.indexOf(switchChannel.default);

        mode.channels[index] = switchChannel.key;
      });
    });

    // add switchChannels to capabilities
    fixture.availableChannels[qlcPlusChannel.$.Name].capabilities.forEach((cap, index) => {
      cap.switchChannels = {};

      switchChannels.forEach(switchChannel => {
        cap.switchChannels[switchChannel.key] = switchChannel.switchTo[index] || switchChannel.default;
      });
    });
  });
}

/**
 * @param {Object} fixture The OFL fixture object.
 * @param {Object} qlcPlusFixture The QCL+ fixture object.
 */
function cleanUpFixture(fixture, qlcPlusFixture) {
  // delete empty fineChannelAliases arrays and unnecessary dmxValueResolution properties
  for (const chKey of Object.keys(fixture.availableChannels)) {
    const channel = fixture.availableChannels[chKey];

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
 * @param {String} str The string to slugify.
 * @returns {String} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
