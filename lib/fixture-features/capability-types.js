/** @typedef {import('../model/Fixture.js').default} Fixture */

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const schemaProperties = require(`../../lib/schema-properties.js`).default;
const capabilityTypes = Object.keys(schemaProperties.capabilityTypes);

module.exports = capabilityTypes.map(type => ({
  id: `capability-type-${type}`,
  name: `Capability type ${type}`,
  description: `Whether the fixture has at least one capability of type '${type}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture has at least one capability of the current type
   */
  hasFeature: fixture => fixture.coarseChannels.some(
    channel => channel.capabilities.some(
      cap => cap.type === type
    )
  )
}));
