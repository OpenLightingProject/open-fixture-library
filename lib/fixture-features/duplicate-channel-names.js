/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [{
  name: `Duplicate channel names`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => {
    const uniqueNames = new Set(fixture.allChannels.map(channel => channel.name));
    return uniqueNames.size < fixture.allChannels.length;
  },
}];
