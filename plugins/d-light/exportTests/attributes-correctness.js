import xml2js from 'xml2js';

/**
 * @typedef {object} ExportFile
 * @property {string} name File name, may include slashes to provide a folder structure.
 * @property {string} content File content.
 * @property {string} mimetype File mime type.
 * @property {Fixture[] | null} fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @property {string | null} mode Mode's shortName if given file only describes a single mode.
 */

/**
 * @param {ExportFile} exportFile The file returned by the plugins' export module.
 * @param {ExportFile[]} allExportFiles An array of all export files.
 * @returns {Promise<void, string[] | string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
export default async function testAttributesCorrectness(exportFile, allExportFiles) {
  try {
    const xml = await xml2js.parseStringPromise(exportFile.content);
    const errors = [];

    const attributeDefinitions = xml.Device.Attributes[0].AttributesDefinition;
    for (const attributeDefinition of attributeDefinitions) {
      const usedNames = [];
      const attributeName = attributeDefinition.$.id;

      for (const attribute of attributeDefinition.ThisAttribute) {
        const name = attribute.parameterName[0].$.id;
        if (usedNames.includes(name)) {
          errors.push(`Duplicate parameter name: ${attributeName}/${name}`);
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
  catch (parseError) {
    throw `Error parsing XML: ${parseError.toString()}`;
  }
}
