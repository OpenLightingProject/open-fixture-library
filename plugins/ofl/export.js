const manufacturers = require(`../../fixtures/manufacturers.json`);

module.exports.name = `Open Fixture Library JSON`;
module.exports.version = require(`../../fixtures/schema.js`).VERSION;

module.exports.export = function exportOFL(fixtures, options) {
  const usedManufacturers = new Set();

  // JSON file for each fixture
  const files = fixtures.map(fixture => {
    usedManufacturers.add(fixture.manufacturer.key);

    const jsonData = {
      schema: `https://github.com/FloEdelmann/open-fixture-library/blob/schema-${module.exports.version}/fixtures/schema.js`,
      schemaVersion: module.exports.version
    };
    Object.assign(jsonData, fixture.jsonObject);

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: JSON.stringify(jsonData, null, 2),
      mimetype: `application/ofl-fixture`,
      fixtures: [fixture]
    };
  });

  // manufacturers.json file
  const usedManufacturerData = {};
  for (const man of Object.keys(manufacturers).sort()) {
    if (usedManufacturers.has(man)) {
      usedManufacturerData[man] = manufacturers[man];
    }
  }
  files.push({
    name: `manufacturers.json`,
    content: JSON.stringify(usedManufacturerData, null, 2),
    mimetype: `application/ofl-manufacturers`
  });

  return files;
};