/**
 * A fixture's technical data, belonging to the hardware and not the DMX protocol.
 */
class Physical {
  /**
   * Creates a new Physical instance.
   * @param {object} jsonObject A fixture's or mode's physical JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }

  /**
   * @returns {object} The object from the JSON data that is represented by this Physical object.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {number[] | null} Width, height and depth of the fixture in millimeters. Defaults to null.
   */
  get dimensions() {
    return this._jsonObject.dimensions || null;
  }

  /**
   * @returns {number | null} Width of the fixture in millimeters. Defaults to null.
   */
  get width() {
    return this.dimensions === null ? null : this.dimensions[0];
  }

  /**
   * @returns {number | null} Height of the fixture in millimeters. Defaults to null.
   */
  get height() {
    return this.dimensions === null ? null : this.dimensions[1];
  }

  /**
   * @returns {number | null} Depth of the fixture in millimeters. Defaults to null.
   */
  get depth() {
    return this.dimensions === null ? null : this.dimensions[2];
  }

  /**
   * @returns {number | null} Weight of the fixture in kilograms. Defaults to null.
   */
  get weight() {
    return this._jsonObject.weight || null;
  }

  /**
   * @returns {number | null} Power consumption of the fixture in watts. Defaults to null.
   */
  get power() {
    return this._jsonObject.power || null;
  }

  /**
   * @returns {Record<string, string>} Power connector information.
   */
  get powerConnectors() {
    return this._jsonObject.powerConnectors || {};
  }

  /**
   * @returns {string | null} The DMX plug to be used to control the fixture, e.g. "3-pin" (XLR). Defaults to null.
   */
  get DMXconnector() {
    return this._jsonObject.DMXconnector || null;
  }


  /**
   * @returns {boolean | null} Whether physical data about the light source is available.
   */
  get hasBulb() {
    return `bulb` in this._jsonObject;
  }

  /**
   * @returns {string | null} The kind of lamp that is used in the fixture, e.g. "LED". Defaults to null.
   */
  get bulbType() {
    return this.hasBulb ? (this._jsonObject.bulb.type || null) : null;
  }

  /**
   * @returns {number | null} The color temperature of the bulb in kelvins. Defaults to null.
   */
  get bulbColorTemperature() {
    return this.hasBulb ? (this._jsonObject.bulb.colorTemperature || null) : null;
  }

  /**
   * @returns {number | null} The luminous flux of the bulb in lumens. Defaults to null.
   */
  get bulbLumens() {
    return this.hasBulb ? (this._jsonObject.bulb.lumens || null) : null;
  }


  /**
   * @returns {boolean | null} Whether physical data about the lens is available.
   */
  get hasLens() {
    return `lens` in this._jsonObject;
  }

  /**
   * @returns {string | null} The kind of lens that is used in the fixture, e.g. "Fresnel". Defaults to null.
   */
  get lensName() {
    return this.hasLens ? (this._jsonObject.lens.name || null) : null;
  }

  /**
   * @returns {number | null} The minimum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMin() {
    return this.hasLens && `degreesMinMax` in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[0] : null;
  }

  /**
   * @returns {number | null} The maximum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMax() {
    return this.hasLens && `degreesMinMax` in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[1] : null;
  }


  /**
   * @returns {boolean} Whether physical data about the matrix is available.
   */
  get hasMatrixPixels() {
    return `matrixPixels` in this._jsonObject;
  }

  /**
   * @returns {number[] | null} Width, height, depth of a matrix pixel in millimeters.
   */
  get matrixPixelsDimensions() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.dimensions : null;
  }

  /**
   * @returns {number[] | null} XYZ-Spacing between matrix pixels in millimeters.
   */
  get matrixPixelsSpacing() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.spacing : null;
  }
}

export default Physical;
