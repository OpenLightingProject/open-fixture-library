import FineChannel from '../model/FineChannel.js';
/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [
  {
    name: `Fine before coarse`,
    description: `Fine channel used in a mode before its coarse channel`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(mode =>
      mode.channelKeys.some((channelKey, channelPos) => {
        const channel = fixture.getChannelByKey(channelKey);
        return channel instanceof FineChannel && channelPos < mode.getChannelIndex(channel.coarseChannel.key);
      }),
    ),
  },

  {
    name: `Fine not-adjacent after coarse`,
    description: `Coarse channel with fine channels are not directly after each other`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(mode =>
      mode.channelKeys.some((channelKey, channelPos) => {
        const channel = fixture.getChannelByKey(channelKey);
        return channel instanceof FineChannel && channelPos > mode.getChannelIndex(channel.coarserChannel.key) + 1;
      }),
    ),
  },
];
