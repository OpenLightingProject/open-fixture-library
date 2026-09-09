import CoarseChannel from './CoarseChannel.js';
/** @import Fixture from './Fixture.js' */

/**
 * Dummy channel used to represent `null` in a mode's channel list.
 * @extends CoarseChannel
 */
class NullChannel extends CoarseChannel {
  /**
   * Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
   * Uses a numbered, unique key while always displaying the name "No Function".
   * @param {Readonly<Fixture>} fixture - The fixture this channel is associated to.
   * @param {number} number - The channel's number, used to make the key unique.
   */
  constructor(fixture, number) {
    super(`No Function ${number}`, {
      name: 'No Function',
      capability: {
        type: 'NoFunction',
      },
    }, fixture);
  }
}

export default NullChannel;
