const {
  followXmlNodeReference,
  getRgbColorFromGdtfColor,
  normalizeAngularSpeedDirection,
} = require(`./gdtf-helpers.js`);
const deprecatedGdtfAttributes = require(`./deprecated-gdtf-attributes.js`);

// see https://gdtf-share.com/wiki/GDTF_File_Description#Attribute
const gdtfUnits = {
  None(value) {
    return value;
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
  Wavelength(value) {
    // it's actually 'WaveLength' in GDTF, but likely to change in the next GDTF version
    // see https://github.com/OpenLightingProject/open-fixture-library/pull/1084
    return `${value}nm`;
  },
  ColorComponent(value) {
    // this entity is used as a brightness percentage for
    // ColorRGBX attributes (X = 1…16) and CTO / CTC / CTB attributes
    // or as an "index offset" for ColorX attributes (X = 1…4) -> handled before
    return `${value * 100}%`;
  },
};

/**
 * @param {Number} value1 The first physical value.
 * @param {Number|null} value2 The second physical value, or null.
 * @param {Function} predicate A function returning a boolean.
 * @returns {Boolean} True if all provided values fulfill the condition predicate.
 */
function physicalValuesFulfillCondition(value1, value2, predicate) {
  return predicate(value1) && (value2 === null || predicate(value2));
}


// see https://gdtf-share.com/wiki/GDTF_File_Description#Appendix_A._Attribute_Definitions
const gdtfAttributes = {
  AnimationIndexRotate: {
    // Controls the animation disk's index or its rotation speed.
    inheritFrom: `AnimationWheelPosSpin`,
  },
  AnimationIndexRotateMode: {
    // Changes control between selecting, indexing, and rotating the animation wheel.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  AnimationOffset: {
    // Controls the animation disk's shaking.
    oflType: `WheelShake`,
    oflProperty: `shakeAngle`,
    defaultPhysicalEntity: `Percent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = `Animation Disk`;
    },
  },
  AnimationWheel: {
    // Inserts a gobo disk into the beam. The disk has the ability to continuously index and rotate.
    oflType: `Effect`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `Animation Disk insertion`;
    },
  },
  AnimationWheelShortcutMode: {
    // Defines whether the animation wheel takes the shortest distance between two positions.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  BeamEffectIndexRotateMode: {
    // Changes mode to control either index or rotation of the beam effects.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  BeamReset: {
    // Resets the fixture's beam features.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  Blade1A: {
    // 1 of 2 shutters that shape the top of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Top`;
    },
  },
  Blade1B: {
    // 2 of 2 shutters that shape the top of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Top`;
    },
  },
  Blade1Rot: {
    // Rotates position of blade1.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Top`;
    },
  },
  Blade2A: {
    // 1 of 2 shutters that shape the right of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Right`;
    },
  },
  Blade2B: {
    // 2 of 2 shutters that shape the right of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Right`;
    },
  },
  Blade2Rot: {
    // Rotates position of blade2.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Right`;
    },
  },
  Blade3A: {
    // 1 of 2 shutters that shape the bottom of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Bottom`;
    },
  },
  Blade3B: {
    // 2 of 2 shutters that shape the bottom of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Bottom`;
    },
  },
  Blade3Rot: {
    // Rotates position of blade3.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Bottom`;
    },
  },
  Blade4A: {
    // 1 of 2 shutters that shape the left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Left`;
    },
  },
  Blade4B: {
    // 2 of 2 shutters that shape the left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Left`;
    },
  },
  Blade4Rot: {
    // Rotates position of blade4.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.blade = `Left`;
    },
  },
  Blower: undefined, // Fog or hazer‘s blower feature.
  Color1: {
    // The fixture’s color wheel 1. Selects colors in color wheel 1. This is the main attribute of color wheel’s 1 wheel control.
    oflType: `WheelSlot`,
    oflProperty: `slotNumber`,
    defaultPhysicalEntity: `None`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = parseInt(gdtfCapability.$.WheelSlotIndex, 10);

      let slotNumberStart = gdtfSlotNumber;
      let slotNumberEnd = gdtfSlotNumber;

      const physicalFrom = gdtfCapability._physicalFrom;
      const physicalTo = gdtfCapability._physicalTo;

      if (physicalFrom !== 0 || physicalTo !== 1) {
        slotNumberStart += physicalFrom;
        slotNumberEnd += physicalTo;
      }

      // write back physical values so that they can be assigned to slotNumber or slotNumberStart/slotNumberEnd
      gdtfCapability._physicalFrom = slotNumberStart;
      gdtfCapability._physicalTo = slotNumberEnd;

      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotIndex = parseInt(gdtfCapability.$.WheelSlotIndex, 10) - 1;

      if (`Wheel` in gdtfCapability._channelFunction.$) {
        const wheelReference = gdtfCapability._channelFunction.$.Wheel;
        const gdtfWheel = followXmlNodeReference(gdtfCapability._fixture.Wheels[0], wheelReference);
        const gdtfSlot = gdtfWheel.Slot[gdtfSlotIndex];

        if (gdtfSlot && gdtfCapability.$.Name === gdtfSlot.$.Name) {
          // clear comment
          gdtfCapability.$.Name = ``;
        }
      }
    },
  },
  Color1Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 1.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Color1WheelAudio: {
    // Controls audio-controlled functionality of color wheel 1 (since GDTF v0.88)
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.soundControlled = true;
    },
  },
  Color1WheelIndex: {
    // Controls angle of indexed rotation of color wheel 1 (since GDTF v0.88)
    oflType: `WheelRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
    },
  },
  Color1WheelRandom: {
    // Controls speed of color wheel´s 1 random color slot selection. (since GDTF v0.88)
    inheritFrom: `Effects`,
  },
  Color1WheelSpin: {
    // Controls the speed and direction of continuous rotation of color wheel 1.
    oflType: `WheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  Color2: {
    // The fixture’s color wheel 2. Selects colors in color wheel 2. This is the main attribute of color wheel’s 2 wheel control.
    inheritFrom: `Color1`,
  },
  Color2Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 2.
    inheritFrom: `Color1Mode`,
  },
  Color2WheelAudio: {
    // Controls audio-controlled functionality of color wheel 2 (since GDTF v0.88)
    inheritFrom: `Color1WheelAudio`,
  },
  Color2WheelIndex: {
    // Controls angle of indexed rotation of color wheel 2 (since GDTF v0.88)
    inheritFrom: `Color1WheelIndex`,
  },
  Color2WheelRandom: {
    // Controls speed of color wheel´s 2 random color slot selection. (since GDTF v0.88)
    inheritFrom: `Color1WheelRandom`,
  },
  Color2WheelSpin: {
    // Controls the speed and direction of continuous rotation of color wheel 2.
    inheritFrom: `Color1WheelSpin`,
  },
  Color3: {
    // The fixture’s color wheel 3. Selects colors in color wheel 3. This is the main attribute of color wheel’s 3 wheel control.
    inheritFrom: `Color1`,
  },
  Color3Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 3.
    inheritFrom: `Color1Mode`,
  },
  Color3WheelAudio: {
    // Controls audio-controlled functionality of color wheel 3 (since GDTF v0.88)
    inheritFrom: `Color1WheelAudio`,
  },
  Color3WheelIndex: {
    // Controls angle of indexed rotation of color wheel 3 (since GDTF v0.88)
    inheritFrom: `Color1WheelIndex`,
  },
  Color3WheelRandom: {
    // Controls speed of color wheel´s 3 random color slot selection. (since GDTF v0.88)
    inheritFrom: `Color1WheelRandom`,
  },
  Color3WheelSpin: {
    // Controls the speed and direction of continuous rotation of color wheel 3.
    inheritFrom: `Color1WheelSpin`,
  },
  Color4: {
    // The fixture’s color wheel 4. Selects colors in color wheel 4. This is the main attribute of color wheel’s 4 wheel control.
    inheritFrom: `Color1`,
  },
  Color4Mode: {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 4.
    inheritFrom: `Color1Mode`,
  },
  Color4WheelAudio: {
    // Controls audio-controlled functionality of color wheel 4 (since GDTF v0.88)
    inheritFrom: `Color1WheelAudio`,
  },
  Color4WheelIndex: {
    // Controls angle of indexed rotation of color wheel 4 (since GDTF v0.88)
    inheritFrom: `Color1WheelIndex`,
  },
  Color4WheelRandom: {
    // Controls speed of color wheel´s 4 random color slot selection. (since GDTF v0.88)
    inheritFrom: `Color1WheelRandom`,
  },
  Color4WheelSpin: {
    // Controls the speed and direction of continuous rotation of color wheel 4.
    inheritFrom: `Color1WheelSpin`,
  },
  ColorEffects: {
    // Selects predefined color effects built into the fixture.
    inheritFrom: `Effects`,
  },
  ColorMacro: {
    // Selects predefined colors that are programed in the fixture's firmware.
    oflType: `ColorPreset`,
    oflProperty: null,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      // sometimes a workaround to add color information is used: reference a virtual color wheel

      const index = parseInt(gdtfCapability.$.WheelSlotIndex, 10) - 1;
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
    },
  },
  ColorMacro2: {
    // Selects predefined colors that are programed in the fixture's firmware (2).
    inheritFrom: `ColorMacro`,
  },
  ColorMixMode: {
    // Changes control between selecting continuous selection, half selection, random selection, color spinning, etc. in color mixing.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  ColorMixMSpeed: {
    // Movement speed of the fixture's ColorMix presets.
    inheritFrom: `IntensityMSpeed`,
  },
  ColorMixReset: {
    // Resets the fixture's color mixing system.
    inheritFrom: `BeamReset`,
  },
  ColorRGB1: {
    // Controls the intensity of the fixture's red emitters or its cyan CMY-mixing feature.
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = guessColorComponentName(gdtfCapability, `Red`, `Cyan`);
    },
  },
  ColorRGB2: {
    // Controls the intensity of the fixture's green emitters or its magenta CMY-mixing feature.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = guessColorComponentName(gdtfCapability, `Green`, `Magenta`);
    },
  },
  ColorRGB3: {
    // Controls the intensity of the fixture's blue emitters or its yellow CMY-mixing feature.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = guessColorComponentName(gdtfCapability, `Blue`, `Yellow`);
    },
  },
  ColorRGB4: {
    // Controls the intensity of the fixture's amber emitters.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Amber`;
    },
  },
  ColorRGB5: {
    // Controls the intensity of the fixture's white emitters.
    inheritFrom: `ColorRGB1`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `White`;
    },
  },
  ColorRGB6: {
    // Controls the intensity of the fixture's color emitters.
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      // This is most likely wrong but enables the user to make an informed choice.
      capability.color = gdtfCapability._channelFunction._attribute.$.Pretty || `Unknown`;
    },
  },
  ColorRGB7: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB8: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB9: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB10: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB11: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB12: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB13: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB14: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB15: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorRGB16: {
    // Controls the intensity of the fixture's color emitters.
    inheritFrom: `ColorRGB6`,
  },
  ColorWheelReset: {
    // Resets the fixture's color wheel.
    inheritFrom: `BeamReset`,
  },
  ColorWheelSelectMSpeed: {
    // Movement speed of the fixture's color wheel.
    inheritFrom: `IntensityMSpeed`,
  },
  ColorWheelShortcutMode: {
    // Defines whether the color wheel takes the shortest distance between two colors.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Control: {
    // Controls the channel of a fixture.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  CTB: {
    // Controls the fixture's "Correct to blue" wheel or mixing system.
    inheritFrom: `CTO`,
  },
  CTBReset: {
    // Resets the fixture's CTB.
    inheritFrom: `BeamReset`,
  },
  CTC: {
    // Controls the fixture's "Correct to color" wheel or mixing system.
    inheritFrom: `CTO`,
  },
  CTCReset: {
    // Resets the fixture's CTC.
    inheritFrom: `BeamReset`,
  },
  CTO: {
    // Controls the fixture's "Correct to orange" wheel or mixing system.
    oflType: `ColorTemperature`,
    oflProperty: `colorTemperature`,
    defaultPhysicalEntity: `Temperature`, // ColorComponent is also common
  },
  CTOReset: {
    // Resets the fixture's CTO.
    inheritFrom: `BeamReset`,
  },
  CyanMode: {
    // Controls how Cyan is used within the fixture's cyan CMY-mixing feature.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Dimmer: {
    // Controls the intensity of a fixture.
    oflType: `Intensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `LuminousIntensity`,
  },
  DimmerCurve: {
    // Selects different dimmer curves of the fixture.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  DimmerMode: {
    // Selects different modes of intensity.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Effects: {
    // Generically predefined macros and effects of a fixture.
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    },
  },
  EffectsFade: {
    // Snapping or smooth look of running effects.
    oflType: `EffectDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`,
  },
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
    },
  },
  EffectsSync: undefined, // Sets offset between running effects and effects 2.
  Effects2: {
    // Generically predefined macros and effects of a fixture (2).
    inheritFrom: `Effects`,
  },
  Effects2Fade: {
    // Snapping or smooth look of running effects (2).
    inheritFrom: `EffectsFade`,
  },
  Effects2Rate: {
    // Speed of running effects (2).
    inheritFrom: `EffectsRate`,
  },
  Fan: {
    // Fog or hazer's Fan feature.
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  Fans: undefined, // Fancontrols a fixture or device.
  FixtureCalibrationReset: {
    // Resets the fixture's calibration.
    inheritFrom: `BeamReset`,
  },
  FixtureGlobalReset: {
    // Generally resets the entire fixture.
    inheritFrom: `BeamReset`,
  },
  Focus: {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot.
    oflType: `Focus`,
    oflProperty: `distance`,
    defaultPhysicalEntity: `Length`,
  },
  FocusAdjust: {
    // Autofocuses functionality using presets.
    inheritFrom: `Focus`,
  },
  FocusDistance: {
    // Autofocuses functionality using distance.
    inheritFrom: `Focus`,
  },
  FocusMode: {
    // Changes modes of the fixture’s focus - manual or auto- focus.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  FocusMSpeed: {
    // Movement speed of the fixture's focus.
    inheritFrom: `IntensityMSpeed`,
  },
  FocusReset: {
    // Resets the fixture's focus.
    inheritFrom: `BeamReset`,
  },
  Focus2: {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot (2).
    inheritFrom: `Focus`,
  },
  Fog: {
    // Fog or hazer's Fog feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.fogType = `Fog`;
    },
  },
  FrameMSpeed: {
    // Movement speed of the fixture's shapers.
    inheritFrom: `IntensityMSpeed`,
  },
  FrameReset: {
    // Resets the fixture's shapers.
    inheritFrom: `BeamReset`,
  },
  Frost: {
    // The ability to soften the fixture's spot light with a frosted lens.
    oflType: `Frost`,
    oflProperty: `frostIntensity`,
    defaultPhysicalEntity: `Percent`,
  },
  Frost2: {
    // The ability to soften the fixture's spot light with a frosted lens (2).
    inheritFrom: `Frost`,
  },
  Function: {
    // Generally controls features of the fixture.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  GlobalMSpeed: {
    // General speed of fixture's features.
    inheritFrom: `IntensityMSpeed`,
  },
  Gobo1: {
    // The fixture’s gobo wheel 1. This is the main attribute of gobo wheel’s 1 wheel control. Selects gobos in gobo wheel 1. A different channel function sets the angle of the indexed position in the selected gobo or the angular speed of its continuous rotation.
    oflType: `WheelSlot`,
    oflProperty: `slotNumber`,
    defaultPhysicalEntity: `None`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = parseInt(gdtfCapability.$.WheelSlotIndex, 10);

      let slotNumberStart = gdtfSlotNumber;
      let slotNumberEnd = gdtfSlotNumber;

      const physicalFrom = gdtfCapability._physicalFrom;
      const physicalTo = gdtfCapability._physicalTo;

      if (physicalFrom !== 0 || physicalTo !== 1) {
        slotNumberStart += physicalFrom;
        slotNumberEnd += physicalTo;
      }

      // write back physical values so that they can be assigned to slotNumber or slotNumberStart/slotNumberEnd
      gdtfCapability._physicalFrom = slotNumberStart;
      gdtfCapability._physicalTo = slotNumberEnd;

      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotIndex = parseInt(gdtfCapability.$.WheelSlotIndex, 10) - 1;

      if (`Wheel` in gdtfCapability._channelFunction.$) {
        const wheelReference = gdtfCapability._channelFunction.$.Wheel;
        const gdtfWheel = followXmlNodeReference(gdtfCapability._fixture.Wheels[0], wheelReference);
        const gdtfSlot = gdtfWheel.Slot[gdtfSlotIndex];

        if (gdtfSlot && gdtfCapability.$.Name === gdtfSlot.$.Name) {
          // clear comment
          gdtfCapability.$.Name = ``;
        }
      }
    },
  },
  Gobo1Pos: {
    // Controls angle of indexed rotation of gobos in gobo wheel 1. This is the main attribute of gobo wheel’s 1 wheel slot control.
    oflType: `WheelSlotRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
    },
  },
  Gobo1PosRotate: {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel 1.
    oflType: `WheelSlotRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  Gobo1PosShake: {
    // Controls frequency of the shake of gobos in gobo wheel 1. (since GDTF v0.88)
    inheritFrom: `Gobo1`,
    oflType: `WheelShake`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = parseInt(gdtfCapability.$.WheelSlotIndex, 10);

      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      capability.isShaking = `slot`;
      capability.slotNumber = gdtfSlotNumber;
    },
  },
  Gobo1SelectSpin: {
    // Selects gobos whose rotation is continuous in gobo wheel 1 and controls the angular speed of the gobo’s spin within the same channel function. (since GDTF v0.88)
    inheritFrom: `Gobo1`,
  },
  Gobo1SelectShake: {
    // Selects gobos which shake in gobo wheel 1 and controls the frequency of the gobo’s shake within the same channel function. (since GDTF v0.88)
    inheritFrom: `Gobo1WheelShake`,
  },
  Gobo1SelectEffects: {
    // Selects gobos which run effects in gobo wheel 1. (since GDTF v0.88)
    inheritFrom: `Gobo1`,
  },
  Gobo1WheelAudio: {
    // Controls audio-controlled functionality of gobo wheel 1. (since GDTF v0.88)
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.soundControlled = true;
    },
  },
  Gobo1WheelIndex: {
    // Controls angle of indexed rotation of gobo wheel 1. (since GDTF v0.88)
    inheritFrom: `Gobo1`,
  },
  Gobo1WheelMode: {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel 1.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Gobo1WheelShake: {
    // Controls frequency of the shake of gobo wheel 1.
    inheritFrom: `Gobo1`,
    oflType: `WheelShake`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = parseInt(gdtfCapability.$.WheelSlotIndex, 10);

      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      capability.slotNumber = gdtfSlotNumber;
    },
  },
  Gobo1WheelSpin: {
    // Controls the speed and direction of continuous rotation of gobo wheel 1.
    oflType: `WheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  Gobo1WheelRandom: {
    // Controls speed of gobo wheel´s 1 random gobo slot selection. (since GDTF v0.88)
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    },
  },
  Gobo2: {
    // Selects gobos in the fixture's gobo wheel 2.
    inheritFrom: `Gobo1`,
  },
  Gobo2Pos: {
    // Controls angle of indexed rotation of gobos in gobo wheel 2. This is the main attribute of gobo wheel’s 2 wheel slot control.
    inheritFrom: `Gobo1Pos`,
  },
  Gobo2PosRotate: {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel 2.
    inheritFrom: `Gobo1PosRotate`,
  },
  Gobo2PosShake: {
    // Controls frequency of the shake of gobos in gobo wheel 2. (since v0.88)
    inheritFrom: `Gobo1PosShake`,
  },
  Gobo2SelectEffects: {
    // Selects gobos which run effects in gobo wheel 2. (since GDTF v0.88)
    inheritFrom: `Gobo1SelectEffects`,
  },
  Gobo2SelectShake: {
    // Selects gobos which shake in gobo wheel 2 and controls the frequency of the gobo’s shake within the same channel function. (since GDTF v0.88)
    inheritFrom: `Gobo1SelectShake`,
  },
  Gobo2SelectSpin: {
    // Selects gobos whose rotation is continuous in gobo wheel 2 and controls the angular speed of the gobo’s spin within the same channel function. (since GDTF v0.88)
    inheritFrom: `Gobo1SelectSpin`,
  },
  Gobo2WheelAudio: {
    // Controls audio-controlled functionality of gobo wheel 2. (since v0.88)
    inheritFrom: `Gobo1WheelAudio`,
  },
  Gobo2WheelIndex: {
    // Controls angle of indexed rotation of gobo wheel 2. (since v0.88)
    inheritFrom: `Gobo1WheelIndex`,
  },
  Gobo2WheelMode: {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel 2.
    inheritFrom: `Gobo1WheelMode`,
  },
  Gobo2WheelRandom: {
    // Controls speed of gobo wheel´s 2 random gobo slot selection. (since v0.88)
    inheritFrom: `Gobo1WheelRandom`,
  },
  Gobo2WheelShake: {
    // Controls frequency of the shake of gobo wheel 2.
    inheritFrom: `Gobo1WheelShake`,
  },
  Gobo2WheelSpin: {
    // Controls the speed and direction of continuous rotation of gobo wheel 2.
    inheritFrom: `Gobo1WheelSpin`,
  },
  Gobo3: {
    // The fixture’s gobo wheel 3. This is the main attribute of gobo wheel’s 3 wheel control. Selects gobos in gobo wheel 3. A different channel function sets the angle of the indexed position in the selected gobo or the angular speed of its continuous rotation.
    inheritFrom: `Gobo1`,
  },
  Gobo3Pos: {
    // Controls angle of indexed rotation of gobos in gobo wheel 3. This is the main attribute of gobo wheel’s 3 wheel slot control.
    inheritFrom: `Gobo1Pos`,
  },
  Gobo3PosShake: {
    // Controls frequency of the shake of gobos in gobo wheel 3. (since v0.88)
    inheritFrom: `Gobo1PosShake`,
  },
  Gobo3PosRotate: {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel 3.
    inheritFrom: `Gobo1PosRotate`,
  },
  Gobo3SelectEffects: {
    // Selects gobos which run effects in gobo wheel 3. (since v0.88)
    inheritFrom: `Gobo1SelectEffects`,
  },
  Gobo3SelectShake: {
    // Selects gobos which shake in gobo wheel 3 and controls the frequency of the gobo’s shake within the same channel function. (since v0.88)
    inheritFrom: `Gobo1SelectShake`,
  },
  Gobo3SelectSpin: {
    // Selects gobos whose rotation is continuous in gobo wheel 3 and controls the angular speed of the gobo’s spin within the same channel function. (since v0.88)
    inheritFrom: `Gobo1SelectSpin`,
  },
  Gobo3WheelAudio: {
    // Controls audio-controlled functionality of gobo wheel 3. (since v0.88)
    inheritFrom: `Gobo1WheelAudio`,
  },
  Gobo3WheelIndex: {
    // Controls angle of indexed rotation of gobo wheel 3. (since v0.88)
    inheritFrom: `Gobo1WheelIndex`,
  },
  Gobo3WheelMode: {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel 3.
    inheritFrom: `Gobo1WheelMode`,
  },
  Gobo3WheelShake: {
    // Controls frequency of the shake of gobo wheel 3. (since v0.88)
    inheritFrom: `Gobo1WheelShake`,
  },
  Gobo3WheelSpin: {
    // Controls the speed and direction of continuous rotation of gobo wheel 3. (since v0.88)
    inheritFrom: `Gobo1WheelSpin`,
  },
  Gobo3WheelRandom: {
    // Controls speed of gobo wheel´s 3 random gobo slot selection. (since v0.88)
    inheritFrom: `Gobo1WheelRandom`,
  },
  GoboWheelMSpeed: {
    // Movement speed of the fixture's gobo wheel.
    inheritFrom: `IntensityMSpeed`,
  },
  GoboWheelReset: {
    // Resets the fixture's gobo wheel.
    inheritFrom: `BeamReset`,
  },
  Haze: {
    // Fog or hazer's haze feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.fogType = `Haze`;
    },
  },
  'HSB_Brightness': undefined, // Controls the fixture's color attribute regarding the brightness.
  'HSB_Hue': undefined, // Controls the fixture's color attribute regarding the hue.
  'HSB_Quality': undefined, // Controls the fixture's color attribute regarding the quality.
  'HSB_Saturation': undefined, // Controls the fixture's color attribute regarding the saturation.
  IntensityMSpeed: {
    // Movement speed of the fixture's intensity.
    oflType: `Speed`,
    oflProperty: guessSpeedOrDuration,
    defaultPhysicalEntity: `Speed`,
  },
  IntensityReset: {
    // Resets the fixture's intensity.
    inheritFrom: `BeamReset`,
  },
  Iris: {
    // Controls the diameter of the fixture's beam.
    oflType: `Iris`,
    oflProperty: `openPercent`,
    defaultPhysicalEntity: `Angle`,
  },
  IrisMode: {
    // Changes modes of the fixture’s iris - linear, strobe, pulse.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  IrisMSpeed: {
    // Movement speed of the fixture's iris.
    inheritFrom: `IntensityMSpeed`,
  },
  IrisPulseClose: {
    // Sets speed of iris‘s closing pulse.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `RampDown`;
    },
  },
  IrisPulseOpen: {
    // Sets speed of iris‘s opening pulse.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `RampUp`;
    },
  },
  IrisReset: {
    // Resets the fixture's iris.
    inheritFrom: `BeamReset`,
  },
  IrisStrobe: {
    // Sets speed of the iris’s strobe feature.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = `Strobe`;
    },
  },
  LampControl: {
    // Controls the fixture's lamp on/lamp off feature.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  LampPowerMode: {
    // Controls the energy consumption of the lamp.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  MagentaMode: {
    // Controls how Cyan is used within the fixture's magenta CMY-mixing.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  NoFeature: {
    // Ranges without a functionality.
    oflType: `NoFunction`,
    oflProperty: null,
  },
  Pan: {
    // Controls the fixture's sideward movement (horizontal axis).
    oflType: `Pan`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  PanMode: {
    // Selects fixture's pan mode. Selects between a limited pan range (e.g. -270 to 270) or a continuous pan range.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  PanReset: {
    // Resets the fixture's pan.
    inheritFrom: `BeamReset`,
  },
  PositionEffect: {
    // Selects the predefined position effects that are built into the fixture.
    inheritFrom: `Effects`,
  },
  PositionEffectFade: {
    // Snaps or smooth fades with timing in running predefined position effects.
    inheritFrom: `EffectsFade`,
  },
  PositionEffectRate: {
    // Controls the speed of the predefined position effects that are built into the fixture.
    inheritFrom: `EffectsRate`,
  },
  PositionModes: {
    // Selects the fixture's position mode.
    // TODO: Is this a typo in the GDTF wiki / schema and it should be "PositionMode"?
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  PositionMSpeed: {
    // Movement speed of the fixture's pan/tilt.
    inheritFrom: `IntensityMSpeed`,
    oflType: `PanTiltSpeed`,
  },
  PositionReset: {
    // Resets the fixture's pan/tilt.
    inheritFrom: `BeamReset`,
  },
  Prism: {
    // Controls the insertion of fixture ́s prism wheel 1. Refracts the beam into multiple beams of light on wheel 1.
    oflType: `Prism`,
    oflProperty: null,
    defaultPhysicalEntity: `None`,
  },
  PrismPos: {
    // Controls the indexed position of fixture‘s prism on prism wheel 1.
    oflType: `PrismRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  PrismPosRotation: {
    // Controls the speed and direction of the continuous rotation of the fixture’s prism on prism wheel 1.
    oflType: `PrismRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  Prism2: {
    // Controls the insertion of fixture´s prism wheel 2. Refracts the beam into multiple beams of light on wheel 2.
    inheritFrom: `Prism`,
  },
  Prism2Pos: {
    // Controls the indexed position of fixture‘s prism on prism wheel 2.
    inheritFrom: `PrismPos`,
  },
  Prism2PosRotation: {
    // Controls the speed and direction of the continuous rotation of the fixture’s prism on prism wheel 2.
    inheritFrom: `PrismPosRotation`,
  },
  ShaperMacros: {
    // Predefined presets for shaper positions.
    inheritFrom: `Effects`,
  },
  ShaperRot: {
    // Rotates position of blade assembly.
    oflType: `BladeSystemRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
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
    },
  },
  ShutterReset: {
    // Resets the fixture's shutter.
    inheritFrom: `BeamReset`,
  },
  ShutterStrobe: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Strobe`;
    },
  },
  ShutterStrobePulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Pulse`;
    },
  },
  ShutterStrobePulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampDown`;
    },
  },
  ShutterStrobePulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampUp`;
    },
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
    },
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
    },
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
    },
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
    },
  },
  Shutter2: {
    // Controls the fixture´s mechanical or electronical shutter feature (2). Is used with foreground/background strobe.
    inheritFrom: `Shutter1`,
  },
  Shutter2Strobe: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical strobe shutter feature (2).
    inheritFrom: `Shutter1Strobe`,
  },
  Shutter2StrobePulse: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical pulse shutter feature (2).
    inheritFrom: `Shutter1StrobePulse`,
  },
  Shutter2StrobePulseClose: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical closing pulse shutter feature (2).
    inheritFrom: `Shutter1StrobePulseClose`,
  },
  Shutter2StrobePulseOpen: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical opening pulse shutter feature (2).
    inheritFrom: `Shutter1StrobePulseOpen`,
  },
  Shutter2StrobeRandom: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random strobe shutter feature (2).
    inheritFrom: `Shutter1StrobeRandom`,
  },
  Shutter2StrobeRandomPulse: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random pulse shutter feature (2).
    inheritFrom: `Shutter1StrobeRandomPulse`,
  },
  Shutter2StrobeRandomPulseClose: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random closing pulse shutter feature (2).
    inheritFrom: `Shutter1StrobeRandomPulseClose`,
  },
  Shutter2StrobeRandomPulseOpen: {
    // Controls the frequency/speed of the fixture ́s mechanical or electronical random opening pulse shutter feature (2).
    inheritFrom: `Shutter1StrobeRandomPulseOpen`,
  },
  Shutter3: {
    // Controls the fixture ´s mechanical or electronical shutter feature (3). Is used with foreground/background strobe.
    inheritFrom: `Shutter1`,
  },
  Shutter3Strobe: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature (3).
    inheritFrom: `Shutter1Strobe`,
  },
  Shutter3StrobePulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature (3).
    inheritFrom: `Shutter1StrobePulse`,
  },
  Shutter3StrobePulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature (3).
    inheritFrom: `Shutter1StrobePulseClose`,
  },
  Shutter3StrobePulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature (3).
    inheritFrom: `Shutter1StrobePulseOpen`,
  },
  Shutter3StrobeRandom: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random strobe shutter feature (3).
    inheritFrom: `Shutter1StrobeRandom`,
  },
  Shutter3StrobeRandomPulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random pulse shutter feature (3).
    inheritFrom: `Shutter1StrobeRandomPulse`,
  },
  Shutter3StrobeRandomPulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random closing pulse shutter feature (3).
    inheritFrom: `Shutter1StrobeRandomPulseClose`,
  },
  Shutter3StrobeRandomPulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random opening pulse shutter feature (3).
    inheritFrom: `Shutter1StrobeRandomPulseOpen`,
  },
  StrobeDuration: {
    // Controls the length of a strobe flash.
    oflType: `StrobeDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`,
  },
  StrobeMode: {
    // Changes strobe style - strobe, pulse, random strobe, etc. - of the shutter attribute.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  StrobeRate: {
    // Controls the time between strobe flashes.
    oflType: `StrobeSpeed`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
  },
  Tilt: {
    // Controls the fixture's upward and the downward movement (vertical axis).
    oflType: `Tilt`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  TiltMode: {
    // Selects fixture's pan mode. Selects between a limited tilt range (e.g. -130 to 130) or a continuous tilt range.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  TiltReset: {
    // Resets the fixture's tilt.
    inheritFrom: `BeamReset`,
  },
  Video: undefined, // Controls video features.
  XYZ_X: undefined, // Defines a fixture’s x-coordinate within an XYZ coordinate system.
  XYZ_Y: undefined, // Defines a fixture’s y-coordinate within an XYZ coordinate system.
  XYZ_Z: undefined, // Defines a fixture‘s z-coordinate within an XYZ coordinate system.
  YellowMode: {
    // Controls how Cyan is used within the fixture's yellow CMY-mixing feature.
    inheritFrom: `AnimationIndexRotateMode`,
  },
  ZoomReset: {
    // Resets the fixture's zoom.
    inheritFrom: `BeamReset`,
  },
};

/**
 * @param {Object} gdtfCapability The enhanced <ChannelSet> XML object.
 * @param {String} primaryColor The color that this capability is most likely.
 * @param {String} secondaryColor The color that this capability is second most likely.
 * @returns {String} Either the primary, or the secondary color.
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
 * @param {Object} gdtfCapability The enhanced <ChannelSet> XML object.
 * @returns {'speed'|'duration'} The OFL property to use for this capability.
 */
function guessSpeedOrDuration(gdtfCapability) {
  return gdtfCapability._channelFunction._attribute.$.PhysicalUnit === `Time` ? `duration` : `speed`;
}

module.exports = {
  gdtfUnits,
  gdtfAttributes: Object.assign({}, deprecatedGdtfAttributes, gdtfAttributes),
};
