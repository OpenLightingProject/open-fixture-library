import cacheResult from '../cache-result.js';
import AbstractChannel from './AbstractChannel.js';
/** @ignore @typedef {import('./Fixture.js').default} Fixture */
import Range from './Range.js';

/**
 * Represents a channel that switches its behavior depending on trigger channel's value.
 * The different behaviors are implemented as different {@link CoarseChannel}s or {@link FineChannel}s.
 * @extends AbstractChannel
 */
class SwitchingChannel extends AbstractChannel {
  /**
   * Creates a new SwitchingChannel instance.
   * @param {string} alias The unique switching channel alias as defined in the trigger channel's `switchChannels` properties.
   * @param {AbstractChannel} triggerChannel The channel whose DMX value this channel depends on.
   */
  constructor(alias, triggerChannel) {
    super(alias);
    this._triggerChannel = triggerChannel;
  }

  /**
   * @returns {AbstractChannel} The channel whose DMX value this switching channel depends on.
   */
  get triggerChannel() {
    return this._triggerChannel;
  }

  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture in which this channel is used.
   */
  get fixture() {
    return this.triggerChannel.fixture;
  }

  /**
   * @typedef {object} TriggerCapability
   * @property {Range} dmxRange The DMX range that triggers the switching channel.
   * @property {string} switchTo The channel to switch to in the given DMX range.
   */

  /**
   * @returns {TriggerCapability[]} The trigger channel's capabilities in a compact form to only include the DMX range and which channel should be switched to. DMX values are given in the trigger channel's highest possible resolution.
   */
  get triggerCapabilities() {
    return cacheResult(this, `triggerCapabilities`, this.triggerChannel.capabilities.map(
      capability => ({
        dmxRange: capability.dmxRange,
        switchTo: capability.switchChannels[this.key],
      }),
    ));
  }

  /**
   * @returns {Record<string, Range[]>} Keys of channels that can be switched to pointing to an array of DMX values the trigger channel must be set to to active the channel. DMX values are given in the trigger channel's highest possible resolution.
   */
  get triggerRanges() {
    const triggerRanges = {};

    // group ranges by switchTo
    for (const capability of this.triggerCapabilities) {
      if (!(capability.switchTo in triggerRanges)) {
        triggerRanges[capability.switchTo] = [];
      }
      triggerRanges[capability.switchTo].push(capability.dmxRange);
    }

    // merge each group of ranges
    for (const channel of Object.keys(triggerRanges)) {
      triggerRanges[channel] = Range.getMergedRanges(triggerRanges[channel]);
    }

    return cacheResult(this, `triggerRanges`, triggerRanges);
  }

  /**
   * @returns {string} The key of the channel that is activated when the trigger channel is set to its default value.
   */
  get defaultChannelKey() {
    return cacheResult(this, `defaultChannelKey`, this.triggerCapabilities.find(
      capability => capability.dmxRange.contains(this.triggerChannel.defaultValue),
    ).switchTo);
  }

  /**
   * @returns {AbstractChannel} The channel that is activated when the trigger channel is set to its default value.
   */
  get defaultChannel() {
    return cacheResult(this, `defaultChannel`, this.fixture.getChannelByKey(this.defaultChannelKey));
  }

  /**
   * @returns {string[]} All channel keys this channel can be switched to.
   */
  get switchToChannelKeys() {
    const switchToChannelKeys = this.triggerCapabilities
      .map(capability => capability.switchTo)
      .filter((channelKey, index, array) => array.indexOf(channelKey) === index); // filter duplicates

    return cacheResult(this, `switchToChannelKeys`, switchToChannelKeys);
  }

  /**
   * @returns {AbstractChannel[]} All channels this channel can be switched to.
   */
  get switchToChannels() {
    return cacheResult(this, `switchToChannels`, this.switchToChannelKeys.map(
      channelKey => this.fixture.getChannelByKey(channelKey),
    ));
  }

  /**
   * @typedef {'keyOnly' | 'defaultOnly' | 'switchedOnly' | 'all'} SwitchingChannelBehavior
   */

  /**
   * @param {string} channelKey The channel key to search for.
   * @param {SwitchingChannelBehavior} [switchingChannelBehavior='all'] Define which channels to include in the search.
   * @returns {boolean} Whether this SwitchingChannel contains the given channel key.
   */
  usesChannelKey(channelKey, switchingChannelBehavior = `all`) {
    if (switchingChannelBehavior === `keyOnly`) {
      return this.key === channelKey;
    }

    if (switchingChannelBehavior === `defaultOnly`) {
      return this.defaultChannel.key === channelKey;
    }

    if (switchingChannelBehavior === `switchedOnly`) {
      return this.switchToChannelKeys.includes(channelKey);
    }

    return this.switchToChannelKeys.includes(channelKey) || this.key === channelKey;
  }

  /**
   * @returns {boolean} True if help is needed in one of the switched channels, false otherwise.
   */
  get isHelpWanted() {
    return cacheResult(this, `isHelpWanted`, this.switchToChannels.some(
      channel => channel.isHelpWanted,
    ));
  }
}

export default SwitchingChannel;
