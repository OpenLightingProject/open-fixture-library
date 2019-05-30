// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

/* eslint-disable no-unused-vars */
const {
  Fixture
} = require(`../model.js`);
/* eslint-enable no-unused-vars */

const register = require(`../../fixtures/register.json`);

const schemaProperties = require(`../../lib/schema-properties.mjs`).default;

/** @type {Array.<string>} */
const redirectReasons = schemaProperties.fixtureRedirect.reason.enum;

module.exports = redirectReasons.map(reason => ({
  id: `redirect-reason-${reason}`,
  name: `Fixture redirect reason ${reason}`,
  description: `Whether the fixture is a fixture redirect with reason '${reason}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture is a fixture redirect with the current reason
   */
  hasFeature: fixture => {
    const manFix = `${fixture.manufacturer.key}/${fixture.key}`;
    const registerItem = register.filesystem[manFix];
    return `redirectTo` in registerItem && registerItem.reason === reason;
  }
}));
