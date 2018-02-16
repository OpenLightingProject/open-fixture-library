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
  name: `Multiple Focuses`,
  description: `True if multiple Pan / Tilt channels are used in some mode.`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.modes.some(mode => {
    const multiPan = mode.channels.filter(
      channel => checkChannelType(channel, `Pan`)
    ).length > 1;

    const multiTilt = mode.channels.filter(
      channel => checkChannelType(channel, `Tilt`)
    ).length > 1;

    return multiPan || multiTilt;
  })
}];

/**
 * Checks if the channel has the specified type under consideration of matrix channels.
 * @param {!AbstractChannel|MatrixChannel} channel The channel to check.
 * @param {!string} type The type that shall be checked.
 * @returns {!boolean} True if the channel has the specified type.
 */
function checkChannelType(channel, type) {
  if (channel instanceof MatrixChannel) {
    channel = channel.wrappedChannel;
  }
  return channel.type === type;
}
