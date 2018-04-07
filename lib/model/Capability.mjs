import Entity from './Entity.mjs';
import Range from './Range.mjs';

const START_END_PROPERTIES = [`speed`, `duration`, `brightness`, `index`, `angle`, `colorTemperature`, `effectIntensity`, `sensitivity`, `distance`, `openPercent`, `frostIntensity`, `insertion`, `fogOutput`, `parameter`];

/** A capability represents a range of a channel */
export default class Capability {
  /**
   * @returns {!Array.<string>} Type-specific properties that may have a start and an end value.
   */
  static get START_END_PROPERTIES() {
    return START_END_PROPERTIES;
  }

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
    this._cache.dmxRangePerFineness = [];
  }

  /**
   * @returns {!object} The capability data from the channel's json.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {!Range} The capability's DMX bounds in the channel's highest fineness.
   */
  get dmxRange() {
    return this.getDmxRangeWithFineness(this._channel.maxFineness);
  }

  /**
   * @returns {!Range} The capability's DMX bounds in the channel's highest fineness.
   */
  get rawDmxRange() {
    return this.getDmxRangeWithFineness(this._fineness);
  }

  /**
   * @param {!number} fineness The grade of fineness the dmxRange should be scaled to.
   * @returns {!Range} The capability's DMX bounds scaled (down) to the given fineness.
   */
  getDmxRangeWithFineness(fineness) {
    const max = this._channel.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a positive integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    if (!this._cache.dmxRangePerFineness[fineness]) {
      this._cache.dmxRangePerFineness[fineness] = new Range([
        this._jsonObject.dmxRange[0] * Math.pow(256, fineness - this._fineness),
        ((this._jsonObject.dmxRange[1] + 1) * Math.pow(256, fineness - this._fineness)) - 1
      ]);
    }

    return this._cache.dmxRangePerFineness[fineness];
  }

  /**
   * @returns {!string} Describes which feature is controlled by this capability.
   */
  get type() {
    return this._jsonObject.type;
  }

  /**
   * @returns {!string} Short one-line description of the capability
   */
  get name() {
    // TODO: auto-generate a meaningful description!
    return `${this.type}: ${this.comment}`;
  }

  /**
   * @returns {!boolean} Whether this capability has a comment set.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {!string} Short additional information on this capability
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {!boolean} Whether this capability has the same effect from the start to the end.
   */
  get isStep() {
    if (!(`isStep` in this._cache)) {
      this._cache.isStep = !Object.keys(this._jsonObject).some(prop => prop.includes(`Start`));
    }

    return this._cache.isStep;
  }

  /**
   * @returns {!boolean} Whether this capability
   */
  get isInverted() {
    if (!(`isInverted` in this._cache)) {
      if (this.isStep) {
        this._cache.isInverted = false;
      }
      else {
        this._cache.isInverted = false;

        for (const prop of Capability.START_END_PROPERTIES) {
          if (this[prop] !== null) {
            // increasing property
            if (this[prop][0] < this[prop][1]) {
              this._cache.isInverted = false;
              break; // one increasing property is enough to force isInverted being false
            }
            // decreasing property
            else if (this[prop][0] > this[prop][1]) {
              this._cache.isInverted = true;
            }
          }
        }
      }
    }

    return this._cache.isInverted;
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
        return this.dmxRange.start;

      case `center`:
        return this.dmxRange.center;

      case `end`:
        return this.dmxRange.end;

      case `hidden`:
      default: // default will never happen
        return -1;
    }
  }

  /**
   * @returns {!object.<string, string>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }


  /**
   * TYPE-SPECIFIC PROPERTIES
   */

  /**
   * @returns {'Open'|'Closed'|'Strobe'|'StrobeRandom'|'Pulse'|'PulseRandom'|'RampUp'|'RampUpRandom'|'RampDown'|'RampDownRandom'|null} Behavior for the shutter. Defaults to null.
   */
  get shutterEffect() {
    return this._jsonObject.shutterEffect || null;
  }

  /**
   * @returns {'Red'|'Green'|'Blue'|'Cyan'|'Magenta'|'Yellow'|'Amber'|'White'|'UV'|'Lime'|'Indigo'|null} The color of the lamp that is controlled by this capability. Defaults to null.
   */
  get color() {
    return this._jsonObject.color || null;
  }

  /**
   * @returns {?string} Describes the effect that this capability activates. May be an effect preset. Defaults to null.
   */
  get effectName() {
    return this._jsonObject.effectPreset || this._jsonObject.effectName || null;
  }

  /**
   * @returns {!boolean} Whether this capability uses an effectPreset instead of an effectName (both accessible via effectName).
   */
  get hasEffectPreset() {
    return `effectPreset` in this._jsonObject;
  }

  /**
   * @returns {'Top'|'Right'|'Bottom'|'Left'|number|null} At which position the blade is attached. Defaults to null.
   */
  get blade() {
    return this._jsonObject.blade || null;
  }

  /**
   * @returns {'Fog'|'Haze'|null} The kind of fog that should be emitted. Defaults to null.
   */
  get fogType() {
    return this._jsonObject.fogType || null;
  }

  /**
   * @returns {?Entity} How long this capability should be selected to take effect. Defaults to null.
   */
  get hold() {
    if (!(`hold` in this._cache)) {
      this._cache.hold = `hold` in this._jsonObject ? parseEntity(this._jsonObject.hold) : null;
    }

    return this._cache.hold;
  }


  /**
   * @returns {?Array.<Entity>} Start and end speed values. Defaults to null.
   */
  get speed() {
    if (!(`speed` in this._cache)) {
      this._cache.speed = this._getStartEndArray(`speed`, parseEntity);
    }

    return this._cache.speed;
  }

  /**
   * @returns {?Array.<Entity>} Start and end duration values. Defaults to null.
   */
  get duration() {
    if (!(`duration` in this._cache)) {
      this._cache.duration = this._getStartEndArray(`duration`, parseEntity);
    }

    return this._cache.duration;
  }

  /**
   * @returns {?Array.<Entity>} Start and end brightness values. Defaults to null.
   */
  get brightness() {
    if (!(`brightness` in this._cache)) {
      let brightness = this._getStartEndArray(`brightness`, parseEntity);

      // default to off->bright for (Color)Intensity capabilities
      if (brightness === null && [`Intensity`, `ColorIntensity`].includes(this.type)) {
        brightness = [parseEntity(`off`), parseEntity(`bright`)];
      }

      this._cache.brightness = brightness;
    }

    return this._cache.brightness;
  }

  /**
   * @returns {?Array.<number>} Start and end index values. Defaults to null.
   */
  get index() {
    if (!(`index` in this._cache)) {
      this._cache.index = this._getStartEndArray(`index`, parseFloat);
    }

    return this._cache.index;
  }

  /**
   * @returns {?Array.<Entity>} Start and end angle values. Defaults to null.
   */
  get angle() {
    if (!(`angle` in this._cache)) {
      this._cache.angle = this._getStartEndArray(`angle`, parseEntity);
    }

    return this._cache.angle;
  }

  /**
   * @returns {?Array.<Entity>} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    if (!(`colorTemperature` in this._cache)) {
      this._cache.colorTemperature = this._getStartEndArray(`colorTemperature`, parseEntity);
    }

    return this._cache.colorTemperature;
  }

  /**
   * @returns {?Array.<Entity>} Start and end effectIntensity values. Defaults to null.
   */
  get effectIntensity() {
    if (!(`effectIntensity` in this._cache)) {
      this._cache.effectIntensity = this._getStartEndArray(`effectIntensity`, parseEntity);
    }

    return this._cache.effectIntensity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end sensitivity values. Defaults to null.
   */
  get sensitivity() {
    if (!(`sensitivity` in this._cache)) {
      this._cache.sensitivity = this._getStartEndArray(`sensitivity`, parseEntity);
    }

    return this._cache.sensitivity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end distance values. Defaults to null.
   */
  get distance() {
    if (!(`distance` in this._cache)) {
      this._cache.distance = this._getStartEndArray(`distance`, parseEntity);
    }

    return this._cache.distance;
  }

  /**
   * @returns {?Array.<Entity>} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    if (!(`openPercent` in this._cache)) {
      this._cache.openPercent = this._getStartEndArray(`openPercent`, parseEntity);
    }

    return this._cache.openPercent;
  }

  /**
   * @returns {?Array.<Entity>} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    if (!(`frostIntensity` in this._cache)) {
      this._cache.frostIntensity = this._getStartEndArray(`frostIntensity`, parseEntity);
    }

    return this._cache.frostIntensity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    if (!(`insertion` in this._cache)) {
      this._cache.insertion = this._getStartEndArray(`insertion`, parseEntity);
    }

    return this._cache.insertion;
  }

  /**
   * @returns {?Array.<Entity>} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    if (!(`fogOutput` in this._cache)) {
      this._cache.fogOutput = this._getStartEndArray(`fogOutput`, parseEntity);
    }

    return this._cache.fogOutput;
  }

  /**
   * @returns {?Array.<Entity>} Start and end parameter values. Defaults to null.
   */
  get parameter() {
    if (!(`parameter` in this._cache)) {
      this._cache.parameter = this._getStartEndArray(`parameter`, parseEntity);
    }

    return this._cache.parameter;
  }

  /**
   * Parses a property that has start and end variants by generating an array with start and end value.
   * @param {!string} prop The base property name. 'Start' and 'End' can be appended to get the start/end variants.
   * @param {!function} callback Replace each value with callback(value).
   * @returns {?Array} Start and end value of the property (may be equal), mapped with the given callback. null if it isn't defined in JSON.
   */
  _getStartEndArray(prop, callback) {
    if (prop in this._jsonObject) {
      return [
        this._jsonObject[prop],
        this._jsonObject[prop]
      ].map(val => callback(val));
    }
    if (`${prop}Start` in this._jsonObject) {
      return [
        this._jsonObject[`${prop}Start`],
        this._jsonObject[`${prop}End`]
      ].map(val => callback(val));
    }
    return null;
  }
}


/**
 * @param {!string} entityString The raw entity string (with unit, if present) from the JSON.
 * @returns {!Entity} Machine-readable version of the entity.
 */
function parseEntity(entityString) {
  return new Entity(entityString);
}
