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
const Capabilitiy = require('../../lib/model/Capabilitiy.js');
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
  const colorChannels = remainingChannels.filter(ch => ch.type === 'Single Color');

  for (const colorChannel of colorChannels) {
    remainingChannels.splice(remainingChannels.indexOf(colorChannel), 1);
  }

  const redChannels = colorChannels.filter(ch => ch.color === 'Red');
  const greenChannels = colorChannels.filter(ch => ch.color === 'Green');
  const blueChannels = colorChannels.filter(ch => ch.color === 'Blue');
  const isRGB = redChannels.length > 0 && greenChannels.length > 0 && blueChannels.length > 0;

  const cyanChannels = colorChannels.filter(ch => ch.color === 'Cyan');
  const magentaChannels = colorChannels.filter(ch => ch.color === 'Magenta');
  const yellowChannels = colorChannels.filter(ch => ch.color === 'Yellow');
  const isCMY = cyanChannels.length > 0 && magentaChannels.length > 0 && yellowChannels.length > 0;

  if (isRGB && isCMY) {
    // if both color mixings are present, add a CMY function
    const xmlCMY = xmlParent.element('cmy');

    for (const colorChannel of cyanChannels.concat(magentaChannels, yellowChannels)) {
      colorChannels.splice(colorChannels.indexOf(colorChannel), 1);
      addColorFunction(xmlCMY, mode, colorChannel);
    }
  }

  if (isRGB || isCMY) {
    // if both color mixings are present, add an RGB function (with all other colors)
    const xmlColorMixing = xmlParent.element(isRGB ? 'rgb' : 'cmy');

    for (const colorChannel of colorChannels) {
      addColorFunction(xmlColorMixing, mode, colorChannel);
    }
  }
  else {
    // no color mixing, so add the channels directly to the parent
    for (const colorChannel of colorChannels) {
      addColorFunction(xmlParent, mode, colorChannel);
    }
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