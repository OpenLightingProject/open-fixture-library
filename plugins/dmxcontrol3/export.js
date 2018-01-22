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
        mimetype: 'application/xml',
        fixtures: [fixture],
        mode: mode.shortName
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
 * @typedef {Map.<(string|null), Array.<Channel>>} ChannelsPerPixel
 */

/**
 * Adds the dmx channels as functions to the specified xml file.
 * @param {!XMLDocument} xml The device definition to add the functions to.
 * @param {!Mode} mode The definition's mode.
 */
function addFunctions(xml, mode) {
  const channelsPerPixel = getChannelsPerPixel();

  for (const [pixelKey, pixelChannels] of channelsPerPixel) {
    if (pixelKey !== null && pixelChannels.length === 0) {
      continue;
    }

    const xmlFunctions = xml.element('functions');

    if (pixelKey === null && mode.fixture.categories.includes('Matrix')) {
      addMatrixFunction(xmlFunctions, mode, channelsPerPixel);
    }

    if (pixelKey !== null) {
      xmlFunctions.comment(pixelKey);
    }

    addColorFunctions(xmlFunctions, mode, pixelChannels);
    addDimmerFunctions(xmlFunctions, mode, pixelChannels);
    addPositionFunctions(xmlFunctions, mode, pixelChannels);
  }

  /**
   * @returns {!ChannelsPerPixel} Each pixel key pointing to its unwrapped matrix channels. null points to all non-matrix channels.
   */
  function getChannelsPerPixel() {
    const channelsPerPixel = new Map();

    channelsPerPixel.set(null, []);

    const matrix = mode.fixture.matrix;
    if (matrix !== null) {
      const pixelKeys = matrix.pixelGroupKeys.concat(matrix.getPixelKeysByOrder('X', 'Y', 'Z'));
      pixelKeys.forEach(key => channelsPerPixel.set(key, []));
    }

    for (const channel of getUsableChannels()) {
      if (channel instanceof MatrixChannel) {
        channelsPerPixel.get(channel.pixelKey).push(channel.wrappedChannel);
      }
      else {
        channelsPerPixel.get(null).push(channel);
      }
    }

    return channelsPerPixel;
  }

  /**
   * @returns {!Array.<Channel, MatrixChannel>} A list of processable channels; switching channels are mapped to the the default channel, fine and null channels are excluded.
   */
  function getUsableChannels() {
    return mode.channels.map(ch => getUsableChannel(ch)).filter(ch => ch !== null);
  }

  /**
   * @param {AbstractChannel|MatrixChannel} channel Some channel of any type.
   * @returns {?Channel} A channel to be used instead of the given one; may be the same or null (to not include in definition).
   */
  function getUsableChannel(channel) {
    if (channel instanceof MatrixChannel && channel.wrappedChannel instanceof SwitchingChannel) {
      return getUsableChannel(channel.wrappedChannel.defaultChannel);
    }
    if (channel instanceof SwitchingChannel) {
      return getUsableChannel(channel.defaultChannel);
    }
    if (channel instanceof FineChannel || channel instanceof NullChannel) {
      // fine channels are handled by addDmxchannelAttributes(...), null channels are simply ignored
      return null;
    }
    return channel;
  }
}

/**
 * Adds the matrix function to the xml and inserts suitable color mixings from matrix channels.
 * @param {!XMLElement} xmlParent The xml element in which the <matrix> tag should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!ChannelsPerPixel} channelsPerPixel Pixel keys pointing to its channels.
 */
