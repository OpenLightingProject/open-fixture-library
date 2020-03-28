// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign
const { v5: uuidv5 } = require(`uuid`);

const {
  CoarseChannel,
  FineChannel,
  SwitchingChannel
} = require(`../../lib/model.js`);
const { scaleDmxValue } = require(`../../lib/scale-dmx-values.js`);

module.exports.name = `ColorSource`;
module.exports.version = `0.1.0`;

const EDITOR_VERSION = `1.1.1.9.0.4`;

const CHANNEL_TYPE_NO_FUNCTION = 0;
const CHANNEL_TYPE_INTENSITY = 1;
const CHANNEL_TYPE_POSITION = 2;
const CHANNEL_TYPE_MULTI_COLOR = 3;
const CHANNEL_TYPE_BEAM = 4;
const CHANNEL_TYPE_COLOR = 5;

const UUID_NAMESPACE = `0de81b51-02b2-45e3-b53c-578f9eb31b77`; // seed for UUIDs

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = function exportColorSource(fixtures, options) {
  const exportJson = {
    date: options.date.toISOString().replace(/\.\d\d\dZ$/, `Z`),
    editorVersion: EDITOR_VERSION,
    personalities: []
  };

  fixtures.forEach(fixture => {
    const fixtureUuidNamespace = uuidv5(`${fixture.manufacturer.key}/${fixture.key}`, UUID_NAMESPACE);

    fixture.modes.forEach(mode => {
      const dcid = uuidv5(mode.name, fixtureUuidNamespace);
      const hasIntensity = mode.channels.some(ch => ch.type === `Intensity`);
      const parameters = getColorSourceChannels(mode, hasIntensity);

      const fixtureJson = {
        dcid,
        colortable: getColorTable(parameters) || `11111111-1111-1111-1111-111111111111`,
        commands: getCommands(mode),
        hasIntensity,
        manufacturerName: fixture.manufacturer.name,
        maxOffset: mode.channels.length - 1,
        modeName: mode.name,
        modelName: fixture.name,
        parameters
      };

      removeEmptyProperties(fixtureJson);

      exportJson.personalities.push(fixtureJson);
    });
  });

  return Promise.resolve([{
    name: `userlib.jlib`,
    content: JSON.stringify(exportJson, null, 2),
    mimetype: `application/json`,
    fixtures
  }]);
};

/**
 * @param {Array.<Object>} colorSourceChannels A ColorSource fixture's parameter property.
 * @returns {String|null} The UUID of a suitable color table or null if no color table fits.
 */
