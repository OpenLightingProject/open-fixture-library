import { describe, expect, it } from 'vitest';

import {
  scaleDmxRange,
  scaleDmxValue,
} from '../lib/scale-dmx-values.js';


describe(`scaleDmxValue`, () => {
  describe(`upscaling`, () => {
    describe(`8bit → 16bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [  0, 1, 2,      0], // [  0] → [  0,   0]
        [127, 1, 2, 32_639], // [127] → [127, 127]
        [255, 1, 2, 65_535], // [255] → [255, 255] = 256^2 - 1
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxValue(%i, %i, %i) should be %i`, (dmxValue, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxValue(dmxValue, currentResolution, desiredResolution)).toBe(expected);
      });
    });

    describe(`8bit → 24bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [  0, 1, 3,          0], // [  0] → [  0,   0,   0]
        [127, 1, 3,  8_355_711], // [127] → [127, 127, 127]
        [128, 1, 3,  8_421_504], // [128] → [128, 128, 128]
        [255, 1, 3, 16_777_215], // [255] → [255, 255, 255] = 256^3 - 1
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxValue(%i, %i, %i) should be %i`, (dmxValue, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxValue(dmxValue, currentResolution, desiredResolution)).toBe(expected);
      });
    });

    describe(`16bit → 24bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [     0, 2, 3,          0], // [  0,   0] → [  0,   0,   0]
        [   255, 2, 3,     65_535], // [  0, 255] → [  0, 255, 255]
        [   256, 2, 3,     65_536], // [  1,   0] → [  1,   0,   0]
        [32_767, 2, 3,  8_388_607], // [127, 255] → [127, 255, 255]
        [32_768, 2, 3,  8_388_608], // [128,   0] → [128,   0,   0]
        [65_279, 2, 3, 16_711_679], // [254, 255] → [254, 255, 255]
        [65_280, 2, 3, 16_711_680], // [255,   0] → [255,   0,   0]
        [65_535, 2, 3, 16_777_215], // [255, 255] → [255, 255, 255]
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxValue(%i, %i, %i) should be %i`, (dmxValue, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxValue(dmxValue, currentResolution, desiredResolution)).toBe(expected);
      });
    });
  });

  describe(`downscaling`, () => {
    describe(`16bit → 8bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [     0, 2, 1,   0], // [  0,   0] → [  0]
        [32_512, 2, 1, 127], // [127,   0] → [127]
        [32_639, 2, 1, 127], // [127, 127] → [127]
        [32_767, 2, 1, 127], // [127, 255] → [127]
        [32_768, 2, 1, 128], // [128,   0] → [128]
        [65_280, 2, 1, 255], // [255,   0] → [255]
        [65_535, 2, 1, 255], // [255, 255] → [255]
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxValue(%i, %i, %i) should be %i`, (dmxValue, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxValue(dmxValue, currentResolution, desiredResolution)).toBe(expected);
      });
    });

    describe(`24bit → 8bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [         0, 3, 1,   0], // [  0,   0,   0] → [  0]
        [    65_535, 3, 1,   0], // [  0, 255, 255] → [  0]
        [    65_536, 3, 1,   1], // [  1,   0,   0] → [  1]
        [ 8_388_607, 3, 1, 127], // [127, 255, 255] → [127]
        [ 8_388_608, 3, 1, 128], // [128,   0,   0] → [128]
        [16_711_679, 3, 1, 254], // [254, 255, 255] → [254]
        [16_711_680, 3, 1, 255], // [255,   0,   0] → [255]
        [16_777_215, 3, 1, 255], // [255, 255, 255] → [255]
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxValue(%i, %i, %i) should be %i`, (dmxValue, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxValue(dmxValue, currentResolution, desiredResolution)).toBe(expected);
      });
    });

    describe(`24bit → 16bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [         0, 3, 2,      0], // [  0,   0,   0] → [  0,   0]
        [    65_535, 3, 2,    255], // [  0, 255, 255] → [  0, 255]
        [    65_536, 3, 2,    256], // [  1,   0,   0] → [  1,   0]
        [ 8_388_352, 3, 2, 32_767], // [127, 255,   0] → [127, 255]
        [ 8_388_607, 3, 2, 32_767], // [127, 255, 255] → [127, 255]
        [ 8_388_608, 3, 2, 32_768], // [128,   0,   0] → [128,   0]
        [16_711_679, 3, 2, 65_279], // [254, 255, 255] → [254, 255]
        [16_711_680, 3, 2, 65_280], // [255,   0,   0] → [255,   0]
        [16_711_935, 3, 2, 65_280], // [255,   0, 255] → [255,   0]
        [16_777_215, 3, 2, 65_535], // [255, 255, 255] → [255, 255]
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxValue(%i, %i, %i) should be %i`, (dmxValue, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxValue(dmxValue, currentResolution, desiredResolution)).toBe(expected);
      });
    });
  });
});

