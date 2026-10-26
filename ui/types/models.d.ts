/**
 * Type-only re-exports of the model classes from `lib/model/`.
 *
 * Import from `~/types/models` when a model class is only needed as a
 * TypeScript type, e.g. for component props. Components that need the runtime
 * class (for `instanceof` checks or `new`) should keep importing it directly
 * from `lib/model/*.js`.
 */

export type { default as AbstractChannel } from '../../lib/model/AbstractChannel.js';
export type { default as Capability } from '../../lib/model/Capability.js';
export type { default as Entity } from '../../lib/model/Entity.js';
export type { default as Fixture } from '../../lib/model/Fixture.js';
export type { default as Mode } from '../../lib/model/Mode.js';
export type { default as Physical } from '../../lib/model/Physical.js';
export type { default as Wheel } from '../../lib/model/Wheel.js';
export type { default as WheelSlot } from '../../lib/model/WheelSlot.js';
