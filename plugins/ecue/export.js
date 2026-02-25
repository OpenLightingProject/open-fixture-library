import xmlbuilder from 'xmlbuilder';

import CoarseChannel from '../../lib/model/CoarseChannel.js';
import FineChannel from '../../lib/model/FineChannel.js';
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */
import NullChannel from '../../lib/model/NullChannel.js';
import Physical from '../../lib/model/Physical.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

export const version = `0.3.0`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const timestamp = dateToString(options.date);

  const manufacturers = {};
  for (const fixture of fixtures) {
    const manufacturer = fixture.manufacturer.key;
    if (!(manufacturer in manufacturers)) {
      manufacturers[manufacturer] = {
        data: fixture.manufacturer,
        fixtures: [],
      };
    }
    manufacturers[manufacturer].fixtures.push(fixture);
  }

  const xml = xmlbuilder.create(
    {
      Document: {
        '@Owner': `user`,
        '@TypeVersion': 2,
        '@SaveTimeStamp': timestamp,
      },
    },
    {
      version: `1.0`,
      encoding: `UTF-8`,
      standalone: true,
    },
  );

  const xmlLibrary = xml.element({
    Library: {},
  });
  const xmlFixtures = xmlLibrary.element({
    Fixtures: {},
  });
  const xmlTiles = xmlLibrary.element({
    Tiles: {},
  });

  for (const manufacturer of Object.keys(manufacturers)) {
    const manufacturerAttributes = {
      '_CreationDate': timestamp,
      '_ModifiedDate': timestamp,
      'Name': manufacturers[manufacturer].data.name,
      'Comment': manufacturers[manufacturer].data.comment,
      'Web': manufacturers[manufacturer].data.website || ``,
    };
    xmlTiles.element(`Manufacturer`, manufacturerAttributes);

    const xmlManufacturerFixtures = xmlFixtures.element(`Manufacturer`, manufacturerAttributes);
    for (const fixture of manufacturers[manufacturer].fixtures) {
      addFixture(xmlManufacturerFixtures, fixture);
    }
  }

  return [{
    name: `UserLibrary.xml`,
    content: xml.end({
      pretty: true,
      indent: `    `,
    }),
    mimetype: `application/xml`,
    fixtures,
  }];
}

/**
 * @param {object} xmlManufacturer The xmlbuilder <Manufacturer> object.
 * @param {Fixture} fixture The OFL fixture object.
 */
function addFixture(xmlManufacturer, fixture) {
  try {
    const fixtureCreationDate = dateToString(fixture.meta.createDate);
    const fixtureModifiedDate = dateToString(fixture.meta.lastModifyDate);

    for (const mode of fixture.modes) {
      const physical = mode.physical || new Physical({});

      const xmlFixture = xmlManufacturer.element(`Fixture`, {
        '_CreationDate': fixtureCreationDate,
        '_ModifiedDate': fixtureModifiedDate,
        'Name': fixture.name + (fixture.modes.length > 1 ? ` (${mode.shortName} mode)` : ``),
        'NameShort': fixture.shortName + (fixture.modes.length > 1 ? `-${mode.shortName}` : ``),
        'Comment': getFixtureComment(fixture),
        'AllocateDmxChannels': mode.channels.length,
        'Weight': physical.weight || 0,
        'Power': physical.power || 0,
        'DimWidth': physical.width || 10,
        'DimHeight': physical.height || 10,
        'DimDepth': physical.depth || 10,
      });

      handleMode(xmlFixture, mode);
    }
  }
  catch (error) {
    throw new Error(`Exporting fixture ${fixture.manufacturer.key}/${fixture.key} failed: ${error}`, {
      cause: error,
    });
  }
}

/**
 * @param {object} xmlFixture The xmlbuilder <Fixture> object.
 * @param {Mode} mode The OFL mode object.
 */
