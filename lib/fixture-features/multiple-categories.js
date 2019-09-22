/** @typedef {import('../model/Fixture.js').default} Fixture */

module.exports = [{
  name: `Multiple categories`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.categories.length > 1
}];
