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
  Dimmer: {
    // Controls the intensity of a fixture.
    oflType: `Intensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `LuminousIntensity`
  },
  Pan: {
    // Controls the fixture's sideward movement (horizontal axis).
    oflType: `Pan`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  Tilt: {
    // Controls the fixture's upward and the downward movement (vertical axis).
    oflType: `Tilt`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  PositionEffect: undefined, // Selects the predefined position effects that are built into the fixture.
  PositionEffectRate: undefined, // Controls the speed of the predefined position effects that are built into the fixture.
  PositionEffectFade: undefined, // Snaps or smooth fades with timing in running predefined position effects.
  XYZ_X: undefined, // Defines a fixture’s x-coordinate within an XYZ coordinate system.
  XYZ_Y: undefined, // Defines a fixture’s y-coordinate within an XYZ coordinate system.
  XYZ_Z: undefined, // Defines a fixture‘s z-coordinate within an XYZ coordinate system.
  Gobo1: {
    // Selects gobos in the fixture's gobo wheel 1.
    oflType: `GoboIndex`,
    oflProperty: null,
    defaultPhysicalEntity: `None`,
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
  Gobo1Spin: {
    // Controls the speed and direction of the continuous rotation of gobo wheel 1.
    oflType: `GoboWheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Gobo1Shake: {
    // Control the frequency of the shake of gobo wheel 1.
    inheritFrom: `Gobo1`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`
  },
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
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Gobo2: {
    // Selects gobos in the fixture's gobo wheel 2.
    inheritFrom: `Gobo1`
  },
  Gobo2Spin: {
    // Controls the speed and direction of the continuous rotation of gobo wheel 2.
    inheritFrom: `Gobo1Spin`
  },
  Gobo2Shake: {
    // Control the frequency of the shake of gobo wheel 2.
    inheritFrom: `Gobo1`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`
  },
  Gobo2Pos: {
    // Controls the angle of indexed rotation of gobos in gobo wheel 2.
    inheritFrom: `Gobo1Pos`
  },
  Gobo2PosRotation: {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel 2.
    inheritFrom: `Gobo1PosRotation`
  },
  Gobo3: {
    // Selects gobos in the fixture's gobo wheel 3.
    inheritFrom: `Gobo1`
  },
  Gobo3Spin: {
    // Controls the speed and direction of the continuous rotation of gobo wheel 3.
    inheritFrom: `Gobo1Spin`
  },
  Gobo3Shake: {
    // Control the frequency of the shake of gobo wheel 3.
    inheritFrom: `Gobo1`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`
  },
  Gobo3Pos: {
    // Controls the angle of indexed rotation of gobos in gobo wheel 3.
    inheritFrom: `Gobo1Pos`
  },
  Gobo3PosRotation: {
    // Controls the speed and direction of the continuous rotation of gobos in gobo wheel 3.
    inheritFrom: `Gobo1PosRotation`
  },
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
      normalizeAngularSpeedDirection(gdtfCapability);
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
  ColorMacro: {
    // Selects predefined colors that are programed in the fixture's firmware.
    oflType: `ColorPreset`,
    oflProperty: null,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      // sometimes a workaround to add color information is used: reference a virtual color wheel

      const index = parseInt(gdtfCapability.$.WheelSlotIndex) - 1;
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
    }
  },
  ColorMacro2: {
    // Selects predefined colors that are programed in the fixture's firmware (2).
    inheritFrom: `ColorMacro`
  },
  CTO: {
    // Controls the fixture's "Correct to orange" wheel or mixing system.
    oflType: `ColorTemperature`,
    oflProperty: `colorTemperature`,
    defaultPhysicalEntity: `Temperature` // ColorComponent is also common
  },
  CTC: {
    // Controls the fixture's "Correct to color" wheel or mixing system.
    inheritFrom: `CTO`
  },
  CTB: {
    // Controls the fixture's "Correct to blue" wheel or mixing system.
    inheritFrom: `CTO`
  },
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
  Shutter: {
    // Controls the fixture´s mechanical or electronical shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: null,
    defaultPhysicalEntity: `Frequency`, // although that makes little sense since 0 means closed and 1 means open
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
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
  ShutterStrobe: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `Strobe`;
    }
  },
  ShutterStrobePulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `Pulse`;
    }
  },
  ShutterStrobePulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `RampDown`;
    }
  },
  ShutterStrobePulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `RampUp`;
    }
  },
  ShutterStrobeRandom: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random strobe shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `Strobe`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.randomTiming = true;
    }
  },
  ShutterStrobeRandomPulse: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `Pulse`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.randomTiming = true;
    }
  },
  ShutterStrobeRandomPulseClose: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random closing pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `RampDown`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.randomTiming = true;
    }
  },
  ShutterStrobeRandomPulseOpen: {
    // Controls the frequency/speed of the fixture´s mechanical or electronical random opening pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.shutterEffect = `RampUp`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
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
  Iris: {
    // Controls the diameter of the fixture's beam.
    oflType: `Iris`,
    oflProperty: `openPercent`,
    defaultPhysicalEntity: `Angle`
  },
  IrisStrobe: {
    // Sets speed of the iris’s strobe feature.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.effectName = `Strobe`;
    }
  },
  IrisPulseClose: {
    // Sets speed of iris‘s closing pulse.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.effectName = `RampDown`;
    }
  },
  IrisPulseOpen: {
    // Sets speed of iris‘s opening pulse.
    oflType: `IrisEffect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.effectName = `RampUp`;
    }
  },
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
  Focus: {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot.
    oflType: `Focus`,
    oflProperty: `distance`,
    defaultPhysicalEntity: `Length`
  },
  Focus2: {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot (2).
    inheritFrom: `Focus`
  },
  FocusAdjust: {
    // Autofocuses functionality using presets.
    inheritFrom: `Focus`
  },
  FocusDistance: {
    // Autofocuses functionality using distance.
    inheritFrom: `Focus`
  },
  Zoom: {
    // Undocumented, but used in many fixtures.
    oflType: `Zoom`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
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
  PositionMSpeed: {
    // Movement speed of the fixture's pan/tilt.
    oflType: `PanTiltSpeed`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`
  },
  ColorMixMSpeed: undefined, // Movement speed of the fixture's ColorMix presets.
  ColorWheelSelectMSpeed: undefined, // Movement speed of the fixture's color wheel.
  GoboWheelMSpeed: undefined, // Movement speed of the fixture's gobo wheel.
  IrisMSpeed: undefined, // Movement speed of the fixture's iris.
  FocusMSpeed: undefined, // Movement speed of the fixture's focus.
  FrameMSpeed: undefined, // Movement speed of the fixture's shapers.
  GlobalMSpeed: undefined, // General speed of fixture's features.
  FixtureGlobalReset: {
    // Generally resets the entire fixture.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ShutterReset: {
    // Resets the fixture's shutter.
    oflType: `Maintenance`,
    oflProperty: null
  },
  BeamReset: {
    // Resets the fixture's beam features.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ColorMixReset: {
    // Resets the fixture's color mixing system.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ColorWheelReset: {
    // Resets the fixture's color wheel.
    oflType: `Maintenance`,
    oflProperty: null
  },
  FocusReset: {
    // Resets the fixture's focus.
    oflType: `Maintenance`,
    oflProperty: null
  },
  FrameReset: {
    // Resets the fixture's shapers.
    oflType: `Maintenance`,
    oflProperty: null
  },
  GoboWheelReset: {
    // Resets the fixture's gobo wheel.
    oflType: `Maintenance`,
    oflProperty: null
  },
  IntensityReset: {
    // Resets the fixture's intensity.
    oflType: `Maintenance`,
    oflProperty: null
  },
  IrisReset: {
    // Resets the fixture's iris.
    oflType: `Maintenance`,
    oflProperty: null
  },
  PositionReset: {
    // Resets the fixture's pan/tilt.
    oflType: `Maintenance`,
    oflProperty: null
  },
  PanReset: {
    // Resets the fixture's pan.
    oflType: `Maintenance`,
    oflProperty: null
  },
  TiltReset: {
    // Resets the fixture's tilt.
    oflType: `Maintenance`,
    oflProperty: null
  },
  ZoomReset: {
    // Resets the fixture's zoom.
    oflType: `Maintenance`,
    oflProperty: null
  },
  CTBReset: {
    // Resets the fixture's CTB.
    oflType: `Maintenance`,
    oflProperty: null
  },
  CTOReset: {
    // Resets the fixture's CTO.
    oflType: `Maintenance`,
    oflProperty: null
  },
  CTCReset: {
    // Resets the fixture's CTC.
    oflType: `Maintenance`,
    oflProperty: null
  },
  FixtureCalibrationReset: {
    // Resets the fixture's calibration.
    oflType: `Maintenance`,
    oflProperty: null
  },
  Function: undefined, // Generally controls features of the fixture.
  LampControl: {
    // Controls the fixture's lamp on/lamp off feature.
    oflType: `Maintenance`,
    oflProperty: null
  },
  NoFeature: {
    // Ranges without a functionality.
    oflType: `NoFunction`,
    oflProperty: null
  },
  Blower: undefined, // Fog or hazer‘s blower feature.
  Fan: {
    // Fog or hazer's Fan feature.
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      normalizeAngularSpeedDirection(gdtfCapability);
    }
  },
  Fog: {
    // Fog or hazer's Fog feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.fogType = `Fog`;
    }
  },
  Haze: {
    // Fog or hazer's haze feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.fogType = `Haze`;
    }
  },
  LampPowerMode: undefined, // Controls the energy consumption of the lamp.
  Fans: undefined, // Fancontrols a fixture or device.
  Blade1A: {
    // 1 of 2 shutters that shape the top of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Top`;
    }
  },
  Blade1B: {
    // 2 of 2 shutters that shape the top of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Top`;
    }
  },
  Blade2A: {
    // 1 of 2 shutters that shape the right of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Right`;
    }
  },
  Blade2B: {
    // 2 of 2 shutters that shape the right of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Right`;
    }
  },
  Blade3A: {
    // 1 of 2 shutters that shape the bottom of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Bottom`;
    }
  },
  Blade3B: {
    // 2 of 2 shutters that shape the bottom of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Bottom`;
    }
  },
  Blade4A: {
    // 1 of 2 shutters that shape the left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Left`;
    }
  },
  Blade4B: {
    // 2 of 2 shutters that shape the left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Left`;
    }
  },
  Blade1Rot: {
    // Rotates position of blade1.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Top`;
    }
  },
  Blade2Rot: {
    // Rotates position of blade2.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Right`;
    }
  },
  Blade3Rot: {
    // Rotates position of blade3.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Bottom`;
    }
  },
  Blade4Rot: {
    // Rotates position of blade4.
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability, gdtfFixture) {
      capability.blade = `Left`;
    }
  },
  ShaperRot: {
    // Rotates position of blade assembly.
    oflType: `BladeSystemRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`
  },
  ShaperMacros: undefined, // Predefined presets for shaper positions.
  Video: undefined // Controls video features.
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

module.exports = {
  gdtfUnits,
  gdtfAttributes
};
