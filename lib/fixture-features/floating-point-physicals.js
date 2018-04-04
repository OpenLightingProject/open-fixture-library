/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannel,
  MatrixChannelReference,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../model.js`);
/* eslint-enable no-unused-vars */

module.exports = [
  {
    id: `floating-point-dimensions`,
    name: `Floating point dimensions`,
    description: `In fixture physical or in a mode's physical override. See [#133](https://github.com/OpenLightingProject/open-fixture-library/issues/133).`,
    properties: [`width`, `height`, `depth`]
  },
  {
    id: `floating-point-weight`,
    name: `Floating point weight`,
    properties: [`weight`]
  },
  {
    id: `floating-point-power`,
    name: `Floating point power`,
    properties: [`power`]
  },
  {
    id: `floating-point-color-temperature`,
    name: `Floating point color temperature`,
    properties: [`bulbColorTemperature`]
  },
  {
    id: `floating-point-lumens`,
    name: `Floating point lumens`,
    properties: [`bulbLumens`]
  },
  {
    id: `floating-point-lens-degrees`,
    name: `Floating point lens degrees`,
    properties: [`lensDegreesMin`, `lensDegreesMin`]
  },
  {
    id: `floating-point-pan-tilt-max`,
    name: `Floating point pan/tilt maximum`,
    properties: [`focusPanMax`, `focusTiltMax`]
  }
];

for (const fixFeature of module.exports) {
  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  fixFeature.hasFeature = fixture => isFloatInPhysical(fixture.physical, fixFeature.properties) || fixture.modes.some(mode => isFloatInPhysical(mode.physical, fixFeature.properties));
}

/**
 * @param {?Physical} physical The physical data to check
 * @param {!Array.<string>} properties Physical properties to check
 * @returns {!boolean} Whether one of the given properties have a floating point value
 */
function isFloatInPhysical(physical, properties) {
  return physical !== null && properties.some(property => physical[property] !== null && physical[property] % 1 !== 0);
}
