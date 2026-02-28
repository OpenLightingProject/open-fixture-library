/** @import Fixture from '../model/Fixture.js' */

export default [{
  name: '`null` channels',
  description: 'Channel list of a mode contains null, so it has an unused channel',

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: (fixture) => fixture.nullChannels.length > 0,
}];
