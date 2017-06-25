module.exports = class Physical {
  constructor(jsonObject) {
    this.jsonObject = jsonObject;
  }

  get dimensions() {
    return this.jsonObject.dimensions || null;
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
    return this.jsonObject.weight || null;
  }

  get power() {
    return this.jsonObject.power || null;
  }

  get DMXconnector() {
    return this.jsonObject.DMXconnector || null;
  }


  get hasBulb() {
    return 'bulb' in this.jsonObject;
  }

  get bulbType() {
    return this.hasBulb ? this.jsonObject.bulb.type || null : null;
  }

  get bulbColorTemperature() {
    return this.hasBulb ? this.jsonObject.bulb.colorTemperature || null : null;
  }

  get bulbLumens() {
    return this.hasBulb ? this.jsonObject.bulb.lumens || null : null;
  }


  get hasLens() {
    return 'lens' in this.jsonObject;
  }

  get lensName() {
    return this.hasLens ? this.jsonObject.lens.name || null : null;
  }

  get lensDegreesMin() {
    return this.hasLens && 'degreesMinMax' in this.jsonObject.lens ? this.jsonObject.lens.degreesMinMax[0] : null;
  }

  get lensDegreesMax() {
    return this.hasLens && 'degreesMinMax' in this.jsonObject.lens ? this.jsonObject.lens.degreesMinMax[1] : null;
  }


  get hasFocus() {
    return 'focus' in this.jsonObject;
  }

  get focusType() {
    return this.hasFocus ? this.jsonObject.focus.type || null : null;
  }

  get focusPanMax() {
    return this.hasFocus ? this.jsonObject.focus.panMax || null : null;
  }

  get focusTiltMax() {
    return this.hasFocus ? this.jsonObject.focus.tiltMax || null : null;
  }
};