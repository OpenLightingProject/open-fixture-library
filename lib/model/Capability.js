import { scaleDmxRange } from '../scale-dmx-values.js';

/** @ignore @typedef {import('./CoarseChannel.js').default} CoarseChannel */
import Entity from './Entity.js';
import Range from './Range.js';
/** @ignore @typedef {import('./Wheel.js').default} Wheel */
/** @ignore @typedef {import('./WheelSlot.js').default} WheelSlot */

const START_END_ENTITIES = [`speed`, `duration`, `time`, `brightness`, `slotNumber`, `angle`, `horizontalAngle`, `verticalAngle`, `colorTemperature`, `soundSensitivity`, `shakeAngle`, `shakeSpeed`, `distance`, `openPercent`, `frostIntensity`, `insertion`, `fogOutput`, `parameter`];

const namePerType = {
  NoFunction: capability => capability.comment || `No function`,
  ShutterStrobe: capability => {
    let name = {
      Open: `Shutter open`,
      Closed: `Shutter closed`,
      Strobe: `Strobe`,
      Pulse: `Pulse strobe`,
      RampUp: `Ramp up strobe`,
      RampDown: `Ramp down strobe`,
      RampUpDown: `Ramp up and down strobe`,
      Lightning: `Lightning strobe effect`,
      Spikes: `Spikes strobe effect`,
    }[capability.shutterEffect];

    if (capability.randomTiming) {
      name = `Random ${name.toLowerCase()}`;
    }

    if (capability.isSoundControlled) {
      name += ` sound-controlled`;
    }

    if (capability.speed) {
      name += ` ${startEndToString(capability.speed, `speed`)}`;
    }

    if (capability.duration) {
      name += ` ${startEndToString(capability.duration, `duration`)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  StrobeSpeed: capability => appendInBrackets(`Strobe speed ${startEndToString(capability.speed)}`, capability.comment),
  StrobeDuration: capability => appendInBrackets(`Strobe duration ${startEndToString(capability.duration)}`, capability.comment),
  Intensity: capability => appendInBrackets(`Intensity ${startEndToString(capability.brightness)}`, capability.comment),
  ColorIntensity: capability => appendInBrackets(`${capability.color} ${startEndToString(capability.brightness)}`, capability.comment),
  ColorPreset: capability => {
    let name = capability.comment || `Color preset`;

    if (capability.colorTemperature) {
      name += ` (${colorTemperaturesToString(capability.colorTemperature)})`;
    }

    return name;
  },
  ColorTemperature: capability => appendInBrackets(`Color temperature ${colorTemperaturesToString(capability.colorTemperature)}`, capability.comment),
  Pan: capability => appendInBrackets(`Pan ${startEndToString(capability.angle, `angle`, true)}`, capability.comment),
  PanContinuous: capability => appendInBrackets(`Pan ${startEndToString(capability.speed, `speed`, true)}`, capability.comment),
  Tilt: capability => appendInBrackets(`Tilt ${startEndToString(capability.angle, `angle`, true)}`, capability.comment),
  TiltContinuous: capability => appendInBrackets(`Tilt ${startEndToString(capability.speed, `speed`, true)}`, capability.comment),
  PanTiltSpeed: capability => {
    const speedOrDuration = capability.speed !== null ? `speed` : `duration`;
    let name = `Pan/tilt movement `;

    if (capability[speedOrDuration][0].keyword === null && capability[speedOrDuration][0].unit === `%`) {
      name += `${speedOrDuration} `;
    }

    name += startEndToString(capability[speedOrDuration]);

    return appendInBrackets(name, capability.comment);
  },
  WheelSlot: capability => appendInBrackets(getSlotCapabilityName(capability), capability.comment),
  WheelShake: capability => {
    let name = capability.slotNumber ? getSlotCapabilityName(capability) : capability.wheels.map(wheel => wheel.name).join(`, `);

    if (capability.isShaking === `slot`) {
      name += ` slot`;
    }

    name += ` shake`;

    if (capability.shakeAngle) {
      name += ` ${startEndToString(capability.shakeAngle, `angle`, true)}`;
    }

    if (capability.shakeSpeed) {
      name += ` ${startEndToString(capability.shakeSpeed, `speed`, true)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  WheelSlotRotation: capability => {
    let wheelSlotName;
    if (capability.wheelSlot) {
      wheelSlotName = capability.wheelSlot[0].name;
    }
    else if (capability.wheels[0]) {
      wheelSlotName = capability.wheels[0].type.replace(/^Gobo$/, `Gobo stencil`);
    }
    else {
      wheelSlotName = `Wheel slot`;
    }

    const speedOrAngle = capability.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`${wheelSlotName} rotation ${startEndToString(capability[speedOrAngle], speedOrAngle, true)}`, capability.comment);
  },
  WheelRotation: capability => {
    const speedOrAngle = capability.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`${capability.wheels[0] ? capability.wheels[0].name : `Wheel`} rotation ${startEndToString(capability[speedOrAngle], speedOrAngle, true)}`, capability.comment);
  },
  Effect: capability => {
    let name = capability.effectName;

    if (capability.effectPreset !== null && capability.isSoundControlled) {
      name += ` sound-controlled`;
    }

    if (capability.parameter) {
      name += ` ${startEndToString(capability.parameter)}`;
    }

    if (capability.speed) {
      name += ` ${startEndToString(capability.speed, `speed`)}`;
    }

    if (capability.duration) {
      name += ` ${startEndToString(capability.duration, `duration`)}`;
    }

    let soundSensitivity = null;
    if (capability.soundSensitivity) {
      soundSensitivity = `sound sensitivity ${startEndToString(capability.soundSensitivity)}`;
    }

    return appendInBrackets(name, soundSensitivity, capability.comment);
  },
  EffectSpeed: capability => appendInBrackets(`Effect speed ${startEndToString(capability.speed)}`, capability.comment),
  EffectDuration: capability => appendInBrackets(`Effect duration ${startEndToString(capability.duration)}`, capability.comment),
  EffectParameter: capability => `${capability.comment || `Effect parameter`} ${startEndToString(capability.parameter)}`,
  SoundSensitivity: capability => appendInBrackets(`Sound sensitivity ${startEndToString(capability.soundSensitivity)}`, capability.comment),
  BeamAngle: capability => appendInBrackets(`Beam ${startEndToString(capability.angle, `angle`, true)}`, capability.comment),
  BeamPosition: capability => {
    if (capability.horizontalAngle && capability.verticalAngle) {
      return appendInBrackets(`Beam position (${startEndToString(capability.horizontalAngle)}, ${startEndToString(capability.verticalAngle)})`, capability.comment);
    }

    const orientation = capability.horizontalAngle ? `Horizontal` : `Vertical`;
    const angleStartEnd = capability[`${orientation.toLowerCase()}Angle`];

    const hasOrientationKeyword = angleStartEnd.some(
      entity => entity.keyword !== null && entity.keyword !== `center`,
    );
    const prefix = hasOrientationKeyword ? `Beam position` : `${orientation} beam position`;
    return appendInBrackets(`${prefix} ${startEndToString(angleStartEnd)}`, capability.comment);
  },
  Focus: capability => appendInBrackets(`Focus ${startEndToString(capability.distance, `distance`)}`, capability.comment),
  Zoom: capability => appendInBrackets(`Zoom ${startEndToString(capability.angle, `beam angle`)}`, capability.comment),
  Iris: capability => appendInBrackets(`Iris ${startEndToString(capability.openPercent, `open`)}`, capability.comment),
  IrisEffect: capability => {
    let name = `Iris ${capability.effectName}`;

    if (capability.speed) {
      name += ` ${startEndToString(capability.speed, `speed`)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  Frost: capability => appendInBrackets(`Frost ${startEndToString(capability.frostIntensity)}`, capability.comment),
  FrostEffect: capability => {
    let name = `Frost ${capability.effectName}`;

    if (capability.speed) {
      name += ` ${startEndToString(capability.speed, `speed`)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  Prism: capability => {
    let name = `Prism`;

    if (capability.speed) {
      name += ` ${startEndToString(capability.speed, `speed`)}`;
    }
    else if (capability.angle) {
      name += ` ${startEndToString(capability.angle, `angle`)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  PrismRotation: capability => {
    const speedOrAngle = capability.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`Prism rotation ${startEndToString(capability[speedOrAngle], speedOrAngle, true)}`, capability.comment);
  },
  BladeInsertion: capability => appendInBrackets(`Blade ${capability.blade} insertion ${startEndToString(capability.insertion)}`, capability.comment),
  BladeRotation: capability => appendInBrackets(`Blade ${capability.blade} rotation ${startEndToString(capability.angle, `angle`, true)}`, capability.comment),
  BladeSystemRotation: capability => appendInBrackets(`Blade system rotation ${startEndToString(capability.angle, `angle`, true)}`, capability.comment),
  Fog: capability => {
    let name = capability.fogType || `Fog`;

    if (capability.fogOutput) {
      name += ` ${startEndToString(capability.fogOutput)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  FogOutput: capability => appendInBrackets(`Fog output ${startEndToString(capability.fogOutput)}`, capability.comment),
  FogType: capability => appendInBrackets(`Fog type: ${capability.fogType}`, capability.comment),
  Rotation: capability => {
    const speedOrAngle = capability.speed !== null ? `speed` : `angle`;
    return appendInBrackets(`Rotation ${startEndToString(capability[speedOrAngle], speedOrAngle, true)}`, capability.comment);
  },
  Speed: capability => appendInBrackets(`Speed ${startEndToString(capability.speed)}`, capability.comment),
  Time: capability => appendInBrackets(`Time ${startEndToString(capability.time)}`, capability.comment),
  Maintenance: capability => {
    let name = capability.comment || `Maintenance`;

    if (capability.parameter) {
      name += ` ${startEndToString(capability.parameter)}`;
    }

    let holdString = null;
    if (capability.hold) {
      holdString = `hold ${startEndToString([capability.hold, capability.hold])}`;
    }

    return appendInBrackets(name, holdString);
  },
  Generic: capability => capability.comment || `Generic`,
};

/**
 * @ignore
 * @param {Capability} capability The capability (with a set slot property) to generate a name for.
 * @returns {String} The name for the capability, without the comment appended (if any).
 */
function getSlotCapabilityName(capability) {
  if (capability.wheelSlot === null) {
    // should only happen when fixture is invalid anyway
    return `Unknown wheel slot`;
  }

  return capability.slotNumber[0].number === capability.slotNumber[1].number
    ? capability.wheelSlot[0].name
    : capability.wheelSlot.map(slot => slot.name).join(` … `);
}

/**
 * A capability represents a range of a channel.
 */
class Capability {
  /**
   * @returns {Array.<String>} Type-specific properties that may have a start and an end value.
   */
  static get START_END_ENTITIES() {
    return START_END_ENTITIES;
  }

  /**
   * Create a new Capability instance.
   * @param {Object} jsonObject The capability data from the channel's JSON.
   * @param {Resolution} resolution How fine this capability is declared.
   * @param {CoarseChannel} channel The channel instance this channel is associated to.
   */
  constructor(jsonObject, resolution, channel) {
    this._jsonObject = jsonObject;
    this._resolution = resolution;
    this._channel = channel;
    this._cache = {
      dmxRangePerResolution: [],
    };
  }

  /**
   * @returns {Object} The capability data from the channel's JSON.
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
   * @param {Number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {Range} The capability's DMX bounds scaled (down) to the given resolution.
   */
  getDmxRangeWithResolution(desiredResolution) {
    this._channel.ensureProperResolution(desiredResolution);

    if (!this._cache.dmxRangePerResolution[desiredResolution]) {
      this._cache.dmxRangePerResolution[desiredResolution] = new Range(scaleDmxRange(
        this._jsonObject.dmxRange[0], this._jsonObject.dmxRange[1], this._resolution, desiredResolution,
      ));
    }

    return this._cache.dmxRangePerResolution[desiredResolution];
  }

  /**
   * @returns {String} Describes which feature is controlled by this capability.
   */
  get type() {
    return this._jsonObject.type;
  }

  /**
   * @returns {String} Short one-line description of the capability, generated from the capability's type and type-specific properties.
   */
  get name() {
    if (!(`name` in this._cache)) {
      this._cache.name = this.type in namePerType
        ? namePerType[this.type](this)
        : `${this.type}: ${this.comment}`;
    }

    return this._cache.name;
  }

  /**
   * @returns {Boolean} Whether this capability has a comment set.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {String} Short additional information on this capability
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {Boolean} Whether this capability has the same effect from the start to the end.
   */
  get isStep() {
    if (!(`isStep` in this._cache)) {
      const steppedStartEndProperties = this.usedStartEndEntities.every(
        property => this[property][0].number === this[property][1].number,
      );
      const steppedColors = !this.colors || this.colors.isStep;

      this._cache.isStep = steppedStartEndProperties && steppedColors;
    }

    return this._cache.isStep;
  }

  /**
   * @returns {Boolean} Whether this capability ranges from a high to a low value (e.g. speed fast…slow).
   */
  get isInverted() {
    if (!(`isInverted` in this._cache)) {
      if (this.isStep) {
        this._cache.isInverted = false;
      }
      else {
        const proportionalProperties = this.usedStartEndEntities.filter(
          property => this[property][0].number !== this[property][1].number,
        );

        this._cache.isInverted = proportionalProperties.length > 0 && proportionalProperties.every(
          property => Math.abs(this[property][0].number) > Math.abs(this[property][1].number),
        );
      }
    }

    return this._cache.isInverted;
  }

  /**
   * @returns {Array.<String>} Names of non-null properties with (maybe equal) start/end value.
   */
  get usedStartEndEntities() {
    if (!(`usedStartEndEntities` in this._cache)) {
      this._cache.usedStartEndEntities = Capability.START_END_ENTITIES.filter(
        property => this[property] !== null,
      );
    }

    return this._cache.usedStartEndEntities;
  }

  /**
   * @param {Capability} nextCapability The next capability after this one.
   * @returns {Boolean} Whether this capability's end value equals the given capability's start value, i. e. one can fade from this capability to the given one.
   */
  canCrossfadeTo(nextCapability) {
    if (this.type !== nextCapability.type) {
      return false;
    }

    if (this.usedStartEndEntities.length === 0 || this.usedStartEndEntities.length !== nextCapability.usedStartEndEntities.length) {
      return false;
    }

    const usesSameStartEndEntities = this.usedStartEndEntities.every(
      property => nextCapability.usedStartEndEntities.includes(property),
    );
    if (!usesSameStartEndEntities) {
      return false;
    }

    return this.usedStartEndEntities.every(property => {
      const tolerance = property === `slotNumber` ? 0 : 1;
      const delta = nextCapability[property][0].number - this[property][1].number;
      return Math.abs(delta) <= tolerance;
    });
  }

  /**
   * @returns {String|null} A string describing the help that is needed for this capability, or null if no help is needed.
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
   * @returns {Number} The DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClickDmxValue() {
    return this.getMenuClickDmxValueWithResolution(this._channel.maxResolution);
  }

  /**
   * @param {Number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {Range} The capability's DMX bounds scaled (down) to the given resolution.
   */
  getMenuClickDmxValueWithResolution(desiredResolution) {
    const dmxRange = this.getDmxRangeWithResolution(desiredResolution);

    switch (this.menuClick) {
      case `start`:
        return dmxRange.start;

      case `center`:
        return dmxRange.center;

      case `end`:
        return dmxRange.end;

      case `hidden`:
        return -1;

      default:
        throw new Error(`Unknown menuClick value '${this.menuClick}' in capability '${this.name}' (${this.rawDmxRange}).`);
    }
  }

  /**
   * @returns {Object.<String, String>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }


  /**
   * TYPE-SPECIFIC PROPERTIES (no start-end)
   */

  /**
   * @returns {String|null} Behavior for the shutter, for example 'Closed', 'Strobe' or 'Pulse'. Defaults to null.
   */
  get shutterEffect() {
    return this._jsonObject.shutterEffect || null;
  }

  /**
   * @returns {'Red'|'Green'|'Blue'|'Cyan'|'Magenta'|'Yellow'|'Amber'|'White'|'Warm White'|'Cold White'|'UV'|'Lime'|'Indigo'|null} The color of the lamp that is controlled by this ColorIntensity capability. Defaults to null.
   */
  get color() {
    return this._jsonObject.color || null;
  }

  /**
   * @returns {Object|null} The color hex codes for each visually distinguishable light beam. Defaults to null.
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
        isStep,
      } : null;
    }

    return this._cache.colors;
  }

  /**
   * @returns {Array.<Wheel>} The wheels this capability refers to. The array has one or more elements in wheel-related capabilities, zero otherwise.
   */
  get wheels() {
    if (!(`wheels` in this._cache)) {
      let wheelNames;

      if (`wheel` in this._jsonObject) {
        wheelNames = [this._jsonObject.wheel].flat();
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
   * @param {String|RegExp} slotType The type of the slot to check. Can be a regular expression to be checked against the type.
   * @returns {Boolean} True if the capability references a slot (or range of slots) of the given type, false otherwise.
   */
  isSlotType(slotType) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const slotTypeRegExp = slotType instanceof RegExp ? slotType : new RegExp(`^${slotType}$`);

    const isCorrectSlotType = slot => slotTypeRegExp.test(slot.type) || ([`Open`, `Closed`].includes(slot.type) && slotTypeRegExp.test(this.wheels[0].type));

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
   * @returns {String|null} Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.
   */
  get effectName() {
    if (!(`effectName` in this._cache)) {
      if (`effectName` in this._jsonObject) {
        this._cache.effectName = this._jsonObject.effectName;
      }
      else if (`effectPreset` in this._jsonObject) {
        this._cache.effectName = {
          ColorFade: `Color fade`,
          ColorJump: `Color jump`,
        }[this._jsonObject.effectPreset];
      }
      else {
        this._cache.effectName = null;
      }
    }

    return this._cache.effectName;
  }

  /**
   * @returns {String|null} Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.
   */
  get effectPreset() {
    return this._jsonObject.effectPreset || null;
  }

  /**
   * @returns {Boolean|null} Whether this effect is controlled by sound perceived by a microphone. Defaults to false.
   */
  get isSoundControlled() {
    return this._jsonObject.soundControlled === true;
  }

  /**
   * @returns {Boolean|null} Whether this capability's speed / duration varies by a random offset. Defaults to false.
   */
  get randomTiming() {
    return this._jsonObject.randomTiming === true;
  }

  /**
   * @returns {'Top'|'Right'|'Bottom'|'Left'|Number|null} At which position the blade is attached. Defaults to null.
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
   * @returns {Array.<Entity>|null} Start and end speed values. Defaults to null.
   */
  get speed() {
    if (!(`speed` in this._cache)) {
      this._cache.speed = this._getStartEndArray(`speed`);
    }

    return this._cache.speed;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end duration values. Defaults to null.
   */
  get duration() {
    if (!(`duration` in this._cache)) {
      this._cache.duration = this._getStartEndArray(`duration`);
    }

    return this._cache.duration;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end time values. Defaults to null.
   */
  get time() {
    if (!(`time` in this._cache)) {
      this._cache.time = this._getStartEndArray(`time`);
    }

    return this._cache.time;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end brightness values. Defaults to null.
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
   * @returns {Array.<Entity>|null} Start and end slot numbers. Defaults to null.
   */
  get slotNumber() {
    if (!(`slotNumber` in this._cache)) {
      this._cache.slotNumber = this._getStartEndArray(`slotNumber`);
    }

    return this._cache.slotNumber;
  }

  /**
   * @returns {Array.<WheelSlot>|null} Start and end wheel slot objects this capability is referencing. Defaults to null.
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
   * @returns {Array.<Entity>|null} Start and end angle values. Defaults to null.
   */
  get angle() {
    if (!(`angle` in this._cache)) {
      this._cache.angle = this._getStartEndArray(`angle`);
    }

    return this._cache.angle;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end horizontal angle values. Defaults to null.
   */
  get horizontalAngle() {
    if (!(`horizontalAngle` in this._cache)) {
      this._cache.horizontalAngle = this._getStartEndArray(`horizontalAngle`);
    }

    return this._cache.horizontalAngle;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end vertical angle values. Defaults to null.
   */
  get verticalAngle() {
    if (!(`verticalAngle` in this._cache)) {
      this._cache.verticalAngle = this._getStartEndArray(`verticalAngle`);
    }

    return this._cache.verticalAngle;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    if (!(`colorTemperature` in this._cache)) {
      this._cache.colorTemperature = this._getStartEndArray(`colorTemperature`);
    }

    return this._cache.colorTemperature;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end sound sensitivity values. Defaults to null.
   */
  get soundSensitivity() {
    if (!(`soundSensitivity` in this._cache)) {
      this._cache.soundSensitivity = this._getStartEndArray(`soundSensitivity`);
    }

    return this._cache.soundSensitivity;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end shake angle values. Defaults to null.
   */
  get shakeAngle() {
    if (!(`shakeAngle` in this._cache)) {
      this._cache.shakeAngle = this._getStartEndArray(`shakeAngle`);
    }

    return this._cache.shakeAngle;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end shake speed values. Defaults to null.
   */
  get shakeSpeed() {
    if (!(`shakeSpeed` in this._cache)) {
      this._cache.shakeSpeed = this._getStartEndArray(`shakeSpeed`);
    }

    return this._cache.shakeSpeed;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end distance values. Defaults to null.
   */
  get distance() {
    if (!(`distance` in this._cache)) {
      this._cache.distance = this._getStartEndArray(`distance`);
    }

    return this._cache.distance;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    if (!(`openPercent` in this._cache)) {
      this._cache.openPercent = this._getStartEndArray(`openPercent`);
    }

    return this._cache.openPercent;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    if (!(`frostIntensity` in this._cache)) {
      this._cache.frostIntensity = this._getStartEndArray(`frostIntensity`);
    }

    return this._cache.frostIntensity;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    if (!(`insertion` in this._cache)) {
      this._cache.insertion = this._getStartEndArray(`insertion`);
    }

    return this._cache.insertion;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    if (!(`fogOutput` in this._cache)) {
      this._cache.fogOutput = this._getStartEndArray(`fogOutput`);
    }

    return this._cache.fogOutput;
  }

  /**
   * @returns {Array.<Entity>|null} Start and end parameter values. Defaults to null.
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
   * @param {String} property The base property name. 'Start' and 'End' will be appended to get the start/end variants.
   * @returns {Array|null} Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.
   */
  _getStartEndArray(property) {
    if (property in this._jsonObject) {
      return [
        this._jsonObject[property],
        this._jsonObject[property],
      ].map(value => Entity.createFromEntityString(value));
    }
    if (`${property}Start` in this._jsonObject) {
      return [
        this._jsonObject[`${property}Start`],
        this._jsonObject[`${property}End`],
      ].map(value => Entity.createFromEntityString(value));
    }
    return null;
  }
}

export default Capability;

/**
 * @ignore
 * @param {String} string The original string without appending or brackets.
 * @param {...*} inBrackets Strings that should be added in brackets to the given original string. Invalid strings are ignored.
 * @returns {String} The given string, appended with a space and brackets containing all valid inBracket strings.
 */
function appendInBrackets(string, ...inBrackets) {
  inBrackets = inBrackets.filter(
    inBracket => inBracket !== undefined && inBracket !== null && inBracket !== ``,
  );

  if (inBrackets.length === 0) {
    return string;
  }

  return `${string} (${inBrackets.join(`, `)})`;
}


/**
 * @ignore
 * @param {Array.<String>} colorTemperature Start and end entities of color temperature.
 * @returns {String} A self-explaining string describing the color temperature (and its progress, if given) by using the keywords "warm" and "cold" for percentaged values.
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
   * @param {Number} temperature A numerical value of a percentaged color temperature.
   * @returns {String} Either "XY% warm", "XY% cold" or "default".
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
 * @param {Array.<Entity>} startEndEntities Array of start and end entities of a property.
 * @param {String} [propertyName=null] An optional name describing the property to be added if a percentaged value is used. Doesn't need to be the model's property name.
 * @param {Boolean} [propertyNameBeforeValue=false] Whether to put the property name before the percentaged value or after.
 * @returns {String} A self-explaining string describing the property value (including start-end information, if given).
 */
function startEndToString([start, end], propertyName = null, propertyNameBeforeValue = false) {
  if (start.keyword) {
    return handleKeywords();
  }

  const unitAliases = {
    'deg': `°`,
    'm^3/min': `m³/min`,
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
   * @returns {String} The startToEndString, if only the entities' keywords are considered.
   */
  function handleKeywords() {
    if (start.equals(end)) {
      return start.keyword;
    }

    // if both entities' keywords contain a direction specifier
    const hasSpecifier = / (?:CW|CCW|reverse)$/;
    if (hasSpecifier.test(start.keyword) && hasSpecifier.test(end.keyword)) {
      const [speedStart, specifierStart] = start.keyword.split(` `);
      const [speedEnd, specifierEnd] = end.keyword.split(` `);

      if (specifierStart === specifierEnd) {
        return `${specifierStart} ${speedStart}…${speedEnd}`;
      }
    }

    return `${start.keyword}…${end.keyword}`;
  }
}
