const path = require('path');
const xml2js = require('xml2js');
const xmlbuilder = require('xmlbuilder');

const FineChannel = require(path.join(__dirname, '..', 'lib', 'model', 'FineChannel.js'));
const SwitchingChannel = require(path.join(__dirname, '..', 'lib', 'model', 'SwitchingChannel.js'));
const Capability = require(path.join(__dirname, '..', 'lib', 'model', 'Capability.js'));

module.exports.name = 'QLC+';
module.exports.version = '0.3.0';

module.exports.export = function exportQLCplus(fixtures, options) {
  return fixtures.map(fixture => {
    let xml = xmlbuilder.begin()
    .declaration('1.0', 'UTF-8')
    .element({
      FixtureDefinition: {
        '@xmlns': 'http://www.qlcplus.org/FixtureDefinition',
        Creator: {
          Name: `Open Fixture Library ${module.exports.name} plugin`,
          Version: module.exports.version,
          Author: fixture.meta.authors.join(', ')
        },
        Manufacturer: fixture.manufacturer.name,
        Model: fixture.name,
        Type: fixture.mainCategory
      }
    });

    for (const channel of fixture.allChannels) {
      exportAddChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      exportAddMode(xml, mode);
    }

    xml.doctype('');
    return {
      name: fixture.manufacturer.key + '/' + fixture.key + '.qxf',
      content: xml.end({
        pretty: true,
        indent: ' '
      }),
      mimetype: 'application/x-qlc-fixture'
    };
  });
};


function exportAddChannel(xml, channel) {
  let xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  // use default channel's data
  channel = channel instanceof SwitchingChannel ? channel.fixture.getChannelByKey(channel.defaultChannelKey) : channel;

  const isFine = channel instanceof FineChannel;

  let xmlGroup = xmlChannel.element({
    Group: {
      '@Byte': isFine ? channel.fineness : 0
    }
  });

  // use coarse channel's data
  channel = isFine ? channel.coarseChannel : channel;

  const chType = getChannelType(channel);
  xmlGroup.text(chType);

  if (chType === 'Intensity') {
    xmlChannel.element({
      Colour: channel.color !== null ? channel.color : 'Generic'
    });
  }

  if (isFine) {
    exportAddCapability(xmlChannel, new Capability({
      range: [0, channel.maxDmxBound],
      name: `Fine adjustment ${channel.uniqueName}`
    }, channel));
  }
  else {
    for (const cap of channel.capabilities) {
      exportAddCapability(xmlChannel, cap);
    }
  }
}

