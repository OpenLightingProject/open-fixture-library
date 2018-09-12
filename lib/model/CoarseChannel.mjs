import AbstractChannel from './AbstractChannel.mjs';
import Capability from './Capability.mjs';
import Entity from './Entity.mjs';
import FineChannel from './FineChannel.mjs';
import SwitchingChannel from './SwitchingChannel.mjs';

import scaleDmxValuesJs from '../scale-dmx-values.js';
const { scaleDmxValue } = scaleDmxValuesJs;

const channelTypeConstraints = {
  'Single Color': [`ColorIntensity`],
  'Multi-Color': [`ColorPreset`, `ColorWheelIndex`],
  'Pan': [`Pan`, `PanContinuous`],
  'Tilt': [`Tilt`, `TiltContinuous`],
  'Focus': [`Focus`],
  'Zoom': [`Zoom`],
  'Iris': [`Iris`, `IrisEffect`],
  'Gobo': [`GoboIndex`, `GoboShake`],
  'Prism': [`Prism`],
  'Color Temperature': [`ColorTemperature`],
  'Effect': [`Effect`, `EffectParameter`, `Frost`, `FrostEffect`, `SoundSensitivity`],
  'Shutter': [`ShutterStrobe`, `BladeInsertion`, `BladeRotation`, `BladeSystemRotation`],
  'Fog': [`Fog`, `FogOutput`, `FogType`],
  'Speed': [`StrobeSpeed`, `StrobeDuration`, `ColorWheelRotation`, `PanTiltSpeed`, `EffectSpeed`, `EffectDuration`, `GoboStencilRotation`, `GoboWheelRotation`, `PrismRotation`, `Rotation`, `Speed`, `Time`],
  'Maintenance': [`Maintenance`],
  'Intensity': [`Intensity`, `BeamAngle`, `Generic`],
  'NoFunction': [`NoFunction`]
};

/**
 * A single DMX channel, either created as availableChannel or resolved templateChannel.
 * Only the MSB channel if it's a multi-byte channel.
 * @extends AbstractChannel
 */
class CoarseChannel extends AbstractChannel {
  /**
   * @returns {!Resolution} Resolution of an 8bit channel.
   */
  static get RESOLUTION_8BIT() {
    return 1;
  }

  /**
   * @returns {!Resolution} Resolution of an 16bit channel.
   */
  static get RESOLUTION_16BIT() {
    return 2;
  }

  /**
   * @returns {!Resolution} Resolution of an 24bit channel.
   */
  static get RESOLUTION_24BIT() {
    return 3;
  }

  /**
   * @returns {!Resolution} Resolution of an 32bit channel.
   */
  static get RESOLUTION_32BIT() {
    return 4;
  }

  /**
   * Create a new CoarseChannel instance.
   * @param {!string} key The channel's identifier, must be unique in the fixture.
   * @param {!object} jsonObject The channel data from the fixture's json.
   * @param {!Fixture} fixture The fixture instance this channel is associated to.
   */
  constructor(key, jsonObject, fixture) {
    super(key);
    this.jsonObject = jsonObject; // calls the setter
    this._fixture = fixture;
  }

  /**
   * @param {!object} jsonObject The channel data from the fixture's json.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @returns {!object} The channel data from the fixture's json.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {!Fixture} The fixture instance this channel is associated to.
   * @override AbstractChannel.fixture
   */
  get fixture() {
    return this._fixture;
  }

  /**
   * @returns {!string} The channel name if present or else the channel key.
   * @override AbstractChannel.name
   */
  get name() {
    return this._jsonObject.name || this.key;
  }

  /**
   * @returns {!string} The channel type.
   */
  get type() {
    if (!(`type` in this._cache)) {
      const types = Object.keys(channelTypeConstraints);
      const usedCapabilityTyprd = this.capabilities.map(cap => cap.type);

      this._cache.type = types.find(type => channelTypeConstraints[type].some(
        capabilityType => usedCapabilityTyprd.includes(capabilityType)
      )) || `Unknown`;

      if (this._cache.type === `Shutter`) {
        const usesStrobe = this.capabilities.some(cap =>
          cap.type === `ShutterStrobe` && ![`Open`, `Closed`].includes(cap.shutterEffect)
        );

        if (usesStrobe) {
          this._cache.type = `Strobe`;
        }
      }
    }

    return this._cache.type;
  }

  /**
   * @returns {!string} The color of an included ColorIntensity capability, null if there's no such capability.
   */
  get color() {
    if (!(`color` in this._cache)) {
      const colorCap = this.capabilities.find(cap => cap.type === `ColorIntensity`);
      this._cache.color = colorCap ? colorCap.color : null;
    }

    return this._cache.color;
  }

