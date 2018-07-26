const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannel,
  MatrixChannelReference,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../../lib/model.js`);
/* eslint-enable no-unused-vars */

const capabilityHelpers = {
  isIncreasingSpeed: cap => cap.speed !== null && Math.abs(cap.speed[0].number) < Math.abs(cap.speed[1].number),
  isDecreasingSpeed: cap => cap.speed !== null && Math.abs(cap.speed[0].number) > Math.abs(cap.speed[1].number),
  isStopped: cap => cap.speed !== null && cap.speed[0].number === 0 && cap.speed[1].number === 0,
  isIncreasingDuration: cap => cap.duration !== null && Math.abs(cap.duration[0].number) < Math.abs(cap.duration[1].number),
  isDecreasingDuration: cap => cap.duration !== null && Math.abs(cap.duration[0].number) > Math.abs(cap.duration[1].number),
  isColorIntensity: (cap, color) => cap.type === `ColorIntensity` && cap.color === color,
  isShutterEffect: (cap, shutterEffect) => cap.type === `ShutterStrobe` && cap.shutterEffect === shutterEffect,
  hasFrequency: cap => cap.speed !== null && (cap.speed[0].unit === `Hz` || cap.speed[0].unit === `bpm`),
  isRotationSpeed: cap => (cap.type.endsWith(`Rotation`) || [`PanContinuous`, `TiltContinuous`, `Prism`].includes(cap.type)) && cap.speed !== null,
  isBeamAngle: cap => (cap.type === `BeamAngle` || cap.type === `Zoom`) && cap.angle !== null
};

module.exports.name = `QLC+ 5`;
module.exports.version = `1.0.0`;

module.exports.export = function exportQLCplus(fixtures, options) {
  return fixtures.map(fixture => {
    const xml = xmlbuilder.begin()
      .declaration(`1.0`, `UTF-8`)
      .element({
        FixtureDefinition: {
          '@xmlns': `http://www.qlcplus.org/FixtureDefinition`,
          Creator: {
            Name: `OFL – ${fixture.url}`,
            Version: module.exports.version,
            Author: fixture.meta.authors.join(`, `)
          },
          Manufacturer: fixture.manufacturer.name,
          Model: fixture.name,
          Type: getFixtureType(fixture)
        }
      });

    for (const channel of fixture.normalizedChannels.concat(fixture.nullChannels)) {
      addChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      addMode(xml, mode);
    }

    if (fixture.physical !== null) {
      addPhysical(xml, fixture.physical);
    }

    xml.doctype(``);

    const sanitizedManufacturerName = sanitize(fixture.manufacturer.name).replace(/\s+/g, `_`);
    return {
      name: `${sanitizedManufacturerName}/${sanitizedManufacturerName}-${sanitize(fixture.name)}.qxf`.replace(/\s+/g, `-`),
      content: xml.end({
        pretty: true,
        indent: ` `
      }),
      mimetype: `application/x-qlc-fixture`
    };
  });
};

/**
 * @param {!object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {!Channel} channel The OFL channel object.
 */
function addChannel(xml, channel) {
  const chType = getChannelType(channel.type);

  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  if (channel.defaultValue !== 0) {
    xmlChannel.attribute(`Default`, channel.getDefaultValueWithFineness(0));
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
        Colour: channel.color !== null ? channel.color : `Generic`
      });
    }

    for (const cap of channel.capabilities) {
      addCapability(xmlChannel, cap);
    }
  }

  channel.fineChannels.forEach(fineChannel => addFineChannel(xml, fineChannel));
}

/**
 * @param {!object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {!FineChannel} fineChannel The OFL fine channel object.
 */
