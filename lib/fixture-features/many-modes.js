/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  CoarseChannel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../model.js`);
/* eslint-enable no-unused-vars */

module.exports = [{
  name: `Many modes`,
  description: `True if the fixture has more than 15 modes.`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} True if the fixture has more than 15 modes.
   */
  hasFeature: fixture => fixture.modes.length > 15
}];
