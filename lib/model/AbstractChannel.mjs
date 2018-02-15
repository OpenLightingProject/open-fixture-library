export default class AbstractChannel {
  constructor(key) {
    // abstract class
    if (new.target === AbstractChannel) {
      throw new TypeError(`Cannot instantiate AbstractChannel directly`);
    }

    // abstract property
    if (!(`fixture` in new.target.prototype)) {
      throw new TypeError(`Class ${this.constructor.name} must implement property fixture`);
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

  get uniqueName() {
    return this.fixture.uniqueChannelNames[this.key];
  }
}