function addFineChannel(xml, fineChannel) {
  const xmlFineChannel = xml.element({
    Channel: {
      '@Name': fineChannel.uniqueName
    }
  });

  if (fineChannel.defaultValue !== 0) {
    xmlFineChannel.attribute(`Default`, fineChannel.defaultValue);
  }

  if (fineChannel.fineness > 1) {
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
      comment: `Fine^${fineChannel.fineness} adjustment for ${fineChannel.coarseChannel.uniqueName}`
    }, 0, fineChannel.coarseChannel));

    return;
  }

  const fineChannelPresets = [
    `IntensityMasterDimmerFine`,
    `IntensityDimmerFine`,
    `IntensityRedFine`,
    `IntensityGreenFine`,
    `IntensityBlueFine`,
    `IntensityCyanFine`,
    `IntensityMagentaFine`,
    `IntensityYellowFine`,
    `IntensityAmberFine`,
    `IntensityWhiteFine`,
    `IntensityUVFine`,
    `IntensityIndigoFine`,
    `IntensityLimeFine`,
    `IntensityHueFine`,
    `IntensitySaturationFine`,
    `IntensityLightnessFine`,
    `IntensityValueFine`,
    `PositionPanFine`,
    `PositionTiltFine`,
    `ColorWheelFine`,
    `GoboWheelFine`,
    `GoboIndexFine`,
    `BeamIrisFine`
  ];

  const channelPreset = getChannelPreset(fineChannel.coarseChannel);
  if (channelPreset !== null && fineChannelPresets.includes(`${channelPreset}Fine`)) {
    xmlFineChannel.attribute(`Preset`, `${channelPreset}Fine`);

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
      Colour: fineChannel.coarseChannel.color !== null ? fineChannel.coarseChannel.color : `Generic`
    });
  }

  addCapability(xmlFineChannel, new Capability({
    dmxRange: [0, 255],
    type: `Generic`,
    comment: `Fine adjustment for ${fineChannel.coarseChannel.uniqueName}`
  }, 0, fineChannel.coarseChannel));
}

/**
 * @param {!Channel} channel The OFL channel object.
 * @returns {?string} The QLC+ channel preset name or null, if there is no suitable one.
 */
function getChannelPreset(channel) {
  if (channel.capabilities.length > 1) {
    return null;
  }

  const capability = channel.capabilities[0];

  // TODO: try to also detect the `cap => false` presets
  const channelPresets = {
    IntensityMasterDimmer: cap => false,
    IntensityDimmer: cap => cap.type === `Intensity`,
    IntensityRed: cap => capabilityHelpers.isColorIntensity(cap, `Red`),
    IntensityGreen: cap => capabilityHelpers.isColorIntensity(cap, `Green`),
    IntensityBlue: cap => capabilityHelpers.isColorIntensity(cap, `Blue`),
    IntensityCyan: cap => capabilityHelpers.isColorIntensity(cap, `Cyan`),
    IntensityMagenta: cap => capabilityHelpers.isColorIntensity(cap, `Magenta`),
    IntensityYellow: cap => capabilityHelpers.isColorIntensity(cap, `Yellow`),
    IntensityAmber: cap => capabilityHelpers.isColorIntensity(cap, `Amber`),
    IntensityWhite: cap => capabilityHelpers.isColorIntensity(cap, `White`),
    IntensityUV: cap => capabilityHelpers.isColorIntensity(cap, `UV`),
    IntensityIndigo: cap => capabilityHelpers.isColorIntensity(cap, `Indigo`),
    IntensityLime: cap => capabilityHelpers.isColorIntensity(cap, `Lime`),
    IntensityHue: cap => false,
    IntensitySaturation: cap => false,
    IntensityLightness: cap => false,
    IntensityValue: cap => false,
    PositionPan: cap => cap.type === `Pan`,
    PositionPanCounterClockwise: cap => false,
    PositionTilt: cap => cap.type === `Tilt`,
    PositionXAxis: cap => false,
    PositionYAxis: cap => false,
    SpeedPanSlowFast: cap => cap.type === `PanContinuous` && capabilityHelpers.isIncreasingSpeed(cap),
    SpeedPanFastSlow: cap => cap.type === `PanContinuous` && capabilityHelpers.isDecreasingSpeed(cap),
    SpeedTiltSlowFast: cap => cap.type === `TiltContinuous` && capabilityHelpers.isIncreasingSpeed(cap),
    SpeedTiltFastSlow: cap => cap.type === `TiltContinuous` && capabilityHelpers.isDecreasingSpeed(cap),
    SpeedPanTiltSlowFast: cap => cap.type === `PanTiltSpeed` && (capabilityHelpers.isIncreasingSpeed(cap) || capabilityHelpers.isDecreasingDuration(cap)),
    SpeedPanTiltFastSlow: cap => cap.type === `PanTiltSpeed` && (capabilityHelpers.isDecreasingSpeed(cap) || capabilityHelpers.isIncreasingDuration(cap)),
    ColorMacro: cap => cap.type === `ColorPreset` || cap.type === `ColorWheelIndex`,
    ColorWheel: cap => cap.type === `ColorWheelRotation`,
    ColorCTOMixer: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number < 0,
    ColorCTBMixer: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number > 0,
    GoboWheel: cap => cap.type === `GoboWheelRotation`,
    GoboIndex: cap => cap.type === `GoboIndex`,
    ShutterStrobeSlowFast: cap => cap.type === `ShutterStrobe` && capabilityHelpers.isIncreasingSpeed(cap),
    ShutterStrobeFastSlow: cap => cap.type === `ShutterStrobe` && capabilityHelpers.isDecreasingSpeed(cap),
    BeamFocusNearFar: cap => cap.type === `Focus` && cap.distance[0].number < cap.distance[1].number,
    BeamFocusFarNear: cap => cap.type === `Focus` && cap.distance[0].number > cap.distance[1].number,
    BeamIris: cap => cap.type === `Iris`,
    BeamZoomSmallBig: cap => cap.type === `Zoom` && cap.angle[0].number < cap.angle[1].number,
    BeamZoomBigSmall: cap => cap.type === `Zoom` && cap.angle[0].number > cap.angle[1].number,
    PrismRotationSlowFast: cap => cap.type === `PrismRotation` && capabilityHelpers.isIncreasingSpeed(cap),
    PrismRotationFastSlow: cap => cap.type === `PrismRotation` && capabilityHelpers.isDecreasingSpeed(cap),
    NoFunction: cap => cap.type === `NoFunction`
  };

  return Object.keys(channelPresets).find(presetName => channelPresets[presetName](capability)) || null;
}

