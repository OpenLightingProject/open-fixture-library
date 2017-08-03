const xmlbuilder = require('xmlbuilder');
const sanitize = require('sanitize-filename');

const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');
const Capability = require('../../lib/model/Capability.js');
const Physical = require('../../lib/model/Physical.js');

module.exports.name = 'QLC+';
module.exports.version = '0.4.0';

module.exports.export = function exportQLCplus(fixtures, options) {
  return fixtures.map(fixture => {
    let xml = xmlbuilder.begin()
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
      name: sanitize(fixture.manufacturer.name + '-' + fixture.name + '.qxf').replace(/\s+/g, '-'),
      content: xml.end({
        pretty: true,
        indent: ' '
      }),
      mimetype: 'application/x-qlc-fixture'
    };
  });
};

function addChannel(xml, channel) {
  let xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  // use default channel's data
  if (channel instanceof SwitchingChannel) {
    channel = channel.fixture.getChannelByKey(channel.defaultChannelKey);
  }

  let xmlGroup = xmlChannel.element({
    Group: {}
  });

  let capabilities;
  if (channel instanceof FineChannel) {
    xmlGroup.attribute('Byte', channel.fineness);
    channel = channel.coarseChannel; // use coarse channel's data
    capabilities = [
      new Capability({
        range: [0, channel.maxDmxBound],
        name: `Fine adjustment for ${channel.uniqueName}`
      }, channel)
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

  let xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': range.start,
      '@Max': range.end,
      '#text': cap.name
    }
  });

  if (cap.image !== null) {
    xmlCapability.attribute('res', cap.image);
  }
  else if (cap.color !== null) {
    xmlCapability.attribute('Color', cap.color.hex().toLowerCase());

    if (cap.color2 !== null) {
      xmlCapability.attribute('Color2', cap.color2.hex().toLowerCase());
    }
  }
}

function addMode(xml, mode) {
  let xmlMode = xml.element({
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
        '#text': channel.uniqueName
      }
    });
  });

  for (const headName of Object.keys(mode.fixture.heads)) {
    addHead(xmlMode, mode, mode.fixture.heads[headName]);
  }
}

function addPhysical(xmlMode, physical) {
  let xmlPhysical = xmlMode.element({
    Physical: {
      Bulb: {
        '@ColourTemperature': physical.bulbColorTemperature || 0,
        '@Type': physical.bulbType || 'Other',
        '@Lumens': physical.bulbLumens || 0
      },
      Dimensions: {
        '@Width': Math.round(physical.width) || 0,
        '@Height': Math.round(physical.height) || 0,
        '@Depth': Math.round(physical.depth) || 0,
        '@Weight': physical.weight || 0
      },
      Lens: {
        '@Name': physical.lensName || 'Other',
        '@DegreesMin': physical.lensDegreesMin || 0,
        '@DegreesMax': physical.lensDegreesMax || 0
      },
      Focus: {
        '@Type': physical.focusType || 'Fixed',
        '@TiltMax': physical.focusTiltMax || 0,
        '@PanMax': physical.focusPanMax || 0
      }
    }
  });

  if (physical.DMXconnector !== null || physical.power !== null) {
    xmlPhysical.element({
      Technical: {
        '@DmxConnector': physical.DMXconnector || 'Other',
        '@PowerConsumption': physical.power || 0
      }
    });
  }
}

function addHead(xmlMode, mode, headChannels) {
  const channelIndices = headChannels.map(chKey => mode.getChannelIndex(chKey))
    .filter(index => index !== -1);

  if (channelIndices.length > 0) {
    let xmlHead = xmlMode.element({
      Head: {}
    });

    for (const index of channelIndices) {
      xmlHead.element({
        Channel: index
      });
    }
  }
}

function getFixtureType(fixture) {
  if (fixture.mainCategory === 'Blinder') {
    return fixture.categories[1] || 'Other';
  }
  return fixture.mainCategory;
}

// converts a Channel's type into a valid QLC+ channel type
function getChannelType(channel) {
  switch(channel.type) {
    case 'Single Color':
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
