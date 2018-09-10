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

module.exports = [
  {
    id: `fine-channel-alias`,
    name: `Fine channels (16bit)`,
    description: `Whether a channel defines exactly one fine channel alias`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.normalizedChannels.some(channel => channel.fineChannelAliases.length === 1)
  },

  {
    id: `fine-channel-aliases`,
    name: `Fine channels (>16bit)`,
    description: `Whether a channel defines two or more fine channel aliases`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.normalizedChannels.some(channel => channel.fineChannelAliases.length > 1)
  },

  {
    id: `fine-channel-capabilities`,
    name: `Fine channel capabilities`,
    description: `Whether a channel with fine channel aliases has capabilities`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.normalizedChannels.some(
      ch => ch.hasCapabilities && ch.fineChannelAliases.length > 0
    )
  }
];