function addMatrixFunction(xmlParent, mode, channelsPerPixel) {
  const matrix = mode.fixture.matrix;
  if (matrix === null) {
    // no matrix data in this fixture
    return;
  }

  const usedPixelKeys = matrix.getPixelKeysByOrder('X', 'Y', 'Z').filter(
    pixelKey => channelsPerPixel.get(pixelKey).length > 0
  );
  if (usedPixelKeys.length === 0) {
    // no matrix channels used in mode
    return;
  }

  const xmlMatrix = xmlParent.element('matrix');
  xmlMatrix.attribute('rows', matrix.pixelCountX);
  xmlMatrix.attribute('column', matrix.pixelCountY);

  let allChannels = [];
  let referenceColors = null;
  let sameColors = true;
  let isMonochrome = true;

  for (const pixelKey of usedPixelKeys) {
    const channels = channelsPerPixel.get(pixelKey);
    allChannels = allChannels.concat(channels[0]);

    if (referenceColors === null) {
      referenceColors = getColors(channels);
    }

    sameColors = sameColors && setsEqual(referenceColors, getColors(channels));
    isMonochrome = isMonochrome && channels.length === 1 && channels[0].type === 'Intensity';
  }


  const colorMixing = isRGB(referenceColors) ? 'rgb' : (isCMY(referenceColors) ? 'cmy' : null);
  if (sameColors && colorMixing !== null) {
    for (const pixelKey of usedPixelKeys) {
      const pixelChannels = channelsPerPixel.get(pixelKey);
      const colorChannels = pixelChannels.filter(ch => ch.type === 'Single Color');
      colorChannels.forEach(ch => removeFromArray(pixelChannels, ch));
      addColorMixingFunction(xmlMatrix, mode, colorChannels, colorMixing);
    }
  }
  else if (isMonochrome) {
    // cameo Flash Matrix 250 is a good reference fixture for this case

    allChannels.sort((a, b) => {
      const indexA = mode.getChannelIndex(a);
      const indexB = mode.getChannelIndex(b);
      return indexA - indexB;
    });

    xmlMatrix.attribute('monochrome', 'true');
    addChannelAttributes(xmlMatrix, mode, allChannels[0]);

    // clear pixelKeys' channel lists
    usedPixelKeys.forEach(pixelKey => channelsPerPixel.get(pixelKey).length = 0);
  }
}

/**
 * Finds color channels in the given channel list, adds them to xml (as RGB/CMY function, if possible)
 * and removes them from the given channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <rgb>/<blue>/<amber>/... tags should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} remainingChannels All channels that haven't been processed already.
 */
function addColorFunctions(xmlParent, mode, remainingChannels) {
  // search color channels and remove them from color list as we'll handle all of them
  const colorChannels = remainingChannels.filter(ch => ch.type === 'Single Color');
  colorChannels.forEach(ch => removeFromArray(remainingChannels, ch));
  const colors = getColors(colorChannels);

  if (isCMY(colors) && isRGB(colors)) {
    const cmyColors = ['Cyan', 'Magenta', 'Yellow'];
    const cmyColorChannels = colorChannels.filter(ch => cmyColors.includes(ch.color)); // cmy
    const rgbColorChannels = colorChannels.filter(ch => !cmyColors.includes(ch.color)); // rgb + w + a + uv + ...

    addColorMixingFunction(xmlParent, mode, cmyColorChannels, 'rgb');
    addColorMixingFunction(xmlParent, mode, rgbColorChannels, 'cmy');
  }
  else if (isCMY(colors) || isRGB(colors)) {
    addColorMixingFunction(xmlParent, mode, colorChannels, isRGB(colors) ? 'rgb' : 'cmy');
  }
  else {
    colorChannels.forEach(channel => addColorFunction(xmlParent, mode, channel));
  }
}

/**
 * Adds a color mixing function for the given channels
 * @param {!XMLElement} xmlParent The xml element in which the color mixing (<rgb> or <cmy>) should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} colorChannels The Single Color channels to be added.
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
  addChannelAttributes(xmlColor, mode, colorChannel);
}

/**
 * @param {!Array.<Channel>} channels List of channels to search for color channels.
 * @returns {Set.<string>} Each used color.
 */
function getColors(channels) {
  const colors = new Set();
  for (const channel of channels.filter(ch => ch.type === 'Single Color')) {
    colors.add(channel.color);
  }
  return colors;
}

/**
 * @param {!Set.<string>} colors Used colors in channels.
 * @returns {!boolean} Whether the given colors contain all needed RGB colors.
 */
function isRGB(colors) {
  const hasRed = colors.has('Red');
  const hasGreen = colors.has('Green');
  const hasBlue = colors.has('Blue');
  return hasRed && hasGreen && hasBlue;
}

