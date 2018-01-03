/**
 * Contains information of how the pixels in a 1-, 2- or 3-dimensional space are arranged and named.
 */
module.exports = class Matrix {
  /**
   * @param {!object} jsonObject The fixture's json object containg the matrix information.
   */
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }

  /**
   * Updates the json object and clears the cache used for expensive parameters.
   * @param {!object} jsonObject The fixture's json object containg the matrix information.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @returns {!object} The fixture's json object containg the matrix information.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {!Array.<number>} Amount of pixels in x, y and z direction. A horizontal bar with 4 LEDs would be [4, 1, 1], a 5x5 pixel head would be [5, 5, 1].
   */
  get pixelCount() {
    if (!('pixelCount' in this._cache)) {
      if ('pixelCount' in this._jsonObject) {
        this._cache.pixelCount = this._jsonObject.pixelCount;
      }
      else if ('pixelKeys' in this._jsonObject) {
        const xyz = [1, 1, this.pixelKeyStructure.length];

        for (const yItems of this.pixelKeyStructure) {
          xyz[1] = Math.max(xyz[1], yItems.length);

          for (const xItems of yItems) {
            xyz[0] = Math.max(xyz[0], xItems.length);
          }
        }

        this._cache.pixelCount = xyz;
      }
      else {
        // if we didn't catch this case, an endless loop could be created
        throw new ReferenceError('Either pixelCount or pixelKeys has to be specified in a fixture\'s matrix object.');
      }
    }

    return this._cache.pixelCount;
  }

  /**
   * @returns {!number} Amount of pixels in x direction.
   */
  get pixelCountX() {
    return this.pixelCount[0];
  }

  /**
   * @returns {!number} Amount of pixels in y direction.
   */
  get pixelCountY() {
    return this.pixelCount[1];
  }

  /**
   * @returns {!number} Amount of pixels in z direction.
   */
  get pixelCountZ() {
    return this.pixelCount[2];
  }

  /**
   * @returns {!Array.<string>} Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its pixelCount is > 1).
   */
  get definedAxes() {
    if (!('definedAxes' in this._cache)) {
      this._cache.definedAxes = [];

      if (this.pixelCountX > 1) {
        this._cache.definedAxes.push('X');
      }
      if (this.pixelCountY > 1) {
        this._cache.definedAxes.push('Y');
      }
      if (this.pixelCountZ > 1) {
        this._cache.definedAxes.push('Z');
      }
    }

    return this._cache.definedAxes;
  }

  /**
   * @returns {!Array.<Array.<Array.<string>>>} Pixel keys by Z, Y and X position.
   */
  get pixelKeyStructure() {
    if (!('pixelKeyStructure' in this._cache)) {
      if ('pixelKeys' in this._jsonObject) {
        this._cache.pixelKeyStructure = this._jsonObject.pixelKeys;
      }
      else if ('pixelCount' in this._jsonObject) {
        this._cache.pixelKeyStructure = this._getPixelDefaultKeys();
      }
      else {
        // if we didn't catch this case, an endless loop could be created
        throw new ReferenceError('Either pixelCount or pixelKeys has to be specified in a fixture\'s matrix object.');
      }
    }

    return this._cache.pixelKeyStructure;
  }

  /**
   * Generate default keys for all pixels.
   * @returns {!Array.<Array.<Array.<string>>>} Default pixel keys by Z, Y and X position.
   */
  _getPixelDefaultKeys() {
    const zItems = [];

    for (let z = 1; z <= this.pixelCountZ; z++) {
      const yItems = [];

      for (let y = 1; y <= this.pixelCountY; y++) {
        const xItems = [];

        for (let x = 1; x <= this.pixelCountX; x++) {
          xItems.push(this._getPixelDefaultKey(x, y, z));
        }

        yItems.push(xItems);
      }

      zItems.push(yItems);
    }

    return zItems;
  }

  /**
   * Generate default name based on defined axes and given position if names are not set customly.
   *
   * Dimension  Default pixelKey
   * ------     ------------
   * 1D         "$number"
   * 2D         "($x, $y)"
   * 3D         "($x, $y, $z)"
   *
   * @param {!number} x Position of pixel in x direction.
   * @param {!number} y Position of pixel in y direction.
   * @param {!number} z Position of pixel in z direction.
   * @returns {!string} The pixel's default key.
   */
  _getPixelDefaultKey(x, y, z) {
    switch (this.definedAxes.length) {
      case 1:
        return Math.max(x, y, z).toString();

      case 2: {
        const first = this.definedAxes.includes('X') ? x : y;
        const last = this.definedAxes.includes('Y') ? y : z;
        return `(${first}, ${last})`;
      }

      case 3:
        return `(${x}, ${y}, ${z})`;

      default:
        throw new RangeError('Only 1, 2 or 3 axes can be defined.');
    }
  }

  /**
   * @returns {!Array.<string>} All pixelKeys, ordered alphanumerically (1 < 2 < 10 < alpha < beta < gamma)
   */
  get pixelKeys() {
    if (!('pixelKeys' in this._cache)) {
      this._cache.pixelKeys = Object.keys(this.pixelKeyPositions).sort(
        (a, b) => a.toString().localeCompare(b, undefined, { numeric: true })
      );
    }

    return this._cache.pixelKeys;
  }

  /**
   * Sorts the pixelKeys by given X/Y/Z order. Order of the parameters equals the order in a repeatFor's "eachPixelXYZ".
   * @param {('X'|'Y'|'Z')} firstAxis Axis with highest ordering.
   * @param {('X'|'Y'|'Z')} secondAxis Axis with middle ordering.
   * @param {('X'|'Y'|'Z')} thirdAxis Axis with lowest ordering.
   * @returns {!Array.<String>} All pixelKeys ordered by given axis order.
   */
  getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis) {
    const axisToPosIndex = {X: 0, Y: 1, Z: 2};
    const firstPosIndex = axisToPosIndex[firstAxis];
    const secondPosIndex = axisToPosIndex[secondAxis];
    const thirdPosIndex = axisToPosIndex[thirdAxis];

    return this.pixelKeys.sort((keyA, keyB) => {
      const [posA, posB] = [this.pixelKeyPositions[keyA], this.pixelKeyPositions[keyB]];

      if (posA[thirdPosIndex] !== posB[thirdPosIndex]) {
        return posA[thirdPosIndex] - posB[thirdPosIndex];
      }
      if (posA[secondPosIndex] !== posB[secondPosIndex]) {
        return posA[secondPosIndex] - posB[secondPosIndex];
      }
      return posA[firstPosIndex] - posB[firstPosIndex];
    });
  }

  /**
   * @returns {object.<string, number[]>} Each pixelKey pointing to an array of its X/Y/Z position
   */
  get pixelKeyPositions() {
    if (!('pixelKeyPositions' in this._cache)) {
      this._cache.pixelKeyPositions = {};

      for (let z = 0; z < this.pixelCountZ; z++) {
        for (let y = 0; y < this.pixelCountY; y++) {
          for (let x = 0; x < this.pixelCountX; x++) {
            if (this.pixelKeyStructure[z][y][x] !== null) {
              this._cache.pixelKeyPositions[this.pixelKeyStructure[z][y][x]] = [x + 1, y + 1, z + 1];
            }
          }
        }
      }
    }

    return this._cache.pixelKeyPositions;
  }

  /**
   * @returns {!Array.<string>} All available pixel group keys, ordered by appearance.
   */
  get pixelGroupKeys() {
    return Object.keys(this.pixelGroups);
  }

  /**
   * @returns {!Object<string, string[]>} Key is the group key, value is an array of pixel keys.
   */
  get pixelGroups() {
    return this._jsonObject.pixelGroups || {};
  }
};
