/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [{
  name: `Many modes`,
  description: `True if the fixture has more than 15 modes.`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} True if the fixture has more than 15 modes.
   */
  hasFeature: fixture => fixture.modes.length > 15,
}];
