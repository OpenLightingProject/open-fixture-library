import uuidv4 from 'uuid/v4';

import Channel from './Channel.mjs';

/**
 * Dummy channel used to represent null in a mode's channel list.
 */
export default class NullChannel extends Channel {
  /**
   * Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
   * Uses a unique uuid as channel key.
   * @param {!Fixture} fixture The fixture this channel is associated to.
   */
  constructor(fixture) {
    super(`null-${uuidv4()}`, {
      name: `No Function`,
      capability: {
        type: `NoFunction`
      }
    }, fixture);
  }
}
