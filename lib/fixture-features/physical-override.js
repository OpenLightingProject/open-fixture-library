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
  name: `Physical override`,
  description: `Whether at least one mode uses the 'physical' property`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.modes.some(mode => mode.physicalOverride !== null)
}];
