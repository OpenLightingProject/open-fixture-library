/** @import Fixture from '../model/Fixture.js' */

export default [{
  name: 'Multiple categories',

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.categories.length > 1,
}];
