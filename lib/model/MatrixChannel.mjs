/**
 * Wraps a channel that is associated to a certain pixel defined in the fixture's matrix structure.
 * Holds the pixel information (instead of the wrapped channel itself).
 */
export default class MatrixChannel {
  /**
   * Create a MatrixChannel instance that wraps the given channel and holds the pixelKey and XYZ position data.
   * @param {!AbstractChannel} wrappedChannel The actual channel with all channel data.
   * @param {!string} pixelKey The pixel (group) key to which this MatrixChannel belongs.
   */
  constructor(wrappedChannel, pixelKey) {
    this._wrappedChannel = wrappedChannel;
    this._pixelKey = pixelKey;
    this._cache = {};
  }

  /**
   * @returns {!string} The key of the wrapped channel.
   */
  get key() {
    return this._wrappedChannel.key;
  }

  /**
   * @returns {!AbstractChannel} The wrapped channel.
   */
  get wrappedChannel() {
    return this._wrappedChannel;
  }

  /**
   * @returns {!string} The pixelKey or pixelGroupKey of this channel.
   */
  get pixelKey() {
    return this._pixelKey;
  }

  /**
   * @returns {?Array.<number>} The XYZ position of this pixel as an numeric array. Null if this is a pixelGroupKey.
   */
  get position() {
    return this._wrappedChannel.fixture.matrix.pixelKeyPositions[this._pixelKey] || null;
  }
}
