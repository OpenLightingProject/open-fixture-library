const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  CoarseChannel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
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
  isRotationAngle: cap => (cap.type.endsWith(`Rotation`) || [`Pan`, `Tilt`, `Prism`].includes(cap.type)) && cap.angle !== null,
  isBeamAngle: cap => (cap.type === `BeamAngle` || cap.type === `Zoom`) && cap.angle !== null
};

module.exports.name = `QLC+ 4.12.0`;
module.exports.version = `1.0.1`;

/**
 * @param {array.<Fixture>} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<array.<object>, Error>} The generated files.
*/
module.exports.export = function exportQlcPlus(fixtures, options) {
  const outFiles = fixtures.map(fixture => {
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

    for (const channel of fixture.coarseChannels) {
      addChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      addMode(xml, mode);
    }

    if (fixture.physical !== null) {
      addPhysical(xml, fixture.physical);
    }

    xml.doctype(``);

    return {
      name: sanitize(`${fixture.manufacturer.name}/-${fixture.name}.qxf`).replace(/\s+/g, `-`),
      content: xml.end({
        pretty: true,
        indent: ` `
      }),
      mimetype: `application/x-qlc-fixture`
    };
  });

  return Promise.resolve(outFiles);
};

/**
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {CoarseChannel} channel The OFL channel object.
 */
function addChannel(xml, channel) {
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
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {FineChannel} fineChannel The OFL fine channel object.
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
    }, CoarseChannel.RESOLUTION_8BIT, fineChannel.coarseChannel));

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
      Colour: fineChannel.coarseChannel.color !== null ? fineChannel.coarseChannel.color : `Generic`
    });
  }

  addCapability(xmlFineChannel, new Capability({
    dmxRange: [0, 255],
    type: `Generic`,
    comment: `Fine adjustment for ${fineChannel.coarseChannel.uniqueName}`
  }, CoarseChannel.RESOLUTION_8BIT, fineChannel.coarseChannel));
}

/**
 * @param {CoarseChannel} channel The OFL channel object.
 * @returns {string|null} The QLC+ channel preset name or null, if there is no suitable one.
 */
function getChannelPreset(channel) {
  if (channel.capabilities.length > 1) {
    return null;
  }

  const capability = channel.capabilities[0];

  // TODO: try to also detect the `cap => false` presets
  const channelPresets = {
    IntensityMasterDimmer: cap => false,
    IntensityDimmer: cap => cap.type === `Intensity` && cap.brightness[0].number < cap.brightness[1].number,
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
    PositionTilt: cap => cap.type === `Tilt`,
    PositionXAxis: cap => false,
    PositionYAxis: cap => false,
    SpeedPanSlowFast: cap => cap.type === `PanContinuous` && capabilityHelpers.isIncreasingSpeed(cap),
    SpeedPanFastSlow: cap => cap.type === `PanContinuous` && capabilityHelpers.isDecreasingSpeed(cap),
    SpeedTiltSlowFast: cap => cap.type === `TiltContinuous` && capabilityHelpers.isIncreasingSpeed(cap),
    SpeedTiltFastSlow: cap => cap.type === `TiltContinuous` && capabilityHelpers.isDecreasingSpeed(cap),
    SpeedPanTiltSlowFast: cap => cap.type === `PanTiltSpeed` && (capabilityHelpers.isIncreasingSpeed(cap) || capabilityHelpers.isDecreasingDuration(cap)),
    SpeedPanTiltFastSlow: cap => cap.type === `PanTiltSpeed` && (capabilityHelpers.isDecreasingSpeed(cap) || capabilityHelpers.isIncreasingDuration(cap)),
    ColorMacro: cap => cap.type === `ColorPreset` || (cap.type === `WheelSlot` && cap.wheelSlot.every(slot => slot.type === `Color`)),
    ColorWheel: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Color`,
    ColorRGBMixer: cap => false,
    ColorCTOMixer: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number < 0,
    ColorCTBMixer: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number > 0,
    ColorCTCMixer: cap => cap.type === `ColorTemperature`,
    GoboWheel: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Gobo`,
    GoboIndex: cap => cap.type === `WheelSlotRotation` && cap.wheels[0].type === `Gobo`,
    ShutterStrobeSlowFast: cap => cap.type === `ShutterStrobe` && capabilityHelpers.isIncreasingSpeed(cap),
    ShutterStrobeFastSlow: cap => cap.type === `ShutterStrobe` && capabilityHelpers.isDecreasingSpeed(cap),
    ShutterIrisMinToMax: cap => cap.type === `Iris` && cap.openPercent[0].number < cap.openPercent[1].number,
    ShutterIrisMaxToMin: cap => cap.type === `Iris` && cap.openPercent[0].number > cap.openPercent[1].number,
    BeamFocusNearFar: cap => cap.type === `Focus` && cap.distance[0].number < cap.distance[1].number,
    BeamFocusFarNear: cap => cap.type === `Focus` && cap.distance[0].number > cap.distance[1].number,
    BeamZoomSmallBig: cap => cap.type === `Zoom` && cap.angle[0].number < cap.angle[1].number,
    BeamZoomBigSmall: cap => cap.type === `Zoom` && cap.angle[0].number > cap.angle[1].number,
    PrismRotationSlowFast: cap => cap.type === `PrismRotation` && capabilityHelpers.isIncreasingSpeed(cap),
    PrismRotationFastSlow: cap => cap.type === `PrismRotation` && capabilityHelpers.isDecreasingSpeed(cap),
    NoFunction: cap => cap.type === `NoFunction`
  };

  return Object.keys(channelPresets).find(presetName => channelPresets[presetName](capability)) || null;
}

