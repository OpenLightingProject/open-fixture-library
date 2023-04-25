import cacheResult from '../cache-result.js';
import WheelSlot from "./WheelSlot.js";

/**
 * Information about a fixture's wheel.
 */
class Wheel {
  /**
   * Creates a new Wheel instance.
   * @param {string} wheelName The wheel's name, like specified in the JSON.
   * @param {object} jsonObject A wheel object from the fixture's JSON data.
   */
  constructor(wheelName, jsonObject) {
    this._name = wheelName;
    this._jsonObject = jsonObject;
    this._splitSlots = {};
    this._slotsOfType = {};
  }

  /**
   * @returns {string} The wheel's name.
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {'CW' | 'CCW'} The direction the wheel's slots are arranged in. Defaults to clockwise.
   */
  get direction() {
    return this._jsonObject.direction || `CW`;
  }

  /**
   * @returns {string} The type of the Wheel, i.e. the most frequent slot type (except for animation gobo wheels; the wheel type is AnimationGobo there).
   */
  get type() {
    // see https://stackoverflow.com/a/20762713/451391

    const slotTypes = this.slots.map(slot => slot.type);

    // sort by number of occurrences
    slotTypes.sort((a, b) => {
      const occurrencesOfA = slotTypes.filter(type => type === a);
      const occurrencesOfB = slotTypes.filter(type => type === b);
      return occurrencesOfA.length - occurrencesOfB.length;
    });

    const type = slotTypes.pop();

    if (type.startsWith(`AnimationGobo`)) {
      return `AnimationGobo`;
    }

    return type;
  }

  /**
   * @returns {object[]} Array of wheel slots.
   */
  get slots() {
    return cacheResult(this, `slots`, this._jsonObject.slots.map(
      slotJson => new WheelSlot(slotJson, this),
    ));
  }

  /**
   * @param {number} slotNumber The one-based slot number.
   * @returns {object} The slot object. Can be a split slot object, if a non-integer index is specified.
   */
  getSlot(slotNumber) {
    if (slotNumber % 1 === 0) {
      return this.slots[this.getAbsoluteSlotIndex(slotNumber)];
    }

    const floorIndex = this.getAbsoluteSlotIndex(Math.floor(slotNumber));
    const ceilIndex = this.getAbsoluteSlotIndex(Math.ceil(slotNumber));
    const splitKey = `Split ${floorIndex}/${ceilIndex}`;

    if (!(splitKey in this._splitSlots)) {
      // split slot
      const floorSlot = this.slots[floorIndex];
      const ceilSlot = this.slots[ceilIndex];

      this._splitSlots[splitKey] = new WheelSlot(null, this, floorSlot, ceilSlot);
    }

    return this._splitSlots[splitKey];
  }

  /**
   * @param {number} slotNumber The one-based slot number, can be smaller than 1 and greater than the number of slots.
   * @returns {number} The zero-based slot index, bounded by the number of slots.
   */
  getAbsoluteSlotIndex(slotNumber) {
    return ((slotNumber - 1) % this.slots.length) + (slotNumber < 1 ? this.slots.length : 0);
  }

  /**
   * @param {string} type The wheel slot type to search for.
   * @returns {WheelSlot[]} All slots with the given type.
   */
  getSlotsOfType(type) {
    if (!(type in this._slotsOfType)) {
      this._slotsOfType[type] = this.slots.filter(
        slot => slot.type === type,
      );
    }

    return this._slotsOfType[type];
  }
}

export default Wheel;
