import AbstractChannel from './AbstractChannel.js';
import CoarseChannel from './CoarseChannel.js';
/** @ignore @typedef {import('./Fixture.js').default} Fixture */

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
    this._coarseChannel = coarseChannel;
  }

  /**
   * @returns {CoarseChannel} The coarse (MSB) channel.
   */
  get coarseChannel() {
    return this._coarseChannel;
  }

  /**
   * @returns {CoarseChannel | FineChannel} The next coarser channel. May also be a fine channel, if this fine channel's resolution is 24bit or higher.
   */
  get coarserChannel() {
    return this.resolution === CoarseChannel.RESOLUTION_16BIT ? this.coarseChannel : this.coarseChannel.fineChannels[this.resolution - 3];
  }

  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} A generated channel name, based upon the coarse channel's name.
   */
  get name() {
    const suffix = this.resolution > CoarseChannel.RESOLUTION_16BIT ? `^${this.resolution - 1}` : ``;
    return `${this.coarseChannel.name} fine${suffix}`;
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
