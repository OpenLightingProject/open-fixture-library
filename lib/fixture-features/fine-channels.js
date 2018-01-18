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

module.exports = [
  {
    id: 'fine-channel-alias',
    name: 'Fine channels (16bit)',
    description: 'Whether a channel defines exactly one fine channel alias',

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.normalizedChannels.some(channel => channel.fineChannelAliases.length === 1)
  },

  {
    id: 'fine-channel-aliases',
    name: 'Fine channels (>16bit)',
    description: 'Whether a channel defines two or more fine channel aliases',

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.normalizedChannels.some(channel => channel.fineChannelAliases.length > 1)
  },

  {
    id: 'fine-channel-capabilities',
    name: 'Fine channel capabilities',
    description: 'Whether a channel with fine channel aliases has capabilities',

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.normalizedChannels.some(
      ch => ch.hasCapabilities && ch.fineChannelAliases.length > 0
    )
  }
];