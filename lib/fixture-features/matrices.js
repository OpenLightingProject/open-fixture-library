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

module.exports = [
  {
    id: `matrix-pixelKeys`,
    name: `Uses pixelKeys`,
    description: `The fixture has a matrix and has set the pixelKeys individually.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && `pixelKeys` in fixture.matrix.jsonObject
  },

  {
    id: `matrix-pixelCount`,
    name: `Uses pixelCount`,
    description: `The fixture has a matrix and has set the pixelCount property.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && `pixelCount` in fixture.matrix.jsonObject
  },

  {
    id: `matrix-pixelGroups`,
    name: `Uses pixelGroups`,
    description: `The fixture has a matrix and has set pixelGroups.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelGroupKeys.length > 0
  },

  {
    id: `matrix-custom-layout`,
    name: `Custom matrix layout`,
    description: `The fixture has a matrix and it uses null pixelKeys – it is no line, rectangle or cube.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelKeyStructure.some(
      zLevel => zLevel.some(
        row => row.some(
          pixelKey => pixelKey === null
        )
      )
    )
  },

  {
    id: `fine-matrix-channel`,
    name: `Fine matrix channel`,
    description: `The fixture repeats fine channels for matrix pixels.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrixChannels.some(ch => ch.wrappedChannel instanceof FineChannel)
  },

  {
    id: `switching-matrix-channel`,
    name: `Switching matrix channel`,
    description: `The fixture repeats switching channels for matrix pixels.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrixChannels.some(ch => ch.wrappedChannel instanceof SwitchingChannel)
  },

  {
    id: `matrix-channel-used-directly`,
    name: `Matrix channel used directly`,
    description: `If a mode contains a resolved matrix channel key in its raw channel list or if a non-matrix switching channel switches to a matrix channel.`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(
      mode => mode.jsonObject.channels.some(
        chKey => fixture.matrixChannelKeys.includes(chKey)
      )
    ) || fixture.switchingChannels.some(
        swCh => swCh.switchToChannels.some(
          ch => ch instanceof MatrixChannel
        )
      )
  }
];