/**
 * @param {FineChannel} fineChannel The OFL fine channel object.
 * @returns {string|null} The QLC+ channel preset name or null, if there is no suitable one.
 */
function getFineChannelPreset(fineChannel) {
  const coarseChannel = fineChannel.coarseChannel;
  const channelPreset = getChannelPreset(coarseChannel);

  const fineChannelPresets = {
    IntensityMasterDimmerFine: () => channelPreset === `IntensityMasterDimmer`,
    IntensityDimmerFine: () => channelPreset === `IntensityDimmer`,
    IntensityRedFine: () => channelPreset === `IntensityRed`,
    IntensityGreenFine: () => channelPreset === `IntensityGreen`,
    IntensityBlueFine: () => channelPreset === `IntensityBlue`,
    IntensityCyanFine: () => channelPreset === `IntensityCyan`,
    IntensityMagentaFine: () => channelPreset === `IntensityMagenta`,
    IntensityYellowFine: () => channelPreset === `IntensityYellow`,
    IntensityAmberFine: () => channelPreset === `IntensityAmber`,
    IntensityWhiteFine: () => channelPreset === `IntensityWhite`,
    IntensityUVFine: () => channelPreset === `IntensityUV`,
    IntensityIndigoFine: () => channelPreset === `IntensityIndigo`,
    IntensityLimeFine: () => channelPreset === `IntensityLime`,
    IntensityHueFine: () => channelPreset === `IntensityHue`,
    IntensitySaturationFine: () => channelPreset === `IntensitySaturation`,
    IntensityLightnessFine: () => channelPreset === `IntensityLightness`,
    IntensityValueFine: () => channelPreset === `IntensityValue`,
    PositionPanFine: () => channelPreset === `PositionPan`,
    PositionTiltFine: () => channelPreset === `PositionTilt`,

    ColorWheelFine: () => coarseChannel.capabilities.some(
      cap => [`WheelSlot`, `WheelRotation`].includes(cap.type)
    ) && coarseChannel.capabilities.every(
      cap => [`WheelSlot`, `WheelRotation`, `Effect`, `NoFunction`].includes(cap.type) &&
        (cap.wheels.length === 0 || cap.wheels[0].type === `Color`)
    ),
    GoboWheelFine: () => coarseChannel.capabilities.some(
      cap => [`WheelSlot`, `WheelRotation`].includes(cap.type)
    ) && coarseChannel.capabilities.every(
      cap => [`WheelSlot`, `WheelRotation`, `Effect`, `NoFunction`].includes(cap.type) &&
        (cap.wheels.length === 0 || cap.wheels[0].type === `Gobo`)
    ),
    GoboIndexFine: () => coarseChannel.capabilities.every(
      cap => cap.type === `WheelSlotRotation` && cap.wheels[0].type === `Gobo`
    ),

    ShutterIrisFine: () => coarseChannel.type === `Iris`,
    BeamFocusFine: () => coarseChannel.type === `Focus`,
    BeamZoomFine: () => coarseChannel.type === `Zoom`
  };

  // fine channel preset for a group of coarse channels
  return Object.keys(fineChannelPresets).find(
    fineChannelPreset => fineChannelPresets[fineChannelPreset]()
  ) || null;
}

/**
 * @param {object} xmlChannel The xmlbuilder <Channel> object.
 * @param {Capability} cap The OFL capability object.
 */
