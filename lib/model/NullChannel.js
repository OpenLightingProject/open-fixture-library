const path = require('path');
const uuidv4 = require('uuid/v4');

const AbstractChannel = require(path.join(__dirname, 'AbstractChannel.js'));

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
};