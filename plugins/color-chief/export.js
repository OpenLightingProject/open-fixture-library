/** @typedef {import('../../lib/model/AbstractChannel.js').default} AbstractChannel */
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */

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
  return fixtures.flatMap(fixture => fixture.modes.flatMap(mode => getFilesForMode(mode)));
}

/**
 * @param {Mode} mode The mode to export.
 * @returns {object[]} The generated files for this mode.
 */
function getFilesForMode(mode) {
  const channelsByPixelKey = groupModeChannelyByPixelKey(mode);

  const segmentsPerFile = 4;
  const totalFiles = Math.ceil(channelsByPixelKey.length / segmentsPerFile);

  return Array.from({ length: totalFiles }, (_, fileIndex) => {
    const fileSegments = channelsByPixelKey.slice(fileIndex * segmentsPerFile, (fileIndex + 1) * segmentsPerFile);
    return {
      name: getFileName(mode, totalFiles, fileIndex),
      content: Buffer.from(getByteArrayForMode(mode, fileSegments, fileIndex)),
      mimetype: `binary/octet-stream`,
      fixtures: [mode.fixture],
      modes: [mode],
    };
  });
}

/**
 * @param {Mode} mode The mode to get the segments for.
 * @returns {AbstractChannel[][]} The mode's channels, grouped by the pixel key they belong to.
 */
function groupModeChannelyByPixelKey(mode) {
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
 * @param {Mode} mode The mode to get the file name for.
 * @param {number} totalFiles The total number of files for this mode.
 * @param {number} fileIndex The index of the file in this mode's files.
 * @returns {string} The file name.
 */
function getFileName(mode, totalFiles, fileIndex) {
  const fileNumberSuffix = totalFiles === 1 ? `` : `_${fileIndex + 1}_of_${totalFiles}`;
  return `${mode.fixture.manufacturer.key}_${mode.fixture.key}_${mode.shortName}${fileNumberSuffix}.lib`;
}

/**
 * @param {Mode} mode The mode to export.
 * @param {AbstractChannel[][]} fileSegments The mode's channels to include in this file, grouped by the pixel key they belong to.
 * @param {number} fileIndex The index of the file in this mode's files.
 * @returns {Uint8Array} The exported file's contents.
 */
function getByteArrayForMode(mode, fileSegments, fileIndex) {
  const magicNumber = [0x08, 0x00, 0x04, 0x08, 0x00, 0x04, 0x08, 0x00, 0x04];
  const versionCode = 0x01;

  const segmentChannelIndices = Array.from({ length: 4 }).flatMap((_, segmentIndex) => {
    if (segmentIndex >= fileSegments.length) {
      return Array.from({ length: 8 }, () => 0x00);
    }

    // const segment = fileSegments[segmentIndex];

    return Array.from({ length: 8 }, (_, channelIndex) => channelIndex);
  });

  const colorWheelChannelIndex = fileIndex;

  const freePatchChannelIndices = Array.from({ length: 3 }, (_, index) => index * fileIndex);

  const padding = Array.from({ length: 154 }, () => 0x00);

  return new Uint8Array([
    ...magicNumber,
    versionCode,
    ...segmentChannelIndices,
    colorWheelChannelIndex,
    ...freePatchChannelIndices,
    ...padding,
  ]);
}
