/**
 * @fileoverview Channel and capability presets, together with functions to export or import them.
 */


// ########## Helper functions ##########

const isIncreasingSpeed = cap => cap.speed !== null && Math.abs(cap.speed[0].number) < Math.abs(cap.speed[1].number);
const isDecreasingSpeed = cap => cap.speed !== null && Math.abs(cap.speed[0].number) > Math.abs(cap.speed[1].number);
const isStopped = cap => cap.speed !== null && cap.speed[0].number === 0 && cap.speed[1].number === 0;
const isIncreasingDuration = cap => cap.duration !== null && Math.abs(cap.duration[0].number) < Math.abs(cap.duration[1].number);
const isDecreasingDuration = cap => cap.duration !== null && Math.abs(cap.duration[0].number) > Math.abs(cap.duration[1].number);
const isColorIntensity = (cap, color) => cap.type === `ColorIntensity` && cap.color === color;
const isShutterEffect = (cap, shutterEffect) => cap.type === `ShutterStrobe` && cap.shutterEffect === shutterEffect;
const hasFrequency = cap => cap.speed !== null && (cap.speed[0].unit === `Hz` || cap.speed[0].unit === `bpm`);
const isRotationSpeed = cap => (cap.type.endsWith(`Rotation`) || [`PanContinuous`, `TiltContinuous`, `Prism`].includes(cap.type)) && cap.speed !== null;
const isRotationAngle = cap => (cap.type.endsWith(`Rotation`) || [`Pan`, `Tilt`, `Prism`].includes(cap.type)) && cap.angle !== null;
const isBeamAngle = cap => (cap.type === `BeamAngle` || cap.type === `Zoom`) && cap.angle !== null;

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



// ########## Channel presets ##########

