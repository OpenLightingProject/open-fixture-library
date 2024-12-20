/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [
  {
    id: `fine-channel-alias`,
    name: `Fine channels (16bit)`,
    description: `Whether a channel defines exactly one fine channel alias`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.coarseChannels.some(channel => channel.fineChannelAliases.length === 1),
  },

  {
    id: `fine-channel-aliases`,
    name: `Fine channels (>16bit)`,
    description: `Whether a channel defines two or more fine channel aliases`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.coarseChannels.some(channel => channel.fineChannelAliases.length > 1),
  },

  {
    id: `fine-channel-capabilities`,
    name: `Fine channel capabilities`,
    description: `Whether a channel with fine channel aliases has capabilities`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.coarseChannels.some(
      channel => channel.fineChannelAliases.length > 0 && channel.capabilities.length > 1,
    ),
  },
];
