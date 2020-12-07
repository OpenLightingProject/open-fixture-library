/** @typedef {import('../model/Fixture.js').default} Fixture */

import schemaProperties from '../../lib/schema-properties.js';
const capabilityTypes = Object.keys(schemaProperties.capabilityTypes);

export default capabilityTypes.map(type => ({
  id: `capability-type-${type}`,
  name: `Capability type ${type}`,
  description: `Whether the fixture has at least one capability of type '${type}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {Boolean} true if the fixture has at least one capability of the current type
   */
  hasFeature: fixture => fixture.coarseChannels.some(
    channel => channel.capabilities.some(
      capability => capability.type === type,
    ),
  ),
}));
