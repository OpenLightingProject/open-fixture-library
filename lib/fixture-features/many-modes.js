/** @typedef {import('../model/Fixture.js').default} Fixture */

module.exports = [{
  name: `Many modes`,
  description: `True if the fixture has more than 15 modes.`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} True if the fixture has more than 15 modes.
   */
  hasFeature: fixture => fixture.modes.length > 15,
}];
