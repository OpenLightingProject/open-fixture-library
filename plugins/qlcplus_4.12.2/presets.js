/**
 * @fileoverview Channel and capability presets, together with functions to export or import them.
 */

import importJson from '../../lib/import-json.js';

const qlcplusGoboAliasesPromise = importJson(`../../resources/gobos/aliases/qlcplus.json`, import.meta.url);


// ########## Helper functions ##########

export const exportHelpers = {
  isIncreasingSpeed: capability => capability.speed !== null && Math.abs(capability.speed[0].number) < Math.abs(capability.speed[1].number),
  isDecreasingSpeed: capability => capability.speed !== null && Math.abs(capability.speed[0].number) > Math.abs(capability.speed[1].number),
  isStopped: capability => capability.speed !== null && capability.speed[0].number === 0 && capability.speed[1].number === 0,
  isIncreasingDuration: capability => capability.duration !== null && Math.abs(capability.duration[0].number) < Math.abs(capability.duration[1].number),
  isDecreasingDuration: capability => capability.duration !== null && Math.abs(capability.duration[0].number) > Math.abs(capability.duration[1].number),
  isColorIntensity: (capability, color) => capability.type === `ColorIntensity` && capability.color === color,
  isShutterEffect: (capability, shutterEffect) => capability.type === `ShutterStrobe` && capability.shutterEffect === shutterEffect,
  hasFrequency: capability => capability.speed !== null && (capability.speed[0].unit === `Hz` || capability.speed[0].unit === `bpm`),
  isRotationSpeed: capability => (capability.type.endsWith(`Rotation`) || [`PanContinuous`, `TiltContinuous`, `Prism`].includes(capability.type)) && capability.speed !== null,
  isRotationAngle: capability => (capability.type.endsWith(`Rotation`) || [`Pan`, `Tilt`, `Prism`].includes(capability.type)) && capability.angle !== null,
  isBeamAngle: capability => (capability.type === `BeamAngle` || capability.type === `Zoom`) && capability.angle !== null,
  isWheelChannel: channel => channel.capabilities.some(capability => [`WheelSlot`, `WheelRotation`].includes(capability.type)),
  isAllowedInWheels: capability => [`WheelSlot`, `WheelShake`, `WheelSlotRotation`, `WheelRotation`, `Effect`, `NoFunction`].includes(capability.type),
  getGoboResource: async capability => {
    if (capability.isSlotType(`Open`)) {
      return `Others/open.svg`;
    }

    if (capability.wheelSlot !== null && capability.wheelSlot[0] === capability.wheelSlot[1]) {
      const resource = capability.wheelSlot[0].resource;

      if (resource) {
        const qlcplusGoboAliases = await qlcplusGoboAliasesPromise;
        const qlcplusGoboAlias = Object.keys(qlcplusGoboAliases).find(
          alias => qlcplusGoboAliases[alias] === resource.key,
        );

        if (qlcplusGoboAlias) {
          return qlcplusGoboAlias;
        }

        return `ofl/${resource.key}.${resource.imageExtension}`;
      }
    }

    return null;
  },
};

