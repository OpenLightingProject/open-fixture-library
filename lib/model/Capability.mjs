import Entity from './Entity.mjs';
import Range from './Range.mjs';

import scaleDmxValuesJs from '../scale-dmx-values.js';
const { scaleDmxRange } = scaleDmxValuesJs;

const START_END_ENTITIES = [`speed`, `duration`, `time`, `brightness`, `slotNumber`, `angle`, `colorTemperature`, `soundSensitivity`, `shakeAngle`, `shakeSpeed`, `distance`, `openPercent`, `frostIntensity`, `insertion`, `fogOutput`, `parameter`];

const namePerType = {
  NoFunction: cap => cap.comment || `No function`,
  ShutterStrobe: cap => {
    let name = {
      Open: `Shutter open`,
      Closed: `Shutter closed`,
      Strobe: `Strobe`,
      Pulse: `Pulse strobe`,
      RampUp: `Ramp up strobe`,
      RampDown: `Ramp down strobe`,
      RampUpDown: `Ramp up and down strobe`,
      Lightning: `Lightning strobe effect`,
      Spikes: `Spikes strobe effect`
    }[cap.shutterEffect];

    if (cap.randomTiming) {
      name = `Random ${name.toLowerCase()}`;
    }

    if (cap.isSoundControlled) {
      name += ` sound-controlled`;
    }

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    if (cap.duration) {
      name += ` ${startEndToString(cap.duration, `duration`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  StrobeSpeed: cap => appendInBrackets(`Strobe speed ${startEndToString(cap.speed)}`, cap.comment),
  StrobeDuration: cap => appendInBrackets(`Strobe duration ${startEndToString(cap.duration)}`, cap.comment),
  Intensity: cap => appendInBrackets(`Intensity ${startEndToString(cap.brightness)}`, cap.comment),
  ColorIntensity: cap => appendInBrackets(`${cap.color} ${startEndToString(cap.brightness)}`, cap.comment),
  ColorPreset: cap => {
    let name = cap.comment || `Color preset`;

    if (cap.colorTemperature) {
      name += ` (${colorTemperaturesToString(cap.colorTemperature)})`;
    }

    return name;
  },
  ColorTemperature: cap => appendInBrackets(`Color temperature ${colorTemperaturesToString(cap.colorTemperature)}`, cap.comment),
  Pan: cap => appendInBrackets(`Pan ${startEndToString(cap.angle, `angle`, true)}`, cap.comment),
  PanContinuous: cap => appendInBrackets(`Pan ${startEndToString(cap.speed, `speed`, true)}`, cap.comment),
  Tilt: cap => appendInBrackets(`Tilt ${startEndToString(cap.angle, `angle`, true)}`, cap.comment),
  TiltContinuous: cap => appendInBrackets(`Tilt ${startEndToString(cap.speed, `speed`, true)}`, cap.comment),
  PanTiltSpeed: cap => {
    const speedOrDuration = cap.speed !== null ? `speed` : `duration`;
    let name = `Pan/tilt movement `;

    if (cap[speedOrDuration][0].keyword === null && cap[speedOrDuration][0].unit === `%`) {
      name += `${speedOrDuration} `;
    }

    name += startEndToString(cap[speedOrDuration]);

    return appendInBrackets(name, cap.comment);
  },
  WheelSlot: cap => appendInBrackets(getSlotCapabilityName(cap), cap.comment),
  WheelShake: cap => {
    let name = cap.slotNumber ? getSlotCapabilityName(cap) : cap.wheels.map(wheel => wheel.name).join(`, `);

    if (cap.isShaking === `slot`) {
      name += ` slot`;
    }

    name += ` shake`;

    if (cap.shakeAngle) {
      name += ` ${startEndToString(cap.shakeAngle, `angle`, true)}`;
    }

    if (cap.shakeSpeed) {
      name += ` ${startEndToString(cap.shakeSpeed, `speed`, true)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  WheelSlotRotation: cap => {
    let wheelSlotName = cap.wheelSlot ? cap.wheelSlot[0].name : cap.wheels[0].type;
    if (wheelSlotName === `Gobo`) {
      wheelSlotName = `Gobo stencil`;
    }

    const speedOrAngle = cap.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`${wheelSlotName} rotation ${startEndToString(cap[speedOrAngle], speedOrAngle, true)}`, cap.comment);
  },
  WheelRotation: cap => {
    const speedOrAngle = cap.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`${cap.wheels[0] ? cap.wheels[0].name : `Wheel`} rotation ${startEndToString(cap[speedOrAngle], speedOrAngle, true)}`, cap.comment);
  },
  Effect: cap => {
    let name = cap.effectName;

    if (cap.effectPreset !== null && cap.isSoundControlled) {
      name += ` sound-controlled`;
    }

    if (cap.parameter) {
      name += ` ${startEndToString(cap.parameter)}`;
    }

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    if (cap.duration) {
      name += ` ${startEndToString(cap.duration, `duration`)}`;
    }

    let soundSensitivity = null;
    if (cap.soundSensitivity) {
      soundSensitivity = `sound sensitivity ${startEndToString(cap.soundSensitivity)}`;
    }

    return appendInBrackets(name, soundSensitivity, cap.comment);
  },
  EffectSpeed: cap => appendInBrackets(`Effect speed ${startEndToString(cap.speed)}`, cap.comment),
  EffectDuration: cap => appendInBrackets(`Effect duration ${startEndToString(cap.duration)}`, cap.comment),
  EffectParameter: cap => `${cap.comment || `Effect parameter`} ${startEndToString(cap.parameter)}`,
  SoundSensitivity: cap => appendInBrackets(`Sound sensitivity ${startEndToString(cap.soundSensitivity)}`, cap.comment),
  Focus: cap => appendInBrackets(`Focus ${startEndToString(cap.distance, `distance`)}`, cap.comment),
  Zoom: cap => appendInBrackets(`Zoom ${startEndToString(cap.angle, `beam angle`)}`, cap.comment),
  Iris: cap => appendInBrackets(`Iris ${startEndToString(cap.openPercent, `open`)}`, cap.comment),
  IrisEffect: cap => {
    let name = `Iris ${cap.effectName}`;

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  Frost: cap => appendInBrackets(`Frost ${startEndToString(cap.frostIntensity)}`, cap.comment),
  FrostEffect: cap => {
    let name = `Frost ${cap.effectName}`;

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  Prism: cap => {
    let name = `Prism`;

    if (cap.speed) {
      name += ` ${startEndToString(cap.speed, `speed`)}`;
    }
    else if (cap.angle) {
      name += ` ${startEndToString(cap.angle, `angle`)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  PrismRotation: cap => {
    const speedOrAngle = cap.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`Prism rotation ${startEndToString(cap[speedOrAngle], speedOrAngle, true)}`, cap.comment);
  },
  BladeInsertion: cap => appendInBrackets(`Blade ${cap.blade} insertion ${startEndToString(cap.insertion)}`, cap.comment),
  BladeRotation: cap => appendInBrackets(`Blade ${cap.blade} rotation ${startEndToString(cap.angle, `angle`, true)}`, cap.comment),
  BladeSystemRotation: cap => appendInBrackets(`Blade system rotation ${startEndToString(cap.angle, `angle`, true)}`, cap.comment),
  Fog: cap => {
    let name = cap.fogType || `Fog`;

    if (cap.fogOutput) {
      name += ` ${startEndToString(cap.fogOutput)}`;
    }

    return appendInBrackets(name, cap.comment);
  },
  FogOutput: cap => appendInBrackets(`Fog output ${startEndToString(cap.fogOutput)}`, cap.comment),
  FogType: cap => appendInBrackets(`Fog type: ${cap.fogType}`, cap.comment),
  BeamAngle: cap => appendInBrackets(`Beam ${startEndToString(cap.angle, `angle`, true)}`, cap.comment),
  Rotation: cap => {
    const speedOrAngle = cap.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`Rotation ${startEndToString(cap[speedOrAngle], speedOrAngle, true)}`, cap.comment);
  },
  Speed: cap => appendInBrackets(`Speed ${startEndToString(cap.speed)}`, cap.comment),
  Time: cap => appendInBrackets(`Time ${startEndToString(cap.time)}`, cap.comment),
  Maintenance: cap => {
    let name = cap.comment || `Maintenance`;

    if (cap.parameter) {
      name += ` ${startEndToString(cap.parameter)}`;
    }

    let holdStr = null;
    if (cap.hold) {
      holdStr = `hold ${startEndToString([cap.hold, cap.hold])}`;
    }

    return appendInBrackets(name, holdStr);
  },
  Generic: cap => cap.comment || `Generic`
};

/**
 * @param {object} cap The capability (with a set slot property) to generate a name for.
 * @returns {string} The name for the capability, without the comment appended (if any).
 */
function getSlotCapabilityName(cap) {
  if (cap.wheelSlot === null) {
    // should only happen when fixture is invalid anyway
    return `Unknown wheel slot`;
  }

  let name;

  if (cap.slotNumber[0].number === cap.slotNumber[1].number) {
    name = cap.wheelSlot[0].name;
  }
  else {
    name = cap.wheelSlot.map(slot => slot.name).join(` … `);
  }

  return name;
}

/**
 * A capability represents a range of a channel.
 */
class Capability {
  /**
   * @returns {array.<string>} Type-specific properties that may have a start and an end value.
   */
  static get START_END_ENTITIES() {
    return START_END_ENTITIES;
  }

  /**
   * Create a new Capability instance.
   * @param {object} jsonObject The capability data from the channel's JSON.
   * @param {Resolution} resolution How fine this capability is declared.
   * @param {CoarseChannel} channel The channel instance this channel is associated to.
   */
  constructor(jsonObject, resolution, channel) {
    this.jsonObject = jsonObject; // calls the setter
    this._resolution = resolution;
    this._channel = channel;
  }

  /**
   * @param {object} jsonObject The capability data from the channel's JSON.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
    this._cache.dmxRangePerResolution = [];
  }

  /**
   * @returns {object} The capability data from the channel's JSON.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {Range} The capability's DMX bounds in the channel's highest resolution.
   */
  get dmxRange() {
    return this.getDmxRangeWithResolution(this._channel.maxResolution);
  }

  /**
   * @returns {Range} The capability's DMX bounds from the JSON data.
   */
  get rawDmxRange() {
    return this.getDmxRangeWithResolution(this._resolution);
  }

  /**
   * @param {number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {Range} The capability's DMX bounds scaled (down) to the given resolution.
   */
  getDmxRangeWithResolution(desiredResolution) {
    this._channel.ensureProperResolution(desiredResolution);

    if (!this._cache.dmxRangePerResolution[desiredResolution]) {
      this._cache.dmxRangePerResolution[desiredResolution] = new Range(scaleDmxRange(
        this._jsonObject.dmxRange[0], this._jsonObject.dmxRange[1], this._resolution, desiredResolution
      ));
    }

    return this._cache.dmxRangePerResolution[desiredResolution];
  }

  /**
   * @returns {string} Describes which feature is controlled by this capability.
   */
  get type() {
    return this._jsonObject.type;
  }

  /**
   * @returns {string} Short one-line description of the capability, generated from the capability's type and type-specific properties.
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
   * @returns {boolean} Whether this capability has a comment set.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {string} Short additional information on this capability
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {boolean} Whether this capability has the same effect from the start to the end.
   */
  get isStep() {
    if (!(`isStep` in this._cache)) {
      const steppedStartEndProps = this.usedStartEndEntities.every(
        prop => this[prop][0].number === this[prop][1].number
      );
      const steppedColors = !this.colors || this.colors.isStep;

      this._cache.isStep = steppedStartEndProps && steppedColors;
    }

    return this._cache.isStep;
  }

  /**
   * @returns {boolean} Whether this capability ranges from a high to a low value (e.g. speed fast…slow).
   */
  get isInverted() {
    if (!(`isInverted` in this._cache)) {
      if (this.isStep) {
        this._cache.isInverted = false;
      }
      else {
        const proportionalProps = this.usedStartEndEntities.filter(
          prop => this[prop][0].number !== this[prop][1].number
        );

        this._cache.isInverted = proportionalProps.length > 0 && proportionalProps.every(
          prop => Math.abs(this[prop][0].number) > Math.abs(this[prop][1].number)
        );
      }
    }

    return this._cache.isInverted;
  }

  /**
   * @returns {array.<string>} Names of non-null properties with (maybe equal) start/end value.
   */
  get usedStartEndEntities() {
    if (!(`usedStartEndEntities` in this._cache)) {
      this._cache.usedStartEndEntities = Capability.START_END_ENTITIES.filter(
        prop => this[prop] !== null
      );
    }

    return this._cache.usedStartEndEntities;
  }

  /**
   * @param {Capability} nextCapability The next capability after this one.
   * @returns {boolean} Whether this capability's end value equals the given capability's start value, i. e. one can fade from this capability to the given one.
   */
  canCrossfadeTo(nextCapability) {
    if (this.type !== nextCapability.type) {
      return false;
    }

    if (this.usedStartEndEntities.length === 0 || this.usedStartEndEntities.length !== nextCapability.usedStartEndEntities.length) {
      return false;
    }

    const usesSameStartEndEntities = this.usedStartEndEntities.every(
      prop => nextCapability.usedStartEndEntities.includes(prop)
    );
    if (!usesSameStartEndEntities) {
      return false;
    }

    return this.usedStartEndEntities.every(prop => {
      const tolerance = prop === `slotNumber` ? 0 : 1;
      const delta = nextCapability[prop][0].number - this[prop][1].number;
      return Math.abs(delta) <= tolerance;
    });
  }

  /**
   * @returns {string|null} A string describing the help that is needed for this capability, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }

  /**
   * @returns {'start'|'center'|'end'|'hidden'} The method which DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClick() {
    return this._jsonObject.menuClick || `start`;
  }

  /**
   * @returns {number} The DMX value to set when this capability is chosen in a lighting software's auto menu.
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
   * @returns {object.<string, string>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }


  /**
   * TYPE-SPECIFIC PROPERTIES (no start-end)
   */

  /**
   * @returns {string|null} Behavior for the shutter, for example 'Closed', 'Strobe' or 'Pulse'. Defaults to null.
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
   * @returns {object|null} The color hex codes for each visually distinguishable light beam. Defaults to null.
   */
  get colors() {
    if (!(`colors` in this._cache)) {
      let startColors = this._jsonObject.colors;
      let endColors = this._jsonObject.colors;
      let isStep = true;

      const isColorWheelSlot = () => this.wheelSlot !== null && this.wheelSlot[0].colors !== null && this.wheelSlot[1].colors !== null;

      if (isColorWheelSlot()) {
        startColors = this.wheelSlot[0].colors;
        endColors = this.wheelSlot[1].colors;
        isStep = this.slotNumber[0].number === this.slotNumber[1].number;
      }
      else if (`colorsStart` in this._jsonObject) {
        startColors = this._jsonObject.colorsStart;
        endColors = this._jsonObject.colorsEnd;
        isStep = false;
      }

      this._cache.colors = startColors ? {
        startColors,
        endColors,
        allColors: startColors.concat(isStep ? [] : endColors),
        isStep
      } : null;
    }

    return this._cache.colors;
  }

  /**
   * @returns {array.<Wheel>} The wheels this capability refers to. The array has one or more elements in wheel-related capabilities, zero otherwise.
   */
  get wheels() {
    if (!(`wheels` in this._cache)) {
      let wheelNames;

      if (`wheel` in this._jsonObject) {
        wheelNames = [].concat(this._jsonObject.wheel);
      }
      else if (this.type.includes(`Wheel`)) {
        // default to channel name
        wheelNames = [this._channel.name];
      }
      else {
        wheelNames = [];
      }

      this._cache.wheels = wheelNames.map(wheelName => this._channel.fixture.getWheelByName(wheelName));
    }

    return this._cache.wheels;
  }

  /**
   * @param {string|RegExp} slotType The type of the slot to check. Can be a regular expression to be checked against the type.
   * @returns {boolean} True if the capability references a slot (or range of slots) of the given type, false otherwise.
   */
  isSlotType(slotType) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const slotTypeRegExp = slotType instanceof RegExp ? slotType : new RegExp(`^${slotType}$`);

    const isCorrectSlotType = slot => slotTypeRegExp.test(slot.type) || (slot.type === `Open` && slotTypeRegExp.test(this.wheels[0].type));

    return this.slotNumber !== null && this.wheelSlot.every(slot => {
      return isCorrectSlotType(slot)
        || (slot.type === `Split` && isCorrectSlotType(slot.floorSlot) && isCorrectSlotType(slot.ceilSlot));
    });
  }

  /**
   * Use only in `WheelShake` capabilities!
   * @returns {'slot'|'wheel'} The fixture component that is shaking.
   */
  get isShaking() {
    return this.jsonObject.isShaking || `wheel`;
  }

  /**
   * @returns {string|null} Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.
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
   * @returns {string|null} Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.
   */
  get effectPreset() {
    return this._jsonObject.effectPreset || null;
  }

  /**
   * @returns {boolean|null} Whether this effect is controlled by sound perceived by a microphone. Defaults to false.
   */
  get isSoundControlled() {
    return this._jsonObject.soundControlled === true;
  }

  /**
   * @returns {boolean|null} Whether this capability's speed / duration varies by a random offset. Defaults to false.
   */
  get randomTiming() {
    return this._jsonObject.randomTiming === true;
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
   * @returns {Entity|null} How long this capability should be selected to take effect. Defaults to null.
   */
  get hold() {
    if (!(`hold` in this._cache)) {
      this._cache.hold = `hold` in this._jsonObject ? Entity.createFromEntityString(this._jsonObject.hold) : null;
    }

    return this._cache.hold;
  }


  /**
   * TYPE-SPECIFIC PROPERTIES (only start-end)
   */

  /**
   * @returns {array.<Entity>|null} Start and end speed values. Defaults to null.
   */
  get speed() {
    if (!(`speed` in this._cache)) {
      this._cache.speed = this._getStartEndArray(`speed`);
    }

    return this._cache.speed;
  }

  /**
   * @returns {array.<Entity>|null} Start and end duration values. Defaults to null.
   */
  get duration() {
    if (!(`duration` in this._cache)) {
      this._cache.duration = this._getStartEndArray(`duration`);
    }

    return this._cache.duration;
  }

  /**
   * @returns {array.<Entity>|null} Start and end time values. Defaults to null.
   */
  get time() {
    if (!(`time` in this._cache)) {
      this._cache.time = this._getStartEndArray(`time`);
    }

    return this._cache.time;
  }

  /**
   * @returns {array.<Entity>|null} Start and end brightness values. Defaults to null.
   */
  get brightness() {
    if (!(`brightness` in this._cache)) {
      let brightness = this._getStartEndArray(`brightness`);

      // default to off->bright for (Color)Intensity capabilities
      if (brightness === null && [`Intensity`, `ColorIntensity`].includes(this.type)) {
        brightness = [Entity.createFromEntityString(`off`), Entity.createFromEntityString(`bright`)];
      }

      this._cache.brightness = brightness;
    }

    return this._cache.brightness;
  }

  /**
   * @returns {array.<Entity>|null} Start and end slot numbers. Defaults to null.
   */
  get slotNumber() {
    if (!(`slotNumber` in this._cache)) {
      this._cache.slotNumber = this._getStartEndArray(`slotNumber`);
    }

    return this._cache.slotNumber;
  }

  /**
   * @returns {array.<WheelSlot>|null} Start and end wheel slot objects this capability is referencing. Defaults to null.
   */
  get wheelSlot() {
    if (this.slotNumber === null) {
      return null;
    }

    if (this.wheels.length !== 1) {
      throw new RangeError(`When accessing the current wheel slot, the referenced wheel must be unambiguous.`);
    }

    if (!(`wheelSlot` in this._cache)) {
      this._cache.wheelSlot = this.wheels[0] ? this.slotNumber.map(slotNumber => this.wheels[0].getSlot(slotNumber.number)) : null;
    }

    return this._cache.wheelSlot;
  }

  /**
   * @returns {array.<Entity>|null} Start and end angle values. Defaults to null.
   */
  get angle() {
    if (!(`angle` in this._cache)) {
      this._cache.angle = this._getStartEndArray(`angle`);
    }

    return this._cache.angle;
  }

  /**
   * @returns {array.<Entity>|null} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    if (!(`colorTemperature` in this._cache)) {
      this._cache.colorTemperature = this._getStartEndArray(`colorTemperature`);
    }

    return this._cache.colorTemperature;
  }

  /**
   * @returns {array.<Entity>|null} Start and end sound sensitivity values. Defaults to null.
   */
  get soundSensitivity() {
    if (!(`soundSensitivity` in this._cache)) {
      this._cache.soundSensitivity = this._getStartEndArray(`soundSensitivity`);
    }

    return this._cache.soundSensitivity;
  }

  /**
   * @returns {array.<Entity>|null} Start and end shake angle values. Defaults to null.
   */
  get shakeAngle() {
    if (!(`shakeAngle` in this._cache)) {
      this._cache.shakeAngle = this._getStartEndArray(`shakeAngle`);
    }

    return this._cache.shakeAngle;
  }

  /**
   * @returns {array.<Entity>|null} Start and end shake speed values. Defaults to null.
   */
  get shakeSpeed() {
    if (!(`shakeSpeed` in this._cache)) {
      this._cache.shakeSpeed = this._getStartEndArray(`shakeSpeed`);
    }

    return this._cache.shakeSpeed;
  }

  /**
   * @returns {array.<Entity>|null} Start and end distance values. Defaults to null.
   */
  get distance() {
    if (!(`distance` in this._cache)) {
      this._cache.distance = this._getStartEndArray(`distance`);
    }

    return this._cache.distance;
  }

  /**
   * @returns {array.<Entity>|null} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    if (!(`openPercent` in this._cache)) {
      this._cache.openPercent = this._getStartEndArray(`openPercent`);
    }

    return this._cache.openPercent;
  }

  /**
   * @returns {array.<Entity>|null} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    if (!(`frostIntensity` in this._cache)) {
      this._cache.frostIntensity = this._getStartEndArray(`frostIntensity`);
    }

    return this._cache.frostIntensity;
  }

  /**
   * @returns {array.<Entity>|null} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    if (!(`insertion` in this._cache)) {
      this._cache.insertion = this._getStartEndArray(`insertion`);
    }

    return this._cache.insertion;
  }

  /**
   * @returns {array.<Entity>|null} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    if (!(`fogOutput` in this._cache)) {
      this._cache.fogOutput = this._getStartEndArray(`fogOutput`);
    }

    return this._cache.fogOutput;
  }

  /**
   * @returns {array.<Entity>|null} Start and end parameter values. Defaults to null.
   */
  get parameter() {
    if (!(`parameter` in this._cache)) {
      this._cache.parameter = this._getStartEndArray(`parameter`);
    }

    return this._cache.parameter;
  }

  /**
   * Parses a property that has start and end variants by generating an array with start and end value.
   * @private
   * @param {string} prop The base property name. 'Start' and 'End' will be appended to get the start/end variants.
   * @returns {array|null} Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.
   */
  _getStartEndArray(prop) {
    if (prop in this._jsonObject) {
      return [
        this._jsonObject[prop],
        this._jsonObject[prop]
      ].map(val => Entity.createFromEntityString(val));
    }
    if (`${prop}Start` in this._jsonObject) {
      return [
        this._jsonObject[`${prop}Start`],
        this._jsonObject[`${prop}End`]
      ].map(val => Entity.createFromEntityString(val));
    }
    return null;
  }
}

export default Capability;

/**
 * @ignore
 * @param {string} str The original string without appending or brackets.
 * @param {...*} inBrackets Strings that should be added in brackets to the given original string. Invalid strings are ignored.
 * @returns {string} The given string, appended with a space and brackets containing all valid inBracket strings.
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
 * @ignore
 * @param {array.<string>} colorTemperature Start and end entities of color temperature.
 * @returns {string} A self-explaining string describing the color temperature (and its progress, if given) by using the keywords "warm" and "cold" for percentaged values.
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
   * @param {number} temperature A numerical value of a percentaged color temperature.
   * @returns {string} Either "XY% warm", "XY% cold" or "default".
   */
  function colorTemperatureToString(temperature) {
    if (temperature < 0) {
      return `${-temperature}% warm`;
    }
    if (temperature > 0) {
      return `${temperature}% cold`;
    }
    return `default`;
  }
}

/**
 * @ignore
 * @param {array.<Entity>} startEndEntities Array of start and end entities of a property.
 * @param {string} [propertyName=null] An optional name describing the property to be added if a percentaged value is used. Doesn't need to be the model's property name.
 * @param {boolean} [propertyNameBeforeValue=false] Whether to put the property name before the percentaged value or after.
 * @returns {string} A self-explaining string describing the property value (including start-end information, if given).
 */
function startEndToString([start, end], propertyName = null, propertyNameBeforeValue = false) {
  if (start.keyword) {
    return handleKeywords();
  }

  const unitAliases = {
    'deg': `°`,
    'm^3/min': `m³/min`
  };

  const unit = unitAliases[start.unit] || start.unit;

  let words = [];

  if (!start.equals(end)) {
    words.push(`${start.number}…${end.number}${unit}`);
  }
  else {
    words.push(`${start.number}${unit}`);
  }

  if (propertyName && unit === `%`) {
    words.push(propertyName);
  }

  if (propertyNameBeforeValue) {
    words = words.reverse();
  }

  return words.join(` `);


  /**
   * @returns {string} The startToEndString, if only the entities' keywords are considered.
   */
  function handleKeywords() {
    if (start.equals(end)) {
      return start.keyword;
    }

    // if both entities' keywords contain a direction specifier
    const hasSpecifier = / (?:CW|CCW|reverse)$/;
    if (start.keyword.match(hasSpecifier) && end.keyword.match(hasSpecifier)) {
      const [speedStart, specifierStart] = start.keyword.split(` `);
      const [speedEnd, specifierEnd] = end.keyword.split(` `);

      if (specifierStart === specifierEnd) {
        return `${specifierStart} ${speedStart}…${speedEnd}`;
      }
    }

    return `${start.keyword}…${end.keyword}`;
  }
}
