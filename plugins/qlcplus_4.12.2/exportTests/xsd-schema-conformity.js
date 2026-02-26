import https from 'https';
import { XmlDocument, XsdValidator } from 'libxml2-wasm';

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

  const xsdDocument = XmlDocument.fromString(schemaData);
  const validator = XsdValidator.fromDoc(xsdDocument);
  const xmlDocument = XmlDocument.fromString(exportFile.content);

  try {
    validator.validate(xmlDocument);
  }
  catch (error) {
    throw error.details.map(detail => detail.message.trim());
  }
  finally {
    validator.dispose();
    xsdDocument.dispose();
    xmlDocument.dispose();
  }
}
