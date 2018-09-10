import AbstractChannel from './AbstractChannel.mjs';
import Range from './Range.mjs';

/**
 * Represents a channel that switches its behavior depending on an other channel's value.
 * The other channel is called trigger channel.
 * The different behaviors are implemented as different channels between this channel can be switched to.
 */
export default class SwitchingChannel extends AbstractChannel {
  /**
   * Creates a new SwitchingChannel instance.
   * @param {!string} alias The unique switching channel alias as defined in the trigger channel's "switchChannels" properties.
   * @param {!AbstractChannel} triggerChannel The channel whose DMX value this channel depends on.
   */
  constructor(alias, triggerChannel) {
    super(alias);
    this._triggerChannel = triggerChannel;
    this._cache = {};
  }

  /**
   * @returns {!AbstractChannel} The channel whose DMX value this switching channel depends on.
   */
  get triggerChannel() {
    return this._triggerChannel;
  }

  /**
   * @override
   * @returns {!Fixture} The fixture in which this channel is used.
   */
  get fixture() {
    return this.triggerChannel.fixture;
  }

  /**
   * @typedef {object} TriggerCapability
   * @property {!Range} dmxRange
   * @property {!string} switchTo
   */

  /**
   * @returns {!Array.<TriggerCapability>} The trigger channel's capabilities in a compact form to only include the DMX range and which channel should be switched to. DMX values are given in the trigger channel's highest possible resolution.
   */
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

  /**
   * @returns {!object.<string, Range>} Keys of channels that can be switched to pointing to an array of DMX values the trigger channel must be set to to active the channel. DMX values are given in the trigger channel's highest possible resolution.
   */
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

  /**
   * @returns {!string} The key of the channel that is activated if the trigger channel is set to its default value.
   */
  get defaultChannelKey() {
    if (!(`defaultChannelKey` in this._cache)) {
      this._cache.defaultChannelKey = this.triggerCapabilities.find(
        cap => cap.dmxRange.contains(this.triggerChannel.defaultValue)
      ).switchTo;
    }

    return this._cache.defaultChannelKey;
  }

  /**
   * @returns {!AbstractChannel} The channel that is activated if the trigger channel is set to its default value.
   */
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
        .filter((chKey, index, arr) => arr.indexOf(chKey) === index); // filter duplicates
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
   * @param {!SwitchingChannelBehavior} [switchingChannelBehaviour='all'] Define which channels to include in the search.
   * @returns {!boolean} Whether this SwitchingChannel contains the given channel key.
   */
  usesChannelKey(chKey, switchingChannelBehaviour = `all`) {
    if (switchingChannelBehaviour === `keyOnly`) {
      return this.key === chKey;
    }

    if (switchingChannelBehaviour === `defaultOnly`) {
      return this.defaultChannel.key === chKey;
    }

    if (switchingChannelBehaviour === `switchedOnly`) {
      return this.switchToChannelKeys.includes(chKey);
    }

    return this.switchToChannelKeys.includes(chKey) || this.key === chKey;
  }
}
