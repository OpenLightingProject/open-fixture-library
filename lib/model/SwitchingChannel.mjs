import AbstractChannel from './AbstractChannel.mjs';
import Range from './Range.mjs';

export default class SwitchingChannel extends AbstractChannel {
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
    if (!(`triggerCapabilities` in this._cache)) {
      this._cache.triggerCapabilities = this.triggerChannel.capabilities.map(
        cap => ({
          dmxRange: cap.dmxRange,
          switchTo: cap.switchChannels[this.key]
        })
      );
    }

    return this._cache.triggerCapabilities;
  }

  // { 'switch to channel key': array of (merged) Range objects, ... }
  get triggerRanges() {
    if (!(`triggerRanges` in this._cache)) {
      const ranges = {};

      // group ranges by switchTo
      for (const cap of this.triggerCapabilities) {
        if (!(cap.switchTo in ranges)) {
          ranges[cap.switchTo] = [];
        }
        ranges[cap.switchTo].push(cap.dmxRange);
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
    if (!(`defaultChannelKey` in this._cache)) {
      this._cache.defaultChannelKey = this.triggerCapabilities.find(
        cap => cap.dmxRange.contains(this._triggerChannel.defaultValue)
      ).switchTo;
    }

    return this._cache.defaultChannelKey;
  }

  get defaultChannel() {
    if (!(`defaultChannel` in this._cache)) {
      this._cache.defaultChannel = this.fixture.getChannelByKey(this.defaultChannelKey);
    }
    return this._cache.defaultChannel;
  }

  /**
   * @returns {!Array.<string>} All channel keys this channel can be switched to.
   */
  get switchToChannelKeys() {
    if (!(`switchToChannelKeys` in this._cache)) {
      this._cache.switchToChannelKeys = this.triggerCapabilities
        .map(cap => cap.switchTo)
        .filter((ch, pos, arr) => arr.indexOf(ch) === pos); // filter duplicates
    }

    return this._cache.switchToChannelKeys;
  }

  /**
   * @returns {!Array.<AbstractChannel, MatrixChannel>} All channels this channel can be switched to.
   */
  get switchToChannels() {
    if (!(`switchToChannels` in this._cache)) {
      this._cache.switchToChannels = this.switchToChannelKeys.map(
        chKey => this.fixture.getChannelByKey(chKey)
      );
    }

    return this._cache.switchToChannels;
  }

  /**
   * @typedef {'keyOnly'|'defaultOnly'|'switchedOnly'|'all'} SwitchingChannelBehavior
   */

  /**
   * @param {!string} chKey The channel key to search for.
   * @param {!SwitchingChannelBehavior} [where='all'] Define which channels to include in the search.
   * @returns {!boolean} Whether this SwitchingChannel contains the given channel key.
   */
  usesChannelKey(chKey, where = `all`) {
    if (where === `keyOnly`) {
      return this.key === chKey;
    }

    if (where === `defaultOnly`) {
      return this.defaultChannel.key === chKey;
    }

    if (where === `switchedOnly`) {
      return this.switchToChannelKeys.includes(chKey);
    }

    return this.switchToChannelKeys.includes(chKey) || this.key === chKey;
  }
}