describe(`scaleDmxRange`, () => {
  describe(`upscaling`, () => {
    describe(`8bit → 16bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [[  0,   0], 1, 2, [     0,    255]],
        [[  0, 254], 1, 2, [     0, 65_279]],
        [[  0, 255], 1, 2, [     0, 65_535]],
        [[127, 127], 1, 2, [32_512, 32_767]],
        [[255, 255], 1, 2, [65_280, 65_535]],
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxRange(%j, %i, %i) should be %j`, (dmxRange, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxRange(dmxRange[0], dmxRange[1], currentResolution, desiredResolution)).toStrictEqual(expected);
      });
    });

    describe(`8bit → 24bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [[  0,   0], 1, 3, [         0,     65_535]],
        [[  0, 254], 1, 3, [         0, 16_711_679]],
        [[  0, 255], 1, 3, [         0, 16_777_215]],
        [[127, 127], 1, 3, [ 8_323_072,  8_388_607]],
        [[255, 255], 1, 3, [16_711_680, 16_777_215]],
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxRange(%j, %i, %i) should be %j`, (dmxRange, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxRange(dmxRange[0], dmxRange[1], currentResolution, desiredResolution)).toStrictEqual(expected);
      });
    });
  });

  describe(`downscaling`, () => {
    describe(`16bit → 8bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [[     0,    255], 2, 1, [  0,   0]],
        [[     0,    100], 2, 1, [  0,   0]],
        [[   101,    200], 2, 1, [  0,   0]],
        [[   201,    300], 2, 1, [  1,   1]],
        [[     0, 65_535], 2, 1, [  0, 255]],
        [[32_512, 32_767], 2, 1, [127, 127]],
        [[64_000, 65_279], 2, 1, [250, 254]],
        [[65_279, 65_535], 2, 1, [255, 255]],
        [[65_280, 65_535], 2, 1, [255, 255]],
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxRange(%j, %i, %i) should be %j`, (dmxRange, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxRange(dmxRange[0], dmxRange[1], currentResolution, desiredResolution)).toStrictEqual(expected);
      });
    });

    describe(`24bit → 8bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [[  615_605, 1_683_118], 3, 1, [10, 25]],
        [[1_683_119, 2_244_792], 3, 1, [26, 34]],
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxRange(%j, %i, %i) should be %j`, (dmxRange, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxRange(dmxRange[0], dmxRange[1], currentResolution, desiredResolution)).toStrictEqual(expected);
      });
    });

    describe(`24bit → 16bit`, () => {
      it.each([
        /* eslint-disable no-multi-spaces, array-bracket-spacing */
        [[  615_605, 1_683_118], 3, 2, [2405, 6574]],
        [[1_683_119, 2_244_792], 3, 2, [6575, 8768]],
        /* eslint-enable no-multi-spaces, array-bracket-spacing */
      ])(`scaleDmxRange(%j, %i, %i) should be %j`, (dmxRange, currentResolution, desiredResolution, expected) => {
        expect(scaleDmxRange(dmxRange[0], dmxRange[1], currentResolution, desiredResolution)).toStrictEqual(expected);
      });
    });
  });
});

describe(`random capabilities`, () => {
  it(`scaled down from 16bit to 8bit do not overlap`, () => {
    const scaledRanges = getScaledDownRanges(2);
    for (const [index, scaledRange] of scaledRanges.slice(1).entries()) {
      expect(scaledRange[0]).toBeGreaterThan(scaledRanges[index][1]);
    }
  });

  it(`scaled down from 24bit to 16bit do not overlap`, () => {
    const scaledRanges = getScaledDownRanges(3);
    for (const [index, scaledRange] of scaledRanges.slice(1).entries()) {
      expect(scaledRange[0]).toBeGreaterThan(scaledRanges[index][1]);
    }
  });
});


/**
 * @param {number} resolution The resolution of the original ranges. Must be 2 or higher.
 * @returns {[number, number][]} List of adjacent [start, end] ranges, scaled down to the next-lower resolution.
 */
function getScaledDownRanges(resolution) {
  return getRandomCapabilityRanges(resolution).map(
    ([start, end]) => scaleDmxRange(start, end, resolution, resolution - 1),
  );
}

/**
 * @param {number} resolution The resolution (1 for 8bit, 2 for 16bit, etc.).
 * @returns {[number, number][]} Random list of adjacent capability [start, end] ranges. Together, they fill a whole channel.
 */
function getRandomCapabilityRanges(resolution) {
  const minimumRangeWidth = Math.pow(256, resolution - 1) - 1;
  const maximumRangeWidth = minimumRangeWidth * 20;

  const ranges = [];
  let remainingDmxValues = Math.pow(256, resolution);
  while (remainingDmxValues > 0) {
    const rangeWidth = remainingDmxValues > maximumRangeWidth
      ? Math.floor((Math.random() * (maximumRangeWidth - (2 * minimumRangeWidth))) + minimumRangeWidth)
      : remainingDmxValues;

    const lastDmxValue = ranges.length > 0 ? ranges.at(-1)[1] : -1;
    ranges.push([lastDmxValue + 1, lastDmxValue + rangeWidth]);
    remainingDmxValues -= rangeWidth;
  }

  return ranges;
}
