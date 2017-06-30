const path = require('path');
const Color = require('color');

const Range = require(path.join(__dirname, 'Range.js'));

module.exports = class Capability {
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
  }


  get range() {
    return new Range(this._jsonObject.range); // required
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