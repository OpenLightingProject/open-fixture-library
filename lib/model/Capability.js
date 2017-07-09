const path = require('path');
const Color = require('color');

const Range = require(path.join(__dirname, 'Range.js'));

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

  // scales down the range to match into each possible fineness
  // e.g. [Range([1, 20]), Range([256, 5120])] in a 16bit channel
  get rangesByFineness() {
    if (!('rangesByFineness' in this._cache)) {
      this._cache.rangesByFineness = [];
      for (let i = this._channel.maxFineness; i >= 0; i--) {
        this._cache.rangesByFineness.push(new Range([
          Math.floor(this.range.start / Math.pow(256, i)),
          Math.floor(this.range.end / Math.pow(256, i))
        ]));
      }
    }

    return this._cache.rangesByFineness;
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