/**
 * @param {!object} xmlChannel The xmlbuilder <Channel> object.
 * @param {!Capability} cap The OFL capability object.
 */
function addCapability(xmlChannel, cap) {
  const dmxRange = cap.getDmxRangeWithFineness(0);

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
    }

    if (preset.res2 !== null) {
      xmlCapability.attribute(`Res2`, preset.res2);
    }
  }
  else {
    addCapabilityLegacyAttributes(xmlCapability, cap);
  }
}

/**
 * @param {!object} xmlCapability The xmlbuilder <Capability> object.
 * @param {!Capability} cap The OFL capability object.
 */
function addCapabilityLegacyAttributes(xmlCapability, cap) {
  if (cap.colors !== null && cap.colors.allColors.length <= 2) {
    xmlCapability.attribute(`Color`, cap.colors.allColors[0]);

    if (cap.colors.allColors.length > 1) {
      xmlCapability.attribute(`Color2`, cap.colors.allColors[1]);
    }
  }
}

/**
 * @param {!object} xmlCapability The xmlbuilder <Capability> object.
 * @param {!Capability} cap The OFL capability object.
 * @returns {!boolean} True when one or more <Alias> elements were added to the capability, false otherwise.
 */
function addCapabilityAliases(xmlCapability, cap) {
  const fixture = cap._channel.fixture;

  let aliasAdded = false;
  for (const alias of Object.keys(cap.switchChannels)) {
    const switchingChannel = fixture.getChannelByKey(alias);
    const defaultChannel = switchingChannel.defaultChannel || switchingChannel.wrappedChannel.defaultChannel;
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
          '@Channel': defaultChannel.uniqueName || defaultChannel.wrappedChannel.uniqueName,
          '@With': switchedChannel.uniqueName || switchedChannel.wrappedChannel.uniqueName
        }
      });
    }
  }

  return aliasAdded;
}

