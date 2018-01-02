const xmlbuilder = require('xmlbuilder');
const sanitize = require('sanitize-filename');

/* eslint-disable no-unused-vars */
const Manufacturer = require('../../lib/model/Manufacturer.js');
const Fixture = require('../../lib/model/Fixture.js');
const Meta = require('../../lib/model/Meta.js');
const Physical = require('../../lib/model/Physical.js');
const Matrix = require('../../lib/model/Matrix.js');
const Mode = require('../../lib/model/Mode.js');
const MatrixChannel = require('../../lib/model/MatrixChannel.js');
const AbstractChannel = require('../../lib/model/AbstractChannel.js');
const Channel = require('../../lib/model/Channel.js');
const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');
const NullChannel = require('../../lib/model/NullChannel.js');
const Capability = require('../../lib/model/Capability.js');
const Range = require('../../lib/model/Range.js');
/* eslint-enable no-unused-vars */

module.exports.name = 'DMXControl 3 (DDF3)';
module.exports.version = '0.1.0';

/**
 * @param {!Array.<Fixture>} fixtures The fixtures to convert into DMXControl device definitions
 * @param {!options} options Some global options
 * @returns {!Array.<object>} All generated files
 */
module.exports.export = function exportDMXControl3(fixtures, options) {
  const deviceDefinitions = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      const xml = xmlbuilder.begin()
        .declaration('1.0', 'utf-8')
        .element({
          device: {
            '@type': 'DMXDevice',
            '@dmxaddresscount': mode.channelKeys.length,
            '@dmxcversion': 3,
            '@ddfversion': fixture.meta.lastModifyDate.toISOString().split('T')[0]
          }
        });

      addInformation(xml, mode);
      addFunctions(xml, mode);

      deviceDefinitions.push({
        name: sanitize(`${fixture.manufacturer.key}-${fixture.key}-${(mode.shortName)}.xml`).replace(/\s+/g, '-'),
        content: xml.end({
          pretty: true,
          indent: '  '
        }),
        mimetype: 'application/xml'
      });
    }
  }

  return deviceDefinitions;
};

/**
 * Adds the information block to the specified xml file.
 * @param {!XMLDocument} xml The device definition to add the information to
 * @param {!Mode} mode The definition's mode
 */
function addInformation(xml, mode) {
  const xmlInfo = xml.element('information');
  xmlInfo.element('model').text(mode.fixture.name);
  xmlInfo.element('vendor').text(mode.fixture.manufacturer.name);
  xmlInfo.element('author').text(mode.fixture.meta.authors.join(', '));
  xmlInfo.element('mode').text(mode.name);

  if (mode.fixture.hasComment) {
    xmlInfo.element('comment').text(mode.fixture.comment);
  }
}

/**
 * Adds the dmx channels as functions to the specified xml file.
 * @param {!XMLDocument} xml The device definition to add the functions to.
 * @param {!Mode} mode The definition's mode.
 */
function addFunctions(xml, mode) {
  const xmlFunctions = xml.element('functions');

  const channelsToAdd = mode.channels.map(
    ch => (ch instanceof SwitchingChannel ? ch.defaultChannel : ch)
  ).filter(
    ch => !(ch instanceof FineChannel) // they are handled by addDmxchannelAttributes(...)
  );

  addColorFunctions(xmlFunctions, mode, channelsToAdd);
}

/**
 * Finds color channels in the given channel list, adds them to xml (as RGB/CMY function, if possible)
 * and removes them from the channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <rgb>/<cmy> tag should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<AbstractChannel>} remainingChannels List of all channels that haven't been processed already, only unwrapped MatrixChannels allowed.
 */
