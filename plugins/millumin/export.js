const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);

module.exports.name = `Millumin`;
module.exports.version = `0.2.0`;

// needed for export test
module.exports.supportedOflVersion = `7.3.0`;

module.exports.export = function exportMillumin(fixtures, options) {
  // one JSON file for each fixture
  return fixtures.map(fixture => {
    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${module.exports.supportedOflVersion}/schemas/fixture.json`;

    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturerKey = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: fixtureJsonStringify(jsonData),
      mimetype: `application/ofl-fixture`
    };
  });
};
