/**
 * Contains information of how the pixels in a 1-, 2- or 3-dimensional space are arranged and named.
 */
module.exports = class Matrix {
  /**
   * @param {!Object} jsonObject The fixture's json object containg the matrix information.
   */
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }
  
  /**
   * Updates the json object and clears the cache used for expensive parameters.
   * @param {!Object} jsonObject The fixture's json object containg the matrix information.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @return {!Object} The fixture's json object containg the matrix information.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @return {!number[]} Amount of pixels in x, y and z direction.
   */
  get pixelCount() {
    if (!('pixelCount' in this._cache)) {
      if ('pixelCount' in this._jsonObject) {
        this._cache.pixelCount = this._jsonObject.pixelCount;
      }
      else if ('pixelKeys' in this._jsonObject) {
        let xyz = [1, 1, this.pixelKeys.length];

        for (const yItems of this.pixelKeys) {
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
   * @return {!number} Amount of pixels in x direction.
   */
  get pixelCountX() {
    return this.pixelCount[0];
  }

  /**
   * @return {!number} Amount of pixels in y direction.
   */
  get pixelCountY() {
    return this.pixelCount[1];
  }

  /**
   * @return {!number} Amount of pixels in z direction.
   */
  get pixelCountZ() {
    return this.pixelCount[2];
  }

  /**
   * @return {!string[]} Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its pixelCount is > 1).
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
   * @return {!string[][][]} Pixel keys by Z, Y and X position.
   */
  get pixelKeys() {
    if (!('pixelKeys' in this._cache)) {
      if ('pixelKeys' in this._jsonObject) {
        this._cache.pixelKeys = this._jsonObject.pixelKeys;
      }
      else if ('pixelCount' in this._jsonObject) {
        this._cache.pixelKeys = this._getPixelDefaultKeys();
      }
      else {
        // if we didn't catch this case, an endless loop could be created
        throw new ReferenceError('Either pixelCount or pixelKeys has to be specified in a fixture\'s matrix object.');
      }
    }

    return this._cache.pixelKeys;
  }

  /**
   * @return {Object.<string, number[]>} Each pixelKey pointing to an array of its X/Y/Z position
   */
  get pixelKeyPositions() {
    if (!('pixelKeyPositions' in this._cache)) {
      this._cache.pixelKeyPositions = {};

      for (let z = 0; z < this.pixelCountZ; z++) {
        for (let y = 0; y < this.pixelCountY; y++) {
          for (let x = 0; x < this.pixelCountX; x++) {
            if (this.pixelKeys[z][y][x] !== null) {
              this._cache.pixelKeyPositions[this.pixelKeys[z][y][x]] = [x+1, y+1, z+1];
            }
          }
        }
      }
    }

    return this._cache.pixelKeyPositions;
  }

  /**
   * Generate default keys for all pixels.
   * @return {!string[][][]} Default pixel keys by Z, Y and X position.
   */
  _getPixelDefaultKeys() {
    let zItems = [];
    
    for (let z = 1; z <= this.pixelCountZ; z++) {
      let yItems = [];
      
      for (let y = 1; y <= this.pixelCountY; y++) {
        let xItems = [];
        
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
   * @param {!number} x
   * @param {!number} y
   * @param {!number} z
   * @return {!string} The pixel's default key.
   */
  _getPixelDefaultKey(x, y, z) {
    switch (this.definedAxes.length) {
      case 1:
        return Math.max(x, y, z).toString();

      case 2:
        const first = this.definedAxes.includes('X') ? x : y;
        const last = this.definedAxes.includes('Y') ? y : z;
        return `(${first}, ${last})`;

      case 3:
        return `(${x}, ${y}, ${z})`;
      
      default:
        throw new RangeError('Only 1, 2 or 3 axes can be defined.');
    }
  }

  /**
   * @return {!String[]} All available pixel group keys, ordered by appearance.
   */
  get pixelGroupKeys() {
    return Object.keys(this.pixelGroups);
  }

  /**
   * @return {!Object<string, string[]>} Key is the group key, value is an array of pixel keys.
   */
  get pixelGroups() {
    return this._jsonObject.pixelGroups || {};
  }
};
