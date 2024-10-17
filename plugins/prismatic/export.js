import fixtureJsonStringify from '../../lib/fixture-json-stringify.js';

/**
 * *****************************************************
 * Prismatic export plugin
 *******************************************************
 * This plugin exports fixtures to the Prismatic format.
 * Prismatic is a modular AV software that also supports communication with lighting fixtures.
 * https://prismatic.art/
 *******************************************************
 * Output file: *.prd file, essentially a JSON file with a different file extension.
 * -------------------- Features -----------------------
 * - RGB channels are merged into a single 'Color' parameter.
 * - Fine channels are merged into the corresponding channel. This includes 16-bit and 24-bit channels.
 * - Channel types are automatically detected.
 * ------------------ Not implemented -------------------
 * - Prismatic does not yet support Rotary heads therefore, many of their features are not exported.
 * - Fixture capabilities are not exported.
 * - Color and Gobo wheels are unsuported.
 * - Matrixes are unsupported.
 ******************************************************
 */

export const version = `0.1.0`;

// needed for export test
export const supportedOflVersion = `7.3.0`;

const ParameterType = {
  None: 0,
  ColorRGB: 1, // 3 Bytes
  Byte: 2, // 1 Byte
  ColorRGB16: 3, // 6 Bytes
  Bit16: 4, // 2 Bytes
  ChannelMode: 5, // 0 Bytes (automatic)
  ByteArray: 6, // N Bytes
  Address: 7, // 0 Bytes (automatic)
  Bit24: 8, // 3 Bytes
};

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  // one JSON file for each fixture
  return fixtures.map(fixture => {
    try {
      return getFixtureFile(fixture);
    }
    catch (error) {
      throw new Error(`Exporting fixture ${fixture.manufacturer.key}/${fixture.key} failed: ${error}`, {
        cause: error,
      });
    }
  });
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @returns {object} The generated fixture JSON file.
 */
function getFixtureFile(fixture) {
  const oflJson = structuredClone(fixture.jsonObject);
  const prismaticJson = {
    name: oflJson.name,
  };

  addIfValidData(prismaticJson, `id`, `${fixture.manufacturer.key}-${fixture.key}`);
  addIfValidData(prismaticJson, `manufacturer`, fixture.manufacturer.name);
  addIfValidData(prismaticJson, `categories`, oflJson.categories);
  addIfValidData(prismaticJson, `meta`, oflJson.meta);
  addIfValidData(prismaticJson, `comment`, oflJson.comment);

  addIfValidData(prismaticJson, `links`, oflJson.links);
  addIfValidData(prismaticJson, `physical`, oflJson.physical);

  // Prismatic parameters is a list of objects, each object has a name, type, optionally a default value and a list of capabilities
  prismaticJson.parameters = [];
  // Modes is a list of objects, each object has a name and a list of channels
  prismaticJson.modes = oflJson.modes;

  mergeColorChannels(prismaticJson, oflJson);
  mergeFineChannels(prismaticJson, oflJson);
  processChannels(prismaticJson, oflJson);

  addIfValidData(prismaticJson, `ofl_url`, fixture.url);

  return {
    name: `${fixture.manufacturer.key}-${fixture.key}.prd`,
    content: fixtureJsonStringify(prismaticJson),
    mimetype: `application/ofl-fixture`,
    fixtures: [fixture],
  };
}

/**
 * Saves the given data (or value, if given) into obj[property] if data is valid,
 * i.e. it is neither undefined, nor null, nor false.
 * @param {object} object The object where the property should be created.
 * @param {string} property The name of the property added to obj.
 * @param {any} data If this is valid, the property is added to obj.
 * @param {any} value The property value, if data is valid. Defaults to `data`.
 */
function addIfValidData(object, property, data, value) {
  if (value === undefined) {
    value = data;
  }

  if (data !== undefined && data !== null && data !== false) {
    object[property] = value;
  }
}

/**
 * Finds the name of the color channel with the given color.
 * @param {object} channels The OFL JSON availableChannels object.
 * @param {string} color The color name to search for.
 * @returns {string} The name of the color channel. If not found, an empty string is returned.
 */
function colorChannelName(channels, color) {
  for (const [name, channel] of Object.entries(channels)) {
    // Check if capability object is present
    if (channel.capability && channel.capability.type === `ColorIntensity` && channel.capability.color === color) {
      return name;
    }
  }
  return ``;
}

/**
 * Merges color channels into the corresponding channel.
 * @param {object} prismaticJson The Prismatic JSON object.
 * @param {object} oflJson The OFL JSON object.
 */
