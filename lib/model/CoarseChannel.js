import cacheResult from '../cache-result.js';
import { scaleDmxValue } from '../scale-dmx-values.js';

import AbstractChannel from './AbstractChannel.js';
import Capability from './Capability.js';
import Entity from './Entity.js';
import FineChannel from './FineChannel.js';
/** @ignore @typedef {import('./Fixture.js').default} Fixture */
/** @ignore @typedef {import('./Mode.js').default} Mode */
import SwitchingChannel from './SwitchingChannel.js';

const channelTypeConstraints = {
  'Single Color': [`ColorIntensity`],
  'Multi-Color': {
    required: [`ColorPreset`, `WheelSlot`],
    predicate: channel => channel.capabilities.every(
      capability => capability.type !== `WheelSlot` || (capability.wheels[0] && capability.wheels[0].type === `Color`),
    ),
  },
  'Pan': [`Pan`, `PanContinuous`],
  'Tilt': [`Tilt`, `TiltContinuous`],
  'Focus': [`Focus`],
  'Zoom': [`Zoom`],
  'Iris': [`Iris`, `IrisEffect`],
  'Gobo': {
    required: [`WheelSlot`, `WheelShake`],
    predicate: channel => channel.capabilities.every(
      capability => capability.wheels.every(wheel => wheel && wheel.type === `Gobo`),
    ),
  },
  'Prism': [`Prism`],
  'Color Temperature': [`ColorTemperature`],
  'Effect': [`Effect`, `EffectParameter`, `Frost`, `FrostEffect`, `SoundSensitivity`, `WheelSlot`],
  'Strobe': {
    required: [`ShutterStrobe`],
    predicate: channel => channel.capabilities.some(
      capability => capability.type === `ShutterStrobe` && ![`Open`, `Closed`].includes(capability.shutterEffect),
    ),
  },
  'Shutter': [`ShutterStrobe`, `BladeInsertion`, `BladeRotation`, `BladeSystemRotation`],
  'Fog': [`Fog`, `FogOutput`, `FogType`],
  'Speed': [`StrobeSpeed`, `StrobeDuration`, `PanTiltSpeed`, `EffectSpeed`, `EffectDuration`, `BeamAngle`, `BeamPosition`, `PrismRotation`, `Rotation`, `Speed`, `Time`, `WheelSlotRotation`, `WheelRotation`, `WheelShake`],
  'Maintenance': [`Maintenance`],
  'Intensity': [`Intensity`, `Generic`],
  'NoFunction': [`NoFunction`],
};

/**
 * A single DMX channel, either created as availableChannel or resolved templateChannel.
 * Only the MSB (most significant byte) channel if it's a multi-byte channel.
 * @extends AbstractChannel
 */
class CoarseChannel extends AbstractChannel {
  /**
   * 1 for 8bit, 2 for 16bit, ...
   * @typedef {number} Resolution
   */

  /**
   * @returns {Resolution} Resolution of an 8bit channel.
   */
  static get RESOLUTION_8BIT() {
    return 1;
  }

  /**
   * @returns {Resolution} Resolution of a 16bit channel.
   */
  static get RESOLUTION_16BIT() {
    return 2;
  }

  /**
   * @returns {Resolution} Resolution of a 24bit channel.
   */
  static get RESOLUTION_24BIT() {
    return 3;
  }

  /**
   * @returns {Resolution} Resolution of a 32bit channel.
   */
  static get RESOLUTION_32BIT() {
    return 4;
  }

  /**
   * Create a new CoarseChannel instance.
   * @param {string} key The channel's identifier, must be unique in the fixture.
   * @param {object} jsonObject The channel data from the fixture's JSON.
   * @param {Fixture} fixture The fixture instance this channel is associated to.
   */
  constructor(key, jsonObject, fixture) {
    super(key);
    this._jsonObject = jsonObject;
    this._fixture = fixture;
  }

