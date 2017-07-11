const path = require('path');
const colorNames = require('color-names');
const xml2js = require('xml2js');
const xmlbuilder = require('xmlbuilder');

const FineChannel = require(path.join(__dirname, '..', 'lib', 'model', 'FineChannel.js'));
const NullChannel = require(path.join(__dirname, '..', 'lib', 'model', 'NullChannel.js'));
const SwitchingChannel = require(path.join(__dirname, '..', 'lib', 'model', 'SwitchingChannel.js'));

module.exports.name = 'e:cue';
module.exports.version = '0.3.0';

module.exports.export = function exportEcue(fixtures, options) {
  const timestamp = dateToString(new Date());

  let manufacturers = {};
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

  let xml = xmlbuilder.create(
    {
      Document: {
        '@Owner': 'user',
        '@TypeVersion': 2,
        '@SaveTimeStamp': timestamp
      }
    },
    {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: true
    }
  );

  let xmlLibrary = xml.element({
    Library: {}
  });
  let xmlFixtures = xmlLibrary.element({
    Fixtures: {}
  });
  let xmlTiles = xmlLibrary.element({
    Tiles: {}
  });

  for (const man of Object.keys(manufacturers)) {
    const manAttributes = {
      '_CreationDate': timestamp,
      '_ModifiedDate': timestamp,
      'Name': manufacturers[man].data.name,
      'Comment': manufacturers[man].data.comment,
      'Web': manufacturers[man].data.website || ''
    };
    xmlTiles.element('Manufacturer', manAttributes);

    let xmlManFixtures = xmlFixtures.element('Manufacturer', manAttributes);
    for (const fixture of manufacturers[man].fixtures) {
      exportHandleFixture(xmlManFixtures, fixture);
    }
  }

  return [{
    name: 'UserLibrary.xml',
    content: xml.end({
      pretty: true,
      indent: '    '
    }),
    mimetype: 'application/xml'
  }];
};

function exportHandleFixture(xmlMan, fixture) {
  const fixCreationDate = dateToString(fixture.meta.createDate);
  const fixModifiedDate = dateToString(fixture.meta.lastModifyDate);

  for (const mode of fixture.modes) {
    let xmlFixture = xmlMan.element('Fixture', {
      '_CreationDate': fixCreationDate,
      '_ModifiedDate': fixModifiedDate,
      'Name': fixture.name + (fixture.modes.length > 1 ? ` (${mode.shortName} mode)` : ''),
      'NameShort': fixture.shortName + (fixture.modes.length > 1 ? '-' + mode.shortName : ''),
      'Comment': fixture.comment,
      'AllocateDmxChannels': mode.channels.length,
      'Weight': mode.physical.weight,
      'Power': mode.physical.power,
      'DimWidth': mode.physical.width,
      'DimHeight': mode.physical.height,
      'DimDepth': mode.physical.depth
    });

    exportHandleMode(xmlFixture, mode);
  }
}

