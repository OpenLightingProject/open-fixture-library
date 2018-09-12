/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  CoarseChannel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../model.js`);
/* eslint-enable no-unused-vars */

module.exports = [{
  name: `Multiple Focuses`,
  description: `True if multiple Pan / Tilt channels are used in some mode.`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => fixture.modes.some(mode => {
    const multiPan = mode.channels.filter(
      channel => channel.type === `Pan`
    ).length > 1;

    const multiTilt = mode.channels.filter(
      channel => channel.type === `Tilt`
    ).length > 1;

    return multiPan || multiTilt;
  })
}];
