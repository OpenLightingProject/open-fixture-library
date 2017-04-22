const fs = require('fs');
const path = require('path');
const util = require('util');
const colorNames = require('color-names');
const xml2js = require('xml2js');

module.exports.name = 'e:cue';
module.exports.version = '0.1.1';

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

    const manStr = `<Manufacturer _CreationDate="${timestamp}" _ModifiedDate="${timestamp}" Name="${manData.name}" Comment="${manData.comment || ''}" Web="${manData.website || ''}"`;

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

    str += `                <Fixture _CreationDate="${fixCreationDate}" _ModifiedDate="${fixModifiedDate}" Name="${fixName}" NameShort="${fixShortName}" Comment="${fixture.comment}" AllocateDmxChannels="${mode.channels.length}" Weight="${modeData.physical.weight}" Power="${modeData.physical.power}" DimWidth="${modeData.physical.dimensions[0]}" DimHeight="${modeData.physical.dimensions[1]}" DimDepth="${modeData.physical.dimensions[2]}">\n`;

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

      str += `                    <Channel${chType} Name="${chData.name}" DefaultValue="${chData.defaultValue}" Highlight="${chData.highlightValue}" Deflection="0" DmxByte0="${dmxByte0}" DmxByte1="${dmxByte1}" Constant="${chData.constant ? 1 : 0}" Crossfade="${chData.crossfade ? 1 : 0}" Invert="${chData.invert ? 1 : 0}" Precedence="${chData.precedence}" ClassicPos="${dmxCount+1}"` + (hasCapabilities ? '' : ' /') + '>\n';

      if (hasCapabilities) {
        for (const cap of channel.capabilities) {
          const capData = Object.assign({}, defaults.availableChannels['channel key'].capabilities[0], cap);

          str += `                        <Range Name="${capData.name}" Start="${capData.range[0]}" End="${capData.range[1]}" AutoMenu="${capData.menuClick == 'hidden' ? 0 : 1}" Centre="${capData.menuClick == 'center' ? 1 : 0}" />\n`;
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

module.exports.import = function importEcue(str, filename, resolve, reject) {
  let colors = {};
  for (const hex in colorNames) {
    colors[colorNames[hex].toLowerCase().replace(/\s/g, '')] = hex;
  }

  const parser = new xml2js.Parser();
  const timestamp = new Date().toISOString().replace(/T.*/, '');

  parser.parseString(str, (parseError, xml) => {
    if (parseError) {
      return reject(`Error parsing '${filename}' as XML.\n` + parseError.toString());
    }

    let out = {
      manufacturers: {},
      fixtures: {},
      warnings: {}
    };

    try {
      if (!('Library' in xml.Document) || !('Fixtures' in xml.Document.Library[0]) || !('Manufacturer' in xml.Document.Library[0].Fixtures[0])) {
        return reject('Nothing to import.');
      }

      for (const manufacturer of xml.Document.Library[0].Fixtures[0].Manufacturer) {
        const manName = manufacturer.$.Name;
        const manKey = manName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');

        out.manufacturers[manKey] = {
          name: manName
        };

        if (manufacturer.$.Comment != '') {
          out.manufacturers[manKey].comment = manufacturer.$.Comment;
        }
        if (manufacturer.$.Web != '') {
          out.manufacturers[manKey].website = manufacturer.$.Web;
        }

        if (!('Fixture' in manufacturer)) {
          continue;
        }

        for (const fixture of manufacturer.Fixture) {
          let fix = {
            name: fixture.$.Name
          };

          const fixKey = manKey + '/' + fix.name.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
          if (fixKey in out.fixtures) {
            fixKey += '-' + Math.random().toString(36).substr(2, 5);
            out.warnings[fixKey].push('Fixture key is not unique, appended random characters.');
          }
          out.warnings[fixKey] = [];

          if (fixture.$.NameShort != '') {
            fix.shortName = fixture.$.NameShort;
          }

          fix.categories = ['Other'];
          out.warnings[fixKey].push(`Please specify categories.`);

          fix.meta = {
            authors: [],
            createDate: fixture.$._CreationDate.replace(/#.*/, ''),
            lastModifyDate: fixture.$._ModifiedDate.replace(/#.*/, ''),
            importPlugin: {
              plugin: 'ecue',
              date: timestamp
            }
          }
          out.warnings[fixKey].push(`Please specify your name in meta.authors.`);

          if (fixture.$.Comment != '') {
            fix.comment = fixture.$.Comment;
          }

          let physical = {};

          if (fixture.$.DimWidth != '10' && fixture.$.DimHeight != '10' && fixture.$.DimDepth != '10') {
            physical.dimensions = [parseInt(fixture.$.DimWidth), parseInt(fixture.$.DimHeight), parseInt(fixture.$.DimDepth)];
          }
          if (fixture.$.Weight != '0') {
            physical.weight = parseFloat(fixture.$.Weight);
          }
          if (fixture.$.Power != '0') {
            physical.power = parseInt(fixture.$.Power);
          }

          if (JSON.stringify(physical) !== '{}') {
            fix.physical = physical;
          }

          fix.availableChannels = {};
          fix.multiByteChannels = [];
          fix.modes = [{
            name: `${fixture.$.AllocateDmxChannels}-channel`,
            shortName: `${fixture.$.AllocateDmxChannels}ch`,
            channels: []
          }];


          let channels = [];

          if (fixture.ChannelIntensity) {
            channels = channels.concat(fixture.ChannelIntensity);
          }
          if (fixture.ChannelColor) {
            channels = channels.concat(fixture.ChannelColor);
          }
          if (fixture.ChannelBeam) {
            channels = channels.concat(fixture.ChannelBeam);
          }
          if (fixture.ChannelFocus) {
            channels = channels.concat(fixture.ChannelFocus);
          }

          channels = channels.sort((a, b) => {
            if (parseInt(a.$.DmxByte0) < parseInt(b.$.DmxByte0)) {
              return -1;
            }

            return (parseInt(a.$.DmxByte0) > parseInt(b.$.DmxByte0)) ? 1 : 0;
          });

          for (const channel of channels) {
            let ch = {};

            const name = channel.$.Name;
            const testName = name.toLowerCase();

            let shortName = name;
            if (shortName in fix.availableChannels) {
              shortName += '-' + Math.random().toString(36).substr(2, 5);
            }

            if (name != shortName) {
              ch.name = name;
            }

            ch.type = 'Intensity';
            if ('ChannelColor' in fixture && fixture.ChannelColor.indexOf(channel) != -1) {
              if (('Range' in channel && channel.Range.length > 1) || /colou?r\s*macro/.test(testName)) {
                ch.type = 'MultiColor';
              }
              else {
                ch.type = 'SingleColor';
                const colorFound = ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime'].some(color => {
                  if (testName.includes(color.toLowerCase())) {
                    ch.color = color;
                    return true;
                  }
                  return false;
                });

                if (!colorFound) {
                  out.warnings[fixKey].push(`Please add a color to channel '${shortName}'.`);
                }
              }
            }
            else if (testName.includes('speed')) {
              ch.type = 'Speed';
            }
            else if (testName.includes('gobo')) {
              ch.type = 'Gobo';
            }
            else if (testName.includes('program') || testName.includes('effect') || testName.includes('macro')) {
              ch.type = 'Effect';
            }
            else if (testName.includes('prism')) {
              ch.type = 'Prism';
            }
            else if (testName.includes('shutter')) {
              ch.type = 'Shutter';
            }
            else if (testName.includes('strob')) {
              ch.type = 'Strobe';
            }
            else if (testName.includes('pan')) {
              ch.type = 'Pan';
            }
            else if (testName.includes('tilt')) {
              ch.type = 'Tilt';
            }
            else if (testName.includes('reset')) {
              ch.type = 'Maintenance';
            }
            else if (fixture.ChannelBeam && fixture.ChannelBeam.indexOf(channel) != -1) {
              ch.type = 'Beam';
            }
            else if (!testName.includes('intensity') && !testName.includes('master') && !testName.includes('dimmer')) {
              // not even a default Intensity channel
              out.warnings[fixKey].push(`Please check the type of channel '${shortName}'.`);
            }

            if (channel.$.DefaultValue != '0') {
              ch.defaultValue = parseInt(channel.$.DefaultValue);
            }
            if (channel.$.Highlight != '0') {
              ch.highlightValue = parseInt(channel.$.Highlight);
            }
            if (channel.$.Invert == '1') {
              ch.invert = true;
            }
            if (channel.$.Constant == '1') {
              ch.constant = true;
            }
            if (channel.$.Crossfade == '1') {
              ch.crossfade = true;
            }
            if (channel.$.Precedence == 'HTP') {
              ch.precedence = 'HTP';
            }

            if ('Range' in channel) {
              ch.capabilities = [];

              channel.Range.forEach((range, i) => {
                let cap = {
                  range: [parseInt(range.$.Start), parseInt(range.$.End)],
                  name: range.$.Name
                };

                if (cap.range[1] == -1) {
                  cap.range[1] = (i+1 < channel.Range.length) ? parseInt(channel.Range[i+1].$.Start) - 1 : 255;
                }

                // try to read a color
                let color = cap.name.toLowerCase().replace(/\s/g, '');
                if (color in colors) {
                  cap.color = colors[color];
                }

                if (range.$.AutoMenu != '1') {
                  cap.menuClick = 'hidden';
                }
                else if (range.$.Centre != '0') {
                  cap.menuClick = 'center';
                }

                ch.capabilities.push(cap);
              });
            }

            fix.availableChannels[shortName] = ch;
            fix.modes[0].channels[parseInt(channel.$.DmxByte0) - 1] = shortName;

            if (channel.$.DmxByte1 != '0') {
              let chLsb = JSON.parse(JSON.stringify(ch)); // clone channel data

              const shortNameFine = shortName + ' fine';
              if (chLsb.name) {
                chLsb.name += ' fine';
              }

              if ('defaultValue' in ch) {
                ch.defaultValue = Math.floor(ch.defaultValue / 256);
                chLsb.defaultValue %= 256;
              }

              if ('highlightValue' in ch) {
                ch.highlightValue = Math.floor(ch.highlightValue / 256);
                chLsb.highlightValue %= 256;
              }

              fix.multiByteChannels.push([shortName, shortNameFine]);

              fix.availableChannels[shortNameFine] = chLsb;

              fix.modes[0].channels[parseInt(channel.$.DmxByte1) - 1] = shortNameFine;
            }
          }

          if (fix.multiByteChannels.length == 0) {
            delete fix.multiByteChannels;
          }

          out.fixtures[fixKey] = fix;
        }
      }
    }
    catch (parseError) {
      return reject(`Error parsing '${filename}'.\n` + parseError.toString());
    }

    resolve(out);
  });
}
