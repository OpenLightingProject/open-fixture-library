const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

const {
  getChannelPreset,
  getFineChannelPreset,
  getCapabilityPreset,
  exportHelpers
} = require(`./presets.js`);

/** @typedef {import('../../lib/model/AbstractChannel.js').default} AbstractChannel */
const { Capability } = require(`../../lib/model.js`);
const { CoarseChannel } = require(`../../lib/model.js`);
/** @typedef {import('../../lib/model/FineChannel.js').default} FineChannel */
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */
const { Physical } = require(`../../lib/model.js`);
const { SwitchingChannel } = require(`../../lib/model.js`);

module.exports.version = `1.3.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = async function exportQlcPlus(fixtures, options) {
  const customGobos = {};

  const outFiles = fixtures.map(fixture => {
    const xml = xmlbuilder.begin()
      .declaration(`1.0`, `UTF-8`)
      .element({
        FixtureDefinition: {
          '@xmlns': `http://www.qlcplus.org/FixtureDefinition`,
          Creator: {
            Name: `OFL – ${fixture.url}`,
            Version: options.displayedPluginVersion || module.exports.version,
            Author: fixture.meta.authors.join(`, `)
          },
          Manufacturer: fixture.manufacturer.name,
          Model: fixture.name,
          Type: getFixtureType(fixture)
        }
      });

    for (const channel of fixture.coarseChannels) {
      addChannel(xml, channel, customGobos);
    }

    const panMax = getPanTiltMax(`Pan`, fixture.coarseChannels);
    const tiltMax = getPanTiltMax(`Tilt`, fixture.coarseChannels);
    const useGlobalPhysical = fixture.modes.every(mode => {
      if (mode.physicalOverride !== null) {
        return false;
      }

      const modePanMax = getPanTiltMax(`Pan`, mode.channels);
      const modeTiltMax = getPanTiltMax(`Tilt`, mode.channels);
      return (modePanMax === 0 || panMax === modePanMax) && (modeTiltMax === 0 || tiltMax === modeTiltMax);
    });

    for (const mode of fixture.modes) {
      addMode(xml, mode, !useGlobalPhysical);
    }

    if (useGlobalPhysical) {
      addPhysical(xml, fixture.physical || new Physical({}), fixture);
    }

    xml.dtd(``);

    const sanitizedFileName = sanitize(`${fixture.manufacturer.name}-${fixture.name}.qxf`).replace(/\s+/g, `-`);

    return {
      name: `fixtures/${sanitizedFileName}`,
      content: xml.end({
        pretty: true,
        indent: ` `
      }),
      mimetype: `application/x-qlc-fixture`
    };
  });

  // add gobo images not included in QLC+ to exported files
  Object.entries(customGobos).forEach(([qlcplusResName, oflResource]) => {
    // oflResource.image is in the form "data:<mimeType>;charset=utf-8;base64,<base64Data>"
    const [, mimeType,,, base64Data] = oflResource.image.split(/[:;,]/);

    outFiles.push({
      name: `gobos/${qlcplusResName}`,
      content: Buffer.from(base64Data, `base64`),
      mimeType
    });
  });

  return outFiles;
};

