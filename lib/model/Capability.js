import cacheResult from '../cache-result.js';
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
      Burst: `Burst strobe effect`,
    }[capability.shutterEffect];

    if (capability.randomTiming) {
      name = `Random ${name.toLowerCase()}`;
    }

    if (capability.isSoundControlled) {
      name += ` sound-controlled`;
    }

    if (capability.speed) {
      name += ` `;
      name += startEndToString(capability.speed, `speed`);
    }

    if (capability.duration) {
      name += ` `;
      name += startEndToString(capability.duration, `duration`);
    }

    return appendInBrackets(name, capability.comment);
  },
  StrobeSpeed: capability => getSimpleCapabilityName(capability, `Strobe speed`, `speed`),
  StrobeDuration: capability => getSimpleCapabilityName(capability, `Strobe duration`, `duration`),
  Intensity: capability => getSimpleCapabilityName(capability, `Intensity`, `brightness`),
  ColorIntensity: capability => getSimpleCapabilityName(capability, capability.color, `brightness`),
  ColorPreset: capability => {
    const name = capability.comment || `Color preset`;

    if (capability.colorTemperature) {
      return appendInBrackets(name, colorTemperaturesToString(capability.colorTemperature));
    }

    return name;
  },
  ColorTemperature: capability => getSimpleCapabilityName(capability, `Color temperature`, `colorTemperature`),
  Pan: capability => getSimpleCapabilityName(capability, `Pan`, `angle`, `angle`, true),
  PanContinuous: capability => getSimpleCapabilityName(capability, `Pan`, `speed`, `speed`, true),
  Tilt: capability => getSimpleCapabilityName(capability, `Tilt`, `angle`, `angle`, true),
  TiltContinuous: capability => getSimpleCapabilityName(capability, `Tilt`, `speed`, `speed`, true),
  PanTiltSpeed: capability => {
    const speedOrDuration = capability.speed === null ? `duration` : `speed`;
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
      name += ` `;
      name += startEndToString(capability.shakeAngle, `angle`, true);
    }

    if (capability.shakeSpeed) {
      name += ` `;
      name += startEndToString(capability.shakeSpeed, `speed`, true);
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

    const speedOrAngle = capability.speed === null ? `angle` : `speed`;
    return getSimpleCapabilityName(capability, `${wheelSlotName} rotation`, speedOrAngle, speedOrAngle, true);
  },
  WheelRotation: capability => {
    const wheelName = capability.wheels[0] ? capability.wheels[0].name : `Wheel`;
    const speedOrAngle = capability.speed === null ? `angle` : `speed`;
    return getSimpleCapabilityName(capability, `${wheelName} rotation`, speedOrAngle, speedOrAngle, true);
  },
  Effect: capability => {
    let name = capability.effectName;

    if (capability.effectPreset !== null && capability.isSoundControlled) {
      name += ` sound-controlled`;
    }

    if (capability.parameter) {
      name += ` `;
      name += startEndToString(capability.parameter);
    }

    if (capability.speed) {
      name += ` `;
      name += startEndToString(capability.speed, `speed`);
    }

    if (capability.duration) {
      name += ` `;
      name += startEndToString(capability.duration, `duration`);
    }

    let soundSensitivity = null;
    if (capability.soundSensitivity) {
      soundSensitivity = `sound sensitivity ${startEndToString(capability.soundSensitivity)}`;
    }

    return appendInBrackets(name, soundSensitivity, capability.comment);
  },
  EffectSpeed: capability => getSimpleCapabilityName(capability, `Effect speed`, `speed`),
  EffectDuration: capability => getSimpleCapabilityName(capability, `Effect duration`, `duration`),
  EffectParameter: capability => {
    const name = capability.comment || `Effect parameter`;
    return `${name} ${startEndToString(capability.parameter)}`;
  },
  SoundSensitivity: capability => getSimpleCapabilityName(capability, `Sound sensitivity`, `soundSensitivity`),
  BeamAngle: capability => getSimpleCapabilityName(capability, `Beam`, `angle`, `angle`, true),
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
  Focus: capability => getSimpleCapabilityName(capability, `Focus`, `distance`, `distance`),
  Zoom: capability => getSimpleCapabilityName(capability, `Zoom`, `angle`, `beam angle`),
  Iris: capability => getSimpleCapabilityName(capability, `Iris`, `openPercent`, `open`),
  IrisEffect: capability => {
    let name = `Iris ${capability.effectName}`;

    if (capability.speed) {
      name += ` `;
      name += startEndToString(capability.speed, `speed`);
    }

    return appendInBrackets(name, capability.comment);
  },
  Frost: capability => getSimpleCapabilityName(capability, `Frost`, `frostIntensity`),
  FrostEffect: capability => {
    let name = `Frost ${capability.effectName}`;

    if (capability.speed) {
      name += ` `;
      name += startEndToString(capability.speed, `speed`);
    }

    return appendInBrackets(name, capability.comment);
  },
  Prism: capability => {
    let name = `Prism`;

    if (capability.speed) {
      name += ` `;
      name += startEndToString(capability.speed, `speed`);
    }
    else if (capability.angle) {
      name += ` `;
      name += startEndToString(capability.angle, `angle`);
    }

    return appendInBrackets(name, capability.comment);
  },
  PrismRotation: capability => {
    const speedOrAngle = capability.speed === null ? `angle` : `speed`;
    return getSimpleCapabilityName(capability, `Prism rotation`, speedOrAngle, speedOrAngle, true);
  },
  BladeInsertion: capability => getSimpleCapabilityName(capability, `Blade ${capability.blade} insertion`, `insertion`),
  BladeRotation: capability => getSimpleCapabilityName(capability, `Blade ${capability.blade} rotation`, `angle`, `angle`, true),
  BladeSystemRotation: capability => getSimpleCapabilityName(capability, `Blade system rotation`, `angle`, `angle`, true),
  Fog: capability => {
    let name = capability.fogType || `Fog`;

    if (capability.fogOutput) {
      name += ` ${startEndToString(capability.fogOutput)}`;
    }

    return appendInBrackets(name, capability.comment);
  },
  FogOutput: capability => getSimpleCapabilityName(capability, `Fog output`, `fogOutput`),
  FogType: capability => appendInBrackets(`Fog type: ${capability.fogType}`, capability.comment),
  Rotation: capability => {
    const speedOrAngle = capability.speed === null ? `angle` : `speed`;
    return getSimpleCapabilityName(capability, `Rotation`, speedOrAngle, speedOrAngle, true);
  },
  Speed: capability => getSimpleCapabilityName(capability, `Speed`, `speed`),
  Time: capability => getSimpleCapabilityName(capability, `Time`, `time`),
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
 * @returns {string} The name for the capability, without the comment appended (if any).
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
   * @returns {string[]} Type-specific properties that may have a start and an end value.
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
    this._jsonObject = jsonObject;
    this._resolution = resolution;
    this._channel = channel;
    this._dmxRangePerResolution = [];
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

    if (!this._dmxRangePerResolution[desiredResolution]) {
      this._dmxRangePerResolution[desiredResolution] = new Range(scaleDmxRange(
        this._jsonObject.dmxRange[0], this._jsonObject.dmxRange[1], this._resolution, desiredResolution,
      ));
    }

    return this._dmxRangePerResolution[desiredResolution];
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
    if (this.type in namePerType) {
      return cacheResult(this, `name`, namePerType[this.type](this));
    }

    return cacheResult(this, `name`, `${this.type}: ${this.comment}`);
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
    const steppedStartEndProperties = this.usedStartEndEntities.every(
      property => this[property][0].number === this[property][1].number,
    );
    const steppedColors = !this.colors || this.colors.isStep;

    return cacheResult(this, `isStep`, steppedStartEndProperties && steppedColors);
  }

  /**
   * @returns {boolean} Whether this capability ranges from a high to a low value (e.g. speed fast…slow).
   */
  get isInverted() {
    if (this.isStep) {
      return cacheResult(this, `isInverted`, false);
    }

    const proportionalProperties = this.usedStartEndEntities.filter(
      property => this[property][0].number !== this[property][1].number,
    );

    const isInverted = proportionalProperties.length > 0 && proportionalProperties.every(
      property => Math.abs(this[property][0].number) > Math.abs(this[property][1].number),
    );
    return cacheResult(this, `isInverted`, isInverted);
  }

  /**
   * @returns {string[]} Names of non-null properties with (maybe equal) start/end value.
   */
  get usedStartEndEntities() {
    return cacheResult(this, `usedStartEndEntities`, Capability.START_END_ENTITIES.filter(
      property => this[property] !== null,
    ));
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
   * @returns {string | null} A string describing the help that is needed for this capability, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }

  /**
   * @returns {'start' | 'center' | 'end' | 'hidden'} The method which DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClick() {
    return this._jsonObject.menuClick || `start`;
  }

  /**
   * @returns {number} The DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClickDmxValue() {
    return this.getMenuClickDmxValueWithResolution(this._channel.maxResolution);
  }

  /**
   * @param {number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {Range} The capability's DMX bounds scaled (down) to the given resolution.
   */
  getMenuClickDmxValueWithResolution(desiredResolution) {
    const dmxRange = this.getDmxRangeWithResolution(desiredResolution);

    switch (this.menuClick) {
      case `start`: {
        return dmxRange.start;
      }
      case `center`: {
        return dmxRange.center;
      }
      case `end`: {
        return dmxRange.end;
      }
      case `hidden`: {
        return -1;
      }
      default: {
        throw new Error(`Unknown menuClick value '${this.menuClick}' in capability '${this.name}' (${this.rawDmxRange}).`);
      }
    }
  }

  /**
   * @returns {Record<string, string>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }


  /**
   * TYPE-SPECIFIC PROPERTIES (no start-end)
   */

  /**
   * @returns {string | null} Behavior for the shutter, for example 'Closed', 'Strobe' or 'Pulse'. Defaults to null.
   */
  get shutterEffect() {
    return this._jsonObject.shutterEffect || null;
  }

  /**
   * @returns {'Red' | 'Green' | 'Blue' | 'Cyan' | 'Magenta' | 'Yellow' | 'Amber' | 'White' | 'Warm White' | 'Cold White' | 'UV' | 'Lime' | 'Indigo' | null} The color of the lamp that is controlled by this ColorIntensity capability. Defaults to null.
   */
  get color() {
    return this._jsonObject.color || null;
  }

  /**
   * @returns {object | null} The color hex codes for each visually distinguishable light beam. Defaults to null.
   */
  get colors() {
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

    if (!startColors) {
      return cacheResult(this, `colors`, null);
    }

    return cacheResult(this, `colors`, {
      startColors,
      endColors,
      allColors: isStep ? [...startColors] : [...startColors, ...endColors],
      isStep,
    });
  }

  /**
   * @returns {Wheel[]} The wheels this capability refers to. The array has one or more elements in wheel-related capabilities, zero otherwise.
   */
  get wheels() {
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

    return cacheResult(this, `wheels`, wheelNames.map(
      wheelName => this._channel.fixture.getWheelByName(wheelName),
    ));
  }

  /**
   * @param {string | RegExp} slotType The type of the slot to check. Can be a regular expression to be checked against the type.
   * @returns {boolean} True if the capability references a slot (or range of slots) of the given type, false otherwise.
   */
  isSlotType(slotType) {
    const slotTypeRegExp = slotType instanceof RegExp ? slotType : new RegExp(`^${slotType}$`);

    const isCorrectSlotType = slot => slotTypeRegExp.test(slot.type) || ([`Open`, `Closed`].includes(slot.type) && slotTypeRegExp.test(this.wheels[0].type));

    return this.slotNumber !== null && this.wheelSlot.every(slot => {
      return isCorrectSlotType(slot)
        || (slot.type === `Split` && isCorrectSlotType(slot.floorSlot) && isCorrectSlotType(slot.ceilSlot));
    });
  }

  /**
   * Use only in `WheelShake` capabilities!
   * @returns {'slot' | 'wheel'} The fixture component that is shaking.
   */
  get isShaking() {
    return this.jsonObject.isShaking || `wheel`;
  }

  /**
   * @returns {string | null} Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.
   */
  get effectName() {
    if (`effectName` in this._jsonObject) {
      return cacheResult(this, `effectName`, this._jsonObject.effectName);
    }

    if (`effectPreset` in this._jsonObject) {
      const effectName = {
        ColorFade: `Color fade`,
        ColorJump: `Color jump`,
      }[this._jsonObject.effectPreset];

      return cacheResult(this, `effectName`, effectName);
    }

    return cacheResult(this, `effectName`, null);
  }

  /**
   * @returns {string | null} Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.
   */
  get effectPreset() {
    return this._jsonObject.effectPreset || null;
  }

  /**
   * @returns {boolean | null} Whether this effect is controlled by sound perceived by a microphone. Defaults to false.
   */
  get isSoundControlled() {
    return this._jsonObject.soundControlled === true;
  }

  /**
   * @returns {boolean | null} Whether this capability's speed / duration varies by a random offset. Defaults to false.
   */
  get randomTiming() {
    return this._jsonObject.randomTiming === true;
  }

  /**
   * @returns {'Top' | 'Right' | 'Bottom' | 'Left' | number | null} At which position the blade is attached. Defaults to null.
   */
  get blade() {
    return this._jsonObject.blade || null;
  }

  /**
   * @returns {'Fog' | 'Haze' | null} The kind of fog that should be emitted. Defaults to null.
   */
  get fogType() {
    return this._jsonObject.fogType || null;
  }

  /**
   * @returns {Entity | null} How long this capability should be selected to take effect. Defaults to null.
   */
  get hold() {
    if (`hold` in this._jsonObject) {
      return cacheResult(this, `hold`, Entity.createFromEntityString(this._jsonObject.hold));
    }

    return cacheResult(this, `hold`, null);
  }


  /**
   * TYPE-SPECIFIC PROPERTIES (only start-end)
   */

  /**
   * @returns {Entity[] | null} Start and end speed values. Defaults to null.
   */
  get speed() {
    return cacheResult(this, `speed`, this._getStartEndArray(`speed`));
  }

  /**
   * @returns {Entity[] | null} Start and end duration values. Defaults to null.
   */
  get duration() {
    return cacheResult(this, `duration`, this._getStartEndArray(`duration`));
  }

  /**
   * @returns {Entity[] | null} Start and end time values. Defaults to null.
   */
  get time() {
    return cacheResult(this, `time`, this._getStartEndArray(`time`));
  }

  /**
   * @returns {Entity[] | null} Start and end brightness values. Defaults to null.
   */
  get brightness() {
    let brightness = this._getStartEndArray(`brightness`);

    // default to off->bright for (Color)Intensity capabilities
    if (brightness === null && [`Intensity`, `ColorIntensity`].includes(this.type)) {
      brightness = [Entity.createFromEntityString(`off`), Entity.createFromEntityString(`bright`)];
    }

    return cacheResult(this, `brightness`, brightness);
  }

  /**
   * @returns {Entity[] | null} Start and end slot numbers. Defaults to null.
   */
  get slotNumber() {
    return cacheResult(this, `slotNumber`, this._getStartEndArray(`slotNumber`));
  }

  /**
   * @returns {WheelSlot[] | null} Start and end wheel slot objects this capability is referencing. Defaults to null.
   */
  get wheelSlot() {
    if (this.slotNumber === null) {
      return cacheResult(this, `wheelSlot`, null);
    }

    if (this.wheels.length !== 1) {
      throw new RangeError(`When accessing the current wheel slot, the referenced wheel must be unambiguous.`);
    }

    if (this.wheels[0]) {
      return cacheResult(this, `wheelSlot`, this.slotNumber.map(
        slotNumber => this.wheels[0].getSlot(slotNumber.number),
      ));
    }

    return cacheResult(this, `wheelSlot`, null);
  }

  /**
   * @returns {Entity[] | null} Start and end angle values. Defaults to null.
   */
  get angle() {
    return cacheResult(this, `angle`, this._getStartEndArray(`angle`));
  }

  /**
   * @returns {Entity[] | null} Start and end horizontal angle values. Defaults to null.
   */
  get horizontalAngle() {
    return cacheResult(this, `horizontalAngle`, this._getStartEndArray(`horizontalAngle`));
  }

  /**
   * @returns {Entity[] | null} Start and end vertical angle values. Defaults to null.
   */
  get verticalAngle() {
    return cacheResult(this, `verticalAngle`, this._getStartEndArray(`verticalAngle`));
  }

  /**
   * @returns {Entity[] | null} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    return cacheResult(this, `colorTemperature`, this._getStartEndArray(`colorTemperature`));
  }

  /**
   * @returns {Entity[] | null} Start and end sound sensitivity values. Defaults to null.
   */
  get soundSensitivity() {
    return cacheResult(this, `soundSensitivity`, this._getStartEndArray(`soundSensitivity`));
  }

  /**
   * @returns {Entity[] | null} Start and end shake angle values. Defaults to null.
   */
  get shakeAngle() {
    return cacheResult(this, `shakeAngle`, this._getStartEndArray(`shakeAngle`));
  }

  /**
   * @returns {Entity[] | null} Start and end shake speed values. Defaults to null.
   */
  get shakeSpeed() {
    return cacheResult(this, `shakeSpeed`, this._getStartEndArray(`shakeSpeed`));
  }

  /**
   * @returns {Entity[] | null} Start and end distance values. Defaults to null.
   */
  get distance() {
    return cacheResult(this, `distance`, this._getStartEndArray(`distance`));
  }

  /**
   * @returns {Entity[] | null} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    return cacheResult(this, `openPercent`, this._getStartEndArray(`openPercent`));
  }

  /**
   * @returns {Entity[] | null} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    return cacheResult(this, `frostIntensity`, this._getStartEndArray(`frostIntensity`));
  }

  /**
   * @returns {Entity[] | null} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    return cacheResult(this, `insertion`, this._getStartEndArray(`insertion`));
  }

  /**
   * @returns {Entity[] | null} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    return cacheResult(this, `fogOutput`, this._getStartEndArray(`fogOutput`));
  }

  /**
   * @returns {Entity[] | null} Start and end parameter values. Defaults to null.
   */
  get parameter() {
    return cacheResult(this, `parameter`, this._getStartEndArray(`parameter`));
  }

  /**
   * Parses a property that has start and end variants by generating an array with start and end value.
   * @private
   * @param {string} property The base property name. 'Start' and 'End' will be appended to get the start/end variants.
   * @returns {Entity[] | null} Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.
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
 * @param {Capability} capability The capability to generate a name for.
 * @param {string} name The capability type display name.
 * @param {string} property The property to append to the capability type name.
 * @param {string} [propertyName=null] An optional name describing the property to be added if a percentaged value is used. Doesn't need to be the model's property name.
 * @param {boolean} [propertyNameBeforeValue=false] Whether to put the property name before the percentaged value or after.
 * @returns {string} The generated capability name.
 */
