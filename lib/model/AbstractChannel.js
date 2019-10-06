/** @ignore @typedef {import('./Fixture.js').default} Fixture */

/**
 * Base class for channels.
 * @abstract
 */
class AbstractChannel {
  /**
   * Create a new AbstractChannel instance. Call this from child classes as `super(key)`.
   * @param {String} key The channel's identifier, must be unique in the fixture.
   * @throws {TypeError} If the AbstractChannel is instantiated directly.
   */
  constructor(key) {
    if (this.constructor === AbstractChannel) {
      throw new TypeError(`Cannot instantiate AbstractChannel directly`);
    }

    this._key = key;
    this._pixelKey = null;
  }

  /**
   * @abstract
   * @returns {Fixture} The fixture instance this channel is associated to.
   * @throws {TypeError} If this property is not overridden in child classes.
   */
  get fixture() {
    throw new TypeError(`Class ${this.constructor.name} must implement property fixture`);
  }

  /**
   * @returns {String} The channel key.
   */
  get key() {
    return this._key;
  }

  /**
   * Override this method for more sensible implementation.
   * @returns {String} The channel key (as name).
   */
  get name() {
    return this._key;
  }

  /**
   * @see {@link Fixture#uniqueChannelNames}
   * @returns {String} Unique version of this channel's name.
   */
  get uniqueName() {
    return this.fixture.uniqueChannelNames[this.key];
  }

  /**
   * @param {String} pixelKey The key of the pixel (group) that this channel is associated to. Set to null to dereference a channel from a pixel (group).
   */
  set pixelKey(pixelKey) {
    this._pixelKey = pixelKey;
  }

  /**
   * @returns {String} The key of the pixel (group) that this channel is associated to. Defaults to null.
   */
  get pixelKey() {
    return this._pixelKey;
  }
}

export default AbstractChannel;