/**
 * @param {!Set.<string>} colors Used colors in channels.
 * @returns {!boolean} Whether the given colors contain all needed CMY colors.
 */
function isCMY(colors) {
  const hasCyan = colors.has('Cyan');
  const hasMagenta = colors.has('Magenta');
  const hasYellow = colors.has('Yellow');
  return hasCyan && hasMagenta && hasYellow;
}

/**
 * Finds dimmer channels in the given channel list, adds them to xml
 * and removes them from the given channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <dimmer> tags should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} remainingChannels All channels that haven't been processed already.
 */
function addDimmerFunctions(xmlParent, mode, remainingChannels) {
  const dimmerChannels = remainingChannels.filter(ch => {
    if (ch.type === 'Intensity') {
      const name = ch.name.toLowerCase();
      const keyWords = ['dimmer', 'intensity', 'brightness'];
      return keyWords.some(keyword => name.includes(keyword));
    }
    return false;
  });

  for (const dimmerChannel of dimmerChannels) {
    const xmlDimmer = xmlParent.element('dimmer');
    addChannelAttributes(xmlDimmer, mode, dimmerChannel);
    removeFromArray(remainingChannels, dimmerChannel);
  }
}

/**
 * Finds Pan/Tilt channels in the given channel list, adds them to xml (as Position function, if possible)
 * and removes them from the given channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <position> tag should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} remainingChannels All channels that haven't been processed already.
 */
function addPositionFunctions(xmlParent, mode, remainingChannels) {
  const panChannel = remainingChannels.find(ch => ch.type === 'Pan');
  const tiltChannel = remainingChannels.find(ch => ch.type === 'Tilt');

  if (panChannel !== undefined && tiltChannel !== undefined) {
    const xmlPosition = xmlParent.element('position');

    addPanTiltFunction(xmlPosition, mode, panChannel);
    addPanTiltFunction(xmlPosition, mode, tiltChannel);
  }
  else if ((panChannel || tiltChannel) !== undefined) {
    // at least only Pan or only Tilt is specified
    addPanTiltFunction(xmlParent, mode, (panChannel || tiltChannel));
  }

  removeFromArray(remainingChannels, panChannel);
  removeFromArray(remainingChannels, tiltChannel);
}

/**
 * Adds a pan or tilt function for the given Pan or Tilt channel.
 * @param {!XMLElement} xmlParent The xml element in which the <pan>/<titl> tag should be inserted, probably <position>.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} channel The channel of type Pan or Tilt to use.
 */
function addPanTiltFunction(xmlParent, mode, channel) {
  const isPan = channel.type === 'Pan';

  const xmlFunc = xmlParent.element(isPan ? 'pan' : 'tilt');
  addChannelAttributes(xmlFunc, mode, channel);

  const focusMax = isPan ? 'focusPanMax' : 'focusTiltMax';
  if (mode.physical !== null && mode.physical[focusMax] !== null) {
    xmlFunc.element('range').attribute('range', mode.physical[focusMax]);
  }
}

/**
 * Adds name attribute, dmxchannel attribute and attributes for fine channels (if used in mode) to the given channel function.
 * @param {!XMLElement} xmlElement The xml element to which the attributes should be added.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} channel The channel whose data is used.
 */
function addChannelAttributes(xmlElement, mode, channel) {
  xmlElement.attribute('name', channel.name);

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

/**
 * Removes the given item from array using splice and indexOf. Attention: If item is duplicated in array, first occurence is removed!
 * @param {!Array} arr The array from which to remove the item.
 * @param {*} item The item to remove from the array.
 */
function removeFromArray(arr, item) {
  arr.splice(arr.indexOf(item), 1);
}

/**
 * @param {!Set} set1 First Set to compare.
 * @param {!Set} set2 Second Set to compare.
 * @returns {!boolean} Whether both Sets have equal size and their items do strictly equal.
 */
function setsEqual(set1, set2) {
  let equalItems = true;
  for (const value of set1) {
    equalItems = equalItems && set2.has(value);
  }

  return set1.size === set2.size && equalItems;
}