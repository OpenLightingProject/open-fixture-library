import FineChannel from '../model/FineChannel.js';
/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [
  {
    id: `switching-channels`,
    name: `Switching channels`,
    description: `Whether at least one channel defines switching channel aliases`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.switchingChannels.length > 0,
  },
  {
    id: `switches-fine-channels`,
    name: `Switches fine channels`,
    description: `Whether at least one switching channel switches fine channels`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.switchingChannels.some(
      switchingChannel => switchingChannel.switchToChannels.some(
        channel => channel instanceof FineChannel,
      ),
    ),
  },
  {
    id: `switching-channel-positions`,
    name: `Switching channel at different positions`,
    description: `Whether there is a switching channel that is used at different positions in different modes`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.switchingChannels.some(switchingChannel => {
      const usedIndices = [];

      return fixture.modes.some(mode => {
        const index = mode.getChannelIndex(switchingChannel.key, `all`);

        // channel is not used in mode
        if (index === -1) {
          return false;
        }

        // channel is used at a new position
        if (!usedIndices.includes(index) && usedIndices.length > 0) {
          return true;
        }

        usedIndices.push(index);
        return false;
      });
    }),
  },
];
