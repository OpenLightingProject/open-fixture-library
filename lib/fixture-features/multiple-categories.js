/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
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

module.exports = [{
  name: `Multiple categories`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.categories.length > 1
}];
