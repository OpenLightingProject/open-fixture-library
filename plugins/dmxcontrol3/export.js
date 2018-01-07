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
 * Adds the dmx channels as functions to the specified xml file.
 * @param {!XMLDocument} xml The device definition to add the functions to.
 * @param {!Mode} mode The definition's mode.
 */
function addFunctions(xml, mode) {
  const xmlFunctions = xml.element('functions');

  let channelsToAdd = getSanitizedChannels();

  addMatrixFunction(xmlFunctions, mode, channelsToAdd);

  channelsToAdd = channelsToAdd.map(
    ch => (ch instanceof MatrixChannel ? ch.wrappedChannel : ch)
  );

  addColorFunctions(xmlFunctions, mode, channelsToAdd);
  addPositionFunctions(xmlFunctions, mode, channelsToAdd);

  /**
   * Sanitizes the channel list to be easily used later.
   * @returns {!Array.<Channel, MatrixChannel>} The given channels; switching channels are mapped to the the default channel, fine and null channels are excluded.
   */
  function getSanitizedChannels() {
    return mode.channels.map(ch => getSanitizedChannel(ch)).filter(ch => ch !== null);
  }

  /**
   * @param {AbstractChannel|MatrixChannel} channel Some channel of any type.
   * @returns {?Channel} A channel to be used instead of the given one; may be the same or null (to not include in definition).
   */
  function getSanitizedChannel(channel) {
    if (channel instanceof MatrixChannel && channel.wrappedChannel instanceof SwitchingChannel) {
      return getSanitizedChannel(channel.wrappedChannel.defaultChannel);
    }
    if (channel instanceof SwitchingChannel) {
      return getSanitizedChannel(channel.defaultChannel);
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
 * @param {!Array.<MatrixChannel, Channel>} remainingChannels List of all channels that haven't been processed already.
 */
function addMatrixFunction(xmlParent, mode, remainingChannels) {
  const matrix = mode.fixture.matrix;
  if (matrix === null) {
    // no matrix data in this fixture
    return;
  }

  const matrixChannels = remainingChannels.filter(ch => ch instanceof MatrixChannel);
  if (matrixChannels.length === 0) {
    // no matrix channels used in mode
    return;
  }

  const xmlMatrix = xmlParent.element('matrix');
  xmlMatrix.attribute('rows', matrix.pixelCountX);
  xmlMatrix.attribute('column', matrix.pixelCountY);

  const pixelKeys = matrix.getPixelKeysByOrder('X', 'Y', 'Z');
  const channelsPerPixel = pixelKeys.map(
    pixelKey => matrixChannels.filter(ch => ch.pixelKey === pixelKey)
  );

  const areAllRgb = channelsPerPixel.every(pixelChannels =>
    pixelChannels.some(ch => ch.wrappedChannel.color === 'Red') &&
    pixelChannels.some(ch => ch.wrappedChannel.color === 'Green') &&
    pixelChannels.some(ch => ch.wrappedChannel.color === 'Blue')
  );
  if (areAllRgb) {
    addColorMixingsToMatrix(xmlMatrix, mode, channelsPerPixel, remainingChannels, 'rgb');
    return;
  }

  const areAllCmy = channelsPerPixel.every(pixelChannels =>
    pixelChannels.some(ch => ch.wrappedChannel.color === 'Cyan') &&
    pixelChannels.some(ch => ch.wrappedChannel.color === 'Magenta') &&
    pixelChannels.some(ch => ch.wrappedChannel.color === 'Yellow')
  );
  if (areAllCmy) {
    addColorMixingsToMatrix(xmlMatrix, mode, channelsPerPixel, remainingChannels, 'cmy');
    return;
  }

  const areAllIntensity = matrixChannels.length === pixelKeys.length &&
    matrixChannels.every(ch => ch.wrappedChannel.type === 'Intensity');
  if (areAllIntensity) {
    xmlMatrix.attribute('monochrome', 'true');
    addDmxchannelAttributes(xmlMatrix, mode, matrixChannels[0].wrappedChannel);
    matrixChannels.forEach(ch => removeFromArray(remainingChannels, ch));
    return;

    // cameo Flash Matrix 250 is a good reference fixture for this case
  }
}

/**
 * Adds color mixing functions for all given color groups to the matrix
 * and removes color channels from channel list.
 * @param {!XMLElement} xmlMatrix The xml element in which the color mixing tags (all <rgb> or <cmy>) should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Array.<Channel>>} colorGroups The groups of Single Color channels to be added.
 * @param {!Array.<Channel>} remainingChannels List of all channels that haven't been processed already.
 * @param {('rgb'|'cmy')} colorMixing Which kind of color mixing this is.
 */
function addColorMixingsToMatrix(xmlMatrix, mode, colorGroups, remainingChannels, colorMixing) {
  for (let channels of colorGroups) {
    channels = channels.filter(ch => ch.wrappedChannel.type === 'Single Color');
    addColorMixingFunction(xmlMatrix, mode, channels.map(ch => ch.wrappedChannel), colorMixing);
    channels.forEach(ch => removeFromArray(remainingChannels, ch));
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
  const remainingColorChannels = remainingChannels.filter(ch => ch.type === 'Single Color');
  remainingColorChannels.forEach(ch => removeFromArray(remainingChannels, ch));

  const rgbGroups = getColorChannelGroups(remainingColorChannels, ['Red', 'Green', 'Blue']);
  const cmyGroups = getColorChannelGroups(remainingColorChannels, ['Cyan', 'Magenta', 'Yellow']);
  const colorGroups = rgbGroups.concat(cmyGroups);

  for (const colorChannel of remainingColorChannels) {
    const channelGroupWithSpace = colorGroups.find(
      group => group.every(ch => ch.color !== colorChannel.color)
    );
    if (channelGroupWithSpace) {
      channelGroupWithSpace.push(colorChannel);
    }
  }

  colorGroups.forEach(colorChannels =>
    colorChannels.forEach(ch => removeFromArray(remainingColorChannels, ch))
  );

  rgbGroups.forEach(rgbGroup => addColorMixingFunction(xmlParent, mode, rgbGroup, 'rgb'));
  cmyGroups.forEach(cmyGroup => addColorMixingFunction(xmlParent, mode, cmyGroup, 'cmy'));
  remainingColorChannels.forEach(channel => addColorFunction(xmlParent, mode, channel));
}

/**
 * Groups the given channels into RGB/CMY groups.
 * @param {!Array.<Channel>} colorChannels All Single Color channels to process.
 * @param {!Array.<string>} colors Which colors to group; either RGB or CMY colors.
 * @returns {!Array.<Array.<Channel>>} The RGB/CMY channel groups. Each subarray consists of colors.length channels.
 */
function getColorChannelGroups(colorChannels, colors) {
  colorChannels = colorChannels.filter(
    channel => colors.includes(channel.color)
  );
  const channelGroups = [];

  for (const colorChannel of colorChannels) {
    const channelGroupWithSpace = channelGroups.find(
      group => group.every(ch => ch.color !== colorChannel.color)
    );
    if (channelGroupWithSpace) {
      channelGroupWithSpace.push(colorChannel);
    }
    else {
      channelGroups.push([colorChannel]);
    }
  }

  const completeChannelGroups = channelGroups.filter(
    channelGroup => channelGroup.length === colors.length
  );

  return completeChannelGroups;
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
  addDmxchannelAttributes(xmlColor, mode, colorChannel);
}

/**
 * Finds Pan/Tilt channels in the given channel list, adds them to xml (as Position function, if possible)
 * and removes them from the given channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <position> tags should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} remainingChannels All channels that haven't been processed already.
 */
function addPositionFunctions(xmlParent, mode, remainingChannels) {
  const remainingPanChannels = remainingChannels.filter(ch => ch.type === 'Pan');
  const remainingTiltChannels = remainingChannels.filter(ch => ch.type === 'Tilt');

  // we'll handle all of them
  remainingPanChannels.concat(remainingTiltChannels).forEach(
    ch => removeFromArray(remainingChannels, ch)
  );

  const positionGroups = [];
  while (remainingPanChannels.length > 0 && remainingTiltChannels.length > 0) {
    // save first elements of arrays and remove them from the arrays
    positionGroups.push([remainingPanChannels.shift(), remainingTiltChannels.shift()]);
  }

  positionGroups.forEach(
    ([pan, tilt]) => addPositionFunction(xmlParent, mode, pan, tilt)
  );
  remainingPanChannels.concat(remainingTiltChannels).forEach(
    panTiltChannel => addPanTiltFunction(xmlParent, mode, panTiltChannel)
  );
}

/**
 * Adds a position function for the given Pan and Tilt channel.
 * @param {!XMLElement} xmlParent The xml element in which the <position> tag should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} panChannel The channel of type Pan to use.
 * @param {!Channel} tiltChannel The channel of type Tilt to use.
 */
function addPositionFunction(xmlParent, mode, panChannel, tiltChannel) {
  const xmlPosition = xmlParent.element('position');

  addPanTiltFunction(xmlPosition, mode, panChannel);
  addPanTiltFunction(xmlPosition, mode, tiltChannel);
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
  addDmxchannelAttributes(xmlFunc, mode, channel);

  const focusMax = isPan ? 'focusPanMax' : 'focusTiltMax';
  if (mode.physical !== null && mode.physical[focusMax] !== null) {
    xmlFunc.element('range').attribute('range', mode.physical[focusMax]);
  }
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

/**
 * Removes the given item from array using splice and indexOf. Attention: If item is duplicated in array, first occurence is removed!
 * @param {!Array} arr The array from which to remove the item.
 * @param {*} item The item to remove from the array.
 */
function removeFromArray(arr, item) {
  arr.splice(arr.indexOf(item), 1);
}