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
   * @param {object} jsonObject A wheel slot object from the fixture's JSON data.
   * @param {Wheel} wheel The wheel that this slot belongs to.
   */
  constructor(jsonObject, wheel) {
    this._jsonObject = jsonObject;
    this._wheel = wheel;
    this._cache = {};
  }

  /**
   * @returns {string} The slot's type.
   */
  get type() {
    return this._jsonObject.type;
  }

  /**
   * @returns {string} The wheel slot's name.
   */
  get name() {
    if (!(`name` in this._cache)) {
      const nameFunction = this.type in namePerType ? namePerType[this.type] : namePerType.Default;
      let name = nameFunction(this, this._jsonObject.name || null);

      if (name === null) {
        const typeSlots = this._wheel.slots.filter(otherSlot => otherSlot.type === this.type);

        const typeName = this.type.replace(/([a-z])([A-Z])/g, `$1 $2`);

        if (typeSlots.length === 1) {
          name = typeName;
        }
        else {
          name = `${typeName} ${typeSlots.indexOf(this) + 1}`;
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
      if (`colors` in this._jsonObject) {
        this._cache.colors = this._jsonObject.colors;
      }
      else if (this.type === `Open`) {
        this._cache.colors = [`#ffffff`];
      }
      else if (this.type === `Closed`) {
        this._cache.colors = [`#000000`];
      }
      else {
        this._cache.colors = null;
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
    return this._jsonObject.floorSlot || null;
  }

  /**
   * @returns {WheelSlot|null} For split slots, the ceil (end) slot. Null for non-split slots.
   */
  get ceilSlot() {
    return this._jsonObject.ceilSlot || null;
  }
}

export default WheelSlot;