function exportAddCapability(xmlChannel, cap) {
  let xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': cap.rangesByFineness[0].start,
      '@Max': cap.rangesByFineness[0].end,
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

function exportAddMode(xml, mode) {
  let xmlMode = xml.element({
    Mode: {
      '@Name': mode.name
    }
  });

  let xmlPhysical = xmlMode.element({
    Physical: {
      Bulb: {
        '@ColourTemperature': mode.physical.bulbColorTemperature || 0,
        '@Type': mode.physical.bulbType || 'Other',
        '@Lumens': mode.physical.bulbLumens || 0
      },
      Dimensions: {
        '@Width': Math.round(mode.physical.width) || 0,
        '@Height': Math.round(mode.physical.height) || 0,
        '@Depth': Math.round(mode.physical.depth) || 0,
        '@Weight': mode.physical.weight || 0
      },
      Lens: {
        '@Name': mode.physical.lensName || 'Other',
        '@DegreesMin': mode.physical.lensDegreesMin || 0,
        '@DegreesMax': mode.physical.lensDegreesMax || 0
      },
      Focus: {
        '@Type': mode.physical.focusType || 'Fixed',
        '@TiltMax': mode.physical.focusTiltMax || 0,
        '@PanMax': mode.physical.focusPanMax || 0
      }
    },
  });

  if (mode.physical.DMXconnector !== null || mode.physical.power !== null) {
    xmlPhysical.element({
      Technical: {
        '@DmxConnector': mode.physical.DMXconnector || 'Other',
        '@PowerConsumption': mode.physical.power || 0
      }
    });
  }

  mode.channelKeys.forEach((chKey, index) => {
    const channel = mode.fixture.getChannelByKey(chKey);
    xmlMode.element({
      Channel: {
        '@Number': index,
        '#text': channel.uniqueName
      }
    });
  });
}


// converts a Channel's type into a valid QLC+ channel type
function getChannelType(channel) {
  switch(channel.type) {
    case 'SingleColor': return 'Intensity';
    case 'MultiColor':  return 'Colour';
    case 'Strobe':      return 'Shutter';
    default:            return channel.type;
  }
}


module.exports.import = function importQLCplus(str, filename, resolve, reject) {
  const parser = new xml2js.Parser();
  const timestamp = new Date().toISOString().replace(/T.*/, '');

  parser.parseString(str, (parseError, xml) => {
    if (parseError) {
      reject(`Error parsing '${filename}' as XML.\n` + parseError.toString());
      return;
    }

    let out = {
      manufacturers: {},
      fixtures: {},
      warnings: {}
    };
    let fix = {};

    try {
      const fixture = xml.FixtureDefinition;
      fix.name = fixture.Model[0];

      const manKey = fixture.Manufacturer[0].toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
      const fixKey = manKey + '/' + fix.name.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
      out.warnings[fixKey] = ['Please check if manufacturer is correct.'];

      fix.categories = [fixture.Type[0]];

      fix.meta = {
        authors: fixture.Creator[0].Author[0].split(/,\s*/),
        createDate: timestamp,
        lastModifyDate: timestamp,
        importPlugin: {
          plugin: 'qlcplus',
          date: timestamp,
          comment: `created by ${fixture.Creator[0].Name[0]} (version ${fixture.Creator[0].Version[0]})`
        }
      };

      fix.physical = {};
      fix.availableChannels = {};

      let doubleByteChannels = [];

      for (const channel of fixture.Channel || []) {
        let ch = {
          type: channel.Group[0]._,
          fineChannelAliases: []
        };

        if (channel.Group[0].$.Byte === '1') {
          doubleByteChannels.push(channel.$.Name);
        }

        if (ch.type === 'Colour') {
          ch.type = 'MultiColor';
        }
        else if ('Colour' in channel && channel.Colour[0] !== 'Generic') {
          ch.type = 'SingleColor';
          ch.color = channel.Colour[0];
        }
        else if (channel.$.Name.toLowerCase().includes('strob')) {
          ch.type = 'Strobe';
        }
        else if (ch.type === 'Intensity') {
          ch.crossfade = true;
        }

        ch.capabilities = [];
        for (const capability of channel.Capability || []) {
          let cap = {
            range: [parseInt(capability.$.Min), parseInt(capability.$.Max)],
            name: capability._
          };

          if ('Color' in capability.$) {
            cap.color = capability.$.Color;
          }

          if ('Color2' in capability.$) {
            cap.color2 = capability.$.Color2;
          }

          if ('res' in capability.$) {
            cap.image = capability.$.res;
          }

          ch.capabilities.push(cap);
        }
        if (ch.capabilities.length === 0) {
          delete ch.capabilities;
        }

        fix.availableChannels[channel.$.Name] = ch;
      }

      for (const chKey of doubleByteChannels) {
        try {
          const fineChannelRegex = /\sfine$|16[\-\s]*bit$/i;
          if (!fineChannelRegex.test(chKey)) {
            throw new Error('The corresponding coarse channel could not be detected.');
          }

          const coarseChannelKey = chKey.replace(fineChannelRegex, '');
          if (!(coarseChannelKey in fix.availableChannels)) {
            throw new Error('The corresponding coarse channel could not be detected.');
          }

          fix.availableChannels[coarseChannelKey].fineChannelAliases.push(chKey);

          if ('capabilities' in fix.availableChannels[chKey]) {
            throw new Error(`Merge its capabilities into channel '${coarseChannelKey}'.`);
          }

          delete fix.availableChannels[chKey];
        }
        catch (error) {
          out.warnings[fixKey].push(`Please check 16bit channel '${chKey}': ${error.message}`);
        }
      }

      for (const chKey in fix.availableChannels) {
        if (fix.availableChannels[chKey].fineChannelAliases.length === 0) {
          delete fix.availableChannels[chKey].fineChannelAliases;
        }
      }

      fix.heads = {};
      fix.modes = [];

      for (const mode of fixture.Mode || []) {
        let mod = {
          name: mode.$.Name
        };

        let physical = {};

        if ('Dimensions' in mode.Physical[0]) {
          const dimWidth = parseInt(mode.Physical[0].Dimensions[0].$.Width);
          const dimHeight = parseInt(mode.Physical[0].Dimensions[0].$.Height);
          const dimDepth = parseInt(mode.Physical[0].Dimensions[0].$.Depth);
          if (dimWidth + dimHeight + dimDepth !== 0
            && (!('dimensions' in fix.physical)
              || fix.physical.dimensions[0] !== dimWidth
              || fix.physical.dimensions[1] !== dimHeight
              || fix.physical.dimensions[2] !== dimDepth
            )) {
            physical.dimensions = [dimWidth, dimHeight, dimDepth];
          }

          const weight = parseFloat(mode.Physical[0].Dimensions[0].$.Weight);
          if (weight !== 0.0 && fix.physical.weight !== weight) {
            physical.weight = weight;
          }
        }

        if ('Technical' in mode.Physical[0]) {
          const power = parseInt(mode.Physical[0].Technical[0].$.PowerConsumption);
          if (power !== 0 && fix.physical.power !== power) {
            physical.power = power;
          }

          const DMXconnector = mode.Physical[0].Technical[0].$.DmxConnector;
          if (DMXconnector !== '' && fix.physical.DMXconnector !== DMXconnector) {
            physical.DMXconnector = DMXconnector;
          }
        }

        if ('Bulb' in mode.Physical[0]) {
          let bulbData = {};

          const bulbType = mode.Physical[0].Bulb[0].$.Type;
          if (bulbType !== '' && (!('bulb' in fix.physical) || fix.physical.bulb.type !== bulbType)) {
            bulbData.type = bulbType;
          }

          const bulbColorTemp = parseInt(mode.Physical[0].Bulb[0].$.ColourTemperature);
          if (bulbColorTemp !== 0 && (!('bulb' in fix.physical) || fix.physical.bulb.colorTemperature !== bulbColorTemp)) {
            bulbData.colorTemperature = bulbColorTemp;
          }

          const bulbLumens = parseInt(mode.Physical[0].Bulb[0].$.Lumens);
          if (bulbLumens !== 0 && (!('bulb' in fix.physical) || fix.physical.bulb.lumens !== bulbLumens)) {
            bulbData.lumens = bulbLumens;
          }

          if (JSON.stringify(bulbData) !== '{}') {
            physical.bulb = bulbData;
          }
        }

        if ('Lens' in mode.Physical[0]) {
          let lensData = {};

          const lensName = mode.Physical[0].Lens[0].$.Name;
          if (lensName !== '' && (!('lens' in fix.physical) || fix.physical.lens.name !== lensName)) {
            lensData.name = lensName;
          }

          const lensDegMin = parseFloat(mode.Physical[0].Lens[0].$.DegreesMin);
          const lensDegMax = parseFloat(mode.Physical[0].Lens[0].$.DegreesMax);
          if ((lensDegMin !== 0.0 || lensDegMax !== 0.0)
            && (!('lens' in fix.physical)
              || !('degreesMinMax' in fix.physical.lens)
              || fix.physical.lens.degreesMinMax[0] !== lensDegMin
              || fix.physical.lens.degreesMinMax[1] !== lensDegMax
            )) {
            lensData.degreesMinMax = [lensDegMin, lensDegMax];
          }

          if (JSON.stringify(lensData) !== '{}') {
            physical.lens = lensData;
          }
        }

        if ('Focus' in mode.Physical[0]) {
          let focusData = {};

          const focusType = mode.Physical[0].Focus[0].$.Type;
          if (focusType !== '' && (!('focus' in fix.physical) || fix.physical.focus.type !== focusType)) {
            focusData.type = focusType;
          }

          const focusPanMax = parseInt(mode.Physical[0].Focus[0].$.PanMax);
          if (focusPanMax !== 0 && (!('focus' in fix.physical) || fix.physical.focus.panMax !== focusPanMax)) {
            focusData.panMax = focusPanMax;
          }

          const focusTiltMax = parseInt(mode.Physical[0].Focus[0].$.TiltMax);
          if (focusTiltMax !== 0 && (!('focus' in fix.physical) || fix.physical.focus.tiltMax !== focusTiltMax)) {
            focusData.tiltMax = focusTiltMax;
          }

          if (JSON.stringify(focusData) !== '{}') {
            physical.focus = focusData;
          }
        }

        if (JSON.stringify(physical) !== '{}') {
          if (fix.modes.length === 0) {
            // this is the first mode -> fixture defaults
            fix.physical = physical;
          }
          else {
            mod.physical = physical;
          }
        }

        mod.channels = [];
        for (const ch of mode.Channel || []) {
          mod.channels[parseInt(ch.$.Number)] = ch._;
        }

        if ('Head' in mode) {
          mode.Head.forEach((head, index) => {
            if (head.Channel === undefined) {
              return;
            }

            const channelList = head.Channel.map(ch => mod.channels[parseInt(ch)]);
            fix.heads[mod.name + ' Head ' + (index + 1)] = channelList;
          });
          out.warnings[fixKey].push('Please rename the heads in a meaningful way.');
        }

        fix.modes.push(mod);
      }

      if (JSON.stringify(fix.heads) === '{}') {
        delete fix.heads;
      }

      out.fixtures[fixKey] = fix;
    }
    catch (parseError) {
      reject(`Error parsing '${filename}'.\n` + parseError.toString());
      return;
    }

    resolve(out);
  });
};