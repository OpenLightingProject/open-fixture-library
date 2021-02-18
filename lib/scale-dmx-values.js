/**
 * @param {Number} dmxValue The original DMX value in the given current resolution.
 * @param {Number} currentResolution The current resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX value.
 * @param {Number} desiredResolution The desired resolution (1 for 8bit, 2 for 16bit, etc.) of the returned DMX value.
 * @returns {Number} The original DMX value, scaled to the desired resolution.
 */
export function scaleDmxValue(dmxValue, currentResolution, desiredResolution) {
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
 * @param {Number} dmxRangeStart The range's DMX start value in the given current resolution.
 * @param {Number} dmxRangeEnd The range's DMX end value in the given current resolution.
 * @param {Number} currentResolution The current resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX values.
 * @param {Number} desiredResolution The desired resolution (1 for 8bit, 2 for 16bit, etc.) of the returned DMX range.
 * @returns {[Number, Number]} The DMX start / end values, scaled to the desired resolution.
 */
export function scaleDmxRange(dmxRangeStart, dmxRangeEnd, currentResolution, desiredResolution) {
  return scaleDmxRangeIndividually(dmxRangeStart, currentResolution, dmxRangeEnd, currentResolution, desiredResolution);
}

/**
 * @param {Number} dmxRangeStart The range's DMX start value in the given current resolution.
 * @param {Number} startResolution The current resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX start value.
 * @param {Number} dmxRangeEnd The range's DMX end value in the given current resolution.
 * @param {Number} endResolution The current resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX end value.
 * @param {Number} desiredResolution The desired resolution (1 for 8bit, 2 for 16bit, etc.) of the returned DMX range.
 * @returns {[Number, Number]} The DMX start / end values, scaled to the desired resolution.
 */
export function scaleDmxRangeIndividually(dmxRangeStart, startResolution, dmxRangeEnd, endResolution, desiredResolution) {
  let startBytes = getBytes(dmxRangeStart, startResolution);
  const endBytes = getBytes(dmxRangeEnd, endResolution);

  while (endResolution < desiredResolution) {
    endBytes.push(255);
    endResolution++;
  }
  while (startResolution < desiredResolution) {
    startBytes.push(0);
    startResolution++;
  }

  while (endResolution > desiredResolution) {
    endBytes.length--; // remove last end byte
    endResolution--;
  }
  while (startResolution > desiredResolution) {
    const deletedStartByte = startBytes[startResolution - 1];

    startBytes.length--; // remove last start byte
    startResolution--;

    // increase start value by 1 if the deleted start byte was non-zero and if this won't make the range invalid
    if (deletedStartByte > 0 && bytesToDmxValue(startBytes) < bytesToDmxValue(endBytes)) {
      startBytes = getBytes(bytesToDmxValue(startBytes) + 1, startResolution);
    }
  }

  return [bytesToDmxValue(startBytes), bytesToDmxValue(endBytes)];
}


/**
 * @param {Array.<Number>} bytes The individual channel values as 8bit numbers.
 * @returns {Number} The combined DMX value.
 */
function bytesToDmxValue(bytes) {
  let dmxValue = 0;

  for (const [index, byte] of bytes.entries()) {
    dmxValue += byte * Math.pow(256, bytes.length - index - 1);
  }

  return dmxValue;
}

/**
 * @param {Number} dmxValue A DMX value in the given resolution.
 * @param {Number} resolution The resolution (1 for 8bit, 2 for 16bit, etc.) of the given DMX value.
 * @returns {Array.<Number>} The DMX value, splitted into the individual channel values. Coarsest value first.
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
    throw new Error(`Given DMX value was outside the given resolution`);
  }

  return bytes.reverse();
}
