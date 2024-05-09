import cacheResult from '../cache-result.js';
import Entity from './Entity.js';
import Resource from './Resource.js';
/** @ignore @typedef {import('./Wheel.js').default} Wheel */

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
      if (slot.resource !== null) {
        return `Gobo ${slot.resource.name}`;
      }

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
    return name === null ? null : `${name} Start`;
  },
  AnimationGoboEnd: (slot, name) => {
    const slotNumber = slot._wheel.slots.indexOf(slot) + 1;
    const previousSlot = slot._wheel.getSlot(slotNumber - 1);

    return previousSlot._jsonObject.name ? `${previousSlot._jsonObject.name} End` : null;
  },
  AnimationGobo: (slot, name) => {
    return slot.floorSlot.name.replace(` Start`, ``);
  },
  Default: (slot, name) => {
    return name;
  },
};

/**
 * Information about a single wheel slot (or a split slot).
 */
class WheelSlot {
  /**
   * Creates a new WheelSlot instance.
   * @param {object | null} jsonObject A wheel slot object from the fixture's JSON data. If null, this WheelSlot is a split slot.
   * @param {Wheel} wheel The wheel that this slot belongs to.
   * @param {WheelSlot | null} floorSlot For split slots, the WheelSlot instance at the start.
   * @param {WheelSlot | null} ceilSlot For split slots, the WheelSlot instance at the end.
   */
  constructor(jsonObject, wheel, floorSlot = null, ceilSlot = null) {
    this._jsonObject = jsonObject;
    this._wheel = wheel;
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
    if (!this.isSplitSlot) {
      return cacheResult(this, `type`, this._jsonObject.type);
    }

    if (this._floorSlot.type === `AnimationGoboStart`) {
      return cacheResult(this, `type`, `AnimationGobo`);
    }

    return cacheResult(this, `type`, `Split`);
  }

  /**
   * @returns {number} The zero-based index of this slot amongst all slots with the same type in this wheel.
   */
  get nthOfType() {
    return cacheResult(this, `nthOfType`, this._wheel.getSlotsOfType(this.type).indexOf(this));
  }

  /**
   * @returns {Resource | string | null} The gobo resource object if it was previously embedded, or the gobo resource reference string, or null if no resource is specified for the slot.
   */
  get resource() {
    if (this.isSplitSlot || !(`resource` in this._jsonObject)) {
      return cacheResult(this, `resource`, null);
    }

    if (typeof this._jsonObject.resource === `string`) {
      return cacheResult(this, `resource`, this._jsonObject.resource);
    }

    return cacheResult(this, `resource`, new Resource(this._jsonObject.resource));
  }

  /**
   * @returns {string} The wheel slot's name.
   */
  get name() {
    const nameFunction = this.type in namePerType ? namePerType[this.type] : namePerType.Default;
    let name = nameFunction(this, this.isSplitSlot ? null : (this._jsonObject.name || null));

    if (name === null) {
      const typeName = this.type.replaceAll(/([a-z])([A-Z])/g, `$1 $2`); // 'CamelCase' -> 'Camel Case'
      name = this._wheel.getSlotsOfType(this.type).length === 1 ? typeName : `${typeName} ${this.nthOfType + 1}`;
    }

    return cacheResult(this, `name`, name);
  }

  /**
   * @returns {string[] | null} The colors of this wheel slot, or null if this slot has no colors.
   */
  get colors() {
    const fixedColors = {
      Open: [`#ffffff`],
      Closed: [`#000000`],
    };

    if (this.type in fixedColors) {
      return cacheResult(this, `colors`, fixedColors[this.type]);
    }

    if (this.isSplitSlot) {
      if (this._floorSlot.colors && this._ceilSlot.colors) {
        return cacheResult(this, `colors`, [...this._floorSlot.colors, ...this._ceilSlot.colors]);
      }
    }
    else if (`colors` in this._jsonObject) {
      return cacheResult(this, `colors`, this._jsonObject.colors);
    }

    return cacheResult(this, `colors`, null);
  }

  /**
   * @returns {Entity | null} For Color slots, the slot's color temperature. Null if this slot has no color temperature.
   */
  get colorTemperature() {
    if (`colorTemperature` in this._jsonObject) {
      return cacheResult(this, `colorTemperature`, Entity.createFromEntityString(this._jsonObject.colorTemperature));
    }

    return cacheResult(this, `colorTemperature`, null);
  }

  /**
   * @returns {number | null} For Prism slots, the number of prism facets. Null if number of facets is not defined.
   */
  get facets() {
    return this._jsonObject.facets || null;
  }

  /**
   * @returns {Entity | null} For Iris slots, the slot's openPercent value. Null if this slot has no openPercent value.
   */
  get openPercent() {
    if (`openPercent` in this._jsonObject) {
      return cacheResult(this, `openPercent`, Entity.createFromEntityString(this._jsonObject.openPercent));
    }

    return cacheResult(this, `openPercent`, null);
  }

  /**
   * @returns {Entity | null} For Frost slots, the slot's frost intensity. Null if this slot has no frost intensity.
   */
  get frostIntensity() {
    if (`frostIntensity` in this._jsonObject) {
      return cacheResult(this, `frostIntensity`, Entity.createFromEntityString(this._jsonObject.frostIntensity));
    }

    return cacheResult(this, `frostIntensity`, null);
  }

  /**
   * @returns {WheelSlot | null} For split slots, the floor (start) slot. Null for non-split slots.
   */
  get floorSlot() {
    return this._floorSlot || null;
  }

  /**
   * @returns {WheelSlot | null} For split slots, the ceil (end) slot. Null for non-split slots.
   */
  get ceilSlot() {
    return this._ceilSlot || null;
  }
}

export default WheelSlot;
