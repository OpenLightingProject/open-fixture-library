import deprecatedGdtfAttributes from './deprecated-gdtf-attributes.js';
import {
  followXmlNodeReference,
  getRgbColorFromGdtfColor,
  normalizeAngularSpeedDirection,
} from './gdtf-helpers.js';

// see https://gdtf-share.com/wiki/GDTF_File_Description#Attribute
export const gdtfUnits = {
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
    if (physicalValuesFulfillCondition(value, otherValue, number => Math.abs(number) < 1)) {
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
 * @param {number} value1 The first physical value.
 * @param {number | null} value2 The second physical value, or null.
 * @param {Function} predicate A function returning a boolean.
 * @returns {boolean} True if all provided values fulfill the condition predicate.
 */
function physicalValuesFulfillCondition(value1, value2, predicate) {
  return predicate(value1) && (value2 === null || predicate(value2));
}


// see https://gdtf-share.com/wiki/GDTF_File_Description#Appendix_A._Attribute_Definitions
const gdtfAttributes = {
  'AnimationWheel(n)': {
    // This is the main attribute of the animation wheel's (n) wheel control. Selects slots in the animation wheel. A different channel function sets the angle of the indexed position in the selected slot or the angular speed of its continuous rotation.
    inheritFrom: `Gobo(n)`,
  },
  'AnimationWheel(n)Audio': {
    // Controls audio-controlled functionality of animation wheel (n).
    inheritFrom: `Gobo(n)WheelAudio`,
  },
  'AnimationWheel(n)Macro': {
    // Selects predefined effects in animation wheel (n).
    inheritFrom: `Gobo(n)WheelRandom`,
  },
  'AnimationWheel(n)Mode': {
    // Changes control between selecting, indexing, and rotating the slots of animation wheel (n).
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  'AnimationWheel(n)Pos': {
    // Controls angle of indexed rotation of slots in animation wheel. This is the main attribute of animation wheel (n) wheel slot control.
    inheritFrom: `Gobo(n)Pos`,
  },
  'AnimationWheel(n)PosRotate': {
    // Controls the speed and direction of continuous rotation of slots in animation wheel (n).
    inheritFrom: `Gobo(n)PosRotate`,
  },
  'AnimationWheel(n)PosShake': {
    // Controls frequency of the shake of slots in animation wheel (n).
    inheritFrom: `Gobo(n)PosShake`,
  },
  'AnimationWheel(n)Random': {
    // Controls speed of animation wheel (n) random slot selection.
    inheritFrom: `Gobo(n)WheelRandom`,
  },
  'AnimationWheel(n)SelectEffects': {
    // Selects slots which run effects in animation wheel (n).
    inheritFrom: `Gobo(n)SelectEffects`,
  },
  'AnimationWheel(n)SelectShake': {
    // Selects slots which shake in animation wheel and controls the frequency of the slots shake within the same channel function.
    inheritFrom: `Gobo(n)SelectShake`,
  },
  'AnimationWheel(n)SelectSpin': {
    // Selects slots whose rotation is continuous in animation wheel and controls the angular speed of the slot spin within the same channel function
    inheritFrom: `Gobo(n)SelectSpin`,
  },
  AnimationWheelShortcutMode: {
    // Defines whether the animation wheel takes the shortest distance between two positions.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  BeamEffectIndexRotateMode: {
    // Changes mode to control either index or rotation of the beam effects.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  BeamReset: {
    // Resets the fixture's beam features.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  BeamShaper: undefined, // Activates fixture's beam shaper.
  BeamShaperMacro: undefined, // Predefined presets for fixture's beam shaper positions.
  BeamShaperPos: undefined, // Indexing of fixture's beam shaper.
  BeamShaperPosRotate: undefined, // Continuous rotation of fixture's beam shaper.
  BlackoutMode: undefined, // Close the light output under certain conditions (movement correction, gobo movement, etc.).
  'Blade(n)A': {
    // 1 of 2 shutters that shape the top/right/bottom/left of the beam.
    oflType: `BladeInsertion`,
    oflProperty: `insertion`,
    defaultPhysicalEntity: `Percent`, // Angle is also common
    beforePhysicalPropertyHook(capability, gdtfCapability, attributeName) {
      const positions = [`Top`, `Right`, `Bottom`, `Left`];
      const bladeNumber = Number.parseInt(attributeName.slice(5), 10);
      capability.blade = positions[bladeNumber - 1] || bladeNumber;
    },
  },
  'Blade(n)B': {
    // 2 of 2 shutters that shape the top/right/bottom/left of the beam.
    inheritFrom: `Blade(n)A`,
  },
  'Blade(n)Rot': {
    // Rotates position of blade(n).
    inheritFrom: `Blade(n)A`,
    oflType: `BladeRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  'Blower(n)': undefined, // Fog or hazer‘s blower feature.
  ChromaticMode: undefined, // Selects chromatic behavior of the device.
  'CIE_Brightness': undefined, // Controls the fixture's CIE 1931 color attribute regarding the brightness (Y).
  'CIE_X': undefined, // Controls the fixture's CIE 1931 color attribute regarding the chromaticity x.
  'CIE_Y': undefined, // Controls the fixture's CIE 1931 color attribute regarding the chromaticity y.
  'Color(n)': {
    // The fixture’s color wheel (n). Selects colors in color wheel (n). This is the main attribute of color wheel’s (n) wheel control.
    oflType: `WheelSlot`,
    oflProperty: `slotNumber`,
    defaultPhysicalEntity: `None`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = Number.parseInt(gdtfCapability.$.WheelSlotIndex, 10);

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
      const gdtfSlotIndex = Number.parseInt(gdtfCapability.$.WheelSlotIndex, 10) - 1;

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
  'Color(n)Mode': {
    // Changes control between selecting, continuous selection, half selection, random selection, color spinning, etc. in colors of color wheel 1.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  'Color(n)WheelAudio': {
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
  'Color(n)WheelIndex': {
    // Controls angle of indexed rotation of color wheel 1 (since GDTF v0.88)
    oflType: `WheelRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
    },
  },
  'Color(n)WheelRandom': {
    // Controls speed of color wheel´s 1 random color slot selection. (since GDTF v0.88)
    inheritFrom: `Effects(n)`,
  },
  'Color(n)WheelSpin': {
    // Controls the speed and direction of continuous rotation of color wheel 1.
    oflType: `WheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  'ColorAdd_B': {
    // Controls the intensity of the fixture's blue emitters for direct additive color mixing. (since GDTF v1.0)
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Blue`;
    },
  },
  'ColorAdd_BC': {
    // Controls the intensity of the fixture's light-blue emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Blue`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.comment = `Light-Blue`;
    },
  },
  'ColorAdd_BM': {
    // Controls the intensity of the fixture's purple emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Indigo`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.comment = `Purple`;
    },
  },
  'ColorAdd_C': {
    // Controls the intensity of the fixture's cyan emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Cyan`;
    },
  },
  'ColorAdd_CW': {
    // Controls the intensity of the fixture's cool white emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Cold White`;
    },
  },
  'ColorAdd_G': {
    // Controls the intensity of the fixture's green emitters for direct additive color mixing (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Green`;
    },
  },
  'ColorAdd_GC': {
    // Controls the intensity of the fixture's blue-green emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Blue`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.comment = `Blue-Green`;
    },
  },
  'ColorAdd_GY': {
    // Controls the intensity of the fixture's lime emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Lime`;
    },
  },
  'ColorAdd_M': {
    // Controls the intensity of the fixture's magenta emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Magenta`;
    },
  },
  'ColorAdd_R': {
    // Controls the intensity of the fixture's red emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Red`;
    },
  },
  'ColorAdd_RM': {
    // Controls the intensity of the fixture's pink emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Magenta`;
    },
    afterPhysicalPropertyHook(capability, gdtfCapability) {
      capability.comment = `Pink`;
    },
  },
  'ColorAdd_RY': {
    // Controls the intensity of the fixture's amber emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Amber`;
    },
  },
  'ColorAdd_UV': {
    // Controls the intensity of the fixture's UV emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `UV`;
    },
  },
  'ColorAdd_W': {
    // Controls the intensity of the fixture's white emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `White`;
    },
  },
  'ColorAdd_WW': {
    // Controls the intensity of the fixture's warm white emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Warm White`;
    },
  },
  'ColorAdd_Y': {
    // Controls the intensity of the fixture's yellow emitters for direct additive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.color = `Yellow`;
    },
  },
  ColorCalibrationMode: {
    // Sets calibration mode (for example on/off). (since GDTF v1.0)
    inheritFrom: `Control(n)`,
  },
  ColorConsistency: {
    // Controls consistent behavior of color. (since GDTF v1.0)
    inheritFrom: `Control(n)`,
  },
  ColorControl: {
    // Controls special color related functions. (since GDTF v1.0)
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  'ColorEffects(n)': {
    // Selects predefined color effects built into the fixture.
    inheritFrom: `Effects(n)`,
  },
  'ColorMacro(n)': {
    // Selects predefined colors that are programed in the fixture's firmware.
    oflType: `ColorPreset`,
    oflProperty: null,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      // sometimes a workaround to add color information is used: reference a virtual color wheel

      const index = Number.parseInt(gdtfCapability.$.WheelSlotIndex, 10) - 1;
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
  ColorMixMode: {
    // Changes control between selecting continuous selection, half selection, random selection, color spinning, etc. in color mixing.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  ColorMixMSpeed: {
    // Movement speed of the fixture's ColorMix presets.
    inheritFrom: `IntensityMSpeed`,
  },
  ColorMixReset: {
    // Resets the fixture's color mixing system.
    inheritFrom: `BeamReset`,
  },
  ColorModelMode: {
    // Controls color model (CMY/RGB/HSV..). (since GDTF v1.0)
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  'ColorRGB_Blue': {
    // Controls the fixture's blue attribute for indirect RGB color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
  },
  'ColorRGB_Cyan': {
    // Controls the fixture's cyan attribute for indirect CMY color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_C`,
  },
  'ColorRGB_Green': {
    // Controls the fixture's green attribute for indirect RGB color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_G`,
  },
  'ColorRGB_Magenta': {
    // Controls the fixture's magenta attribute for indirect CMY color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_M`,
  },
  'ColorRGB_Quality': undefined, // Controls the fixture's quality attribute for indirect color mixing. (since GDTF v1.0)
  'ColorRGB_Red': {
    // Controls the fixture's red attribute for indirect RGB color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_R`,
  },
  'ColorRGB_Yellow': {
    // Controls the fixture's yellow attribute for indirect CMY color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_Y`,
  },
  ColorSettingsReset: {
    // Resets settings of color control channel. (since GDTF v1.0)
    inheritFrom: `BeamReset`,
  },
  'ColorSub_B': {
    // Controls the insertion of the fixture's blue filter flag for direct subtractive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_B`,
  },
  'ColorSub_C': {
    // Controls the insertion of the fixture's cyan filter flag for direct subtractive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_C`,
  },
  'ColorSub_G': {
    // Controls the insertion of the fixture's green filter flag for direct subtractive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_G`,
  },
  'ColorSub_M': {
    // Controls the insertion of the fixture's magenta filter flag for direct subtractive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_M`,
  },
  'ColorSub_R': {
    // Controls the insertion of the fixture's red filter flag for direct subtractive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_R`,
  },
  'ColorSub_Y': {
    // Controls the insertion of the fixture's yellow filter flag for direct subtractive color mixing. (since GDTF v1.0)
    inheritFrom: `ColorAdd_Y`,
  },
  ColorUniformity: undefined, // Controls behavior of color uniformity. (since GDTF v1.0)
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
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  'Control(n)': {
    // Controls the channel of a fixture.
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  CRIMode: undefined, // Controls CRI settings of output. (since GDTF v1.0)
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
  CustomColor: undefined, // Custom color related functions (save, recall..). (since GDTF v1.0)
  CyanMode: {
    // Controls how Cyan is used within the fixture's cyan CMY-mixing feature.
    inheritFrom: `AnimationWheel(n)Mode`,
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
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  DisplayIntensity: undefined, // Adjusts intensity of display (since GDTF v1.0)
  DMXInput: undefined, // Selects DMX Input (since GDTF v1.0)
  'Effects(n)': {
    // Generically predefined macros and effects of a fixture.
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    },
  },
  'Effects(n)Adjust(m)': {
    // Controls parameter (m) of effect (n) (since GDTF v1.0)
    oflType: `EffectParameter`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `None`,
  },
  'Effects(n)Fade': {
    // Snapping or smooth look of running effects.
    oflType: `EffectDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`,
  },
  'Effects(n)Pos': {
    // Controls angle of indexed rotation of slot/effect in effect wheel/macro (n). This is the main attribute of effect wheel/macro (n) slot/effect control. (since GDTF v1.0)
    oflType: `Rotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  'Effects(n)PosRotate': {
    // Controls speed and direction of slot/effect in effect wheel (n). (since GDTF v1.0)
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  'Effects(n)Rate': {
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
  'Fan(n)': {
    // Fog or hazer's Fan feature.
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  'Fan(n)Mode': undefined, // Controls fan (n) mode.
  Fans: undefined, // Fancontrols a fixture or device.
  FixtureCalibrationReset: {
    // Resets the fixture's calibration.
    inheritFrom: `BeamReset`,
  },
  FixtureGlobalReset: {
    // Generally resets the entire fixture.
    inheritFrom: `BeamReset`,
  },
  'Focus(n)': {
    // Controls the sharpness of the fixture's spot light. Can blur or sharpen the edge of the spot.
    oflType: `Focus`,
    oflProperty: `distance`,
    defaultPhysicalEntity: `Length`,
  },
  'Focus(n)Adjust': {
    // Autofocuses functionality using presets.
    inheritFrom: `Focus(n)`,
  },
  'Focus(n)Distance': {
    // Autofocuses functionality using distance.
    inheritFrom: `Focus(n)`,
  },
  FocusMode: {
    // Changes modes of the fixture’s focus - manual or auto- focus.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  FocusMSpeed: {
    // Movement speed of the fixture's focus.
    inheritFrom: `IntensityMSpeed`,
  },
  FocusReset: {
    // Resets the fixture's focus.
    inheritFrom: `BeamReset`,
  },
  'Fog(n)': {
    // Fog or hazer's Fog feature.
    oflType: `Fog`,
    oflProperty: `fogOutput`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.fogType = `Fog`;
    },
  },
  FollowSpotMode: undefined, // Selects follow spot control mode. (since GDTF v1.0)
  FrameMSpeed: {
    // Movement speed of the fixture's shapers.
    inheritFrom: `IntensityMSpeed`,
  },
  FrameReset: {
    // Resets the fixture's shapers.
    inheritFrom: `BeamReset`,
  },
  'Frost(n)': {
    // The ability to soften the fixture's spot light with a frosted lens.
    oflType: `Frost`,
    oflProperty: `frostIntensity`,
    defaultPhysicalEntity: `Percent`,
  },
  'Frost(n)MSpeed': {
    // Movement speed of the fixture's frost (n). (since GDTF v1.0)
    inheritFrom: `IrisMSpeed`,
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
  'Gobo(n)': {
    // The fixture’s gobo wheel (n). This is the main attribute of gobo wheel’s (n) wheel control. Selects gobos in gobo wheel (n). A different channel function sets the angle of the indexed position in the selected gobo or the angular speed of its continuous rotation.
    inheritFrom: `Color(n)`,
  },
  'Gobo(n)Pos': {
    // Controls angle of indexed rotation of gobos in gobo wheel (n). This is the main attribute of gobo wheel’s (n) wheel slot control.
    oflType: `WheelSlotRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
    },
  },
  'Gobo(n)PosRotate': {
    // Controls the speed and direction of continuous rotation of gobos in gobo wheel (n).
    oflType: `WheelSlotRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  'Gobo(n)PosShake': {
    // Controls frequency of the shake of gobos in gobo wheel (n).
    inheritFrom: `Gobo(n)`,
    oflType: `WheelShake`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = Number.parseInt(gdtfCapability.$.WheelSlotIndex, 10);

      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      capability.isShaking = `slot`;
      capability.slotNumber = gdtfSlotNumber;
    },
  },
  'Gobo(n)SelectEffects': {
    // Selects gobos which run effects in gobo wheel (n). (since GDTF v0.88)
    inheritFrom: `Gobo(n)`,
  },
  'Gobo(n)SelectShake': {
    // Selects gobos which shake in gobo wheel (n) and controls the frequency of the gobo’s shake within the same channel function. (since GDTF v0.88)
    inheritFrom: `Gobo(n)WheelShake`,
  },
  'Gobo(n)SelectSpin': {
    // Selects gobos whose rotation is continuous in gobo wheel (n) and controls the angular speed of the gobo’s spin within the same channel function. (since GDTF v0.88)
    inheritFrom: `Gobo(n)`,
  },
  'Gobo(n)WheelAudio': {
    // Controls audio-controlled functionality of gobo wheel (n). (since GDTF v0.88)
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
  'Gobo(n)WheelIndex': {
    // Controls angle of indexed rotation of gobo wheel (n). (since GDTF v0.88)
    inheritFrom: `Gobo(n)`,
  },
  'Gobo(n)WheelMode': {
    // Changes control between selecting, indexing, and rotating the gobos of gobo wheel (n).
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  'Gobo(n)WheelRandom': {
    // Controls speed of gobo wheel´s (n) random gobo slot selection. (since GDTF v0.88)
    oflType: `Effect`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Speed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.effectName = gdtfCapability.$.Name;
      gdtfCapability.$.Name = undefined;
    },
  },
  'Gobo(n)WheelShake': {
    // Controls frequency of the shake of gobo wheel (n).
    inheritFrom: `Gobo(n)`,
    oflType: `WheelShake`,
    oflProperty: `shakeSpeed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      const gdtfSlotNumber = Number.parseInt(gdtfCapability.$.WheelSlotIndex, 10);

      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      capability.slotNumber = gdtfSlotNumber;
    },
  },
  'Gobo(n)WheelSpin': {
    // Controls the speed and direction of continuous rotation of gobo wheel (n).
    oflType: `WheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = gdtfCapability._channelFunction.$.Wheel || `Unknown`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  'GoboWheel(n)MSpeed': {
    // Movement speed of the fixture's gobo wheel.
    inheritFrom: `IntensityMSpeed`,
  },
  GoboWheelReset: {
    // Resets the fixture's gobo wheel.
    inheritFrom: `BeamReset`,
  },
  'Haze(n)': {
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
    inheritFrom: `AnimationWheel(n)Mode`,
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
  IrisStrobeRandom: {
    // Sets speed of the iris's random movement. (since GDTF v1.0)
    inheritFrom: `IrisStrobe`,
    afterPhysicalPropertyHook(capability) {
      capability.randomTiming = true;
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
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  LEDFrequency: undefined, // Controls LED frequency. (since GDTF v1.0)
  LEDZoneMode: undefined, // Changes zones of LEDs. (since GDTF v1.0)
  MagentaMode: {
    // Controls how Cyan is used within the fixture's magenta CMY-mixing.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  MediaContent: undefined, // Selects the content slot of in the selected media folder (e.g. of a media server). (since GDTF v1.0)
  MediaFolder: undefined, // Selects the media folder of a device (e.g., a media server). (since GDTF v1.0)
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
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  PanReset: {
    // Resets the fixture's pan.
    inheritFrom: `BeamReset`,
  },
  PanTiltMode: undefined, // Selects fixture's pan/tilt mode. Selects between a limited pan/tilt range or a continuous pan/tilt range. (since GDTF v1.0)
  PixelMode: undefined, // Controls behavior of LED pixels. (since GDTF v1.0)
  Playmode: undefined, // Selects the playmode of a device (e.g., a media server). (since GDTF v1.0)
  PositionEffect: {
    // Selects the predefined position effects that are built into the fixture.
    inheritFrom: `Effects(n)`,
  },
  PositionEffectFade: {
    // Snaps or smooth fades with timing in running predefined position effects.
    inheritFrom: `Effects(n)Fade`,
  },
  PositionEffectRate: {
    // Controls the speed of the predefined position effects that are built into the fixture.
    inheritFrom: `Effects(n)Rate`,
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
  'Prism(n)': {
    // The fixture’s prism wheel (n). Selects prisms in prism wheel (n). A different channel function sets the angle of the indexed position in the selected prism or the angular speed of its continuous rotation. This is the main attribute of prism wheel’s (n) wheel control.
    oflType: `Prism`,
    oflProperty: null,
    defaultPhysicalEntity: `None`,
  },
  'Prism(n)Macro': {
    // Macro functions of prism wheel (n).
    inheritFrom: `Effects(n)`,
  },
  'Prism(n)MSpeed': {
    // Movement speed of the fixture's prism wheel (n).
    inheritFrom: `IntensityMSpeed`,
  },
  'Prism(n)Pos': {
    // Controls angle of indexed rotation of prisms in prism wheel (n). This is the main attribute of prism wheel’s 1 wheel slot control.
    oflType: `PrismRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  'Prism(n)PosRotate': {
    // Controls the speed and direction of continuous rotation of prisms in prism wheel (n).
    oflType: `PrismRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  'Prism(n)SelectSpin': {
    // Selects prisms whose rotation is continuous in prism wheel (n) and controls the angular speed of the prism’s spin within the same channel function. (since GDTF v0.88)
    inheritFrom: `Prism(n)PosRotate`,
  },
  ReflectorAdjust: undefined, // Movement speed of the fixture's frost.
  ShaperMacros: {
    // Predefined presets for shaper positions.
    inheritFrom: `Effects(n)`,
  },
  ShaperMacrosSpeed: {
    // Speed of predefined effects on shapers,
    inheritFrom: `Effects(n)Rate`,
  },
  ShaperRot: {
    // Rotates position of blade assembly.
    oflType: `BladeSystemRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  'Shutter(n)': {
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
  'Shutter(n)Strobe': {
    // Controls the frequency/speed of the fixture´s mechanical or electronical strobe shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Strobe`;
    },
  },
  'Shutter(n)StrobeEffect': {
    // Controls the frequency/speed of the fixture´s mechanical or electronical shutter effect feature.
    inheritFrom: `Shutter(n)Strobe`,
  },
  'Shutter(n)StrobePulse': {
    // Controls the frequency/speed of the fixture´s mechanical or electronical pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `Pulse`;
    },
  },
  'Shutter(n)StrobePulseClose': {
    // Controls the frequency/speed of the fixture´s mechanical or electronical closing pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampDown`;
    },
  },
  'Shutter(n)StrobePulseOpen': {
    // Controls the frequency/speed of the fixture´s mechanical or electronical opening pulse shutter feature.
    oflType: `ShutterStrobe`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `Frequency`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.shutterEffect = `RampUp`;
    },
  },
  'Shutter(n)StrobeRandom': {
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
  'Shutter(n)StrobeRandomPulse': {
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
  'Shutter(n)StrobeRandomPulseClose': {
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
  'Shutter(n)StrobeRandomPulseOpen': {
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
  ShutterReset: {
    // Resets the fixture's shutter.
    inheritFrom: `BeamReset`,
  },
  StrobeDuration: {
    // Controls the length of a strobe flash.
    oflType: `StrobeDuration`,
    oflProperty: `duration`,
    defaultPhysicalEntity: `Time`,
  },
  StrobeMode: {
    // Changes strobe style - strobe, pulse, random strobe, etc. - of the shutter attribute.
    inheritFrom: `AnimationWheel(n)Mode`,
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
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  TiltReset: {
    // Resets the fixture's tilt.
    inheritFrom: `BeamReset`,
  },
  UVStability: undefined, // Settings for UV stability color behavior. (since GDTF v1.0)
  Video: undefined, // Controls video features.
  'VideoCamera(n)': undefined, // Selects the video camera(n). (since GDTF v1.0)
  'VideoEffect(n)Parameter(m)': undefined, // Controls parameter (m) of VideoEffect(n)Type. (since GDTF v1.0)
  'VideoEffect(n)Type': undefined, // Selects dedicated effects which are used for media. (since GDTF v1.0)
  'VideoScale(n)_All': undefined, // Scales the media content or video object along all three axes. (since GDTF v1.0)
  'VideoScale(n)_X': undefined, // Scales the media content or video object along the x-axis. (since GDTF v1.0)
  'VideoScale(n)_Y': undefined, // Scales the media content or video object along the y-axis. (since GDTF v1.0)
  'VideoScale(n)_Z': undefined, // Scales the media content or video object along the z-axis. (since GDTF v1.0)
  WavelengthCorrection: undefined, // Settings for WaveLength corrections of colors. (since GDTF v1.0)
  WhiteCount: undefined, // Controls if White LED is proportionally added to RGB. (since GDTF v1.0)
  XYZ_X: undefined, // Defines a fixture’s x-coordinate within an XYZ coordinate system.
  XYZ_Y: undefined, // Defines a fixture’s y-coordinate within an XYZ coordinate system.
  XYZ_Z: undefined, // Defines a fixture‘s z-coordinate within an XYZ coordinate system.
  YellowMode: {
    // Controls how Cyan is used within the fixture's yellow CMY-mixing feature.
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  Zoom: {
    // Controls the spread of the fixture's beam/spot. (since GDTF v1.0)
    oflType: `Zoom`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  ZoomMode: undefined, // Changes modes of the fixture´s zoom. (since GDTF v1.0)
  ZoomModeBeam: undefined, // Selects beam mode of zoom. (since GDTF v1.0)
  ZoomModeSpot: undefined, // Selects spot mode of zoom. (since GDTF v1.0)
  ZoomMSpeed: {
    // Movement speed of the fixture's zoom. (since GDTF v1.0)
    inheritFrom: `IrisMSpeed`,
  },
  ZoomReset: {
    // Resets the fixture's zoom.
    inheritFrom: `BeamReset`,
  },
};

/**
 * @param {object} gdtfCapability The enhanced <ChannelSet> XML object.
 * @returns {'speed' | 'duration'} The OFL property to use for this capability.
 */
function guessSpeedOrDuration(gdtfCapability) {
  return gdtfCapability._channelFunction._attribute.$.PhysicalUnit === `Time` ? `duration` : `speed`;
}

export default {
  ...deprecatedGdtfAttributes,
  ...gdtfAttributes,
};
