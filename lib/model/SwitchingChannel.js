module.exports = class SwitchingChannel {
  constructor(key, triggerChannel) {
    this._key = key;
    this.triggerChannel = triggerChannel; // calls the setter
  }

  get key() {
    return this._key;
  }

  set triggerChannel(triggerChannel) {
    this._triggerChannel = triggerChannel;
    this._cache = {};
  }

  get triggerChannelKey() {
    return this._triggerChannel.key;
  }

  get triggerCapabilities() {
    if (!('triggerCapabilities' in this._cache)) {
      this._cache.triggerCapabilities = [];
      for (const cap of this._triggerChannel.capabilities) {
        this._cache.triggerCapabilities.push({
          range: cap.range,
          switchTo: cap.switchChannels[this.key]
        });
      }
    }

    return this._cache.triggerCapabilities;
  }

  get defaultChannel() {
    if (!('defaultChannel' in this._cache)) {
      for (const cap of this.triggerCapabilities) {
        if (cap.range[0] <= this._triggerChannel.defaultValue
          && cap.range[1] >= this._triggerChannel.defaultValue) {
          this._cache.defaultChannel = cap.switchTo;
        }
      }
    }

    return this._cache.defaultChannel;
  }

  // returns a Set of channel keys to which this channel can be switched
  get switchToChannels() {
    if (!('switchToChannels' in this._cache)) {
      this._cache.switchToChannels = new Set();

      for (const cap of this.triggerCapabilities) {
        this._cache.switchToChannels.add(cap.switchTo);
      }
    }

    return this._cache.switchToChannels;
  }
};