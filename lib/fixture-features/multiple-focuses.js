/* eslint-disable no-unused-vars */
const AbstractChannel = require('../model/AbstractChannel.js');
const Capability = require('../model/Capability.js');
const Channel = require('../model/Channel.js');
const FineChannel = require('../model/FineChannel.js');
const Fixture = require('../model/Fixture.js');
const Manufacturer = require('../model/Manufacturer.js');
const Matrix = require('../model/Matrix.js');
const MatrixChannel = require('../model/MatrixChannel.js');
const MatrixChannelReference = require('../model/MatrixChannelReference.js');
const Meta = require('../model/Meta.js');
const Mode = require('../model/Mode.js');
const NullChannel = require('../model/NullChannel.js');
const Physical = require('../model/Physical.js');
const Range = require('../model/Range.js');
const SwitchingChannel = require('../model/SwitchingChannel.js');
const TemplateChannel = require('../model/TemplateChannel.js');
/* eslint-enable no-unused-vars */

module.exports = [{
  name: 'Multiple Focuses',
  description: 'True if multiple Pan / Tilt channels are used in some mode.',

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.modes.some(mode => {
    const multiPan = mode.channels.filter(
      channel => checkChannelType(channel, 'Pan')
    ).length > 1;

    const multiTilt = mode.channels.filter(
      channel => checkChannelType(channel, 'Tilt')
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