function exportHandleMode(xmlFixture, mode) {
  let viewPosCount = 1;
  for (let dmxCount = 0; dmxCount < mode.channels.length; dmxCount++) {      
    let channel = mode.channels[dmxCount];

    // skip unused channels
    if (mode.channels[dmxCount] instanceof NullChannel) {
      continue;
    }

    // ecue doesn't support switching channels, so we just use the default channel but change the name
    let switchingChannelName = null;
    if (channel instanceof SwitchingChannel) {
      switchingChannelName = channel.name;
      channel = channel.defaultChannel;
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
      dmxByte1 = mode.getChannelIndex(channel.fineChannelAliases[0], 'defaultOnly') + 1;
    }

    const fineness = channel.getFinenessInMode(mode, 'defaultOnly');

    const defaultValue = channel.getDefaultValueWithFineness(fineness === 1 ? 1 : 0);
    const highlightValue = channel.getHighlightValueWithFineness(fineness === 1 ? 1 : 0);

    let xmlChannel = xmlFixture.element(getChannelType(channel), {
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

    exportCapabilities(xmlChannel, channel, fineness);

    viewPosCount++;
  }
}

function getChannelType(channel) {
  switch (channel.type) {
    case 'MultiColor':
    case 'SingleColor':
      return 'ChannelColor';
    case 'Beam':
    case 'Shutter':
    case 'Strobe':
    case 'Gobo':
    case 'Prism':
    case 'Effect':
    case 'Speed':
    case 'Maintenance':
    case 'Nothing':
      return 'ChannelBeam';
    case 'Pan':
    case 'Tilt':
      return 'ChannelFocus';
    case 'Intensity':
    default:
      return 'ChannelIntensity';
  }
}

function exportCapabilities(xmlChannel, channel, fineness) {
  if (channel.hasCapabilities && fineness < 2) {
    for (const cap of channel.capabilities) {
      const range = cap.getRangeWithFineness(fineness);
      xmlChannel.element('Range', {
        'Name': cap.name,
        'Start': range.start,
        'End': range.end,
        'AutoMenu': cap.menuClick === 'hidden' ? 0 : 1,
        'Centre': cap.menuClick === 'center' ? 1 : 0
      });
    }
  }
}

module.exports.import = function importEcue(str, filename, resolve, reject) {
  let colors = {};
  for (const hex of Object.keys(colorNames)) {
    colors[colorNames[hex].toLowerCase().replace(/\s/g, '')] = hex;
  }

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

    try {
      if (!('Library' in xml.Document) || !('Fixtures' in xml.Document.Library[0]) || !('Manufacturer' in xml.Document.Library[0].Fixtures[0])) {
        reject('Nothing to import.');
        return;
      }

      for (const manufacturer of xml.Document.Library[0].Fixtures[0].Manufacturer) {
        const manName = manufacturer.$.Name;
        const manKey = manName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');

        out.manufacturers[manKey] = {
          name: manName
        };

        if (manufacturer.$.Comment !== '') {
          out.manufacturers[manKey].comment = manufacturer.$.Comment;
        }
        if (manufacturer.$.Web !== '') {
          out.manufacturers[manKey].website = manufacturer.$.Web;
        }

        if (!('Fixture' in manufacturer)) {
          continue;
        }

        for (const fixture of manufacturer.Fixture) {
          let fix = {
            name: fixture.$.Name
          };

          let fixKey = manKey + '/' + fix.name.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
          if (fixKey in out.fixtures) {
            fixKey += '-' + Math.random().toString(36).substr(2, 5);
            out.warnings[fixKey].push('Fixture key is not unique, appended random characters.');
          }
          out.warnings[fixKey] = [];

          if (fixture.$.NameShort !== '') {
            fix.shortName = fixture.$.NameShort;
          }

          fix.categories = ['Other'];
          out.warnings[fixKey].push('Please specify categories.');

          fix.meta = {
            authors: [],
            createDate: fixture.$._CreationDate.replace(/#.*/, ''),
            lastModifyDate: fixture.$._ModifiedDate.replace(/#.*/, ''),
            importPlugin: {
              plugin: 'ecue',
              date: timestamp
            }
          };
          out.warnings[fixKey].push('Please specify your name in meta.authors.');

          if (fixture.$.Comment !== '') {
            fix.comment = fixture.$.Comment;
          }

          let physical = {};

          if (fixture.$.DimWidth !== '10' && fixture.$.DimHeight !== '10' && fixture.$.DimDepth !== '10') {
            physical.dimensions = [parseInt(fixture.$.DimWidth), parseInt(fixture.$.DimHeight), parseInt(fixture.$.DimDepth)];
          }
          if (fixture.$.Weight !== '0') {
            physical.weight = parseFloat(fixture.$.Weight);
          }
          if (fixture.$.Power !== '0') {
            physical.power = parseInt(fixture.$.Power);
          }

          if (JSON.stringify(physical) !== '{}') {
            fix.physical = physical;
          }

          fix.availableChannels = {};
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

            if (name !== shortName) {
              ch.name = name;
            }

            ch.type = 'Intensity';
            if ('ChannelColor' in fixture && fixture.ChannelColor.indexOf(channel) !== -1) {
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
            else if (fixture.ChannelBeam && fixture.ChannelBeam.indexOf(channel) !== -1) {
              ch.type = 'Beam';
            }
            else if (!testName.includes('intensity') && !testName.includes('master') && !testName.includes('dimmer')) {
              // not even a default Intensity channel
              out.warnings[fixKey].push(`Please check the type of channel '${shortName}'.`);
            }

            if (channel.$.DmxByte1 !== '0') {
              const shortNameFine = shortName + ' fine';
              ch.fineChannelAliases = [shortNameFine];
              fix.modes[0].channels[parseInt(channel.$.DmxByte1) - 1] = shortNameFine;
            }

            if (channel.$.DefaultValue !== '0') {
              ch.defaultValue = parseInt(channel.$.DefaultValue);
            }
            if (channel.$.Highlight !== '0') {
              ch.highlightValue = parseInt(channel.$.Highlight);
            }
            if (channel.$.Invert === '1') {
              ch.invert = true;
            }
            if (channel.$.Constant === '1') {
              ch.constant = true;
            }
            if (channel.$.Crossfade === '1') {
              ch.crossfade = true;
            }
            if (channel.$.Precedence === 'HTP') {
              ch.precedence = 'HTP';
            }

            if ('Range' in channel) {
              ch.capabilities = [];

              channel.Range.forEach((range, i) => {
                let cap = {
                  range: [parseInt(range.$.Start), parseInt(range.$.End)],
                  name: range.$.Name
                };

                if (cap.range[1] === -1) {
                  cap.range[1] = (i+1 < channel.Range.length) ? parseInt(channel.Range[i+1].$.Start) - 1 : 255;
                }

                // try to read a color
                let color = cap.name.toLowerCase().replace(/\s/g, '');
                if (color in colors) {
                  cap.color = colors[color];
                }

                if (range.$.AutoMenu !== '1') {
                  cap.menuClick = 'hidden';
                }
                else if (range.$.Centre !== '0') {
                  cap.menuClick = 'center';
                }

                ch.capabilities.push(cap);
              });
            }

            fix.availableChannels[shortName] = ch;
            fix.modes[0].channels[parseInt(channel.$.DmxByte0) - 1] = shortName;
          }

          out.fixtures[fixKey] = fix;
        }
      }
    }
    catch (parseError) {
      reject(`Error parsing '${filename}'.\n` + parseError.toString());
      return;
    }

    resolve(out);
  });
};


function dateToString(date) {
  return date.toISOString().replace(/T/, '#').replace(/\..+/, '');
}