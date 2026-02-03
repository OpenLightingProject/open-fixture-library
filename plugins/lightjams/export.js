import xmlbuilder from 'xmlbuilder';
import sanitize from 'sanitize-filename';

import CoarseChannel from '../../lib/model/CoarseChannel.js';
import FineChannel from '../../lib/model/FineChannel.js';
import NullChannel from '../../lib/model/NullChannel.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

export const version = `1.0.0`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const outFiles = [];

  for (const fixture of fixtures) {
    // Export each mode as a separate fixture file
    for (const mode of fixture.modes) {
      const xml = xmlbuilder.create(`Fixtures`, {
        version: `1.0`,
        encoding: `UTF-8`,
      });

      const fixtureElement = xml.element(`Fixture`, {
        Name: fixture.name,
        Manufacturer: fixture.manufacturer.name,
        Channels: mode.channels.length.toString(),
      });

      let channelNumber = 1;
      for (const channel of mode.channels) {
        if (channel instanceof NullChannel) {
          channelNumber++;
          continue;
        }

        addChannel(fixtureElement, channel, channelNumber);
        channelNumber++;
      }

      const filename = sanitize(
        `${fixture.manufacturer.key}_${fixture.key}_${mode.shortName}.xml`
      ).replaceAll(/\s+/g, `_`);

      outFiles.push({
        name: filename,
        content: xml.end({
          pretty: true,
          indent: `  `,
        }),
        mimetype: `application/xml`,
        fixtures: [fixture],
        mode: mode.shortName,
      });
    }
  }

  return outFiles;
}

/**
 * Adds a channel element to the fixture.
 * @param {object} fixtureElement The xmlbuilder fixture element.
 * @param {object} channel The OFL channel object.
 * @param {number} channelNumber The DMX channel number.
 */
function addChannel(fixtureElement, channel, channelNumber) {
  const channelAttributes = {
    Number: channelNumber.toString(),
    Name: channel.name,
  };

  // Determine channel type from capabilities
  const channelType = getChannelType(channel);
  if (channelType) {
    channelAttributes.Type = channelType;
  }

  // Check if this is a fine channel
  if (channel instanceof FineChannel) {
    channelAttributes.Fine = `true`;
  }

  fixtureElement.element(`Channel`, channelAttributes);
}

/**
 * Determines the Lightjams channel type from OFL channel capabilities.
 * @param {object} channel The OFL channel object.
 * @returns {string} The Lightjams channel type.
 */
function getChannelType(channel) {
  // For switching channels, use the default channel's type
  if (channel instanceof SwitchingChannel) {
    return getChannelType(channel.defaultChannel);
  }

  // Get the first capability to determine type
  const capability = channel.capabilities?.[0];
  if (!capability) {
    return `Generic`;
  }

  const capabilityType = capability.type;

  // Map OFL capability types to Lightjams channel types
  switch (capabilityType) {
    case `Pan`:
      return `Pan`;
    case `Tilt`:
      return `Tilt`;
    case `ColorIntensity`:
      if (capability.color) {
        return `Color.${capability.color}`;
      }
      return `Color`;
    case `ColorPreset`:
    case `ColorWheelIndex`:
    case `ColorWheelRotation`:
      return `ColorWheel`;
    case `ShutterStrobe`:
    case `StrobeSpeed`:
    case `StrobeDuration`:
      return `Strobe`;
    case `Intensity`:
      return `Intensity`;
    case `GoboIndex`:
    case `GoboShake`:
      return `Gobo`;
    case `GoboStencilRotation`:
      return `GoboRotation`;
    case `Prism`:
    case `PrismRotation`:
      return `Prism`;
    case `Focus`:
      return `Focus`;
    case `Iris`:
    case `IrisEffect`:
      return `Iris`;
    case `Zoom`:
      return `Zoom`;
    case `Speed`:
      return `Speed`;
    case `Effect`:
    case `EffectSpeed`:
    case `EffectDuration`:
      return `Effect`;
    case `Fog`:
    case `FogOutput`:
    case `FogType`:
      return `Fog`;
    case `Maintenance`:
      return `Maintenance`;
    default:
      return `Generic`;
  }
}
