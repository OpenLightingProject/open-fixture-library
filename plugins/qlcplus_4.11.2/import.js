const xml2js = require(`xml2js`);
const promisify = require(`util`).promisify;

module.exports.name = `QLC+ 4.11.2`;
module.exports.version = `0.4.2`;

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise.<object, Error>} A Promise resolving to an out object
**/
module.exports.import = function importQlcPlus(buffer, filename, authorName) {
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

  return promisify(parser.parseString)(buffer.toString())
    .then(xml => {
      const qlcPlusFixture = xml.FixtureDefinition;
      fixture.name = qlcPlusFixture.Model[0];

      const manKey = slugify(qlcPlusFixture.Manufacturer[0]);
      const fixKey = `${manKey}/${slugify(fixture.name)}`;
      out.warnings[fixKey] = [`Please check if manufacturer is correct.`];

      fixture.categories = [qlcPlusFixture.Type[0]];

      const authors = qlcPlusFixture.Creator[0].Author[0].split(/,\s*/);
      if (!authors.includes(authorName)) {
        authors.push(authorName);
      }

      fixture.meta = {
        authors: authors,
        createDate: timestamp,
        lastModifyDate: timestamp,
        importPlugin: {
          plugin: `qlcplus_4.11.2`,
          date: timestamp,
          comment: `created by ${qlcPlusFixture.Creator[0].Name[0]} (version ${qlcPlusFixture.Creator[0].Version[0]})`
        }
      };

      // fill in one empty mode so we don't have to check this case anymore
      if (!(`Mode` in qlcPlusFixture)) {
        qlcPlusFixture.Mode = [{
          Physical: [{}]
        }];
      }

      fixture.physical = getOflPhysical(qlcPlusFixture.Mode[0].Physical[0], {});
      fixture.matrix = {};
      fixture.availableChannels = {};
      fixture.templateChannels = {};

      const doubleByteChannels = [];
      for (const channel of qlcPlusFixture.Channel || []) {
        fixture.availableChannels[channel.$.Name] = getOflChannel(channel);

        if (channel.Group[0].$.Byte === `1`) {
          doubleByteChannels.push(channel.$.Name);
        }
      }

      mergeFineChannels(fixture, doubleByteChannels, out.warnings[fixKey]);

      fixture.modes = qlcPlusFixture.Mode.map(mode => getOflMode(mode, fixture.physical, out.warnings[fixKey]));

      cleanUpFixture(fixture, qlcPlusFixture);

      out.fixtures[fixKey] = fixture;

      return out;
    });
};

/**
 * @param {object} qlcPlusChannel The QLC+ channel object.
 * @returns {object} The OFL channel object.
 */
