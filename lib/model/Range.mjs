export default class Range {
  constructor(rangeArray) {
    this.rangeArray = rangeArray; // calls the setter
  }

  set rangeArray(rangeArray) {
    this._rangeArray = rangeArray;
  }

  get start() {
    return this._rangeArray[0];
  }

  get end() {
    return this._rangeArray[1];
  }

  get center() {
    return Math.floor((this.start + this.end) / 2);
  }


  contains(value) {
    return this.start <= value && value <= this.end;
  }

  /**
   * Checks if this range overlaps with another.
   * @param {!Range} range The other Range object.
   * @returns {!boolean} True if the ranges do overlap.
   */
  overlapsWith(range) {
    return range.end > this.start && range.start < this.end;
  }

  /**
   * Checks if this range overlaps with a range in a given array.
   * @param {!Array.<Range>} ranges The array of Range objects.
   * @returns {!boolean} True if the range overlaps with one in the array.
   */
  overlapsWithOneOf(ranges) {
    return ranges.some(range => this.overlapsWith(range));
  }

  // checks if there's no space between both ranges
  isAdjacentTo(range) {
    return range.end + 1 === this.start || this.end + 1 === range.start;
  }

  /**
   * @param {!Range} range The other range to merge with.
   * @returns {!Range} A new range that covers both the initial and the other range.
   */
  getRangeMergedWith(range) {
    return new Range([Math.min(this.start, range.start), Math.max(this.end, range.end)]);
  }

  /**
   * @returns {!string} Textual representation of this range.
   */
  toString() {
    return this.start === this.end ? this.start.toString() : `${this.start}…${this.end}`;
  }


  /**
   * Merge specified Range objects. Asserts that ranges don't overlap and that all ranges are valid (start<=end).
   * @param {!Array.<Range>} ranges Range objects to merge into as few ranges as possible.
   * @returns {!Array.<Range>} Merged ranges.
   */
  static mergeRanges(ranges) {
    const mergedRanges = ranges.map(range => new Range([range.start, range.end]));

    // ranges to merge
    mergedRanges.forEach((range, index, arr) => {
      const mergableRangeIndex = arr.findIndex(otherRange => otherRange.isAdjacentTo(range));

      if (mergableRangeIndex !== -1) {
        // replace current range with merged range and delete other range
        arr[index] = mergedRanges[mergableRangeIndex].getRangeMergedWith(range);
        arr.splice(mergableRangeIndex, 1);
      }
    });

    return mergedRanges;
  }
}