  /**
   * @returns {!Array.<string>} This channel's fine channels' aliases, ordered by resolution (coarsest first).
   */
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  /**
   * @returns {!Array.<FineChannel>} This channel's fine channels, ordered by resolution (coarsest first).
   */
  get fineChannels() {
    if (!(`fineChannels` in this._cache)) {
      this._cache.fineChannels = this.fineChannelAliases.map(alias => new FineChannel(alias, this));
    }

    return this._cache.fineChannels;
  }

  /**
   * 1 for 8bit, 2 for 16bit, ...
   * @typedef {!number} Resolution
   */

  /**
   * @returns {!Resolution} How fine this channel can be used at its maximum. Equals the amout of coarse and fine channels.
   */
  get maxResolution() {
    return 1 + this.fineChannelAliases.length;
  }

  /**
   * Checks the given resolution if it can safely be used in this channel.
   * @param {!Resolution} uncheckedResolution The resolution to be checked.
   * @throws {!RangeError} If the given resolution is invalid in this channel.
   */
  ensureProperResolution(uncheckedResolution) {
    if (uncheckedResolution > this.maxResolution || uncheckedResolution < CoarseChannel.RESOLUTION_8BIT || uncheckedResolution % 1 !== 0) {
      throw new RangeError(`resolution must be a positive integer not greater than maxResolution`);
    }
  }

  /**
   * @returns {!Resolution} How fine this channel is declared in the JSON data. Defaults to maxResolution.
   */
  get dmxValueResolution() {
    if (!(`dmxValueResolution` in this._cache)) {
      if (`dmxValueResolution` in this._jsonObject) {
        const resolutionStringToResolution = {
          '8bit': CoarseChannel.RESOLUTION_8BIT,
          '16bit': CoarseChannel.RESOLUTION_16BIT,
          '24bit': CoarseChannel.RESOLUTION_24BIT
        };

        this._cache.dmxValueResolution = resolutionStringToResolution[this._jsonObject.dmxValueResolution];
      }
      else {
        this._cache.dmxValueResolution = this.maxResolution;
      }
    }

    return this._cache.dmxValueResolution;
  }

  /**
   * @param {!Mode} mode The mode in which this channel is used.
   * @param {!SwitchingChannelBehavior} switchingChannelBehaviour How switching channels are treated, @see Mode.getChannelIndex
   * @returns {!Resolution} How fine this channel is used in the given mode. 0 if the channel isn't used at all.
   */
  getResolutionInMode(mode, switchingChannelBehaviour = undefined) {
    const channelKeys = [this.key].concat(this.fineChannelAliases);
    const usedChannels = channelKeys.filter(
      chKey => mode.getChannelIndex(chKey, switchingChannelBehaviour) !== -1
    );

    return usedChannels.length;
  }

  /**
   * @returns {!number} The maximum DMX value in the highest possible resolution. E.g. 65535 for a 16bit channel.
   */
  get maxDmxBound() {
    return Math.pow(256, this.maxResolution) - 1;
  }

  /**
   * @returns {!boolean} Whether this channel has a defaultValue.
   */
  get hasDefaultValue() {
    return `defaultValue` in this._jsonObject;
  }

  /**
   * @returns {!number} The DMX value this channel initially should be set to. Specified in the finest possible resolution.
   */
  get defaultValue() {
    return this.getDefaultValueWithResolution(this.maxResolution);
  }