export const importHelpers = {
  getColorIntensityCap: color => ({
    type: `ColorIntensity`,
    color,
  }),

  getPanTiltCap: (panOrTilt, maxValue = 0) => {
    const capability = {
      type: panOrTilt,
      angleStart: `0deg`,
      angleEnd: `${maxValue}deg`,
    };

    if (maxValue === 0) {
      capability.angleStart = `0%`;
      capability.angleEnd = `100%`;
      capability.helpWanted = `Can you provide exact angles?`;
    }

    return capability;
  },

  getShutterStrobeCap: (shutterEffect, speedStart = ``, speedEnd = ``, randomTiming = false) => {
    const capability = {
      type: `ShutterStrobe`,
      shutterEffect,
    };

    if (speedEnd) {
      capability.speedStart = speedStart;
      capability.speedEnd = speedEnd;
    }
    else if (speedStart) {
      capability.speed = speedStart;
    }

    if (randomTiming) {
      capability.randomTiming = true;
    }

    return capability;
  },

  getRotationCapType: ({ channelName, channelType }) => {
    if ([`Pan`, `Tilt`].includes(channelType)) {
      return `${channelType}Continuous`;
    }

    if ([`Colour`, `Gobo`].includes(channelType) || /gobo/i.test(channelName)) {
      return /wheel/i.test(channelName) ? `WheelRotation` : `WheelSlotRotation`;
    }

    if (channelType === `Prism`) {
      return `PrismRotation`;
    }

    return `Rotation`;
  },

  getRotationSpeedCap: (capabilityData, speedStart = ``, speedEnd = ``) => {
    const capability = {
      type: importHelpers.getRotationCapType(capabilityData),
    };

    if (capability.type.startsWith(`Wheel`) && !capabilityData.channelNameInWheels) {
      capability.wheel = ``;
    }

    if (speedEnd) {
      capability.speedStart = speedStart;
      capability.speedEnd = speedEnd;
    }
    else if (speedStart) {
      capability.speed = speedStart;
    }

    return capability;
  },

  getSpeedCapType: ({ channelName, channelType }) => {
    if (channelType === `Shutter` || /strobe/i.test(channelName)) {
      return `StrobeSpeed`;
    }

    if (/pan\W*tilt/i.test(channelName)) {
      return `PanTiltSpeed`;
    }

    if (channelType === `Effect` || /program|effect/i.test(channelName)) {
      return `EffectSpeed`;
    }

    return `Speed`;
  },

  getBeamAngleCap({ channelName, channelType }, isAscending) {
    if (channelType === `Shutter` || /iris/i.test(channelName)) {
      const [openPercentStart, openPercentEnd] = isAscending ? [`closed`, `open`] : [`open`, `closed`];

      return {
        type: `Iris`,
        openPercentStart,
        openPercentEnd,
      };
    }

    const [angleStart, angleEnd] = isAscending ? [`small`, `big`] : [`big`, `small`];

    return {
      type: /zoom/i.test(channelName) ? `Zoom` : `BeamAngle`,
      angleStart,
      angleEnd,
    };
  },

  /**
   * @param {string | undefined} direction A string containing something like "CW", "CCW", "clockwise", "counter-clockwise".
   * @returns {string} The normalized direction suffix.
   */
  getDirectionSuffix(direction) {
    if (!direction) {
      return ``;
    }

    return /counter|ccw/i.test(direction) ? ` CCW` : ` CW`;
  },

  /**
   * Try to guess speedStart / speedEnd from the capability name and set them
   * to the capability. It may also set cap.type to "Rotation".
   * @param {string} capabilityName The capability name to extract information from.
   * @param {object} capability The OFL capability object to add found properties to.
   * @returns {string} The rest of the capabilityName.
   */
  getSpeedGuessedComment(capabilityName, capability) {
    const speedRegex = /(?:^|,\s*|\s+)\(?((?:(?:counter\s?-?\s?)?clockwise|c?cw).*?(?:,\s*|\s+))?\(?(slow|fast|\d+|\d+\s*hz)\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*(fast|slow|\d+\s*hz)\)?$/i;
    if (speedRegex.test(capabilityName)) {
      return capabilityName.replace(speedRegex, (_, direction, start, end) => {
        const directionSuffix = importHelpers.getDirectionSuffix(direction);
        if (directionSuffix !== ``) {
          capability.type = `Rotation`;
        }

        start = start.toLowerCase();
        end = end.toLowerCase();

        const startNumber = Number.parseFloat(start);
        const endNumber = Number.parseFloat(end);
        if (!Number.isNaN(startNumber) && !Number.isNaN(endNumber)) {
          start = `${startNumber}Hz`;
          end = `${endNumber}Hz`;
        }

        capability.speedStart = start + directionSuffix;
        capability.speedEnd = end + directionSuffix;

        // delete the parsed part
        return ``;
      });
    }

    const stopRegex = /\s*\b(?:stop(?:ped)?|no rotation|no rotate)\b\s*/gi;
    if (stopRegex.test(capabilityName)) {
      return capabilityName.replaceAll(stopRegex, () => {
        capability.speed = `stop`;
        return ``;
      });
    }

    return capabilityName;
  },

  getMaintenanceCap: capabilityData => ({
    type: `Maintenance`,
    comment: capabilityData.capabilityName,
  }),
};

const createWheelRotationCapability = () => ({
  type: `WheelRotation`,
  wheel: ``,
  speedStart: `slow`,
  speedEnd: `fast`,
});

const createFocusNearToFarCapability = () => ({
  type: `Focus`,
  distanceStart: `near`,
  distanceEnd: `far`,
});

const createFocusFarToNearCapability = () => ({
  type: `Focus`,
  distanceStart: `far`,
  distanceEnd: `near`,
});


// ########## Channel presets ##########

const channelPresets = {
  IntensityMasterDimmer: {
    isApplicable: capability => {
      const channel = capability._channel;
      const matrix = channel.fixture.matrix;

      if (!channelPresets.IntensityDimmer.isApplicable(capability) || matrix === null) {
        return false;
      }

      return channel.pixelKey === null || matrix.pixelGroups[channel.pixelKey] === matrix.pixelKeys;
    },
    importCapability: () => ({ type: `Intensity` }),
  },
  IntensityDimmer: {
    isApplicable: capability => capability.type === `Intensity` && capability.brightness[0].number < capability.brightness[1].number,
    importCapability: () => ({ type: `Intensity` }),
  },

  IntensityRed: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Red`),
    importCapability: () => importHelpers.getColorIntensityCap(`Red`),
  },
  IntensityGreen: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Green`),
    importCapability: () => importHelpers.getColorIntensityCap(`Green`),
  },
  IntensityBlue: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Blue`),
    importCapability: () => importHelpers.getColorIntensityCap(`Blue`),
  },
  IntensityCyan: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Cyan`),
    importCapability: () => importHelpers.getColorIntensityCap(`Cyan`),
  },
  IntensityMagenta: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Magenta`),
    importCapability: () => importHelpers.getColorIntensityCap(`Magenta`),
  },
  IntensityYellow: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Yellow`),
    importCapability: () => importHelpers.getColorIntensityCap(`Yellow`),
  },
  IntensityAmber: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Amber`),
    importCapability: () => importHelpers.getColorIntensityCap(`Amber`),
  },
  IntensityWhite: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `White`) || exportHelpers.isColorIntensity(capability, `Warm White`) || exportHelpers.isColorIntensity(capability, `Cold White`),
    importCapability: ({ channelName }) => {
      let color = `White`;
      if (/\bwarm\b/i.test(channelName)) {
        color = `Warm White`;
      }
      else if (/\bcold\b/i.test(channelName)) {
        color = `Cold White`;
      }

      return {
        type: `ColorIntensity`,
        color,
      };
    },
  },
  IntensityUV: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `UV`),
    importCapability: () => importHelpers.getColorIntensityCap(`UV`),
  },
  IntensityIndigo: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Indigo`),
    importCapability: () => importHelpers.getColorIntensityCap(`Indigo`),
  },
  IntensityLime: {
    isApplicable: capability => exportHelpers.isColorIntensity(capability, `Lime`),
    importCapability: () => importHelpers.getColorIntensityCap(`Lime`),
  },

  IntensityHue: {
    isApplicable: capability => false,
    importCapability: () => ({ type: `Generic` }),
  },
  IntensitySaturation: {
    isApplicable: capability => false,
    importCapability: () => ({ type: `Generic` }),
  },
  IntensityLightness: {
    isApplicable: capability => false,
    importCapability: () => ({ type: `Generic` }),
  },
  IntensityValue: {
    isApplicable: capability => false,
    importCapability: () => ({ type: `Generic` }),
  },

  PositionPan: {
    isApplicable: capability => capability.type === `Pan`,
    importCapability: ({ panMax }) => importHelpers.getPanTiltCap(`Pan`, panMax),
  },
  PositionTilt: {
    isApplicable: capability => capability.type === `Tilt`,
    importCapability: ({ tiltMax }) => importHelpers.getPanTiltCap(`Tilt`, tiltMax),
  },
  PositionXAxis: {
    isApplicable: capability => capability.type === `BeamPosition` && capability.horizontalAngle && capability.horizontalAngle[0].number < capability.horizontalAngle[1].number,
    importCapability: () => ({
      type: `BeamPosition`,
      horizontalAngleStart: `left`,
      horizontalAngleEnd: `right`,
      helpWanted: `Is this the correct direction? Can you provide exact angles?`,
    }),
  },
  PositionYAxis: {
    isApplicable: capability => capability.type === `BeamPosition` && capability.verticalAngle && capability.verticalAngle[0].number < capability.verticalAngle[1].number,
    importCapability: () => ({
      type: `BeamPosition`,
      verticalAngleStart: `top`,
      verticalAngleEnd: `bottom`,
      helpWanted: `Is this the correct direction? Can you provide exact angles?`,
    }),
  },
  SpeedPanSlowFast: {
    isApplicable: capability => capability.type === `PanContinuous` && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => ({
      type: `PanContinuous`,
      speedStart: `slow`,
      speedEnd: `fast`,
    }),
  },
  SpeedPanFastSlow: {
    isApplicable: capability => capability.type === `PanContinuous` && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => ({
      type: `PanContinuous`,
      speedStart: `fast`,
      speedEnd: `slow`,
    }),
  },
  SpeedTiltSlowFast: {
    isApplicable: capability => capability.type === `TiltContinuous` && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => ({
      type: `TiltContinuous`,
      speedStart: `slow`,
      speedEnd: `fast`,
    }),
  },
  SpeedTiltFastSlow: {
    isApplicable: capability => capability.type === `TiltContinuous` && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => ({
      type: `TiltContinuous`,
      speedStart: `fast`,
      speedEnd: `slow`,
    }),
  },
  SpeedPanTiltSlowFast: {
    isApplicable: capability => capability.type === `PanTiltSpeed` && (exportHelpers.isIncreasingSpeed(capability) || exportHelpers.isDecreasingDuration(capability)),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `slow`,
      speedEnd: `fast`,
    }),
  },
  SpeedPanTiltFastSlow: {
    isApplicable: capability => capability.type === `PanTiltSpeed` && (exportHelpers.isDecreasingSpeed(capability) || exportHelpers.isIncreasingDuration(capability)),
    importCapability: () => ({
      type: `PanTiltSpeed`,
      speedStart: `fast`,
      speedEnd: `slow`,
    }),
  },

  ColorMacro: {
    isApplicable: capability => capability.type === `ColorPreset` || (capability.type === `WheelSlot` && capability.isSlotType(`Color`)),
    importCapability: () => ({
      type: `ColorPreset`,
      helpWanted: `Which color can be selected at which DMX values?`,
    }),
  },
  ColorWheel: {
    isApplicable: capability => capability.type === `WheelRotation` && capability.wheels[0].type === `Color`,
    importCapability: createWheelRotationCapability,
  },
  ColorRGBMixer: {
    isApplicable: capability => channelPresets.IntensityHue.isApplicable(capability),
    importCapability: capabilityData => channelPresets.IntensityHue.importCapability(capabilityData),
  },
  ColorCTOMixer: {
    isApplicable: capability => capability.type === `ColorTemperature` && capability.colorTemperature[0].number === 0 && capability.colorTemperature[1].number < 0,
    importCapability: () => ({
      type: `ColorTemperature`,
      colorTemperatureStart: `default`,
      colorTemperatureEnd: `warm`,
      helpWanted: `Can you provide exact color temperature values in Kelvin?`,
    }),
  },
  ColorCTBMixer: {
    isApplicable: capability => capability.type === `ColorTemperature` && capability.colorTemperature[0].number === 0 && capability.colorTemperature[1].number > 0,
    importCapability: () => ({
      type: `ColorTemperature`,
      colorTemperatureStart: `default`,
      colorTemperatureEnd: `cold`,
      helpWanted: `Can you provide exact color temperature values in Kelvin?`,
    }),
  },
  ColorCTCMixer: {
    isApplicable: capability => capability.type === `ColorTemperature`,
    importCapability: () => ({
      type: `ColorTemperature`,
      colorTemperatureStart: `warm`,
      colorTemperatureEnd: `cold`,
      helpWanted: `Is this the correct direction? Can you provide exact color temperature values in Kelvin?`,
    }),
  },

  GoboWheel: {
    isApplicable: capability => capability.type === `WheelRotation` && capability.wheels[0].type === `Gobo`,
    importCapability: createWheelRotationCapability,
  },
  GoboIndex: {
    isApplicable: capability => capability.type === `WheelSlotRotation` && capability.wheels[0].type === `Gobo`,
    importCapability: () => ({
      type: `WheelSlotRotation`,
      angleStart: `0deg`,
      angleEnd: `360deg`,
      helpWanted: `Are these the correct angles?`,
    }),
  },

  ShutterStrobeSlowFast: {
    isApplicable: capability => capability.type === `ShutterStrobe` && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Strobe`,
      speedStart: `slow`,
      speedEnd: `fast`,
      helpWanted: `At which DMX values is strobe disabled?`,
    }),
  },
  ShutterStrobeFastSlow: {
    isApplicable: capability => capability.type === `ShutterStrobe` && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Strobe`,
      speedStart: `fast`,
      speedEnd: `slow`,
      helpWanted: `At which DMX values is strobe disabled?`,
    }),
  },
  ShutterIrisMinToMax: {
    isApplicable: capability => capability.type === `Iris` && capability.openPercent[0].number < capability.openPercent[1].number,
    importCapability: () => ({
      type: `Iris`,
      openPercentStart: `closed`,
      openPercentEnd: `open`,
    }),
  },
  ShutterIrisMaxToMin: {
    isApplicable: capability => capability.type === `Iris` && capability.openPercent[0].number > capability.openPercent[1].number,
    importCapability: () => ({
      type: `Iris`,
      openPercentStart: `open`,
      openPercentEnd: `closed`,
    }),
  },

  BeamFocusNearFar: {
    isApplicable: capability => capability.type === `Focus` && capability.distance[0].number < capability.distance[1].number,
    importCapability: createFocusNearToFarCapability,
  },
  BeamFocusFarNear: {
    isApplicable: capability => capability.type === `Focus` && capability.distance[0].number > capability.distance[1].number,
    importCapability: createFocusFarToNearCapability,
  },
  BeamZoomSmallBig: {
    isApplicable: capability => capability.type === `Zoom` && capability.angle[0].number < capability.angle[1].number,
    importCapability: () => ({
      type: `Zoom`,
      angleStart: `narrow`,
      angleEnd: `wide`,
    }),
  },
  BeamZoomBigSmall: {
    isApplicable: capability => capability.type === `Zoom` && capability.angle[0].number > capability.angle[1].number,
    importCapability: () => ({
      type: `Zoom`,
      angleStart: `wide`,
      angleEnd: `narrow`,
    }),
  },
  PrismRotationSlowFast: {
    isApplicable: capability => capability.type === `PrismRotation` && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => ({
      type: `PrismRotation`,
      speedStart: `slow CW`,
      speedEnd: `fast CW`,
      helpWanted: `Does the prism rotate clockwise or counter-clockwise?`,
    }),
  },
  PrismRotationFastSlow: {
    isApplicable: capability => capability.type === `PrismRotation` && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => ({
      type: `PrismRotation`,
      speedStart: `fast CW`,
      speedEnd: `slow CW`,
      helpWanted: `Does the prism rotate clockwise or counter-clockwise?`,
    }),
  },

  NoFunction: {
    isApplicable: capability => capability.type === `NoFunction`,
    importCapability: () => ({ type: `NoFunction` }),
  },
};

