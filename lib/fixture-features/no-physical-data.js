/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [{
  name: `No physical`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.physical === null,
}];
