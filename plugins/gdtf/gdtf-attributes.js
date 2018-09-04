const { followXmlNodeReference, getRgbColorFromGdtfColor } = require(`./gdtf-helpers.js`);

// see https://gdtf-share.com/wiki/GDTF_File_Description#Attribute
const gdtfUnits = {
  None(value) {
    return `${value}`;
  },
  Percent(value) {
    return `${value * 100}%`;
  },
  Length(value) {
    return `${value}m`;
  },
  Mass(value) {
    return `${value}kg`;
  },
  Time(value, otherValue) {
    if (Math.abs(value) < 1 && (otherValue === null || Math.abs(otherValue) < 1)) {
      return `${value * 1000}ms`;
    }

    return `${value}s`;
  },
  Temperature(value) {
    return `${value}K`;
  },
  LuminousIntensity(value) {
    return `${value}cd`;
  },
  Angle(value) {
    return `${value}deg`;
  },
  Force(value) {
    return `${value}N`;
  },
  Frequency(value) {
    return `${value}Hz`;
  },
  Current(value) {
    return `${value}A`;
  },
  Voltage(value) {
    return `${value}V`;
  },
  Power(value) {
    return `${value}W`;
  },
  Energy(value) {
    return `${value}J`;
  },
  Area(value) {
    return `${value}m2`;
  },
  Volume(value) {
    return `${value}m3`;
  },
  Speed(value) {
    return `${value}m/s`;
  },
  Acceleration(value) {
    return `${value}m/s2`;
  },
  AngularSpeed(value) {
    // value is in deg/s
    return `${value / 360 * 60}rpm`;
  },
  AngularAcc(value) {
    return `${value}deg/s2`;
  },
  WaveLength(value) {
    return `${value}nm`;
  },
  ColorComponent(value) {
    // this entity is used as a brightness percentage for ColorRGBX attributes (X = 1…16)
    // or as an "index offset" for ColorX attributes (X = 1…4) -> handled before
    return `${value * 100}%`;
  }
};

