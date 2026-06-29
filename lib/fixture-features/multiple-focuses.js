/** @import Fixture from '../model/Fixture.js' */

export default [{
  name: 'Multiple Focuses',
  description: 'True if multiple Pan / Tilt channels are used in some mode.',

  /**
   * @param {Readonly<Fixture>} fixture - The Fixture instance
   * @returns {boolean} true if the fixture uses the feature
   */
  hasFeature: (fixture) => fixture.modes.some((mode) => {
    const isMultiPan = mode.channels.filter(
      (channel) => channel.type === 'Pan',
    ).length > 1;

    const isMultiTilt = mode.channels.filter(
      (channel) => channel.type === 'Tilt',
    ).length > 1;

    return isMultiPan || isMultiTilt;
  }),
}];
