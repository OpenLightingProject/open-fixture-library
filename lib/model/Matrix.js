import cacheResult from '../cache-result.js';

/**
 * Contains information of how the pixels in a 1-, 2- or 3-dimensional space are arranged and named.
 */
class Matrix {
  /**
   * @param {object} jsonObject The fixture's JSON object containing the matrix information.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }

  /**
   * @returns {object} The fixture's JSON object containing the matrix information.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {number[]} Amount of pixels in X, Y and Z direction. A horizontal bar with 4 LEDs would be `[4, 1, 1]`, a 5x5 pixel head would be `[5, 5, 1]`.
   * @throws {ReferenceError} If neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelCount() {
    if (`pixelCount` in this._jsonObject) {
      return cacheResult(this, `pixelCount`, this._jsonObject.pixelCount);
    }

    if (`pixelKeys` in this._jsonObject) {
      const xyz = [1, 1, this.pixelKeyStructure.length];

      for (const yItems of this.pixelKeyStructure) {
        xyz[1] = Math.max(xyz[1], yItems.length);

        for (const xItems of yItems) {
          xyz[0] = Math.max(xyz[0], xItems.length);
        }
      }

      return cacheResult(this, `pixelCount`, xyz);
    }

    // if we didn't catch this case, an endless loop could be created
    throw new ReferenceError(`Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.`);
  }

  /**
   * @returns {number} Amount of pixels in X direction.
   */
  get pixelCountX() {
    return this.pixelCount[0];
  }

  /**
   * @returns {number} Amount of pixels in Y direction.
   */
  get pixelCountY() {
    return this.pixelCount[1];
  }

  /**
   * @returns {number} Amount of pixels in Z direction.
   */
  get pixelCountZ() {
    return this.pixelCount[2];
  }

  /**
   * @returns {string[]} Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its `pixelCount` is > 1).
   */
  get definedAxes() {
    const definedAxes = [];

    if (this.pixelCountX > 1) {
      definedAxes.push(`X`);
    }
    if (this.pixelCountY > 1) {
      definedAxes.push(`Y`);
    }
    if (this.pixelCountZ > 1) {
      definedAxes.push(`Z`);
    }

    return cacheResult(this, `definedAxes`, definedAxes);
  }

  /**
   * @returns {string[][][]} Pixel keys by Z, Y and X position.
   * @throws {ReferenceError} if neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelKeyStructure() {
    if (`pixelKeys` in this._jsonObject) {
      return cacheResult(this, `pixelKeyStructure`, this._jsonObject.pixelKeys);
    }

    if (`pixelCount` in this._jsonObject) {
      return cacheResult(this, `pixelKeyStructure`, this._getPixelDefaultKeys());
    }

    // if we didn't catch this case, an endless loop could be created
    throw new ReferenceError(`Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.`);
  }

  /**
   * Generate default keys for all pixels.
   * @private
   * @returns {string[][][]} Default pixel keys by Z, Y and X position.
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
   * @param {number} x Position of pixel in X direction.
   * @param {number} y Position of pixel in Y direction.
   * @param {number} z Position of pixel in Z direction.
   * @returns {string} The pixel's default key.
   * @throws {RangeError} If {@link Matrix#definedAxes}.length is not 1, 2 or 3.
   */
  _getPixelDefaultKey(x, y, z) {
    switch (this.definedAxes.length) {
      case 1: {
        return Math.max(x, y, z).toString();
      }
      case 2: {
        const first = this.definedAxes.includes(`X`) ? x : y;
        const last = this.definedAxes.includes(`Y`) ? y : z;
        return `(${first}, ${last})`;
      }
      case 3: {
        return `(${x}, ${y}, ${z})`;
      }
      default: {
        throw new RangeError(`Only 1, 2 or 3 axes can be defined.`);
      }
    }
  }

  /**
   * @returns {string[]} All pixelKeys, ordered alphanumerically (1 < 2 < 10 < alice < bob < carol)
   */
  get pixelKeys() {
    const pixelKeys = Object.keys(this.pixelKeyPositions).sort(
      (a, b) => a.toString().localeCompare(b, undefined, { numeric: true }),
    );

    return cacheResult(this, `pixelKeys`, pixelKeys);
  }