/**
 * @param {Object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {CoarseChannel} channel The OFL channel object.
 * @param {Object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
function addChannel(xml, channel, customGobos) {
  const chType = getChannelType(channel.type);

  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  if (channel.defaultValue !== 0) {
    xmlChannel.attribute(`Default`, channel.getDefaultValueWithResolution(CoarseChannel.RESOLUTION_8BIT));
  }

  const channelPreset = getChannelPreset(channel);
  if (channelPreset !== null) {
    xmlChannel.attribute(`Preset`, channelPreset);
  }
  else {
    xmlChannel.element({
      Group: {
        '@Byte': 0,
        '#text': chType
      }
    });

    if (chType === `Intensity`) {
      xmlChannel.element({
        Colour: channel.color !== null ? channel.color.replace(/^(?:Warm|Cold) /, ``) : `Generic`
      });
    }

    for (const cap of channel.capabilities) {
      addCapability(xmlChannel, cap, customGobos);
    }
  }

  channel.fineChannels.forEach(fineChannel => addFineChannel(xml, fineChannel, customGobos));
}

/**
 * @param {Object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {FineChannel} fineChannel The OFL fine channel object.
 * @param {Object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
function addFineChannel(xml, fineChannel, customGobos) {
  const xmlFineChannel = xml.element({
    Channel: {
      '@Name': fineChannel.uniqueName
    }
  });

  if (fineChannel.defaultValue !== 0) {
    xmlFineChannel.attribute(`Default`, fineChannel.defaultValue);
  }

  if (fineChannel.resolution > CoarseChannel.RESOLUTION_16BIT) {
    // QLC+ does not support 24+ bit channels, so let's fake one
    xmlFineChannel.element({
      Group: {
        '@Byte': 0, // not a QLC+ fine channel
        '#text': `Maintenance`
      }
    });

    addCapability(xmlFineChannel, new Capability({
      dmxRange: [0, 255],
      type: `Generic`,
      comment: `Fine^${fineChannel.resolution - 1} adjustment for ${fineChannel.coarseChannel.uniqueName}`
    }, CoarseChannel.RESOLUTION_8BIT, fineChannel.coarseChannel), customGobos);

    return;
  }

  const fineChannelPreset = getFineChannelPreset(fineChannel);
  if (fineChannelPreset !== null) {
    xmlFineChannel.attribute(`Preset`, fineChannelPreset);

    return;
  }

  const chType = getChannelType(fineChannel.coarseChannel.type);

  xmlFineChannel.element({
    Group: {
      '@Byte': 1,
      '#text': chType
    }
  });

  if (chType === `Intensity`) {
    xmlFineChannel.element({
      Colour: fineChannel.coarseChannel.color !== null ? fineChannel.coarseChannel.color.replace(/^(?:Warm|Cold) /, ``) : `Generic`
    });
  }

  addCapability(xmlFineChannel, new Capability({
    dmxRange: [0, 255],
    type: `Generic`,
    comment: `Fine adjustment for ${fineChannel.coarseChannel.uniqueName}`
  }, CoarseChannel.RESOLUTION_8BIT, fineChannel.coarseChannel));
}

/**
 * @param {Object} xmlChannel The xmlbuilder <Channel> object.
 * @param {Capability} cap The OFL capability object.
 * @param {Object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
function addCapability(xmlChannel, cap, customGobos) {
  const dmxRange = cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);

  const xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': dmxRange.start,
      '@Max': dmxRange.end,
      '#text': cap.name
    }
  });

  const preset = addCapabilityAliases(xmlCapability, cap) ? {
    presetName: `Alias`,
    res1: null,
    res2: null
  } : getCapabilityPreset(cap);

  if (preset !== null) {
    xmlCapability.attribute(`Preset`, preset.presetName);

    if (preset.res1 !== null) {
      xmlCapability.attribute(`Res1`, preset.res1);

      if (`${preset.res1}`.startsWith(`ofl/`)) {
        customGobos[preset.res1] = cap.wheelSlot[0].resource;
      }
    }

    if (preset.res2 !== null) {
      xmlCapability.attribute(`Res2`, preset.res2);
    }
  }
  else {
    addCapabilityLegacyAttributes(xmlCapability, cap, customGobos);
  }
}

/**
 * @param {Object} xmlCapability The xmlbuilder <Capability> object.
 * @param {Capability} cap The OFL capability object.
 * @param {Object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
function addCapabilityLegacyAttributes(xmlCapability, cap, customGobos) {
  if (cap.colors !== null && cap.colors.allColors.length <= 2) {
    xmlCapability.attribute(`Color`, cap.colors.allColors[0]);

    if (cap.colors.allColors.length > 1) {
      xmlCapability.attribute(`Color2`, cap.colors.allColors[1]);
    }
  }

  const goboRes = exportHelpers.getGoboRes(cap);
  if (goboRes) {
    xmlCapability.attribute(`Res`, goboRes);

    if (goboRes.startsWith(`ofl/`)) {
      customGobos[goboRes] = cap.wheelSlot[0].resource;
    }
  }
}

/**
 * @param {Object} xmlCapability The xmlbuilder <Capability> object.
 * @param {Capability} cap The OFL capability object.
 * @returns {Boolean} True when one or more <Alias> elements were added to the capability, false otherwise.
 */
function addCapabilityAliases(xmlCapability, cap) {
  const fixture = cap._channel.fixture;

  let aliasAdded = false;
  for (const alias of Object.keys(cap.switchChannels)) {
    const switchingChannel = fixture.getChannelByKey(alias);
    const defaultChannel = switchingChannel.defaultChannel;
    const switchedChannel = fixture.getChannelByKey(cap.switchChannels[alias]);

    if (defaultChannel === switchedChannel) {
      continue;
    }

    const modesContainingSwitchingChannel = fixture.modes.filter(
      mode => mode.getChannelIndex(switchingChannel) !== -1
    );

    for (const mode of modesContainingSwitchingChannel) {
      aliasAdded = true;
      xmlCapability.element({
        Alias: {
          '@Mode': mode.name,
          '@Channel': defaultChannel.uniqueName,
          '@With': switchedChannel.uniqueName
        }
      });
    }
  }

  return aliasAdded;
}

