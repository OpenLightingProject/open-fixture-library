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
  name: `Reused channels`,
  description: `Whether there is at least one channel that is used in different modes`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => {
    const usedChannels = [];
    for (const mode of fixture.modes) {
      for (const ch of mode.channelKeys) {
        if (usedChannels.includes(ch)) {
          return true;
        }
        usedChannels.push(ch);
      }
    }
    return false;
  }
}];
