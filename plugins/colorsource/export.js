const {
  CoarseChannel,
  FineChannel,
  SwitchingChannel
} = require(`../../lib/model.js`);

module.exports.name = `ColorSource`;
module.exports.version = `0.1.0`;

const EDITOR_VERSION = `1.1.1.9.0.4`;

/**
 * @param {array.<Fixture>} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<array.<object>, Error>} The generated files.
*/
module.exports.export = function exportColorSource(fixtures, options) {
  const exportJson = {
    date: new Date().toISOString(),
    editorVersion: EDITOR_VERSION,
    personalities: []
  };

  fixtures.forEach(fixture => {
    fixture.modes.forEach(mode => {
      const hasIntensity = mode.channels.some(ch => ch.type === `Intensity`);

      const fixtureJson = {
        colortable: null,
        hasIntensity: hasIntensity,
        manufacturerName: fixture.manufacturer.name,
        maxOffset: mode.channels.length - 1,
        modeName: mode.name,
        modelName: fixture.name,
        parameters: []
      };

      mode.channels.forEach((channel, channelIndex) => {
        const name = channel.name;

        if (channel instanceof SwitchingChannel) {
          channel = channel.defaultChannel;
        }

        const channelJson = {
          coarse: channelIndex,
          fadeWithIntensity: false,
          fine: null,
          highlight: 255,
          home: 0,
          invert: false,
          name,
          ranges: [],
          size: 8,
          snap: false,
          type: getCSChannelType(channel)
        };

        if (channelJson.type === 5) {
          channelJson.name = channelJson.name.replace(/ /g, ``); // e.g. 'Warm White' -> 'WarmWhite'
        }

        if (channel instanceof FineChannel) {
          if (channel.resolution === CoarseChannel.RESOLUTION_16BIT) {
            // already handled by "fine" attribute of coarse channel
            return;
          }

          channelJson.type = 3;
          channelJson.home = channel.defaultValue;
        }
        else {
          addChannelDetails(channelJson, channel);
        }

        // remove null values and empty arrays
        Object.entries(channelJson).forEach(([key, value]) => {
          if (value === null || (Array.isArray(value) && value.length === 0)) {
            delete channelJson[key];
          }
        });

        fixtureJson.parameters.push(channelJson);
      });

      fixtureJson.colortable = getColorTable(fixtureJson.parameters);
      if (fixtureJson.colortable === null) {
        delete fixtureJson.colortable;
      }

      exportJson.personalities.push(fixtureJson);


      /**
       * @param {!AbstractChannel} channel The OFL channel of which the ColorSource channel type should be returned.
       * @returns {number} One of ColorSource's channel types as positive integer.
       */
      function getCSChannelType(channel) {
        if (channel.type === `Single Color` || [`Hue`, `Saturation`].includes(channel.name)) {
          return 5;
        }

        if (channel.type === `Intensity`) {
          return 1;
        }

        if ([`Pan`, `Tilt`].includes(channel.type)) {
          return 2;
        }

        if (channel.type === `Color Temperature`) {
          return 3;
        }

        return 4;
      }

      /**
       * Adds detailed information to given channel JSON that only a CoarseChannel can provide.
       * @param {object} channelJson The ColorSource channel JSON to which the data is added.
       * @param {CoarseChannel} channel The channel whose information should be used.
       */
      function addChannelDetails(channelJson, channel) {
        channelJson.fadeWithIntensity = channel.type === `ColorIntensity` && hasIntensity;

        const fineChannel16bit = channel.fineChannels[0];
        const fineChannelIndex = mode.getChannelIndex(fineChannel16bit || {}, `default`);
        if (fineChannelIndex !== -1) {
          channelJson.fine = fineChannelIndex;
          channelJson.size = 16;
        }

        channelJson.highlight = channel.getHighlightValueWithResolution(channelJson.size / 8);
        channelJson.home = channel.getDefaultValueWithResolution(channelJson.size / 8);
        channelJson.invert = channel.isInverted;
        channelJson.snap = !channel.canCrossfade;

        channel.capabilities.forEach(cap => {
          const dmxRange = cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);
          const capJson = {
            begin: dmxRange.start,
            default: cap.getMenuClickDmxValueWithResolution(CoarseChannel.RESOLUTION_8BIT),
            end: dmxRange.end,
            label: cap.name
          };

          if (cap.colors && cap.colors.allColors.length === 1) {
            const color = cap.colors.allColors[0];
            capJson.media = {
              r: parseInt(color[1] + color[2], 16),
              g: parseInt(color[3] + color[4], 16),
              b: parseInt(color[5] + color[6], 16)
            };
          }

          channelJson.ranges.push(capJson);
        });
      }
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
 * @param {array.<object>} colorSourceChannels A ColorSource fixture's parameter property.
 * @returns {string|null} The uuid of a suitable color table or null if no color table fits.
 */
function getColorTable(colorSourceChannels) {
  const colorChannels = colorSourceChannels.filter(ch => ch.type === 5);

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

  let colorTable = Object.keys(colorTables).find(
    colorTable => colorTables[colorTable].every(
      color => colorChannels.some(ch => ch.name === color)
    )
  );

  const has16bitHue = colorChannels.some(ch => ch.name === `Hue` && ch.size === 16);
  if (colorTable === `B074A2D3-0C40-45A7-844A-7C2721E0B267` && has16bitHue) {
    colorTable = `B3D05F0E-FB45-4EEA-A8D5-61F545A922DE`; // this is a special case; it refers to Hue / Hue fine / Saturation
  }

  return colorTable || null;
}
