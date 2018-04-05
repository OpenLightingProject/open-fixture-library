module.exports.name = `Millumin`;
module.exports.version = `0.0.1`;

module.exports.export = function exportOFL(fixtures, options) {
  // JSON file for each fixture
  const files = fixtures.map(fixture => {
    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${module.exports.version}/schemas/fixture.json`;
    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturer = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;
    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: JSON.stringify(jsonData, null, 2),
      mimetype: `application/ofl-fixture`
    };
  });
  return files;
};
