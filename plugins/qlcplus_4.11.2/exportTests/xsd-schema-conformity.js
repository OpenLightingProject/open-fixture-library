const https = require(`https`);
const xsd = require(`libxml-xsd`);

const SCHEMA_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/QLC+_4.11.2/resources/schemas/fixture.xsd`;

/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {!string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {!string} exportFile.content File content.
 * @param {!string} exportFile.mimetype File mime type.
 * @param {?Array.<Fixture>} exportFile.fixtures Fixture objects that are described in given file; may be ommited if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {?string} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {!Promise} Resolve when the test passes or reject with an array of errors if the test fails.
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
    .then(schemaData => new Promise((resolve, reject) => {
      xsd.parse(schemaData, (err, schema) => {
        if (err) {
          reject([err]);
        }
        else {
          schema.validate(exportFile.content, (err, validationErrors) => {
            if (err) {
              reject([err]);
            }
            else if (validationErrors) {
              reject(validationErrors.map(err => err.message));
            }
            else {
              resolve();
            }
          });
        }
      });
    }));
};
