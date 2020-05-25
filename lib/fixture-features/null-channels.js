/** @typedef {import('../model/Fixture.js').default} Fixture */

module.exports = [{
  name: `\`null\` channels`,
  description: `Channel list of a mode contains null, so it has an unused channel`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.nullChannels.length > 0,
}];