  /**
   * Sorts the pixelKeys by given X/Y/Z order. Order of the parameters equals the order in a `repeatFor`'s "eachPixelXYZ".
   * @param {'X' | 'Y' | 'Z'} firstAxis Axis with highest ordering.
   * @param {'X' | 'Y' | 'Z'} secondAxis Axis with middle ordering.
   * @param {'X' | 'Y' | 'Z'} thirdAxis Axis with lowest ordering.
   * @returns {string[]} All pixelKeys ordered by given axis order.
   */
  getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis) {
    const axisToPosIndex = { X: 0, Y: 1, Z: 2 };
    const firstPosIndex = axisToPosIndex[firstAxis];
    const secondPosIndex = axisToPosIndex[secondAxis];
    const thirdPosIndex = axisToPosIndex[thirdAxis];

    return [...this.pixelKeys].sort((keyA, keyB) => {
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
   * @returns {Record<string, number[]>} Each pixelKey pointing to an array of its X/Y/Z position
   */
  get pixelKeyPositions() {
    const pixelKeyPositions = {};

    for (let z = 0; z < this.pixelCountZ; z++) {
      for (let y = 0; y < this.pixelCountY; y++) {
        for (let x = 0; x < this.pixelCountX; x++) {
          if (this.pixelKeyStructure[z][y][x] !== null) {
            pixelKeyPositions[this.pixelKeyStructure[z][y][x]] = [x + 1, y + 1, z + 1];
          }
        }
      }
    }

    return cacheResult(this, `pixelKeyPositions`, pixelKeyPositions);
  }

  /**
   * @returns {string[]} All available pixel group keys, ordered by appearance.
   */
  get pixelGroupKeys() {
    return cacheResult(this, `pixelGroupKeys`, Object.keys(this.pixelGroups));
  }

  /**
   * @returns {Record<string, string[]>} Key is the group key, value is an array of pixel keys.
   */
  get pixelGroups() {
    const pixelGroups = {};

    if (`pixelGroups` in this._jsonObject) {
      for (const [groupKey, group] of Object.entries(this._jsonObject.pixelGroups)) {
        if (Array.isArray(group)) {
          // pixel keys specified directly
          pixelGroups[groupKey] = group;
        }
        else if (group === `all`) {
          pixelGroups[groupKey] = this.pixelKeys;
        }
        else {
          // pixel key constraints
          const constraints = convertConstraintsToFunctions(group);
          const pixelKeys = `name` in group ? this.pixelKeys : this.getPixelKeysByOrder(`X`, `Y`, `Z`);

          pixelGroups[groupKey] = pixelKeys.filter(
            key => this._pixelKeyFulfillsConstraints(key, constraints),
          );
        }
      }
    }

    return cacheResult(this, `pixelGroups`, pixelGroups);
  }

  /**
   * @param {string} pixelKey The pixel key to check against the constraints.
   * @param {object} constraints The constraints to apply.
   * @returns {boolean} True if the pixel key fulfills all constraints, false otherwise.
   */
  _pixelKeyFulfillsConstraints(pixelKey, constraints) {
    const position = this.pixelKeyPositions[pixelKey];

    const numberConstraintsFulfilled = [`x`, `y`, `z`].every((axis, axisIndex) => {
      const axisPos = position[axisIndex];

      return constraints[axis].every(constraintFunction => constraintFunction(axisPos));
    });

    const stringConstraintsFulfilled = constraints.name.every(
      constraintFunction => constraintFunction(pixelKey),
    );

    return numberConstraintsFulfilled && stringConstraintsFulfilled;
  }
}


/**
 * @ignore
 * @param {Record<string, string[]>} constraints The constraints to apply.
 * @returns {object} The constraints converted to functions.
 */
function convertConstraintsToFunctions(constraints) {
  const constraintFunctions = {};

  // number constraints
  for (const axis of [`x`, `y`, `z`]) {
    constraintFunctions[axis] = (constraints[axis] || []).map(
      constraint => convertNumberConstraintToFunction(constraint),
    );
  }

  constraintFunctions.name = (constraints.name || []).map(
    pattern => (name => new RegExp(pattern).test(name)),
  );

  return constraintFunctions;
}

/**
 * @ignore
 * @param {string} constraint The number constraint to apply.
 * @returns {Function} The constraint converted to a function.
 */
function convertNumberConstraintToFunction(constraint) {
  if (constraint.startsWith(`=`)) {
    const eqPos = Number.parseInt(constraint.slice(1), 10);
    return (position => position === eqPos);
  }

  if (constraint.startsWith(`>=`)) {
    const minPos = Number.parseInt(constraint.slice(2), 10);
    return (position => position >= minPos);
  }

  if (constraint.startsWith(`<=`)) {
    const maxPos = Number.parseInt(constraint.slice(2), 10);
    return (position => position <= maxPos);
  }

  constraint = constraint.replace(/^even$/, `2n`);
  constraint = constraint.replace(/^odd$/, `2n+1`);

  const match = constraint.match(/^(\d+)n(?:\+(\d+)|)$/);
  if (match !== null) {
    const divisor = Number.parseInt(match[1], 10);
    const remainder = Number.parseInt(match[2] || `0`, 10);
    return (position => position % divisor === remainder);
  }

  throw new Error(`Invalid pixel key constraint '${constraint}'.`);
}

export default Matrix;
