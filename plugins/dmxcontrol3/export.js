const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannel,
  MatrixChannelReference,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../../lib/model.js`);
/* eslint-enable no-unused-vars */

module.exports.name = `DMXControl 3 (DDF3)`;
module.exports.version = `0.1.0`;

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
        .declaration(`1.0`, `utf-8`)
        .element({
          device: {
            '@type': `DMXDevice`,
            '@dmxaddresscount': mode.channelKeys.length,
            '@dmxcversion': 3,
            '@ddfversion': fixture.meta.lastModifyDate.toISOString().split(`T`)[0]
          }
        });

      addInformation(xml, mode);
      addFunctions(xml, mode);

      deviceDefinitions.push({
        name: sanitize(`${fixture.manufacturer.key}-${fixture.key}-${(mode.shortName)}.xml`).replace(/\s+/g, `-`),
        content: xml.end({
          pretty: true,
          indent: `  `
        }),
        mimetype: `application/xml`,
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
  const xmlInfo = xml.element(`information`);
  xmlInfo.element(`model`).text(mode.fixture.name);
  xmlInfo.element(`vendor`).text(mode.fixture.manufacturer.name);
  xmlInfo.element(`author`).text(mode.fixture.meta.authors.join(`, `));
  xmlInfo.element(`mode`).text(mode.name);

  if (mode.fixture.hasComment) {
    xmlInfo.element(`comment`).text(mode.fixture.comment);
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

    const xmlFunctionsContainer = xml.element(`functions`);

    if (pixelKey === null && mode.fixture.categories.includes(`Matrix`)) {
      addMatrix(xmlFunctionsContainer, mode, channelsPerPixel);
    }

    if (pixelKey !== null) {
      xmlFunctionsContainer.comment(pixelKey);
    }

    let xmlFunctions = [];
    pixelChannels.forEach(ch => (xmlFunctions = xmlFunctions.concat(getXmlFunctionsFromChannel(ch))));

    // TODO: group xmlFunctions (e.g. rgb, position, goboindex into gobowheel, etc.)

    xmlFunctions.forEach(xmlFunction => xmlFunctionsContainer.importDocument(xmlFunction));
  }

  /**
   * @returns {!ChannelsPerPixel} Each pixel key pointing to its unwrapped matrix channels. null points to all non-matrix channels.
   */
  function getChannelsPerPixel() {
    const channelsPerPixel = new Map();

    channelsPerPixel.set(null, []);

    const matrix = mode.fixture.matrix;
    if (matrix !== null) {
      const pixelKeys = matrix.pixelGroupKeys.concat(matrix.getPixelKeysByOrder(`X`, `Y`, `Z`));
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
    if (channel instanceof MatrixChannel && !(channel.wrappedChannel instanceof Channel)) {
      return getUsableChannel(channel.wrappedChannel);
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

  /**
   * @param {!Channel} channel The channel that should be represented as one or more DMXControl functions.
   * @returns {!Array.<XMLElement>} Functions created by this channel. They are not automatically grouped together.
   */
  function getXmlFunctionsFromChannel(channel) {
    const functionToCapabilities = {};

    for (const cap of channel.capabilities) {
      const properFunction = Object.keys(functions).find(
        key => functions[key].isCapSuitable(cap)
      );

      if (properFunction) {
        if (!Object.keys(functionToCapabilities).includes(properFunction)) {
          functionToCapabilities[properFunction] = [];
        }
        functionToCapabilities[properFunction].push(cap);
      }
    }

    let xmlFunctions = [];
    Object.keys(functionToCapabilities).forEach(functionKey => {
      const caps = functionToCapabilities[functionKey];
      xmlFunctions = xmlFunctions.concat(functions[functionKey].create(channel, caps));
    });
    xmlFunctions.forEach(xmlFunc => addChannelAttributes(xmlFunc, mode, channel));

    return xmlFunctions;
  }
}

const functions = {
  dimmer: {
    isCapSuitable: cap => cap.type === `Intensity`,
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`dimmer`);

      if (channel.capabilities.length > 1 || caps[0].brightness[0].number !== 0) {
        const normalizedCaps = getNormalizedCapabilities(caps, `brightness`, 100, `%`);
        normalizedCaps.forEach(cap => {
          const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
          xmlCap.attribute(`minval`, Math.min(cap.brightness[0].number, 100));
          xmlCap.attribute(`maxval`, Math.min(cap.brightness[1].number, 100));
          xmlDimmer.importDocument(xmlCap);
        });
      }

      return xmlDimmer;
    }
  },
  shutter: {
    isCapSuitable: cap => cap.type === `ShutterStrobe` && [`Open`, `Closed`].includes(cap.shutterEffect),
    create: (channel, caps) => {
      const xmlShutter = xmlbuilder.create(`shutter`);

      caps.forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap);
        xmlCap.attribute(`type`, cap.shutterEffect.toLowerCase());
        xmlShutter.importDocument(xmlCap);
      });

      return xmlShutter;
    }
  },
  strobe: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  strobeDuration: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  pan: {
    isCapSuitable: cap => cap.type === `Pan`,
    create: (channel, caps) => {
      const xmlPan = xmlbuilder.create(`pan`);

      caps.forEach(cap => {
        xmlPan.element(`range`, {
          range: cap.angle[1].number - cap.angle[0].number
        });
      });

      return xmlPan;
    }
  },
  tilt: {
    isCapSuitable: cap => [`Pan`, `Tilt`].includes(cap.type),
    create: (channel, caps) => {
      const xmlTilt = xmlbuilder.create(`tilt`);

      caps.forEach(cap => {
        xmlTilt.element(`range`, {
          range: cap.angle[1].number - cap.angle[0].number
        });
      });

      return xmlTilt;
    }
  },
  panTiltSpeed: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  color: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  colorWheel: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  colorTemperature: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboWheel: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboIndex: { // stencil rotation angle
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboRotation: { // stencil rotation speed
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboShake: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  focus: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  frost: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  iris: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  zoom: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  prism: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  prismIndex: { // rotation angle
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  prismRotation: { // rotation speed
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  fog: { // fog output
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  index: { // rotation angle
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  rotation: { // rotation speed
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  rawStep: { // only steps
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  raw: { // steps and ranges
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  }
};

/**
 * @typedef {object} NormalizedCapability
 * @property {!Capability} capObject
 * @property {!string} unit
 * @property {!number} startValue
 * @property {!number} endValue
 */

/**
 * Converts all property values to the proper unit and scales them to fit into the maximum value.
 * @param {!Array.<Capability>} caps Array of capabilities that use the given property.
 * @param {!string} property Name of the property whose values should be normalized.
 * @param {!number} maximumValue The highest possible value in DMXControl, in the given unit.
 * @param {!string} properUnit The unit of the maximum value. Must be a base unit (i. e. no `ms` but `s`) or `%`.
 * @returns {!Array.<NormalizedCapability>} Array of objects wrapping the original capabilities.
 */
function getNormalizedCapabilities(caps, property, maximumValue, properUnit) {
  const normalizedCaps = caps.map(cap => {
    const [startEntity, endEntity] = cap[property];
    let unit = startEntity.unit;

    let [startValue, endValue] = [startEntity.number, endEntity.number];

    const unitConversions = {
      ms: [`s`, 1000],
      bpm: [`Hz`, 1 / 60],
      rpm: [`Hz`, 1 / 60]
    };
    if (Object.keys(unitConversions).includes(unit)) {
      const [newUnit, factor] = unitConversions[unit];
      unit = newUnit;
      startValue *= factor;
      endValue *= factor;
    }

    return {
      capObject: cap,
      unit,
      startValue,
      endValue
    };
  });

  const capsWithProperUnit = normalizedCaps.filter(cap => cap.unit === properUnit);
  const maxValueWithProperUnit = Math.max(...(capsWithProperUnit.map(cap => Math.max(cap.startValue, cap.endValue))));
  if (maxValueWithProperUnit > maximumValue) {
    capsWithProperUnit.forEach(cap => {
      cap.startValue = cap.startValue * maxValueWithProperUnit / maximumValue;
      cap.endValue = cap.endValue * maxValueWithProperUnit / maximumValue;
    });
  }


  // they should all be of the same (wrong) unit, as we converted to the base unit above
  const capsWithWrongUnit = normalizedCaps.filter(cap => cap.unit !== properUnit);
  const maxValueWithWrongUnit = Math.max(...(capsWithWrongUnit.map(cap => Math.max(cap.startValue, cap.endValue))));
  capsWithWrongUnit.forEach(cap => {
    cap.unit = properUnit;
    cap.startValue = cap.startValue * maxValueWithWrongUnit / maximumValue;
    cap.endValue = cap.endValue * maxValueWithWrongUnit / maximumValue;
  });

  return normalizedCaps;
}

/**
 * This function already handles swapping DMX start/end if the given start/end value is inverted (i.e. decreasing).
 * @param {!Capability} cap The capability to use as data source.
 * @param {?number} startValue The start value of an start/end entity, e.g. speedStart. Unit can be freely choosen. Omit if minval/maxval should not be added.
 * @param {*} endValue The end value of an start/end entity, e.g. speedEnd. Unit can be freely choosen. Omit if minval/maxval should not be added.
 * @returns {XMLElement} A <step> or <range> with mindmx, maxdmx and, optionally, minval and maxval attributes.
 */
function getBaseXmlCapability(cap, startValue = null, endValue = null) {
  const dmxRange = cap.getDmxRangeWithFineness(0);
  let [dmxStart, dmxEnd] = [dmxRange.start, dmxRange.end];

  if (startValue && startValue > endValue) {
    [startValue, endValue] = [endValue, startValue];
    [dmxStart, dmxEnd] = [dmxEnd, dmxStart];
  }

  const xmlCap = xmlbuilder.create(cap.isStep ? `step` : `range`);
  xmlCap.attribute(`mindmx`, dmxStart);
  xmlCap.attribute(`maxdmx`, dmxEnd);

  if (startValue) {
    xmlCap.attribute(`minval`, startValue);
    xmlCap.attribute(`maxval`, endValue);
  }

  return xmlCap;
}


/**
 * Adds the matrix function to the xml and inserts suitable color mixings from matrix channels.
 * @param {!XMLElement} xmlParent The xml element in which the <matrix> tag should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!ChannelsPerPixel} channelsPerPixel Pixel keys pointing to its channels.
 */
function addMatrix(xmlParent, mode, channelsPerPixel) {
  const matrix = mode.fixture.matrix;
  if (matrix === null) {
    // no matrix data in this fixture
    return;
  }

  const usedPixelKeys = matrix.getPixelKeysByOrder(`X`, `Y`, `Z`).filter(
    pixelKey => channelsPerPixel.get(pixelKey).length > 0
  );
  if (usedPixelKeys.length === 0) {
    // no matrix channels used in mode
    return;
  }

  const xmlMatrix = xmlParent.element(`matrix`);
  xmlMatrix.attribute(`rows`, matrix.pixelCountX);
  xmlMatrix.attribute(`column`, matrix.pixelCountY);

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
    isMonochrome = isMonochrome && channels.length === 1 && channels[0].type === `Intensity`;
  }


  const colorMixing = isRGB(referenceColors) ? `rgb` : (isCMY(referenceColors) ? `cmy` : null);
  if (sameColors && colorMixing !== null) {
    for (const pixelKey of usedPixelKeys) {
      const pixelChannels = channelsPerPixel.get(pixelKey);
      const colorChannels = pixelChannels.filter(ch => ch.type === `Single Color`);
      colorChannels.forEach(ch => removeFromArray(pixelChannels, ch));
      addColorMixing(xmlMatrix, mode, colorChannels, colorMixing);
    }
  }
  else if (isMonochrome) {
    // cameo Flash Matrix 250 is a good reference fixture for this case

    allChannels.sort((a, b) => {
      const indexA = mode.getChannelIndex(a);
      const indexB = mode.getChannelIndex(b);
      return indexA - indexB;
    });

    xmlMatrix.attribute(`monochrome`, `true`);
    addChannelAttributes(xmlMatrix, mode, allChannels[0]);

    // clear pixelKeys' channel lists
    usedPixelKeys.forEach(pixelKey => (channelsPerPixel.get(pixelKey).length = 0));
  }
}

/**
 * Finds color channels in the given channel list, adds them to xml (as RGB/CMY function, if possible)
 * and removes them from the given channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <rgb>/<blue>/<amber>/... tags should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} remainingChannels All channels that haven't been processed already.
 */
function addColors(xmlParent, mode, remainingChannels) {
  // search color channels and remove them from color list as we'll handle all of them
  const colorChannels = remainingChannels.filter(ch => ch.type === `Single Color`);
  colorChannels.forEach(ch => removeFromArray(remainingChannels, ch));
  const colors = getColors(colorChannels);

  if (isCMY(colors) && isRGB(colors)) {
    const cmyColors = [`Cyan`, `Magenta`, `Yellow`];
    const cmyColorChannels = colorChannels.filter(ch => cmyColors.includes(ch.color)); // cmy
    const rgbColorChannels = colorChannels.filter(ch => !cmyColors.includes(ch.color)); // rgb + w + a + uv + ...

    addColorMixing(xmlParent, mode, cmyColorChannels, `rgb`);
    addColorMixing(xmlParent, mode, rgbColorChannels, `cmy`);
  }
  else if (isCMY(colors) || isRGB(colors)) {
    addColorMixing(xmlParent, mode, colorChannels, isRGB(colors) ? `rgb` : `cmy`);
  }
  else {
    colorChannels.forEach(channel => addColor(xmlParent, mode, channel));
  }
}

/**
 * Adds a color mixing function for the given channels
 * @param {!XMLElement} xmlParent The xml element in which the color mixing (<rgb> or <cmy>) should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} colorChannels The Single Color channels to be added.
 * @param {('rgb'|'cmy')} colorMixing Which kind of color mixing this is.
 */
function addColorMixing(xmlParent, mode, colorChannels, colorMixing) {
  const xmlColorMixing = xmlParent.element(colorMixing);

  for (const colorChannel of colorChannels) {
    addColor(xmlColorMixing, mode, colorChannel);
  }
}

/**
 * Adds a color function for the given channel.
 * @param {!XMLElement} xmlParent The xml element in which the color tag should be inserted, probably <rgb> or <cmy>.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} colorChannel The Single Color channel which should be added.
 */
function addColor(xmlParent, mode, colorChannel) {
  const xmlColor = xmlParent.element(colorChannel.color.toLowerCase());
  addChannelAttributes(xmlColor, mode, colorChannel);
}

/**
 * @param {!Array.<Channel>} channels List of channels to search for color channels.
 * @returns {Set.<string>} Each used color.
 */
function getColors(channels) {
  const colors = new Set();
  for (const channel of channels.filter(ch => ch.type === `Single Color`)) {
    colors.add(channel.color);
  }
  return colors;
}

/**
 * @param {!Set.<string>} colors Used colors in channels.
 * @returns {!boolean} Whether the given colors contain all needed RGB colors.
 */
function isRGB(colors) {
  const hasRed = colors.has(`Red`);
  const hasGreen = colors.has(`Green`);
  const hasBlue = colors.has(`Blue`);
  return hasRed && hasGreen && hasBlue;
}

/**
 * @param {!Set.<string>} colors Used colors in channels.
 * @returns {!boolean} Whether the given colors contain all needed CMY colors.
 */
function isCMY(colors) {
  const hasCyan = colors.has(`Cyan`);
  const hasMagenta = colors.has(`Magenta`);
  const hasYellow = colors.has(`Yellow`);
  return hasCyan && hasMagenta && hasYellow;
}

/**
 * Finds dimmer channels in the given channel list, adds them to xml
 * and removes them from the given channel list.
 * @param {!XMLElement} xmlParent The xml element in which the <dimmer> tags should be inserted.
 * @param {!Mode} mode The definition's mode.
 * @param {!Array.<Channel>} remainingChannels All channels that haven't been processed already.
 */
function addDimmer(xmlParent, mode, remainingChannels) {
  const dimmerChannels = remainingChannels.filter(ch => {
    if (ch.type === `Intensity`) {
      const name = ch.name.toLowerCase();
      const keyWords = [`dimmer`, `intensity`, `brightness`];
      return keyWords.some(keyword => name.includes(keyword));
    }
    return false;
  });

  for (const dimmerChannel of dimmerChannels) {
    const xmlDimmer = xmlParent.element(`dimmer`);
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
function addPosition(xmlParent, mode, remainingChannels) {
  const panChannel = remainingChannels.find(ch => ch.type === `Pan`);
  const tiltChannel = remainingChannels.find(ch => ch.type === `Tilt`);

  if (panChannel !== undefined && tiltChannel !== undefined) {
    const xmlPosition = xmlParent.element(`position`);

    addPanTilt(xmlPosition, mode, panChannel);
    addPanTilt(xmlPosition, mode, tiltChannel);
  }
  else if ((panChannel || tiltChannel) !== undefined) {
    // at least only Pan or only Tilt is specified
    addPanTilt(xmlParent, mode, (panChannel || tiltChannel));
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
function addPanTilt(xmlParent, mode, channel) {
  const isPan = channel.type === `Pan`;

  const xmlFunc = xmlParent.element(isPan ? `pan` : `tilt`);
  addChannelAttributes(xmlFunc, mode, channel);

  const focusMax = isPan ? `focusPanMax` : `focusTiltMax`;
  if (mode.physical !== null && mode.physical[focusMax] !== null) {
    xmlFunc.element(`range`).attribute(`range`, mode.physical[focusMax]);
  }
}

/**
 * Adds name attribute, dmxchannel attribute and attributes for fine channels (if used in mode) to the given channel function.
 * @param {!XMLElement} xmlElement The xml element to which the attributes should be added.
 * @param {!Mode} mode The definition's mode.
 * @param {!Channel} channel The channel whose data is used.
 */
function addChannelAttributes(xmlElement, mode, channel) {
  xmlElement.attribute(`name`, channel.name);

  const index = mode.getChannelIndex(channel);
  xmlElement.attribute(`dmxchannel`, index);

  const fineIndices = channel.fineChannels.map(
    fineCh => mode.getChannelIndex(fineCh)
  );

  if (fineIndices.length > 0 && fineIndices[0] !== -1) {
    xmlElement.attribute(`finedmxchannel`, fineIndices[0]);

    if (fineIndices.length > 1 && fineIndices[1] !== -1) {
      xmlElement.attribute(`ultradmxchannel`, fineIndices[1]);

      if (fineIndices.length > 2 && fineIndices[2] !== -1) {
        xmlElement.attribute(`ultrafinedmxchannel`, fineIndices[2]);
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
