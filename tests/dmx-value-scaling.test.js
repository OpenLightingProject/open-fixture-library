import { describe, expect, it } from 'vitest';
import {
  scaleDmxRange,
  scaleDmxValue,
} from '../lib/scale-dmx-values.js';

describe(`scaleDmxValue`, () => {
  describe(`8bit → 16bit`, () => {
    it.each`
      dmxValue |  expected | comment
          ${0} |      ${0} | ${`[  0] → [  0,   0]`}
        ${127} | ${32_639} | ${`[127] → [127, 127]`}
        ${255} | ${65_535} | ${`[255] → [255, 255] = 256^2 - 1`}
    `(`scaleDmxValue($dmxValue, 1, 2) should be $expected`, ({ dmxValue, expected }) => {
      expect(scaleDmxValue(dmxValue, 1, 2)).toBe(expected);
    });
  });

  describe(`8bit → 24bit`, () => {
    it.each`
      dmxValue |      expected | comment
          ${0} |          ${0} | ${`[  0] → [  0,   0,   0]`}
        ${127} |  ${8_355_711} | ${`[127] → [127, 127, 127]`}
        ${128} |  ${8_421_504} | ${`[128] → [128, 128, 128]`}
        ${255} | ${16_777_215} | ${`[255] → [255, 255, 255] = 256^3 - 1`}
    `(`scaleDmxValue($dmxValue, 1, 3) should be $expected`, ({ dmxValue, expected }) => {
      expect(scaleDmxValue(dmxValue, 1, 3)).toBe(expected);
    });
  });

  describe(`16bit → 24bit`, () => {
    it.each`
       dmxValue |      expected | comment
           ${0} |          ${0} | ${`[  0,   0] → [  0,   0,   0]`}
         ${255} |     ${65_535} | ${`[  0, 255] → [  0, 255, 255]`}
         ${256} |     ${65_536} | ${`[  1,   0] → [  1,   0,   0]`}
      ${32_767} |  ${8_388_607} | ${`[127, 255] → [127, 255, 255]`}
      ${32_768} |  ${8_388_608} | ${`[128,   0] → [128,   0,   0]`}
      ${65_279} | ${16_711_679} | ${`[254, 255] → [254, 255, 255]`}
      ${65_280} | ${16_711_680} | ${`[255,   0] → [255,   0,   0]`}
      ${65_535} | ${16_777_215} | ${`[255, 255] → [255, 255, 255]`}
    `(`scaleDmxValue($dmxValue, 2, 3) should be $expected`, ({ dmxValue, expected }) => {
      expect(scaleDmxValue(dmxValue, 2, 3)).toBe(expected);
    });
  });

  describe(`16bit → 8bit`, () => {
    it.each`
       dmxValue | expected | comment
           ${0} |     ${0} | ${`[  0,   0] → [  0]`}
      ${32_512} |   ${127} | ${`[127,   0] → [127]`}
      ${32_639} |   ${127} | ${`[127, 127] → [127]`}
      ${32_767} |   ${127} | ${`[127, 255] → [127]`}
      ${32_768} |   ${128} | ${`[128,   0] → [128]`}
      ${65_280} |   ${255} | ${`[255,   0] → [255]`}
      ${65_535} |   ${255} | ${`[255, 255] → [255] = 256^2 - 1`}
    `(`scaleDmxValue($dmxValue, 2, 1) should be $expected`, ({ dmxValue, expected }) => {
      expect(scaleDmxValue(dmxValue, 2, 1)).toBe(expected);
    });
  });

  describe(`24bit → 8bit`, () => {
    it.each`
           dmxValue | expected | comment
               ${0} |     ${0} | ${`[  0,   0,   0] → [  0]`}
          ${65_535} |     ${0} | ${`[  0, 255, 255] → [  0]`}
          ${65_536} |     ${1} | ${`[  1,   0,   0] → [  1]`}
       ${8_388_607} |   ${127} | ${`[127, 255, 255] → [127]`}
       ${8_388_608} |   ${128} | ${`[128,   0,   0] → [128]`}
      ${16_711_679} |   ${254} | ${`[254, 255, 255] → [254]`}
      ${16_711_680} |   ${255} | ${`[255,   0,   0] → [255]`}
      ${16_777_215} |   ${255} | ${`[255, 255, 255] → [255]`}
    `(`scaleDmxValue($dmxValue, 3, 1) should be $expected`, ({ dmxValue, expected }) => {
      expect(scaleDmxValue(dmxValue, 3, 1)).toBe(expected);
    });
  });

  describe(`24bit → 16bit`, () => {
    it.each`
           dmxValue |  expected | comment
               ${0} |      ${0} | ${`[  0,   0,   0] → [  0,   0]`}
          ${65_535} |    ${255} | ${`[  0, 255, 255] → [  0, 255]`}
          ${65_536} |    ${256} | ${`[  1,   0,   0] → [  1,   0]`}
       ${8_388_352} | ${32_767} | ${`[127, 255,   0] → [127, 255]`}
       ${8_388_607} | ${32_767} | ${`[127, 255, 255] → [127, 255]`}
       ${8_388_608} | ${32_768} | ${`[128,   0,   0] → [128,   0]`}
      ${16_711_679} | ${65_279} | ${`[254, 255, 255] → [254, 255]`}
      ${16_711_680} | ${65_280} | ${`[255,   0,   0] → [255,   0]`}
      ${16_711_935} | ${65_280} | ${`[255,   0, 255] → [255,   0]`}
      ${16_777_215} | ${65_535} | ${`[255, 255, 255] → [255, 255]`}
    `(`scaleDmxValue($dmxValue, 3, 2) should be $expected`, ({ dmxValue, expected }) => {
      expect(scaleDmxValue(dmxValue, 3, 2)).toBe(expected);
    });
  });
});