function getOflChannel(qlcPlusChannel) {
  const channel = {
    fineChannelAliases: [],
    dmxValueResolution: `8bit`
  };

  if (`Capability` in qlcPlusChannel) {
    channel.capabilities = qlcPlusChannel.Capability.map(cap => getOflCapability(cap, qlcPlusChannel));
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

  if (channel.capabilities.length === 1) {
    channel.capability = channel.capabilities[0];
    delete channel.capabilities;
    delete channel.capability.dmxRange;
  }

  return channel;
}

/**
 * @param {object} qlcPlusCapability The QLC+ capability object.
 * @param {object} qlcPlusChannel The QLC+ channel object.
 * @returns {object} The OFL capability object.
 */
function getOflCapability(qlcPlusCapability, qlcPlusChannel) {
  const cap = {
    dmxRange: [parseInt(qlcPlusCapability.$.Min), parseInt(qlcPlusCapability.$.Max)],
    type: ``
  };

  const channelName = qlcPlusChannel.$.Name.trim();
  const channelType = qlcPlusChannel.Group[0]._;
  const capabilityName = qlcPlusCapability._.trim();

  // first check if it can be a NoFunction capability
  if (capabilityName.match(/^(?:nothing|no func(?:tion)?|unused|not used|empty|no strobe|no prism|no frost)$/i)) {
    cap.type = `NoFunction`;
    return cap;
  }

  // capability parsers can rely on the channel type as a first distinctive feature
  const parserPerChannelType = {
    Nothing() {
      cap.type = `Nothing`;
    },
    Intensity() {
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
    },
    Colour() {
      if (`Color` in qlcPlusCapability.$) {
        cap.colors = [qlcPlusCapability.$.Color];

        if (`Color2` in qlcPlusCapability.$) {
          cap.colors.push(qlcPlusCapability.$.Color2);
        }
      }

      if (channelName.match(/wheel/i)) {
        cap.type = `ColorWheelIndex`;
        cap.comment = getSpeedGuessedComment();

        if (`speedStart` in cap) {
          cap.type = `ColorWheelRotation`;
        }
      }
      else {
        cap.type = `ColorPreset`;
        cap.comment = capabilityName;
      }
    },
    Gobo() {
      cap.type = `GoboIndex`;
      cap.comment = getSpeedGuessedComment();

      if (`speedStart` in cap) {
        cap.type = `GoboWheelRotation`;
      }
    },
    Effect() {
      cap.type = `Effect`;
      cap.effectName = ``; // set it first here so effectName is before speedStart/speedEnd
      cap.effectName = getSpeedGuessedComment();
    },
    Maintenance() {
      cap.type = `Maintenance`;
      cap.comment = capabilityName;
    },
    Pan() {
      if (channelName.match(/continuous/i)) {
        cap.type = `PanContinuous`;
        cap.comment = getSpeedGuessedComment();
      }
      else {
        cap.type = `Pan`;
        cap.angleStart = `0%`;
        cap.angleEnd = `100%`;
        cap.comment = capabilityName;
      }
    },
    Tilt() {
      if (channelName.match(/continuous/i)) {
        cap.type = `TiltContinuous`;
        cap.comment = getSpeedGuessedComment();
      }
      else {
        cap.type = `Tilt`;
        cap.angleStart = `0%`;
        cap.angleEnd = `100%`;
        cap.comment = capabilityName;
      }
    },
    Prism() {
      cap.type = `Prism`;
      cap.comment = capabilityName;
    },
    Shutter() {
      cap.type = `ShutterStrobe`;

      if (capabilityName.match(/^(?:Blackout|(?:Shutter |Strobe )?Closed?)$/i)) {
        cap.shutterEffect = `Closed`;
        return;
      }

      if (capabilityName.match(/^(?:(?:Shutter |Strobe )?Open|Full?)$/i)) {
        cap.shutterEffect = `Open`;
        return;
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
        cap.shutterEffect += `Random`;
      }

      cap.comment = getSpeedGuessedComment();
    },
    Speed() {
      if (channelName.match(/pan(?:\/)?tilt/i)) {
        cap.type = `PanTiltSpeed`;
      }
      else {
        cap.type = `Speed`;
      }

      cap.comment = getSpeedGuessedComment();
    }
  };

  // then run channel type specific parser
  if (channelType in parserPerChannelType) {
    parserPerChannelType[channelType]();
  }
  else {
    cap.type = `Generic`;
    cap.comment = capabilityName;
  }

  // delete unnecessary comments
  if (`comment` in cap && (cap.comment === channelName || cap.comment.match(/^$|^0%?\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*100%$/))) {
    delete cap.comment;
  }

  return cap;


  /**
   * Try to guess speedStart / speedEnd from the capabilityName. May set cap.type to Rotation.
   * @returns {string} The rest of the capabilityName.
   */
  function getSpeedGuessedComment() {
    return capabilityName.replace(/(?:^|,\s*|\s+)\(?((?:(?:counter-?)?clockwise|C?CW)(?:,\s*|\s+))?\(?(slow|fast|\d+|\d+\s*Hz)\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*(fast|slow|\d+\s*Hz)\)?$/i, (match, direction, start, end) => {
      const directionStr = direction ? (direction.match(/^(?:clockwise|CW),?\s+$/i) ? ` CW` : ` CCW`) : ``;

      if (directionStr !== ``) {
        cap.type = `Rotation`;
      }

      start = start.toLowerCase();
      end = end.toLowerCase();

      const startNumber = parseFloat(start);
      const endNumber = parseFloat(end);
      if (!isNaN(startNumber) && !isNaN(endNumber)) {
        start = `${startNumber}Hz`;
        end = `${endNumber}Hz`;
      }

      cap.speedStart = start + directionStr;
      cap.speedEnd = end + directionStr;

      // delete the parsed part
      return ``;
    });
  }
}

/**
 * @param {object} qlcPlusPhysical The QLC+ mode's physical object.
 * @param {object} oflFixPhysical The OFL fixture's physical object.
 * @returns {object} The OFL mode's physical object.
 */
function getOflPhysical(qlcPlusPhysical, oflFixPhysical) {
  const physical = {};

  addDimensions();
  addTechnical();

  if (`Bulb` in qlcPlusPhysical) {
    physical.bulb = {};
    addBulb();
  }

  if (`Lens` in qlcPlusPhysical) {
    physical.lens = {};
    addLens();
  }

  if (`Focus` in qlcPlusPhysical) {
    physical.focus = {};
    addFocus();
  }

  for (const section of [`bulb`, `lens`, `focus`]) {
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

    const DMXconnector = qlcPlusPhysical.Technical[0].$.DmxConnector;
    if (DMXconnector !== `` && oflFixPhysical.DMXconnector !== DMXconnector) {
      physical.DMXconnector = DMXconnector;
    }
  }

  /**
   * Handles the Bulb section.
   */
  function addBulb() {
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
   * Handles the Focus section.
   */
  function addFocus() {
    const type = qlcPlusPhysical.Focus[0].$.Type;
    if (type && getOflPhysicalProperty(`focus`, `type`) !== type) {
      physical.focus.type = type;
    }

    const panMax = parseFloat(qlcPlusPhysical.Focus[0].$.PanMax);
    if (panMax && getOflPhysicalProperty(`focus`, `panMax`) !== panMax) {
      physical.focus.panMax = panMax;
    }

    const tiltMax = parseFloat(qlcPlusPhysical.Focus[0].$.TiltMax);
    if (tiltMax && getOflPhysicalProperty(`focus`, `tiltMax`) !== tiltMax) {
      physical.focus.tiltMax = tiltMax;
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
 * @param {object} oflFixPhysical The OFL fixture's physical object.
 * @param {Array.<string>} warningsArray This fixture's warnings array in the `out` object.
 * @returns {object} The OFL mode object.
 */
function getOflMode(qlcPlusMode, oflFixPhysical, warningsArray) {
  const mode = {
    name: qlcPlusMode.$.Name
  };

  const physical = getOflPhysical(qlcPlusMode.Physical[0], oflFixPhysical);

  if (JSON.stringify(physical) !== `{}`) {
    mode.physical = physical;
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
 * @param {Array.<string>} doubleByteChannels Array of channel keys for fine channels.
 * @param {Array.<string>} warningsArray This fixture's warnings array in the `out` object.
 */
function mergeFineChannels(fixture, doubleByteChannels, warningsArray) {
  const fineChannelRegex = /\s+fine$|16[-_\s]*bit$/i;

  for (const chKey of doubleByteChannels) {
    try {
      if (!fineChannelRegex.test(chKey)) {
        throw new Error(`The corresponding coarse channel could not be detected.`);
      }

      const coarseChannelKey = getCoarseChannelKey(chKey);
      if (!coarseChannelKey) {
        throw new Error(`The corresponding coarse channel could not be detected.`);
      }

      fixture.availableChannels[coarseChannelKey].fineChannelAliases.push(chKey);

      const fineChannel = fixture.availableChannels[chKey];
      if (`capabilities` in fineChannel && fineChannel.capabilities.length > 1) {
        throw new Error(`Merge its capabilities into channel '${coarseChannelKey}'.`);
      }

      delete fixture.availableChannels[chKey];
    }
    catch (error) {
      warningsArray.push(`Please check 16bit channel '${chKey}': ${error.message}`);
    }
  }


  /**
   * @param {string} fineChannelKey The key of the fince channel.
   * @returns {string|null} The key of the corresponding coarse channel, or null if it could not be detected.
   */
  function getCoarseChannelKey(fineChannelKey) {
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

    if (`capability` in channel) {
      // no DMX values used in this channel
      delete channel.dmxValueResolution;
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
