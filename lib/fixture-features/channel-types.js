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

/** @type {Array.<string>} */
const channelTypes = require(`../../lib/schema-properties.js`).channel.type.enum;

module.exports = channelTypes.map(type => ({
  id: `channel-type-${type.toLowerCase().replace(` `, `-`)}`,
  name: `Channel type ${type}`,
  description: `Whether the fixture has at least one channel of type '${type}'`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture has at least one channel
   */
  hasFeature: fixture => fixture.normalizedChannels.some(
    channel => channel.type === type
  )
}));
