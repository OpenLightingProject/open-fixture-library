/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [{
  name: `Reused channels`,
  description: `Whether there is at least one channel that is used in different modes`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => {
    const usedChannels = [];
    for (const mode of fixture.modes) {
      for (const channel of mode.channelKeys) {
        if (usedChannels.includes(channel)) {
          return true;
        }
        usedChannels.push(channel);
      }
    }
    return false;
  },
}];
