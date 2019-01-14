import Entity from './Entity.mjs';

const namePerType = {
  Color: (slot, name) => {
    if (name !== null && slot.colorTemperature !== null) {
      return `${name} (${slot.colorTemperature.toString()})`;
    }

    if (slot.colorTemperature !== null) {
      return slot.colorTemperature.toString();
    }

    return name;
  },
  Gobo: (slot, name) => {
    if (name === null) {
      return null;
    }

    if (name.startsWith(`Gobo`)) {
      return name;
    }

    return `Gobo ${name}`;
  },
  Prism: (slot, name) => {
    if (name !== null && slot.facets !== null) {
      return `${slot.facets}-facet ${name}`;
    }

    if (slot.facets !== null) {
      return `${slot.facets}-facet prism`;
    }

    return name;
  },
  Iris: (slot, name) => {
    if (slot.openPercent !== null) {
      return `Iris ${slot.openPercent.toString()}`;
    }

    return null;
  },
  Frost: (slot, name) => {
    if (slot.frostIntensity !== null) {
      return `Frost ${slot.frostIntensity.toString()}`;
    }

    return null;
  },
  Split: (slot, name) => {
    return `Split ${slot.floorSlot.name} / ${slot.ceilSlot.name}`;
  },
  AnimationGoboStart: (slot, name) => {
    return name !== null ? `${name} Start` : null;
  },
  AnimationGoboEnd: (slot, name) => {
    const slotNumber = slot._wheel.slots.indexOf(slot) + 1;
    const prevSlot = slot._wheel.getSlot(slotNumber - 1);

    return prevSlot._jsonObject.name ? `${prevSlot._jsonObject.name} End` : null;
  },
  AnimationGobo: (slot, name) => {
    return slot.floorSlot.name.replace(` Start`, ``);
  },
  Default: (slot, name) => {
    return name;
  }
};

/**
 * Information about a single wheel slot (or a split slot).
 */
class WheelSlot {
  /**
   * Creates a new WheelSlot instance.
   * @param {object|null} jsonObject A wheel slot object from the fixture's JSON data. If null, this WheelSlot is a split slot.
   * @param {Wheel} wheel The wheel that this slot belongs to.
   * @param {Slot|null} floorSlot For split slots, the WheelSlot instance at the start.
   * @param {Slot|null} ceilSlot For split slots, the WheelSlot instance at the end.
   */
  constructor(jsonObject, wheel, floorSlot = null, ceilSlot = null) {
    this._jsonObject = jsonObject;
    this._wheel = wheel;
    this._cache = {};
    this._floorSlot = floorSlot;
    this._ceilSlot = ceilSlot;
  }

  /**
   * @returns {boolean} True if this WheelSlot instance represents a split slot.
   */
  get isSplitSlot() {
    return this._jsonObject === null;
  }

  /**
   * @returns {string} The slot's type.
   */
  get type() {
    if (!(`type` in this._cache)) {
      if (!this.isSplitSlot) {
        this._cache.type = this._jsonObject.type;
      }
      else if (this._floorSlot.type === `AnimationGoboStart` && this._ceilSlot.type === `AnimationGoboEnd`) {
        this._cache.type = `AnimationGobo`;
      }
      else {
        this._cache.type = `Split`;
      }
    }

    return this._cache.type;
  }

  /**
   * @returns {number} The zero-based index of this slot amongst all slots with the same type in this wheel.
   */
  get nthOfType() {
    if (!(`nthOfType` in this._cache)) {
      this._cache.nthOfType = this._wheel.getSlotsOfType(this.type).indexOf(this);
    }

    return this._cache.nthOfType;
  }

  /**
   * @returns {string} The wheel slot's name.
   */
  get name() {
    if (!(`name` in this._cache)) {
      const nameFunction = this.type in namePerType ? namePerType[this.type] : namePerType.Default;
      let name = nameFunction(this, this.isSplitSlot ? null : (this._jsonObject.name || null));

      if (name === null) {
        const typeName = this.type.replace(/([a-z])([A-Z])/g, `$1 $2`); // 'CamelCase' -> 'Camel Case'

        if (this._wheel.getSlotsOfType(this.type).length === 1) {
          name = typeName;
        }
        else {
          name = `${typeName} ${this.nthOfType + 1}`;
        }
      }

      this._cache.name = name;
    }

    return this._cache.name;
  }

  /**
   * @returns {array.<string>|null} The colors of this wheel slot, or null if this slot has no colors.
   */
  get colors() {
    if (!(`colors` in this._cache)) {
      const fixedColors = {
        Open: [`#ffffff`],
        Closed: [`#000000`]
      };

      this._cache.colors = null;

      if (this.type in fixedColors) {
        this._cache.colors = fixedColors[this.type];
      }
      else if (this.isSplitSlot) {
        if (this._floorSlot.colors && this._ceilSlot.colors) {
          this._cache.colors = this._floorSlot.colors.concat(this._ceilSlot.colors);
        }
      }
      else if (`colors` in this._jsonObject) {
        this._cache.colors = this._jsonObject.colors;
      }
    }

    return this._cache.colors;
  }

  /**
   * @returns {Entity|null} For Color slots, the slot's color temperature. Null if this slot has no color temperature.
   */
  get colorTemperature() {
    if (!(`colorTemperature` in this._cache)) {
      if (`colorTemperature` in this._jsonObject) {
        this._cache.colorTemperature = Entity.createFromEntityString(this._jsonObject.colorTemperature);
      }
      else {
        this._cache.colorTemperature = null;
      }
    }

    return this._cache.colorTemperature;
  }

  /**
   * @returns {number|null} For Prism slots, the number of prism facets. Null if number of facets is not defined.
   */
  get facets() {
    return this._jsonObject.facets || null;
  }

  /**
   * @returns {Entity|null} For Iris slots, the slot's openPercent value. Null if this slot has no openPercent value.
   */
  get openPercent() {
    if (!(`openPercent` in this._cache)) {
      if (`openPercent` in this._jsonObject) {
        this._cache.openPercent = Entity.createFromEntityString(this._jsonObject.openPercent);
      }
      else {
        this._cache.openPercent = null;
      }
    }

    return this._cache.openPercent;
  }

  /**
   * @returns {Entity|null} For Frost slots, the slot's frost intensity. Null if this slot has no frost intensity.
   */
  get frostIntensity() {
    if (!(`frostIntensity` in this._cache)) {
      if (`frostIntensity` in this._jsonObject) {
        this._cache.frostIntensity = Entity.createFromEntityString(this._jsonObject.frostIntensity);
      }
      else {
        this._cache.frostIntensity = null;
      }
    }

    return this._cache.frostIntensity;
  }

  /**
   * @returns {WheelSlot|null} For split slots, the floor (start) slot. Null for non-split slots.
   */
  get floorSlot() {
    return this._floorSlot || null;
  }

  /**
   * @returns {WheelSlot|null} For split slots, the ceil (end) slot. Null for non-split slots.
   */
  get ceilSlot() {
    return this._ceilSlot || null;
  }
}

export default WheelSlot;
