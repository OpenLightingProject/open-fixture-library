const path = require('path');
const uuidv4 = require('uuid/v4');

const AbstractChannel = require(path.join(__dirname, 'AbstractChannel.js'));

// dummy channel used to represent null in a mode's channel list
module.exports = class NullChannel extends AbstractChannel {
  constructor(fixture) {
    super(`null-${uuidv4()}`);

    this._fixture = fixture;
  }

  get fixture() {
    return this._fixture;
  }

  // overrides AbstractChannel.name
  get name() {
    return 'No function';
  }

  get type() {
    return 'Nothing';
  }
};