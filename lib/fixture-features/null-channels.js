/** @import Fixture from '../model/Fixture.js' */

export default [
  {
    name: '`null` channels',
    description: 'Channel list of a mode contains null, so it has an unused channel',

    /**
     * @param {Readonly<Fixture>} fixture - The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: (fixture) => fixture.nullChannels.length > 0,
  },
  {
    name: 'multiple `null` channels as switching channel targets',
    description: 'Multiple switching channels switch to null',

    /**
     * @param {Readonly<Fixture>} fixture - The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: (fixture) => fixture.nullSwitchingChannelAliases.length > 1,
  },
  {
    id: 'null-channels-matrix-insert',
    name: '`null` channels in matrix insert blocks',
    description: 'A matrix channel insert block contains `null` in templateChannels',

    /**
     * @param {Readonly<Fixture>} fixture - The Fixture instance
     * @returns {boolean} true if the fixture uses the feature
     */
    hasFeature: (fixture) => fixture.modes.some(
      (mode) => mode.jsonObject.channels.some(
        (channel) => channel !== null && channel.insert === 'matrixChannels' && channel.templateChannels.includes(null),
      ),
    ),
  },
];