const channelPresets = {
  IntensityMasterDimmer: {
    isApplicable: cap => false
  },
  IntensityDimmer: {
    isApplicable: cap => cap.type === `Intensity` && cap.brightness[0].number < cap.brightness[1].number
  },

  IntensityRed: {
    isApplicable: cap => isColorIntensity(cap, `Red`)
  },
  IntensityGreen: {
    isApplicable: cap => isColorIntensity(cap, `Green`)
  },
  IntensityBlue: {
    isApplicable: cap => isColorIntensity(cap, `Blue`)
  },
  IntensityCyan: {
    isApplicable: cap => isColorIntensity(cap, `Cyan`)
  },
  IntensityMagenta: {
    isApplicable: cap => isColorIntensity(cap, `Magenta`)
  },
  IntensityYellow: {
    isApplicable: cap => isColorIntensity(cap, `Yellow`)
  },
  IntensityAmber: {
    isApplicable: cap => isColorIntensity(cap, `Amber`)
  },
  IntensityWhite: {
    isApplicable: cap => isColorIntensity(cap, `White`) || isColorIntensity(cap, `Warm White`) || isColorIntensity(cap, `Cold White`)
  },
  IntensityUV: {
    isApplicable: cap => isColorIntensity(cap, `UV`)
  },
  IntensityIndigo: {
    isApplicable: cap => isColorIntensity(cap, `Indigo`)
  },
  IntensityLime: {
    isApplicable: cap => isColorIntensity(cap, `Lime`)
  },

  IntensityHue: {
    isApplicable: cap => false
  },
  IntensitySaturation: {
    isApplicable: cap => false
  },
  IntensityLightness: {
    isApplicable: cap => false
  },
  IntensityValue: {
    isApplicable: cap => false
  },

  PositionPan: {
    isApplicable: cap => cap.type === `Pan`
  },
  PositionTilt: {
    isApplicable: cap => cap.type === `Tilt`
  },
  PositionXAxis: {
    isApplicable: cap => false // TODO export this with BeamPosition capability type
  },
  PositionYAxis: {
    isApplicable: cap => false // TODO export this with BeamPosition capability type
  },
  SpeedPanSlowFast: {
    isApplicable: cap => cap.type === `PanContinuous` && isIncreasingSpeed(cap)
  },
  SpeedPanFastSlow: {
    isApplicable: cap => cap.type === `PanContinuous` && isDecreasingSpeed(cap)
  },
  SpeedTiltSlowFast: {
    isApplicable: cap => cap.type === `TiltContinuous` && isIncreasingSpeed(cap)
  },
  SpeedTiltFastSlow: {
    isApplicable: cap => cap.type === `TiltContinuous` && isDecreasingSpeed(cap)
  },
  SpeedPanTiltSlowFast: {
    isApplicable: cap => cap.type === `PanTiltSpeed` && (isIncreasingSpeed(cap) || isDecreasingDuration(cap))
  },
  SpeedPanTiltFastSlow: {
    isApplicable: cap => cap.type === `PanTiltSpeed` && (isDecreasingSpeed(cap) || isIncreasingDuration(cap))
  },

  ColorMacro: {
    isApplicable: cap => cap.type === `ColorPreset` || (cap.type === `WheelSlot` && cap.isSlotType(`Color`))
  },
  ColorWheel: {
    isApplicable: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Color`
  },
  ColorRGBMixer: {
    isApplicable: cap => false
  },
  ColorCTOMixer: {
    isApplicable: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number < 0
  },
  ColorCTBMixer: {
    isApplicable: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number > 0
  },
  ColorCTCMixer: {
    isApplicable: cap => cap.type === `ColorTemperature`
  },

  GoboWheel: {
    isApplicable: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Gobo`
  },
  GoboIndex: {
    isApplicable: cap => cap.type === `WheelSlotRotation` && cap.wheels[0].type === `Gobo`
  },

  ShutterStrobeSlowFast: {
    isApplicable: cap => cap.type === `ShutterStrobe` && isIncreasingSpeed(cap)
  },
  ShutterStrobeFastSlow: {
    isApplicable: cap => cap.type === `ShutterStrobe` && isDecreasingSpeed(cap)
  },
  ShutterIrisMinToMax: {
    isApplicable: cap => cap.type === `Iris` && cap.openPercent[0].number < cap.openPercent[1].number
  },
  ShutterIrisMaxToMin: {
    isApplicable: cap => cap.type === `Iris` && cap.openPercent[0].number > cap.openPercent[1].number
  },

  BeamFocusNearFar: {
    isApplicable: cap => cap.type === `Focus` && cap.distance[0].number < cap.distance[1].number
  },
  BeamFocusFarNear: {
    isApplicable: cap => cap.type === `Focus` && cap.distance[0].number > cap.distance[1].number
  },
  BeamZoomSmallBig: {
    isApplicable: cap => cap.type === `Zoom` && cap.angle[0].number < cap.angle[1].number
  },
  BeamZoomBigSmall: {
    isApplicable: cap => cap.type === `Zoom` && cap.angle[0].number > cap.angle[1].number
  },
  PrismRotationSlowFast: {
    isApplicable: cap => cap.type === `PrismRotation` && isIncreasingSpeed(cap)
  },
  PrismRotationFastSlow: {
    isApplicable: cap => cap.type === `PrismRotation` && isDecreasingSpeed(cap)
  },

  NoFunction: {
    isApplicable: cap => cap.type === `NoFunction`
  }
};

/**
 * @param {CoarseChannel} channel The OFL channel object.
 * @returns {string|null} The QLC+ channel preset name or null, if there is no suitable one.
 */
function getChannelPreset(channel) {
  if (channel.capabilities.length > 1) {
    return null;
  }

  return Object.keys(channelPresets).find(
    preset => channelPresets[preset].isApplicable(channel.capabilities[0])
  ) || null;
}



// ########## Fine channel presets ##########

