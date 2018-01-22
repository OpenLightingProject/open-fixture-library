const xmlbuilder = require(`xmlbuilder`);

const FineChannel = require(`../../lib/model/FineChannel.js`);
const NullChannel = require(`../../lib/model/NullChannel.js`);
const SwitchingChannel = require(`../../lib/model/SwitchingChannel.js`);
const MatrixChannel = require(`../../lib/model/MatrixChannel.js`);
const Physical = require(`../../lib/model/Physical.js`);

module.exports.name = `e:cue`;
module.exports.version = `0.3.0`;

module.exports.export = function exportEcue(fixtures, options) {
  if (!(`date` in options)) {
    options.date = new Date();
  }
  const timestamp = dateToString(options.date);

  const manufacturers = {};
  for (const fix of fixtures) {
    const man = fix.manufacturer.key;
    if (!(man in manufacturers)) {
      manufacturers[man] = {
        data: fix.manufacturer,
        fixtures: []
      };
    }
    manufacturers[man].fixtures.push(fix);
  }

  const xml = xmlbuilder.create(
    {
      Document: {
        '@Owner': `user`,
        '@TypeVersion': 2,
        '@SaveTimeStamp': timestamp
      }
    },
    {
      version: `1.0`,
      encoding: `UTF-8`,
      standalone: true
    }
  );

  const xmlLibrary = xml.element({
    Library: {}
  });
  const xmlFixtures = xmlLibrary.element({
    Fixtures: {}
  });
  const xmlTiles = xmlLibrary.element({
    Tiles: {}
  });

  for (const man of Object.keys(manufacturers)) {
    const manAttributes = {
      '_CreationDate': timestamp,
      '_ModifiedDate': timestamp,
      'Name': manufacturers[man].data.name,
      'Comment': manufacturers[man].data.comment,
      'Web': manufacturers[man].data.website || ``
    };
    xmlTiles.element(`Manufacturer`, manAttributes);

    const xmlManFixtures = xmlFixtures.element(`Manufacturer`, manAttributes);
    for (const fixture of manufacturers[man].fixtures) {
      addFixture(xmlManFixtures, fixture);
    }
  }

  return [{
    name: `UserLibrary.xml`,
    content: xml.end({
      pretty: true,
      indent: `    `
    }),
    mimetype: `application/xml`,
    fixtures: fixtures
  }];
};

function addFixture(xmlMan, fixture) {
  const fixCreationDate = dateToString(fixture.meta.createDate);
  const fixModifiedDate = dateToString(fixture.meta.lastModifyDate);

  for (const mode of fixture.modes) {
    const physical = mode.physical || new Physical({});

    const xmlFixture = xmlMan.element(`Fixture`, {
      '_CreationDate': fixCreationDate,
      '_ModifiedDate': fixModifiedDate,
      'Name': fixture.name + (fixture.modes.length > 1 ? ` (${mode.shortName} mode)` : ``),
      'NameShort': fixture.shortName + (fixture.modes.length > 1 ? `-${mode.shortName}` : ``),
      'Comment': getFixtureComment(fixture),
      'AllocateDmxChannels': mode.channels.length,
      'Weight': physical.weight || 0,
      'Power': physical.power || 0,
      'DimWidth': physical.width || 10,
      'DimHeight': physical.height || 10,
      'DimDepth': physical.depth || 10
    });

    handleMode(xmlFixture, mode);
  }
}

function handleMode(xmlFixture, mode) {
  let viewPosCount = 1;
  for (let dmxCount = 0; dmxCount < mode.channels.length; dmxCount++) {
    let channel = mode.channels[dmxCount];
    if (channel instanceof MatrixChannel) {
      channel = channel.wrappedChannel;
    }

    // skip unused channels
    if (mode.channels[dmxCount] instanceof NullChannel) {
      continue;
    }

    // ecue doesn't support switching channels, so we just use the default channel but change the name
    let switchingChannelName = null;
    if (channel instanceof SwitchingChannel) {
      switchingChannelName = channel.name;
      channel = channel.defaultChannel;

      if (channel instanceof MatrixChannel) {
        channel = channel.wrappedChannel;
      }
    }

    let fineChannelKey = null;
    if (channel instanceof FineChannel) {
      if (channel.fineness === 1) {
        // ignore this channel, we handle it together with its coarse channel
        continue;
      }

      // just pretend its a single channel and use coarse channel's data
      fineChannelKey = channel.key;
      channel = channel.coarseChannel;
    }

    let dmxByte0 = dmxCount + 1;
    let dmxByte1 = 0;

    if (fineChannelKey !== null) {
      dmxByte0 = mode.getChannelIndex(fineChannelKey) + 1;
    }
    else if (channel.fineChannelAliases.length > 0) {
      dmxByte1 = mode.getChannelIndex(channel.fineChannelAliases[0], `defaultOnly`) + 1;
    }

    const fineness = channel.getFinenessInMode(mode, `defaultOnly`);

    const defaultValue = channel.getDefaultValueWithFineness(fineness === 1 ? 1 : 0);
    const highlightValue = channel.getHighlightValueWithFineness(fineness === 1 ? 1 : 0);

    const xmlChannel = xmlFixture.element(getChannelType(channel), {
      'Name': switchingChannelName || channel.name,
      'DefaultValue': defaultValue,
      'Highlight': highlightValue,
      'Deflection': 0,
      'DmxByte0': dmxByte0,
      'DmxByte1': dmxByte1,
      'Constant': channel.constant ? 1 : 0,
      'Crossfade': channel.crossfade ? 1 : 0,
      'Invert': channel.invert ? 1 : 0,
      'Precedence': channel.precedence,
      'ClassicPos': viewPosCount
    });

    addCapabilities(xmlChannel, channel, fineness);

    viewPosCount++;
  }
}

function getFixtureComment(fixture) {
  const generatedString = `generated by the Open Fixture Library – ${fixture.url}`;
  if (fixture.hasComment) {
    return `${fixture.comment} (${generatedString})`;
  }
  return generatedString;
}

function getChannelType(channel) {
  switch (channel.type) {
    case `Multi-Color`:
    case `Single Color`:
    case `Color Temperature`:
      return `ChannelColor`;

    case `Iris`:
    case `Zoom`:
    case `Shutter`:
    case `Strobe`:
    case `Gobo`:
    case `Prism`:
    case `Effect`:
    case `Speed`:
    case `Maintenance`:
    case `Nothing`:
      return `ChannelBeam`;

    case `Pan`:
    case `Tilt`:
    case `Focus`:
      return `ChannelFocus`;

    case `Intensity`:
    case `Fog`:
    default:
      return `ChannelIntensity`;
  }
}

function addCapabilities(xmlChannel, channel, fineness) {
  if (channel.hasCapabilities && fineness < 2) {
    for (const cap of channel.capabilities) {
      const range = cap.getRangeWithFineness(fineness);
      xmlChannel.element(`Range`, {
        'Name': cap.name,
        'Start': range.start,
        'End': range.end,
        'AutoMenu': cap.menuClick === `hidden` ? 0 : 1,
        'Centre': cap.menuClick === `center` ? 1 : 0
      });
    }
  }
}

function dateToString(date) {
  return date.toISOString().replace(/T/, `#`).replace(/\..+/, ``);
}