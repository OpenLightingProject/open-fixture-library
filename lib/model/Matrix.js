/**
 * Contains information of how the pixels in a 1-, 2- or 3-dimensional space are arranged and named.
 */
class Matrix {
  /**
   * @param {Object} jsonObject The fixture's JSON object containing the matrix information.
   */
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }

  /**
   * @returns {Object} The fixture's JSON object containing the matrix information.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * Updates the JSON object and clears the cache used for expensive parameters.
   * @param {Object} jsonObject The fixture's JSON object containing the matrix information.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @returns {Array.<Number>} Amount of pixels in X, Y and Z direction. A horizontal bar with 4 LEDs would be `[4, 1, 1]`, a 5x5 pixel head would be `[5, 5, 1]`.
   * @throws {ReferenceError} If neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelCount() {
    if (!(`pixelCount` in this._cache)) {
      if (`pixelCount` in this._jsonObject) {
        this._cache.pixelCount = this._jsonObject.pixelCount;
      }
      else if (`pixelKeys` in this._jsonObject) {
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
        throw new ReferenceError(`Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.`);
      }
    }

    return this._cache.pixelCount;
  }

  /**
   * @returns {Number} Amount of pixels in X direction.
   */
  get pixelCountX() {
    return this.pixelCount[0];
  }

  /**
   * @returns {Number} Amount of pixels in Y direction.
   */
  get pixelCountY() {
    return this.pixelCount[1];
  }

  /**
   * @returns {Number} Amount of pixels in Z direction.
   */
  get pixelCountZ() {
    return this.pixelCount[2];
  }

  /**
   * @returns {Array.<String>} Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its `pixelCount` is > 1).
   */
  get definedAxes() {
    if (!(`definedAxes` in this._cache)) {
      this._cache.definedAxes = [];

      if (this.pixelCountX > 1) {
        this._cache.definedAxes.push(`X`);
      }
      if (this.pixelCountY > 1) {
        this._cache.definedAxes.push(`Y`);
      }
      if (this.pixelCountZ > 1) {
        this._cache.definedAxes.push(`Z`);
      }
    }

    return this._cache.definedAxes;
  }

  /**
   * @returns {Array.<Array.<Array.<String>>>} Pixel keys by Z, Y and X position.
   * @throws {ReferenceError} if neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelKeyStructure() {
    if (!(`pixelKeyStructure` in this._cache)) {
      if (`pixelKeys` in this._jsonObject) {
        this._cache.pixelKeyStructure = this._jsonObject.pixelKeys;
      }
      else if (`pixelCount` in this._jsonObject) {
        this._cache.pixelKeyStructure = this._getPixelDefaultKeys();
      }
      else {
        // if we didn't catch this case, an endless loop could be created
        throw new ReferenceError(`Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.`);
      }
    }

    return this._cache.pixelKeyStructure;
  }

  /**
   * Generate default keys for all pixels.
   * @private
   * @returns {Array.<Array.<Array.<String>>>} Default pixel keys by Z, Y and X position.
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
   * Generate default name based on defined axes and given position if no custom names are set via `pixelKeys`.
   *
   * | Dimension | Default pixelKey |
   * | --------- | ---------------- |
   * | 1D        | `"$number"`      |
   * | 2D        | `"($x, $y)"`     |
   * | 3D        | `"($x, $y, $z)"` |
   *
   * @private
   * @param {Number} x Position of pixel in X direction.
   * @param {Number} y Position of pixel in Y direction.
   * @param {Number} z Position of pixel in Z direction.
   * @returns {String} The pixel's default key.
   * @throws {RangeError} If {@link Matrix#definedAxes}.length is not 1, 2 or 3.
   */
  _getPixelDefaultKey(x, y, z) {
    switch (this.definedAxes.length) {
      case 1:
        return Math.max(x, y, z).toString();

      case 2: {
        const first = this.definedAxes.includes(`X`) ? x : y;
        const last = this.definedAxes.includes(`Y`) ? y : z;
        return `(${first}, ${last})`;
      }

      case 3:
        return `(${x}, ${y}, ${z})`;

      default:
        throw new RangeError(`Only 1, 2 or 3 axes can be defined.`);
    }
  }

  /**
   * @returns {Array.<String>} All pixelKeys, ordered alphanumerically (1 < 2 < 10 < alice < bob < carol)
   */
  get pixelKeys() {
    if (!(`pixelKeys` in this._cache)) {
      this._cache.pixelKeys = Object.keys(this.pixelKeyPositions).sort(
        (a, b) => a.toString().localeCompare(b, undefined, { numeric: true })
      );
    }

    return this._cache.pixelKeys;
  }

  /**
   * Sorts the pixelKeys by given X/Y/Z order. Order of the parameters equals the order in a `repeatFor`'s "eachPixelXYZ".
   * @param {('X'|'Y'|'Z')} firstAxis Axis with highest ordering.
   * @param {('X'|'Y'|'Z')} secondAxis Axis with middle ordering.
   * @param {('X'|'Y'|'Z')} thirdAxis Axis with lowest ordering.
   * @returns {Array.<String>} All pixelKeys ordered by given axis order.
   */
  getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis) {
    const axisToPosIndex = { X: 0, Y: 1, Z: 2 };
    const firstPosIndex = axisToPosIndex[firstAxis];
    const secondPosIndex = axisToPosIndex[secondAxis];
    const thirdPosIndex = axisToPosIndex[thirdAxis];

    return Array.from(this.pixelKeys).sort((keyA, keyB) => {
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
   * @returns {Object.<String, Array.<Number>>} Each pixelKey pointing to an array of its X/Y/Z position
   */
  get pixelKeyPositions() {
    if (!(`pixelKeyPositions` in this._cache)) {
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
   * @returns {Array.<String>} All available pixel group keys, ordered by appearance.
   */
  get pixelGroupKeys() {
    if (!(`pixelGroupKeys` in this._cache)) {
      this._cache.pixelGroupKeys = Object.keys(this.pixelGroups);
    }

    return this._cache.pixelGroupKeys;
  }

  /**
   * @returns {Object.<String, Array>} Key is the group key, value is an array of pixel keys.
   */
  get pixelGroups() {
    if (!(`pixelGroups` in this._cache)) {
      this._cache.pixelGroups = {};

      if (`pixelGroups` in this._jsonObject) {
        Object.entries(this._jsonObject.pixelGroups).forEach(([groupKey, group]) => {
          if (Array.isArray(group)) {
            // pixel keys specified directly
            this._cache.pixelGroups[groupKey] = group;
          }
          else if (group === `all`) {
            this._cache.pixelGroups[groupKey] = this.pixelKeys;
          }
          else {
            // pixel key constraints
            const constraints = convertConstraintsToFunctions(group);
            const pixelKeys = `name` in group ? this.pixelKeys : this.getPixelKeysByOrder(`X`, `Y`, `Z`);

            this._cache.pixelGroups[groupKey] = pixelKeys.filter(
              key => this._pixelKeyFulfillsConstraints(key, constraints)
            );
          }
        });
      }
    }

    return this._cache.pixelGroups;


    /**
     * @param {Object} constraints The constraints to apply.
     * @returns {Object} The constraints converted to functions.
     */
    function convertConstraintsToFunctions(constraints) {
      const constraintFunctions = {};

      // number constraints
      [`x`, `y`, `z`].forEach(axis => {
        constraintFunctions[axis] = (constraints[axis] || []).map(constraint => {
          if (constraint.startsWith(`=`)) {
            const eqPos = parseInt(constraint.slice(1));
            return (position => position === eqPos);
          }

          if (constraint.startsWith(`>=`)) {
            const minPos = parseInt(constraint.slice(2));
            return (position => position >= minPos);
          }

          if (constraint.startsWith(`<=`)) {
            const maxPos = parseInt(constraint.slice(2));
            return (position => position <= maxPos);
          }

          constraint = constraint.replace(/^even$/, `2n`);
          constraint = constraint.replace(/^odd$/, `2n+1`);

          if (constraint.match(/^(\d+)n(?:\+(\d+)|)$/)) {
            const divisor = parseInt(RegExp.$1);
            const remainder = parseInt(RegExp.$2 || `0`);
            return (position => position % divisor === remainder);
          }

          throw new Error(`Invalid pixel key constraint '${constraint}'.`);
        });
      });

      constraintFunctions.name = (constraints.name || []).map(
        pattern => (name => new RegExp(pattern).test(name))
      );

      return constraintFunctions;
    }
  }

  /**
   * @param {String} pixelKey The pixel key to check against the constraints.
   * @param {Object} constraints The constraints to apply.
   * @returns {Boolean} True if the pixel key fulfills all constraints, false otherwise.
   */
  _pixelKeyFulfillsConstraints(pixelKey, constraints) {
    const position = this.pixelKeyPositions[pixelKey];

    const numberConstraintsFulfilled = [`x`, `y`, `z`].every((axis, axisIndex) => {
      const axisPos = position[axisIndex];

      return constraints[axis].every(constraintFunction => constraintFunction(axisPos));
    });

    const stringConstraintsFulfilled = constraints.name.every(
      constraintFunction => constraintFunction(pixelKey)
    );

    return numberConstraintsFulfilled && stringConstraintsFulfilled;
  }
}

export default Matrix;
