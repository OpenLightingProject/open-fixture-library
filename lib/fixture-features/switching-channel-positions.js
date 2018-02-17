/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannel,
  MatrixChannelReference,
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
  name: `Switching channel at different positions`,
  description: `Whether there is a switching channel that is used at different positions in different modes`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture uses the feature
   */
  hasFeature: fixture => {
    const switchingChannels = fixture.allChannels.map(
      ch => (ch instanceof MatrixChannel ? ch.wrappedChannel : ch)
    ).filter(
      ch => ch instanceof SwitchingChannel
    );

    return switchingChannels.some(switchingChannel => {
      const usedIndices = [];

      return fixture.modes.some(mode => {
        const index = mode.getChannelIndex(switchingChannel, `all`);

        // channel is not used in mode
        if (index === -1) {
          return false;
        }

        // channel is used at a new position
        if (!usedIndices.includes(index) && usedIndices.length > 0) {
          return true;
        }

        usedIndices.push(index);
        return false;
      });
    })
  }
}];
