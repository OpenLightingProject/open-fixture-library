const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

const {
  CoarseChannel,
  FineChannel,
  SwitchingChannel
} = require(`../../lib/model.js`);

module.exports.name = `D::Light`;
module.exports.version = `0.1.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<Array.<object>, Error>} The generated files.
*/
module.exports.export = function exportDLight(fixtures, options) {
  const deviceFiles = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      const xml = xmlbuilder.begin()
        .declaration(`1.0`)
        .element({
          Device: {
            'OFL_Export': {
              '@id': module.exports.version,
              '#text': fixture.url
            },
            frames: {
              '@id': mode.channels.length
            },
            ManufacturerName: fixture.manufacturer.name,
            ModelName: `${fixture.name} (${mode.name})`,
            creationDate: fixture.meta.createDate.toISOString().split(`T`)[0]
          }
        })
        .element(`Attributes`);

      // channels are grouped by their channel type which is called AttributesDefinition in D::Light
      const channelsByAttribute = getChannelsByAttribute(mode.channels);
      for (const attribute of Object.keys(channelsByAttribute)) {
        addAttribute(xml, mode, attribute, channelsByAttribute[attribute]);
      }

      deviceFiles.push({
        name: `${fixture.manufacturer.key}/${fixture.key}-${sanitize(mode.shortName)}.xml`,
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

  return Promise.resolve(deviceFiles);
};

/**
 * Channels are grouped in attributes in D::Light.
 * This function adds the given attribute group along with its channels to the given XML.
 * @param {XMLElement} xml The XML parent element.
 * @param {Mode} mode The fixture's mode that this definition is representing.
 * @param {string} attribute A D::Light attribute name.
 * @param {Array.<AbstractChannel>} channels All channels of the mode that are associated to the given attribute name.
 */
function addAttribute(xml, mode, attribute, channels) {
  const xmlAttribute = xml.element({
    AttributesDefinition: {
      '@id': attribute,
      '@length': channels.length
    }
  });

  channels.forEach((channel, index) => {
    const xmlChannel = xmlAttribute.element({
      ThisAttribute: {
        '@id': index,
        HOME: {
          '@id': getDefaultValue(getUsableChannel(channel))
        },
        addressIndex: {
          '@id': mode.getChannelIndex(channel)
        },
        parameterName: {
          '@id': getParameterName(channel)
        },
        minLevel: {
          '@id': 0
        },
        maxLevel: {
          '@id': 255
        }
      }
    });

    channel = getUsableChannel(channel);

    let xmlCapabilities;
    if (channel instanceof CoarseChannel) {
      const caps = channel.capabilities;

      xmlCapabilities = xmlChannel.element({
        Definitions: {
          '@index': caps.length
        }
      });

      caps.forEach(addCapability);
    }

    /**
     * Adds an XML element for the given capability to the XML capability container.
     * @param {Capability} cap A capability of a channels capability list.
     */
    function addCapability(cap) {
      let hold = `0`;

      if (cap.hold) {
        if (cap.hold.unit === `ms`) {
          hold = cap.hold.number;
        }
        else if (cap.hold.unit === `s`) {
          hold = cap.hold.number * 1000;
        }
      }

      xmlCapabilities.element({
        name: {
          '@min': cap.dmxRange.start,
          '@max': cap.dmxRange.end,
          '@snap': cap.menuClickDmxValue,
          '@timeHolder': hold,
          '@dummy': `0`,
          '#text': cap.name
        }
      });
    }
  });

  /**
   * @param {AbstractChannel} channel Any kind of channel, e.g. an item of a mode's channel list.
   * @returns {string} The parameter name (i. e. channel name) that should be used for this channel in D::Light.
   */
  function getParameterName(channel) {
    const uniqueName = channel.uniqueName;

    channel = getUsableChannel(channel);

    if (channel instanceof FineChannel) {
      // for fine channels, this is simply the coarse channel's index
      return `${mode.getChannelIndex(channel.coarseChannel.key) + 1}`;
    }

    switch (attribute) {
      case `FOCUS`:
        return channel.type.toUpperCase(); // PAN or TILT

      // in all other attributes, custom text is allowed
      // but we need to use another name syntax
      default:
        return uniqueName
          .toUpperCase()
          .replace(/ /g, `_`)
          .replace(/\//g, `|`)
          .replace(/COLOR/g, `COLOUR`);
    }
  }
}

/**
 * @param {Channel|FineChannel} channel A usable channel, i. e. no matrix or switching channels.
 * @returns {number} The DMX value this channel should be set to as default.
 */
function getDefaultValue(channel) {
  if (channel instanceof FineChannel) {
    return channel.defaultValue;
  }

  return channel.getDefaultValueWithResolution(CoarseChannel.RESOLUTION_8BIT);
}

/**
 * @param {AbstractChannel} channel Any kind of channel, e.g. an item of a mode's channel list.
 * @returns {Channel|FineChannel} Switching channels resolved to their default channel.
 */
function getUsableChannel(channel) {
  if (channel instanceof SwitchingChannel) {
    return channel.defaultChannel;
  }

  return channel;
}

/**
 * @param {Array.<AbstractChannel>} channels List of channels, e.g. from a mode's channel list.
 * @returns {object.<string, AbstractChannel>} D::Light attribute names mapped to the corresponding channels of the given list. All channels are included once.
 */
function getChannelsByAttribute(channels) {
  const channelsByAttribute = {
    'INTENSITY': [],
    'COLOUR': [],
    'FOCUS': [],
    'BEAM': [],
    'BLADE': [],
    'EFFECT': [],
    'CONTROL': [],
    'EXTRA': [],
    'FINE': []
  };

  for (const channel of channels) {
    channelsByAttribute[getChannelAttribute(getUsableChannel(channel))].push(channel);
  }

  const emptyAttributes = Object.keys(channelsByAttribute).filter(
    attribute => channelsByAttribute[attribute].length === 0
  );
  for (const emptyAttribute of emptyAttributes) {
    delete channelsByAttribute[emptyAttribute];
  }

  return channelsByAttribute;

  /**
   * @param {Channel|FineChannel} channel A usable channel, i. e. no matrix or switching channels.
   * @returns {string} The proper D::Light attribute name for this channel.
   */
  function getChannelAttribute(channel) {
    if (channel instanceof FineChannel) {
      if (channel.resolution === CoarseChannel.RESOLUTION_16BIT) {
        return `FINE`;
      }
      return `EXTRA`;
    }

    const oflToDLightMap = {
      INTENSITY: [`Intensity`],
      COLOUR: [`Single Color`, `Multi-Color`, `Color Temperature`],
      FOCUS: [`Pan`, `Tilt`],
      BEAM: [`Iris`, `Focus`, `Zoom`],
      EFFECT: [`Strobe`, `Shutter`, `Speed`, `Gobo`, `Prism`, `Effect`, `Fog`],
      CONTROL: [`Maintenance`],
      EXTRA: [`NoFunction`]
    };

    for (const attribute of Object.keys(oflToDLightMap)) {
      if (oflToDLightMap[attribute].includes(channel.type)) {
        return attribute;
      }
    }
    return `EXTRA`; // default if new types are added to OFL
  }
}
