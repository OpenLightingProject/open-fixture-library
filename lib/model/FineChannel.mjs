import AbstractChannel from './AbstractChannel.mjs';
import CoarseChannel from './CoarseChannel.mjs';

/**
 * Represents a finer channel of a 16+ bit channel.
 * Also called LSB (least significant byte) channel.
 * @extends AbstractChannel
 */
class FineChannel extends AbstractChannel {
  /**
   * Creates a new FineChannel instance.
   * @param {string} key The fine channel alias as defined in the coarse channel.
   * @param {CoarseChannel} coarseChannel The coarse (MSB) channel.
   */
  constructor(key, coarseChannel) {
    super(key);
    this.coarseChannel = coarseChannel; // calls the setter
  }

  /**
   * Sets a new coarse channel and clears the cache.
   * @param {CoarseChannel} coarseChannel The new coarse channel.
   */
  set coarseChannel(coarseChannel) {
    this._coarseChannel = coarseChannel;
    this._cache = {};
  }

  /**
   * @returns {CoarseChannel} The coarse (MSB) channel.
   */
  get coarseChannel() {
    return this._coarseChannel;
  }

  /**
   * @returns {Channel|FineChannel} The next coarser channel. May also be a fine channel, if this fine channel's resolution is 24bit or higher.
   */
  get coarserChannel() {
    return this.resolution === CoarseChannel.RESOLUTION_16BIT ? this.coarseChannel : this.coarseChannel.fineChannels[this.resolution - 3];
  }

  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} A generated channel name, based upon the coarse channel's name.
   */
  get name() {
    return `${this.coarseChannel.name} fine${this.resolution > CoarseChannel.RESOLUTION_16BIT ? `^${this.resolution - 1}` : ``}`;
  }

  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture this channel belongs to.
   */
  get fixture() {
    return this.coarseChannel.fixture;
  }

  /**
   * @returns {Resolution} The resolution of this fine channel. E.g. 2 (16bit) for the first fine channel, 3 (24bit) for the second fine channel, etc.
   */
  get resolution() {
    return this._coarseChannel.fineChannelAliases.indexOf(this.key) + 2;
  }

  /**
   * @returns {number} The DMX value (from 0 to 255) this channel should be set to by default.
   */
  get defaultValue() {
    return this._coarseChannel.getDefaultValueWithResolution(this.resolution) % 256;
  }
}

export default FineChannel;