const fineChannelPresets = {
  IntensityMasterDimmerFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityMasterDimmer`
  },
  IntensityDimmerFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityDimmer`
  },

  IntensityRedFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityRed`
  },
  IntensityGreenFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityGreen`
  },
  IntensityBlueFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityBlue`
  },
  IntensityCyanFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityCyan`
  },
  IntensityMagentaFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityMagenta`
  },
  IntensityYellowFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityYellow`
  },
  IntensityAmberFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityAmber`
  },
  IntensityWhiteFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityWhite`
  },
  IntensityUVFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityUV`
  },
  IntensityIndigoFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityIndigo`
  },
  IntensityLimeFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityLime`
  },

  IntensityHueFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityHue`
  },
  IntensitySaturationFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensitySaturation`
  },
  IntensityLightnessFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityLightness`
  },
  IntensityValueFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityValue`
  },

  PositionPanFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `PositionPan`
  },
  PositionTiltFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `PositionTilt`
  },

  ColorWheelFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.capabilities.some(
      cap => [`WheelSlot`, `WheelRotation`].includes(cap.type)
    ) && coarseChannel.capabilities.every(
      cap => [`WheelSlot`, `WheelShake`, `WheelSlotRotation`, `WheelRotation`, `Effect`, `NoFunction`].includes(cap.type) &&
        (cap.wheels.length === 0 || cap.wheels[0].type === `Color`)
    )
  },
  GoboWheelFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.capabilities.some(
      cap => [`WheelSlot`, `WheelRotation`].includes(cap.type)
    ) && coarseChannel.capabilities.every(
      cap => [`WheelSlot`, `WheelShake`, `WheelSlotRotation`, `WheelRotation`, `Effect`, `NoFunction`].includes(cap.type) &&
        (cap.wheels.length === 0 || cap.wheels[0].type === `Gobo`)
    )
  },
  GoboIndexFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.capabilities.every(
      cap => cap.type === `WheelSlotRotation` && cap.wheels[0].type === `Gobo`
    )
  },

  ShutterIrisFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.type === `Iris`
  },
  BeamFocusFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.type === `Focus`
  },
  BeamZoomFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.type === `Zoom`
  }
};

/**
 * @param {FineChannel} fineChannel The OFL fine channel object.
 * @returns {string|null} The QLC+ channel preset name or null, if there is no suitable one.
 */
function getFineChannelPreset(fineChannel) {
  const coarseChannel = fineChannel.coarseChannel;
  const coarseChannelPreset = getChannelPreset(coarseChannel);

  return Object.keys(fineChannelPresets).find(
    fineChannelPreset => fineChannelPresets[fineChannelPreset].isApplicable({
      coarseChannel,
      coarseChannelPreset
    })
  ) || null;
}



// ########## Capability presets ##########

const capabilityPresets = {

  // shutter capabilities

  ShutterOpen: {
    isApplicable: cap => isShutterEffect(cap, `Open`)
  },
  ShutterClose: {
    isApplicable: cap => isShutterEffect(cap, `Closed`)
  },


  // strobe capabilities with specified frequency

  StrobeFrequency: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && hasFrequency(cap) && cap.isStep,
    res1: cap => getFrequencyInHertz(cap.speed[0])
  },
  StrobeFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && hasFrequency(cap),
    res1: cap => getFrequencyInHertz(cap.speed[0]),
    res2: cap => getFrequencyInHertz(cap.speed[1])
  },
  PulseFrequency: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && hasFrequency(cap) && cap.isStep,
    res1: cap => getFrequencyInHertz(cap.speed[0])
  },
  PulseFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && hasFrequency(cap),
    res1: cap => getFrequencyInHertz(cap.speed[0]),
    res2: cap => getFrequencyInHertz(cap.speed[1])
  },
  RampUpFrequency: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && hasFrequency(cap) && cap.isStep,
    res1: cap => getFrequencyInHertz(cap.speed[0])
  },
  RampUpFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && hasFrequency(cap),
    res1: cap => getFrequencyInHertz(cap.speed[0]),
    res2: cap => getFrequencyInHertz(cap.speed[1])
  },
  RampDownFrequency: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && hasFrequency(cap) && cap.isStep,
    res1: cap => getFrequencyInHertz(cap.speed[0])
  },
  RampDownFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && hasFrequency(cap),
    res1: cap => getFrequencyInHertz(cap.speed[0]),
    res2: cap => getFrequencyInHertz(cap.speed[1])
  },


  // other strobe capabilities

  StrobeRandomSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && cap.randomTiming && isIncreasingSpeed(cap)
  },
  StrobeRandomFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && cap.randomTiming && isDecreasingSpeed(cap)
  },
  StrobeRandom: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && cap.randomTiming
  },
  StrobeSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && isIncreasingSpeed(cap)
  },
  StrobeFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && isDecreasingSpeed(cap)
  },
  PulseSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && isIncreasingSpeed(cap)
  },
  PulseFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && isDecreasingSpeed(cap)
  },
  RampUpSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && isIncreasingSpeed(cap)
  },
  RampUpFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && isDecreasingSpeed(cap)
  },
  RampDownSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && isIncreasingSpeed(cap)
  },
  RampDownFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && isDecreasingSpeed(cap)
  },


  // color capabilities

  ColorMacro: {
    isApplicable: cap => (cap.type === `ColorPreset` || cap.isSlotType(`Color`)) && cap.colors !== null && cap.colors.allColors.length === 1,
    res1: cap => cap.colors.allColors[0]
  },
  ColorDoubleMacro: {
    isApplicable: cap => (cap.type === `ColorPreset` || cap.isSlotType(`Color`)) && cap.colors !== null && cap.colors.allColors.length === 2,
    res1: cap => cap.colors.allColors[0],
    res2: cap => cap.colors.allColors[1]
  },
  ColorWheelIndex: {
    isApplicable: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Color` && isRotationAngle(cap)
  },


  // gobo capabilities

  // TODO: export a gobo image as res1
  GoboShakeMacro: {
    isApplicable: cap => cap.type === `WheelShake` && (cap.isSlotType(/Gobo|Iris|Frost/) || cap.isSlotType(`Open`)),
    res1: cap => (cap.isSlotType(`Open`) ? `Others/open.svg` : null)
  },
  GoboMacro: {
    isApplicable: cap => cap.isSlotType(/Gobo|Iris|Frost/) || cap.isSlotType(`Open`),
    res1: cap => (cap.isSlotType(`Open`) ? `Others/open.svg` : null)
  },


  // prism capabilities

  // TODO: export the number of prism facets as res1 for Prism capabilities
  PrismEffectOn: {
    isApplicable: cap => cap.type === `Prism` || (cap.type === `WheelSlot` && cap.isSlotType(`Prism`)),
    res1: cap => (cap.wheelSlot && cap.slotNumber[0].number === cap.slotNumber[1].number && cap.wheelSlot[0].facets)
  },
  PrismEffectOff: {
    isApplicable: cap => cap.type === `NoFunction` && cap._channel.type === `Prism`
  },


  // rotation capabilities

  RotationClockwiseSlowToFast: {
    isApplicable: cap => isRotationSpeed(cap) && isIncreasingSpeed(cap) && cap.speed[0].number > 0
  },
  RotationClockwiseFastToSlow: {
    isApplicable: cap => isRotationSpeed(cap) && isDecreasingSpeed(cap) && cap.speed[1].number > 0
  },
  RotationClockwise: {
    isApplicable: cap => isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number > 0
  },
  RotationStop: {
    isApplicable: cap => isRotationSpeed(cap) && isStopped(cap)
  },
  RotationCounterClockwiseSlowToFast: {
    isApplicable: cap => isRotationSpeed(cap) && isIncreasingSpeed(cap) && cap.speed[0].number < 0
  },
  RotationCounterClockwiseFastToSlow: {
    isApplicable: cap => isRotationSpeed(cap) && isDecreasingSpeed(cap) && cap.speed[1].number < 0
  },
  RotationCounterClockwise: {
    isApplicable: cap => isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number < 0
  },
  RotationIndexed: {
    isApplicable: cap => isRotationAngle(cap)
  },


  // generic / other capabilities

  GenericPicture: {
    isApplicable: cap => cap.effectPreset === `ColorFade` && !isStopped(cap),
    res1: cap => `Others/rainbow.png`
  },
  SlowToFast: {
    isApplicable: cap => isIncreasingSpeed(cap)
  },
  FastToSlow: {
    isApplicable: cap => isDecreasingSpeed(cap)
  },
  NearToFar: {
    isApplicable: cap => cap.distance !== null && cap.distance[0].number < cap.distance[1].number
  },
  FarToNear: {
    isApplicable: cap => cap.distance !== null && cap.distance[0].number > cap.distance[1].number
  },
  SmallToBig: {
    isApplicable: cap => (isBeamAngle(cap) && cap.angle[0].number < cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `small` && cap.parameter[1].keyword === `big`)
  },
  BigToSmall: {
    isApplicable: cap => (isBeamAngle(cap) && cap.angle[0].number > cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `big` && cap.parameter[1].keyword === `small`)
  }
};

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
  const presetName = Object.keys(capabilityPresets).find(
    presetName => capabilityPresets[presetName].isApplicable(capability)
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
}


module.exports = {
  channelPresets,
  getChannelPreset,

  fineChannelPresets,
  getFineChannelPreset,

  capabilityPresets,
  getCapabilityPreset
};