  /**
   * @param {!Resolution} desiredResolution The grade of resolution the defaultValue should be scaled to.
   * @returns {!number} The DMX value this channel initially should be set to, scaled to match the given resolution.
   */
  getDefaultValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);

    if (!(`defaultValuePerResolution` in this._cache)) {
      let rawDefaultValue = this._jsonObject.defaultValue || 0;

      if (!Number.isInteger(rawDefaultValue)) {
        const percentage = Entity.createFromEntityString(rawDefaultValue).number / 100;
        rawDefaultValue = Math.floor(percentage * (Math.pow(256, this.dmxValueResolution) - 1));
      }

      this._cache.defaultValuePerResolution = {};
      for (let i = 1; i <= this.maxResolution; i++) {
        this._cache.defaultValuePerResolution[i] = scaleDmxValue(rawDefaultValue, this.dmxValueResolution, i);
      }
    }

    return this._cache.defaultValuePerResolution[desiredResolution];
  }

  /**
   * @returns {!boolean} Whether this channel has a highlightValue.
   */
  get hasHighlightValue() {
    return `highlightValue` in this._jsonObject;
  }

  /**
   * @returns {!number} A DMX value that "highlights" the function of this channel. Specified in the finest possible resolution. Default is the highest possible DMX value.
   */
  get highlightValue() {
    return this.getHighlightValueWithResolution(this.maxResolution);
  }

  /**
   * @param {!Resolution} desiredResolution The grade of resolution the highlightValue should be scaled to.
   * @returns {!number} A DMX value that "highlights" the function of this channel, scaled to match the given resolution.
   */
  getHighlightValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);

    if (!(`highlightValuePerResolution` in this._cache)) {
      let rawHighlightValue = this._jsonObject.highlightValue;

      if (!Number.isInteger(rawHighlightValue)) {
        const maxDmxBoundInResolution = Math.pow(256, this.dmxValueResolution) - 1;

        if (this.hasHighlightValue) {
          const percentage = new Entity(rawHighlightValue).number / 100;
          rawHighlightValue = Math.floor(percentage * maxDmxBoundInResolution);
        }
        else {
          rawHighlightValue = maxDmxBoundInResolution;
        }
      }

      this._cache.highlightValuePerResolution = {};
      for (let i = 1; i <= this.maxResolution; i++) {
        this._cache.highlightValuePerResolution[i] = scaleDmxValue(rawHighlightValue, this.dmxValueResolution, i);
      }
    }

    return this._cache.highlightValuePerResolution[desiredResolution];
  }

  /**
   * @returns {!boolean} Whether a fader for this channel should be displayed upside down.
   */
  get isInverted() {
    if (!(`isInverted` in this._cache)) {
      const proportionalCaps = this.capabilities.filter(cap => !cap.isStep);
      this._cache.isInverted = proportionalCaps.length > 0 && proportionalCaps.every(cap => cap.isInverted);
    }

    return this._cache.isInverted;
  }

  /**
   * @returns {!boolean} Whether this channel should constantly stay at the same value.
   */
  get isConstant() {
    return `constant` in this._jsonObject && this._jsonObject.constant;
  }

  /**
   * @returns {!boolean} Whether switching from one DMX value to another in this channel can be faded smoothly.
   */
  get canCrossfade() {
    if (!(`canCrossfade` in this._cache)) {
      if (this.capabilities.length === 1) {
        this._cache.canCrossfade = !this.isConstant && this.type !== `NoFunction`;
      }
      else {
        this._cache.canCrossfade = this.capabilities.every(
          (cap, index, arr) => index + 1 === arr.length || cap.canCrossfadeTo(arr[index + 1])
        ) && this.capabilities.some(cap => !cap.isStep);
      }
    }

    return this._cache.canCrossfade;
  }

  /**
   * @returns {'HTP'|'LTP'} The channel's behavior when being affected by multiple faders: HTP (Highest Takes Precedent) or LTP (Latest Takes Precedent).
   */
  get precedence() {
    return `precedence` in this._jsonObject ? this._jsonObject.precedence : `LTP`;
  }

  /**
   * @returns {!Array.<string>} Aliases of the switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannelAliases() {
    if (!(`switchingChannelAliases` in this._cache)) {
      this._cache.switchingChannelAliases = Object.keys(this.capabilities[0].switchChannels);
    }

    return this._cache.switchingChannelAliases;
  }

  /**
   * @returns {!Array.<SwitchingChannel>} Switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannels() {
    if (!(`switchingChannels` in this._cache)) {
      this._cache.switchingChannels = this.switchingChannelAliases.map(
        alias => new SwitchingChannel(alias, this)
      );
    }

    return this._cache.switchingChannels;
  }

  /**
   * @returns {!Array.<string>} The keys of the channels to which the switching channels defined by this channel can be switched to.
   */
  get switchToChannelKeys() {
    if (!(`switchToChannelKeys` in this._cache)) {
      let keys = [];

      for (const switchingChannel of this.switchingChannels) {
        keys = keys.concat(switchingChannel.switchToChannelKeys);
      }

      this._cache.switchToChannelKeys = keys;
    }

    return this._cache.switchToChannelKeys;
  }

  /**
   * @returns {!Array.<Capability>} All capabilities of this channel, ordered by DMX range.
   */
  get capabilities() {
    if (!(`capabilities` in this._cache)) {
      if (`capability` in this._jsonObject) {
        const capabilityData = Object.assign({ dmxRange: [0, Math.pow(256, this.dmxValueResolution) - 1] }, this._jsonObject.capability);

        this._cache.capabilities = [
          new Capability(capabilityData, this.dmxValueResolution, this)
        ];
      }
      else {
        this._cache.capabilities = this._jsonObject.capabilities.map(
          cap => new Capability(cap, this.dmxValueResolution, this)
        );
      }
    }

    return this._cache.capabilities;
  }

  /**
   * @returns {!boolean} True if help is needed in a capability of this channel, false otherwise.
   */
  get isHelpWanted() {
    if (!(`isHelpWanted` in this._cache)) {
      this._cache.isHelpWanted = this.capabilities.some(
        cap => cap.helpWanted !== null
      );
    }

    return this._cache.isHelpWanted;
  }
}

export default CoarseChannel;
