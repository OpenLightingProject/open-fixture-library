module.exports.name = 'Open Fixture Library JSON';
module.exports.version = require('../../fixtures/schema.js').VERSION;

module.exports.export = function exportOFL(fixtures, options) {
  return fixtures.map(fixture => {
    const jsonData = {
      schema: `https://github.com/FloEdelmann/open-fixture-library/blob/schema-${module.exports.version}/fixtures/schema.js`,
      schemaVersion: module.exports.version
    };
    Object.assign(jsonData, fixture.jsonObject);

    return {
      name: fixture.manufacturer.key + '/' + fixture.key + '.json',
      content: JSON.stringify(jsonData, null, 2),
      mimetype: 'application/ofl-fixture'
    };
  });
};