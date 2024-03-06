/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [{
  name: `RDM`,
  description: `Whether an RDM model ID is set`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.rdm !== null,
}];
