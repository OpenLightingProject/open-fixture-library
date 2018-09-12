/**
 * A fixture's technical data, refering to the hardware and not the DMX protocol.
 */
class Physical {
  /**
   * Creates a new Physical instance.
   * @param {!object} jsonObject A fixture's or mode's physical JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }

  /**
   * @returns {!object} The object from the JSON data that is represented by this Physical object.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {?Array.<number>} Width, height and depth of the fixture in millimeters. Defaults to null.
   */
  get dimensions() {
    return this._jsonObject.dimensions || null;
  }

  /**
   * @returns {?number} Width of the fixture in millimeters. Defaults to null.
   */
  get width() {
    return this.dimensions !== null ? this.dimensions[0] : null;
  }

  /**
   * @returns {?number} Height of the fixture in millimeters. Defaults to null.
   */
  get height() {
    return this.dimensions !== null ? this.dimensions[1] : null;
  }

  /**
   * @returns {?number} Depth of the fixture in millimeters. Defaults to null.
   */
  get depth() {
    return this.dimensions !== null ? this.dimensions[2] : null;
  }

  /**
   * @returns {?number} Weight of the fixture in kilograms. Defaults to null.
   */
  get weight() {
    return this._jsonObject.weight || null;
  }

  /**
   * @returns {?number} Power consumption of the fixture in Watt. Defaults to null.
   */
  get power() {
    return this._jsonObject.power || null;
  }

  /**
   * @returns {?string} The DMX plug to be used to control the fixture, e.g. "3-pin" (XLR). Defaults to null.
   */
  get DMXconnector() {
    return this._jsonObject.DMXconnector || null;
  }


  /**
   * @returns {?boolean} Whether physical data about the light source is available.
   */
  get hasBulb() {
    return `bulb` in this._jsonObject;
  }

  /**
   * @returns {?string} The kind of lamp that is used in the fixture, e.g. "LED". Defaults to null.
   */
  get bulbType() {
    return this.hasBulb ? (this._jsonObject.bulb.type || null) : null;
  }

  /**
   * @returns {?number} The color temperature of the bulb in Kelvin. Defaults to null.
   */
  get bulbColorTemperature() {
    return this.hasBulb ? (this._jsonObject.bulb.colorTemperature || null) : null;
  }

  /**
   * @returns {?number} The luminous flux of the bulb in Lumens. Defaults to null.
   */
  get bulbLumens() {
    return this.hasBulb ? (this._jsonObject.bulb.lumens || null) : null;
  }


  /**
   * @returns {?boolean} Whether physical data about the lens is available.
   */
  get hasLens() {
    return `lens` in this._jsonObject;
  }

  /**
   * @returns {?string} The kind of lens that is used in the fixture, e.g. "Fresnel". Defaults to null.
   */
  get lensName() {
    return this.hasLens ? (this._jsonObject.lens.name || null) : null;
  }

  /**
   * @returns {?number} The minimum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMin() {
    return this.hasLens && `degreesMinMax` in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[0] : null;
  }

  /**
   * @returns {?number} The maximum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMax() {
    return this.hasLens && `degreesMinMax` in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[1] : null;
  }


  /**
   * @returns {?boolean} Whether physical data about the focus is available.
   */
  get hasFocus() {
    return `focus` in this._jsonObject;
  }

  /**
   * @returns {'Fixed'|'Head'|'Mirror'|'Barrel'|null} Whether and how this fixture can change its focus point. Defaults to null.
   */
  get focusType() {
    return this.hasFocus ? (this._jsonObject.focus.type || null) : null;
  }

  /**
   * @returns {?number} The maximum angle in degrees that this fixture can rotate in horizontal direction (Pan). Infinity if continuous pan is possible. Defaults to null.
   */
  get focusPanMax() {
    if (this.hasFocus && `panMax` in this._jsonObject.focus) {
      if (this._jsonObject.focus.panMax === `infinite`) {
        return Number.POSITIVE_INFINITY;
      }
      return this._jsonObject.focus.panMax;
    }
    return null;
  }

  /**
   * @returns {?number} The maximum angle in degrees that this fixture can rotate in vertical direction (Tilt). Infinity if continuous pan is possible. Defaults to null.
   */
  get focusTiltMax() {
    if (this.hasFocus && `tiltMax` in this._jsonObject.focus) {
      if (this._jsonObject.focus.tiltMax === `infinite`) {
        return Number.POSITIVE_INFINITY;
      }
      return this._jsonObject.focus.tiltMax;
    }
    return null;
  }


  /**
   * @returns {!boolean} Whether physical data about the matrix is available.
   */
  get hasMatrixPixels() {
    return `matrixPixels` in this._jsonObject;
  }

  /**
   * @returns {?Array.<number>} Width, height, depth of a matrix pixel in mm.
   */
  get matrixPixelsDimensions() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.dimensions : null;
  }

  /**
   * @returns {?Array.<number>} XYZ-Spacing between matrix pixels in mm.
   */
  get matrixPixelsSpacing() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.spacing : null;
  }
}

export default Physical;