/**
 * @param {CoarseChannel} channel The OFL channel object.
 * @returns {string | null} The QLC+ channel preset name or null, if there is no suitable one.
 */
export function getChannelPreset(channel) {
  if (channel.capabilities.length > 1) {
    return null;
  }

  return Object.keys(channelPresets).find(
    preset => channelPresets[preset].isApplicable(channel.capabilities[0]),
  ) || null;
}

/**
 * @param {string} preset The channel preset to import.
 * @param {string} channelName The channel name.
 * @param {number} panMax The maximum pan angle, or 0.
 * @param {number} tiltMax The maximum tilt angle, or 0.
 * @returns {object} The OFL capability object.
 */
export function getCapabilityFromChannelPreset(preset, channelName, panMax, tiltMax) {
  if (preset in channelPresets) {
    return channelPresets[preset].importCapability({
      channelName,
      panMax,
      tiltMax,
    });
  }

  return {
    type: `Generic`,
    helpWanted: `Unknown QLC+ channel preset ${preset}.`,
  };
}



// ########## Fine channel presets ##########

const fineChannelPresets = {
  IntensityMasterDimmerFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityMasterDimmer`,
  },
  IntensityDimmerFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityDimmer`,
  },

  IntensityRedFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityRed`,
  },
  IntensityGreenFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityGreen`,
  },
  IntensityBlueFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityBlue`,
  },
  IntensityCyanFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityCyan`,
  },
  IntensityMagentaFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityMagenta`,
  },
  IntensityYellowFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityYellow`,
  },
  IntensityAmberFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityAmber`,
  },
  IntensityWhiteFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityWhite`,
  },
  IntensityUVFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityUV`,
  },
  IntensityIndigoFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityIndigo`,
  },
  IntensityLimeFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityLime`,
  },

  IntensityHueFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityHue`,
  },
  IntensitySaturationFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensitySaturation`,
  },
  IntensityLightnessFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityLightness`,
  },
  IntensityValueFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `IntensityValue`,
  },

  PositionPanFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `PositionPan`,
  },
  PositionTiltFine: {
    isApplicable: ({ coarseChannelPreset }) => coarseChannelPreset === `PositionTilt`,
  },

  ColorWheelFine: {
    isApplicable: ({ coarseChannel }) => exportHelpers.isWheelChannel(coarseChannel) && coarseChannel.capabilities.every(
      capability => exportHelpers.isAllowedInWheels(capability) && (capability.wheels.length === 0 || capability.wheels[0].type === `Color`),
    ),
  },
  GoboWheelFine: {
    isApplicable: ({ coarseChannel }) => exportHelpers.isWheelChannel(coarseChannel) && coarseChannel.capabilities.every(
      capability => exportHelpers.isAllowedInWheels(capability) && (capability.wheels.length === 0 || capability.wheels[0].type === `Gobo`),
    ),
  },
  GoboIndexFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.capabilities.every(
      capability => capability.type === `WheelSlotRotation` && capability.wheels[0].type === `Gobo`,
    ),
  },

  ShutterIrisFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.type === `Iris`,
  },
  BeamFocusFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.type === `Focus`,
  },
  BeamZoomFine: {
    isApplicable: ({ coarseChannel }) => coarseChannel.type === `Zoom`,
  },
};

