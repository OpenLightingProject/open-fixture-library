const path = require('path');

const AbstractChannel = require(path.join(__dirname, 'AbstractChannel.js'));
const Range = require(path.join(__dirname, 'Range.js'));

module.exports = class SwitchingChannel extends AbstractChannel {
  constructor(key, triggerChannel) {
    super(key);
    this.triggerChannel = triggerChannel; // calls the setter
  }

  set triggerChannel(triggerChannel) {
    this._triggerChannel = triggerChannel;
    this._cache = {};
  }

  get triggerChannel() {
    return this._triggerChannel;
  }

  // must be implemented when extending AbstractChannel
  get fixture() {
    return this.triggerChannel.fixture;
  }

  get triggerCapabilities() {
    if (!('triggerCapabilities' in this._cache)) {
      this._cache.triggerCapabilities = this.triggerChannel.capabilities.map(
        cap => ({
          range: cap.range,
          switchTo: cap.switchChannels[this.key]
        })
      );
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

  get defaultChannelKey() {
    if (!('defaultChannelKey' in this._cache)) {
      this._cache.defaultChannelKey = this.triggerCapabilities.find(
        cap => cap.range.contains(this._triggerChannel.defaultValue)
      ).switchTo;
    }

    return this._cache.defaultChannelKey;
  }

  get defaultChannel() {
    if (!('defaultChannel' in this._cache)) {
      this._cache.defaultChannel = this.fixture.getChannelByKey(this.defaultChannelKey);
    }
    return this._cache.defaultChannel;
  }

  // returns an array of channel keys to which this channel can be switched
  get switchToChannels() {
    if (!('switchToChannels' in this._cache)) {
      this._cache.switchToChannels = this.triggerCapabilities
        .map(cap => cap.switchTo)
        .filter((ch, pos, arr) => arr.indexOf(ch) === pos); // filter duplicates
    }

    return this._cache.switchToChannels;
  }
};