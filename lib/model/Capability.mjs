import Range from './Range.mjs';

export default class Capability {
  constructor(jsonObject, fineness, channel) {
    this.jsonObject = jsonObject; // calls the setter
    this._fineness = fineness;
    this._channel = channel;
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @returns {!Range} The capability's DMX bounds in the channel's highest fineness.
   */
  get dmxRange() {
    if (!(`dmxRange` in this._cache)) {
      this._cache.dmxRange = new Range([
        this._jsonObject.dmxRange[0] * Math.pow(256, this._channel.maxFineness - this._fineness),
        ((this._jsonObject.dmxRange[1] + 1) * Math.pow(256, this._channel.maxFineness - this._fineness)) - 1
      ]);
    }
    return this._cache.dmxRange;
  }

  /**
   * @param {!number} fineness The grade of fineness the dmxRange should be scaled to.
   * @returns {!Range} The capability's DMX bounds scaled (down) to the given fineness.
   */
  getDmxRangeWithFineness(fineness) {
    const max = this._channel.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a positive integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    return new Range([
      Math.floor(this.dmxRange.start / Math.pow(256, max - fineness)),
      Math.floor(this.dmxRange.end / Math.pow(256, max - fineness))
    ]);
  }

  /**
   * @returns {!string} Short one-line description of the capability
   */
  get comment() {
    // TODO: auto-generate comment if not set manually
    return this._jsonObject.comment || ``;
  }

  get menuClick() {
    return this._jsonObject.menuClick || `start`;
  }

  get menuClickDmxValue() {
    switch (this.menuClick) {
      case `start`:
        return this.dmxRange.start;

      case `center`:
        return this.dmxRange.center;

      case `end`:
        return this.dmxRange.end;

      case `hidden`:
      default: // default will never happen
        return -1;
    }
  }

  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }
}
