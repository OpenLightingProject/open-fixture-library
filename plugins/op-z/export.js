const {
  FineChannel,
  NullChannel,
  SwitchingChannel
} = require(`../../lib/model.js`);

module.exports.name = `OP-Z`;
module.exports.version = `0.1.0`;

const MAX_KNOBS = 8;
const MAX_OPZ_FIXTURES = 16;

/**
 * @param {array.<Fixture>} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<array.<object>, Error>} The generated files.
*/
module.exports.export = function exportOpZ(fixtures, options) {
  const exportJson = {
    profiles: [],
    config: []
  };

  const usedKnobs = {};

  fixtures.forEach(fixture => {
    const fixtureKey = `${fixture.manufacturer.key}/${fixture.key}`;

    fixture.modes.forEach((mode, modeIndex) => {
      const modeName = `${fixtureKey}/${mode.shortName}`;

      // add profile
      exportJson.profiles.push({
        name: modeName,
        channels: mode.channels.map(channel => getOpZChannelType(channel, fixtureKey))
      });

      // add config
      if (modeIndex === 0 && exportJson.config.length < MAX_OPZ_FIXTURES) {
        exportJson.config.push({
          fixture: exportJson.config.length + 1,
          profile: modeName
        });
      }
    });
  });


  return Promise.resolve([{
    name: `dmx.json`,
    content: JSON.stringify(exportJson, null, 2),
    mimetype: `application/json`,
    fixtures
  }]);



  /**
   * @param {AbstractChannel} channel The OFL channel object.
   * @param {string} fixtureKey The OFL fixture key.
   * @returns {string} The OP-Z channel type.
   */
  function getOpZChannelType(channel, fixtureKey) {
    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    if (channel instanceof NullChannel || channel instanceof FineChannel) {
      return `off`;
    }

    const opZChannelTypes = {
      'red': () => channel.color === `Red`,
      'green': () => channel.color === `Green`,
      'blue': () => channel.color === `Blue`,
      'white': () => channel.color === `White`,
      'color': () => channel.type === `Multi-Color`,
      'intensity': () => channel.type === `Intensity`,
      'fog': () => channel.type === `Fog`,
      // 'knob1': () => false,
      // 'knob2': () => false,
      // 'knob3': () => false,
      // 'knob4': () => false,
      // 'knob5': () => false,
      // 'knob6': () => false,
      // 'knob7': () => false,
      // 'knob8': () => false,
      // '0 – 255': () => false,
      'on': () => channel.type === `Shutter`,
      'off': () => channel.type === `Maintenance`
    };

    const channelType = Object.keys(opZChannelTypes).find(
      type => opZChannelTypes[type]()
    );
    if (channelType) {
      return channelType;
    }

    return getKnobType() || `${channel.defaultValue}`;


    /**
     * Try to use a `knobX` OP-Z channel type for this channel. A channel used
     * across different modes will get the same knob again. null is returned
     * for all channels after all knobs are already assigned.
     * @returns {string|null} The OP-Z channel type `knobX` if applicable, null otherwise.
     */
    function getKnobType() {
      const channelKey = `${fixtureKey}/${channel.key}`;
      if (channelKey in usedKnobs) {
        return usedKnobs[channelKey];
      }

      const usedKnobCount = Object.keys(usedKnobs).length;
      if (usedKnobCount < MAX_KNOBS) {
        usedKnobs[channelKey] = `knob${usedKnobCount + 1}`;

        return usedKnobs[channelKey];
      }

      return null;
    }
  }
};
