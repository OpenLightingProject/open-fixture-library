const promisify = require(`util`).promisify;
const xml2js = require(`xml2js`);

/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {!string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {!string} exportFile.content File content.
 * @param {!string} exportFile.mimetype File mime type.
 * @param {?Array.<Fixture>} exportFile.fixtures Fixture objects that are described in given file; may be ommited if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {?string} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {!Promise} Resolve when the test passes or reject with an error or an array of errors if the test fails.
**/
module.exports = async function testChannelNumbers(exportFile) {
  const parser = new xml2js.Parser();
  const parseString = promisify(parser.parseString);

  const fixture = exportFile.fixtures[0];
  const mode = fixture.modes.find(mode => mode.shortName === exportFile.mode);

  /** @type {!object.<number, Array.<Range>>} */
  const usedChannelRanges = {};

  const xml = await parseString(exportFile.content);
  console.log(xml.device.functions);
};
