/** @typedef {import('../model/Fixture.js').default} Fixture */

module.exports = [{
  name: `No physical`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.physical === null
}];
