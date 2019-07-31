/**
 * @fileoverview Channel and capability presets, together with functions to export or import them.
 */


// ########## Helper functions for export ##########

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



// ########## Helper functions for import ##########

const importHelpers = {
  getColorIntensityCap: color => ({
    type: `ColorIntensity`,
    color
  }),

  getPanTiltCap: (panOrTilt, maxValue) => {
    const cap = {
      type: panOrTilt,
      angleStart: `0deg`,
      angleEnd: `${maxValue}deg`
    };

    if (maxValue === 0) {
      cap.angleStart = `0%`;
      cap.angleEnd = `100%`;
      cap.helpWanted = `Can you provide exact angles?`;
    }

    return cap;
  },

  getShutterStrobeCap: (shutterEffect, speedStart, speedEnd, randomTiming) => {
    const cap = {
      type: `ShutterStrobe`,
      shutterEffect
    };

    if (speedEnd) {
      cap.speedStart = speedStart;
      cap.speedEnd = speedEnd;
    }
    else if (speedStart) {
      cap.speed = speedStart;
    }

    if (randomTiming) {
      cap.randomTiming = true;
    }

    return cap;
  },

  getRotationCapType: ({ channelName, channelType }) => {
    if ([`Pan`, `Tilt`].includes(channelType)) {
      return `${channelType}Continuous`;
    }

    if ([`Colour`, `Gobo`].includes(channelType) || /\bgobo\b/i.test(channelName)) {
      return /wheel\b/i.test(channelName) ? `WheelRotation` : `WheelSlotRotation`;
    }

    if (channelType === `Prism`) {
      return `PrismRotation`;
    }

    return `Rotation`;
  },

  getRotationSpeedCap: (capData, speedStart, speedEnd) => {
    const cap = {
      type: importHelpers.getRotationCapType(capData)
    };

    if (cap.type.startsWith(`Wheel`) && !capData.channelNameInWheels) {
      cap.wheel = ``;
    }

    if (speedEnd) {
      cap.speedStart = speedStart;
      cap.speedEnd = speedEnd;
    }
    else if (speedStart) {
      cap.speed = speedStart;
    }

    return cap;
  },

  /**
   * Try to guess speedStart / speedEnd from the capability name and set them
   * to the capability. It may also set cap.type to "Rotation".
   * @param {string} capabilityName The capability name to extract information from.
   * @param {object} cap The OFL capability object to add found properties to.
   * @returns {string} The rest of the capabilityName.
   */
  getSpeedGuessedComment(capabilityName, cap) {
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
};



// ########## Channel presets ##########

const channelPresets = {
  IntensityMasterDimmer: {
    isApplicable: cap => false,
    importCapability: () => ({ type: `Intensity` })
  },
  IntensityDimmer: {
    isApplicable: cap => cap.type === `Intensity` && cap.brightness[0].number < cap.brightness[1].number,
    importCapability: () => ({ type: `Intensity` })
  },

  IntensityRed: {
    isApplicable: cap => isColorIntensity(cap, `Red`),
    importCapability: () => importHelpers.getColorIntensityCap(`Red`)
  },
  IntensityGreen: {
    isApplicable: cap => isColorIntensity(cap, `Green`),
    importCapability: () => importHelpers.getColorIntensityCap(`Green`)
  },
  IntensityBlue: {
    isApplicable: cap => isColorIntensity(cap, `Blue`),
    importCapability: () => importHelpers.getColorIntensityCap(`Blue`)
  },
  IntensityCyan: {
    isApplicable: cap => isColorIntensity(cap, `Cyan`),
    importCapability: () => importHelpers.getColorIntensityCap(`Cyan`)
  },
  IntensityMagenta: {
    isApplicable: cap => isColorIntensity(cap, `Magenta`),
    importCapability: () => importHelpers.getColorIntensityCap(`Magenta`)
  },
  IntensityYellow: {
    isApplicable: cap => isColorIntensity(cap, `Yellow`),
    importCapability: () => importHelpers.getColorIntensityCap(`Yellow`)
  },
  IntensityAmber: {
    isApplicable: cap => isColorIntensity(cap, `Amber`),
    importCapability: () => importHelpers.getColorIntensityCap(`Amber`)
  },
  IntensityWhite: {
    isApplicable: cap => isColorIntensity(cap, `White`) || isColorIntensity(cap, `Warm White`) || isColorIntensity(cap, `Cold White`),
    importCapability: () => importHelpers.getColorIntensityCap(`White`)
  },
  IntensityUV: {
    isApplicable: cap => isColorIntensity(cap, `UV`),
    importCapability: () => importHelpers.getColorIntensityCap(`UV`)
  },
  IntensityIndigo: {
    isApplicable: cap => isColorIntensity(cap, `Indigo`),
    importCapability: () => importHelpers.getColorIntensityCap(`Indigo`)
  },
  IntensityLime: {
    isApplicable: cap => isColorIntensity(cap, `Lime`),
    importCapability: () => importHelpers.getColorIntensityCap(`Lime`)
  },

  IntensityHue: {
    isApplicable: cap => false,
    importCapability: () => ({ type: `Generic` })
  },
  IntensitySaturation: {
    isApplicable: cap => false,
    importCapability: () => ({ type: `Generic` })
  },
  IntensityLightness: {
    isApplicable: cap => false,
    importCapability: () => ({ type: `Generic` })
  },
  IntensityValue: {
    isApplicable: cap => false,
    importCapability: () => ({ type: `Generic` })
  },

  PositionPan: {
    isApplicable: cap => cap.type === `Pan`,
    importCapability: ({ panMax }) => importHelpers.getPanTiltCap(`Pan`, panMax)
  },
  PositionTilt: {
    isApplicable: cap => cap.type === `Tilt`,
    importCapability: ({ tiltMax }) => importHelpers.getPanTiltCap(`Tilt`, tiltMax)
  },
  PositionXAxis: {
    isApplicable: cap => false, // TODO export this with BeamPosition capability type
    importCapability: () => ({
      type: `BeamPosition`,
      horizontalAngleStart: `left`,
      horizontalAngleEnd: `right`,
      helpWanted: `Is this the correct direction? Can you provide exact angles?`
    })
  },
  PositionYAxis: {
    isApplicable: cap => false, // TODO export this with BeamPosition capability type
    importCapability: () => ({
      type: `BeamPosition`,
      verticalAngleStart: `top`,
      verticalAngleEnd: `bottom`,
      helpWanted: `Is this the correct direction? Can you provide exact angles?`
    })
  },
  SpeedPanSlowFast: {
    isApplicable: cap => cap.type === `PanContinuous` && isIncreasingSpeed(cap),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `slow`,
      speedEnd: `fast`,
      comment: `only Pan`
    })
  },
  SpeedPanFastSlow: {
    isApplicable: cap => cap.type === `PanContinuous` && isDecreasingSpeed(cap),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `fast`,
      speedEnd: `slow`,
      comment: `only Pan`
    })
  },
  SpeedTiltSlowFast: {
    isApplicable: cap => cap.type === `TiltContinuous` && isIncreasingSpeed(cap),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `slow`,
      speedEnd: `fast`,
      comment: `only Tilt`
    })
  },
  SpeedTiltFastSlow: {
    isApplicable: cap => cap.type === `TiltContinuous` && isDecreasingSpeed(cap),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `fast`,
      speedEnd: `slow`,
      comment: `only Tilt`
    })
  },
  SpeedPanTiltSlowFast: {
    isApplicable: cap => cap.type === `PanTiltSpeed` && (isIncreasingSpeed(cap) || isDecreasingDuration(cap)),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `slow`,
      speedEnd: `fast`
    })
  },
  SpeedPanTiltFastSlow: {
    isApplicable: cap => cap.type === `PanTiltSpeed` && (isDecreasingSpeed(cap) || isIncreasingDuration(cap)),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `fast`,
      speedEnd: `slow`
    })
  },

  ColorMacro: {
    isApplicable: cap => cap.type === `ColorPreset` || (cap.type === `WheelSlot` && cap.isSlotType(`Color`)),
    importCapability: () => ({
      type: `ColorPreset`,
      helpWanted: `Which color can be selected at which DMX values?`
    })
  },
  ColorWheel: {
    isApplicable: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Color`,
    importCapability: () => ({
      type: `WheelSlot`,
      slotNumber: 1,
      helpWanted: `Which color can be selected at which DMX values?`
    })
  },
  ColorRGBMixer: {
    isApplicable: cap => false,
    importCapability: () => ({
    // basically this is also Hue
      type: `Generic`
    })
  },
  ColorCTOMixer: {
    isApplicable: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number < 0,
    importCapability: () => ({
      type: `ColorTemperature`,
      colorTemperatureStart: `default`,
      colorTemperatureEnd: `warm`,
      helpWanted: `Can you provide exact color temperature values in Kelvin?`
    })
  },
  ColorCTBMixer: {
    isApplicable: cap => cap.type === `ColorTemperature` && cap.colorTemperature[0].number === 0 && cap.colorTemperature[1].number > 0,
    importCapability: () => ({
      type: `ColorTemperature`,
      colorTemperatureStart: `default`,
      colorTemperatureEnd: `cold`,
      helpWanted: `Can you provide exact color temperature values in Kelvin?`
    })
  },
  ColorCTCMixer: {
    isApplicable: cap => cap.type === `ColorTemperature`,
    importCapability: () => ({
      type: `ColorTemperature`,
      colorTemperatureStart: `cold`,
      colorTemperatureEnd: `warm`,
      helpWanted: `Is this the correct direction? Can you provide exact color temperature values in Kelvin?`
    })
  },

  GoboWheel: {
    isApplicable: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Gobo`,
    importCapability: () => ({
      type: `WheelSlot`,
      slotNumber: 1,
      helpWanted: `Which gobo can be selected at which DMX values?`
    })
  },
  GoboIndex: {
    isApplicable: cap => cap.type === `WheelSlotRotation` && cap.wheels[0].type === `Gobo`,
    importCapability: () => ({
      type: `WheelRotation`,
      angleStart: `0deg`,
      angleEnd: `360deg`,
      helpWanted: `Are these the correct angles?`
    })
  },

  ShutterStrobeSlowFast: {
    isApplicable: cap => cap.type === `ShutterStrobe` && isIncreasingSpeed(cap),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Strobe`,
      speedStart: `slow`,
      speedEnd: `fast`,
      helpWanted: `At which DMX values is strobe disabled?`
    })
  },
  ShutterStrobeFastSlow: {
    isApplicable: cap => cap.type === `ShutterStrobe` && isDecreasingSpeed(cap),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Strobe`,
      speedStart: `fast`,
      speedEnd: `slow`,
      helpWanted: `At which DMX values is strobe disabled?`
    })
  },
  ShutterIrisMinToMax: {
    isApplicable: cap => cap.type === `Iris` && cap.openPercent[0].number < cap.openPercent[1].number,
    importCapability: () => ({
      type: `Iris`,
      openPercentStart: `closed`,
      openPercentEnd: `open`
    })
  },
  ShutterIrisMaxToMin: {
    isApplicable: cap => cap.type === `Iris` && cap.openPercent[0].number > cap.openPercent[1].number,
    importCapability: () => ({
      type: `Iris`,
      openPercentStart: `open`,
      openPercentEnd: `closed`
    })
  },

  BeamFocusNearFar: {
    isApplicable: cap => cap.type === `Focus` && cap.distance[0].number < cap.distance[1].number,
    importCapability: () => ({
      type: `Focus`,
      distanceStart: `near`,
      distanceEnd: `far`
    })
  },
  BeamFocusFarNear: {
    isApplicable: cap => cap.type === `Focus` && cap.distance[0].number > cap.distance[1].number,
    importCapability: () => ({
      type: `Focus`,
      distanceStart: `far`,
      distanceEnd: `near`
    })
  },
  BeamZoomSmallBig: {
    isApplicable: cap => cap.type === `Zoom` && cap.angle[0].number < cap.angle[1].number,
    importCapability: () => ({
      type: `Zoom`,
      angleStart: `narrow`,
      angleEnd: `wide`
    })
  },
  BeamZoomBigSmall: {
    isApplicable: cap => cap.type === `Zoom` && cap.angle[0].number > cap.angle[1].number,
    importCapability: () => ({
      type: `Zoom`,
      angleStart: `wide`,
      angleEnd: `narrow`
    })
  },
  PrismRotationSlowFast: {
    isApplicable: cap => cap.type === `PrismRotation` && isIncreasingSpeed(cap),
    importCapability: () => ({
      type: `PrismRotation`,
      speedStart: `slow CW`,
      speedEnd: `fast CW`,
      helpWanted: `Does the prism rotate clockwise or counter-clockwise?`
    })
  },
  PrismRotationFastSlow: {
    isApplicable: cap => cap.type === `PrismRotation` && isDecreasingSpeed(cap),
    importCapability: () => ({
      type: `PrismRotation`,
      speedStart: `fast CW`,
      speedEnd: `slow CW`,
      helpWanted: `Does the prism rotate clockwise or counter-clockwise?`
    })
  },

  NoFunction: {
    isApplicable: cap => cap.type === `NoFunction`,
    importCapability: () => ({ type: `NoFunction` })
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

/**
 * @param {string} preset The channel preset to import.
 * @param {number} panMax The maximum pan angle, or 0.
 * @param {number} tiltMax The maximum tilt angle, or 0.
 * @returns {object} The OFL capability object.
 */
function getCapabilityFromChannelPreset(preset, panMax, tiltMax) {
  if (preset in channelPresets) {
    return channelPresets[preset].importCapability({
      panMax,
      tiltMax
    });
  }

  return {
    type: `Generic`,
    helpWanted: `Unknown QLC+ channel preset ${preset}.`
  };
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
    isApplicable: cap => isShutterEffect(cap, `Open`),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Open`
    })
  },
  ShutterClose: {
    isApplicable: cap => isShutterEffect(cap, `Closed`),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Closed`
    })
  },


  // strobe capabilities with specified frequency

  StrobeFrequency: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && hasFrequency(cap) && cap.isStep,
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`Strobe`, `${res1}Hz`)
  },
  StrobeFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && hasFrequency(cap),
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    exportRes2: cap => getFrequencyInHertz(cap.speed[1]),
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`Strobe`, `${res1}Hz`, `${res2}Hz`)
  },
  PulseFrequency: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && hasFrequency(cap) && cap.isStep,
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`Pulse`, `${res1}Hz`)
  },
  PulseFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && hasFrequency(cap),
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    exportRes2: cap => getFrequencyInHertz(cap.speed[1]),
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`Pulse`, `${res1}Hz`, `${res2}Hz`)
  },
  RampUpFrequency: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && hasFrequency(cap) && cap.isStep,
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`RampUp`, `${res1}Hz`)
  },
  RampUpFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && hasFrequency(cap),
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    exportRes2: cap => getFrequencyInHertz(cap.speed[1]),
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`RampUp`, `${res1}Hz`, `${res2}Hz`)
  },
  RampDownFrequency: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && hasFrequency(cap) && cap.isStep,
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`RampDown`, `${res1}Hz`)
  },
  RampDownFreqRange: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && hasFrequency(cap),
    exportRes1: cap => getFrequencyInHertz(cap.speed[0]),
    exportRes2: cap => getFrequencyInHertz(cap.speed[1]),
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`RampDown`, `${res1}Hz`, `${res2}Hz`)
  },


  // other strobe capabilities

  StrobeRandomSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && cap.randomTiming && isIncreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `slow`, `fast`, true)
  },
  StrobeRandomFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && cap.randomTiming && isDecreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `fast`, `slow`, true)
  },
  StrobeRandom: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && cap.randomTiming,
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, null, null, true)
  },
  StrobeSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && isIncreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `slow`, `fast`)
  },
  StrobeFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `Strobe`) && isDecreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `fast`, `slow`)
  },
  PulseSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && isIncreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`Pulse`, `slow`, `fast`)
  },
  PulseFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `Pulse`) && isDecreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`Pulse`, `fast`, `slow`)
  },
  RampUpSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && isIncreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampUp`, `slow`, `fast`)
  },
  RampUpFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `RampUp`) && isDecreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampUp`, `fast`, `slow`)
  },
  RampDownSlowToFast: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && isIncreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampDown`, `slow`, `fast`)
  },
  RampDownFastToSlow: {
    isApplicable: cap => isShutterEffect(cap, `RampDown`) && isDecreasingSpeed(cap),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampDown`, `fast`, `slow`)
  },


  // color capabilities

  ColorMacro: {
    isApplicable: cap => (cap.type === `ColorPreset` || cap.isSlotType(`Color`)) && cap.colors !== null && cap.colors.allColors.length === 1,
    exportRes1: cap => cap.colors.allColors[0],
    importCapability: capData => capabilityPresets.ColorDoubleMacro.importCapability(capData)
  },
  ColorDoubleMacro: {
    isApplicable: cap => (cap.type === `ColorPreset` || cap.isSlotType(`Color`)) && cap.colors !== null && cap.colors.allColors.length === 2,
    exportRes1: cap => cap.colors.allColors[0],
    exportRes2: cap => cap.colors.allColors[1],
    importCapability: ({ channelName, res1, res2, index }) => {
      if (channelName.match(/wheel\b/i)) {
        return {
          type: `WheelSlot`,
          slotNumber: index + 1
        };
      }

      const colors = [res1];
      if (res2) {
        colors.push(res2);
      }

      return {
        type: `ColorPreset`,
        comment: ``,
        colors
      };
    }
  },
  ColorWheelIndex: {
    isApplicable: cap => cap.type === `WheelRotation` && cap.wheels[0].type === `Color` && isRotationAngle(cap),
    importCapability: () => ({
      type: `WheelRotation`,
      angleStart: `0deg`,
      angleEnd: `360deg`,
      helpWanted: `Are these the correct angles?`
    })
  },


  // gobo capabilities

  // TODO: export a gobo image as res1
  GoboShakeMacro: {
    isApplicable: cap => cap.type === `WheelShake` && (cap.isSlotType(/Gobo|Iris|Frost/) || cap.isSlotType(`Open`)),
    exportRes1: cap => (cap.isSlotType(`Open`) ? `Others/open.svg` : null),
    importCapability: ({ capabilityName, res1, index }) => {
      const cap = {
        type: `WheelShake`,
        slotNumber: index + 1
      };

      const comment = importHelpers.getSpeedGuessedComment(capabilityName, cap);

      if (`speedStart` in cap) {
        cap.shakeSpeedStart = cap.speedStart;
        cap.shakeSpeedEnd = cap.speedEnd;
        delete cap.speedStart;
        delete cap.speedEnd;
      }

      cap.comment = comment;

      return cap;
    }
  },
  GoboMacro: {
    isApplicable: cap => cap.isSlotType(/Gobo|Iris|Frost/) || cap.isSlotType(`Open`),
    exportRes1: cap => (cap.isSlotType(`Open`) ? `Others/open.svg` : null),
    importCapability: ({ res1, index }) => ({
      type: `WheelSlot`,
      slotNumber: index + 1
    })
  },


  // prism capabilities

  // TODO: export the number of prism facets as res1 for Prism capabilities
  PrismEffectOn: {
    isApplicable: cap => cap.type === `Prism` || (cap.type === `WheelSlot` && cap.isSlotType(`Prism`)),
    exportRes1: cap => (cap.wheelSlot && cap.slotNumber[0].number === cap.slotNumber[1].number && cap.wheelSlot[0].facets),
    importCapability: ({ res1 }) => ({
      type: `Prism`,
      comment: res1 ? `${res1}-facet` : ``
    })
  },
  PrismEffectOff: {
    isApplicable: cap => cap.type === `NoFunction` && cap._channel.type === `Prism`,
    importCapability: () => ({
      type: `NoFunction`
    })
  },


  // rotation capabilities

  RotationClockwiseSlowToFast: {
    isApplicable: cap => isRotationSpeed(cap) && isIncreasingSpeed(cap) && cap.speed[0].number > 0,
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `slow CW`, `fast CW`)
  },
  RotationClockwiseFastToSlow: {
    isApplicable: cap => isRotationSpeed(cap) && isDecreasingSpeed(cap) && cap.speed[1].number > 0,
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `fast CW`, `slow CW`)
  },
  RotationClockwise: {
    isApplicable: cap => isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number > 0,
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `fast CW`)
  },
  RotationStop: {
    isApplicable: cap => isRotationSpeed(cap) && isStopped(cap),
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `stop`)
  },
  RotationCounterClockwiseSlowToFast: {
    isApplicable: cap => isRotationSpeed(cap) && isIncreasingSpeed(cap) && cap.speed[0].number < 0,
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `slow CCW`, `fast CCW`)
  },
  RotationCounterClockwiseFastToSlow: {
    isApplicable: cap => isRotationSpeed(cap) && isDecreasingSpeed(cap) && cap.speed[1].number < 0,
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `fast CCW`, `slow CCW`)
  },
  RotationCounterClockwise: {
    isApplicable: cap => isRotationSpeed(cap) && cap.speed[0].number === cap.speed[1].number && cap.speed[0].number < 0,
    importCapability: capData => importHelpers.getRotationSpeedCap(capData, `fast CCW`)
  },
  RotationIndexed: {
    isApplicable: cap => isRotationAngle(cap),
    importCapability: capData => ({
      type: importHelpers.getRotationCapType(capData),
      angleStart: `0deg`,
      angleEnd: `360deg`,
      helpWanted: `Are these the correct angles?`
    })
  },


  // generic / other capabilities

  GenericPicture: {
    isApplicable: cap => cap.effectPreset === `ColorFade` && !isStopped(cap),
    exportRes1: cap => `Others/rainbow.png`,
    importCapability: ({ res1 }) => ({
      type: `Generic`,
      comment: res1
    })
  },
  SlowToFast: {
    isApplicable: cap => isIncreasingSpeed(cap),
    importCapability: () => ({
      type: `Speed`,
      speedStart: `slow`,
      speedEnd: `fast`
    })
  },
  FastToSlow: {
    isApplicable: cap => isDecreasingSpeed(cap),
    importCapability: () => ({
      type: `Speed`,
      speedStart: `fast`,
      speedEnd: `slow`
    })
  },
  NearToFar: {
    isApplicable: cap => cap.distance !== null && cap.distance[0].number < cap.distance[1].number,
    importCapability: () => ({
      type: `Focus`,
      distanceStart: `near`,
      distanceEnd: `far`
    })
  },
  FarToNear: {
    isApplicable: cap => cap.distance !== null && cap.distance[0].number > cap.distance[1].number,
    importCapability: () => ({
      type: `Focus`,
      distanceStart: `far`,
      distanceEnd: `near`
    })
  },
  SmallToBig: {
    isApplicable: cap => (isBeamAngle(cap) && cap.angle[0].number < cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `small` && cap.parameter[1].keyword === `big`),
    importCapability: () => ({
      type: `Iris`,
      openPercentStart: `open`,
      openPercentEnd: `closed`
    })
  },
  BigToSmall: {
    isApplicable: cap => (isBeamAngle(cap) && cap.angle[0].number > cap.angle[1].number) || (cap.parameter !== null && cap.parameter[0].keyword === `big` && cap.parameter[1].keyword === `small`),
    importCapability: () => ({
      type: `Iris`,
      openPercentStart: `closed`,
      openPercentEnd: `open`
    })
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
    res1: `exportRes1` in preset ? preset.exportRes1(capability) : null,
    res2: `exportRes2` in preset ? preset.exportRes2(capability) : null
  };
}

/**
 * @param {string} preset The capability preset to import.
 * @param {object} capData Additional data about capability and channel.
 * @returns {object} The OFL capability object.
 */
function getCapabilityFromCapabilityPreset(preset, capData) {
  if (preset in capabilityPresets) {
    const cap = capabilityPresets[preset].importCapability(capData);

    if (!cap.comment || capData.capabilityName.includes(cap.comment)) {
      cap.comment = capData.capabilityName;
    }
    else {
      cap.comment += ` ${capData.capabilityName}`;
    }

    return cap;
  }

  return {
    type: `Generic`,
    comment: capData.capabilityName,
    helpWanted: `Unknown QLC+ capability preset ${preset}, Res1="${capData.res1}", Res2="${capData.res2}".`
  };
}


module.exports = {
  channelPresets,
  getChannelPreset,
  getCapabilityFromChannelPreset,

  fineChannelPresets,
  getFineChannelPreset,

  capabilityPresets,
  getCapabilityPreset,
  getCapabilityFromCapabilityPreset,

  importHelpers
};
