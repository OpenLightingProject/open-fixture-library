module.exports = class Capability {
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }

  get range() {
    return this._jsonObject.range;
  }

  get name() {
    return this._jsonObject.name;
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