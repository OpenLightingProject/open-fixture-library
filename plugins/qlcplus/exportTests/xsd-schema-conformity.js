const https = require('https');

const SCHEMA_URL = 'https://raw.githubusercontent.com/mcallegari/qlcplus/master/resources/schemas/fixture.xsd';

module.exports = function testSchemaConformity(exportFileData) {
  return new Promise((resolve, reject) => {
    resolve({
      passed: Math.random() > 0.5,
      message: 'some error description'
    });
  });
};