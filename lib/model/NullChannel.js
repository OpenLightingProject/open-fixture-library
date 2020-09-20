import { v4 as uuidv4 } from 'uuid';

import CoarseChannel from './CoarseChannel.js';

/**
 * Dummy channel used to represent `null` in a mode's channel list.
 * @extends CoarseChannel
 */
class NullChannel extends CoarseChannel {
  /**
   * Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
   * Uses a unique uuid as channel key.
   * @param {Fixture} fixture The fixture this channel is associated to.
   */
  constructor(fixture) {
    super(`null-${uuidv4()}`, {
      name: `No Function`,
      capability: {
        type: `NoFunction`,
      },
    }, fixture);
  }
}

export default NullChannel;
