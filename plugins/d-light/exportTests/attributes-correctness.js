const xml2js = require(`xml2js`);
const promisify = require(`util`).promisify;

/**
 * @typedef {Object} ExportFile
 * @property {String} name File name, may include slashes to provide a folder structure.
 * @property {String} content File content.
 * @property {String} mimetype File mime type.
 * @property {Array.<Fixture>|null} fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @property {String|null} mode Mode's shortName if given file only describes a single mode.
 */

/**
 * @param {ExportFile} exportFile The file returned by the plugins' export module.
 * @param {Array.<ExportFile>} allExportFiles An array of all export files.
 * @returns {Promise.<undefined, Array.<String>|String>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
module.exports = async function testAttributesCorrectness(exportFile, allExportFiles) {
  const parser = new xml2js.Parser();

  try {
    const xml = await promisify(parser.parseString)(exportFile.content);
    const errors = [];

    const attrDefs = xml.Device.Attributes[0].AttributesDefinition;
    for (const attrDef of attrDefs) {
      const usedNames = [];
      const attrName = attrDef.$.id;

      for (const attr of attrDef.ThisAttribute) {
        const name = attr.parameterName[0].$.id;
        if (usedNames.includes(name)) {
          errors.push(`Duplicate parameter name: ${attrName}/${name}`);
        }
        else {
          usedNames.push(name);
        }
      }
    }

    if (errors.length > 0) {
      throw errors;
    }
  }
  catch (parseErrors) {
    throw `Error parsing XML: ${parseErrors.toString()}`;
  }
};
