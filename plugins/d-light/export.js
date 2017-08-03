const xmlbuilder = require('xmlbuilder');
const sanitize = require('sanitize-filename');

const Channel = require('../../lib/model/Channel.js');
const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');

module.exports.name = 'D::Light';
module.exports.version = '0.1.0';

module.exports.export = function exportDLight(fixtures, options) {
  let deviceFiles = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      let xml = xmlbuilder.begin()
        .declaration('1.0')
        .element({
          Device: {
            'OFL_Export': {
              '@id': module.exports.version,
              '#text': fixture.url
            },
            frames: {
              '@id': mode.channels.length
            },
            ManufacturerName: fixture.manufacturer.name,
            ModelName: `${fixture.name} (${mode.name})`,
            creationDate: fixture.meta.createDate.toISOString().split('T')[0]
          }
        })
        .element('Attributes');

      // channels are grouped by their channel type which is called AttributesDefinition in D::Light
      const channelsByAttribute = getChannelsByAttribute(mode.channels);
      for (const attribute of Object.keys(channelsByAttribute)) {
        addAttribute(xml, mode, attribute, channelsByAttribute[attribute]);
      }

      deviceFiles.push({
        name: `${fixture.manufacturer.key}/${fixture.key}-${sanitize(mode.shortName)}.xml`,
        content: xml.end({
          pretty: true,
          indent: '  '
        }),
        mimetype: 'application/xml'
      });
    }
  }

  return deviceFiles;
};

function addAttribute(xml, mode, attribute, channels) {
  const xmlAttribute = xml.element({
    AttributesDefinition: {
      '@id': attribute,
      '@length': channels.length
    }
  });

  for (let i = 0; i < channels.length; i++) {
    addChannel(xmlAttribute, mode, attribute, channels[i], i);
  }
}

function addChannel(xmlAttribute, mode, attribute, channel, index) {
  let xmlChannel = xmlAttribute.element({
    ThisAttribute: {
      '@id': index,
      HOME: {
        '@id': getDefaultValue(channel)
      },
      addressIndex: {
        '@id': mode.getChannelIndex(channel)
      },
      parameterName: {
        '@id': getParameterName(mode, attribute, channel)
      },
      minLevel: {
        '@id': 0
      },
      maxLevel: {
        '@id': 255
      }
    }
  });
  
  addCapabilities(xmlChannel, channel);
}

function getParameterName(mode, attribute, channel) {
  const uniqueName = channel.uniqueName;

  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;
  }
  if (channel instanceof FineChannel) {
    return mode.getChannelIndex(channel.coarseChannel.key) + 1;
  }

  switch (attribute) {
    case 'FOCUS':
      return channel.type.toUpperCase(); // PAN or TILT

    // in all other attributes, custom text is allowed
    // but we need to use another name syntax
    default:
      return uniqueName
        .toUpperCase()
        .replace(/ /g, '_')
        .replace(/\//g, '|')
        .replace(/COLOR/g, 'COLOUR');
  }
}

function addCapabilities(xmlChannel, channel) {
  if (channel instanceof Channel && channel.hasCapabilities) {
    const caps = channel.capabilities;

    let xmlCapabilities = xmlChannel.element({
      Definitions: {
        '@index': caps.length
      }
    });

    for (const cap of caps) {
      addCapability(xmlCapabilities, cap);
    }
  }
}

function addCapability(xmlCapabilities, cap) {
  xmlCapabilities.element({
    name: {
      '@min': cap.range.start,
      '@max': cap.range.end,
      '@snap': cap.menuClickDmxValue,
      '@timeHolder': '0',
      '@dummy': '0',
      '#text': cap.name
    }
  });
}

function getDefaultValue(channel) {
  if (channel instanceof SwitchingChannel) {
    return getDefaultValue(channel.defaultChannel);
  }
  if (channel instanceof FineChannel) {
    return channel.defaultValue;
  }
  return channel.getDefaultValueWithFineness(0);
}

function getChannelsByAttribute(channels) {
  let channelsByAttribute = {
    'INTENSITY': [],
    'COLOUR': [],
    'FOCUS': [],
    'BEAM': [],
    'BLADE': [],
    'EFFECT': [],
    'CONTROL': [],
    'EXTRA': [],
    'FINE': []
  };

  for (let channel of channels) {
    channelsByAttribute[getChannelAttribute(channel)].push(channel);
  }

  const emptyAttributes = Object.keys(channelsByAttribute).filter(
    attribute => channelsByAttribute[attribute].length === 0
  );
  for (const emptyAttribute of emptyAttributes) {
    delete channelsByAttribute[emptyAttribute];
  }
  
  return channelsByAttribute;
}

function getChannelAttribute(channel) {
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;
  }
  if (channel instanceof FineChannel) {
    if (channel.fineness === 1) {
      return 'FINE';
    }
    return 'EXTRA';
  }

  const oflToDLightMap = {
    INTENSITY: ['Intensity'],
    COLOUR: ['Single Color', 'Multi-Color'],
    FOCUS: ['Pan', 'Tilt'],
    BEAM: ['Iris', 'Focus', 'Zoom'],
    EFFECT: ['Strobe', 'Shutter', 'Speed', 'Gobo', 'Prism', 'Effect'],
    CONTROL: ['Maintenance'],
    EXTRA: ['Nothing']
  };

  for (const attribute of Object.keys(oflToDLightMap)) {
    if (oflToDLightMap[attribute].includes(channel.type)) {
      return attribute;
    }
  }
  return 'EXTRA'; // default if new types are added to OFL
}
