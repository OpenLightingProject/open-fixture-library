const fs = require('fs');
const path = require('path');
const util = require('util');

module.exports.name = 'e:cue';
module.exports.version = '0.1.0';

const fileTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<Document Owner="user" TypeVersion="2" SaveTimeStamp="%s">
    <Library>
        <Fixtures>
%s        </Fixtures>
        <Tiles>
%s        </Tiles>
    </Library>
</Document>
`;

module.exports.export = function exportEcue(library, options) {
  let outfiles = [];

  const defaults = require(path.join(options.baseDir, 'fixtures', 'defaults'));

  let outFixtures = {};  

  for (const data of library) {
    let fixture = Object.assign({}, defaults, JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', data.manufacturerKey, data.fixtureKey + '.json'), 'utf-8')));

    if (fixture.shortName === null) {
      fixture.shortName = fixture.name;
    }

    let physical = Object.assign({}, defaults.physical, fixture.physical);
    physical.bulb = Object.assign({}, defaults.physical.bulb, fixture.physical.bulb);
    physical.lens = Object.assign({}, defaults.physical.lens, fixture.physical.lens);
    physical.focus = Object.assign({}, defaults.physical.focus, fixture.physical.focus);


    const fixtureStr = exportHandleModes(fixture, defaults, physical);

    if (!(data.manufacturerKey in outFixtures)) {
      outFixtures[data.manufacturerKey] = '';
    }
    outFixtures[data.manufacturerKey] += fixtureStr;
  }

  const timestamp = new Date().toISOString().replace(/T/, '#').replace(/\..+/, '');

  let fixturesStr = '';
  let tilesStr = '';

  for (const man in outFixtures) {
    const manData = options.manufacturers[man];

    const manStr = `<Manufacturer _CreationDate="${timestamp}" _ModifiedDate="${timestamp}" Header="" Name="${manData.name}" Comment="${manData.comment || ''}" Web="${manData.website || ''}"`;

    tilesStr += `            ${manStr} />\n`;

    fixturesStr += `            ${manStr}>\n`;
    fixturesStr += outFixtures[man];
    fixturesStr += '            </Manufacturer>\n';
  }

  outfiles.push({
    name: 'UserLibrary.xml',
    content: util.format(fileTemplate, timestamp, fixturesStr, tilesStr),
    mimetype: 'application/xml'
  });

  return outfiles;
}

function exportHandleModes(fixture, defaults, physical) {
  let str = '';

  const fixCreationDate = fixture.meta.createDate + '#00:00:00';
  const fixModifiedDate = fixture.meta.lastModifyDate + '#00:00:00';

  for (const mode of fixture.modes) {
    let modeData = Object.assign({}, defaults.modes[0], mode);
    modeData.physical = Object.assign({}, physical, modeData.physical);
    modeData.physical.bulb = Object.assign({}, physical.bulb, modeData.physical.bulb);
    modeData.physical.lens = Object.assign({}, physical.lens, modeData.physical.lens);
    modeData.physical.focus = Object.assign({}, physical.focus, modeData.physical.focus);

    if (modeData.shortName === null) {
      modeData.shortName = modeData.name;
    }

    let fixName = fixture.name + (fixture.modes.length > 1 ? ` (${modeData.shortName} mode)` : '');
    let fixShortName = fixture.shortName + (fixture.modes.length > 1 ? '-' + modeData.shortName : '');

    str += `                <Fixture _CreationDate="${fixCreationDate}" _ModifiedDate="${fixModifiedDate}" Header="" Name="${fixName}" NameShort="${fixShortName}" Comment="${fixture.comment}" AllocateDmxChannels="${mode.channels.length}" Weight="${modeData.physical.weight}" Power="${modeData.physical.power}" DimWidth="${modeData.physical.dimensions[0]}" DimHeight="${modeData.physical.dimensions[1]}" DimDepth="${modeData.physical.dimensions[2]}">\n`;

    let viewPosCount = 1;
    for (let dmxCount=0; dmxCount<mode.channels.length; dmxCount++) {
      let chKey = mode.channels[dmxCount];

      if (chKey === null) {
        // we already handled this as part of a 16-bit channel or it is a undefined channel, so just skip
        continue;
      }

      let doubleByte = false;
      const multiByteChannels = getCorrespondingMultiByteChannels(chKey, fixture);
      if (multiByteChannels !== null
        && mode.channels.indexOf(multiByteChannels[0]) != -1
        && mode.channels.indexOf(multiByteChannels[1]) != -1
        ) {
        // it is a 16-bit channel and both 8-bit parts are used in this mode
        chKey = multiByteChannels[0];
        doubleByte = true;
      }

      const channel = fixture.availableChannels[chKey];

      let chData = Object.assign({}, defaults.availableChannels['channel key'], channel);

      if (chData.name === null) {
        chData.name = chKey;
      }

      let chType;
      switch (chData.type) {
        case 'MultiColor':
        case 'SingleColor':
          chType = 'Color';
          break;
        case 'Beam':
        case 'Shutter':
        case 'Strobe':
        case 'Gobo':
        case 'Prism':
        case 'Effect':
        case 'Speed':
        case 'Maintenance':
        case 'Nothing':
          chType = 'Beam';
          break;
        case 'Pan':
        case 'Tilt':
          chType = 'Focus';
          break;
        case 'Intensity':
        default:
          chType = 'Intensity';
      }

      let dmxByte0 = dmxCount;
      let dmxByte1 = -1;

      if (doubleByte) {
        const chKeyLsb = multiByteChannels[1];
        const channelLsb = fixture.availableChannels[chKeyLsb];

        const chDataLsb = Object.assign({}, defaults.availableChannels['channel key'], channelLsb);

        chData.defaultValue *= 256;
        chData.defaultValue += chDataLsb.defaultValue;

        chData.highlightValue *= 256;
        chData.highlightValue += chDataLsb.highlightValue;

        dmxByte0 = mode.channels.indexOf(chKey);
        dmxByte1 = mode.channels.indexOf(chKeyLsb);

        // mark other part of 16-bit channel as already handled
        mode.channels[Math.max(dmxByte1, dmxByte0)] = null;
      }

      dmxByte0++;
      dmxByte1++;

      const hasCapabilities = ('capabilities' in channel);

      str += `                    <Channel${chType} Name="${chData.name}" DefaultValue="${chData.defaultValue}" Highlight="${chData.highlightValue}" Deflection="0" DmxByte0="${dmxByte0}" DmxByte1="${dmxByte1}" Constant="${chData.constant ? 1 : 0}" Crossfade="${chData.crossfade ? 1 : 0}" Invert="${chData.invert ? 1 : 0}" Precedence="${chData.precendence}" ClassicPos="${viewPosCount++}"` + (hasCapabilities ? '' : ' /') + '>\n';

      if (hasCapabilities) {
        for (const cap of channel.capabilities) {
          const capData = Object.assign({}, defaults.availableChannels['channel key'].capabilities[0], cap);

          str += `                        <Range Name="${capData.name}" Start="${capData.range[0]}" End="${capData.range[1]}" AutoMenu="${capData.hideInMenu ? 0 : 1}" Centre="${capData.center ? 1 : 0}" />\n`;
        }
        str += `                    </Channel${chType}>\n`;
      }
    }
    str += '                </Fixture>\n';
  }

  return str;
}

function getCorrespondingMultiByteChannels(channelKey, fixture) {
  for (let channelList of fixture.multiByteChannels) {
    if (channelList.indexOf(channelKey) != -1) {
      return channelList;
    }
  }
  return null;
}