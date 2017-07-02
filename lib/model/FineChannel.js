module.exports = class FineChannel {
  constructor(key, coarseChannel) {
    this._key = key;
    this.coarseChannel = coarseChannel; // calls the setter
  }

  set coarseChannel(coarseChannel) {
    this._coarseChannel = coarseChannel;
    this._cache = {};
  }


  get key() {
    return this._key;
  }

  get name() {
    return `${this.coarseChannel.name} fine` + (this.fineness > 1 ? `^${this.fineness}` : '');
  }

  get uniqueName() {
    return this.coarseChannel.fixture.uniqueChannelNames[this.key];
  }

  get coarseChannel() {
    return this._coarseChannel;
  }

  // 1 for 16bit, 2 for 24bit, ...
  get fineness() {
    return this._coarseChannel.fineChannelAliases.indexOf(this.key) + 1;
  }
};