// see https://gdtf-share.com/wiki/GDTF_File_Description#Appendix_A._Attribute_Definitions
const gdtfAttributes = {
  Dimmer: {
    // Controls the intensity of a fixture.
    oflType: `Intensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `LuminousIntensity`
  },
  Pan: undefined, // Controls the fixture's sideward movement (horizontal axis).
  Tilt: undefined, // Controls the fixture's upward and the downward movement (vertical axis).
  PositionEffect: undefined, // Selects the predefined position effects that are built into the fixture.
  PositionEffectRate: undefined, // Controls the speed of the predefined position effects that are built into the fixture.
  PositionEffectFade: undefined, // Snaps or smooth fades with timing in running predefined position effects.
  XYZ_X: undefined, // Defines a fixture’s x-coordinate within an XYZ coordinate system.
  XYZ_Y: undefined, // Defines a fixture’s y-coordinate within an XYZ coordinate system.
  XYZ_Z: undefined, // Defines a fixture‘s z-coordinate within an XYZ coordinate system.
  Gobo1: undefined, // Selects gobos in the fixture's gobo wheel 1.
  Gobo1Spin: undefined, // Controls the speed and direction of the continuous rotation of gobo wheel 1.
  Gobo1Shake: undefined, // Control the frequency of the shake of gobo wheel 1.
  Gobo1Pos: undefined, // Controls angle of indexed rotation of gobos in gobo wheel 1.
  Gobo1PosRotation: undefined, // Controls the speed and direction of continuous rotation of gobos in gobo wheel 1.
  Gobo2: undefined, // Selects gobos in the fixture's gobo wheel 2.
  Gobo2Spin: undefined, // Controls the speed and direction of the continuous rotation of gobo wheel 2.
  Gobo2Shake: undefined, // Control the frequency of the shake of gobo wheel 2.
  Gobo2Pos: undefined, // Controls the angle of indexed rotation of gobos in gobo wheel 2.
  Gobo2PosRotation: undefined, // Controls the speed and direction of continuous rotation of gobos in gobo wheel 2.
  Gobo3: undefined, // Selects gobos in the fixture's gobo wheel 3.
  Gobo3Spin: undefined, // Controls the speed and direction of the continuous rotation of gobo wheel 3.
  Gobo3Shake: undefined, // Control the frequency of the shake of gobo wheel 3.
  Gobo3Pos: undefined, // Controls the angle of indexed rotation of gobos in gobo wheel 3.
  Gobo3PosRotation: undefined, // Controls the speed and direction of the continuous rotation of gobos in gobo wheel 3.
  AnimationWheel: undefined, // Inserts a gobo disk into the beam. The disk has the ability to continuously index and rotate.
  AnimationIndexRotate: undefined, // Controls the animation disk's index or its rotation speed.
  AnimationOffset: undefined, // Controls the animation disk's shaking.
  ColorEffects: undefined, // Selects predefined color effects built into the fixture.
  Color1: {
    // Selects colors in the fixture's color wheel 1.
    oflType: `ColorWheelIndex`,
    oflProperty: null,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      const index = parseInt(gdtfCapability.$.WheelSlotIndex) - 1;
      capability.index = index;

      if (`Wheel` in gdtfCapability._channelFunction.$) {
        const gdtfWheel = followXmlNodeReference(gdtfFixture.Wheels[0], gdtfCapability._channelFunction.$.Wheel);
        const gdtfSlot = gdtfWheel.Slot[index];

        if (gdtfSlot) {
          if (gdtfCapability.$.Name !== gdtfSlot.$.Name) {
            gdtfCapability.$.Name += ` (${gdtfSlot.$.Name})`;
          }

          if (gdtfSlot.$.Color) {
            capability.colors = [getRgbColorFromGdtfColor(gdtfSlot.$.Color)];
          }
        }
      }

      const physicalFrom = gdtfCapability._physicalFrom;
      const physicalTo = gdtfCapability._physicalTo;

      // TODO: support physical values -0.5…0.5 to specify proportional color wheel capabilities
      if (physicalFrom !== 0 || physicalTo !== 1) {
        gdtfCapability.$.Name += ` ${physicalFrom}…${physicalTo}`;
      }
    }
  },
  Color1Spin: {
    // Controls the speed and direction of the fixture's color wheel 1.
    oflType: `ColorWheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      if (/CCW|counter[-\s]*clockwise/.test(gdtfCapability.$.Name)) {
        gdtfCapability._physicalFrom = -Math.abs(gdtfCapability._physicalFrom);
        gdtfCapability._physicalTo = -Math.abs(gdtfCapability._physicalTo);
      }
    }
  },
  Color2: {
    // Selects colors in the fixture's color wheel 2.
    inheritFrom: `Color1`
  },
  Color2Spin: {
    // Controls the speed and direction of the fixture's color wheel 2.
    inheritFrom: `Color1Spin`
  },
  Color3: {
    // Selects colors in the fixture's color wheel 3.
    inheritFrom: `Color1`
  },
  Color3Spin: {
    // Controls the speed and direction of the fixture's color wheel 3.
    inheritFrom: `Color1Spin`
  },
  Color4: {
    // Selects colors in the fixture's color wheel 4.
    inheritFrom: `Color1`
  },
  Color4Spin: {
    // Controls the speed and direction of the fixture's color wheel 4.
    inheritFrom: `Color1Spin`
  },
  ColorRGB1: {
    // Controls the intensity of the fixture's red emitters or its cyan CMY-mixing feature.
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.color = guessColorComponentName(gdtfCapability, `Red`, `Cyan`);
    }
  },
  ColorRGB2: {
    // Controls the intensity of the fixture's green emitters or its magenta CMY-mixing feature.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.color = guessColorComponentName(gdtfCapability, `Green`, `Magenta`);
    }
  },
  ColorRGB3: {
    // Controls the intensity of the fixture's blue emitters or its yellow CMY-mixing feature.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.color = guessColorComponentName(gdtfCapability, `Blue`, `Yellow`);
    }
  },
  ColorRGB4: {
    // Controls the intensity of the fixture's amber emitters.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.color = `Amber`;
    }
  },
  ColorRGB5: {
    // Controls the intensity of the fixture's white emitters.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.color = `White`;
    }
  },
  ColorRGB6: {
    // Controls the intensity of the fixture's color emitters.
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      // This is most likely wrong but enables the user to make an informed choice.
      capability.color = gdtfCapability._channelFunction._attribute.$.Pretty || `Unknown`;
    }
  },
  ColorRGB7: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB8: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB9: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB10: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB11: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB12: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB13: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB14: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB15: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorRGB16: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`
  },
  ColorMacro: undefined, // Selects predefined colors that are programed in the fixture's firmware.
  ColorMacro2: undefined, // Selects predefined colors that are programed in the fixture's firmware (2).
  CTO: undefined, // Controls the fixture's "Correct to orange" wheel or mixing system.
  CTC: undefined, // Controls the fixture's "Correct to color" wheel or mixing system.
  CTB: undefined, // Controls the fixture's "Correct to blue" wheel or mixing system.
  'HSB_Hue': undefined, // Controls the fixture's color attribute regarding the hue.
  'HSB_Saturation': undefined, // Controls the fixture's color attribute regarding the saturation.
  'HSB_Brightness': undefined, // Controls the fixture's color attribute regarding the brightness.
  'HSB_Quality': undefined, // Controls the fixture's color attribute regarding the quality.
  StrobeDuration: {
    // Controls the length of a strobe flash.
    oflType: `StrobeDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`
  },
  StrobeRate: {
    // Controls the time between strobe flashes.
    oflType: `StrobeSpeed`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`
  },
  Shutter: undefined, // Controls the fixture´s mechanical or electronical shutter feature.
  ShutterStrobe: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature.
  ShutterStrobePulse: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature.
  ShutterStrobePulseClose: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature.
  ShutterStrobePulseOpen: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature.
  ShutterStrobeRandom: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random strobe shutter feature.
  ShutterStrobeRandomPulse: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random pulse shutter feature.
  ShutterStrobeRandomPulseClose: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random closing pulse shutter feature.
  ShutterStrobeRandomPulseOpen: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random opening pulse shutter feature.
  Shutter2: undefined, // Controls the fixture´s mechanical or electronical shutter feature (2). Is used with foreground/background strobe.
  Shutter2Strobe: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical strobe shutter feature (2).
  Shutter2StrobePulse: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical pulse shutter feature (2).
  Shutter2StrobePulseClose: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical closing pulse shutter feature (2).
  Shutter2StrobePulseOpen: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical opening pulse shutter feature (2).
  Shutter2StrobeRandom: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical random strobe shutter feature (2).
  Shutter2StrobeRandomPulse: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical random pulse shutter feature (2).
  Shutter2StrobeRandomPulseClose: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical random closing pulse shutter feature (2).
  Shutter2StrobeRandomPulseOpen: undefined, // Controls the frequency/speed of the fixture ́s mechanical or electronical random opening pulse shutter feature (2).
  Shutter3: undefined, // Controls the fixture ´s mechanical or electronical shutter feature (3). Is used with foreground/background strobe.
  Shutter3Strobe: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature (3).
  Shutter3StrobePulse: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature (3).
  Shutter3StrobePulseClose: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature (3).
  Shutter3StrobePulseOpen: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature (3).
  Shutter3StrobeRandom: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random strobe shutter feature (3).
  Shutter3StrobeRandomPulse: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random pulse shutter feature (3).
  Shutter3StrobeRandomPulseClose: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random closing pulse shutter feature (3).
  Shutter3StrobeRandomPulseOpen: undefined, // Controls the frequency/speed of the fixture´s mechanical or electronical random opening pulse shutter feature (3).
  Iris: undefined, // Controls the diameter of the fixture's beam.
  IrisStrobe: undefined, // Sets speed of the iris’s strobe feature.
  IrisPulseClose: undefined, // Sets speed of iris‘s closing pulse.
  IrisPulseOpen: undefined, // Sets speed of iris‘s opening pulse.
  Frost: undefined, // The ability to soften the fixture's spot light with a frosted lens.
  Frost2: undefined, // The ability to soften the fixture's spot light with a frosted lens (2).
  Prism: undefined, // Controls the insertion of fixture ́s prism wheel 1. Refracts the beam into multiple beams of light on wheel 1.
  PrismPos: undefined, // Controls the indexed position of fixture‘s prism on prism wheel 1.
  PrismPosRotation: undefined, // Controls the speed and direction of the continuous rotation of the fixture’s prism on prism wheel 1.
  Prism2: undefined, // Controls the insertion of fixture´s prism wheel 2. Refracts the beam into multiple beams of light on wheel 2.
  Prism2Pos: undefined, // Controls the indexed position of fixture‘s prism on prism wheel 2.
  Prism2PosRotation: undefined, // Controls the speed and direction of the continuous rotation of the fixture’s prism on prism wheel 2.
  Effects: undefined, // Generically predefined macros and effects of a fixture.
  EffectsRate: undefined, // Speed of running effects.
  EffectsFade: undefined, // Snapping or smooth look of running effects.
  Effects2: undefined, // Generically predefined macros and effects of a fixture (2).
  Effects2Rate: undefined, // Speed of running effects (2).
  Effects2Fade: undefined, // Snapping or smooth look of running effects (2).
  EffectsSync: undefined, // Sets offset between running effects and effects 2.
  Focus: undefined, // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot.
  Focus2: undefined, // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot (2).
  FocusAdjust: undefined, // Autofocuses functionality using presets.
  FocusDistance: undefined, // Autofocuses functionality using distance.
  Control: undefined, // Controls the channel of a fixture.
  DimmerMode: undefined, // Selects different modes of intensity.
  DimmerCurve: undefined, // Selects different dimmer curves of the fixture.
  PanMode: undefined, // Selects fixture's pan mode. Selects between a limited pan range (e.g. -270 to 270) or a continuous pan range.
  TiltMode: undefined, // Selects fixture's pan mode. Selects between a limited tilt range (e.g. -130 to 130) or a continuous tilt range.
  PositionModes: undefined, // Selects the fixture's position mode.
  Gobo1WheelMode: undefined, // Changes control between selecting, indexing, and rotating the gobos of gobowheel1.
  Gobo2WheelMode: undefined, // Changes control between selecting, indexing, and rotating the gobos of gobowheel2.
  Gobo3WheelMode: undefined, // Changes control between selecting, indexing, and rotating the gobos of gobowheel3.
  AnimationIndexRotateMode: undefined, // Changes control between selecting, indexing, and rotating the animation wheel.
  AnimationWheelShortcutMode: undefined, // Defines whether the animation wheel takes the shortest distance between two positions.
  Color1Mode: undefined, // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 1.
  Color2Mode: undefined, // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 2.
  Color3Mode: undefined, // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 3.
  Color4Mode: undefined, // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 4.
  ColorWheelShortcutMode: undefined, // Defines whether the color wheel takes the shortest distance between two colors.
  CyanMode: undefined, // Controls how Cyan is used within the fixture's cyan CMY-mixing feature.
  MagentaMode: undefined, // Controls how Cyan is used within the fixture's magenta CMY-mixing.
  YellowMode: undefined, // Controls how Cyan is used within the fixture's yellow CMY-mixing feature.
  ColorMixMode: undefined, // Changes control between selecting continuous selection, half selection, random selection, color spinning, etc. in color mixing.
  StrobeMode: undefined, // Changes strobe style - strobe, pulse, random strobe, etc. - of the shutter attribute.
  FocusMode: undefined, // Changes modes of the fixture’s focus - manual or auto- focus.
  IrisMode: undefined, // Changes modes of the fixture’s iris - linear, strobe, pulse.
  BeamEffectIndexRotateMode: undefined, // Changes mode to control either index or rotation of the beam effects.
  IntensityMSpeed: undefined, // Movement speed of the fixture's intensity.
  PositionMSpeed: undefined, // Movement speed of the fixture's pan/tilt.
  ColorMixMSpeed: undefined, // Movement speed of the fixture's ColorMix presets.
  ColorWheelSelectMSpeed: undefined, // Movement speed of the fixture's color wheel.
  GoboWheelMSpeed: undefined, // Movement speed of the fixture's gobo wheel.
  IrisMSpeed: undefined, // Movement speed of the fixture's iris.
  FocusMSpeed: undefined, // Movement speed of the fixture's focus.
  FrameMSpeed: undefined, // Movement speed of the fixture's shapers.
  GlobalMSpeed: undefined, // General speed of fixture's features.
  FixtureGlobalReset: undefined, // Generally resets the entire fixture.
  ShutterReset: undefined, // Resets the fixture's shutter.
  BeamReset: undefined, // Resets the fixture's beam features.
  ColorMixReset: undefined, // Resets the fixture's color mixing system.
  ColorWheelReset: undefined, // Resets the fixture's color wheel.
  FocusReset: undefined, // Resets the fixture's focus.
  FrameReset: undefined, // Resets the fixture's shapers.
  GoboWheelReset: undefined, // Resets the fixture's gobo wheel.
  IntensityReset: undefined, // Resets the fixture's intensity.
  IrisReset: undefined, // Resets the fixture's iris.
  PositionReset: undefined, // Resets the fixture's pan/tilt.
  PanReset: undefined, // Resets the fixture's pan.
  TiltReset: undefined, // Resets the fixture's tilt.
  ZoomReset: undefined, // Resets the fixture's zoom.
  CTBReset: undefined, // Resets the fixture's CTB.
  CTOReset: undefined, // Resets the fixture's CTO.
  CTCReset: undefined, // Resets the fixture's CTC.
  FixtureCalibrationReset: undefined, // Resets the fixture's calibration.
  Function: undefined, // Generally controls features of the fixture.
  LampControl: undefined, // Controls the fixture's lamp on/lamp off feature.
  NoFeature: undefined, // Ranges without a functionality.
  Blower: undefined, // Fog or hazer‘s blower feature.
  Fan: {
    // Fog or hazer's Fan feature.
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`
  },
  Fog: undefined, // Fog or hazer's Fog feature.
  Haze: undefined, // Fog or hazer's haze feature.
  LampPowerMode: undefined, // Controls the energy consumption of the lamp.
  Fans: undefined, // Fancontrols a fixture or device.
  Blade1A: undefined, // 1 of 2 shutters that shape the top of the beam.
  Blade1B: undefined, // 2 of 2 shutters that shape the top of the beam.
  Blade2A: undefined, // 1 of 2 shutters that shape the right of the beam.
  Blade2B: undefined, // 2 of 2 shutters that shape the right of the beam.
  Blade3A: undefined, // 1 of 2 shutters that shape the bottom of the beam.
  Blade3B: undefined, // 2 of 2 shutters that shape the bottom of the beam.
  Blade4A: undefined, // 1 of 2 shutters that shape the left of the beam.
  Blade4B: undefined, // 2 of 2 shutters that shape the left of the beam.
  Blade1Rot: undefined, // Rotates position of blade1.
  Blade2Rot: undefined, // Rotates position of blade2.
  Blade3Rot: undefined, // Rotates position of blade3.
  Blade4Rot: undefined, // Rotates position of blade4.
  ShaperRot: undefined, // Rotates position of blade assembly.
  ShaperMacros: undefined, // Predefined presets for shaper positions.
  Video: undefined // Controls video features.
};

/**
 * @param {!object} gdtfCapability The enhanced <ChannelSet> XML object.
 * @param {!string} primaryColor The color that this capability is most likely.
 * @param {!string} secondaryColor The color that this capability is second most likely.
 * @returns {!string} Either the primary, or the secondary color.
 */
function guessColorComponentName(gdtfCapability, primaryColor, secondaryColor) {
  const name = (gdtfCapability._channelFunction._attribute.$.Pretty || ``).toLowerCase();

  if (name.includes(secondaryColor.toLowerCase())) {
    return secondaryColor;
  }

  if (name.includes(primaryColor.toLowerCase())) {
    return primaryColor;
  }

  if (name.includes(secondaryColor.charAt(0).toLowerCase())) {
    return secondaryColor;
  }

  return primaryColor;
}

module.exports = {
  gdtfUnits,
  gdtfAttributes
};
