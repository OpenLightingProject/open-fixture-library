#!/usr/bin/node
const colors = require(`colors`);

const {
  scaleDmxValue,
  scaleDmxRange
} = require(`../lib/scale-dmx-values.js`);


let errorCount = 0;

testScaleDmxValuesUp();
console.log();

testScaleDmxValuesDown();
console.log();

testScaleDmxRangesUp();
console.log();

testScaleDmxRangesDown();
console.log();

testRandomChannelDownscaling(2);
testRandomChannelDownscaling(3);

console.log();
if (errorCount > 0) {
  console.log(`${colors.red(`[FAIL]`)} Test failed with ${errorCount} error${errorCount > 1 ? `s` : ``}.`);
  process.exit(1);
}
else {
  console.log(`${colors.green(`[PASS]`)} Test passed.`);
  process.exit(0);
}


/**
 * Check scaling single DMX values up by using hardcoded values.
 */
function testScaleDmxValuesUp() {
  const scale8to16 = {
    /* eslint-disable indent, no-multi-spaces, key-spacing */
      0:     0, // [  0] -> [  0,   0]
    127: 32639, // [127] -> [127, 127]
    255: 65535  // [255] -> [255, 255] = 256^2 - 1
    /* eslint-enable indent, no-multi-spaces, key-spacing */
  };
  Object.keys(scale8to16).forEach(dmxValue => testScaleDmxValue(dmxValue, 1, 2, scale8to16[dmxValue]));

  const scale8to24 = {
    /* eslint-disable indent, no-multi-spaces, key-spacing */
      0:        0, // [  0] -> [  0,   0,   0]
    127:  8355711, // [127] -> [127, 127, 127]
    128:  8421504, // [128] -> [128, 128, 128]
    255: 16777215  // [255] -> [255, 255, 255] = 256^3 - 1
    /* eslint-enable indent, no-multi-spaces, key-spacing */
  };
  Object.keys(scale8to24).forEach(dmxValue => testScaleDmxValue(dmxValue, 1, 3, scale8to24[dmxValue]));

  const scale16to24 = {
    /* eslint-disable indent, no-multi-spaces, key-spacing */
        0:        0, // [  0,   0] -> [  0,   0,   0]
      255:    65535, // [  0, 255] -> [  0, 255, 255]
      256:    65536, // [  1,   0] -> [  1,   0,   0]
    32767:  8388607, // [127, 255] -> [127, 255, 255]
    32768:  8388608, // [128,   0] -> [128,   0,   0]
    65279: 16711679, // [254, 255] -> [254, 255, 255]
    65280: 16711680, // [255,   0] -> [255,   0,   0]
    65535: 16777215  // [255, 255] -> [255, 255, 255]
    /* eslint-enable indent, no-multi-spaces, key-spacing */
  };
  Object.keys(scale16to24).forEach(dmxValue => testScaleDmxValue(dmxValue, 2, 3, scale16to24[dmxValue]));
}

/**
 * Check scaling single DMX values down by using hardcoded values.
 */
function testScaleDmxValuesDown() {
  const scale16to8 = {
    /* eslint-disable indent, no-multi-spaces, key-spacing */
        0:   0, // [  0,   0] -> [  0]
    32512: 127, // [127,   0] -> [127]
    32639: 127, // [127, 127] -> [127]
    32767: 127, // [127, 255] -> [127]
    32768: 128, // [128,   0] -> [128]
    65280: 255, // [255,   0] -> [255]
    65535: 255  //  [255, 255] -> [255]
    /* eslint-enable indent, no-multi-spaces, key-spacing */
  };
  Object.keys(scale16to8).forEach(dmxValue => testScaleDmxValue(dmxValue, 2, 1, scale16to8[dmxValue]));

  const scale24to8 = {
    /* eslint-disable indent, no-multi-spaces, key-spacing */
           0:   0, // [  0,   0,   0] -> [  0]
       65535:   0, // [  0, 255, 255] -> [  0]
       65536:   1, // [  1,   0,   0] -> [  1]
     8388607: 127, // [127, 255, 255] -> [127]
     8388608: 128, // [128,   0,   0] -> [128]
    16711679: 254, // [254, 255, 255] -> [254]
    16711680: 255, // [255,   0,   0] -> [255]
    16777215: 255  // [255, 255, 255] -> [255]
    /* eslint-enable indent, no-multi-spaces, key-spacing */
  };
  Object.keys(scale24to8).forEach(dmxValue => testScaleDmxValue(dmxValue, 3, 1, scale24to8[dmxValue]));

  const scale24to16 = {
    /* eslint-disable indent, no-multi-spaces, key-spacing */
           0:     0, // [  0,   0,   0] -> [  0,   0]
       65535:   255, // [  0, 255, 255] -> [  0, 255]
       65536:   256, // [  1,   0,   0] -> [  1,   0]
     8388352: 32767, // [127, 255,   0] -> [127, 255]
     8388607: 32767, // [127, 255, 255] -> [127, 255]
     8388608: 32768, // [128,   0,   0] -> [128,   0]
    16711679: 65279, // [254, 255, 255] -> [254, 255]
    16711680: 65280, // [255,   0,   0] -> [255,   0]
    16711935: 65280, // [255,   0, 255] -> [255,   0]
    16777215: 65535  // [255, 255, 255] -> [255, 255]
    /* eslint-enable indent, no-multi-spaces, key-spacing */
  };
  Object.keys(scale24to16).forEach(dmxValue => testScaleDmxValue(dmxValue, 3, 2, scale24to16[dmxValue]));
}