/**
 * @param {Object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {Mode} mode The OFL mode object.
 * @param {Boolean} createPhysical Whether to add a Physical XML element to the mode.
 */
function addMode(xml, mode, createPhysical) {
  const xmlMode = xml.element({
    Mode: {
      '@Name': mode.name
    }
  });

  if (createPhysical) {
    addPhysical(xmlMode, mode.physical || new Physical({}), mode.fixture, mode);
  }

  mode.channels.forEach((channel, index) => {
    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    xmlMode.element({
      Channel: {
        '@Number': index,
        '#text': channel.uniqueName
      }
    });
  });

  if (mode.fixture.matrix !== null) {
    addHeads(xmlMode, mode);
  }
}

/**
 * @param {Object} xmlParentNode The xmlbuilder object where <Physical> should be added (<FixtureDefinition> or <Mode>).
 * @param {Physical} physical The OFL physical object.
 * @param {Fixture} fixture The OFL fixture object.
 * @param {Mode|null} mode The OFL mode object this physical data section belongs to. Only provide this if panMax and tiltMax should be read from this mode's Pan / Tilt channels, otherwise they are read from all channels.
 */
function addPhysical(xmlParentNode, physical, fixture, mode) {
  const PanMax = getPanTiltMax(`Pan`, mode ? mode.channels : fixture.coarseChannels);
  const TiltMax = getPanTiltMax(`Tilt`, mode ? mode.channels : fixture.coarseChannels);

  if (Object.keys(physical.jsonObject).length === 0 && PanMax === 0 && TiltMax === 0) {
    // empty physical data
    return;
  }

  const physicalSections = {
    Bulb: {
      required: true,
      getAttributes() {
        return {
          Type: physical.bulbType || `Other`,
          Lumens: Math.round(physical.bulbLumens) || 0,
          ColourTemperature: Math.round(physical.bulbColorTemperature) || 0
        };
      }
    },
    Dimensions: {
      required: true,
      getAttributes() {
        return {
          Weight: physical.weight || 0,
          Width: Math.round(physical.width) || 0,
          Height: Math.round(physical.height) || 0,
          Depth: Math.round(physical.depth) || 0
        };
      }
    },
    Lens: {
      required: true,
      getAttributes() {
        return {
          Name: physical.lensName || `Other`,
          DegreesMin: physical.lensDegreesMin || 0,
          DegreesMax: physical.lensDegreesMax || 0
        };
      }
    },
    Focus: {
      required: true,
      getAttributes() {
        const focusTypeConditions = {
          Mirror: fixture.categories.includes(`Scanner`),
          Barrel: fixture.categories.includes(`Barrel Scanner`),
          Head: fixture.categories.includes(`Moving Head`) || PanMax > 0 || TiltMax > 0,
          Fixed: true
        };
        const Type = Object.keys(focusTypeConditions).find(focusType => focusTypeConditions[focusType] === true);

        return {
          Type,
          PanMax,
          TiltMax
        };
      }
    },
    Layout: {
      required: fixture.matrix !== null,
      getAttributes() {
        return {
          Width: fixture.matrix.pixelCountX,
          Height: fixture.matrix.pixelCountY * fixture.matrix.pixelCountZ
        };
      }
    },
    Technical: {
      required: physical.DMXconnector !== null || physical.power !== null,
      getAttributes() {
        // add whitespace
        const connector = physical.DMXconnector === `3.5mm stereo jack` ? `3.5 mm stereo jack` : physical.DMXconnector;

        return {
          DmxConnector: connector || `Other`,
          PowerConsumption: Math.round(physical.power) || 0
        };
      }
    }
  };

  const xmlPhysical = xmlParentNode.element(`Physical`);
  Object.entries(physicalSections).forEach(([name, section]) => {
    if (section.required) {
      xmlPhysical.element(name, section.getAttributes());
    }
  });
}

/**
 * @param {'Pan'|'Tilt'} panOrTilt Whether to return pan max or tilt max.
 * @param {Array.<CoarseChannel>} channels The channels in which to look for pan/tilt angles, e.g. all mode channels.
 * @returns {Number} The maximum pan/tilt range in the given channels, i.e. highest angle - lowest angle. If only continous pan/tilt is used, the return value is 9999. Defaults to 0.
 */
