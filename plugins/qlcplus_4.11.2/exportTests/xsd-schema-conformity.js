const https = require(`https`);
const xsd = require(`libxml-xsd`);

const SCHEMA_URL = `https://raw.githubusercontent.com/mcallegari/qlcplus/QLC+_4.11.2/resources/schemas/fixture.xsd`;

module.exports = function testSchemaConformity(exportFileData) {
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
          reject(err);
        }
        else {
          schema.validate(exportFileData, (err, validationErrors) => {
            if (err) {
              reject(err);
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