/**
 * Tests if scaling the given DMX value from the current resolution to the desired resolution
 * actually returns the desired DMX value.
 * @param {number} dmxValue The original DMX value in the current resolution.
 * @param {number} currentResolution The resolution of dmxValue.
 * @param {number} desiredResolution The resolution that dmxValue should be scaled to.
 * @param {number} desiredDmxValue The correct value for dmxValue in the desired resolution.
 */
function testScaleDmxValue(dmxValue, currentResolution, desiredResolution, desiredDmxValue) {
  dmxValue = parseInt(dmxValue);

  testEqual(
    `scaleDmxValue(${dmxValue}, ${currentResolution}, ${desiredResolution})`,
    scaleDmxValue(dmxValue, currentResolution, desiredResolution),
    desiredDmxValue
  );
}

/**
 * Check scaling single DMX ranges up by using hardcoded values.
 */
function testScaleDmxRangesUp() {
  const scale8to16 = [
    /* eslint-disable no-multi-spaces, array-bracket-spacing */
    [[  0,   0], [    0,   255]],
    [[  0, 254], [    0, 65279]],
    [[  0, 255], [    0, 65535]],
    [[127, 127], [32512, 32767]],
    [[255, 255], [65280, 65535]]
    /* eslint-enable no-multi-spaces, array-bracket-spacing */
  ];
  scale8to16.forEach(([dmxRange, desiredDmxRange]) => testScaleDmxRange(dmxRange, 1, 2, desiredDmxRange));

  const scale8to24 = [
    /* eslint-disable no-multi-spaces, array-bracket-spacing */
    [[  0,   0], [       0,    65535]],
    [[  0, 254], [       0, 16711679]],
    [[  0, 255], [       0, 16777215]],
    [[127, 127], [ 8323072,  8388607]],
    [[255, 255], [16711680, 16777215]]
    /* eslint-enable no-multi-spaces, array-bracket-spacing */
  ];
  scale8to24.forEach(([dmxRange, desiredDmxRange]) => testScaleDmxRange(dmxRange, 1, 3, desiredDmxRange));
}

/**
 * Check scaling single DMX ranges down by using hardcoded values.
 */
function testScaleDmxRangesDown() {
  const scale16to8 = [
    /* eslint-disable no-multi-spaces, array-bracket-spacing */
    [[    0,   255], [  0,   0]],
    [[    0,   100], [  0,   0]],
    [[  101,   200], [  0,   0]],
    [[  201,   300], [  1,   1]],
    [[    0, 65535], [  0, 255]],
    [[32512, 32767], [127, 127]],
    [[64000, 65279], [250, 254]],
    [[65279, 65535], [255, 255]],
    [[65280, 65535], [255, 255]]
    /* eslint-enable no-multi-spaces, array-bracket-spacing */
  ];
  scale16to8.forEach(([dmxRange, desiredDmxRange]) => testScaleDmxRange(dmxRange, 2, 1, desiredDmxRange));

  const scale24to8 = [
    /* eslint-disable array-bracket-spacing */
    [[ 615605, 1683118], [10, 25]],
    [[1683119, 2244792], [26, 34]]
    /* eslint-enable array-bracket-spacing */
  ];
  scale24to8.forEach(([dmxRange, desiredDmxRange]) => testScaleDmxRange(dmxRange, 3, 1, desiredDmxRange));

  const scale24to16 = [
    /* eslint-disable array-bracket-spacing */
    [[ 615605, 1683118], [2405, 6574]],
    [[1683119, 2244792], [6575, 8768]]
    /* eslint-enable array-bracket-spacing */
  ];
  scale24to16.forEach(([dmxRange, desiredDmxRange]) => testScaleDmxRange(dmxRange, 3, 2, desiredDmxRange));
}

/**
 * Tests if scaling the given DMX value from the current resolution to the desired resolution
 * actually returns the desired DMX value.
 * @param {number} dmxRange The original DMX value in the current resolution.
 * @param {number} currentResolution The resolution of dmxValue.
 * @param {number} desiredResolution The resolution that dmxValue should be scaled to.
 * @param {number} desiredDmxRange The correct value for dmxValue in the desired resolution.
 */
