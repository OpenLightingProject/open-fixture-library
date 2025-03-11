import sanitize from 'sanitize-filename';
import xmlbuilder from 'xmlbuilder';

/** @typedef {import('../../lib/model/AbstractChannel.js').default} AbstractChannel */
/** @typedef {import('../../lib/model/Capability.js').default} Capability */
import CoarseChannel from '../../lib/model/CoarseChannel.js';
import FineChannel from '../../lib/model/FineChannel.js';
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

export const version = `0.2.0`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const deviceFiles = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      try {
        deviceFiles.push(exportFixtureMode(fixture, mode, options));
      }
      catch (error) {
        throw new Error(`Exporting fixture mode ${fixture.manufacturer.key}/${fixture.key}/${mode.shortName} failed: ${error}`, {
          cause: error,
        });
      }
    }
  }

  return deviceFiles;
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @param {Mode} mode The mode to export.
 * @param {object} options Global options.
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {object} The generated file.
 */
function exportFixtureMode(fixture, mode, options) {
  const xml = xmlbuilder.begin()
    .declaration(`1.0`)
    .element({
      Device: {
        'OFL_Export': {
          '@id': options.displayedPluginVersion || version,
          '#text': fixture.url,
        },
        frames: {
          '@id': mode.channels.length,
        },
        ManufacturerName: fixture.manufacturer.name,
        ModelName: `${fixture.name} (${mode.name})`,
        creationDate: fixture.meta.createDate.toISOString().split(`T`)[0],
      },
    })
    .element(`Attributes`);

  // channels are grouped by their channel type which is called AttributesDefinition in D::Light
  const channelsByAttribute = getChannelsByAttribute(mode.channels);
  for (const attribute of Object.keys(channelsByAttribute)) {
    addAttribute(xml, mode, attribute, channelsByAttribute[attribute]);
  }

  return {
    name: `${fixture.manufacturer.key}/${fixture.key}-${sanitize(mode.shortName)}.xml`,
    content: xml.end({
      pretty: true,
      indent: `  `,
    }),
    mimetype: `application/xml`,
    fixtures: [fixture],
    mode: mode.shortName,
  };
}

/**
 * Channels are grouped in attributes in D::Light.
 * This function adds the given attribute group along with its channels to the given XML.
 * @param {XMLElement} xml The XML parent element.
 * @param {Mode} mode The fixture's mode that this definition is representing.
 * @param {string} attribute A D::Light attribute name.
 * @param {AbstractChannel[]} channels All channels of the mode that are associated to the given attribute name.
 */
function addAttribute(xml, mode, attribute, channels) {
  const xmlAttribute = xml.element({
    AttributesDefinition: {
      '@id': attribute,
      '@length': channels.length,
    },
  });

  for (let [indexInAttribute, channel] of channels.entries()) {
    const xmlChannel = xmlAttribute.element({
      ThisAttribute: {
        '@id': indexInAttribute,
        HOME: {
          '@id': getDefaultValue(getUsableChannel(channel)),
        },
        addressIndex: {
          '@id': mode.getChannelIndex(channel.key),
        },
        parameterName: {
          '@id': getParameterName(channel, mode, attribute, indexInAttribute),
        },
        minLevel: {
          '@id': 0,
        },
        maxLevel: {
          '@id': 255,
        },
      },
    });

    channel = getUsableChannel(channel);

    if (channel instanceof CoarseChannel) {
      const capabilities = channel.capabilities;

      const xmlCapabilities = xmlChannel.element({
        Definitions: {
          '@index': capabilities.length,
        },
      });

      for (const capability of capabilities) {
        addCapability(capability, xmlCapabilities);
      }
    }
  }
}


/**
 * Adds an XML element for the given capability to the XML capability container.
 * @param {Capability} capability A capability of a channels capability list.
 * @param {XMLElement} xmlCapabilities The XML element to add capabilities to.
 */
function addCapability(capability, xmlCapabilities) {
  let hold = `0`;

  if (capability.hold) {
    if (capability.hold.unit === `ms`) {
      hold = capability.hold.number;
    }
    else if (capability.hold.unit === `s`) {
      hold = capability.hold.number * 1000;
    }
  }

  const dmxRange = capability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);
  xmlCapabilities.element({
    name: {
      '@min': dmxRange.start,
      '@max': dmxRange.end,
      '@snap': capability.getMenuClickDmxValueWithResolution(CoarseChannel.RESOLUTION_8BIT),
      '@timeHolder': hold,
      '@dummy': `0`,
      '#text': capability.name,
    },
  });
}

/**
 * @param {CoarseChannel} channel The channel to get the name for.
 * @param {Mode} mode The mode the channel is in.
 * @param {string} attribute The D::Light attribute name.
 * @param {number} indexInAttribute The index of this channel in the list of all channels related to the attribute.
 * @returns {string} The parameter name (i. e. channel name) that should be used for this channel in D::Light.
 */
function getParameterName(channel, mode, attribute, indexInAttribute) {
  const uniqueName = channel.uniqueName;

  channel = getUsableChannel(channel);

  if (channel instanceof FineChannel) {
    // for fine channels, this is simply the coarse channel's index
    return `${mode.getChannelIndex(channel.coarseChannel.key) + 1}`;
  }

  if (attribute === `FOCUS`) {
    return channel.type.toUpperCase(); // PAN or TILT
  }

  if (attribute === `INTENSITY` && indexInAttribute === 0 && /dimmer|intensity/i.test(uniqueName)) {
    return `DIMMER`;
  }

  // in all other attributes, custom text is allowed
  // but we need to use another name syntax
  return uniqueName
    .toUpperCase()
    .replaceAll(` `, `_`)
    .replaceAll(`/`, `|`)
    .replaceAll(`COLOR`, `COLOUR`);
}

/**
 * @param {CoarseChannel | FineChannel} channel A usable channel, i. e. no switching channel.
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
 * @returns {CoarseChannel | FineChannel} Switching channels resolved to their default channel.
 */
function getUsableChannel(channel) {
  if (channel instanceof SwitchingChannel) {
    return channel.defaultChannel;
  }

  return channel;
}

/**
 * @param {AbstractChannel[]} channels List of channels, e.g. from a mode's channel list.
 * @returns {Record<string, AbstractChannel>} D::Light attribute names mapped to the corresponding channels of the given list. All channels are included once.
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
    'FINE': [],
  };

  for (const channel of channels) {
    channelsByAttribute[getChannelAttribute(getUsableChannel(channel))].push(channel);
  }

  const emptyAttributes = Object.keys(channelsByAttribute).filter(
    attribute => channelsByAttribute[attribute].length === 0,
  );
  for (const emptyAttribute of emptyAttributes) {
    delete channelsByAttribute[emptyAttribute];
  }

  return channelsByAttribute;

  /**
   * @param {CoarseChannel | FineChannel} channel A usable channel, i. e. no matrix or switching channels.
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
      EXTRA: [`NoFunction`],
    };

    for (const attribute of Object.keys(oflToDLightMap)) {
      if (oflToDLightMap[attribute].includes(channel.type)) {
        return attribute;
      }
    }
    return `EXTRA`; // default if new types are added to OFL
  }
}
