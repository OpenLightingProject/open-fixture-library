/** @typedef {import('../model/Fixture.js').default} Fixture */

module.exports = [{
  name: `Duplicate channel names`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => {
    const uniqueNames = new Set(fixture.allChannels.map(ch => ch.name));
    return uniqueNames.size < fixture.allChannels.length;
  },
}];
