/** @typedef {import('../model/Fixture.js').default} Fixture */
/** @typedef {import('../model/Physical.js').default} Physical */

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
  }
];

for (const fixFeature of module.exports) {
  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture uses the feature
   */
  fixFeature.hasFeature = fixture => isFloatInPhysical(fixture.physical, fixFeature.properties) || fixture.modes.some(mode => isFloatInPhysical(mode.physical, fixFeature.properties));
}

/**
 * @param {Physical|null} physical The physical data to check
 * @param {Array.<String>} properties Physical properties to check
 * @returns {Boolean} Whether one of the given properties have a floating point value
 */
function isFloatInPhysical(physical, properties) {
  return physical !== null && properties.some(property => physical[property] !== null && Math.abs(physical[property]) % 1 > 0);
}