function mergeColorChannels(prismaticJson, oflJson) {
  // Go through available channel capabilities and check if we have RGB channels
  const redChannelName = colorChannelName(oflJson.availableChannels, `Red`);
  const greenChannelName = colorChannelName(oflJson.availableChannels, `Green`);
  const blueChannelName = colorChannelName(oflJson.availableChannels, `Blue`);
  if (redChannelName.length === 0 || greenChannelName.length === 0 || blueChannelName.length === 0) {
    return;
  }

  let addColorParameter = false;
  // Check if channels contains always RGB in the same order
  for (const mode of prismaticJson.modes) {
    // Modes are objects, we are interested in the channels array, which contain strings of names
    const channels = mode.channels;
    // Go through the channels and check if there is Red channel
    for (let index = 0; index < channels.length - 2; index++) {
      if (channels[index] === redChannelName && channels[index + 1] === greenChannelName && channels[index + 2] === blueChannelName) {
        // Found RGB channels, we can add the parameter
        addColorParameter = true;
        // Replace the RGB channels from the list with 'Color' parameter
        channels.splice(index, 3, `Color`);
        break;
      }
    }
  }

  if (addColorParameter) {
    prismaticJson.parameters.push({
      id: `Color`,
      name: `Color`,
      type: ParameterType.ColorRGB,
    });
  }

  // Check if there are any RGB channels left
  // If there are no RGB channels left, we can remove the RGB channels from the available channels
  if (!checkRGBChannelExistence(prismaticJson, redChannelName, greenChannelName, blueChannelName)) {
    delete oflJson.availableChannels[redChannelName];
    delete oflJson.availableChannels[greenChannelName];
    delete oflJson.availableChannels[blueChannelName];
  }
}

/**
 * Check if RGB channels are present in the Prismatic JSON object.
 * @param {object} prismaticJson The Prismatic JSON object.
 * @param {string} redChannelName The name of the red channel.
 * @param {string} greenChannelName The name of the green channel.
 * @param {string} blueChannelName The name of the blue channel.
 * @returns {boolean} True if all RGB channels are present, false otherwise.
 */
function checkRGBChannelExistence(prismaticJson, redChannelName, greenChannelName, blueChannelName) {
  return prismaticJson.modes.some(mode =>
    mode.channels.some(channel => [redChannelName, greenChannelName, blueChannelName].includes(channel)));
}

/**
 * Merges fine channels into the corresponding channel.
 * @param {object} prismaticJson The Prismatic JSON object.
 * @param {object} oflJson The OFL JSON object.
 */
function mergeFineChannels(prismaticJson, oflJson) {
  // availableChannels can include "fineChannelAliases" list, which contains names then found in mode channels,
  // channel name presence means 8bit, if multiple aliases are mentioned, the size increase to 16bit or 24bit

  // Go through available channel and check if we have fine channels
  for (const [channelName, channel] of Object.entries(oflJson.availableChannels)) {
    // check if fineChannelAliases is present, is array and is not empty
    if (!channel.fineChannelAliases || !Array.isArray(channel.fineChannelAliases) || channel.fineChannelAliases.length === 0) {
      continue;
    }

    const alias16Bit = channel.fineChannelAliases[0];
    const alias24Bit = channel.fineChannelAliases.length > 1 ? channel.fineChannelAliases[1] : ``;

    // Add 16 bit channel to parameters
    prismaticJson.parameters.push({
      id: alias16Bit,
      name: alias16Bit,
      type: ParameterType.Bit16,
    });
    // Add 24 bit channel to parameters if it exists
    if (alias24Bit.length > 0) {
      prismaticJson.parameters.push({
        id: alias24Bit,
        name: alias24Bit,
        type: ParameterType.Bit24,
      });
    }

    updateFineChannelModes(prismaticJson, channelName, alias16Bit, alias24Bit);
  }
}

/**
 * Helper function to update oflJson modes with new Prismatics fine channels.
 * @param {object} prismaticJson The Prismatic JSON object.
 * @param {string} channelName The name of the channel.
 * @param {string} alias16Bit  The name of the 16 bit channel.
 * @param {string} alias24Bit  The name of the 24 bit channel (if it exists).
 */
function updateFineChannelModes(prismaticJson, channelName, alias16Bit, alias24Bit) {
  // Go through modes and search for channel name and its aliases
  for (const mode of prismaticJson.modes) {
    const channels = mode.channels;
    for (let index = 0; index < channels.length - 1; index++) {
      // check for 24 bit channel, watch out if we are not at the end of the array
      if (alias24Bit.length > 0 && index < channels.length - 2 && channels[index] === channelName && channels[index + 1] === alias16Bit && channels[index + 2] === alias24Bit) {
        // Replace the 3 channels with the 24 bit channel
        channels.splice(index, 3, alias24Bit);
        break;
      }
      // check for 16 bit
      if (channels[index] === channelName && channels[index + 1] === alias16Bit) {
        // Replace the 2 channels with the 16 bit channel
        channels.splice(index, 2, alias16Bit);
        break;
      }
    }
  }
}

/**
 * Go through oflJson channels and add them to prismaticJson parameters after processing.
 * @param {object} prismaticJson The Prismatic JSON object.
 * @param {object} oflJson The OFL JSON object.
 */
function processChannels(prismaticJson, oflJson) {
  // Go through available channels and add them to parameters
  for (const [name, channel] of Object.entries(oflJson.availableChannels)) {
    const parameterType = ParameterType.Byte;
    const actualName = channel.name || name;

    const parameter = {
      id: name, // Use channel name as ID as that one is unique
      name: actualName,
      type: parameterType,
    };

    if (channel.defaultValue) {
      parameter.defaultValue = channel.defaultValue;
    }

    prismaticJson.parameters.push(parameter);
  }
}