describe(`scaleDmxRange`, () => {
  describe(`8bit → 16bit`, () => {
    it.each`
       start |    end | scaledStart | scaledEnd
        ${0} |   ${0} |        ${0} |    ${255}
        ${0} | ${254} |        ${0} | ${65_279}
        ${0} | ${255} |        ${0} | ${65_535}
      ${127} | ${127} |   ${32_512} | ${32_767}
      ${255} | ${255} |   ${65_280} | ${65_535}
    `(`scaleDmxRange([$start, $end], 1, 2) should be [$scaledStart, $scaledEnd]`, ({ start, end, scaledStart, scaledEnd }) => {
      expect(scaleDmxRange(start, end, 1, 2)).toStrictEqual([scaledStart, scaledEnd]);
    });
  });

  describe(`8bit → 24bit`, () => {
    it.each`
       start |    end |   scaledStart |     scaledEnd
        ${0} |   ${0} |          ${0} |     ${65_535}
        ${0} | ${254} |          ${0} | ${16_711_679}
        ${0} | ${255} |          ${0} | ${16_777_215}
      ${127} | ${127} |  ${8_323_072} |  ${8_388_607}
      ${255} | ${255} | ${16_711_680} | ${16_777_215}
    `(`scaleDmxRange([$start, $end], 1, 3) should be [$scaledStart, $scaledEnd]`, ({ start, end, scaledStart, scaledEnd }) => {
      expect(scaleDmxRange(start, end, 1, 3)).toStrictEqual([scaledStart, scaledEnd]);
    });
  });

  describe(`16bit → 8bit`, () => {
    it.each`
          start |       end | scaledStart | scaledEnd
           ${0} |    ${255} |        ${0} |      ${0}
           ${0} |    ${100} |        ${0} |      ${0}
         ${101} |    ${200} |        ${0} |      ${0}
         ${201} |    ${300} |        ${1} |      ${1}
           ${0} | ${65_535} |        ${0} |    ${255}
      ${32_512} | ${32_767} |      ${127} |    ${127}
      ${64_000} | ${65_279} |      ${250} |    ${254}
      ${65_279} | ${65_535} |      ${255} |    ${255}
      ${65_280} | ${65_535} |      ${255} |    ${255}
    `(`scaleDmxRange([$start, $end], 2, 1) should be [$scaledStart, $scaledEnd]`, ({ start, end, scaledStart, scaledEnd }) => {
      expect(scaleDmxRange(start, end, 2, 1)).toStrictEqual([scaledStart, scaledEnd]);
    });
  });

  describe(`24bit → 8bit`, () => {
    it.each`
             start |          end | scaledStart | scaledEnd
        ${615_605} | ${1_683_118} |       ${10} |     ${25}
      ${1_683_119} | ${2_244_792} |       ${26} |     ${34}
    `(`scaleDmxRange([$start, $end], 3, 1) should be [$scaledStart, $scaledEnd]`, ({ start, end, scaledStart, scaledEnd }) => {
      expect(scaleDmxRange(start, end, 3, 1)).toStrictEqual([scaledStart, scaledEnd]);
    });
  });

  describe(`24bit → 16bit`, () => {
    it.each`
             start |          end | scaledStart | scaledEnd
        ${615_605} | ${1_683_118} |     ${2405} |   ${6574}
      ${1_683_119} | ${2_244_792} |     ${6575} |   ${8768}
    `(`scaleDmxRange([$start, $end], 3, 2) should be [$scaledStart, $scaledEnd]`, ({ start, end, scaledStart, scaledEnd }) => {
      expect(scaleDmxRange(start, end, 3, 2)).toStrictEqual([scaledStart, scaledEnd]);
    });
  });
});

describe(`random capabilities`, () => {
  it(`scaled down from 16bit to 8bit do not overlap`, () => {
    const scaledRanges = getScaledDownRanges(2);
    for (const [index, scaledRange] of scaledRanges.entries()) {
      if (index === 0) {
        continue;
      }

      const rangeStart = scaledRange[0];
      const previousRangeEnd = scaledRanges[index - 1][1];
      expect(rangeStart).toBeGreaterThan(previousRangeEnd);
    }
  });

  it(`scaled down from 24bit to 16bit do not overlap`, () => {
    const scaledRanges = getScaledDownRanges(3);
    for (const [index, scaledRange] of scaledRanges.entries()) {
      if (index === 0) {
        continue;
      }

      const rangeStart = scaledRange[0];
      const previousRangeEnd = scaledRanges[index - 1][1];
      expect(rangeStart).toBeGreaterThan(previousRangeEnd);
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