function getColorTable(colorSourceChannels) {
  const colorChannels = colorSourceChannels.filter(ch => ch.type === CHANNEL_TYPE_COLOR);

  const colorTables = {
    "373673E3-571E-4CE2-B12D-CDD44085A1EB": [`Red`, `Green`, `Blue`, `Amber`, `Cyan`, `Indigo`, `RedOrange`],
    "02A2F87C-AB4C-41F5-8779-A51B99D0BE1C": [`Red`, `Green`, `Blue`, `White`, `Amber`, `Cyan`, `Indigo`],
    "75FEB905-EA2A-4643-B4F8-1A84141F8E98": [`Red`, `Green`, `Blue`, `Amber`, `Cyan`, `Indigo`, `Lime`],
    "EDDEAC65-BD2E-4D87-B163-D7A2434EC081": [`Red`, `Green`, `Blue`, `White`, `Amber`, `UV`],
    "04493BB0-7B6E-4B6C-B3B7-D9641F7511AD": [`Red`, `Green`, `Blue`, `Cyan`, `Indigo`],
    "91189886-6A6A-47CF-9137-5F5A7A88D829": [`Red`, `Green`, `Amber`, `Indigo`, `RedOrange`],
    "C7A1FB0A-AA23-468F-9060-AC1625155DE8": [`Red`, `Green`, `Blue`, `White`, `Amber`],
    "1D16DE15-5F4C-46A9-9C3D-2380C2D2793A": [`Red`, `Green`, `Blue`, `Amber`, `Indigo`],
    "3F90A9F9-209F-4505-A9F2-FEC17BC6A426": [`Red`, `Green`, `Blue`, `Amber`, `Cyan`],
    "B28E1514-AE8C-4E06-8472-B52D575B1CF2": [`Red`, `Green`, `Blue`, `White`, `UV`],
    "77597794-7BFF-46A3-878B-906D3780E6C9": [`Red`, `Blue`, `White`, `Indigo`],
    "77A82F8A-9B24-4C3F-98FC-B6A29FB1AAE6": [`Red`, `Green`, `Blue`, `White`],
    "74EF89F4-0B78-4DC6-8E8A-68E3298B7CD2": [`Red`, `Green`, `Blue`, `UV`],
    "D3E71EC8-3406-4572-A64C-52A38649C795": [`Red`, `Green`, `Blue`, `Amber`],
    "B043D095-95A4-4DDB-AB38-252C991B13A8": [`Red`, `Green`, `Blue`, `Indigo`],
    "3874B444-A11E-47D9-8295-04556EAEBEA7": [`Red`, `Green`, `Blue`],
    "637E8789-5540-45D5-BD83-D7C2A7618B45": [`Red`, `Green`, `Indigo`],
    "EF4970BA-2536-4725-9B0F-B2D7A021E139": [`Cyan`, `Magenta`, `Yellow`],
    "E6AC63D6-1349-4BFC-9A04-7548D1DB8E1F": [`CoolWhite`, `MediumWhite`, `WarmWhite`],
    "7B365530-A4DF-44AD-AEF5-225472BE02AE": [`CoolWhite`, `WarmWhite`],
    "B074A2D3-0C40-45A7-844A-7C2721E0B267": [`Hue`, `Saturation`]
  };

  let selectedColorTable = Object.keys(colorTables).find(
    colorTable => colorTables[colorTable].every(
      color => colorChannels.some(ch => ch.name === color)
    )
  );

  const has16bitHue = colorChannels.some(ch => ch.name === `Hue` && ch.size === 16);
  if (selectedColorTable === `B074A2D3-0C40-45A7-844A-7C2721E0B267` && has16bitHue) {
    // this is a special case; it refers to Hue / Hue fine / Saturation
    selectedColorTable = `B3D05F0E-FB45-4EEA-A8D5-61F545A922DE`;
  }

  return selectedColorTable || null;
}

/**
 * @param {Mode} mode The personality's mode.
 * @returns {Array.<Object>} Array of ColorSource commands (e. g. set channel X to value Y after Z seconds), may be empty. The commands are generated by Maintenance capabilities with hold time set.
 */
function getCommands(mode) {
  const commands = [];
  mode.channels.forEach((channel, channelIndex) => {
    if (!channel.capabilities) {
      // e. g. fine channels
      return;
    }

    channel.capabilities.forEach(cap => {
      if (cap.type === `Maintenance` && cap.hold) {
        commands.push({
          name: cap.comment,
          steps: [
            {
              actions: [{
                dmx: channelIndex,
                value: cap.getMenuClickDmxValueWithResolution(CoarseChannel.RESOLUTION_8BIT)
              }],
              wait: 0 // this is apparently the delay before this step is activated
            },
            {
              actions: [{
                dmx: channelIndex,
                value: -1
              }],
              wait: cap.hold.getBaseUnitEntity().number
            }
          ]
        });
      }
    });
  });

  return commands;
}

/**
 * @param {Mode} mode The personality's mode.
 * @param {Boolean} hasIntensity Whether the mode has an intensity channel. Should be equal to `fixtureJson.hasIntensity`.
 * @returns {Array.<Object>} ColorSource channel objects of all mode channels.
 */
