const xml2js = require('xml2js');

module.exports.name = 'DMXControl 3';
module.exports.version = '0.1.0';


function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function logXML(obj) {
  var builder = new xml2js.Builder({
    headless: true,
  });
  var xml = builder.buildObject(obj);
  console.log(xml);
}


module.exports.import = function importDmxControl3(str, filename, resolve, reject) {
  new xml2js.Parser().parseString(str, (parseError, xml) => {
    if (parseError) {
      return reject(`Error parsing '${filename}' as XML.\n` + parseError.toString());
    }

    let out = {
      manufacturers: {},
      fixtures: {},
      warnings: {}
    };

    try {
      const device = xml.device;
      const info = device.information[0];
      const manName = info.vendor[0];
      const manKey = manName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
      out.manufacturers[manKey] = {
        name: manName
      };

      // TODO: check if "modell" is really generated by DDFCreator
      // or if it only was a typo of myself
      const fixName = 'model' in info ? info.model[0] : info.modell[0];
      const fixKey = manKey + '/' + fixName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
      out.warnings[fixKey] = [];

      const timestamp = new Date().toISOString().split('T')[0];
      let fix = {
        name: fixName,
        shortName: fixKey,
        categories: [],
        meta: {
          createDate: timestamp,
          lastModifyDate: timestamp,
        },
        availableChannels: {},
        modes: [{
          name: 'Default',
          channels: [],
        }],
      };

      if (info.author) {
        fix.meta.authors = [info.author[0]];
      }

      if (info.mode) {
        fix.modes[0].name = info.mode[0];
      }

      // make sure that channels.length is dmxaddresscount.
      // (undefined channels will later be set to null)
      if (device.$.dmxaddresscount) {
        fix.modes[0].channels[device.$.dmxaddresscount - 1] = null;
      }


      const warnUnknownAttributes = function(nodeName, node, knownAttributes) {
        if ('$' in node) {
          for (const attr in node.$) {
            if (!knownAttributes.includes(attr)) {
              out.warnings[fixKey].push(`Unknown attribute '${attr}=${node.$[attr]}' in '${nodeName}'`);
            }
          }
        }
      };

      const warnUnknownChildren = function(nodeName, node, knownChildren) {
        for (const child in node) {
          if (child !== '$' && !knownChildren.includes(child)) {
            out.warnings[fixKey].push(`Unknown child '${child}' in '${nodeName}'`);
          }
        }
      };

      const parseSimpleFunction = function(functionType, functionContainer, functionIndex) {
        const singleFunction = functionContainer[functionIndex];
        const caps = getCapabilities(singleFunction, functionType);

        if ('$' in singleFunction && 'dmxchannel' in singleFunction.$) {
          let channel = {
            type: 'Intensity',
          }
          if (['strobe', 'shutter', 'pan', 'tilt'].includes(functionType)) {
            channel.type = capitalize(functionType);
          }

          if (caps.length > 0) {
            channel.capabilities = caps;
          }

          if ('defaultval' in singleFunction.$) {
            channel.defaultValue = parseInt(singleFunction.$.defaultval);
          }
          else if ('val' in singleFunction.$) {
            channel.defaultValue = parseInt(singleFunction.$.val);
          }

          if (functionType === 'const') {
            channel.constant = true;
          }

          let channelKey;
          if ('name' in singleFunction.$) {
            channelKey = singleFunction.$.name;

            if (['raw', 'const'].includes(functionType)) {
              const testName = channelKey.toLowerCase();
              if (testName.includes('intensity')) {
                channel.type = 'Intensity';
              }
              else if (testName.includes('speed') || testName.includes('duration')) {
                channel.type = 'Speed';
              }
              else {
                out.warnings[fixKey].push(`Please check channel type of '${channelKey}'`);
              }
            }
          }
          else {
            // "Dimmer" if there's only one dimmer
            // "Dimmer 1", "Dimmer 2", ... if there are more dimmers
            channelKey = capitalize(functionType);
            if (functionContainer.length > 1) {
              channelKey += ` ${functionIndex+1}`;
            }
          }

          // append " 2", " 3", ... to channel key if it isn't unique
          channelKey = getUniqueChannelKey(channelKey);

          addChannelToMode(channelKey, singleFunction.$.dmxchannel, channel);
          addPossibleFineChannel(singleFunction, channelKey);

          warnUnknownAttributes(functionType, singleFunction, ['name', 'defaultval', 'val', 'constant', 'dmxchannel', 'mindmx', 'maxdmx', 'finedmxchannel']);
        }

        warnUnknownChildren(functionType, singleFunction, ['range', 'step']);
      };

      const sortCapabilities = function(a, b) {
        return a.range[0] - b.range[0];
      };

      // node can be step or range
      const getCapability = function(node, functionType) {
        if (typeof node === 'object' && '$' in node) {
          let capability = {
            range: [0, 255],
            name: 'Generic'
          };

          capability.range[0] = parseInt(node.$.mindmx);
          capability.range[1] = parseInt(node.$.maxdmx);
          let minval = 'minval' in node.$ ? node.$.minval : '?';
          let maxval = 'maxval' in node.$ ? node.$.maxval : '?';

          if (capability.range[1] < capability.range[0]) {
            capability.range = [capability.range[1], capability.range[0]];
            [minval, maxval] = [maxval, minval];
          }

          if ('range' in node.$) {
            if (minval === '?') {
              minval = 0;
            }
            if (maxval === '?') {
              maxval = node.$.range;
            }
          }
          if (minval !== '?' || maxval !== '?') {
            if (minval === maxval) {
              // not a real range
              capability.name = `${minval}`;
            }
            else {
              capability.name = `${minval}-${maxval}`;

              if ('type' in node.$) {
                capability.name += ` (${node.$.type})`;
              }
            }

            if (maxval !== '?' && (functionType === 'pan' || functionType === 'tilt')) {
              if (!('physical' in fix)) {
                fix.physical = {};
              }
              if (!('focus' in fix.physical)) {
                fix.physical.focus = {};
              }
              if (functionType + 'Max' in fix.physical.focus) {
                fix.physical.focus[functionType + 'Max'] = Math.max(
                  fix.physical.focus[functionType + 'Max'],
                  parseInt(maxval)
                );
              }
              else {
                fix.physical.focus[functionType + 'Max'] = parseInt(maxval);
              }
            }
          }
          else if ('val' in node.$) {
            capability.name = node.$.val;
          }
          else if ('type' in node.$) {
            capability.name = node.$.type;
          }

          warnUnknownAttributes('range/step', node, ['type', 'mindmx', 'maxdmx', 'minval', 'maxval', 'val', 'range'])

          if ('mindmx' in node.$ && 'maxdmx' in node.$) {
            return capability;
          }
        }
        return null;
      };

      const getCapabilities = function(node, functionType) {
        let capabilities = [];

        if ('range' in node) {
          for (const range of node.range) {
            const cap = getCapability(range, functionType);
            if (cap != null) {
              capabilities.push(cap);
            }
          }
        }

        if ('step' in node) {
          for (const step of node.step) {
            const cap = getCapability(step, functionType);
            if (cap != null) {
              capabilities.push(cap);
            }
          }
        }

        if ('$' in node && 'mindmx' in node.$ && 'maxdmx' in node.$) {
          capabilities.push({
            range: [
              parseInt(node.$.mindmx),
              parseInt(node.$.maxdmx)
            ],
            name: 'Generic'
          });
        }

        capabilities.sort(sortCapabilities);

        return capabilities;
      };

      const getUniqueChannelKey = function(key) {
        if (!(key in fix.availableChannels)) {
          return key;
        }
        let i = 2;
        while (`${key} ${i}` in fix.availableChannels) {
          i++;
        }
        return `${key} ${i}`;
      };

      const addChannelToMode = function(key, dmxchannel, channel) {
        const existingChannels = fix.modes[0].channels;
        const existingChannelKey = existingChannels[dmxchannel];

        // check if there already is a channel for this DMX channel index
        if (existingChannelKey !== undefined &&
            existingChannelKey !== null) {
          const existingChannel = fix.availableChannels[existingChannelKey];

          // do both channels' capabilities overlap?
          let overlap = false;
          if (!('capabilities' in channel)) {
            channel.capabilities = [];
          }
          if (!('capabilities' in existingChannel)) {
            existingChannel.capabilities = [];
          }
          checkOverlap: for (const capability of channel.capabilities) {
            for (existingCapability of existingChannel.capabilities) {
              if ((capability.range[0] <= existingCapability.range[0] &&
                   capability.range[1] >= existingCapability.range[0]) ||
                  (capability.range[0] <= existingCapability.range[1] &&
                   capability.range[1] >= existingCapability.range[1])) {
                overlap = true;
                break checkOverlap;
              }
            }
          }

          if (overlap) {
            out.warnings[fixKey].push(`Channels '${existingChannelKey}' and '${key}' have same DMX channel ${dmxchannel} and can't be merged because their capabilities overlap.`);
            fix.availableChannels[key] = channel;
          }
          else {
            existingChannel.capabilities = existingChannel.capabilities.concat(channel.capabilities).sort(sortCapabilities);
            out.warnings[fixKey].push(`Merged '${key}'´s capabilities into '${existingChannelKey}' as they have the same DMX channel ${dmxchannel}. Please check if ${existingChannel.type} is the correct type of the combined channel. Type of '${key}' was ${channel.type}.`);
          }
        }
        else {
          fix.availableChannels[key] = channel;
          existingChannels[dmxchannel] = key;
        }
      };

      const addPossibleFineChannel = function(singleFunction, normalChannelKey) {
        if ('finedmxchannel' in singleFunction.$) {
          const normalChannel = fix.availableChannels[normalChannelKey];
          let fineChannel = {
            type: normalChannel.type,
          };
          if ('color' in normalChannel) {
            fineChannel.color = normalChannel.color;
          }

          const fineChannelKey = normalChannelKey + ' fine';
          addChannelToMode(fineChannelKey, singleFunction.$.finedmxchannel, fineChannel);

          if (fix.multiByteChannels === undefined) {
            fix.multiByteChannels = [];
          }
          fix.multiByteChannels.push([normalChannelKey, fineChannelKey]);
        }
      };

      const functions = device.functions[0];
      for (const functionType in functions) {
        for (let i = 0; i < functions[functionType].length; i++) {
          const singleFunction = functions[functionType][i];

          switch (functionType) {
            case 'dimmer':
            case 'colortemp':
            case 'strobe':
            case 'shutter':
            case 'raw':
            case 'const':
              parseSimpleFunction(functionType, functions[functionType], i);
              break;

            case 'rgb':
            case 'cmy':
              warnUnknownAttributes(functionType, singleFunction, []);

              for (const colorFunctionName in singleFunction) {
                let color = colorFunctionName.toLowerCase();

                switch (color) {
                  case 'r':
                    color = 'Red';
                    break;

                  case 'g':
                    color = 'Green';
                    break;

                  case 'b':
                    color = 'Blue';
                    break;

                  case 'c':
                    color = 'Cyan';
                    break;

                  case 'm':
                    color = 'Magenta';
                    break;

                  case 'y':
                    color = 'Yellow';
                    break;

                  case 'w':
                    color = 'White';
                    break;

                  case 'uv':
                    color = 'UV';
                    break;

                  default:
                    color = capitalize(color);
                }

                const colorFunction = singleFunction[colorFunctionName][0];

                let channel = {
                  type: 'SingleColor',
                  color: color
                }

                const channelKey = getUniqueChannelKey(color);
                fix.availableChannels[channelKey] = channel;

                addChannelToMode(channelKey, colorFunction.$.dmxchannel, channel);
                addPossibleFineChannel(colorFunction, channelKey);

                warnUnknownAttributes(colorFunctionName, colorFunction, ['dmxchannel', 'finedmxchannel']);
                warnUnknownChildren(colorFunctionName, colorFunction, ['']);
              }

              break;

            case 'position':
              if ('pan' in singleFunction) {
                parseSimpleFunction('pan', singleFunction.pan, 0);
              }
              if ('tilt' in singleFunction) {
                parseSimpleFunction('tilt', singleFunction.tilt, 0);
              }

              warnUnknownAttributes(functionType, singleFunction, []);
              warnUnknownChildren(functionType, singleFunction, ['pan', 'tilt']);

              break;

            default:
              out.warnings[fixKey].push(`Unknown function type ${functionType}`);
          }
        }
      }

      for (let i = 0; i < fix.modes[0].channels.length; i++) {
        if (fix.modes[0].channels[i] === undefined) {
          fix.modes[0].channels[i] = null;
        }
      }

      if (fix.categories.length === 0) {
        fix.categories.push('Other');
      }

      out.fixtures[fixKey] = fix;

      return resolve(out);
    }
    catch (parseError) {
      return reject(`Error parsing '${filename}'.\n` + parseError.toString());
    }
  });
}