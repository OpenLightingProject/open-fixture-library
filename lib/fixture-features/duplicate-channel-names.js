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

module.exports = [{
  name: `Duplicate channel names`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => {
    const uniqueNames = new Set(fixture.normalizedChannels.map(ch => ch.name));
    return uniqueNames.size < fixture.normalizedChannels.length;
  }
}];
