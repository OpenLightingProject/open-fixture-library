import FineChannel from '../model/FineChannel.js';
import SwitchingChannel from '../model/SwitchingChannel.js';
/** @typedef {import('../model/Fixture.js').default} Fixture */

export default [
  {
    id: `matrix-pixelKeys`,
    name: `Uses pixelKeys`,
    description: `The fixture has a matrix and has set the pixelKeys individually.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && `pixelKeys` in fixture.matrix.jsonObject,
  },

  {
    id: `matrix-pixelCount`,
    name: `Uses pixelCount`,
    description: `The fixture has a matrix and has set the pixelCount property.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && `pixelCount` in fixture.matrix.jsonObject,
  },

  {
    id: `matrix-pixelGroups`,
    name: `Uses pixelGroups`,
    description: `The fixture has a matrix and has set pixelGroups.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelGroupKeys.length > 0,
  },

  {
    id: `matrix-pixelGroups-number-constraints`,
    name: `Uses pixelGroup number constraints`,
    description: `The fixture has a matrix and has set pixelGroups using number constraint syntax.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && Object.values(fixture.matrix.jsonObject.pixelGroups || {}).some(
      group => group !== `all` && !Array.isArray(group) && Object.keys(group).some(constraint => [`x`, `y`, `z`].includes(constraint)),
    ),
  },

  {
    id: `matrix-pixelGroups-string-constraints`,
    name: `Uses pixelGroup string constraints`,
    description: `The fixture has a matrix and has set pixelGroups using string constraint syntax.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && Object.values(fixture.matrix.jsonObject.pixelGroups || {}).some(
      group => group !== `all` && !Array.isArray(group) && Object.keys(group).includes(`name`),
    ),
  },

  {
    id: `matrix-custom-layout`,
    name: `Custom matrix layout`,
    description: `The fixture has a matrix and it uses null pixelKeys – it is no line, rectangle or cube.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelKeyStructure.some(
      zLevel => zLevel.some(
        row => row.includes(null),
      ),
    ),
  },

  {
    id: `fine-matrix-channel`,
    name: `Fine matrix channel`,
    description: `The fixture repeats fine channels for matrix pixels.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrixChannels.some(channel => channel instanceof FineChannel),
  },

  {
    id: `switching-matrix-channel`,
    name: `Switching matrix channel`,
    description: `The fixture repeats switching channels for matrix pixels.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.matrixChannels.some(channel => channel instanceof SwitchingChannel),
  },

  {
    id: `matrix-channel-overridden`,
    name: `Matrix channel overridden`,
    description: `An available channel overrides a specific matrix channel (at a specific pixel).`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.availableChannels.some(channel => fixture.matrixChannelKeys.includes(channel.key)),
  },

  {
    id: `matrix-channel-used-directly`,
    name: `Matrix channel used directly`,
    description: `If a mode contains a resolved matrix channel key in its raw channel list or if a non-matrix switching channel switches to a matrix channel.`,

    /**
     * @param {Fixture} fixture The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => {
      const channelKeyInRawChannelList = fixture.modes.some(
        mode => mode.jsonObject.channels.some(
          channelKey => fixture.matrixChannelKeys.includes(channelKey),
        ),
      );

      const channelKeyInSwitchingChannel = fixture.switchingChannels.some(
        swChannel => swChannel.pixelKey === null && swChannel.switchToChannels.some(
          channel => channel.pixelKey !== null,
        ),
      );

      return channelKeyInRawChannelList || channelKeyInSwitchingChannel;
    },
  },
];
