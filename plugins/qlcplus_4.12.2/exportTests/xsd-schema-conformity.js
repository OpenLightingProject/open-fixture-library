import https from 'https';
import libxml from 'libxmljs';

const SCHEMA_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/schemas/fixture.xsd`;

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
export default async function testSchemaConformity(exportFile, allExportFiles) {
  if (exportFile.name.startsWith(`gobos/`)) {
    return;
  }

  const schemaData = await new Promise((resolve, reject) => {
    https.get(SCHEMA_URL, response => {
      let data = ``;
      response.on(`data`, chunk => {
        data += chunk;
      });
      response.on(`end`, () => {
        resolve(data);
      });
    });
  });

  const xsdDocument = libxml.parseXml(schemaData);
  const xmlDocument = libxml.parseXml(exportFile.content);

  if (xmlDocument.validate(xsdDocument)) {
    return;
  }

  throw xmlDocument.validationErrors.map(error => error.message.trim());
}
