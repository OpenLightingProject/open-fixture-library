const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

module.exports.name = 'QLC+';
module.exports.version = '0.3.0';

module.exports.export = function exportQLCplus(library, options) {
  let outfiles = [];

  const defaults = require(path.join(options.baseDir, 'fixtures', 'defaults'));

  for (const data of library) {
    let fixture = Object.assign({}, defaults, JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', data.manufacturerKey, data.fixtureKey + '.json'), 'utf-8')));

    const manufacturer = options.manufacturers[data.manufacturerKey];

    // make null references in channel list link to a "No function" channel
    for (const mode of fixture.modes) {
      for (let i = 0; i < mode.channels.length; i++) {
        if (mode.channels[i] === null) {
          const noFunctionChKey = `No Function ${mode.name} ${i}`;
          mode.channels[i] = noFunctionChKey;

          if (!(noFunctionChKey in fixture.availableChannels)) {
            fixture.availableChannels[noFunctionChKey] = {
              name: 'No Function',
              type: 'Nothing'
            };
          }
        }
      }
    }

    // all channel names must be unique
    let usedChannels = {}; // keep track of how often a name was already used
    for (const chKey in fixture.availableChannels) {
      if (!('name' in fixture.availableChannels[chKey])) {
        fixture.availableChannels[chKey].name = chKey;
      }

      const name = fixture.availableChannels[chKey].name;

      if (name in usedChannels) {
        fixture.availableChannels[chKey].name += ' ' + usedChannels[name];
      }
      else {
        usedChannels[name] = 1;
      }

      usedChannels[name]++;
    }

    let fineChannels = {}; // fine -> coarse, fine^2 -> coarse
    let switchingChannels = {}; // switching channel alias -> trigger channel

    for (const ch of Object.keys(fixture.availableChannels)) {
      const channel = fixture.availableChannels[ch];

      if ('fineChannelAliases' in channel) {
        for (const alias of channel.fineChannelAliases) {
          fineChannels[alias] = ch;
        }
      }

      if ('capabilities' in channel &&
          'switchChannels' in channel.capabilities[0]) {
        for (const alias of Object.keys(channel.capabilities[0].switchChannels)) {
          switchingChannels[alias] = ch;
        }
      }
    }

    let physical = Object.assign({}, defaults.physical, fixture.physical);
    physical.bulb = Object.assign({}, defaults.physical.bulb, fixture.physical.bulb);
    physical.lens = Object.assign({}, defaults.physical.lens, fixture.physical.lens);
    physical.focus = Object.assign({}, defaults.physical.focus, fixture.physical.focus);

    let xml = {
      FixtureDefinition: {
        $: {
          xmlns: 'http://www.qlcplus.org/FixtureDefinition'
        },
        Creator: {
          Name: `Open Fixture Library ${module.exports.name} plugin`,
          Version: module.exports.version,
          Author: fixture.meta.authors.join(', ')
        },
        Manufacturer: manufacturer.name,
        Model: fixture.name,
        Type: fixture.categories[0],
        Channel: exportHandleChannels(fixture, defaults, switchingChannels),
        Mode: exportHandleModes(fixture, defaults, physical, fineChannels, switchingChannels)
      }
    };

    const xmlBuilder = new xml2js.Builder({
      xmldec: {
        version: '1.0',
        encoding: 'UTF-8'
      },
      doctype: {
        pubID: ''
      },
      renderOpts: {
        pretty: true,
        indent: ' ',
        newline: '\n'
      }
    });

    outfiles.push({
      name: data.manufacturerKey + '/' + data.fixtureKey + '.qxf',
      content: xmlBuilder.buildObject(xml),
      mimetype: 'application/x-qlc-fixture'
    });
  }

  return outfiles;
};

function exportHandleChannels(fixture, defaults, switchingChannels) {
  let xmlChannels = [];
  let channel;

  for (const chKey of Object.keys(fixture.availableChannels)) {
    channel = fixture.availableChannels[chKey];
    exportHandleSingleChannel(xmlChannels, channel, channel.name, defaults);
  }
  for (const chKey of Object.keys(switchingChannels)) {
    const triggerChannel = fixture.availableChannels[switchingChannels[chKey]];
    const defaultValue = triggerChannel.defaultValue;

    for (const cap of triggerChannel.capabilities) {
      if (cap.range[0] <= defaultValue && defaultValue <= cap.range[1]) {
        channel = fixture.availableChannels[cap.switchChannels[chKey]];
        break;
      }
    }
    exportHandleSingleChannel(xmlChannels, channel, chKey, defaults);
  }

  return xmlChannels;
}

function exportHandleSingleChannel(xmlChannels, channel, chName, defaults) {
  const defaultChannel = defaults.availableChannels['channel key'];
  const chData = Object.assign({}, defaultChannel, channel);

  if (chData.type === 'SingleColor') {
    chData.type = 'Intensity';
  }
  else if (chData.type === 'MultiColor') {
    chData.type = 'Colour';
  }
  else if (chData.type === 'Strobe') {
    chData.type = 'Shutter';
  }

  let xmlChannel = {
    $: {
      Name: chName
    },
    Group: {
      $: {
        Byte: 0
      },
      _: chData.type
    }
  };

  if (chData.type === 'Intensity') {
    xmlChannel.Colour = 'color' in chData ? chData.color : 'Generic';
  }

  xmlChannels.push(xmlChannel);

  const divisor = 'fineChannelAliases' in chData ? Math.pow(256, chData.fineChannelAliases.length) : 1;

  xmlChannel.Capability = [];
  const defaultCapability = defaultChannel.capabilities[0];

  if ('capabilities' in channel) {
    for (const capability of chData.capabilities) {
      const capData = Object.assign({}, defaultCapability, capability);

      capData.name = capData.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      let xmlCapability = {
        $: {
          Min: Math.floor(capData.range[0] / divisor),
          Max: Math.floor(capData.range[1] / divisor)
        },
        _: capData.name
      };
      xmlChannel.Capability.push(xmlCapability);

      if ('image' in capData) {
        xmlCapability.$.res = capData.image;
      }
      else if ('color' in capData) {
        xmlCapability.$.Color = capData.color;

        if ('color2' in capData) {
          xmlCapability.$.Color2 = capData.color2;
        }
      }
    }
  }
  else {
    xmlChannel.Capability.push({
      $: {
        Min: defaultCapability.range[0],
        Max: defaultCapability.range[1]
      },
      _: defaultCapability.name
    });
  }

  if ('fineChannelAliases' in chData) {
    chData.fineChannelAliases.forEach((alias, index) => {
      let fineXmlChannel = JSON.parse(JSON.stringify(xmlChannel));

      fineXmlChannel.$.Name += getFineChannelSuffix(index);
      fineXmlChannel.Group.$.Byte = index + 1;
      fineXmlChannel.Capability = [{
        $: {
          Min: defaultCapability.range[0],
          Max: defaultCapability.range[1]
        },
        _: defaultCapability.name
      }];

      xmlChannels.push(fineXmlChannel);
    });
  }
}

function getFineChannelSuffix(index) {
  return ' fine' + (index > 0 ? '^' + (index + 1) : '');
}

function exportHandleModes(fixture, defaults, physical, fineChannels, switchingChannels) {
  let xmlModes = [];

  for (const mode of fixture.modes) {
    let modeData = Object.assign({}, defaults.modes[0], mode);
    modeData.physical = Object.assign({}, physical, modeData.physical);
    modeData.physical.bulb = Object.assign({}, physical.bulb, modeData.physical.bulb);
    modeData.physical.lens = Object.assign({}, physical.lens, modeData.physical.lens);
    modeData.physical.focus = Object.assign({}, physical.focus, modeData.physical.focus);

    let xmlMode = {
      $: {
        Name: modeData.name
      },
      Physical: {
        Bulb: {
          $: {
            ColourTemperature: modeData.physical.bulb.colorTemperature,
            Type: modeData.physical.bulb.type,
            Lumens: modeData.physical.bulb.lumens
          }
        },
        Dimensions: {
          $: {
            Width: Math.round(modeData.physical.dimensions[0]),
            Height: Math.round(modeData.physical.dimensions[1]),
            Depth: Math.round(modeData.physical.dimensions[2]),
            Weight: modeData.physical.weight
          }
        },
        Lens: {
          $: {
            Name: modeData.physical.lens.name,
            DegreesMin: modeData.physical.lens.degreesMinMax[0],
            DegreesMax: modeData.physical.lens.degreesMinMax[1]
          }
        },
        Focus: {
          $: {
            Type: modeData.physical.focus.type,
            TiltMax: modeData.physical.focus.tiltMax,
            PanMax: modeData.physical.focus.panMax
          }
        },
        Technical: {
          $: {
            DmxConnector: modeData.physical.DMXconnector,
            PowerConsumption: modeData.physical.power
          }
        }
      },
      Channel: [],
      Head: []
    };
    xmlModes.push(xmlMode);

    for (let i = 0; i < modeData.channels.length; i++) {
      const chKey = modeData.channels[i];
      let channelName;

      if (chKey in fineChannels) {
        const triggerChannel = fixture.availableChannels[fineChannels[chKey]];
        channelName = triggerChannel.name + getFineChannelSuffix(triggerChannel.fineChannelAliases.indexOf(chKey));
      }
      else if (chKey in switchingChannels) {
        channelName = chKey;
      }
      else {
        channelName = fixture.availableChannels[modeData.channels[i]].name;
      }

      xmlMode.Channel.push({
        $: {
          Number: i
        },
        _: channelName
      });
    }

    for (const headName of Object.keys(fixture.heads)) {
      const headLampList = fixture.heads[headName];
      let headChannelList = [];
      for (const channel of headLampList) {
        const chNum = modeData.channels.indexOf(channel);
        if (chNum !== -1) {
          headChannelList.push(chNum);
        }
      }

      if (headChannelList.length > 0) {
        let xmlHead = {
          Channel: []
        };
        xmlMode.Head.push(xmlHead);
        for (const chNum of headChannelList) {
          xmlHead.Channel.push(chNum);
        }
      }
    }
  }

  return xmlModes;
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
}