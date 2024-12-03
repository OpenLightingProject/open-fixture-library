import CoarseChannel from '../model/CoarseChannel.js';

/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [
  {
    id: `16bit-capability-range`,
    name: `16bit capability range`,
    description: `Whether a capability has a 16bit DMX value range`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.coarseChannels.some(
      channel => channel.dmxValueResolution === CoarseChannel.RESOLUTION_16BIT && channel.capabilities.some(
        capability => capability.rawDmxRange.start % 256 !== 0,
      ),
    ),
  },

  {
    id: `16bit-default-value`,
    name: `16bit default value`,
    description: `Whether a channel has a 16bit default value`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.coarseChannels.some(
      channel => Number.isInteger(channel.jsonObject.defaultValue) && channel.defaultValue % 256 !== 0,
    ),
  },
];
