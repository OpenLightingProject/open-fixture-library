/** @typedef {import('../model/Fixture.js').default} Fixture */

import { capabilityTypes } from '../../lib/schema-properties.js';

export default Object.keys(capabilityTypes).map(type => ({
  id: `capability-type-${type}`,
  name: `Capability type ${type}`,
  description: `Whether the fixture has at least one capability of type '${type}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture has at least one capability of the current type
   */
  hasFeature: fixture => fixture.coarseChannels.some(
    channel => channel.capabilities.some(
      capability => capability.type === type,
    ),
  ),
}));
