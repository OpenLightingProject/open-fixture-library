/**
 */
export class ARACrypt {
  /**
   */
  constructor() {
    this.lfsrA = 0x13_57_9B_DF;
    this.lfsrB = 0x24_68_AC_E0;
    this.lfsrC = 0xFD_B9_75_31;
    this.maskA = 0x80_00_00_62;
    this.maskB = 0x40_00_00_20;
    this.maskC = 0x10_00_00_02;
    this.rot0A = 0x7F_FF_FF_FF;
    this.rot0B = 0x3F_FF_FF_FF;
    this.rot0C = 0x0F_FF_FF_FF;
    this.rot1A = 0x80_00_00_00;
    this.rot1B = 0xC0_00_00_00;
    this.rot1C = 0xF0_00_00_00;
    this.key = ``;
  }
  /**
   * @param {string} key string
   */
  setKey(key) {
    if (key === ``) {
      throw new Error(`key cannot be empty`);
    }
    this.key = key;

    const keyBytes = Buffer.from(key, `utf-8`);
    let csSeed = keyBytes;
    while (csSeed.length < 12) {
      const index = csSeed.length % keyBytes.length;
      csSeed = Buffer.concat([csSeed, Buffer.from([keyBytes[index]])]);
    }

    this.lfsrA = 0;
    this.lfsrB = 0;
    this.lfsrC = 0;

    for (let index = 0; index < 4; index++) {
      // eslint-disable-next-line no-bitwise
      this.lfsrA = ((this.lfsrA << 8) | csSeed[index]) >>> 0;
      // eslint-disable-next-line no-bitwise
      this.lfsrB = ((this.lfsrB << 8) | csSeed[index + 4]) >>> 0;
      // eslint-disable-next-line no-bitwise
      this.lfsrC = ((this.lfsrC << 8) | csSeed[index + 8]) >>> 0;
    }

    if (this.lfsrA === 0) {
      this.lfsrA = 0x13_57_9B_DF;
    }
    if (this.lfsrB === 0) {
      this.lfsrB = 0x24_68_AC_E0;
    }
    if (this.lfsrC === 0) {
      this.lfsrC = 0xFD_B9_75_31;
    }
    // eslint-disable-next-line no-bitwise
    this.lfsrA >>>= 0;
    // eslint-disable-next-line no-bitwise
    this.lfsrB >>>= 0;
    // eslint-disable-next-line no-bitwise
    this.lfsrC >>>= 0;
  }

  /**
   * @param {string} input tbd
   * @returns {string} tbd
   */
  transformChar(input) {
    let crypto = 0;
    // eslint-disable-next-line no-bitwise
    let outB = this.lfsrB & 1;
    // eslint-disable-next-line no-bitwise
    let outC = this.lfsrC & 1;

    for (let index = 0; index < 8; index++) {
      // eslint-disable-next-line no-bitwise
      if ((this.lfsrA & 1) === 0) {
        // eslint-disable-next-line no-bitwise
        this.lfsrA = (this.lfsrA >>> 1) & this.rot0A;
        // eslint-disable-next-line no-bitwise
        this.lfsrA >>>= 0;

        // eslint-disable-next-line no-bitwise
        const originalLsbC = this.lfsrC & 1;
        if (originalLsbC === 0) {
          // eslint-disable-next-line no-bitwise
          this.lfsrC = (this.lfsrC >>> 1) & this.rot0C;
          outC = 0;
        }
        else {
          // eslint-disable-next-line no-bitwise
          this.lfsrC = ((this.lfsrC ^ this.maskC) >>> 1) | this.rot1C;
          outC = 1;
        }
        // eslint-disable-next-line no-bitwise
        this.lfsrC >>>= 0;
      }
      else {
        // eslint-disable-next-line no-bitwise
        this.lfsrA = ((this.lfsrA ^ this.maskA) >>> 1) | this.rot1A;
        // eslint-disable-next-line no-bitwise
        this.lfsrA >>>= 0;

        // eslint-disable-next-line no-bitwise
        const originalLsbB = this.lfsrB & 1;
        if (originalLsbB === 0) {
          // eslint-disable-next-line no-bitwise
          this.lfsrB = (this.lfsrB >>> 1) & this.rot0B;
          outB = 0;
        }
        else {
          // eslint-disable-next-line no-bitwise
          this.lfsrB = ((this.lfsrB ^ this.maskB) >>> 1) | this.rot1B;
          outB = 1;
        }
        // eslint-disable-next-line no-bitwise
        this.lfsrB >>>= 0;
      }
      // eslint-disable-next-line no-bitwise
      crypto = (crypto << 1) | (outB ^ outC);
    }
    // eslint-disable-next-line no-bitwise
    input ^= crypto;
    if (input === 0) {
      // eslint-disable-next-line no-bitwise
      input ^= crypto;
    }

    return input;
  }
  /**
   * @param {object} buffer tbd
   * @returns {string} tbd
   */
  async transformBuffer(buffer) {
    this.setKey(``); // see https://github.com/OpenLightingProject/open-fixture-library/issues/99

    const output = Buffer.alloc(buffer.length);

    for (const [index, element] of buffer.entries()) {
      output[index] = this.transformChar(element);
    }

    return output;
  }
}

