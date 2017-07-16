const Color = require('color');

const Range = require('./Range.js');

module.exports = class Capability {
  constructor(jsonObject, channel) {
    this.jsonObject = jsonObject; // calls the setter
    this._channel = channel;
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }


  get range() {
    return new Range(this._jsonObject.range); // required
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
    return this._jsonObject.menuClick || 'start';
  }

  get color() {
    if ('color' in this._jsonObject) {
      return new Color(this._jsonObject.color);
    }
    return null;
  }

  get color2() {
    if ('color2' in this._jsonObject) {
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
};