function addColorFunctions(xmlParent, mode, remainingChannels) {
  // search color channels and remove them from color list as we'll handle all of them
  console.log(remainingChannels.map(ch => ch.key));
  const remainingColorChannels = remainingChannels.filter(ch => ch.type === 'Single Color');
  remainingColorChannels.forEach(ch => remainingChannels.splice(remainingChannels.indexOf(ch), 1));

  const rgbGroups = getColorChannelGroups(remainingColorChannels, ['Red', 'Green', 'Blue']);
  const cmyGroups = getColorChannelGroups(remainingColorChannels, ['Cyan', 'Magenta', 'Yellow']);
  const colorGroups = rgbGroups.concat(cmyGroups);

  for (const colorChannel of remainingChannels) {
    const channelGroupWithSpace = colorGroups.find(
      group => !group.every(ch => ch.type !== colorChannel.type)
    );
    if (channelGroupWithSpace) {
      channelGroupWithSpace.push(colorChannel);
      remainingChannels.splice(remainingChannels.indexOf(colorChannel), 1);
    }
  }

  rgbGroups.forEach(rgbGroup => addColorMixingFunction(xmlParent, mode, rgbGroup, 'rgb'));
  cmyGroups.forEach(cmyGroup => addColorMixingFunction(xmlParent, mode, cmyGroup, 'cmy'));
  remainingColorChannels.forEach(channel => addColorFunction(xmlParent, mode, channel));
}

/**
 * Groups the given channels into RGB/CMY groups. Removes used channels from the given list.
 * @param {!Array.<Channel>} colorChannels All channels to process.
 * @param {!Array.<string>} colors Which colors to group; either RGB or CMY colors.
 * @returns {!Array.<Array.<Channel>>} The RGB/CMY channel groups. Each subarray consists of the three color channels.
 */
function getColorChannelGroups(colorChannels, colors) {
  colorChannels = colorChannels.filter(
    channel => colors.includes(channel.type)
  );
  const channelGroups = [];

  for (const colorChannel of colorChannels) {
    const channelGroupWithSpace = channelGroups.find(
      group => !group.every(ch => ch.type !== colorChannel.type)
    );
    if (channelGroupWithSpace) {
      channelGroupWithSpace.push(colorChannel);
    }
    else {
      channelGroups.push([colorChannel]);
    }
  }

  const completeChannelGroups = [];
  for (const channelGroup of channelGroups) {
    if (channelGroup.length === colors.length) {
      completeChannelGroups.push(channelGroup);
      channelGroup.forEach(
        colorChannel => colorChannels.splice(colorChannels.indexOf(colorChannel), 1)
      );
    }
  }

  return completeChannelGroups;
}

/**
 * Adds a color mixing function for the given channels
 * @param {!XMLElement} xmlParent The xml element in which the color mixing (<rgb> or <cmy>) should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} colorChannels The Single Color channels to be added.
 * @param {('rgb'|'cmy')} colorMixing Which kind of color mixing this is.
 */
function addColorMixingFunction(xmlParent, mode, colorChannels, colorMixing) {
  const xmlColorMixing = xmlParent.element(colorMixing);

  for (const colorChannel of colorChannels) {
    addColorFunction(xmlColorMixing, mode, colorChannel);
  }
}

/**
 * Adds a color function for the given channel.
 * @param {!XMLElement} xmlParent The xml element in which the color tag should be inserted, probably <rgb> or <cmy>.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} colorChannel The Single Color channel which should be added.
 */
function addColorFunction(xmlParent, mode, colorChannel) {
  const xmlColor = xmlParent.element(colorChannel.color.toLowerCase());
  addDmxchannelAttributes(xmlColor, mode, colorChannel);
}

/**
 * Adds dmxchannel attribute and attributes for fine channels (if used in mode) to the given channel function.
 * @param {!XMLElement} xmlElement The xml element to which the attributes should be added.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} channel The channel whose data is used.
 */
function addDmxchannelAttributes(xmlElement, mode, channel) {
  const index = mode.getChannelIndex(channel);
  xmlElement.attribute('dmxchannel', index);

  const fineIndices = channel.fineChannels.map(
    fineCh => mode.getChannelIndex(fineCh)
  );

  if (fineIndices.length > 0 && fineIndices[0] !== -1) {
    xmlElement.attribute('finedmxchannel', fineIndices[0]);

    if (fineIndices.length > 1 && fineIndices[1] !== -1) {
      xmlElement.attribute('ultradmxchannel', fineIndices[1]);

      if (fineIndices.length > 2 && fineIndices[2] !== -1) {
        xmlElement.attribute('ultrafinedmxchannel', fineIndices[2]);
      }
    }
  }
}