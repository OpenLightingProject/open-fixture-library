import Color from 'color';

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
   * @returns {!Range} The capability's bounds in the channel's highest fineness.
   */
  get range() {
    if (!(`range` in this._cache)) {
      this._cache.range = new Range([
        this._jsonObject.range[0] * Math.pow(256, this._channel.maxFineness - this._fineness),
        ((this._jsonObject.range[1] + 1) * Math.pow(256, this._channel.maxFineness - this._fineness)) - 1
      ]);
    }
    return this._cache.range;
  }

  // scales down the range to match the given fineness
  getRangeWithFineness(fineness) {
    const max = this._channel.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a non-zero integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    return new Range([
      Math.floor(this.range.start / Math.pow(256, max - fineness)),
      Math.floor(this.range.end / Math.pow(256, max - fineness))
    ]);
  }

  get name() {
    return this._jsonObject.name; // required
  }

  get menuClick() {
    return this._jsonObject.menuClick || `start`;
  }

  get menuClickDmxValue() {
    switch (this.menuClick) {
      case `start`:
        return this.range.start;

      case `center`:
        return this.range.center;

      case `end`:
        return this.range.end;

      case `hidden`:
      default: // default will never happen
        return -1;
    }
  }

  get color() {
    if (`color` in this._jsonObject) {
      return new Color(this._jsonObject.color);
    }
    return null;
  }

  get color2() {
    if (`color2` in this._jsonObject) {
      return new Color(this._jsonObject.color2);
    }
    return null;
  }

  get image() {
    return this._jsonObject.image || null;
  }

  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }
}
