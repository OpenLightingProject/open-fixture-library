import sanitize from 'sanitize-filename';
import xmlbuilder from 'xmlbuilder';

import FineChannel from '../../lib/model/FineChannel.js';
import NullChannel from '../../lib/model/NullChannel.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

import ddf3FunctionGroups from './ddf3-function-groups.js';
import ddf3Functions from './ddf3-functions.js';

export const version = `0.1.2`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const deviceDefinitions = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      try {
        deviceDefinitions.push(exportFixtureMode(fixture, mode, options));
      }
      catch (error) {
        throw new Error(`Exporting fixture mode ${fixture.manufacturer.key}/${fixture.key}/${mode.shortName} failed: ${error}`, {
          cause: error,
        });
      }
    }
  }

  return deviceDefinitions;
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
    .declaration(`1.0`, `utf-8`)
    .element({
      device: {
        '@type': `DMXDevice`,
        '@dmxaddresscount': mode.channelKeys.length,
        '@dmxcversion': 3,
        '@ddfversion': options.displayedPluginVersion ?? version,
      },
    });

  addInformation(xml, mode);
  addFunctions(xml, mode);
  addProcedures(xml, mode);

  return {
    name: sanitize(`${fixture.manufacturer.key}-${fixture.key}-${(mode.shortName)}.xml`).replaceAll(/\s+/g, `-`),
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
 * Adds the information block to the specified XML file.
 * @param {XMLDocument} xml The device definition to add the information to
 * @param {Mode} mode The definition's mode
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
 * @typedef {Map<string | null, CoarseChannel[]>} ChannelsPerPixel
 */

/**
 * @typedef {Map<string | null, XMLElement[]>} XmlFunctionsPerPixel
 */

/**
 * Adds the DMX channels as functions to the specified XML file.
 * @param {XMLDocument} xml The device definition to add the functions to.
 * @param {Mode} mode The definition's mode.
 */
function addFunctions(xml, mode) {
  const channelsPerPixel = getChannelsPerPixel(mode);
  /** @type {XmlFunctionsPerPixel} */
  const xmlFunctionsPerPixel = new Map();

  for (const [pixelKey, pixelChannels] of channelsPerPixel) {
    const xmlChannelFunctions = [];
    for (const channel of pixelChannels) {
      xmlChannelFunctions.push(...getXmlFunctionsFromChannel(channel));
    }

    groupXmlFunctions(xmlChannelFunctions);
    xmlFunctionsPerPixel.set(pixelKey, xmlChannelFunctions);
  }

  addMatrix(mode, xmlFunctionsPerPixel);

  for (const [pixelKey, xmlFunctions] of xmlFunctionsPerPixel) {
    if (xmlFunctions.length > 0) {
      const xmlFunctionsContainer = xml.element(`functions`);

      if (pixelKey !== null) {
        xmlFunctionsContainer.comment(pixelKey);
      }

      for (const xmlFunction of xmlFunctions) {
        xmlFunctionsContainer.importDocument(xmlFunction);
      }
    }
  }

  /**
   * @param {CoarseChannel} channel The channel that should be represented as one or more DMXControl functions.
   * @returns {XMLElement[]} Functions created by this channel. They are not automatically grouped together.
   */
  function getXmlFunctionsFromChannel(channel) {
    const functionToCapabilities = {};

    for (const capability of channel.capabilities) {
      const properFunction = Object.keys(ddf3Functions).find(
        key => ddf3Functions[key].isCapSuitable(capability),
      );

      if (properFunction) {
        if (!Object.keys(functionToCapabilities).includes(properFunction)) {
          functionToCapabilities[properFunction] = [];
        }
        functionToCapabilities[properFunction].push(capability);
      }
    }

    const xmlFunctions = [];
    for (const functionKey of Object.keys(functionToCapabilities)) {
      const capabilities = functionToCapabilities[functionKey];
      const functions = ddf3Functions[functionKey].create(channel, capabilities);
      if (Array.isArray(functions)) {
        xmlFunctions.push(...functions);
      }
      else {
        xmlFunctions.push(functions);
      }
    }
    for (const xmlFunction of xmlFunctions) {
      addChannelAttributes(xmlFunction, mode, channel);
    }

    return xmlFunctions;
  }

  /**
   * Merges and renames the given XML functions. Modifies the array.
   * @param {XMLElement[]} xmlFunctions Channel-level XML functions.
   */
  function groupXmlFunctions(xmlFunctions) {
    for (const group of ddf3FunctionGroups) {
      const foundFunctions = {};
      for (const functionName of group.functions) {
        foundFunctions[functionName] = [];
      }

      for (const xmlFunction of xmlFunctions) {
        if (xmlFunction.name in foundFunctions) {
          foundFunctions[xmlFunction.name].push(xmlFunction);
        }
      }

      const completeGroups = Math.min(...Object.values(foundFunctions).map(items => items.length));
      for (let index = 0; index < completeGroups; index++) {
        // take i-th function from each function type
        const groupFunctions = Object.values(foundFunctions).map(items => items[index]);
        const xmlGroup = group.getXmlGroup(...groupFunctions);

        // insert xml group at the position of the first grouped function
        xmlFunctions.splice(xmlFunctions.indexOf(groupFunctions[0]), 0, xmlGroup);

        // remove grouped functions from list
        for (const function_ of groupFunctions) {
          xmlFunctions.splice(xmlFunctions.indexOf(function_), 1);
        }
      }
    }
  }
}

/**
 * @param {Mode} mode The definition's mode.
 * @returns {ChannelsPerPixel} Each pixel key pointing to its unwrapped matrix channels. null points to all non-matrix channels.
 */
function getChannelsPerPixel(mode) {
  const channelsPerPixel = new Map();

  channelsPerPixel.set(null, []);

  const matrix = mode.fixture.matrix;
  if (matrix !== null) {
    const pixelKeys = [...matrix.pixelGroupKeys, ...matrix.getPixelKeysByOrder(`X`, `Y`, `Z`)];
    for (const key of pixelKeys) {
      channelsPerPixel.set(key, []);
    }
  }

  const channels = mode.channels.map(
    channel => (channel instanceof SwitchingChannel ? channel.defaultChannel : channel),
  ).filter(
    channel => !(channel instanceof FineChannel || channel instanceof NullChannel),
  );
  for (const channel of channels) {
    channelsPerPixel.get(channel.pixelKey).push(channel);
  }

  return channelsPerPixel;
}

/**
 * Adds the Maintenance capabilities as procedures to the specified XML file.
 * @param {XMLDocument} xml The device definition to add the functions to.
 * @param {Mode} mode The definition's mode.
 */
function addProcedures(xml, mode) {
  const maintenanceCapabilities = [];

  for (let channel of mode.channels) {
    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    if (channel instanceof FineChannel) {
      continue;
    }

    maintenanceCapabilities.push(...channel.capabilities.filter(
      capability => capability.type === `Maintenance` && capability.isStep,
    ));
  }

  if (maintenanceCapabilities.length === 0) {
    return;
  }

  const xmlProcedures = xml.element(`procedures`);

  for (const capability of maintenanceCapabilities) {
    const channelIndex = mode.getChannelIndex(capability._channel.key);

    const xmlProcedure = xmlProcedures.element(`procedure`, {
      name: capability.comment,
    });

    xmlProcedure.element(`set`, {
      dmxchannel: channelIndex,
      value: capability.dmxRange.start,
    });

    if (capability.hold) {
      xmlProcedure.element(`hold`, {
        value: capability.hold.baseUnitEntity.number * 1000,
      });

      xmlProcedure.element(`restore`, {
        dmxchannel: channelIndex,
      });
    }
  }
}

/**
 * Combines several XML functions from the individual pixels to a single <matrix> function, if possible.
 * @param {Mode} mode The definition's mode.
 * @param {XmlFunctionsPerPixel} xmlFunctionsPerPixel Pixel keys pointing to its xml functions.
 */
function addMatrix(mode, xmlFunctionsPerPixel) {
  const matrix = mode.fixture.matrix;
  const hasSuitableCategory = mode.fixture.categories.includes(`Matrix`) || mode.fixture.categories.includes(`Pixel Bar`);

  if (matrix === null || !hasSuitableCategory) {
    return;
  }

  const pixelKeys = matrix.getPixelKeysByOrder(`X`, `Y`, `Z`);

  const isMonochromeMatrix = pixelKeys.every(pixelKey => {
    const xmlFunctions = xmlFunctionsPerPixel.get(pixelKey);
    return xmlFunctions.length === 1 && xmlFunctions[0].name === `dimmer`;
  });

  const isRgbMatrix = pixelKeys.every(pixelKey => {
    const xmlFunctions = xmlFunctionsPerPixel.get(pixelKey);
    return xmlFunctions.length === 1 && xmlFunctions[0].name === `rgb`;
  });

  if (!isMonochromeMatrix && !isRgbMatrix) {
    return;
  }

  const xmlMatrix = xmlbuilder.create(`matrix`);
  xmlMatrix.attribute(`rows`, matrix.pixelCountY);
  xmlMatrix.attribute(`columns`, matrix.pixelCountX);

  for (const pixelKey of pixelKeys) {
    xmlMatrix.importDocument(xmlFunctionsPerPixel.get(pixelKey).shift());
  }

  xmlFunctionsPerPixel.get(null).push(xmlMatrix);
}

/**
 * Adds name attribute, dmxchannel attribute and attributes for fine channels (if used in mode) to the given channel function.
 * @param {XMLElement} xmlElement The XML element to which the attributes should be added.
 * @param {Mode} mode The definition's mode.
 * @param {CoarseChannel} channel The channel whose data is used.
 */
function addChannelAttributes(xmlElement, mode, channel) {
  xmlElement.attribute(`name`, channel.name);

  const index = mode.getChannelIndex(channel.key);
  xmlElement.attribute(`dmxchannel`, index);

  const fineIndices = channel.fineChannels.map(
    fineChannel => mode.getChannelIndex(fineChannel.key),
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