function testScaleDmxRange(dmxRange, currentResolution, desiredResolution, desiredDmxRange) {
  testArraysEqual(
    `scaleDmxRange(${dmxRange[0]}, ${dmxRange[1]}, ${currentResolution}, ${desiredResolution})`,
    scaleDmxRange(dmxRange[0], dmxRange[1], currentResolution, desiredResolution),
    desiredDmxRange
  );
}

/**
 * Creates random capability ranges in the given resolution, scales them down to the next-lower resolution
 * and checks for overlaps in the scaled ranges.
 * Original ranges always span more than 1 DMX value in the lowest resolution.
 * @param {number} resolution The resolution of the original ranges. Must be 2 or higher.
 */
function testRandomChannelDownscaling(resolution) {
  const capabilityRanges = getRandomCapabilityRanges();
  const scaledRanges = capabilityRanges.map(
    ([start, end]) => scaleDmxRange(start, end, resolution, resolution - 1)
  );

  const doRangesOverlap = scaledRanges.some(
    ([start, end], index, arr) => index > 0 && start <= arr[index - 1][1]
  );

  parseTestResult(
    !doRangesOverlap,
    `Random capabilities, scaled down from ${resolution * 8}bit to ${(resolution - 1) * 8}bit, do not overlap:`,
    `Random capabilities, scaled down from ${resolution * 8}bit to ${(resolution - 1) * 8}bit, do overlap:`
  );
  capabilityRanges.forEach(([start, end], index) => {
    const [scaledStart, scaledEnd] = scaledRanges[index];
    console.log(`  ${start}…${end} -> ${scaledStart}…${scaledEnd}`);
  });

  /**
   * @returns {array.<array.<number, number>>} Random list of adjacent capability [start, end] ranges. Together, they fill a whole channel.
   */
  function getRandomCapabilityRanges() {
    const minimumRangeWidth = Math.pow(256, resolution - 1) - 1; // without a minimum, overlaps would not be avoidable
    const maximumRangeWidth = minimumRangeWidth * 20;

    const ranges = [];
    let remainingDmxValues = Math.pow(256, resolution);
    while (remainingDmxValues > 0) {
      let rangeWidth;
      if (remainingDmxValues > maximumRangeWidth) {
        rangeWidth = Math.floor((Math.random() * (maximumRangeWidth - (2 * minimumRangeWidth))) + minimumRangeWidth);
      }
      else {
        rangeWidth = remainingDmxValues;
      }

      const lastDmxValue = ranges.length > 0 ? ranges[ranges.length - 1][1] : -1;
      ranges.push([lastDmxValue + 1, lastDmxValue + rangeWidth]);
      remainingDmxValues -= rangeWidth;
    }

    return ranges;
  }
}

/**
 * The test passes if the given value equals the desired value. The description is used to log the test result to console.
 * @param {string} description A string describing the given value. Probably a description of a function call.
 * @param {*} value The value with unknown correctness. Probably the return value of a function call.
 * @param {*} desiredValue The correct value. Probably a hardcoded value.
 */
function testEqual(description, value, desiredValue) {
  parseTestResult(
    value === desiredValue,
    `${description} should be ${desiredValue}.`,
    `${description} should be ${desiredValue} but is ${value}.`
  );
}

/**
 * The test passes if the given array equals the desired array (not the identity, but the elements are compared).
 * The description is used to log the test result to console.
 * @param {string} description A string describing the given value. Probably a description of a function call.
 * @param {array.<*>} array The array with unknown correctness. Probably the return value of a function call.
 * @param {array.<*>} desiredArray The correct array. Probably filled with hardcoded values.
 */
function testArraysEqual(description, array, desiredArray) {
  const correctLengths = array.length === desiredArray.length;
  const desiredElementsInArray = desiredArray.every(
    (value, index) => array[index] === value
  );

  parseTestResult(
    correctLengths && desiredElementsInArray,
    `${description} should be [${desiredArray.join(`, `)}].`,
    `${description} should be [${desiredArray.join(`, `)}] but is [${array.join(`, `)}].`
  );
}

/**
 * Prints the test result (pass or fail) to the console and increase errorCount if needed.
 * @param {boolean} passed Whether the test didn't error.
 * @param {string} passString The message if the test passed.
 * @param {string} failString The message if the test failed.
 */
function parseTestResult(passed, passString, failString) {
  if (passed) {
    console.log(`${colors.green(`[PASS]`)} ${passString}`);
  }
  else {
    console.log(`${colors.red(`[FAIL]`)} ${failString}`);
    errorCount++;
  }
}
