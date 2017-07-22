module.exports = class Range {
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
    return Math.floor((this.start+this.end) / 2);
  }


  contains(value) {
    return this.start <= value && value <= this.end;
  }

  // checks if there's no space between both ranges
  isAdjacentTo(range) {
    return range.end + 1 === this.start || this.end + 1 === range.start;
  }

  mergeWith(range) {
    this.rangeArray = [Math.min(this.start, range.start), Math.max(this.end, range.end)];
  }


  // merge specified Range objects
  // returns array of new Range objects
  // asserts that ranges don't overlap and that all ranges are valid (start<=end)
  static mergeRanges(ranges) {
    let mergedRanges = [];

    // ranges to merge
    for (const range of ranges) {
      let mergableRange = mergedRanges.find(mergedRange => mergedRange.isAdjacentTo(range));

      if (mergableRange) {
        mergableRange.mergeWith(range);
      }
      else {
        // merging with already merged ranges not possible
        mergedRanges.push(new Range([range.start, range.end]));
      }
    }

    return mergedRanges;
  }
};