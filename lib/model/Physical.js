module.exports = class Physical {
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get dimensions() {
    return this._jsonObject.dimensions || null;
  }

  get width() {
    return this.dimensions !== null ? this.dimensions[0] : null;
  }

  get height() {
    return this.dimensions !== null ? this.dimensions[1] : null;
  }

  get depth() {
    return this.dimensions !== null ? this.dimensions[2] : null;
  }

  get weight() {
    return this._jsonObject.weight || null;
  }

  get power() {
    return this._jsonObject.power || null;
  }

  get DMXconnector() {
    return this._jsonObject.DMXconnector || null;
  }


  get hasBulb() {
    return 'bulb' in this._jsonObject;
  }

  get bulbType() {
    return this.hasBulb ? this._jsonObject.bulb.type || null : null;
  }

  get bulbColorTemperature() {
    return this.hasBulb ? this._jsonObject.bulb.colorTemperature || null : null;
  }

  get bulbLumens() {
    return this.hasBulb ? this._jsonObject.bulb.lumens || null : null;
  }


  get hasLens() {
    return 'lens' in this._jsonObject;
  }

  get lensName() {
    return this.hasLens ? this._jsonObject.lens.name || null : null;
  }

  get lensDegreesMin() {
    return this.hasLens && 'degreesMinMax' in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[0] : null;
  }

  get lensDegreesMax() {
    return this.hasLens && 'degreesMinMax' in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[1] : null;
  }


  get hasFocus() {
    return 'focus' in this._jsonObject;
  }

  get focusType() {
    return this.hasFocus ? this._jsonObject.focus.type || null : null;
  }

  get focusPanMax() {
    return this.hasFocus ? this._jsonObject.focus.panMax || null : null;
  }

  get focusTiltMax() {
    return this.hasFocus ? this._jsonObject.focus.tiltMax || null : null;
  }
};