function getColorSourceChannels(mode, hasIntensity) {
  const channels = [];
  mode.channels.forEach((channel, channelIndex) => {
    const name = channel.name;

    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    const channelJson = {
      coarse: channelIndex,
      fadeWithIntensity: false,
      fine: null,
      highlight: 65535,
      home: 0,
      invert: false,
      name,
      ranges: [],
      size: 8,
      snap: false,
      type: getColorSourceChannelType(channel)
    };

    if (channelJson.type === CHANNEL_TYPE_COLOR) {
      if (isMatrixChannel(channel)) {
        channelJson.type = CHANNEL_TYPE_BEAM;
      }
      else if (channel.color) { // it may also be Hue or Saturation, which have no color
        channelJson.name = channel.color.replace(/ /g, ``); // e.g. 'Warm White' -> 'WarmWhite'
      }
    }

    if (channel instanceof FineChannel) {
      if (channel.resolution === CoarseChannel.RESOLUTION_16BIT) {
        // already handled by "fine" attribute of coarse channel
        return;
      }

      channelJson.type = CHANNEL_TYPE_BEAM;
      channelJson.home = scaleDmxValue(channel.defaultValue, CoarseChannel.RESOLUTION_8BIT, CoarseChannel.RESOLUTION_16BIT);
    }
    else {
      addColorSourceChannelDetails(channelJson, channel);
    }

    removeEmptyProperties(channelJson);

    channels.push(channelJson);
  });

  return channels;

  /**
   * Adds information to given channel JSON that is specific to (and only makes sense for) coarse channels.
   * @param {Object} channelJson The ColorSource channel JSON to which the data is added.
   * @param {CoarseChannel} channel The OFL channel whose information should be used.
   */
  function addColorSourceChannelDetails(channelJson, channel) {
    channelJson.fadeWithIntensity = channel.type === `Single Color` && hasIntensity;

    const fineChannel16bit = channel.fineChannels[0];
    const fineChannelIndex = mode.getChannelIndex(fineChannel16bit || {}, `default`);
    if (fineChannelIndex !== -1) {
      channelJson.fine = fineChannelIndex;
      channelJson.size = 16;
    }

    const channelResolution = channelJson.size / 8;
    channelJson.highlight = scaleDmxValue(
      channel.getHighlightValueWithResolution(channelResolution),
      channelResolution,
      CoarseChannel.RESOLUTION_16BIT
    );
    channelJson.home = scaleDmxValue(
      channel.getDefaultValueWithResolution(channelResolution),
      channelResolution,
      CoarseChannel.RESOLUTION_16BIT
    );

    channelJson.invert = channel.isInverted;
    channelJson.snap = !channel.canCrossfade;

    if (channelJson.type !== CHANNEL_TYPE_NO_FUNCTION) {
      channelJson.ranges = channel.capabilities.map(cap => {
        const dmxRange = cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);
        const capJson = {
          begin: dmxRange.start,
          default: cap.getMenuClickDmxValueWithResolution(CoarseChannel.RESOLUTION_8BIT),
          end: dmxRange.end,
          label: cap.name
        };

        if (cap.colors && cap.colors.allColors.length === 1) {
          const color = cap.colors.allColors[0]; // `#rrggbb`
          capJson.media = {
            r: parseInt(color.slice(1, 3), 16),
            g: parseInt(color.slice(3, 5), 16),
            b: parseInt(color.slice(5, 7), 16)
          };
        }

        return capJson;
      });
    }
  }

  /**
   * @param {CoarseChannel} channel The OFL channel whose information should be used.
   * @returns {Boolean} Whether the channel belongs to a pixel or pixel group that is not the master pixel group.
   */
  function isMatrixChannel(channel) {
    if (!channel.pixelKey) {
      return false;
    }

    const matrix = mode.fixture.matrix;
    const isPixelGroup = matrix.pixelGroupKeys.includes(channel.pixelKey);
    const isMasterPixelGroup = isPixelGroup && matrix.pixelGroups[channel.pixelKey].length === matrix.pixelKeys.length;

    return !isMasterPixelGroup;
  }
}

/**
 * @param {AbstractChannel} channel The OFL channel of which the ColorSource channel type should be returned.
 * @returns {Number} One of ColorSource's channel types as positive integer.
 */
function getColorSourceChannelType(channel) {
  if (channel.type === `NoFunction`) {
    return CHANNEL_TYPE_NO_FUNCTION;
  }

  if (channel.type === `Single Color` || [`Hue`, `Saturation`].includes(channel.name)) {
    return CHANNEL_TYPE_COLOR;
  }

  if (channel.type === `Intensity`) {
    return CHANNEL_TYPE_INTENSITY;
  }

  if (isTypePosition()) {
    return CHANNEL_TYPE_POSITION;
  }

  if ([`Multi-Color`, `Color Temperature`].includes(channel.type)) {
    return CHANNEL_TYPE_MULTI_COLOR;
  }

  return CHANNEL_TYPE_BEAM;

  /**
   * @returns {Boolean} Whether the channel is pan, tilt or pan/tilt speed.
   */
  function isTypePosition() {
    if ([`Pan`, `Tilt`].includes(channel.type)) {
      return true;
    }

    if (channel.capabilities && channel.capabilities.some(cap => cap.type === `PanTiltSpeed`)) {
      return true;
    }

    return false;
  }
}

/**
 * Removes null values and empty arrays from the given object.
 * This function is destructive, i.e. it mutates the given object.
 * @param {Object} obj The object whose properties should be cleaned up.
 */
function removeEmptyProperties(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      delete obj[key];
    }
  });
}
