const fs = require('fs');
const path = require('path');

module.exports.name = 'QLC+';
module.exports.version = '0.1.0';

module.exports.export = function exportQLCplus(library, options) {
  let outfiles = [];

  const defaults = require(path.join(options.baseDir, 'fixtures', 'defaults'));

  for (const data of library) {
    const fixture = Object.assign({}, defaults, JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', data.manufacturerKey, data.fixtureKey + '.json'), 'utf-8')));

    const manufacturer = options.manufacturers[data.manufacturerKey];

    // make null references in channel list link to a "No function" channel
    for (const mode of fixture.modes) {
      for (let i=0; i<mode.channels.length; i++) {
        if (mode.channels[i] == null) {
          mode.channels[i] = "No Function " + i;
          fixture.availableChannels["No Function " + i] = {
            "name": "No Function",
            "type": "Nothing"
          };
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

    let physical = Object.assign({}, defaults.physical, fixture.physical);
    physical.bulb = Object.assign({}, defaults.physical.bulb, fixture.physical.bulb);
    physical.lens = Object.assign({}, defaults.physical.lens, fixture.physical.lens);
    physical.focus = Object.assign({}, defaults.physical.focus, fixture.physical.focus);


    let str = '<?xml version="1.0" encoding="UTF-8"?>\n';
    str += '<!DOCTYPE FixtureDefinition>\n';
    str += '<FixtureDefinition xmlns="http://www.qlcplus.org/FixtureDefinition">\n';
    str += ' <Creator>\n';
    str += `  <Name>Open Fixture Library ${module.exports.name} plugin</Name>\n`;
    str += `  <Version>${module.exports.version}</Version>\n`;
    str += `  <Author>${fixture.meta.authors.join(', ')}</Author>\n`;
    str += ' </Creator>\n';
    str += ` <Manufacturer>${manufacturer.name}</Manufacturer>\n`;
    str += ` <Model>${fixture.name}</Model>\n`;
    str += ` <Type>${fixture.categories[0]}</Type>\n`;

    str += exportHandleAvailableChannels(fixture, defaults);
    str += exportHandleModes(fixture, defaults, physical);

    str += '</FixtureDefinition>';

    outfiles.push({
      'name': data.manufacturerKey + '/' + data.fixtureKey + '.qxf',
      'content': str,
      'mimetype': 'application/x-qlc-fixture'
    });
  }

  return outfiles;
}

function exportHandleAvailableChannels(fixture, defaults) {
  let str = '';

  for (const channel in fixture.availableChannels) {
    const chData = Object.assign({}, defaults.availableChannels['channel key'], fixture.availableChannels[channel]);

    chData.name = chData.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let byte = 0;
    for (const multiByteChannel of fixture.multiByteChannels) {
      for (const i in multiByteChannel) {
        if (multiByteChannel[i] == channel) {
          byte = i;
          break;
        }
      }
    }

    str += ` <Channel Name="${chData.name}">\n`;

    if (chData.type == 'SingleColor') {
      chData.type = 'Intensity';
    }
    else if (chData.type == 'MultiColor') {
      chData.type = 'Colour';
    }
    else if (chData.type == 'Strobe') {
      chData.type = 'Shutter';
    }

    str += `  <Group Byte="${byte}">${chData.type}</Group>\n`;
    if (chData.type == 'Intensity') {
      str += `  <Colour>${chData.color}</Colour>\n`;
    }


    for (const capability of chData.capabilities) {
      const capData = Object.assign({}, defaults.availableChannels['channel key'].capabilities[0], capability);

      capData.name = capData.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      let attrs = `Min="${capData.range[0]}" Max="${capData.range[1]}"`;
      if (capData.image != '') {
        attrs += ` res="${capData.image}"`;
      }
      else if (capData.color != '') {
        attrs += ` Color="${capData.color}"`;

        if (capData.color2 != '') {
          attrs += ` Color2="${capData.color2}"`;
        }
      }
      str += `  <Capability ${attrs}>${capData.name}</Capability>\n`;
    }

    str += ' </Channel>\n';
  }

  return str;
}

function exportHandleModes(fixture, defaults, physical) {
  let str = '';

  for (const mode of fixture.modes) {
    let modeData = Object.assign({}, defaults.modes[0], mode);
    modeData.physical = Object.assign({}, physical, modeData.physical);
    modeData.physical.bulb = Object.assign({}, physical.bulb, modeData.physical.bulb);
    modeData.physical.lens = Object.assign({}, physical.lens, modeData.physical.lens);
    modeData.physical.focus = Object.assign({}, physical.focus, modeData.physical.focus);

    str += ` <Mode Name="${modeData.name}">\n`;

    str += `  <Physical>\n`;
    str += `   <Bulb ColourTemperature="${modeData.physical.bulb.colorTemperature}" Type="${modeData.physical.bulb.type}" Lumens="${modeData.physical.bulb.lumens}" />\n`;
    str += `   <Dimensions Width="${modeData.physical.dimensions[0]}" Height="${modeData.physical.dimensions[1]}" Depth="${modeData.physical.dimensions[2]}" Weight="${modeData.physical.weight}" />\n`;
    str += `   <Lens Name="${modeData.physical.lens.name}" DegreesMin="${modeData.physical.lens.degreesMinMax[0]}" DegreesMax="${modeData.physical.lens.degreesMinMax[1]}" />\n`;
    str += `   <Focus Type="${modeData.physical.focus.type}" TiltMax="${modeData.physical.focus.tiltMax}" PanMax="${modeData.physical.focus.panMax}" />\n`;
    str += `   <Technical DmxConnector="${modeData.physical.DMXconnector}" PowerConsumption="${modeData.physical.power}" />\n`;
    str += `  </Physical>\n`;

    for (let i=0; i<modeData.channels.length; i++) {
      let channel = modeData.channels[i];

      str += `  <Channel Number="${i}">${fixture.availableChannels[channel].name}</Channel>\n`;
    }

    for (const head in fixture.heads) {
      const headLampList = fixture.heads[head];
      let headChannelList = [];
      for (const channel of headLampList) {
        const chNum = modeData.channels.indexOf(channel);
        if (chNum != -1) {
          headChannelList.push(chNum);
        }
      }

      if (headChannelList.length > 0) {
        str += '  <Head>\n';
        for (const chNum of headChannelList) {
          str += `   <Channel>${chNum}</Channel>\n`;
        }
        str += '  </Head>\n';
      }
    }

    str += ` </Mode>\n`;
  }

  return str;
}