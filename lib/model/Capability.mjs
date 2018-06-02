import Color from 'color';

import Range from './Range.mjs';

/** A capability represents a range of a channel */
export default class Capability {
  /**
   * Create a new Capability instance.
   * @param {!object} jsonObject The capability data from the channel's json
   * @param {!Fineness} fineness How fine this capability is declared.
   * @param {!Channel} channel The channel instance this channel is associated to.
   */
  constructor(jsonObject, fineness, channel) {
    this.jsonObject = jsonObject; // calls the setter
    this._fineness = fineness;
    this._channel = channel;
  }

  /**
   * @param {!object} jsonObject The capability data from the channel's json.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
    this._cache.rangePerFineness = [];
  }

  /**
   * @returns {!Range} The capability's bounds in the channel's highest fineness.
   */
  get range() {
    return this.getRangeWithFineness(this._channel.maxFineness);
  }

  /**
   * @returns {!Range} The capability's DMX bounds from the JSON data.
   */
  get rawRange() {
    return this.getRangeWithFineness(this._fineness);
  }

  /**
   * @param {!number} fineness The grade of fineness the DMX range should be scaled to.
   * @returns {!Range} The capability's DMX bounds scaled (down) to the given fineness.
   */
  getRangeWithFineness(fineness) {
    const max = this._channel.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a positive integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    if (!this._cache.rangePerFineness[fineness]) {
      this._cache.rangePerFineness[fineness] = new Range([
        this._jsonObject.range[0] * Math.pow(256, fineness - this._fineness),
        ((this._jsonObject.range[1] + 1) * Math.pow(256, fineness - this._fineness)) - 1
      ]);
    }

    return this._cache.rangePerFineness[fineness];
  }

  /**
   * @returns {!string} Short one-line description of the capability.
   */
  get name() {
    return this._jsonObject.name; // required
  }

  /**
   * @returns {'start'|'center'|'end'|'hidden'} The method which DMX value to set when this capability is chosen in a menu.
   */
  get menuClick() {
    return this._jsonObject.menuClick || `start`;
  }

  /**
   * @returns {!number} The DMX value to set when this capability is chosen in a menu.
   */
  get menuClickDmxValue() {
    switch (this.menuClick) {
      case `start`:
        return this.range.start;

      case `center`:
        return this.range.center;

      case `end`:
        return this.range.end;

      case `hidden`:
      default: // default will never happen
        return -1;
    }
  }

  /**
   * @returns {?Color} The capability's primary color or null if it is not set.
   */
  get color() {
    if (`color` in this._jsonObject) {
      return new Color(this._jsonObject.color);
    }
    return null;
  }

  /**
   * @returns {?Color} The capability's secondary color or null if it is not set.
   */
  get color2() {
    if (`color2` in this._jsonObject) {
      return new Color(this._jsonObject.color2);
    }
    return null;
  }

  /**
   * @returns {?string} The capability's image or null if it is not set.
   */
  get image() {
    return this._jsonObject.image || null;
  }

  /**
   * @returns {!object.<string, string>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }
}
