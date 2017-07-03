module.exports = class AbstractChannel {
  constructor(key) {
    if (new.target === AbstractChannel) {
      throw new TypeError('Cannot instantiate AbstractChannel directly');
    }

    this._key = key;
  }

  get key() {
    return this._key;
  }

  // best practice is to override this method
  get name() {
    return this._key;
  }
}