/** @typedef {import('../../lib/model/AbstractChannel.js').default} AbstractChannel */
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */

import CoarseChannel from '../../lib/model/CoarseChannel.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

/**
 * @typedef {object} ModeChannels
 * @property {SegmentChannels[]} segments The channels of all the fixture's segments.
 * @property {AbstractChannel[]} colorWheels The fixture's color wheel channels.
 * @property {AbstractChannel[]} freePatchChannels The fixture's free patch channels.
 */

/**
 * @typedef {object} SegmentChannels
 * @property {AbstractChannel | undefined} red The segment's red channel.
 * @property {AbstractChannel | undefined} green The segment's green channel.
 * @property {AbstractChannel | undefined} blue The segment's blue channel.
 * @property {AbstractChannel | undefined} white The segment's white channel.
 * @property {AbstractChannel | undefined} amber The segment's amber channel.
 * @property {AbstractChannel | undefined} uv The segment's UV channel.
 * @property {AbstractChannel | undefined} dimmer The segment's dimmer channel.
 * @property {AbstractChannel | undefined} shutter The segment's shutter/strobe channel.
 */

export const version = `1.0.0`;

const segmentsPerFile = 4;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  return fixtures.flatMap(fixture => fixture.modes.flatMap(mode => {
    try {
      return getFilesForMode(mode);
    }
    catch (error) {
      throw new Error(`Exporting fixture mode ${fixture.manufacturer.key}/${fixture.key}/${mode.shortName} failed: ${error}`, {
        cause: error,
      });
    }
  }));
}

/**
 * @param {Mode} mode The mode to export.
 * @returns {object[]} The generated files for this mode.
 */
function getFilesForMode(mode) {
  const modeChannels = getModeChannels(mode);

  const totalFiles = Math.ceil(modeChannels.segments.length / segmentsPerFile);

  return Array.from({ length: totalFiles }).flatMap((_, fileIndex) => {
    const channels = getChannelsForFile(modeChannels, fileIndex);

    const magicNumber = [0x08, 0x00, 0x04, 0x08, 0x00, 0x04, 0x08, 0x00, 0x04];
    const versionCode = 0x01;
    const channelIndices = Object.values(channels).map(channel => (channel === undefined ? 0x3D : mode.getChannelIndex(channel.key) + 1));
    const padding = Array.from({ length: 154 }, () => 0x00);

    const byteArray = new Uint8Array([
      ...magicNumber,
      versionCode,
      ...channelIndices,
      ...padding,
    ]);

    const descriptionFileContent = Object.entries(channels).map(([controlElement, channel]) => {
      const channelName = channel?.name ?? `–`;
      return `${controlElement}: ${channelName}`;
    }).join(`\n`);

    return [
      {
        name: getFileName(mode, totalFiles, fileIndex, `lib`),
        content: Buffer.from(byteArray),
        mimetype: `binary/octet-stream`,
        fixtures: [mode.fixture],
        modes: [mode],
      },
      {
        name: getFileName(mode, totalFiles, fileIndex, `txt`),
        content: descriptionFileContent,
        mimetype: `text/plain`,
        fixtures: [mode.fixture],
        modes: [mode],
      },
    ];
  });
}

/**
 * @param {Mode} mode The mode to select the channels from.
 * @returns {ModeChannels} The selected mode channels.
 */
