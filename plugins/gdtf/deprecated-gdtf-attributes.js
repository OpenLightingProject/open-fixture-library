const { normalizeAngularSpeedDirection } = require(`./gdtf-helpers.js`);

const deprecatedGdtfAttributes = {
  ActiveZone: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  AnimationIndexRotate: {
    // Controls the animation disk's index or its rotation speed.
    // Replaced by AnimationWheel(n)Pos in GDTF v1.0
    inheritFrom: `AnimationWheel(n)Pos`,
  },
  AnimationIndexRotateMode: {
    // Changes control between selecting, indexing, and rotating the animation wheel.
    // Replaced by AnimationWheel(n)Mode in GDTF v1.0
    inheritFrom: `AnimationWheel(n)Mode`,
  },
  AnimationOffset: {
    // Controls the animation disk's shaking.
    // Replaced by AnimationWheel(n)PosShake in GDTF v1.0
    inheritFrom: `AnimationWheel(n)PosShake`,
  },
  AnimationWheel: {
    // Inserts a gobo disk into the beam. The disk has the ability to continuously index and rotate.
    // Replaced by AnimationWheel(n) in GDTF v1.0
    inheritFrom: `AnimationWheel(n)`,
  },
  AnimationWheelMacro: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as AnimationWheel(n)Macro since GDTF v1.0
    inheritFrom: `AnimationWheel(n)Macro`,
  },
  AnimationWheelPos: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as AnimationWheel(n)Pos since GDTF v1.0
    inheritFrom: `AnimationWheel(n)Pos`,
  },
  AnimationWheelPosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as AnimationWheel(n)PosRotate since GDTF v1.0
    inheritFrom: `AnimationWheel(n)PosRotate`,
  },
  BeamMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Blower: {
    // Renamed to Blower(n) in GDTF v1.0
    inheritFrom: `Blower(n)`,
  },
  'Color(n)Audio': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Color(n)WheelAudio since GDTF v0.88
    inheritFrom: `Color(n)WheelAudio`,
  },
  'Color(n)Index': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Color(n)WheelIndex since GDTF v0.88
    inheritFrom: `Color(n)WheelIndex`,
  },
  'Color(n)Random': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Color(n)WheelRandom since GDTF v0.88
    inheritFrom: `Color(n)WheelRandom`,
  },
  'Color(n)Select': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Color(n)`,
  },
  'Color(n)Spin': {
    // Renamed to Color(n)WheelSpin in GDTF v0.88
    inheritFrom: `Color(n)WheelSpin`,
  },
  ColorControl: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Maintenance`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `Percent`,
  },
  ColorMacroMSpeed: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `IntensityMSpeed`,
  },
  'ColorRGB(n)': {
    // Controls the intensity of the fixture's color emitters.
    // Replaced by ColorRGB_* in GDTF v0.88
    oflType: `ColorIntensity`,
    oflProperty: `brightness`,
    defaultPhysicalEntity: `ColorComponent`,
    beforePhysicalPropertyHook(capability, gdtfCapability, attributeName) {
      const rgbNumber = parseInt(attributeName.slice(8), 10);

      if (rgbNumber === 1) {
        capability.color = guessColorComponentName(gdtfCapability, `Red`, `Cyan`);
      }
      else if (rgbNumber === 2) {
        capability.color = guessColorComponentName(gdtfCapability, `Green`, `Magenta`);
      }
      else if (rgbNumber === 3) {
        capability.color = guessColorComponentName(gdtfCapability, `Blue`, `Yellow`);
      }
      else if (rgbNumber === 4) {
        capability.color = `Amber`;
      }
      else if (rgbNumber === 5) {
        capability.color = `White`;
      }
      else {
        // This is most likely wrong but enables the user to make an informed choice.
        capability.color = gdtfCapability._channelFunction._attribute.$.Pretty || `Unknown`;
      }
    },
  },
  ControlAutofocus: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlBlackout: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlCalibrationMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlColorMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlCRIMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlDimmerCurve: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlDisplayIntensity: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlDMXInput: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlFanMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlFollowSpotMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlLamp: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlLampMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlPanTiltMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlParking: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlReset: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  ControlWhiteCount: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Control`,
  },
  CTG: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `CTO`,
  },
  EffectsIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsMacro: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Effects`,
  },
  'EffectsPar(n)': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `EffectParameter`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `None`,
  },
  EffectsPos: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Rotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  EffectsPosIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `EffectsPos`,
  },
  EffectsPosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  EffectsRateIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  EffectsSelectIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Effects`,
  },
  EffectsSelectSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Effects`,
  },
  EffectsSelectSpinDynamic: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Effects`,
  },
  Effects2Macro: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Effects2Par2: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `EffectsPar2`,
  },
  Effects2Pos: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `EffectsPos`,
  },
  Effects3: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Effects`,
  },
  Frost3: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Frost`,
  },
  FrostHeavy: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Frost`,
  },
  FrostLight: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Frost`,
  },
  FrostMedium: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Frost`,
  },
  FrostMSpeed: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `IrisMSpeed`,
  },
  'Gobo(n)Audio': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Gobo1WheelAudio since GDTF v0.88
    inheritFrom: `Gobo1WheelAudio`,
  },
  'Gobo(n)GoboIndex': undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  'Gobo(n)GoboShakeIndex': undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  'Gobo(n)PosIndex': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo(n)Pos`,
  },
  'Gobo(n)PosRotation': {
    // Renamed to Gobo(n)PosRotate in GDTF v0.88
    inheritFrom: `Gobo(n)PosRotate`,
  },
  'Gobo(n)PosSpin': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo(n)PosRotate`,
  },
  'Gobo(n)Random': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Gobo(n)WheelRandom since GDTF v0.88
    inheritFrom: `Gobo(n)WheelRandom`,
  },
  'Gobo(n)RandomAudio': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo(n)WheelAudio`,
  },
  'Gobo(n)Select': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo(n)`,
  },
  'Gobo(n)SelectIndex': undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  'Gobo(n)Shake': {
    // Renamed to Gobo(n)WheelShake in GDTF v0.88
    inheritFrom: `Gobo(n)WheelShake`,
  },
  'Gobo(n)SelectShakeIndex': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo(n)SelectShake`,
  },
  'Gobo(n)SelectShakeSpin': undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  'Gobo(n)Spin': {
    // Renamed to Gobo(n)WheelSpin in GDTF v0.88
    inheritFrom: `Gobo(n)WheelSpin`,
  },
  GoboWheelMSpeed: {
    // Renamed to GoboWheel(n)MSpeed in GDTF v1.0
    inheritFrom: `GoboWheel(n)MSpeed`,
  },
  Haze: {
    // Renamed to Haze(n) in GDTF v1.0
    inheritFrom: `Haze(n)`,
  },
  Prism: {
    // Renamed to Prism(n) in GDTF v0.88
    inheritFrom: `Prism(n)`,
  },
  PrismPos: {
    // Renamed to Prism(n)Pos in GDTF v0.88
    inheritFrom: `Prism(n)Pos`,
  },
  PrismPosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  PrismPosRotation: {
    // Renamed to Prism(n)PosRotate in GDTF v0.88
    inheritFrom: `Prism(n)PosRotate`,
  },
  PrismPrismIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  'Prism(n)PosIndex': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism(n)Pos`,
  },
  'Prism(n)PosRotation': {
    // Renamed to Prism(n)PosRotate in GDTF v0.88
    inheritFrom: `Prism(n)PosRotate`,
  },
  'Prism(n)PosSpin': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism(n)PosRotate`,
  },
  'Prism(n)PrismIndex': undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  'Prism(n)SelectIndex': {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism(n)`,
  },
  PrismMSpeed: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `IrisMSpeed`,
  },
  Shaper: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperPos: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Rotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  ShaperPosIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Rotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  ShaperPosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Rotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  ShaperRotIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperSelectIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  ShaperSelectSpin: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Zoom: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `Zoom`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
  },
  ZoomMSpeed: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `IrisMSpeed`,
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

module.exports = deprecatedGdtfAttributes;
