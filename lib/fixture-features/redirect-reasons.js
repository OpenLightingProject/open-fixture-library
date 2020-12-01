/** @typedef {import('../model/Fixture.js').default} Fixture */

const importJson = require(`../import-json.js`);
const schemaProperties = require(`../../lib/schema-properties.js`).default;

const registerPromise = importJson(`../../fixtures/register.json`, __dirname);

/** @type {Array.<String>} */
const redirectReasons = schemaProperties.fixtureRedirect.reason.enum;

module.exports = redirectReasons.map(reason => ({
  id: `redirect-reason-${reason}`,
  name: `Fixture redirect reason ${reason}`,
  description: `Whether the fixture is a fixture redirect with reason '${reason}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Promise.<Boolean>} A Promise that resolves to true if the fixture is a fixture redirect with the current reason
   */
  hasFeature: async fixture => {
    const register = await registerPromise;
    const manufacturerFixture = `${fixture.manufacturer.key}/${fixture.key}`;
    const registerItem = register.filesystem[manufacturerFixture];
    return `redirectTo` in registerItem && registerItem.reason === reason;
  },
}));
