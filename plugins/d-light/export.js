const xmlbuilder = require('xmlbuilder');
const sanitize = require('sanitize-filename');

const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');

module.exports.name = 'D::Light';
module.exports.version = '0.1.0';

module.exports.export = (fixtures, options) => {
  let deviceFiles = [];

  for (const fixture of fixtures) {
    // add device for each mode
    deviceFiles = deviceFiles.concat(fixture.modes.map(mode => {
      let xml = xmlbuilder.begin()
        .declaration('1.0')
        .element({
          Device: {
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
        const channels = channelsByAttribute[attribute];

        xml.element({
          AttributesDefinition: {
            '@id': attribute,
            '@length': channels.length
          }
        });
      }

      return {
        name: `${fixture.manufacturer.key}/${fixture.key}-${sanitize(mode.shortName)}.xml`,
        content: xml.end({
          pretty: true,
          indent: ' '
        }),
        mimetype: 'application/xml'
      }
    }));
  }

  return deviceFiles;
};

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
  if (channel instanceof FineChannel) {
    return 'FINE';
  }
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;
  }

  switch (channel.type) {
    case 'Intensity':
      return 'INTENSITY';

    case 'SingleColor':
    case 'MultiColor':
      return 'COLOUR';

    case 'Pan':
    case 'Tilt':
      return 'FOCUS';

    case 'Beam':
      return 'BEAM';

    case 'Strobe':
    case 'Shutter':
    case 'Speed':
    case 'Gobo':
    case 'Prism':
    case 'Effect':
      return 'EFFECT';

    case 'Maintenance':
      return 'CONTROL';

    case 'Nothing':
    default:
      return 'EXTRA';
  }
}