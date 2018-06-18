const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);

module.exports.name = `Millumin`;
module.exports.version = `0.1.0`;

// needed for export test
module.exports.supportedOflVersion = `7.2.0`;

module.exports.export = function exportMillumin(fixtures, options) {
  // one JSON file for each fixture
  return fixtures.map(fixture => {
    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-${module.exports.supportedOflVersion}/schemas/fixture.json`;

    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturerKey = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    downgradePhysical(jsonData.physical);
    jsonData.modes.forEach(mode => downgradePhysical(mode.physical));

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: fixtureJsonStringify(jsonData),
      mimetype: `application/ofl-fixture`
    };
  });
};

/**
 * Downgrades the given physical JSON object by replacing infinite pan/tilt maximum with 9999 degrees.
 * @param {!Physical} physical The physical data to downgrade.
 */
function downgradePhysical(physical) {
  if (physical && physical.focus) {
    if (physical.focus.panMax === `infinite`) {
      physical.focus.panMax = 9999;
    }
    if (physical.focus.tiltMax === `infinite`) {
      physical.focus.tiltMax = 9999;
    }
  }
}