/**
 * @param {FineChannel} fineChannel The OFL fine channel object.
 * @returns {string | null} The QLC+ channel preset name or null, if there is no suitable one.
 */
export function getFineChannelPreset(fineChannel) {
  const coarseChannel = fineChannel.coarseChannel;
  const coarseChannelPreset = getChannelPreset(coarseChannel);

  return Object.keys(fineChannelPresets).find(
    fineChannelPreset => fineChannelPresets[fineChannelPreset].isApplicable({
      coarseChannel,
      coarseChannelPreset,
    }),
  ) || null;
}



// ########## Capability presets ##########

export const capabilityPresets = {

  // shutter capabilities

  ShutterOpen: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Open`),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Open`,
    }),
  },
  ShutterClose: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Closed`),
    importCapability: () => ({
      type: `ShutterStrobe`,
      shutterEffect: `Closed`,
    }),
  },


  // strobe capabilities with specified frequency

  StrobeFrequency: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && exportHelpers.hasFrequency(capability) && capability.isStep,
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`Strobe`, `${res1}Hz`),
  },
  StrobeFreqRange: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && exportHelpers.hasFrequency(capability),
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    exportRes2: capability => capability.speed[1].baseUnitEntity.number,
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`Strobe`, `${res1}Hz`, `${res2}Hz`),
  },
  PulseFrequency: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Pulse`) && exportHelpers.hasFrequency(capability) && capability.isStep,
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`Pulse`, `${res1}Hz`),
  },
  PulseFreqRange: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Pulse`) && exportHelpers.hasFrequency(capability),
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    exportRes2: capability => capability.speed[1].baseUnitEntity.number,
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`Pulse`, `${res1}Hz`, `${res2}Hz`),
  },
  RampUpFrequency: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampUp`) && exportHelpers.hasFrequency(capability) && capability.isStep,
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`RampUp`, `${res1}Hz`),
  },
  RampUpFreqRange: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampUp`) && exportHelpers.hasFrequency(capability),
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    exportRes2: capability => capability.speed[1].baseUnitEntity.number,
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`RampUp`, `${res1}Hz`, `${res2}Hz`),
  },
  RampDownFrequency: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampDown`) && exportHelpers.hasFrequency(capability) && capability.isStep,
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    importCapability: ({ res1 }) => importHelpers.getShutterStrobeCap(`RampDown`, `${res1}Hz`),
  },
  RampDownFreqRange: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampDown`) && exportHelpers.hasFrequency(capability),
    exportRes1: capability => capability.speed[0].baseUnitEntity.number,
    exportRes2: capability => capability.speed[1].baseUnitEntity.number,
    importCapability: ({ res1, res2 }) => importHelpers.getShutterStrobeCap(`RampDown`, `${res1}Hz`, `${res2}Hz`),
  },


  // other strobe capabilities

  StrobeRandomSlowToFast: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && capability.randomTiming && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `slow`, `fast`, true),
  },
  StrobeRandomFastToSlow: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && capability.randomTiming && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `fast`, `slow`, true),
  },
  StrobeRandom: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && capability.randomTiming,
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, null, null, true),
  },
  StrobeSlowToFast: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `slow`, `fast`),
  },
  StrobeFastToSlow: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Strobe`) && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`Strobe`, `fast`, `slow`),
  },
  PulseSlowToFast: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Pulse`) && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`Pulse`, `slow`, `fast`),
  },
  PulseFastToSlow: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `Pulse`) && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`Pulse`, `fast`, `slow`),
  },
  RampUpSlowToFast: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampUp`) && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampUp`, `slow`, `fast`),
  },
  RampUpFastToSlow: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampUp`) && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampUp`, `fast`, `slow`),
  },
  RampDownSlowToFast: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampDown`) && exportHelpers.isIncreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampDown`, `slow`, `fast`),
  },
  RampDownFastToSlow: {
    isApplicable: capability => exportHelpers.isShutterEffect(capability, `RampDown`) && exportHelpers.isDecreasingSpeed(capability),
    importCapability: () => importHelpers.getShutterStrobeCap(`RampDown`, `fast`, `slow`),
  },


  // color capabilities

  ColorMacro: {
    isApplicable: capability => (capability.type === `ColorPreset` || capability.isSlotType(`Color`)) && capability.colors !== null && capability.colors.allColors.length === 1,
    exportRes1: capability => capability.colors.allColors[0],
    importCapability: capabilityData => capabilityPresets.ColorDoubleMacro.importCapability(capabilityData),
  },
  ColorDoubleMacro: {
    isApplicable: capability => (capability.type === `ColorPreset` || capability.isSlotType(`Color`)) && capability.colors !== null && capability.colors.allColors.length === 2,
    exportRes1: capability => capability.colors.allColors[0],
    exportRes2: capability => capability.colors.allColors[1],
    importCapability: ({ channelName, res1, res2, index }) => {
      if (/wheel\b/i.test(channelName)) {
        return {
          type: `WheelSlot`,
          slotNumber: index + 1,
        };
      }

      const colors = [res1];
      if (res2) {
        colors.push(res2);
      }

      return {
        type: `ColorPreset`,
        comment: ``,
        colors,
      };
    },
  },
  ColorWheelIndex: {
    isApplicable: capability => capability.type === `WheelRotation` && capability.wheels[0].type === `Color` && exportHelpers.isRotationAngle(capability),
    importCapability: () => ({
      type: `WheelRotation`,
      angleStart: `0deg`,
      angleEnd: `360deg`,
      helpWanted: `Are these the correct angles?`,
    }),
  },


  // gobo capabilities

  // TODO: import/export a gobo image as res1
  GoboShakeMacro: {
    isApplicable: capability => capability.type === `WheelShake` && capability.isSlotType(/Gobo|Iris|Frost|Open/),
    exportRes1: exportHelpers.getGoboResource,
    importCapability: ({ capabilityName, index }) => {
      const capability = {
        type: `WheelShake`,
        slotNumber: index + 1,
      };

      const comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

      if (`speed` in capability) {
        capability.shakeSpeed = capability.speed;
        delete capability.speed;
      }
      else if (`speedStart` in capability) {
        capability.shakeSpeedStart = capability.speedStart;
        capability.shakeSpeedEnd = capability.speedEnd;
        delete capability.speedStart;
        delete capability.speedEnd;
      }

      capability.comment = comment;

      return capability;
    },
  },
  GoboMacro: {
    isApplicable: capability => capability.type === `WheelSlot` && capability.isSlotType(/Gobo|Iris|Frost|Open/),
    exportRes1: exportHelpers.getGoboResource,
    importCapability: ({ index }) => ({
      type: `WheelSlot`,
      slotNumber: index + 1,
    }),
  },


  // prism capabilities

  PrismEffectOn: {
    isApplicable: capability => capability.type === `Prism` || (capability.type === `WheelSlot` && capability.isSlotType(`Prism`)),
    exportRes1: capability => (capability.wheelSlot && capability.slotNumber[0].number === capability.slotNumber[1].number && capability.wheelSlot[0].facets),
    importCapability: capabilityData => {
      if (/wheel/i.test(capabilityData.channelName)) {
        return capabilityPresets.GoboMacro.importCapability(capabilityData);
      }

      return {
        type: `Prism`,
        comment: capabilityData.res1 ? `${capabilityData.res1}-facet` : ``,
      };
    },
  },
  PrismEffectOff: {
    isApplicable: capability => capability.type === `NoFunction` && capability._channel.type === `Prism`,
    importCapability: () => ({
      type: `NoFunction`,
    }),
  },


  // rotation capabilities

  RotationClockwiseSlowToFast: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && exportHelpers.isIncreasingSpeed(capability) && capability.speed[0].number > 0,
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `slow CW`, `fast CW`),
  },
  RotationClockwiseFastToSlow: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && exportHelpers.isDecreasingSpeed(capability) && capability.speed[1].number > 0,
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `fast CW`, `slow CW`),
  },
  RotationClockwise: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && capability.speed[0].number === capability.speed[1].number && capability.speed[0].number > 0,
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `fast CW`),
  },
  RotationStop: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && exportHelpers.isStopped(capability),
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `stop`),
  },
  RotationCounterClockwiseSlowToFast: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && exportHelpers.isIncreasingSpeed(capability) && capability.speed[0].number < 0,
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `slow CCW`, `fast CCW`),
  },
  RotationCounterClockwiseFastToSlow: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && exportHelpers.isDecreasingSpeed(capability) && capability.speed[1].number < 0,
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `fast CCW`, `slow CCW`),
  },
  RotationCounterClockwise: {
    isApplicable: capability => exportHelpers.isRotationSpeed(capability) && capability.speed[0].number === capability.speed[1].number && capability.speed[0].number < 0,
    importCapability: capabilityData => importHelpers.getRotationSpeedCap(capabilityData, `fast CCW`),
  },
  RotationIndexed: {
    isApplicable: capability => exportHelpers.isRotationAngle(capability),
    importCapability: capabilityData => ({
      type: importHelpers.getRotationCapType(capabilityData),
      angleStart: `0deg`,
      angleEnd: `360deg`,
      helpWanted: `Are these the correct angles?`,
    }),
  },


  // generic / other capabilities

  GenericPicture: {
    isApplicable: capability => capability.effectPreset === `ColorFade` && !exportHelpers.isStopped(capability),
    exportRes1: capability => `Others/rainbow.png`,
    importCapability: ({ res1, channelName, capabilityName }) => {
      if (res1 === `Others/rainbow.png`) {
        if (/wheel/i.test(channelName)) {
          const capability = {
            type: `WheelRotation`,
          };
          capability.comment = importHelpers.getSpeedGuessedComment(capabilityName, capability);

          if (!(`speed` in capability || `speedStart` in capability)) {
            capability.speedStart = `slow CW`;
            capability.speedEnd = `fast CW`;
            capability.helpWanted = `Are the automatically added speed values correct?`;
          }

          return capability;
        }
        return {
          type: `Effect`,
          effectName: capabilityName,
        };
      }

      return {
        type: `Generic`,
        comment: res1,
      };
    },
  },
  SlowToFast: {
    isApplicable: capability => exportHelpers.isIncreasingSpeed(capability),
    importCapability: capabilityData => ({
      type: importHelpers.getSpeedCapType(capabilityData),
      speedStart: `slow`,
      speedEnd: `fast`,
    }),
  },
  FastToSlow: {
    isApplicable: capability => exportHelpers.isDecreasingSpeed(capability),
    importCapability: capabilityData => ({
      type: importHelpers.getSpeedCapType(capabilityData),
      speedStart: `fast`,
      speedEnd: `slow`,
    }),
  },
  NearToFar: {
    isApplicable: capability => capability.distance !== null && capability.distance[0].number < capability.distance[1].number,
    importCapability: createFocusNearToFarCapability,
  },
  FarToNear: {
    isApplicable: capability => capability.distance !== null && capability.distance[0].number > capability.distance[1].number,
    importCapability: createFocusFarToNearCapability,
  },
  SmallToBig: {
    isApplicable: capability => (exportHelpers.isBeamAngle(capability) && capability.angle[0].number < capability.angle[1].number) || (capability.parameter !== null && capability.parameter[0].keyword === `small` && capability.parameter[1].keyword === `big`),
    importCapability: capabilityData => importHelpers.getBeamAngleCap(capabilityData, true),
  },
  BigToSmall: {
    isApplicable: capability => (exportHelpers.isBeamAngle(capability) && capability.angle[0].number > capability.angle[1].number) || (capability.parameter !== null && capability.parameter[0].keyword === `big` && capability.parameter[1].keyword === `small`),
    importCapability: capabilityData => importHelpers.getBeamAngleCap(capabilityData, false),
  },


  // maintenance / reset capabilities

  ResetPanTilt: {
    isApplicable: capability => capability.type === `Maintenance` && /\breset\b/i.test(capability.comment) && /\bpan\b/i.test(capability.comment) && /\btilt\b/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetPan: {
    isApplicable: capability => capability.type === `Maintenance` && /\breset\b/i.test(capability.comment) && /\bpan\b/i.test(capability.comment) && !/\btilt\b/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetTilt: {
    isApplicable: capability => capability.type === `Maintenance` && /\breset\b/i.test(capability.comment) && /\btilt\b/i.test(capability.comment) && !/\bpan\b/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetMotors: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*motors?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetGobo: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*gobos?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetColor: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*colou?rs?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetCMY: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*cmy/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetCTO: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*cto/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetEffects: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*effects?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetPrism: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*prisms?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetBlades: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*blades?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetIris: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*iris/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetFrost: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*frost/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetZoom: {
    isApplicable: capability => capability.type === `Maintenance` && /reset\s*zoom/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  ResetAll: {
    isApplicable: capability => capability.type === `Maintenance` && /reset/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  LampOn: {
    isApplicable: capability => capability.type === `Maintenance` && /lamp\s*on/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  LampOff: {
    isApplicable: capability => capability.type === `Maintenance` && /lamp\s*off/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  SilentModeOn: {
    isApplicable: capability => capability.type === `Maintenance` && /silent\s*mode\s*on/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  SilentModeOff: {
    isApplicable: capability => capability.type === `Maintenance` && /silent\s*mode\s*off/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
  SilentModeAutomatic: {
    isApplicable: capability => capability.type === `Maintenance` && /silent\s*mode\s*auto(?:matic)?/i.test(capability.comment),
    importCapability: importHelpers.getMaintenanceCap,
  },
};

/**
 * @typedef {object} CapabilityPreset
 * @property {string} presetName The name of the QLC+ capability preset.
 * @property {string | null} res1 A value for the QLC+ capability element's Res1 attribute, or null if the attribute should not be added.
 * @property {string | null} res2 A value for the QLC+ capability element's Res2 attribute, or null if the attribute should not be added.
 */

/**
 * @param {Capability} capability The OFL capability object.
 * @returns {Promise<CapabilityPreset | null>} A Promise that resolves to the QLC+ capability preset or null, if there is no suitable one.
 */
export async function getCapabilityPreset(capability) {
  const foundPresetName = Object.keys(capabilityPresets).find(
    presetName => capabilityPresets[presetName].isApplicable(capability),
  );

  if (!foundPresetName) {
    return null;
  }

  const preset = capabilityPresets[foundPresetName];
  return {
    presetName: foundPresetName,
    res1: `exportRes1` in preset ? await preset.exportRes1(capability) : null,
    res2: `exportRes2` in preset ? preset.exportRes2(capability) : null,
  };
}

/**
 * @param {string} preset The capability preset to import.
 * @param {object} capabilityData Additional data about capability and channel.
 * @returns {object} The OFL capability object.
 */
export function getCapabilityFromCapabilityPreset(preset, capabilityData) {
  if (preset in capabilityPresets) {
    const capability = capabilityPresets[preset].importCapability(capabilityData);

    if (!capability.comment || capabilityData.capabilityName.includes(capability.comment)) {
      capability.comment = capabilityData.capabilityName;
    }
    else {
      capability.comment += ` ${capabilityData.capabilityName}`;
    }

    return capability;
  }

  return {
    type: `Generic`,
    comment: capabilityData.capabilityName,
    helpWanted: `Unknown QLC+ capability preset ${preset}, Res1="${capabilityData.res1}", Res2="${capabilityData.res2}".`,
  };
}
