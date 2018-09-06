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
    if (physicalValuesFulfillCondition(value, otherValue, val => Math.abs(val) < 1)) {
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
  AngularSpeed(value, otherValue) {
    // values are in deg/s

    if (value === 0 && otherValue === null) {
      return `stop`;
    }

    return `${value / 360 * 60}rpm`;
  },
  AngularAcc(value) {
    return `${value}deg/s2`;
  },
  WaveLength(value) {
    return `${value}nm`;
  },
  ColorComponent(value) {
    // this entity is used as a brightness percentage for
    // ColorRGBX attributes (X = 1…16) and CTO / CTC / CTB attributes
    // or as an "index offset" for ColorX attributes (X = 1…4) -> handled before
    return `${value * 100}%`;
  }
};

/**
 * @param {!number} value1 The first physical value.
 * @param {?number} value2 The second physical value, or null.
 * @param {!function} predicate A function returning a boolean.
 * @returns {!boolean} True if all provided values fulfill the condition predicate.
 */
function physicalValuesFulfillCondition(value1, value2, predicate) {
  return predicate(value1) && (value2 === null || predicate(value2));
}


// see https://gdtf-share.com/wiki/GDTF_File_Description#Appendix_A._Attribute_Definitions
const gdtfAttributes = {
  ActiveZone: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  AnimationIndexRotate: undefined, // Controls the animation disk's index or its rotation speed.
  AnimationIndexRotateMode: {
    // Changes control between selecting, indexing, and rotating the animation wheel.
    oflType: `Maintenance`,
    oflProperty: null
  },
  AnimationOffset: undefined, // Controls the animation disk's shaking.
  AnimationWheel: undefined, // Inserts a gobo disk into the beam. The disk has the ability to continuously index and rotate.
  AnimationWheelMacro: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  AnimationWheelPos: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  AnimationWheelPosSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  AnimationWheelShortcutMode: {
    // Defines whether the animation wheel takes the shortest distance between two positions.
    oflType: `Maintenance`,
    oflProperty: null
  },
  BeamEffectIndexRotateMode: {
    // Changes mode to control either index or rotation of the beam effects.
    oflType: `Maintenance`,
    oflProperty: null
  },
  BeamMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  BeamReset: {
    // Resets the fixture's beam features.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Blade1A: {
    // 1 of 2 shutters that shape the top of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Top`;
    }
  },
  Blade1B: {
    // 2 of 2 shutters that shape the top of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Top`;
    }
  },
  Blade1Rot: {
    // Rotates position of blade1.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Top`;
    }
  },
  Blade2A: {
    // 1 of 2 shutters that shape the right of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Right`;
    }
  },
  Blade2B: {
    // 2 of 2 shutters that shape the right of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Right`;
    }
  },
  Blade2Rot: {
    // Rotates position of blade2.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Right`;
    }
  },
  Blade3A: {
    // 1 of 2 shutters that shape the bottom of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Bottom`;
    }
  },
  Blade3B: {
    // 2 of 2 shutters that shape the bottom of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Bottom`;
    }
  },
  Blade3Rot: {
    // Rotates position of blade3.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Bottom`;
    }
  },
  Blade4A: {
    // 1 of 2 shutters that shape the left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Left`;
    }
  },
  Blade4B: {
    // 2 of 2 shutters that shape the left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Left`;
    }
  },
  Blade4Rot: {
    // Rotates position of blade4.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Left`;
    }
  },
  Blower: undefined, // Fog or hazer‘s blower feature.
  Color1: {
    // Selects colors in the fixture's color wheel 1.
    oflType: `ColorWheelIndex`,
    oflProperty: null,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const index = parseInt(gdtfCapability.$.WheelSlotIndex) - 1;
      capability.index = index;

      if (`Wheel` in gdtfCapability._channelFunction.$) {
        const wheelReference = gdtfCapability._channelFunction.$.Wheel;
        const gdtfWheel = followXmlNodeReference(gdtfCapability._fixture.Wheels[0], wheelReference);
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
  Color1Audio: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Color1Index: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Color1Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 1.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Color1Random: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Color1Select: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Color1Spin: {
    // Controls the speed and direction of the fixture's color wheel 1.
    oflType: `ColorWheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Color2: {
    // Selects colors in the fixture's color wheel 2.
    inheritFrom: `Color1`
  },
  Color2Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 2.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Color2Spin: {
    // Controls the speed and direction of the fixture's color wheel 2.
    inheritFrom: `Color1Spin`
  },
  Color3: {
    // Selects colors in the fixture's color wheel 3.
    inheritFrom: `Color1`
  },
  Color3Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 3.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Color3Spin: {
    // Controls the speed and direction of the fixture's color wheel 3.
    inheritFrom: `Color1Spin`
  },
  Color4: {
    // Selects colors in the fixture's color wheel 4.
    inheritFrom: `Color1`
  },
  Color4Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 4.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Color4Spin: {
    // Controls the speed and direction of the fixture's color wheel 4.
    inheritFrom: `Color1Spin`
  },
  ColorControl: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ColorEffects: undefined, // Selects predefined color effects built into the fixture.
  ColorMacro: {
    // Selects predefined colors that are programed in the fixture's firmware.
    oflType: `ColorPreset`,
    oflProperty: null,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      // sometimes a workaround to add color information is used: reference a virtual color wheel

      const index = parseInt(gdtfCapability.$.WheelSlotIndex) - 1;
      if (`Wheel` in gdtfCapability._channelFunction.$) {
        const wheelReference = gdtfCapability._channelFunction.$.Wheel;
        const gdtfWheel = followXmlNodeReference(gdtfCapability._fixture.Wheels[0], wheelReference);
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
    }
  },
  ColorMacro2: {
    // Selects predefined colors that are programed in the fixture's firmware (2).
    inheritFrom: `ColorMacro`
  },
  ColorMacroMSpeed: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ColorMixMode: {
    // Changes control between selecting continuous selection, half selection, random selection, color spinning, etc. in color mixing.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ColorMixMSpeed: {
    // Movement speed of the fixture's ColorMix presets.
    inheritFrom: `IntensityMSpeed`
  },
  ColorMixReset: {
    // Resets the fixture's color mixing system.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ColorRGB1: {
    // Controls the intensity of the fixture's red emitters or its cyan CMY-mixing feature.
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = guessColorComponentName(gdtfCapability, `Red`, `Cyan`);
    }
  },
  ColorRGB2: {
    // Controls the intensity of the fixture's green emitters or its magenta CMY-mixing feature.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = guessColorComponentName(gdtfCapability, `Green`, `Magenta`);
    }
  },
  ColorRGB3: {
    // Controls the intensity of the fixture's blue emitters or its yellow CMY-mixing feature.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = guessColorComponentName(gdtfCapability, `Blue`, `Yellow`);
    }
  },
  ColorRGB4: {
    // Controls the intensity of the fixture's amber emitters.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Amber`;
    }
  },
  ColorRGB5: {
    // Controls the intensity of the fixture's white emitters.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `White`;
    }
  },
  ColorRGB6: {
    // Controls the intensity of the fixture's color emitters.
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
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
  ColorWheelReset: {
    // Resets the fixture's color wheel.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ColorWheelSelectMSpeed: {
    // Movement speed of the fixture's color wheel.
    inheritFrom: `IntensityMSpeed`
  },
  ColorWheelShortcutMode: {
    // Defines whether the color wheel takes the shortest distance between two colors.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Control: {
    // Controls the channel of a fixture.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ControlAutofocus: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlBlackout: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlCalibrationMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlColorMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlCRIMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlDimmerCurve: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlDisplayIntensity: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlDMXInput: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlFanMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlFollowSpotMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlLamp: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlLampMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlPanTiltMode: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlParking: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlReset: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ControlWhiteCount: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  CTB: {
    // Controls the fixture's "Correct to blue" wheel or mixing system.
    inheritFrom: `CTO`
  },
  CTBReset: {
    // Resets the fixture's CTB.
    oflType: `Maintenance`,
    oflProperty: null
  },
  CTC: {
    // Controls the fixture's "Correct to color" wheel or mixing system.
    inheritFrom: `CTO`
  },
  CTCReset: {
    // Resets the fixture's CTC.
    oflType: `Maintenance`,
    oflProperty: null
  },
  CTG: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  CTO: {
    // Controls the fixture's "Correct to orange" wheel or mixing system.
    oflType: `ColorTemperature`,
    oflProperty: `colorTemperature`,
    defaultPhysicalEntity: `Temperature` // ColorComponent is also common
  },
  CTOReset: {
    // Resets the fixture's CTO.
    oflType: `Maintenance`,
    oflProperty: null
  },
  CyanMode: {
    // Controls how Cyan is used within the fixture's cyan CMY-mixing feature.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Dimmer: {
    // Controls the intensity of a fixture.
    oflType: `Intensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `LuminousIntensity`
  },
  DimmerCurve: {
    // Selects different dimmer curves of the fixture.
    oflType: `Maintenance`,
    oflProperty: null
  },
  DimmerMode: {
    // Selects different modes of intensity.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Effects: {
    // Generically predefined macros and effects of a fixture.
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    }
  },
  EffectsFade: {
    // Snapping or smooth look of running effects.
    oflType: `EffectDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`
  },
  EffectsIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsMacro: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsPar1: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsPar2: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsPos: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsPosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsPosSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsRate: {
    // Speed of running effects.
    oflType: `EffectSpeed`,
    oflProperty: guessSpeedOrDuration,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      if (gdtfCapability._channelFunction._attribute.$.PhysicalUnit === `Time`) {
        // overwrite capability type
        capability.type = `EffectDuration`;
      }
    }
  },
  EffectsRateIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsSelectIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsSelectSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsSelectSpinDynamic: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsSync: undefined, // Sets offset between running effects and effects 2.
  Effects2: {
    // Generically predefined macros and effects of a fixture (2).
    inheritFrom: `Effects`
  },
  Effects2Fade: {
    // Snapping or smooth look of running effects (2).
    inheritFrom: `EffectsFade`
  },
  Effects2Macro: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Effects2Par2: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Effects2Pos: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Effects2Rate: {
    // Speed of running effects (2).
    inheritFrom: `EffectsRate`
  },
  Effects3: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Fan: {
    // Fog or hazer's Fan feature.
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Fans: undefined, // Fancontrols a fixture or device.
  FixtureCalibrationReset: {
    // Resets the fixture's calibration.
    oflType: `Maintenance`,
    oflProperty: null
  },
  FixtureGlobalReset: {
    // Generally resets the entire fixture.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Focus: {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot.
    oflType: `Focus`,
    oflProperty: `distance`,
    defaultPhysicalEntity: `Length`
  },
  FocusAdjust: {
    // Autofocuses functionality using presets.
    inheritFrom: `Focus`
  },
  FocusDistance: {
    // Autofocuses functionality using distance.
    inheritFrom: `Focus`
  },
  FocusMode: {
    // Changes modes of the fixture’s focus - manual or auto- focus.
    oflType: `Maintenance`,
    oflProperty: null
  },
  FocusMSpeed: {
    // Movement speed of the fixture's focus.
    inheritFrom: `IntensityMSpeed`
  },
  FocusReset: {
    // Resets the fixture's focus.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Focus2: {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot (2).
    inheritFrom: `Focus`
  },
  Fog: {
    // Fog or hazer's Fog feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.fogType = `Fog`;
    }
  },
  FrameMSpeed: {
    // Movement speed of the fixture's shapers.
    inheritFrom: `IntensityMSpeed`
  },
  FrameReset: {
    // Resets the fixture's shapers.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Frost: {
    // The ability to soften the fixture's spot light with a frosted lens.
    oflType: `Frost`,
    oflProperty: `frostIntensity`,
    defaultPhysicalEntity: `Percent`
  },
  Frost2: {
    // The ability to soften the fixture's spot light with a frosted lens (2).
    inheritFrom: `Frost`
  },
  Frost3: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  FrostHeavy: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  FrostLight: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  FrostMedium: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  FrostMSpeed: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Function: {
    // Generally controls features of the fixture.
    oflType: `Maintenance`,
    oflProperty: null
  },
  GlobalMSpeed: {
    // General speed of fixture's features.
    inheritFrom: `IntensityMSpeed`
  },
  Gobo1: {
    // Selects gobos in the fixture's gobo wheel 1.
    oflType: `GoboIndex`,
    oflProperty: null,
    defaultPhysicalEntity: `None`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const index = parseInt(gdtfCapability.$.WheelSlotIndex) - 1;
      capability.index = index;

      if (`Wheel` in gdtfCapability._channelFunction.$) {
        const wheelReference = gdtfCapability._channelFunction.$.Wheel;
        const gdtfWheel = followXmlNodeReference(gdtfCapability._fixture.Wheels[0], wheelReference);
        const gdtfSlot = gdtfWheel.Slot[index];

        if (gdtfSlot) {
          if (gdtfCapability.$.Name !== gdtfSlot.$.Name) {
            gdtfCapability.$.Name += ` (${gdtfSlot.$.Name})`;
          }
        }
      }

      const physicalFrom = gdtfCapability._physicalFrom;
      const physicalTo = gdtfCapability._physicalTo;

      // TODO: support physical values -0.5…0.5 to specify proportional gobo wheel capabilities
      if (physicalFrom !== 0 || physicalTo !== 1) {
        gdtfCapability.$.Name += ` ${physicalFrom}…${physicalTo}`;
      }
    }
  },
  Gobo1Audio: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo1Pos: {
    // Controls angle of indexed rotation of gobos in gobo wheel 1.
    oflType: `GoboStencilRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  Gobo1PosRotation: {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel 1.
    oflType: `GoboStencilRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Gobo1Random: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo1RandomAudio: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo1Select: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo1Shake: {
    // Control the frequency of the shake of gobo wheel 1.
    inheritFrom: `Gobo1`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`
  },
  Gobo1Spin: {
    // Controls the speed and direction of the continuous rotation of gobo wheel 1.
    oflType: `GoboWheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Gobo1WheelMode: {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel 1.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Gobo1WheelShake: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo1WheelSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2: {
    // Selects gobos in the fixture's gobo wheel 2.
    inheritFrom: `Gobo1`
  },
  Gobo2GoboIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2GoboShakeIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2Pos: {
    // Controls the angle of indexed rotation of gobos in gobo wheel 2.
    inheritFrom: `Gobo1Pos`
  },
  Gobo2PosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2PosRotation: {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel 2.
    inheritFrom: `Gobo1PosRotation`
  },
  Gobo2PosSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2Random: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2SelectIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2SelectShakeIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2SelectShakeSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2SelectSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2Shake: {
    // Control the frequency of the shake of gobo wheel 2.
    inheritFrom: `Gobo1`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`
  },
  Gobo2Spin: {
    // Controls the speed and direction of the continuous rotation of gobo wheel 2.
    inheritFrom: `Gobo1Spin`
  },
  Gobo2WheelMode: {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel 2.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Gobo2WheelSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo3: {
    // Selects gobos in the fixture's gobo wheel 3.
    inheritFrom: `Gobo1`
  },
  Gobo3Pos: {
    // Controls the angle of indexed rotation of gobos in gobo wheel 3.
    inheritFrom: `Gobo1Pos`
  },
  Gobo3PosRotation: {
    // Controls the speed and direction of the continuous rotation of gobos in gobo wheel 3.
    inheritFrom: `Gobo1PosRotation`
  },
  Gobo3Shake: {
    // Control the frequency of the shake of gobo wheel 3.
    inheritFrom: `Gobo1`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`
  },
  Gobo3Spin: {
    // Controls the speed and direction of the continuous rotation of gobo wheel 3.
    inheritFrom: `Gobo1Spin`
  },
  Gobo3WheelMode: {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel 3.
    oflType: `Maintenance`,
    oflProperty: null
  },
  GoboWheelMSpeed: {
    // Movement speed of the fixture's gobo wheel.
    inheritFrom: `IntensityMSpeed`
  },
  GoboWheelReset: {
    // Resets the fixture's gobo wheel.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Haze: {
    // Fog or hazer's haze feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.fogType = `Haze`;
    }
  },
  'HSB_Brightness': undefined, // Controls the fixture's color attribute regarding the brightness.
  'HSB_Hue': undefined, // Controls the fixture's color attribute regarding the hue.
  'HSB_Quality': undefined, // Controls the fixture's color attribute regarding the quality.
  'HSB_Saturation': undefined, // Controls the fixture's color attribute regarding the saturation.
  IntensityMSpeed: {
    // Movement speed of the fixture's intensity.
    oflType: `Speed`,
    oflProperty: guessSpeedOrDuration,
    defaultPhysicalEntity: `Speed`
  },
  IntensityReset: {
    // Resets the fixture's intensity.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Iris: {
    // Controls the diameter of the fixture's beam.
    oflType: `Iris`,
    oflProperty: `openPercent`,
    defaultPhysicalEntity: `Angle`
  },
  IrisMode: {
    // Changes modes of the fixture’s iris - linear, strobe, pulse.
    oflType: `Maintenance`,
    oflProperty: null
  },
  IrisMSpeed: {
    // Movement speed of the fixture's iris.
    inheritFrom: `IntensityMSpeed`
  },
  IrisPulseClose: {
    // Sets speed of iris‘s closing pulse.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `RampDown`;
    }
  },
  IrisPulseOpen: {
    // Sets speed of iris‘s opening pulse.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `RampUp`;
    }
  },
  IrisReset: {
    // Resets the fixture's iris.
    oflType: `Maintenance`,
    oflProperty: null
  },
  IrisStrobe: {
    // Sets speed of the iris’s strobe feature.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `Strobe`;
    }
  },
  LampControl: {
    // Controls the fixture's lamp on/lamp off feature.
    oflType: `Maintenance`,
    oflProperty: null
  },
  LampPowerMode: {
    // Controls the energy consumption of the lamp.
    oflType: `Maintenance`,
    oflProperty: null
  },
  MagentaMode: {
    // Controls how Cyan is used within the fixture's magenta CMY-mixing.
    oflType: `Maintenance`,
    oflProperty: null
  },
  NoFeature: {
    // Ranges without a functionality.
    oflType: `NoFunction`,
    oflProperty: null
  },
  Pan: {
    // Controls the fixture's sideward movement (horizontal axis).
    oflType: `Pan`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  PanMode: {
    // Selects fixture's pan mode. Selects between a limited pan range (e.g. -270 to 270) or a continuous pan range.
    oflType: `Maintenance`,
    oflProperty: null
  },
  PanReset: {
    // Resets the fixture's pan.
    oflType: `Maintenance`,
    oflProperty: null
  },
  PositionEffect: undefined, // Selects the predefined position effects that are built into the fixture.
  PositionEffectRate: undefined, // Controls the speed of the predefined position effects that are built into the fixture.
  PositionEffectFade: undefined, // Snaps or smooth fades with timing in running predefined position effects.
  PositionModes: {
    // Selects the fixture's position mode.
    // TODO: Is this a typo in the GDTF Wiki and it should be "PositionMode"?
    oflType: `Maintenance`,
    oflProperty: null
  },
  PositionMSpeed: {
    // Movement speed of the fixture's pan/tilt.
    inheritFrom: `IntensityMSpeed`,
    oflType: `PanTiltSpeed`
  },
  PositionReset: {
    // Resets the fixture's pan/tilt.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Prism: {
    // Controls the insertion of fixture ́s prism wheel 1. Refracts the beam into multiple beams of light on wheel 1.
    oflType: `Prism`,
    oflProperty: null,
    defaultPhysicalEntity: `None`
  },
  PrismPos: {
    // Controls the indexed position of fixture‘s prism on prism wheel 1.
    oflType: `PrismRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  PrismPosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  PrismPosRotation: {
    // Controls the speed and direction of the continuous rotation of the fixture’s prism on prism wheel 1.
    oflType: `PrismRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  PrismPrismIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1Pos: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1PosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1PosSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1SelectIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1SelectSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism2: {
    // Controls the insertion of fixture´s prism wheel 2. Refracts the beam into multiple beams of light on wheel 2.
    inheritFrom: `Prism`
  },
  Prism2Pos: {
    // Controls the indexed position of fixture‘s prism on prism wheel 2.
    inheritFrom: `PrismPos`
  },
  Prism2PosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism2PosRotation: {
    // Controls the speed and direction of the continuous rotation of the fixture’s prism on prism wheel 2.
    inheritFrom: `PrismPosRotation`
  },
  Prism2PosSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism2PrismIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism2SelectIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism2SelectSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  PrismMSpeed: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Shaper: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperMacros: undefined, // Predefined presets for shaper positions.
  ShaperPos: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperPosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperPosSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperRot: {
    // Rotates position of blade assembly.
    oflType: `BladeSystemRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  ShaperRotIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperSelectIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperSelectSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Shutter: {
    // Controls the fixture´s mechanical or electronical shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: null,
    defaultPhysicalEntity: `Frequency`, // although that makes little sense since 0 means closed and 1 means open
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const physicalFrom = gdtfCapability._physicalFrom;
      const physicalTo = gdtfCapability._physicalTo;

      if (physicalFrom === 0 && physicalTo === 0) {
        capability.shutterEffect = `Closed`;
      }
      else if (physicalFrom === 1 && physicalTo === 1) {
        capability.shutterEffect = `Open`;
      }
      else {
        capability.helpWanted = `What does physical value ${physicalFrom}…${physicalTo} mean?`;
      }
    }
  },
  ShutterReset: {
    // Resets the fixture's shutter.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ShutterStrobe: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Strobe`;
    }
  },
  ShutterStrobePulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Pulse`;
    }
  },
  ShutterStrobePulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampDown`;
    }
  },
  ShutterStrobePulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampUp`;
    }
  },
  ShutterStrobeRandom: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random strobe shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Strobe`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.randomTiming = true;
    }
  },
  ShutterStrobeRandomPulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Pulse`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.randomTiming = true;
    }
  },
  ShutterStrobeRandomPulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random closing pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampDown`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.randomTiming = true;
    }
  },
  ShutterStrobeRandomPulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random opening pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampUp`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.randomTiming = true;
    }
  },
  Shutter2: {
    // Controls the fixture´s mechanical or electronical shutter feature (2). Is used with foreground/background strobe.
    inheritFrom: `Shutter1`
  },
  Shutter2Strobe: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical strobe shutter feature (2).
    inheritFrom: `Shutter1Strobe`
  },
  Shutter2StrobePulse: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical pulse shutter feature (2).
    inheritFrom: `Shutter1StrobePulse`
  },
  Shutter2StrobePulseClose: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical closing pulse shutter feature (2).
    inheritFrom: `Shutter1StrobePulseClose`
  },
  Shutter2StrobePulseOpen: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical opening pulse shutter feature (2).
    inheritFrom: `Shutter1StrobePulseOpen`
  },
  Shutter2StrobeRandom: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random strobe shutter feature (2).
    inheritFrom: `Shutter1StrobeRandom`
  },
  Shutter2StrobeRandomPulse: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random pulse shutter feature (2).
    inheritFrom: `Shutter1StrobeRandomPulse`
  },
  Shutter2StrobeRandomPulseClose: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random closing pulse shutter feature (2).
    inheritFrom: `Shutter1StrobeRandomPulseClose`
  },
  Shutter2StrobeRandomPulseOpen: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random opening pulse shutter feature (2).
    inheritFrom: `Shutter1StrobeRandomPulseOpen`
  },
  Shutter3: {
    // Controls the fixture ´s mechanical or electronical shutter feature (3). Is used with foreground/background strobe.
    inheritFrom: `Shutter1`
  },
  Shutter3Strobe: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature (3).
    inheritFrom: `Shutter1Strobe`
  },
  Shutter3StrobePulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature (3).
    inheritFrom: `Shutter1StrobePulse`
  },
  Shutter3StrobePulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature (3).
    inheritFrom: `Shutter1StrobePulseClose`
  },
  Shutter3StrobePulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature (3).
    inheritFrom: `Shutter1StrobePulseOpen`
  },
  Shutter3StrobeRandom: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random strobe shutter feature (3).
    inheritFrom: `Shutter1StrobeRandom`
  },
  Shutter3StrobeRandomPulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random pulse shutter feature (3).
    inheritFrom: `Shutter1StrobeRandomPulse`
  },
  Shutter3StrobeRandomPulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random closing pulse shutter feature (3).
    inheritFrom: `Shutter1StrobeRandomPulseClose`
  },
  Shutter3StrobeRandomPulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random opening pulse shutter feature (3).
    inheritFrom: `Shutter1StrobeRandomPulseOpen`
  },
  StrobeDuration: {
    // Controls the length of a strobe flash.
    oflType: `StrobeDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`
  },
  StrobeMode: {
    // Changes strobe style - strobe, pulse, random strobe, etc. - of the shutter attribute.
    oflType: `Maintenance`,
    oflProperty: null
  },
  StrobeRate: {
    // Controls the time between strobe flashes.
    oflType: `StrobeSpeed`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`
  },
  Tilt: {
    // Controls the fixture's upward and the downward movement (vertical axis).
    oflType: `Tilt`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  TiltMode: {
    // Selects fixture's pan mode. Selects between a limited tilt range (e.g. -130 to 130) or a continuous tilt range.
    oflType: `Maintenance`,
    oflProperty: null
  },
  TiltReset: {
    // Resets the fixture's tilt.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Video: undefined, // Controls video features.
  XYZ_X: undefined, // Defines a fixture’s x-coordinate within an XYZ coordinate system.
  XYZ_Y: undefined, // Defines a fixture’s y-coordinate within an XYZ coordinate system.
  XYZ_Z: undefined, // Defines a fixture‘s z-coordinate within an XYZ coordinate system.
  YellowMode: {
    // Controls how Cyan is used within the fixture's yellow CMY-mixing feature.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Zoom: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Zoom`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  ZoomMSpeed: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ZoomReset: {
    // Resets the fixture's zoom.
    oflType: `Maintenance`,
    oflProperty: null
  }
};

/**
 * @param {!object} gdtfCapability The enhanced <ChannelSet> XML object.
 */
function normalizeAngularSpeedDirection(gdtfCapability) {
  if (/CCW|counter[-\s]*clockwise/.test(gdtfCapability.$.Name)) {
    gdtfCapability._physicalFrom = -Math.abs(gdtfCapability._physicalFrom);
    gdtfCapability._physicalTo = -Math.abs(gdtfCapability._physicalTo);
  }
  else if (/CW|clockwise/.test(gdtfCapability.$.Name)) {
    gdtfCapability._physicalFrom = Math.abs(gdtfCapability._physicalFrom);
    gdtfCapability._physicalTo = Math.abs(gdtfCapability._physicalTo);
  }
}

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

/**
 * @param {!object} gdtfCapability The enhanced <ChannelSet> XML object.
 * @returns {'speed'|'duration'} The OFL property to use for this capability.
 */
function guessSpeedOrDuration(gdtfCapability) {
  return gdtfCapability._channelFunction._attribute.$.PhysicalUnit === `Time` ? `duration` : `speed`;
}

module.exports = {
  gdtfUnits,
  gdtfAttributes
};
