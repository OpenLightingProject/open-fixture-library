/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {!string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {!string} exportFile.content File content.
 * @param {!string} exportFile.mimetype File mime type.
 * @param {?Array.<Fixture>} exportFile.fixtures Fixture objects that are described in given file; may be ommited if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {?string} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {!Promise} Resolve when the test passes or reject with an error or an array of errors if the test fails.
**/
module.exports = function testChannelNumbers(exportFile) {
  const fixture = exportFile.fixtures[0];
  const mode = fixture.modes.find(mode => mode.shortName === exportFile.mode);

  const errors = [];
  const usedChannelIndices = new Set();

  const dmxChannelRegex = new RegExp(/dmxchannel="(.*?)"/g);
  const dmxChannelAttributes = exportFile.content.match(dmxChannelRegex) || [];

  for (const attr of dmxChannelAttributes) {
    const channelIndex = parseInt(attr.replace(dmxChannelRegex, `$1`));
    usedChannelIndices.add(channelIndex);

    if (channelIndex >= mode.channels.length) {
      errors.push(`Channel index ${channelIndex} is out of range (maximum: ${mode.channels.length - 1}).`);
    }
    else if (channelIndex < 0) {
      errors.push(`Channel index ${channelIndex} is invalid.`);
    }
  }

  for (let i = 0; i < mode.channels.length; i++) {
    if (!usedChannelIndices.has(i)) {
      const channel = mode.channels[i];
      errors.push(`Channel ${channel.key} (index: ${i}) is missing.`);
    }
  }

  if (errors.length > 0) {
    return Promise.reject(errors);
  }

  return Promise.resolve();
};