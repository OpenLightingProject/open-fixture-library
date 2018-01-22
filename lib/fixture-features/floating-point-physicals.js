/* eslint-disable no-unused-vars */
const AbstractChannel = require(`../model/AbstractChannel.js`);
const Capability = require(`../model/Capability.js`);
const Channel = require(`../model/Channel.js`);
const FineChannel = require(`../model/FineChannel.js`);
const Fixture = require(`../model/Fixture.js`);
const Manufacturer = require(`../model/Manufacturer.js`);
const Matrix = require(`../model/Matrix.js`);
const MatrixChannel = require(`../model/MatrixChannel.js`);
const MatrixChannelReference = require(`../model/MatrixChannelReference.js`);
const Meta = require(`../model/Meta.js`);
const Mode = require(`../model/Mode.js`);
const NullChannel = require(`../model/NullChannel.js`);
const Physical = require(`../model/Physical.js`);
const Range = require(`../model/Range.js`);
const SwitchingChannel = require(`../model/SwitchingChannel.js`);
const TemplateChannel = require(`../model/TemplateChannel.js`);
/* eslint-enable no-unused-vars */

module.exports = [
  {
    id: `floating-point-dimensions`,
    name: `Floating point dimensions`,
    description: `In fixture physical or in a mode's physical override. See [#133](https://github.com/FloEdelmann/open-fixture-library/issues/133).`,
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