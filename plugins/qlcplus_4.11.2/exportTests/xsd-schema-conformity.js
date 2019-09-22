const https = require(`https`);
const libxml = require(`libxmljs`);

const SCHEMA_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/QLC+_4.11.2/resources/schemas/fixture.xsd`;

/**
 * @param {Object} exportFile The file returned by the plugins' export module.
 * @param {String} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {String} exportFile.content File content.
 * @param {String} exportFile.mimetype File mime type.
 * @param {Array.<Fixture>|null} exportFile.fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {String|null} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {Promise.<undefined, Array.<String>|String>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
**/
module.exports = async function testSchemaConformity(exportFile) {
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
