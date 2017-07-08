const path = require('path');

const AbstractChannel = require(path.join(__dirname, 'AbstractChannel.js'));
const Capability = require(path.join(__dirname, 'Capability.js'));

module.exports = class FineChannel extends AbstractChannel {
  constructor(key, coarseChannel) {
    super(key);
    this.coarseChannel = coarseChannel; // calls the setter
  }

  set coarseChannel(coarseChannel) {
    this._coarseChannel = coarseChannel;
    this._cache = {};
  }


  // overrides AbstractChannel.name
  get name() {
    return `${this.coarseChannel.name} fine` + (this.fineness > 1 ? `^${this.fineness}` : '');
  }

  get coarseChannel() {
    return this._coarseChannel;
  }

  // must be implemented when extending AbstractChannel
  get fixture() {
    return this.coarseChannel.fixture;
  }

  // 1 for 16bit, 2 for 24bit, ...
  get fineness() {
    return this._coarseChannel.fineChannelAliases.indexOf(this.key) + 1;
  }
};