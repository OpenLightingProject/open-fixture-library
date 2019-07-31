const xml2js = require(`xml2js`);
const promisify = require(`util`).promisify;

const {
  getCapabilityFromChannelPreset,
  getCapabilityFromCapabilityPreset,
  capabilityPresets,
  importHelpers
} = require(`./presets.js`);

module.exports.version = `0.5.0`;

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise.<object, Error>} A Promise resolving to an out object
**/
module.exports.import = async function importQlcPlus(buffer, filename, authorName) {
  const parser = new xml2js.Parser();
  const timestamp = new Date().toISOString().replace(/T.*/, ``);

  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {}
  };
  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`
  };

  const xml = await promisify(parser.parseString)(buffer.toString());

  const qlcPlusFixture = xml.FixtureDefinition;
  fixture.name = qlcPlusFixture.Model[0];

  const manKey = slugify(qlcPlusFixture.Manufacturer[0]);
  const fixKey = `${manKey}/${slugify(fixture.name)}`;
  out.warnings[fixKey] = [`Please check if manufacturer is correct.`];

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

  mergeFineChannels(fixture, qlcPlusFixture, out.warnings[fixKey]);

  fixture.modes = qlcPlusFixture.Mode.map(mode => getOflMode(mode, fixture.physical, out.warnings[fixKey]));

  cleanUpFixture(fixture, qlcPlusFixture);

  out.fixtures[fixKey] = fixture;

  return out;
};

/**
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @returns {array.<string>} The OFL fixture categories.
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
  const hasGlobalPhysical = `Physical` in qlcPlusFixture;

  if (!hasGlobalPhysical && (allModesHavePhysical || !firstPhysicalMode)) {
    return;
  }

  fixture.physical = getOflPhysical(hasGlobalPhysical ? qlcPlusFixture.Physical[0] : firstPhysicalMode.Physical[0]);

  if (qlcPlusFixture.Type[0] === `LED Bar (Pixels)`) {
    fixture.physical.matrixPixels = {
      spacing: [0, 0, 0]
    };
  }
}

/**
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @returns {object} The OFL matrix object (may be empty).
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
    isSlotType: (cap, chGroup, capPreset) => cap._ === `Open`,
    addSlotProperties: (cap, slot) => {}
  },
  Gobo: {
    isSlotType: (cap, chGroup, capPreset) => (capPreset ? capPreset === `GoboMacro` : chGroup === `Gobo`),
    addSlotProperties: (cap, slot) => {
      slot.name = cap._;
    }
  },
  Color: {
    isSlotType: (cap, chGroup, capPreset) => (capPreset ? [`ColourMacro`, `ColourDoubleMacro`].includes(capPreset) : chGroup === `Colour`),
    addSlotProperties: (cap, slot) => {
      slot.name = cap._;

      const colors = [`Color`, `Color2`, `Res1`, `Res2`]
        .filter(attr => attr in cap.$)
        .map(attr => cap.$[attr]);

      if (colors.length) {
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
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @returns {object|undefined} The OFL wheels object or undefined if there are no wheels.
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
   * @param {object} qlcPlusChannel The QLC+ channel object.
   * @returns {array.<object>} An array of OFL slot objects.
   */
  function getSlots(qlcPlusChannel) {
    const slots = [];

    (qlcPlusChannel.Capability || []).forEach(capability => {
      if (/\b(CW|CCW|rainbow|stop|clockwise|counterclockwise)\b/.test(capability._)) {
        // skip rotation capabilities
        return;
      }

      const capabilityPreset = capability.$.Preset;

      if (capabilityPreset === `GoboShakeMacro`) {
        return;
      }

      const slotType = Object.keys(slotTypeFunctions).find(
        slotType => slotTypeFunctions[slotType].isSlotType(capability, qlcPlusChannel.Group[0]._, capabilityPreset)
      );

      const slot = {
        type: slotType
      };

      slotTypeFunctions[slotType].addSlotProperties(capability, slot);

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

      cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);

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

    cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);

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
    cap.effectName = importHelpers.getSpeedGuessedComment(capabilityName, cap);

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
      cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);
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
      cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);
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

    cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);

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

    cap.comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);

    return cap;
  }
};

/**
 * Deletes the capability's comment if it adds no valuable information.
 * @param {object} cap The OFL capability object.
 * @param {string} channelName The name of the channel this capability belongs to.
 */
function deleteCommentIfUnnecessary(cap, channelName) {
  if (!(`comment` in cap)) {
    return;
  }

  const zeroToHundredRegex = /^0%?\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*100%$/i;

  if (cap.comment === channelName || !cap.comment.length || zeroToHundredRegex.test(cap.comment)) {
    delete cap.comment;
  }
}

/**
 * Adds a QLC+ channel to the OFL fixture's availableChannels object.
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusChannel The QLC+ channel object.
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 */
function addOflChannel(fixture, qlcPlusChannel, qlcPlusFixture) {
  const channel = {
    fineChannelAliases: [],
    dmxValueResolution: `8bit`
  };

  if (`Default` in qlcPlusChannel.$) {
    channel.defaultValue = parseInt(qlcPlusChannel.$.Default);
  }

  const physicalObjects = qlcPlusFixture.Mode.concat(qlcPlusFixture);
  const [panMax, tiltMax] = [`PanMax`, `TiltMax`].map(
    prop => Math.max(...physicalObjects.map(obj => {
      if (obj.Physical && obj.Physical[0].Focus && obj.Physical[0].Focus[0].$[prop]) {
        return parseInt(obj.Physical[0].Focus[0].$[prop]) || 0;
      }
      return 0;
    }))
  );

  const channelName = qlcPlusChannel.$.Name;
  const preset = qlcPlusChannel.$.Preset;

  if (preset) {
    channel.capabilities = [getCapabilityFromChannelPreset(preset, channelName, panMax, tiltMax)];
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
   * @param {object} qlcPlusCapability The QLC+ capability object.
   * @returns {object} The OFL capability object.
   */
  function getOflCapability(qlcPlusCapability) {
    const cap = {
      dmxRange: [parseInt(qlcPlusCapability.$.Min), parseInt(qlcPlusCapability.$.Max)],
      type: ``
    };

    const channelName = qlcPlusChannel.$.Name.trim();
    const channelType = qlcPlusChannel.Group[0]._;
    const capabilityName = (qlcPlusCapability._ || ``).trim();

    // first check if it can be a NoFunction capability
    if (/^(?:nothing|no func(?:tion)?|unused|not used|empty|no strobe|no prism|no frost)$/i.test(capabilityName)) {
      cap.type = `NoFunction`;
      return cap;
    }

    const capData = {
      qlcPlusChannel,
      channelName,
      channelType,
      channelNameInWheels: channelName in fixture.wheels,
      qlcPlusCapability,
      capabilityName,
      index: qlcPlusChannel.Capability.indexOf(qlcPlusCapability),
      res1: qlcPlusCapability.$.Res1,
      res2: qlcPlusCapability.$.Res2,
      panMax,
      tiltMax
    };

    const preset = qlcPlusCapability.$.Preset;

    if (preset) {
      Object.assign(cap, getCapabilityFromCapabilityPreset(preset, capData));
    }
    else {
      // try to parse capability based on type
      Object.assign(cap, parserPerChannelType[channelType](capData));
    }

    deleteCommentIfUnnecessary(cap, channelName);

    return cap;
  }
}

/**
 * @param {object} qlcPlusPhysical The QLC+ mode's physical object.
 * @param {object|undefined} [oflFixPhysical={}] The OFL fixture's physical object.
 * @returns {object} The OFL mode's physical object.
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

    if (DMXconnector !== `` && oflFixPhysical.DMXconnector !== DMXconnector) {
      physical.DMXconnector = DMXconnector;
    }
  }

  /**
   * Handles the Bulb section.
   */
  function addBulb() {
    physical.bulb = {};

    const type = qlcPlusPhysical.Bulb[0].$.Type;
    if (type !== `` && getOflPhysicalProperty(`bulb`, `type`) !== type) {
      physical.bulb.type = type;
    }

    const colorTemp = parseFloat(qlcPlusPhysical.Bulb[0].$.ColourTemperature);
    if (colorTemp && getOflPhysicalProperty(`bulb`, `colorTemperature`) !== colorTemp) {
      physical.bulb.colorTemperature = colorTemp;
    }

    const lumens = parseFloat(qlcPlusPhysical.Bulb[0].$.Lumens);
    if (lumens && getOflPhysicalProperty(`bulb`, `lumens`) !== lumens) {
      physical.bulb.lumens = lumens;
    }
  }

  /**
   * Handles the Lens section.
   */
  function addLens() {
    physical.lens = {};

    const name = qlcPlusPhysical.Lens[0].$.Name;
    if (name !== `` && getOflPhysicalProperty(`lens`, `name`) !== name) {
      physical.lens.name = name;
    }

    const degMin = parseFloat(qlcPlusPhysical.Lens[0].$.DegreesMin);
    const degMax = parseFloat(qlcPlusPhysical.Lens[0].$.DegreesMax);
    const degreesMinMax = [degMin, degMax];

    if ((degMin !== 0.0 || degMax !== 0.0)
      && (JSON.stringify(getOflPhysicalProperty(`lens`, `degreesMinMax`)) !== JSON.stringify(degreesMinMax))) {
      physical.lens.degreesMinMax = degreesMinMax;
    }
  }

  /**
   * Helper function to get data from the OFL fixture's physical data.
   * @param {string} section The section object property name.
   * @param {string} property The property name in the section,
   * @returns {*} The property data, or undefined.
   */
  function getOflPhysicalProperty(section, property) {
    if (!(section in oflFixPhysical)) {
      return undefined;
    }

    return oflFixPhysical[section][property];
  }
}

/**
 * @param {object} qlcPlusMode The QLC+ mode object.
 * @param {object|undefined} oflFixPhysical The OFL fixture's physical object.
 * @param {array.<string>} warningsArray This fixture's warnings array in the `out` object.
 * @returns {object} The OFL mode object.
 */
function getOflMode(qlcPlusMode, oflFixPhysical, warningsArray) {
  const mode = {
    name: qlcPlusMode.$.Name
  };

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
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusFixture The QLC+ fixture object.
 * @param {array.<string>} warningsArray This fixture's warnings array in the `out` object.
 */
function mergeFineChannels(fixture, qlcPlusFixture, warningsArray) {
  const fineChannelRegex = /\s+fine$|16[-_\s]*bit$/i;

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
   * @param {string} qlcPlusFineChannel The key of the fine channel.
   * @returns {string|null} The key of the corresponding coarse channel, or null if it could not be detected.
   */
  function getCoarseChannelKey(qlcPlusFineChannel) {
    const fineChannelKey = qlcPlusFineChannel.$.Name;

    if (`Preset` in qlcPlusFineChannel.$) {
      const coarseChannelPreset = qlcPlusFineChannel.$.Preset.slice(0, -4);

      const coarseChannels = qlcPlusFixture.Channel.filter(
        coarseChannel => coarseChannel.$.Preset === coarseChannelPreset
      );
      if (coarseChannels.length === 1) {
        return coarseChannels[0].$.Name;
      }
    }

    // if coarse channel can't be deduced from fine channel preset, try using only its name

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
 * @param {object} fixture The OFL fixture object.
 * @param {object} qlcPlusFixture The QCL+ fixture object.
 */
function cleanUpFixture(fixture, qlcPlusFixture) {
  // delete empty fineChannelAliases arrays and unnecessary dmxValueResolution properties
  for (const chKey of Object.keys(fixture.availableChannels)) {
    const channel = fixture.availableChannels[chKey];

    if (channel.capabilities.length === 1) {
      channel.capability = channel.capabilities[0];
      delete channel.capabilities;
      delete channel.capability.dmxRange;

      if (!(`defaultValue` in channel)) {
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
 * @param {string} str The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
