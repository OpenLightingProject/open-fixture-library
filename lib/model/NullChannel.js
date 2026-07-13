import CoarseChannel from './CoarseChannel.js';
/** @import Fixture from './Fixture.js' */

/**
 * Dummy channel used to represent `null` in a mode's channel list.
 * @extends CoarseChannel
 */
class NullChannel extends CoarseChannel {
  /**
   * Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
   * Uses a unique uuid as channel key.
   * @param {Readonly<Fixture>} fixture - The fixture this channel is associated to.
   */
  constructor(fixture) {
    super(`null-${crypto.randomUUID()}`, {
      name: 'No Function',
      capability: {
        type: 'NoFunction',
      },
    }, fixture);
  }
}

export default NullChannel;
