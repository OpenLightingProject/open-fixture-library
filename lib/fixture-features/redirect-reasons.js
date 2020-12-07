/** @typedef {import('../model/Fixture.js').default} Fixture */

import importJson from '../import-json.js';
import schemaProperties from '../../lib/schema-properties.js';

const registerPromise = importJson(`../../fixtures/register.json`, import.meta.url);

/** @type {Array.<String>} */
const redirectReasons = schemaProperties.fixtureRedirect.reason.enum;

export default redirectReasons.map(reason => ({
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
