module.exports = class SwitchingChannel {
  constructor(key, triggerChannel) {
    this._key = key;
    this.triggerChannel = triggerChannel; // calls the setter
  }

  set triggerChannel(triggerChannel) {
    this._triggerChannel = triggerChannel;
    this._cache = {};
  }


  get key() {
    return this._key;
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

  // { 'switch to channel key': array of (merged) Range objects, ... }
  get triggerRanges() {
    if (!('triggerRanges' in this._cache)) {
      let ranges = {};

      // group ranges by switchTo
      for (const cap of this.triggerCapabilities) {
        if (!(cap.switchTo in ranges)) {
          ranges[cap.switchTo] = [];
        }
        ranges[cap.switchTo].push(cap.range);
      }

      // merge each group of ranges
      for (const ch of Object.keys(ranges)) {
        ranges[ch] = Range.mergeRanges(ranges[ch]);
      }

      this._cache.triggerRanges = ranges;
    }

    return this._cache.triggerRanges;
  }

  get defaultChannel() {
    if (!('defaultChannel' in this._cache)) {
      this._cache.defaultChannel = this.triggerCapabilities.find(
        cap => cap.range.contains(this._triggerChannel.defaultValue)
      ).switchTo;
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