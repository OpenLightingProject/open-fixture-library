/**
 * Base class for channels.
 * @abstract
*/
export default class AbstractChannel {
  /**
   * Create a new Channel instance. Call this from child classes as super(key).
   * @param {!string} key The channel's identifier, must be unique in the fixture.
   */
  constructor(key) {
    if (this.constructor === AbstractChannel) {
      throw new TypeError(`Cannot instantiate AbstractChannel directly`);
    }

    this._key = key;
    this._pixelKey = null;
  }

  /**
   * @returns {!Fixture} The fixture instance this channel is associated to.
   * @abstract
   */
  get fixture() {
    throw new TypeError(`Class ${this.constructor.name} must implement property fixture`);
  }

  /**
   * @returns {!object} The channel key.
   */
  get key() {
    return this._key;
  }

  /**
   * Override this method for more sensible implementation.
   * @returns {!string} The channel key (as name).
   */
  get name() {
    return this._key;
  }

  /**
   * @see Fixture.uniqueChannelNames
   * @returns {!string} Unique versions of this channel's name.
   */
  get uniqueName() {
    return this.fixture.uniqueChannelNames[this.key];
  }

  set pixelKey(pixelKey) {
    this._pixelKey = pixelKey;
  }

  get pixelKey() {
    return this._pixelKey;
  }
}