/**
 * @typedef CapabilityPreset
 * @type {!object}
 * @property {!string} presetName The name of the QLC+ capability preset.
 * @property {?string} res1 A value for the QLC+ capability element's Res1 attribute, or null if the attribute should not be added.
 * @property {?string} res2 A value for the QLC+ capability element's Res2 attribute, or null if the attribute should not be added.
 */

/**
 * @param {!Capability} capability The OFL capability object.
 * @returns {?CapabilityPreset} The QLC+ capability preset or null, if there is no suitable one.
 */
function getCapabilityPreset(capability) {
  const capabilityPresets = {
    // shutter capabilities
    ShutterOpen: cap => capabilityHelpers.isShutterEffect(cap, `Open`),
    ShutterClose: cap => capabilityHelpers.isShutterEffect(cap, `Closed`),

    // strobe capabilities with specified frequency
    StrobeFrequency: getStrobeFrequencyPreset(`Strobe`, true),
    StrobeFreqRange: getStrobeFrequencyPreset(`Strobe`, false),
    PulseFrequency: getStrobeFrequencyPreset(`Pulse`, true),
    PulseFreqRange: getStrobeFrequencyPreset(`Pulse`, false),
    RampUpFrequency: getStrobeFrequencyPreset(`RampUp`, true),
    RampUpFreqRange: getStrobeFrequencyPreset(`RampUp`, false),
    RampDownFrequency: getStrobeFrequencyPreset(`RampDown`, true),
    RampDownFreqRange: getStrobeFrequencyPreset(`RampDown`, false),

    // other strobe capabilities
    StrobeRandomSlowToFast: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && cap.randomTiming && capabilityHelpers.isIncreasingSpeed(cap),
    StrobeRandomFastToSlow: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && cap.randomTiming && capabilityHelpers.isDecreasingSpeed(cap),
    StrobeRandom: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && cap.randomTiming,
    StrobeSlowToFast: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && capabilityHelpers.isIncreasingSpeed(cap),
    StrobeFastToSlow: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && capabilityHelpers.isDecreasingSpeed(cap),
    PulseSlowToFast: cap => capabilityHelpers.isShutterEffect(cap, `Pulse`) && capabilityHelpers.isIncreasingSpeed(cap),
    PulseFastToSlow: cap => capabilityHelpers.isShutterEffect(cap, `Pulse`) && capabilityHelpers.isDecreasingSpeed(cap),
    RampUpSlowToFast: cap => capabilityHelpers.isShutterEffect(cap, `RampUp`) && capabilityHelpers.isIncreasingSpeed(cap),
    RampUpFastToSlow: cap => capabilityHelpers.isShutterEffect(cap, `RampUp`) && capabilityHelpers.isDecreasingSpeed(cap),
    RampDownSlowToFast: cap => capabilityHelpers.isShutterEffect(cap, `RampDown`) && capabilityHelpers.isIncreasingSpeed(cap),
    RampDownFastToSlow: cap => capabilityHelpers.isShutterEffect(cap, `RampDown`) && capabilityHelpers.isDecreasingSpeed(cap),

    // rotation capabilities
    RotationClockwiseSlowToFast: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isIncreasingSpeed(cap) && cap.speed[0].number > 0,
    RotationClockwiseFastToSlow: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isDecreasingSpeed(cap) && cap.speed[1].number > 0,
    RotationClockwise: cap => capabilityHelpers.isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number > 0,
    RotationStop: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isStopped(cap),
    RotationCounterClockwiseSlowToFast: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isIncreasingSpeed(cap) && cap.speed[0].number < 0,
    RotationCounterClockwiseFastToSlow: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isDecreasingSpeed(cap) && cap.speed[1].number < 0,
    RotationCounterClockwise: cap => capabilityHelpers.isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number < 0,

    // color capabilities
    ColorMacro: {
      handler: cap => (cap.type === `ColorPreset` || cap.type === `ColorWheelIndex`) && cap.colors !== null && cap.colors.allColors.length === 1,
      res1: cap => cap.colors.allColors[0],
      res2: cap => null
    },
    ColorDoubleMacro: {
      handler: cap => (cap.type === `ColorPreset` || cap.type === `ColorWheelIndex`) && cap.colors !== null && cap.colors.allColors.length === 2,
      res1: cap => cap.colors.allColors[0],
      res2: cap => cap.colors.allColors[1]
    },
    ColorWheelIndex: cap => false, // seems to be unused in QLC+ for now

    // gobo capabilities
    // TODO: export a gobo image as res1
    GoboShakeMacro: cap => cap.type === `GoboIndex` && cap.isShaking,
    GoboMacro: cap => cap.type === `GoboIndex`,

    // generic / other capabilities
    GenericPicture: {
      handler: cap => cap.effectPreset === `ColorFade` && !capabilityHelpers.isStopped(cap),
      res1: cap => `Others/rainbow.png`,
      res2: cap => null
    },
    SlowToFast: cap => capabilityHelpers.isIncreasingSpeed(cap),
    FastToSlow: cap => capabilityHelpers.isDecreasingSpeed(cap),
    NearToFar: cap => cap.distance !== null && cap.distance[0].number < cap.distance[1].number,
    FarToNear: cap => cap.distance !== null && cap.distance[0].number > cap.distance[1].number,
    SmallToBig: cap => (capabilityHelpers.isBeamAngle(cap) && cap.angle[0].number < cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `small` && cap.parameter[1].keyword === `big`),
    BigToSmall: cap => (capabilityHelpers.isBeamAngle(cap) && cap.angle[0].number > cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `big` && cap.parameter[1].keyword === `small`)
  };

  for (const presetName of Object.keys(capabilityPresets)) {
    const preset = capabilityPresets[presetName];
    if (typeof preset === `function`) {
      capabilityPresets[presetName] = {
        handler: preset,
        res1: cap => null,
        res2: cap => null
      };
    }
  }

  const presetName = Object.keys(capabilityPresets).find(
    presetName => capabilityPresets[presetName].handler(capability)
  );

  if (!presetName) {
    return null;
  }

  return {
    presetName,
    res1: capabilityPresets[presetName].res1(capability),
    res2: capabilityPresets[presetName].res2(capability)
  };


  /**
   * @param {!string} shutterEffect The shutter effect to create the preset for.
   * @param {!boolean} isStep Whether the preset shall only match step capabilities.
   * @returns {!object} The generated preset with handler, res1 and res2 generation.
   */
  function getStrobeFrequencyPreset(shutterEffect, isStep) {
    return {
      handler: cap => capabilityHelpers.isShutterEffect(cap, shutterEffect) && capabilityHelpers.hasFrequency(cap) && (!isStep || cap.isStep),
      res1: cap => getFrequencyInHertz(cap.speed[0]),
      res2: cap => (isStep ? null : getFrequencyInHertz(cap.speed[1]))
    };
  }

  /**
   * @param {!Entity} entity The speed Entity object.
   * @returns {?number} The frequency in Hertz, or null, if the entity's unit is not convertable to Hertz.
   */
  function getFrequencyInHertz(entity) {
    if (entity.unit === `Hz`) {
      return entity.number;
    }

    if (entity.unit === `bpm`) {
      return entity.number / 60;
    }

    return null;
  }
}