function getSimpleCapabilityName(capability, name, property, propertyName = null, propertyNameBeforeValue = false) {
  const propertyString = startEndToString(capability[property], propertyName, propertyNameBeforeValue);
  return appendInBrackets(`${name} ${propertyString}`, capability.comment);
}

/**
 * @ignore
 * @param {string} string The original string without appending or brackets.
 * @param {...(string | undefined | null)} inBrackets Strings that should be added in brackets to the given original string. Invalid strings are ignored.
 * @returns {string} The given string, appended with a space and brackets containing all valid inBracket strings.
 */
function appendInBrackets(string, ...inBrackets) {
  inBrackets = inBrackets.filter(
    inBracket => inBracket !== undefined && inBracket !== null && inBracket !== ``,
  );

  if (inBrackets.length === 0) {
    return string;
  }

  const inBracketsString = inBrackets.join(`, `);
  return `${string} (${inBracketsString})`;
}


/**
 * @ignore
 * @param {Entity[]} colorTemperature Start and end entities of color temperature.
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
 * @param {Entity[]} startEndEntities Array of start and end entities of a property.
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
    'm^3/min': `m³/min`,
  };

  const unit = unitAliases[start.unit] || start.unit;

  let words = [];

  if (start.equals(end)) {
    words.push(`${start.number}${unit}`);
  }
  else {
    words.push(`${start.number}…${end.number}${unit}`);
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
