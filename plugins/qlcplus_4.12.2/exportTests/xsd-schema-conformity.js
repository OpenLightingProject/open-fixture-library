const https = require(`https`);
const libxml = require(`libxmljs`);

const SCHEMA_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/schemas/fixture.xsd`;

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
module.exports = async function testSchemaConformity(exportFile, allExportFiles) {
  if (exportFile.name.startsWith(`gobos/`)) {
    return;
  }

  const schemaData = await new Promise((resolve, reject) => {
    https.get(SCHEMA_URL, res => {
      let data = ``;
      res.on(`data`, chunk => {
        data += chunk;
      });
      res.on(`end`, () => {
        resolve(data);
      });
    });
  });

  const xsdDoc = libxml.parseXml(schemaData);
  const xmlDoc = libxml.parseXml(exportFile.content);

  if (xmlDoc.validate(xsdDoc)) {
    return;
  }

  throw xmlDoc.validationErrors.map(err => err.message.trim());
};