/**
 * @param {!object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {!Mode} mode The OFL mode object.
 */
function addMode(xml, mode) {
  const xmlMode = xml.element({
    Mode: {
      '@Name': mode.name
    }
  });

  const hasPanTiltInfinite = mode.physical !== null && (
    mode.physical.focusPanMax === Number.POSITIVE_INFINITY ||
    mode.physical.focusTiltMax === Number.POSITIVE_INFINITY
  );

  if (mode.physicalOverride !== null || hasPanTiltInfinite) {
    addPhysical(xmlMode, mode.physical, hasPanTiltInfinite ? mode : null);
  }

  mode.channels.forEach((channel, index) => {
    if (channel instanceof MatrixChannel) {
      channel = channel.wrappedChannel;
    }

    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;

      if (channel instanceof MatrixChannel) {
        channel = channel.wrappedChannel;
      }
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
 * @param {!object} xmlParentNode The xmlbuilder object where <Physical> should be added (<FixtureDefinition> or <Mode>).
 * @param {!Physical} physical The OFL physical object.
 * @param {?Mode} mode The OFL mode object this physical data section belongs to. Only provide this if panMax and tiltMax should be read from this mode's Pan / Tilt channels.
 */
function addPhysical(xmlParentNode, physical, mode) {
  const xmlPhysical = xmlParentNode.element({
    Physical: {
      Bulb: {
        '@Type': physical.bulbType || `Other`,
        '@Lumens': physical.bulbLumens || 0,
        '@ColourTemperature': physical.bulbColorTemperature || 0
      },
      Dimensions: {
        '@Weight': physical.weight || 0,
        '@Width': Math.round(physical.width) || 0,
        '@Height': Math.round(physical.height) || 0,
        '@Depth': Math.round(physical.depth) || 0
      },
      Lens: {
        '@Name': physical.lensName || `Other`,
        '@DegreesMin': physical.lensDegreesMin || 0,
        '@DegreesMax': physical.lensDegreesMax || 0
      },
      Focus: {
        '@Type': physical.focusType || `Fixed`,
        '@PanMax': getPanTiltMax(`Pan`),
        '@TiltMax': getPanTiltMax(`Tilt`)
      }
    }
  });

  if (physical.DMXconnector !== null || physical.power !== null) {
    xmlPhysical.element({
      Technical: {
        '@DmxConnector': physical.DMXconnector || `Other`,
        '@PowerConsumption': Math.round(physical.power) || 0
      }
    });
  }

  /**
   * @param {'Pan'|'Tilt'} panOrTilt Whether to check for panMax or tiltMax.
   * @returns {!number} The rounded maximum; 9999 for infinite and 0 as default.
   */
  function getPanTiltMax(panOrTilt) {
    const panTiltMax = physical[`focus${panOrTilt}Max`];

    if (panTiltMax === Number.POSITIVE_INFINITY) {
      try {
        const panTiltChannel = mode.channels.find(
          ch => `capabilities` in ch && ch.capabilities.length === 1 &&
            ch.capabilities[0].type === panOrTilt && ch.capabilities[0].angle[0].unit === `deg`
        );

        return Math.max(
          panTiltChannel.capabilities[0].angle[0].number,
          panTiltChannel.capabilities[0].angle[1].number
        );
      }
      catch (err) {
        return 9999;
      }
    }

    if (panTiltMax !== null) {
      return Math.round(panTiltMax);
    }

    return 0;
  }
}

/**
 * Adds Head tags for all used pixels in the given mode, ordered by XYZ direction (pixel groups by appearence in JSON).
 * @param {!XMLElement} xmlMode The Mode tag to which the Head tags should be added
 * @param {!Mode} mode The fixture's mode whose pixels should be determined.
 */
function addHeads(xmlMode, mode) {
  const hasMatrixChannels = mode.channels.some(
    ch => ch instanceof MatrixChannel || (ch instanceof SwitchingChannel && ch.defaultChannel instanceof MatrixChannel)
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
   * @param {AbstractChannel|MatrixChannel} channel A channel from a mode's channel list.
   * @param {!string} pixelKey The pixel to check for.
   * @returns {boolean} Whether the given channel controls the given pixel key, either directly or as part of a pixel group.
   */
  function controlsPixelKey(channel, pixelKey) {
    if (channel instanceof SwitchingChannel) {
      return controlsPixelKey(channel.defaultChannel, pixelKey);
    }

    if (channel instanceof MatrixChannel) {
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
 * @param {!Fixture} fixture The Fixture instance whose QLC+ type has to be determined.
 * @returns {!string} The first of the fixture's categories that is supported by QLC+, defaults to 'Other'.
 */
function getFixtureType(fixture) {
  const ignoredCats = [`Blinder`, `Matrix`];

  for (const category of fixture.categories) {
    if (ignoredCats.includes(category)) {
      continue;
    }
    return category;
  }

  return `Other`;
}

/**
 * Converts a channel's type into a valid QLC+ channel type.
 * @param {!string} type Our own OFL channel type.
 * @returns {!string} The corresponding QLC+ channel type.
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
