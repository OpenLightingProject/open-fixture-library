/** @typedef {import('../model/Fixture.js').default} Fixture */

import { fixtureRedirectProperties } from '../../lib/schema-properties.js';
import importJson from '../import-json.js';

const registerPromise = importJson(`../../fixtures/register.json`, import.meta.url);

/** @type {string[]} */
const redirectReasons = fixtureRedirectProperties.reason.enum;

export default redirectReasons.map(reason => ({
  id: `redirect-reason-${reason}`,
  name: `Fixture redirect reason ${reason}`,
  description: `Whether the fixture is a fixture redirect with reason '${reason}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Promise<boolean>} A Promise that resolves to true if the fixture is a fixture redirect with the current reason
   */
  hasFeature: async fixture => {
    const register = await registerPromise;
    const manufacturerFixture = `${fixture.manufacturer.key}/${fixture.key}`;
    const registerItem = register.filesystem[manufacturerFixture];
    return `redirectTo` in registerItem && registerItem.reason === reason;
  },
}));
