import cacheResult from '../cache-result.js';
import Entity from './Entity.js';
import Resource from './Resource.js';
/** @import Wheel from './Wheel.js' */

/** @ignore */
const namePerType = {
  Color: (slot, name) => {
    if (name !== null && slot.colorTemperature !== null) {
      return `${name} (${slot.colorTemperature.toString()})`;
    }

    return slot.colorTemperature === null ? name : slot.colorTemperature.toString();
  },
  Gobo: (slot, name) => {
    if (name === null) {
      return slot.resource === null ? null : `Gobo ${slot.resource.name}`;
    }

    return name.startsWith('Gobo') ? name : `Gobo ${name}`;
  },
  Prism: (slot, name) => {
    if (name !== null && slot.facets !== null) {
      return `${slot.facets}-facet ${name}`;
    }

    return slot.facets === null ? name : `${slot.facets}-facet prism`;
  },
  Iris: (slot, name) => {
    return slot.openPercent === null ? null : `Iris ${slot.openPercent.toString()}`;
  },
  Frost: (slot, name) => {
    return slot.frostIntensity === null ? null : `Frost ${slot.frostIntensity.toString()}`;
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
    return slot.floorSlot.name.replace(' Start', '');
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
   * @param {Readonly<object> | null} jsonObject - A wheel slot object from the fixture's JSON data. If null, this WheelSlot is a split slot.
   * @param {Readonly<Wheel>} wheel - The wheel that this slot belongs to.
   * @param {Readonly<WheelSlot> | null} floorSlot - For split slots, the WheelSlot instance at the start.
   * @param {Readonly<WheelSlot> | null} ceilSlot - For split slots, the WheelSlot instance at the end.
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
    let type = this._jsonObject.type;

    if (this.isSplitSlot) {
      type = this._floorSlot.type === 'AnimationGoboStart' ? 'AnimationGobo' : 'Split';
    }

    return cacheResult(this, 'type', type);
  }

  /**
   * @returns {number} The zero-based index of this slot amongst all slots with the same type in this wheel.
   */
  get nthOfType() {
    return cacheResult(this, 'nthOfType', this._wheel.getSlotsOfType(this.type).indexOf(this));
  }

  /**
   * @returns {Resource | string | null} The gobo resource object if it was previously embedded, or the gobo resource reference string, or null if no resource is specified for the slot.
   */
  get resource() {
    if (this.isSplitSlot || !('resource' in this._jsonObject)) {
      return cacheResult(this, 'resource', null);
    }

    const resource = typeof this._jsonObject.resource === 'string'
      ? this._jsonObject.resource
      : new Resource(this._jsonObject.resource);

    return cacheResult(this, 'resource', resource);
  }

  /**
   * @returns {string} The wheel slot's name.
   */
  get name() {
    const nameFunction = this.type in namePerType ? namePerType[this.type] : namePerType.Default;
    let name = nameFunction(this, this.isSplitSlot ? null : (this._jsonObject.name || null));

    if (name === null) {
      const typeName = this.type.replaceAll(/([a-z])([A-Z])/g, '$1 $2'); // 'CamelCase' -> 'Camel Case'
      name = this._wheel.getSlotsOfType(this.type).length === 1 ? typeName : `${typeName} ${this.nthOfType + 1}`;
    }

    return cacheResult(this, 'name', name);
  }

  /**
   * @returns {string[] | null} The colors of this wheel slot, or null if this slot has no colors.
   */
  get colors() {
    const fixedColors = {
      Open: ['#ffffff'],
      Closed: ['#000000'],
    };

    if (this.type in fixedColors) {
      return cacheResult(this, 'colors', fixedColors[this.type]);
    }

    if (this.isSplitSlot) {
      if (this._floorSlot.colors && this._ceilSlot.colors) {
        return cacheResult(this, 'colors', [...this._floorSlot.colors, ...this._ceilSlot.colors]);
      }
    }
    else if ('colors' in this._jsonObject) {
      return cacheResult(this, 'colors', this._jsonObject.colors);
    }

    return cacheResult(this, 'colors', null);
  }

  /**
   * @returns {Entity | null} For Color slots, the slot's color temperature. Null if this slot has no color temperature.
   */
  get colorTemperature() {
    const colorTemperature = 'colorTemperature' in this._jsonObject ? Entity.createFromEntityString(this._jsonObject.colorTemperature) : null;

    return cacheResult(this, 'colorTemperature', colorTemperature);
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
    const openPercent = 'openPercent' in this._jsonObject ? Entity.createFromEntityString(this._jsonObject.openPercent) : null;

    return cacheResult(this, 'openPercent', openPercent);
  }

  /**
   * @returns {Entity | null} For Frost slots, the slot's frost intensity. Null if this slot has no frost intensity.
   */
  get frostIntensity() {
    const frostIntensity = 'frostIntensity' in this._jsonObject ? Entity.createFromEntityString(this._jsonObject.frostIntensity) : null;

    return cacheResult(this, 'frostIntensity', frostIntensity);
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
