const https = require(`https`);
const promisify = require(`util`).promisify;
const parseXsd = promisify(require(`libxml-xsd`).parse);

const SCHEMA_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/schemas/fixture.xsd`;

/**
 * @param {!object} exportFile The file returned by the plugins' export module.
 * @param {!string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {!string} exportFile.content File content.
 * @param {!string} exportFile.mimetype File mime type.
 * @param {?Array.<!Fixture>} exportFile.fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {?string} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {!Promise.<undefined, !Array.<!string>|!string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
**/
module.exports = function testSchemaConformity(exportFile) {
  return new Promise((resolve, reject) => {
    https.get(SCHEMA_URL, res => {
      let data = ``;
      res.on(`data`, chunk => {
        data += chunk;
      });
      res.on(`end`, () => {
        resolve(data);
      });
    });
  })
    .then(schemaData => parseXsd(schemaData))
    .then(schema => promisify(schema.validate)(exportFile.content))
    .then(validationErrors => {
      if (validationErrors) {
        return Promise.reject(validationErrors.map(err => err.message));
      }

      return Promise.resolve();
    });
};
