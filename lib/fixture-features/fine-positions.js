/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  CoarseChannel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
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
    name: `Fine before coarse`,
    description: `Fine channel used in a mode before its coarse channel`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(mode =>
      mode.channelKeys.some((chKey, chPos) => {
        const channel = fixture.getChannelByKey(chKey);
        return channel instanceof FineChannel && chPos < mode.getChannelIndex(channel.coarseChannel.key);
      })
    )
  },

  {
    name: `Fine not-adjacent after coarse`,
    description: `Coarse channel with fine channels are not directly after each other`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(mode =>
      mode.channelKeys.some((chKey, chPos) => {
        const channel = fixture.getChannelByKey(chKey);
        return channel instanceof FineChannel && chPos > mode.getChannelIndex(channel.coarserChannel.key) + 1;
      })
    )
  }
];
