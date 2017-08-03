module.exports = class Physical {
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
  }

  // used to combine with a mode's physical override
  get jsonObject() {
    return this._jsonObject;
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
    return this.hasBulb ? (this._jsonObject.bulb.type || null) : null;
  }

  get bulbColorTemperature() {
    return this.hasBulb ? (this._jsonObject.bulb.colorTemperature || null) : null;
  }

  get bulbLumens() {
    return this.hasBulb ? (this._jsonObject.bulb.lumens || null) : null;
  }


  get hasLens() {
    return 'lens' in this._jsonObject;
  }

  get lensName() {
    return this.hasLens ? (this._jsonObject.lens.name || null) : null;
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
    return this.hasFocus ? (this._jsonObject.focus.type || null) : null;
  }

  get focusPanMax() {
    return this.hasFocus && 'panMax' in this._jsonObject.focus ? this._jsonObject.focus.panMax : null;
  }
  
  get focusTiltMax() {
    return this.hasFocus && 'tiltMax' in this._jsonObject.focus ? this._jsonObject.focus.tiltMax : null;
  }


  /**
   * @return {!boolean} Whether there is matrix information in this physical.
   */
  get hasMatrixPixels() {
    return 'matrixPixels' in this._jsonObject;
  }

  /**
   * @return {?number[]} Width, height, depth of a matrix pixel in mm.
   */
  get matrixPixelsDimensions() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.dimensions : null;
  }

  /**
   * @return {?number[]} XYZ-Spacing between matrix pixels in mm.
   */
  get matrixPixelsSpacing() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.spacing  : null;
  }
};
