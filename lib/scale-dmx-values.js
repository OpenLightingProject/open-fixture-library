/**
 * @param {!number} dmxValue The original DMX value in the given current resolution.
 * @param {!number} currentResolution The current resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX value.
 * @param {!number} desiredResolution The desired resolution (1 for 8bit, 2 for 16bit, etc.) of the returned DMX value.
 * @returns {!number} The original DMX value, scaled to the desired resolution.
 */
function scaleDmxValue(dmxValue, currentResolution, desiredResolution) {
  const bytes = getBytes(dmxValue, currentResolution);

  while (currentResolution < desiredResolution) {
    bytes.push(bytes[currentResolution - 1]);
    currentResolution++;
  }

  while (currentResolution > desiredResolution) {
    bytes.length--; // remove last byte
    currentResolution--;
  }

  return bytesToDmxValue(bytes);
}

/**
 * @param {!number} dmxRangeStart The range's DMX start value in the given current resolution.
 * @param {!number} dmxRangeEnd The range's DMX end value in the given current resolution.
 * @param {!number} currentResolution The current resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX values.
 * @param {!number} desiredResolution The desired resolution (1 for 8bit, 2 for 16bit, etc.) of the returned DMX range.
 * @returns {!Array.<number>} The DMX start / end values, scaled to the desired resolution.
 */
function scaleDmxRange(dmxRangeStart, dmxRangeEnd, currentResolution, desiredResolution) {
  const startBytes = getBytes(dmxRangeStart, currentResolution);
  const endBytes = getBytes(dmxRangeEnd, currentResolution);

  while (currentResolution < desiredResolution) {
    startBytes.push(0);
    endBytes.push(255);
    currentResolution++;
  }

  while (currentResolution > desiredResolution) {
    const lastIndex = currentResolution - 1;

    // increase second last start byte by 1 if it won't become greater than the second last end byte
    // and if the last start byte isn't zero
    const secondLastByteIncreasing = startBytes[lastIndex - 1] < endBytes[lastIndex - 1];
    if (secondLastByteIncreasing && startBytes[lastIndex] > 0) {
      startBytes[lastIndex - 1]++;
    }

    startBytes.length--; // remove last start byte
    endBytes.length--; // remove last end byte
    currentResolution--;
  }

  return [bytesToDmxValue(startBytes), bytesToDmxValue(endBytes)];
}


module.exports = {
  scaleDmxValue,
  scaleDmxRange
};


/**
 * @param {!Array.<number>} bytes The individual channel values as 8bit numbers.
 * @returns {!number} The combined DMX value.
 */
function bytesToDmxValue(bytes) {
  let dmxValue = 0;

  bytes.forEach((byte, index) => {
    dmxValue += byte * Math.pow(256, bytes.length - index - 1);
  });

  return dmxValue;
}

/**
 * @param {!number} dmxValue A DMX value in the given resolution.
 * @param {!number} resolution The resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX value.
 * @returns {!Array.<number>} The DMX value, splitted into the individual channel values. Coarsest value first.
 */
function getBytes(dmxValue, resolution) {
  const bytes = [];

  while (resolution > 0) {
    const byte = dmxValue % 256;
    bytes.push(byte);
    dmxValue = (dmxValue - byte) / 256;
    resolution--;
  }

  if (dmxValue > 0) {
    throw Error(`Given DMX value was outside the given resolution`);
  }

  return bytes.reverse();
}
