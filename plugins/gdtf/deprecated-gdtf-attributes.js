const { normalizeAngularSpeedDirection } = require(`./gdtf-helpers.js`);

const deprecatedGdtfAttributes = {
  ActiveZone: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  AnimationWheelMacro: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Effects`,
  },
  AnimationWheelPos: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `WheelRotation`,
    oflProperty: `angle`,
    defaultPhysicalEntity: `Angle`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = `Animation Disk`;
    },
  },
  AnimationWheelPosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `WheelRotation`,
    oflProperty: `speed`,
    defaultPhysicalEntity: `AngularSpeed`,
    beforePhysicalPropertyHook(capability, gdtfCapability) {
      capability.wheel = `Animation Disk`;
      normalizeAngularSpeedDirection(gdtfCapability);
    },
  },
  BeamMode: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `AnimationIndexRotateMode`,
  },
  Color1Audio: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Color1WheelAudio since GDTF v0.88
    inheritFrom: `Color1WheelAudio`,
  },
  Color1Index: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Color1WheelIndex since GDTF v0.88
    inheritFrom: `Color1WheelIndex`,
  },
  Color1Random: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Color1WheelRandom since GDTF v0.88
    inheritFrom: `Color1WheelRandom`,
  },
  Color1Select: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Color1`,
  },
  Color1Spin: {
    // Renamed to Color1WheelSpin in GDTF v0.88
    inheritFrom: `Color1WheelSpin`,
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
  EffectsPar1: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    oflType: `EffectParameter`,
    oflProperty: `parameter`,
    defaultPhysicalEntity: `None`,
  },
  EffectsPar2: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `EffectsPar1`,
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
  Gobo1Audio: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Gobo1WheelAudio since GDTF v0.88
    inheritFrom: `Gobo1WheelAudio`,
  },
  Gobo1PosRotation: {
    // Renamed to Gobo1PosRotate in GDTF v0.88
    inheritFrom: `Gobo1PosRotate`,
  },
  Gobo1Random: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    // Officially supported as Gobo1WheelRandom since GDTF v0.88
    inheritFrom: `Gobo1WheelRandom`,
  },
  Gobo1RandomAudio: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1WheelAudio`,
  },
  Gobo1Select: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1`,
  },
  Gobo1Shake: {
    // Renamed to Gobo1WheelShake in GDTF v0.88
    inheritFrom: `Gobo1WheelShake`,
  },
  Gobo1Spin: {
    // Renamed to Gobo1WheelSpin in GDTF v0.88
    inheritFrom: `Gobo1WheelSpin`,
  },
  Gobo1WheelShake: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1Shake`, // there seems to be no GDTF attribute to specify wheel slot shake, so both Gobo1Shake and Gobo1WheelShake shake the wheel
  },
  Gobo1WheelSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1Spin`,
  },
  Gobo2GoboIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2GoboShakeIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Gobo2PosIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1Pos`,
  },
  Gobo2PosRotation: {
    // Renamed to Gobo2PosRotate in GDTF v0.88
    inheritFrom: `Gobo2PosRotate`,
  },
  Gobo2PosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1PosRotation`,
  },
  Gobo2Random: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1Random`,
  },
  Gobo2SelectIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1SelectIndex`,
  },
  Gobo2SelectShakeIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1SelectShakeIndex`,
  },
  Gobo2SelectShakeSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1SelectShakeSpin`,
  },
  Gobo2SelectSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1SelectSpin`,
  },
  Gobo2Shake: {
    // Renamed to Gobo2WheelShake in GDTF v0.88
    inheritFrom: `Gobo2WheelShake`,
  },
  Gobo2Spin: {
    // Renamed to Gobo2WheelSpin in GDTF v0.88
    inheritFrom: `Gobo2WheelSpin`,
  },
  Gobo2WheelSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Gobo1WheelSpin`,
  },
  Gobo3PosRotation: {
    // Renamed to Gobo3PosRotate in GDTF v0.88
    inheritFrom: `Gobo3PosRotate`,
  },
  Gobo3Shake: {
    // Renamed to Gobo3WheelShake in GDTF v0.88
    inheritFrom: `Gobo3WheelShake`,
  },
  Gobo3Spin: {
    // Renamed to Gobo3WheelSpin in GDTF v0.88
    inheritFrom: `Gobo3WheelSpin`,
  },
  PrismPosIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  PrismPrismIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism1: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism`,
  },
  Prism1Pos: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `PrismPos`,
  },
  Prism1PosIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism1Pos`,
  },
  Prism1PosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism1PosRotation`,
  },
  Prism1SelectIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism1`,
  },
  Prism1SelectSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism1`,
  },
  Prism2PosIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism2Pos`,
  },
  Prism2PosSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism2PosRotation`,
  },
  Prism2PrismIndex: undefined, // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
  Prism2SelectIndex: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism2`,
  },
  Prism2SelectSpin: {
    // From https://gitlab.com/petrvanek/gdtf-libraries/blob/master/gdtf.xsd
    inheritFrom: `Prism2`,
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

module.exports = deprecatedGdtfAttributes;