function getPanTiltMax(panOrTilt, channels) {
  const capabilities = [];
  channels.forEach(ch => {
    if (ch.capabilities) {
      capabilities.push(...ch.capabilities);
    }
  });

  const panTiltCapabilities = capabilities.filter(cap => cap.type === panOrTilt && cap.angle[0].unit === `deg`);
  const minAngle = Math.min(...panTiltCapabilities.map(cap => Math.min(cap.angle[0].number, cap.angle[1].number)));
  const maxAngle = Math.max(...panTiltCapabilities.map(cap => Math.max(cap.angle[0].number, cap.angle[1].number)));
  const panTiltMax = maxAngle - minAngle;

  if (panTiltMax === -Infinity) {
    const hasContinuousCapability = capabilities.some(cap => cap.type === `${panOrTilt}Continuous`);
    if (hasContinuousCapability) {
      return 9999;
    }

    return 0;
  }

  return Math.round(panTiltMax);
}

/**
 * Adds Head tags for all used pixels in the given mode, ordered by XYZ direction (pixel groups by appearence in JSON).
 * @param {XMLElement} xmlMode The Mode tag to which the Head tags should be added
 * @param {Mode} mode The fixture's mode whose pixels should be determined.
 */
function addHeads(xmlMode, mode) {
  const hasMatrixChannels = mode.channels.some(
    ch => ch.pixelKey !== null || (ch instanceof SwitchingChannel && ch.defaultChannel.pixelKey !== null)
  );

  if (hasMatrixChannels) {
    const pixelKeys = mode.fixture.matrix.getPixelKeysByOrder(`X`, `Y`, `Z`);
    for (const pixelKey of pixelKeys) {
      const channels = mode.channels.filter(channel => controlsPixelKey(channel, pixelKey));
      const xmlHead = xmlMode.element(`Head`);

      for (const ch of channels) {
        xmlHead.element({
          Channel: mode.getChannelIndex(ch.key)
        });
      }
    }
  }

  /**
   * @param {AbstractChannel} channel A channel from a mode's channel list.
   * @param {String} pixelKey The pixel to check for.
   * @returns {Boolean} Whether the given channel controls the given pixel key, either directly or as part of a pixel group.
   */
  function controlsPixelKey(channel, pixelKey) {
    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    if (channel.pixelKey !== null) {
      if (mode.fixture.matrix.pixelGroupKeys.includes(channel.pixelKey)) {
        return mode.fixture.matrix.pixelGroups[channel.pixelKey].includes(pixelKey);
      }

      return channel.pixelKey === pixelKey;
    }

    return false;
  }
}

/**
 * Determines the QLC+ fixture type out of the fixture's categories.
 * @param {Fixture} fixture The Fixture instance whose QLC+ type has to be determined.
 * @returns {String} The first of the fixture's categories that is supported by QLC+, defaults to 'Other'.
 */
function getFixtureType(fixture) {
  const replaceCats = {
    'Barrel Scanner': `Scanner`,

    // see https://github.com/OpenLightingProject/open-fixture-library/issues/581
    'Pixel Bar': isBeamBar() ? `LED Bar (Beams)` : `LED Bar (Pixels)`
  };
  const ignoredCats = [`Blinder`, `Matrix`, `Stand`];

  return fixture.categories.map(
    cat => (cat in replaceCats ? replaceCats[cat] : cat)
  ).find(
    cat => !ignoredCats.includes(cat)
  ) || `Other`;


  /**
   * @returns {Boolean} True if there are individual beams (or it can not be determined), false if the pixels' colors blend into each other.
   */
  function isBeamBar() {
    if (!fixture.physical || !fixture.physical.matrixPixelsSpacing) {
      return true;
    }

    return fixture.physical.matrixPixelsSpacing.some(spacing => spacing !== 0);
  }
}

/**
 * Converts a channel's type into a valid QLC+ channel type.
 * @param {String} type Our own OFL channel type.
 * @returns {String} The corresponding QLC+ channel type.
 */
function getChannelType(type) {
  const qlcplusChannelTypes = {
    Intensity: [`Intensity`, `Single Color`],
    Colour: [`Multi-Color`],
    Pan: [`Pan`],
    Tilt: [`Tilt`],
    Beam: [`Focus`, `Zoom`, `Iris`, `Color Temperature`],
    Gobo: [`Gobo`],
    Prism: [`Prism`],
    Shutter: [`Shutter`, `Strobe`],
    Speed: [`Speed`],
    Effect: [`Effect`, `Fog`],
    Maintenance: [`Maintenance`],
    Nothing: [`NoFunction`]
  };

  for (const qlcplusType of Object.keys(qlcplusChannelTypes)) {
    if (qlcplusChannelTypes[qlcplusType].includes(type)) {
      return qlcplusType;
    }
  }
  return `Effect`; // default if new types are added to OFL
}
