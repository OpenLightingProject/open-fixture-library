/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [{
  name: `Physical override`,
  description: `Whether at least one mode uses the 'physical' property`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.modes.some(mode => mode.physicalOverride !== null),
}];
