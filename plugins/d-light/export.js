const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

/** @typedef {import('../../lib/model/AbstractChannel.js').default} AbstractChannel */
/** @typedef {import('../../lib/model/Capability.js').default} Capability */
const { CoarseChannel } = require(`../../lib/model.js`);
const { FineChannel } = require(`../../lib/model.js`);
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */
const { SwitchingChannel } = require(`../../lib/model.js`);

module.exports.version = `0.2.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = async function exportDLight(fixtures, options) {
  const deviceFiles = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      const xml = xmlbuilder.begin()
        .declaration(`1.0`)
        .element({
          Device: {
            'OFL_Export': {
              '@id': options.displayedPluginVersion || module.exports.version,
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

  return deviceFiles;
};

/**
 * Channels are grouped in attributes in D::Light.
 * This function adds the given attribute group along with its channels to the given XML.
 * @param {XMLElement} xml The XML parent element.
 * @param {Mode} mode The fixture's mode that this definition is representing.
 * @param {String} attribute A D::Light attribute name.
 * @param {Array.<AbstractChannel>} channels All channels of the mode that are associated to the given attribute name.
 */
function addAttribute(xml, mode, attribute, channels) {
  const xmlAttribute = xml.element({
    AttributesDefinition: {
      '@id': attribute,
      '@length': channels.length
    }
  });

  channels.forEach((channel, indexInAttribute) => {
    const xmlChannel = xmlAttribute.element({
      ThisAttribute: {
        '@id': indexInAttribute,
        HOME: {
          '@id': getDefaultValue(getUsableChannel(channel))
        },
        addressIndex: {
          '@id': mode.getChannelIndex(channel)
        },
        parameterName: {
          '@id': getParameterName()
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


      const dmxRange = cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);
      xmlCapabilities.element({
        name: {
          '@min': dmxRange.start,
          '@max': dmxRange.end,
          '@snap': cap.getMenuClickDmxValueWithResolution(CoarseChannel.RESOLUTION_8BIT),
          '@timeHolder': hold,
          '@dummy': `0`,
          '#text': cap.name
        }
      });
    }

    /**
     * @returns {String} The parameter name (i. e. channel name) that should be used for this channel in D::Light.
     */
    function getParameterName() {
      const uniqueName = channel.uniqueName;

      channel = getUsableChannel(channel);

      if (channel instanceof FineChannel) {
        // for fine channels, this is simply the coarse channel's index
        return `${mode.getChannelIndex(channel.coarseChannel.key) + 1}`;
      }

      switch (attribute) {
        case `FOCUS`:
          return channel.type.toUpperCase(); // PAN or TILT

        case `INTENSITY`:
          if (indexInAttribute === 0 && uniqueName.toLowerCase().match(/dimmer|intensity/)) {
            return `DIMMER`;
          }
          break;
      }

      // in all other attributes, custom text is allowed
      // but we need to use another name syntax
      return uniqueName
        .toUpperCase()
        .replace(/ /g, `_`)
        .replace(/\//g, `|`)
        .replace(/COLOR/g, `COLOUR`);
    }
  });
}

/**
 * @param {CoarseChannel|FineChannel} channel A usable channel, i. e. no switching channel.
 * @returns {Number} The DMX value this channel should be set to as default.
 */
function getDefaultValue(channel) {
  if (channel instanceof FineChannel) {
    return channel.defaultValue;
  }

  return channel.getDefaultValueWithResolution(CoarseChannel.RESOLUTION_8BIT);
}

/**
 * @param {AbstractChannel} channel Any kind of channel, e.g. an item of a mode's channel list.
 * @returns {CoarseChannel|FineChannel} Switching channels resolved to their default channel.
 */
function getUsableChannel(channel) {
  if (channel instanceof SwitchingChannel) {
    return channel.defaultChannel;
  }

  return channel;
}

/**
 * @param {Array.<AbstractChannel>} channels List of channels, e.g. from a mode's channel list.
 * @returns {Object.<String, AbstractChannel>} D::Light attribute names mapped to the corresponding channels of the given list. All channels are included once.
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
   * @param {CoarseChannel|FineChannel} channel A usable channel, i. e. no matrix or switching channels.
   * @returns {String} The proper D::Light attribute name for this channel.
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
