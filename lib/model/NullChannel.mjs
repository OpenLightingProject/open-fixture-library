import uuidv4 from 'uuid/v4';

import Channel from './Channel.mjs';

// dummy channel used to represent null in a mode's channel list
export default class NullChannel extends Channel {
  constructor(fixture) {
    super(`null-${uuidv4()}`, {
      name: `No Function`,
      type: `Nothing`
    }, fixture);
  }
}
