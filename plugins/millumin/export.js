module.exports.name = `Millumin`;
module.exports.version = `0.0.1`;

module.exports.export = function exportMillumin(fixtures, options) {
  // one JSON file for each fixture
  return fixtures.map(fixture => {
    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-7.0.0/schemas/fixture.json`;

    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturerKey = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: JSON.stringify(jsonData, null, 2),
      mimetype: `application/ofl-fixture`
    };
  });
};