function addCapability(xmlChannel, cap) {
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
 * @param {object} xmlCapability The xmlbuilder <Capability> object.
 * @param {Capability} cap The OFL capability object.
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
 * @param {object} xmlCapability The xmlbuilder <Capability> object.
 * @param {Capability} cap The OFL capability object.
 * @returns {boolean} True when one or more <Alias> elements were added to the capability, false otherwise.
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
 * @typedef CapabilityPreset
 * @type {object}
 * @property {string} presetName The name of the QLC+ capability preset.
 * @property {string|null} res1 A value for the QLC+ capability element's Res1 attribute, or null if the attribute should not be added.
 * @property {string|null} res2 A value for the QLC+ capability element's Res2 attribute, or null if the attribute should not be added.
 */

/**
 * @param {Capability} capability The OFL capability object.
 * @returns {CapabilityPreset|null} The QLC+ capability preset or null, if there is no suitable one.
 */
function getCapabilityPreset(capability) {
  const capabilityPresets = {
    // shutter capabilities
    ShutterOpen: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Open`)
    },
    ShutterClose: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Closed`)
    },

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
    StrobeRandomSlowToFast: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && cap.randomTiming && capabilityHelpers.isIncreasingSpeed(cap)
    },
    StrobeRandomFastToSlow: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && cap.randomTiming && capabilityHelpers.isDecreasingSpeed(cap)
    },
    StrobeRandom: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && cap.randomTiming
    },
    StrobeSlowToFast: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && capabilityHelpers.isIncreasingSpeed(cap)
    },
    StrobeFastToSlow: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Strobe`) && capabilityHelpers.isDecreasingSpeed(cap)
    },
    PulseSlowToFast: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Pulse`) && capabilityHelpers.isIncreasingSpeed(cap)
    },
    PulseFastToSlow: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `Pulse`) && capabilityHelpers.isDecreasingSpeed(cap)
    },
    RampUpSlowToFast: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `RampUp`) && capabilityHelpers.isIncreasingSpeed(cap)
    },
    RampUpFastToSlow: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `RampUp`) && capabilityHelpers.isDecreasingSpeed(cap)
    },
    RampDownSlowToFast: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `RampDown`) && capabilityHelpers.isIncreasingSpeed(cap)
    },
    RampDownFastToSlow: {
      handler: cap => capabilityHelpers.isShutterEffect(cap, `RampDown`) && capabilityHelpers.isDecreasingSpeed(cap)
    },

    // color capabilities
    ColorMacro: {
      handler: cap => (cap.type === `ColorPreset` || cap.isSlotType(`Color`)) && cap.colors !== null && cap.colors.allColors.length === 1,
      res1: cap => cap.colors.allColors[0]
    },
    ColorDoubleMacro: {
      handler: cap => (cap.type === `ColorPreset` || cap.isSlotType(`Color`)) && cap.colors !== null && cap.colors.allColors.length === 2,
      res1: cap => cap.colors.allColors[0],
      res2: cap => cap.colors.allColors[1]
    },
    ColorWheelIndex: {
      handler: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Color` && capabilityHelpers.isRotationAngle(cap)
    },

    // gobo capabilities
    // TODO: export a gobo image as res1
    GoboShakeMacro: {
      handler: cap => cap.type === `WheelShake` && (cap.isSlotType(/Gobo/) || cap.isSlotType(`Open`)),
      res1: cap => (cap.isSlotType(`Open`) ? `Others/open.svg` : null)
    },
    GoboMacro: {
      handler: cap => cap.isSlotType(/Gobo/) || cap.isSlotType(`Open`),
      res1: cap => (cap.isSlotType(`Open`) ? `Others/open.svg` : null)
    },

    // prism capabilities
    // TODO: export the number of prism facets as res1 for Prism capabilities
    PrismEffectOn: {
      handler: cap => cap.type === `Prism` || (cap.type === `WheelSlot` && cap.wheelSlot.every(slot => slot.type === `Prism`)),
      res1: cap => (cap.wheelSlot && cap.slotNumber[0].number === cap.slotNumber[1].number && cap.wheelSlot[0].facets)
    },
    PrismEffectOff: {
      handler: cap => cap.type === `NoFunction` && cap._channel.type === `Prism`
    },

    // rotation capabilities
    RotationClockwiseSlowToFast: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isIncreasingSpeed(cap) && cap.speed[0].number > 0
    },
    RotationClockwiseFastToSlow: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isDecreasingSpeed(cap) && cap.speed[1].number > 0
    },
    RotationClockwise: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number > 0
    },
    RotationStop: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isStopped(cap)
    },
    RotationCounterClockwiseSlowToFast: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isIncreasingSpeed(cap) && cap.speed[0].number < 0
    },
    RotationCounterClockwiseFastToSlow: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && capabilityHelpers.isDecreasingSpeed(cap) && cap.speed[1].number < 0
    },
    RotationCounterClockwise: {
      handler: cap => capabilityHelpers.isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number < 0
    },
    RotationIndexed: {
      handler: cap => capabilityHelpers.isRotationAngle(cap)
    },

    // generic / other capabilities
    GenericPicture: {
      handler: cap => cap.effectPreset === `ColorFade` && !capabilityHelpers.isStopped(cap),
      res1: cap => `Others/rainbow.png`
    },
    SlowToFast: {
      handler: cap => capabilityHelpers.isIncreasingSpeed(cap)
    },
    FastToSlow: {
      handler: cap => capabilityHelpers.isDecreasingSpeed(cap)
    },
    NearToFar: {
      handler: cap => cap.distance !== null && cap.distance[0].number < cap.distance[1].number
    },
    FarToNear: {
      handler: cap => cap.distance !== null && cap.distance[0].number > cap.distance[1].number
    },
    SmallToBig: {
      handler: cap => (capabilityHelpers.isBeamAngle(cap) && cap.angle[0].number < cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `small` && cap.parameter[1].keyword === `big`)
    },
    BigToSmall: {
      handler: cap => (capabilityHelpers.isBeamAngle(cap) && cap.angle[0].number > cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `big` && cap.parameter[1].keyword === `small`)
    }
  };

  const presetName = Object.keys(capabilityPresets).find(
    presetName => capabilityPresets[presetName].handler(capability)
  );

  if (!presetName) {
    return null;
  }

  const preset = capabilityPresets[presetName];
  return {
    presetName,
    res1: `res1` in preset ? preset.res1(capability) : null,
    res2: `res2` in preset ? preset.res2(capability) : null
  };


  /**
   * @param {string} shutterEffect The shutter effect to create the preset for.
   * @param {boolean} isStep Whether the preset shall only match step capabilities.
   * @returns {object} The generated preset with handler, res1 and res2 generation.
   */
  function getStrobeFrequencyPreset(shutterEffect, isStep) {
    return {
      handler: cap => capabilityHelpers.isShutterEffect(cap, shutterEffect) && capabilityHelpers.hasFrequency(cap) && (!isStep || cap.isStep),
      res1: cap => getFrequencyInHertz(cap.speed[0]),
      res2: cap => (isStep ? null : getFrequencyInHertz(cap.speed[1]))
    };
  }

  /**
   * @param {Entity} entity The speed Entity object.
   * @returns {number|null} The frequency in Hertz, or null, if the entity's unit is not convertable to Hertz.
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
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {Mode} mode The OFL mode object.
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
 * @param {object} xmlParentNode The xmlbuilder object where <Physical> should be added (<FixtureDefinition> or <Mode>).
 * @param {Physical} physical The OFL physical object.
 * @param {Mode|null} mode The OFL mode object this physical data section belongs to. Only provide this if panMax and tiltMax should be read from this mode's Pan / Tilt channels.
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
    // add whitespace
    const connector = physical.DMXconnector === `3.5mm stereo jack` ? `3.5 mm stereo jack` : physical.DMXconnector;

    xmlPhysical.element({
      Technical: {
        '@DmxConnector': connector || `Other`,
        '@PowerConsumption': Math.round(physical.power) || 0
      }
    });
  }

  /**
   * @param {'Pan'|'Tilt'} panOrTilt Whether to check for panMax or tiltMax.
   * @returns {number} The rounded maximum; 9999 for infinite and 0 as default.
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
   * @param {string} pixelKey The pixel to check for.
   * @returns {boolean} Whether the given channel controls the given pixel key, either directly or as part of a pixel group.
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
 * @returns {string} The first of the fixture's categories that is supported by QLC+, defaults to 'Other'.
 */
function getFixtureType(fixture) {
  const ignoredCats = [`Blinder`, `Matrix`, `Pixel Bar`, `Stand`];
  return fixture.categories.find(cat => !ignoredCats.includes(cat)) || `Other`;
}

/**
 * Converts a channel's type into a valid QLC+ channel type.
 * @param {string} type Our own OFL channel type.
 * @returns {string} The corresponding QLC+ channel type.
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