  /**
   * @returns {object} The channel data from the fixture's JSON.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture instance this channel is associated to.
   */
  get fixture() {
    return this._fixture;
  }

  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} The channel name if present or else the channel key.
   */
  get name() {
    return this._jsonObject.name || this.key;
  }

  /**
   * @returns {string} The channel type, derived from the channel's capability types.
   */
  get type() {
    const type = Object.keys(channelTypeConstraints).find(potentialType => {
      let constraints = channelTypeConstraints[potentialType];

      if (Array.isArray(constraints)) {
        constraints = {
          required: constraints,
        };
      }

      const requiredCapabilityTypeUsed = this.capabilities.some(
        capability => constraints.required.includes(capability.type),
      );

      const predicateFulfilled = !(`predicate` in constraints) || constraints.predicate(this);

      return requiredCapabilityTypeUsed && predicateFulfilled;
    }) || `Unknown`;

    return cacheResult(this, `type`, type);
  }

  /**
   * @returns {string | null} The color of an included ColorIntensity capability, null if there's no such capability.
   */
  get color() {
    const color = this.capabilities.find(capability => capability.type === `ColorIntensity`)?.color;
    return cacheResult(this, `color`, color ?? null);
  }

  /**
   * @returns {string[]} This channel's fine channel aliases, ordered by resolution (coarsest first).
   */
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  /**
   * @returns {FineChannel[]} This channel's fine channels, ordered by resolution (coarsest first).
   */
  get fineChannels() {
    return cacheResult(this, `fineChannels`, this.fineChannelAliases.map(
      alias => new FineChannel(alias, this),
    ));
  }

  /**
   * @returns {Resolution} How fine this channel can be used at its maximum. Equals the amount of coarse and fine channels.
   */
  get maxResolution() {
    return 1 + this.fineChannelAliases.length;
  }

  /**
   * Checks the given resolution if it can safely be used in this channel.
   * @param {Resolution} uncheckedResolution The resolution to be checked.
   * @throws {RangeError} If the given resolution is invalid in this channel.
   */
  ensureProperResolution(uncheckedResolution) {
    if (uncheckedResolution > this.maxResolution || uncheckedResolution < CoarseChannel.RESOLUTION_8BIT || uncheckedResolution % 1 !== 0) {
      throw new RangeError(`resolution must be a positive integer not greater than maxResolution`);
    }
  }

  /**
   * @returns {Resolution} How fine this channel is declared in the JSON data. Defaults to {@link CoarseChannel#maxResolution}.
   */
  get dmxValueResolution() {
    if (`dmxValueResolution` in this._jsonObject) {
      const resolutionStringToResolution = {
        '8bit': CoarseChannel.RESOLUTION_8BIT,
        '16bit': CoarseChannel.RESOLUTION_16BIT,
        '24bit': CoarseChannel.RESOLUTION_24BIT,
      };

      return cacheResult(this, `dmxValueResolution`, resolutionStringToResolution[this._jsonObject.dmxValueResolution]);
    }

    return cacheResult(this, `dmxValueResolution`, this.maxResolution);
  }

  /**
   * @param {Mode} mode The mode in which this channel is used.
   * @param {SwitchingChannelBehavior} switchingChannelBehavior How switching channels are treated, see {@link Mode#getChannelIndex}.
   * @returns {Resolution} How fine this channel is used in the given mode. 0 if the channel isn't used at all.
   */
  getResolutionInMode(mode, switchingChannelBehavior) {
    const channelKeys = [this.key, ...this.fineChannelAliases];
    const usedChannels = channelKeys.filter(
      channelKey => mode.getChannelIndex(channelKey, switchingChannelBehavior) !== -1,
    );

    return usedChannels.length;
  }

  /**
   * @returns {number} The maximum DMX value in the highest possible resolution. E.g. 65535 for a 16bit channel.
   */
  get maxDmxBound() {
    return Math.pow(256, this.maxResolution) - 1;
  }

  /**
   * @returns {boolean} Whether this channel has a defaultValue.
   */
  get hasDefaultValue() {
    return `defaultValue` in this._jsonObject;
  }

  /**
   * @returns {number} The DMX value this channel initially should be set to. Specified in the finest possible resolution. Defaults to 0.
   */
  get defaultValue() {
    return this.getDefaultValueWithResolution(this.maxResolution);
  }

  /**
   * @private
   * @returns {Record<Resolution, number>} The default DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.
   */
  get _defaultValuePerResolution() {
    let rawDefaultValue = this._jsonObject.defaultValue || 0;

    if (!Number.isInteger(rawDefaultValue)) {
      const percentage = Entity.createFromEntityString(rawDefaultValue).number / 100;
      rawDefaultValue = Math.floor(percentage * (Math.pow(256, this.dmxValueResolution) - 1));
    }

    const defaultValuePerResolution = {};
    for (let index = 1; index <= this.maxResolution; index++) {
      defaultValuePerResolution[index] = scaleDmxValue(rawDefaultValue, this.dmxValueResolution, index);
    }

    return cacheResult(this, `_defaultValuePerResolution`, defaultValuePerResolution);
  }

  /**
   * @param {Resolution} desiredResolution The grade of resolution the defaultValue should be scaled to.
   * @returns {number} The DMX value this channel initially should be set to, scaled to match the given resolution.
   */
  getDefaultValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);

    return this._defaultValuePerResolution[desiredResolution];
  }

  /**
   * @returns {boolean} Whether this channel has a highlightValue.
   */
  get hasHighlightValue() {
    return `highlightValue` in this._jsonObject;
  }

  /**
   * @returns {number} A DMX value that "highlights" the function of this channel. Specified in the finest possible resolution. Defaults to the highest possible DMX value.
   */
  get highlightValue() {
    return this.getHighlightValueWithResolution(this.maxResolution);
  }

  /**
   * @private
   * @returns {Record<Resolution, number>} The highlight DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.
   */
  get _highlightValuePerResolution() {
    let rawHighlightValue = this._jsonObject.highlightValue;

    if (!Number.isInteger(rawHighlightValue)) {
      const maxDmxBoundInResolution = Math.pow(256, this.dmxValueResolution) - 1;

      if (this.hasHighlightValue) {
        const percentage = Entity.createFromEntityString(rawHighlightValue).number / 100;
        rawHighlightValue = Math.floor(percentage * maxDmxBoundInResolution);
      }
      else {
        rawHighlightValue = maxDmxBoundInResolution;
      }
    }

    const highlightValuePerResolution = {};
    for (let index = 1; index <= this.maxResolution; index++) {
      highlightValuePerResolution[index] = scaleDmxValue(rawHighlightValue, this.dmxValueResolution, index);
    }

    return cacheResult(this, `_highlightValuePerResolution`, highlightValuePerResolution);
  }

  /**
   * @param {Resolution} desiredResolution The grade of resolution the highlightValue should be scaled to.
   * @returns {number} A DMX value that "highlights" the function of this channel, scaled to match the given resolution.
   */
  getHighlightValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);

    return this._highlightValuePerResolution[desiredResolution];
  }

  /**
   * @returns {boolean} Whether a fader for this channel should be displayed upside down.
   */
  get isInverted() {
    const proportionalCapabilities = this.capabilities.filter(capability => !capability.isStep);
    const isInverted = proportionalCapabilities.length > 0 && proportionalCapabilities.every(capability => capability.isInverted);
    return cacheResult(this, `isInverted`, isInverted);
  }

  /**
   * @returns {boolean} Whether this channel should constantly stay at the same value.
   */
  get isConstant() {
    return `constant` in this._jsonObject && this._jsonObject.constant;
  }

  /**
   * @returns {boolean} Whether switching from one DMX value to another in this channel can be faded smoothly.
   */
  get canCrossfade() {
    if (this.capabilities.length === 1) {
      return cacheResult(this, `canCrossfade`, !this.isConstant && this.type !== `NoFunction`);
    }

    const canCrossfade = this.capabilities.every(
      (capability, index, array) => index + 1 === array.length || capability.canCrossfadeTo(array[index + 1]),
    ) && this.capabilities.some(capability => !capability.isStep);

    return cacheResult(this, `canCrossfade`, canCrossfade);
  }

  /**
   * @returns {'HTP' | 'LTP'} The channel's behavior when being affected by multiple faders: HTP (Highest Takes Precedent) or LTP (Latest Takes Precedent).
   */
  get precedence() {
    return `precedence` in this._jsonObject ? this._jsonObject.precedence : `LTP`;
  }

  /**
   * @returns {string[]} Aliases of the switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannelAliases() {
    return cacheResult(this, `switchingChannelAliases`, Object.keys(this.capabilities[0].switchChannels));
  }

  /**
   * @returns {SwitchingChannel[]} Switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannels() {
    return cacheResult(this, `switchingChannels`, this.switchingChannelAliases.map(
      alias => new SwitchingChannel(alias, this),
    ));
  }

  /**
   * @returns {string[]} The keys of the channels to which the switching channels defined by this channel can be switched to.
   */
  get switchToChannelKeys() {
    return cacheResult(this, `switchToChannelKeys`, this.switchingChannels.flatMap(
      switchingChannel => switchingChannel.switchToChannelKeys,
    ));
  }

  /**
   * @returns {Capability[]} All capabilities of this channel, ordered by DMX range.
   */
  get capabilities() {
    if (`capability` in this._jsonObject) {
      const capabilityData = {
        dmxRange: [0, Math.pow(256, this.dmxValueResolution) - 1],
        ...this._jsonObject.capability,
      };

      return cacheResult(this, `capabilities`, [
        new Capability(capabilityData, this.dmxValueResolution, this),
      ]);
    }

    return cacheResult(this, `capabilities`, this._jsonObject.capabilities.map(
      capability => new Capability(capability, this.dmxValueResolution, this),
    ));
  }

  /**
   * @returns {boolean} True if help is needed in a capability of this channel, false otherwise.
   */
  get isHelpWanted() {
    return cacheResult(this, `isHelpWanted`, this.capabilities.some(
      capability => capability.helpWanted !== null,
    ));
  }
}

export default CoarseChannel;
