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
  name: `No physical`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.physical === null
}];