function getModeChannels(mode) {
  const channelsByPixelKey = groupModeChannelsByPixelKey(mode);
  const segments = channelsByPixelKey.map(channels => ({
    red: channels.find(channel => isColorChannel(channel, `Red`)),
    green: channels.find(channel => isColorChannel(channel, `Green`)),
    blue: channels.find(channel => isColorChannel(channel, `Blue`)),
    white: channels.find(channel => isColorChannel(channel, `White`) || isColorChannel(channel, `Cold White`) || isColorChannel(channel, `Warm White`)),
    amber: channels.find(channel => isColorChannel(channel, `Amber`) || isColorChannel(channel, `Warm White`)),
    uv: channels.find(channel => isColorChannel(channel, `UV`)),
    dimmer: channels.find(channel => isChannelOfType(channel, `Intensity`)),
    shutter: channels.find(channel => isChannelOfType(channel, `Strobe`) || isChannelOfType(channel, `Shutter`)),
  }));

  mergeDisjunctSegments(segments);

  return {
    segments,
    colorWheels: mode.channels.filter(channel => isChannelOfType(channel, `Multi-Color`)),
    freePatchChannels: [
      ...mode.channels.filter(channel => isChannelOfType(channel, `Pan`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Tilt`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Effect`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Gobo`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Speed`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Prism`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `WheelSlotRotation`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Zoom`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Iris`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Color Temperature`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Maintenance`)),
      ...mode.channels.filter(channel => isChannelOfType(channel, `Shutter`) && segments.every(
        segment => segment.shutter !== channel,
      )),
    ],
  };
}

/**
 * @param {Mode} mode The mode to get the segments for.
 * @returns {AbstractChannel[][]} The mode's channels, grouped by the pixel key they belong to.
 */
function groupModeChannelsByPixelKey(mode) {
  const channelsByPixelKey = {};

  for (const channel of mode.channels) {
    if (!(channel.pixelKey in channelsByPixelKey)) {
      channelsByPixelKey[channel.pixelKey] = [];
    }
    channelsByPixelKey[channel.pixelKey].push(channel);
  }

  return Object.values(channelsByPixelKey);
}

/**
 * Try to merge consecutive segments with disjunctly defined control elements.
 * @param {SegmentChannels[]} segments The segments to merge.
 */
function mergeDisjunctSegments(segments) {
  let segmentIndex = 1;

  while (segmentIndex < segments.length) {
    const currentSegment = segments[segmentIndex];
    const previousSegment = segments[segmentIndex - 1];
    const definedControlElements = Object.keys(currentSegment).filter(
      controlElement => currentSegment[controlElement] !== undefined,
    );
    const canBeMerged = definedControlElements.every(
      controlElement => previousSegment[controlElement] === undefined,
    );

    if (canBeMerged) {
      for (const controlElement of definedControlElements) {
        previousSegment[controlElement] = currentSegment[controlElement];
      }
      segments.splice(segmentIndex, 1);
    }
    else {
      segmentIndex++;
    }
  }
}

/**
 * @param {AbstractChannel} channel The channel to check.
 * @param {string} color The color to check.
 * @returns {boolean} Whether the channel is a color channel with the given color.
 */
function isColorChannel(channel, color) {
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;
  }

  return channel instanceof CoarseChannel && channel.color === color;
}

/**
 * @param {AbstractChannel} channel The channel to check.
 * @param {string} type The type to check.
 * @returns {boolean} Whether the channel is a channel with the given type.
 */
function isChannelOfType(channel, type) {
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;
  }

  return channel instanceof CoarseChannel && channel.type === type;
}

/**
 * @param {Mode} mode The mode to get the file name for.
 * @param {number} totalFiles The total number of files for this mode.
 * @param {number} fileIndex The index of the file in this mode's files.
 * @param {'lib' | 'txt'} extension The file extension.
 * @returns {string} The file name.
 */
function getFileName(mode, totalFiles, fileIndex, extension) {
  const fileNumberSuffix = totalFiles === 1 ? `` : `_${fileIndex + 1}_of_${totalFiles}`;
  return `${mode.fixture.manufacturer.key}_${mode.fixture.key}_${mode.shortName}${fileNumberSuffix}.${extension}`;
}

/**
 * @param {ModeChannels} modeChannels The mode's selected and grouped channels.
 * @param {number} fileIndex The index of the file in this mode's files.
 * @returns {Record<string, AbstractChannel | undefined>} The channels in the order they should appear in the file.
 */
function getChannelsForFile(modeChannels, fileIndex) {
  const fileChannels = {};

  const fileSegments = modeChannels.segments.slice(fileIndex * segmentsPerFile, (fileIndex + 1) * segmentsPerFile);
  for (let segmentIndex = 0; segmentIndex < segmentsPerFile; segmentIndex++) {
    const channels = segmentIndex < fileSegments.length ? fileSegments[segmentIndex] : undefined;
    fileChannels[`Red ${segmentIndex + 1}`] = channels?.red;
    fileChannels[`Green ${segmentIndex + 1}`] = channels?.green;
    fileChannels[`Blue ${segmentIndex + 1}`] = channels?.blue;
    fileChannels[`White ${segmentIndex + 1}`] = channels?.white;
    fileChannels[`Amber ${segmentIndex + 1}`] = channels?.amber;
    fileChannels[`UV ${segmentIndex + 1}`] = channels?.uv;
    fileChannels[`Dimmer ${segmentIndex + 1}`] = channels?.dimmer;
    fileChannels[`Shutter ${segmentIndex + 1}`] = channels?.shutter;
  }

  fileChannels[`Color Wheel`] = modeChannels.colorWheels[fileIndex];

  const freePatchChannelsPerFile = 3;
  fileChannels[`FP 1`] = modeChannels.freePatchChannels[(fileIndex * freePatchChannelsPerFile) + 0];
  fileChannels[`FP 2`] = modeChannels.freePatchChannels[(fileIndex * freePatchChannelsPerFile) + 1];
  fileChannels[`FP 3`] = modeChannels.freePatchChannels[(fileIndex * freePatchChannelsPerFile) + 2];

  return fileChannels;
}
