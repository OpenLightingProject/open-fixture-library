const xmlbuilder = require('xmlbuilder');
const sanitize = require('sanitize-filename');

const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');
const MatrixChannel = require('../../lib/model/MatrixChannel.js');
const Capability = require('../../lib/model/Capability.js');
const Physical = require('../../lib/model/Physical.js');

module.exports.name = 'QLC+';
module.exports.version = '0.5.0';

module.exports.export = function exportQLCplus(fixtures, options) {
  return fixtures.map(fixture => {
    const xml = xmlbuilder.begin()
      .declaration('1.0', 'UTF-8')
      .element({
        FixtureDefinition: {
          '@xmlns': 'http://www.qlcplus.org/FixtureDefinition',
          Creator: {
            Name: `OFL – ${fixture.url}`,
            Version: module.exports.version,
            Author: fixture.meta.authors.join(', ')
          },
          Manufacturer: fixture.manufacturer.name,
          Model: fixture.name,
          Type: getFixtureType(fixture)
        }
      });

    for (const channel of fixture.allChannels) {
      addChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      addMode(xml, mode);
    }

    xml.doctype('');
    return {
      name: sanitize(`${fixture.manufacturer.name}-${fixture.name}.qxf`).replace(/\s+/g, '-'),
      content: xml.end({
        pretty: true,
        indent: ' '
      }),
      mimetype: 'application/x-qlc-fixture'
    };
  });
};

function addChannel(xml, channel) {
  if (channel instanceof MatrixChannel) {
    channel = channel.wrappedChannel;
  }

  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  // use default channel's data
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;

    if (channel instanceof MatrixChannel) {
      channel = channel.wrappedChannel;
    }
  }

  const xmlGroup = xmlChannel.element({
    Group: {}
  });

  let capabilities;
  if (channel instanceof FineChannel) {
    let capabilityName;
    if (channel.fineness > 1) {
      xmlGroup.attribute('Byte', 0);  // not a QLC+ fine channel
      capabilityName = `Fine^${channel.fineness} adjustment for ${channel.coarseChannel.uniqueName}`;
    }
    else {
      xmlGroup.attribute('Byte', 1);
      capabilityName = `Fine adjustment for ${channel.coarseChannel.uniqueName}`;
    }

    channel = channel.coarseChannel;  // use coarse channel's data from here on
    capabilities = [
      new Capability({
        range: [0, 255],
        name: capabilityName
      }, 0, channel)
    ];
  }
  else {
    xmlGroup.attribute('Byte', 0);
    capabilities = channel.capabilities;
  }

  const chType = getChannelType(channel);
  xmlGroup.text(chType);

  if (chType === 'Intensity') {
    xmlChannel.element({
      Colour: channel.color !== null ? channel.color : 'Generic'
    });
  }

  for (const cap of capabilities) {
    addCapability(xmlChannel, cap);
  }
}

function addCapability(xmlChannel, cap) {
  const range = cap.getRangeWithFineness(0);

  const xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': range.start,
      '@Max': range.end,
      '#text': cap.name
    }
  });

  if (cap.image !== null) {
    xmlCapability.attribute('Res', cap.image);
  }
  else if (cap.color !== null) {
    xmlCapability.attribute('Color', cap.color.hex().toLowerCase());

    if (cap.color2 !== null) {
      xmlCapability.attribute('Color2', cap.color2.hex().toLowerCase());
    }
  }
}

function addMode(xml, mode) {
  const xmlMode = xml.element({
    Mode: {
      '@Name': mode.name
    }
  });

  addPhysical(xmlMode, mode.physical || new Physical({}));

  mode.channelKeys.forEach((chKey, index) => {
    const channel = mode.fixture.getChannelByKey(chKey);
    xmlMode.element({
      Channel: {
        '@Number': index,
        '#text': channel.uniqueName || channel.wrappedChannel.uniqueName
      }
    });
  });

  if (mode.fixture.matrix !== null) {
    addHeads(xmlMode, mode);
  }
}

function addPhysical(xmlMode, physical) {
  const xmlPhysical = xmlMode.element({
    Physical: {
      Bulb: {
        '@Type': physical.bulbType || 'Other',
        '@Lumens': physical.bulbLumens || 0,
        '@ColourTemperature': physical.bulbColorTemperature || 0
      },
      Dimensions: {
        '@Weight': physical.weight || 0,
        '@Width': Math.round(physical.width) || 0,
        '@Height': Math.round(physical.height) || 0,
        '@Depth': Math.round(physical.depth) || 0
      },
      Lens: {
        '@Name': physical.lensName || 'Other',
        '@DegreesMin': physical.lensDegreesMin || 0,
        '@DegreesMax': physical.lensDegreesMax || 0
      },
      Focus: {
        '@Type': physical.focusType || 'Fixed',
        '@PanMax': physical.focusPanMax || 0,
        '@TiltMax': physical.focusTiltMax || 0
      }
    }
  });

  if (physical.DMXconnector !== null || physical.power !== null) {
    xmlPhysical.element({
      Technical: {
        '@DmxConnector': physical.DMXconnector || 'Other',
        '@PowerConsumption': Math.round(physical.power) || 0
      }
    });
  }
}

function addHeads(xmlMode, mode) {
  const pixelKeys = Object.keys(mode.fixture.matrix.pixelKeyPositions).concat(mode.fixture.matrix.pixelGroupKeys);
  for (const pixelKey of pixelKeys) {
    const channels = mode.channels.filter(channel => {
      if (channel instanceof MatrixChannel) {
        return channel.pixelKey === pixelKey;
      }

      if (channel instanceof SwitchingChannel && channel.defaultChannel instanceof MatrixChannel) {
        return channel.defaultChannel.pixelKey === pixelKey;
      }
      return false;
    });

    if (channels.length > 0) {
      let xmlHead = xmlMode.element({
        Head: {}
      });

      for (const ch of channels) {
        xmlHead.element({
          Channel: mode.getChannelIndex(ch.key)
        });
      }
    }
  }
}

/**
 * Determines the QLC+ fixture type out of the fixture's categories.
 * @param {!Fixture} fixture The Fixture instance whose QLC+ type has to be determined.
 * @return {!string} The first of the fixture's categories that is supported by QLC+, defaults to 'Other'.
 */
function getFixtureType(fixture) {
  const ignoredCats = ['Blinder', 'Matrix'];

  for (const category of fixture.categories) {
    if (ignoredCats.includes(category)) {
      continue;
    }
    return category;
  }

  return 'Other';
}

// converts a Channel's type into a valid QLC+ channel type
function getChannelType(channel) {
  switch (channel.type) {
    case 'Single Color':
    case 'Color Temperature':
    case 'Fog':
      return 'Intensity';

    case 'Multi-Color':
      return 'Colour';

    case 'Strobe':
      return 'Shutter';

    case 'Zoom':
    case 'Focus':
    case 'Iris':
      return 'Beam';

    default:
      return channel.type;
  }
}