function handleMode(xmlFixture, mode) {
  let viewPosCount = 1;
  for (let dmxCount = 0; dmxCount < mode.channels.length; dmxCount++) {
    let channel = mode.channels[dmxCount];

    // skip unused channels
    if (channel instanceof NullChannel) {
      continue;
    }

    const channelName = channel.name;

    // ecue doesn't support switching channels, so we just use the default channel's data
    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    let fineChannelKey = null;
    if (channel instanceof FineChannel) {
      if (channel.resolution === CoarseChannel.RESOLUTION_16BIT) {
        // ignore this channel, we handle it together with its coarse channel
        continue;
      }

      // just pretend its a single channel and use coarse channel's data
      fineChannelKey = channel.key;
      channel = channel.coarseChannel;
    }

    const dmxByte0 = dmxCount + 1;
    let dmxByte1 = 0;
    let resolution = CoarseChannel.RESOLUTION_8BIT;

    if (fineChannelKey === null && channel.fineChannelAliases.length > 0) {
      dmxByte1 = mode.getChannelIndex(channel.fineChannelAliases[0], `defaultOnly`) + 1;
      resolution = Math.min(CoarseChannel.RESOLUTION_16BIT, channel.getResolutionInMode(mode, `defaultOnly`));
    }

    const defaultValue = channel.getDefaultValueWithResolution(resolution);
    const highlightValue = channel.getHighlightValueWithResolution(resolution);

    const xmlChannel = xmlFixture.element(getChannelType(channel), {
      'Name': channelName,
      'DefaultValue': defaultValue,
      'Highlight': highlightValue,
      'Deflection': 0,
      'DmxByte0': dmxByte0,
      'DmxByte1': dmxByte1,
      'Constant': channel.isConstant ? 1 : 0,
      'Crossfade': channel.canCrossfade ? 1 : 0,
      'Invert': channel.isInverted ? 1 : 0,
      'Precedence': channel.precedence,
      'ClassicPos': viewPosCount,
    });

    if (fineChannelKey === null) {
      addCapabilities(xmlChannel, channel, resolution);
    }

    viewPosCount++;
  }
}

/**
 * @param {Fixture} fixture The OFL fixture object.
 * @returns {string} The comment to use in the exported fixture.
 */
function getFixtureComment(fixture) {
  const generatedString = `generated by the Open Fixture Library – ${fixture.url}`;
  if (fixture.hasComment) {
    return `${fixture.comment} (${generatedString})`;
  }
  return generatedString;
}

/**
 * @param {CoarseChannel} channel The OFL channel object.
 * @returns {string} The e:cue channel type for the channel.
 */
function getChannelType(channel) {
  switch (channel.type) {
    case `Multi-Color`:
    case `Single Color`:
    case `Color Temperature`: {
      return `ChannelColor`;
    }
    case `Iris`:
    case `Zoom`:
    case `Shutter`:
    case `Strobe`:
    case `Gobo`:
    case `Prism`:
    case `Effect`:
    case `Speed`:
    case `Maintenance`:
    case `NoFunction`: {
      return `ChannelBeam`;
    }
    case `Pan`:
    case `Tilt`:
    case `Focus`: {
      return `ChannelFocus`;
    }
    case `Intensity`:
    case `Fog`:
    default: {
      return `ChannelIntensity`;
    }
  }
}

/**
 * @param {object} xmlChannel The xmlbuilder <Channel*> object.
 * @param {CoarseChannel} channel The OFL channel object.
 * @param {number} resolution The resolution of the channel in the current mode.
 */
function addCapabilities(xmlChannel, channel, resolution) {
  for (const capability of channel.capabilities) {
    const dmxRange = capability.getDmxRangeWithResolution(resolution);
    xmlChannel.element(`Range`, {
      'Name': capability.name,
      'Start': dmxRange.start,
      'End': dmxRange.end,
      'AutoMenu': capability.menuClick === `hidden` ? 0 : 1,
      'Centre': capability.menuClick === `center` ? 1 : 0,
    });
  }
}

/**
 * @param {Date} date The date to format.
 * @returns {string} The date in YYYY-MM-DD#HH:mm:ss format.
 */
function dateToString(date) {
  return date.toISOString().replace(/T/, `#`).replace(/\..+/, ``);
}
