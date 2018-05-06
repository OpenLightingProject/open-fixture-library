import Entity from './Entity.mjs';
import Range from './Range.mjs';

const START_END_PROPERTIES = [`speed`, `duration`, `brightness`, `index`, `angle`, `colorTemperature`, `effectIntensity`, `soundSensitivity`, `sensitivity`, `distance`, `openPercent`, `frostIntensity`, `insertion`, `fogOutput`, `parameter`];

const namePerType = {
  Nothing: cap => cap.comment || `Nothing`,
  ShutterStrobe: cap => {
    let name = {
      Open: `Shutter open`,
      Closed: `Shutter closed`,
      Strobe: `Strobe`,
      StrobeRandom: `Random strobe`,
      Pulse: `Pulse strobe`,
      PulseRandom: `Random pulse strobe`,
      RampUp: `Ramp up strobe`,
      RampUpRandom: `Random ramp up strobe`,
      RampDown: `Ramp down strobe`,
      RampDownRandom: `Random ramp down strobe`,
      RampUpDown: `Ramp up and down strobe`,
      Lightning: `Lightning strobe effect`
    }[cap.shutterEffect];

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    if (cap.duration) {
      name += ` ${startEndToString(cap.duration, `duration`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  StrobeSpeed: cap => {
    return appendInBrackets(`Strobe speed ${startEndToString(cap.speed)}`, cap.comment);
  },
  StrobeDuration: cap => {
    return appendInBrackets(`Strobe duration ${startEndToString(cap.duration)}`, cap.comment);
  },
  Intensity: cap => {
    return appendInBrackets(`Intensity ${startEndToString(cap.brightness)}`, cap.comment);
  },
  ColorIntensity: cap => {
    return appendInBrackets(`${cap.color} ${startEndToString(cap.brightness)}`, cap.comment);
  },
  ColorPreset: cap => {
    let name = cap.comment || `Color preset`;

    if (cap.colorTemperature) {
      name += ` (${colorTemperaturesToString(cap.colorTemperature)})`;
    }

    return name;
  },
  ColorWheelIndex: cap => {
    let name;

    const [indexStart, indexEnd] = cap.index;
    if (cap.hasComment) {
      name = `${cap.comment}`;
    }
    else if (indexStart.equals(indexEnd)) {
      name = `Wheel color #${indexStart.number}`;
    }
    else {
      name = `Wheel colors #${indexStart.number}…${indexEnd.number}`;
    }

    if (cap.colorTemperature) {
      name += ` (${colorTemperaturesToString(cap.colorTemperature)})`;
    }

    return name;
  },
  ColorWheelRotationAngle: cap => {
    return appendInBrackets(`Color wheel rotation ${startEndToString(cap.angle, `angle`)}`, cap.comment);
  },
  ColorWheelRotationSpeed: cap => {
    return appendInBrackets(`Color wheel rotation ${startEndToString(cap.speed, `speed`)}`, cap.comment);
  },
  Pan: cap => {
    return appendInBrackets(`Pan ${startEndToString(cap.angle, `angle`)}`, cap.comment);
  },
  PanContinuous: cap => {
    return appendInBrackets(`Continuous pan ${startEndToString(cap.speed, `speed`)}`, cap.comment);
  },
  Tilt: cap => {
    return appendInBrackets(`Tilt ${startEndToString(cap.angle, `angle`)}`, cap.comment);
  },
  TiltContinuous: cap => {
    return appendInBrackets(`Continuous tilt ${startEndToString(cap.speed, `speed`)}`, cap.comment);
  },
  PanTiltSpeed: cap => {
    let name = `Pan/tilt ${startEndToString(cap.speed)} movement`;

    if (cap.speed[0].keyword === null && cap.speed[0].unit === `%`) {
      name += ` speed`;
    }

    return appendInBrackets(name, cap.comment);
  },
  Effect: cap => {
    let name = cap.effectName;

    if (cap.effectIntensity) {
      name += ` ${startEndToString(cap.effectIntensity)}`;
    }

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    if (cap.duration) {
      name += ` ${startEndToString(cap.duration, `duration`)}`;
    }

    let soundSensitivity = null;
    if (cap.soundSensitivity) {
      soundSensitivity = `${startEndToString(cap.soundSensitivity)} sound sensitivity`;
    }

    return appendInBrackets(name, soundSensitivity, cap.comment);
  },
  EffectSpeed: cap => {
    return appendInBrackets(`Effect speed ${startEndToString(cap.speed)}`, cap.comment);
  },
  EffectDuration: cap => {
    return appendInBrackets(`Effect duration ${startEndToString(cap.duration)}`, cap.comment);
  },
  EffectIntensity: cap => {
    return appendInBrackets(`Effect intensity ${startEndToString(cap.effectIntensity)}`, cap.comment);
  },
  SoundSensitivity: cap => {
    return appendInBrackets(`Sound sensitivity ${startEndToString(cap.sensitivity)}`, cap.comment);
  },
  GoboIndex: cap => {
    let str = `Gobo `;

    if (cap.hasComment) {
      str += cap.comment.replace(/^gobo\s*/i, ``);
    }
    else {
      str += startEndToString(cap.index);
    }

    return str;
  },
  GoboShake: cap => {
    let str = `Gobo shake `;

    if (cap.hasComment) {
      str += cap.comment.replace(/^gobo shake\s*/i, ``);
    }
    else {
      str += startEndToString(cap.index);
    }

    return str;
  },
  GoboStencilRotationAngle: cap => {
    return appendInBrackets(`Gobo stencil rotation ${startEndToString(cap.angle, `angle`)}`, cap.comment);
  },
  GoboStencilRotationSpeed: cap => {
    return appendInBrackets(`Gobo stencil rotation ${startEndToString(cap.speed, `speed`)}`, cap.comment);
  },
  GoboWheelRotationAngle: cap => {
    return appendInBrackets(`Gobo wheel rotation ${startEndToString(cap.angle, `angle`)}`, cap.comment);
  },
  GoboWheelRotationSpeed: cap => {
    return appendInBrackets(`Gobo wheel rotation ${startEndToString(cap.speed, `speed`)}`, cap.comment);
  },
  Focus: cap => {
    return appendInBrackets(`Focus ${startEndToString(cap.distance, `distance`)}`, cap.comment);
  },
  Zoom: cap => {
    return appendInBrackets(`Zoom ${startEndToString(cap.angle, `beam angle`)}`, cap.comment);
  },
  Iris: cap => {
    return appendInBrackets(`Iris ${startEndToString(cap.openPercent, `open`)}`, cap.comment);
  },
  IrisEffect: cap => {
    let name = `Iris ${cap.effectName}`;

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  Frost: cap => {
    return appendInBrackets(`Frost ${startEndToString(cap.frostIntensity)}`, cap.comment);
  },
  FrostEffect: cap => {
    let name = `Frost ${cap.effectName}`;

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  PrismOff: cap => {
    return appendInBrackets(`Prism off`, cap.comment);
  },
  PrismOn: cap => {
    let name = `Prism`;

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `angle`)}`;
    }

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  PrismRotationAngle: cap => {
    return appendInBrackets(`Prism rotation ${startEndToString(cap.angle, `angle`)}`, cap.comment);
  },
  PrismRotationSpeed: cap => {
    return appendInBrackets(`Prism rotation ${startEndToString(cap.speed, `speed`)}`, cap.comment);
  }
};

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
    if (!(`name` in this._cache)) {
      if (this.type in namePerType) {
        this._cache.name = namePerType[this.type](this);
      }
      else {
        this._cache.name = `${this.type}: ${this.comment}`;
      }
    }

    return this._cache.name;
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
   * TYPE-SPECIFIC PROPERTIES (no start-end)
   */

  /**
   * @returns {'Open'|'Closed'|'Strobe'|'StrobeRandom'|'Pulse'|'PulseRandom'|'RampUp'|'RampUpRandom'|'RampDown'|'RampDownRandom'|'RampUpDown'|'Lightning'|null} Behavior for the shutter. Defaults to null.
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
   * @returns {?Array.<string>} The color hex codes for each visually distingishuable light beam. Defaults to null.
   */
  get colors() {
    return this._jsonObject.colors || null;
  }

  /**
   * @returns {?string} Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.
   */
  get effectName() {
    if (!(`effectName` in this._cache)) {
      if (`effectName` in this._jsonObject) {
        this._cache.effectName = this._jsonObject.effectName;
      }
      else if (`effectPreset` in this._jsonObject) {
        this._cache.effectName = {
          ColorFade: `Color fade`,
          ColorJump: `Color jump`
        }[this._jsonObject.effectPreset];
      }
      else {
        this._cache.effectName = null;
      }
    }

    return this._cache.effectName;
  }

  /**
   * @returns {?string} Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.
   */
  get effectPreset() {
    return this._jsonObject.effectPreset || null;
  }

  /**
   * @returns {?boolean} Whether this effect is controlled by sound perceived by a microphone. Defaults to false.
   */
  get isSoundControlled() {
    return this._jsonObject.soundControlled === true;
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
   * TYPE-SPECIFIC PROPERTIES (only start-end)
   */

  /**
   * @returns {?Array.<Entity>} Start and end speed values. Defaults to null.
   */
  get speed() {
    if (!(`speed` in this._cache)) {
      this._cache.speed = this._getStartEndArray(`speed`);
    }

    return this._cache.speed;
  }

  /**
   * @returns {?Array.<Entity>} Start and end duration values. Defaults to null.
   */
  get duration() {
    if (!(`duration` in this._cache)) {
      this._cache.duration = this._getStartEndArray(`duration`);
    }

    return this._cache.duration;
  }

  /**
   * @returns {?Array.<Entity>} Start and end brightness values. Defaults to null.
   */
  get brightness() {
    if (!(`brightness` in this._cache)) {
      let brightness = this._getStartEndArray(`brightness`);

      // default to off->bright for (Color)Intensity capabilities
      if (brightness === null && [`Intensity`, `ColorIntensity`].includes(this.type)) {
        brightness = [parseEntity(`off`), parseEntity(`bright`)];
      }

      this._cache.brightness = brightness;
    }

    return this._cache.brightness;
  }

  /**
   * @returns {?Array.<Entity>} Start and end index values. Defaults to null.
   */
  get index() {
    if (!(`index` in this._cache)) {
      this._cache.index = this._getStartEndArray(`index`);
    }

    return this._cache.index;
  }

  /**
   * @returns {?Array.<Entity>} Start and end angle values. Defaults to null.
   */
  get angle() {
    if (!(`angle` in this._cache)) {
      this._cache.angle = this._getStartEndArray(`angle`);
    }

    return this._cache.angle;
  }

  /**
   * @returns {?Array.<Entity>} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    if (!(`colorTemperature` in this._cache)) {
      this._cache.colorTemperature = this._getStartEndArray(`colorTemperature`);
    }

    return this._cache.colorTemperature;
  }

  /**
   * @returns {?Array.<Entity>} Start and end effectIntensity values. Defaults to null.
   */
  get effectIntensity() {
    if (!(`effectIntensity` in this._cache)) {
      this._cache.effectIntensity = this._getStartEndArray(`effectIntensity`);
    }

    return this._cache.effectIntensity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end sound sensitivity values. Defaults to null.
   */
  get soundSensitivity() {
    if (!(`soundSensitivity` in this._cache)) {
      this._cache.soundSensitivity = this._getStartEndArray(`soundSensitivity`);
    }

    return this._cache.soundSensitivity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end sensitivity values. Defaults to null.
   */
  get sensitivity() {
    if (!(`sensitivity` in this._cache)) {
      this._cache.sensitivity = this._getStartEndArray(`sensitivity`);
    }

    return this._cache.sensitivity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end distance values. Defaults to null.
   */
  get distance() {
    if (!(`distance` in this._cache)) {
      this._cache.distance = this._getStartEndArray(`distance`);
    }

    return this._cache.distance;
  }

  /**
   * @returns {?Array.<Entity>} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    if (!(`openPercent` in this._cache)) {
      this._cache.openPercent = this._getStartEndArray(`openPercent`);
    }

    return this._cache.openPercent;
  }

  /**
   * @returns {?Array.<Entity>} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    if (!(`frostIntensity` in this._cache)) {
      this._cache.frostIntensity = this._getStartEndArray(`frostIntensity`);
    }

    return this._cache.frostIntensity;
  }

  /**
   * @returns {?Array.<Entity>} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    if (!(`insertion` in this._cache)) {
      this._cache.insertion = this._getStartEndArray(`insertion`);
    }

    return this._cache.insertion;
  }

  /**
   * @returns {?Array.<Entity>} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    if (!(`fogOutput` in this._cache)) {
      this._cache.fogOutput = this._getStartEndArray(`fogOutput`);
    }

    return this._cache.fogOutput;
  }

  /**
   * @returns {?Array.<Entity>} Start and end parameter values. Defaults to null.
   */
  get parameter() {
    if (!(`parameter` in this._cache)) {
      this._cache.parameter = this._getStartEndArray(`parameter`);
    }

    return this._cache.parameter;
  }

  /**
   * Parses a property that has start and end variants by generating an array with start and end value.
   * @param {!string} prop The base property name. 'Start' and 'End' will be appended to get the start/end variants.
   * @returns {?Array} Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.
   */
  _getStartEndArray(prop) {
    if (prop in this._jsonObject) {
      return [
        this._jsonObject[prop],
        this._jsonObject[prop]
      ].map(val => parseEntity(val));
    }
    if (`${prop}Start` in this._jsonObject) {
      return [
        this._jsonObject[`${prop}Start`],
        this._jsonObject[`${prop}End`]
      ].map(val => parseEntity(val));
    }
    return null;
  }
}

/**
 * @param {!string} str The original string without appending or brackets.
 * @param {...?string} inBrackets Strings that should be added in brackets to the given original string. Invalid strings are ignored.
 * @returns {!string} The given string, appended with a space and brackets containing all valid inBracket strings.
 */
function appendInBrackets(str, ...inBrackets) {
  inBrackets = inBrackets.filter(
    inBracket => inBracket !== undefined && inBracket !== null && inBracket !== ``
  );

  if (inBrackets.length === 0) {
    return str;
  }

  return `${str} (${inBrackets.join(`, `)})`;
}


/**
 * @param {!Array.<string>} colorTemperature Start and end entities of color temperature.
 * @returns {!string} A self-explaining string describing the color temperature (and its progress, if given) by using the keywords "warm" and "cold" for percentaged values.
 */
function colorTemperaturesToString([start, end]) {
  if (start.keyword || start.unit !== `%`) {
    return startEndToString([start, end]);
  }

  if (start.equals(end)) {
    return colorTemperatureToString(start.number);
  }

  if (start <= 0) {
    if (end <= 0) {
      // both warm
      return `${-start}…${-end}% warm`;
    }

    // warm to cold
    return `${-start}% warm … ${end}% cold`;
  }

  if (end <= 0) {
    // cold to warm
    return `${start}% cold … ${-end}% warm`;
  }

  // both cold
  return `${start}…${end}% cold`;


  /**
   * @param {!number} temperature A numerical value of a percentaged color temperature.
   * @returns {!string} Either "XY% warm", "XY% cold" or "default".
   */
  function colorTemperatureToString(temperature) {
    if (temperature < 0) {
      return `${-temperature}% warm`;
    }
    if (temperature > 0) {
      return `${temperature}% color`;
    }
    return `default`;
  }
}

/**
 * @param {!Array.<Entity>} startEndEntities Array of start and end entities of a property.
 * @param {!string} [propertyName=null] An optional name describing the property to be added if a percentaged value is used. Doesn't need to be the model's property name.
 * @returns {!string} A self-explaining string describing the property value (including start-end information, if given).
 */
function startEndToString([start, end], propertyName = null) {
  if (start.keyword) {
    if (!start.equals(end)) {
      return `${start.keyword}…${end.keyword}`;
    }

    return start.keyword;
  }

  let str;

  const unitAliases = {
    'deg': `°`,
    'm^3/min': `m³/min`
  };

  const unit = unitAliases[start.unit] || start.unit;

  if (!start.equals(end)) {
    str = `${start.number}…${end.number}${unit}`;
  }
  else {
    str = `${start.number}${unit}`;
  }

  if (propertyName && unit === `%`) {
    str += ` ${propertyName}`;
  }

  return str;
}

/**
 * @param {!string} entityString The raw entity string (with unit, if present) from the JSON.
 * @returns {!Entity} Machine-readable version of the entity.
 */
function parseEntity(entityString) {
  return new Entity(entityString);
}
