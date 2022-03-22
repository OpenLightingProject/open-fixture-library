/** @typedef {import('../model/Fixture.js').default} Fixture */

import { wheelSlotTypes } from '../../lib/schema-properties.js';

const wheelTypes = [
  ...Object.keys(wheelSlotTypes).filter(type => !type.startsWith(`AnimationGobo`)),
  `AnimationGobo`,
];

const wheelTypeFeatures = wheelTypes.map(type => ({
  id: `wheel-type-${type}`,
  name: `Wheel type ${type}`,
  description: `Whether the fixture has at least one wheel of type '${type}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture has at least one wheel of the current type
   */
  hasFeature: fixture => fixture.wheels.some(
    wheel => wheel.type === type,
  ),
}));

const wheelSlotTypeFeatures = Object.keys(wheelSlotTypes).map(type => ({
  id: `wheel-slot-type-${type}`,
  name: `Wheel slot type ${type}`,
  description: `Whether the fixture has at least one wheel slot of type '${type}'`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture has at least one wheel slot of the current type
   */
  hasFeature: fixture => fixture.wheels.some(
    wheel => wheel.slots.some(
      slot => slot.type === type,
    ),
  ),
}));

const resourceFeature = {
  id: `wheel-slot-uses-resource`,
  name: `Wheel slot uses resource`,
  description: `Whether the fixture has at least one wheel slot that references a resource`,

  /**
   * @param {Fixture} fixture The Fixture instance
   * @returns {boolean} true if the fixture has at least one wheel slot that references a resource
   */
  hasFeature: fixture => fixture.wheels.some(
    wheel => wheel.slots.some(
      slot => slot.resource !== null,
    ),
  ),
};

export default [...wheelTypeFeatures, ...wheelSlotTypeFeatures, resourceFeature];
