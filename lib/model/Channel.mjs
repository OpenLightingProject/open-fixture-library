import AbstractChannel from './AbstractChannel.mjs';
import Capability from './Capability.mjs';
import FineChannel from './FineChannel.mjs';
import SwitchingChannel from './SwitchingChannel.mjs';

/** A directly used channel, either created as availableChannel or resolved templateChannel. */
export default class Channel extends AbstractChannel {
  /**
   * Create a new Channel instance.
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
    return this._jsonObject.type; // required
  }

  /**
   * @returns {!string} The channel color (if channel type is 'Single Color'), null otherwise.
   */
  get color() {
    return this._jsonObject.color || null; // required if Single Color, else forbidden
  }

  /**
   * @returns {!Array.<string>} This channel's fine channels' aliases, ordered by fineness (coarsest first).
   */
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  /**
   * @returns {!Array.<FineChannel>} This channel's fine channels, ordered by fineness (coarsest first).
   */
  get fineChannels() {
    if (!(`fineChannels` in this._cache)) {
      this._cache.fineChannels = this.fineChannelAliases.map(alias => new FineChannel(alias, this));
    }

    return this._cache.fineChannels;
  }

  /**
   * 0 for 8bit, 1 for 16bit, ...
   * @typedef {!number} Fineness
   */

  /**
   * @returns {!Fineness} How fine this channel is declared. Equals the amout of fine channels.
   */
  get maxFineness() {
    return this.fineChannelAliases.length;
  }

  /**
   * @param {!Mode} mode The mode in which this channel is used.
   * @param {!SwitchingChannelBehavior} switchingChannelBehaviour How switching channels are treated, @see Mode.getChannelIndex
   * @returns {!Fineness} How fine this channel is used in the given mode. Minimum is 0.
   */
  getFinenessInMode(mode, switchingChannelBehaviour = undefined) {
    for (let i = this.maxFineness; i > 0; i--) {
      if (mode.getChannelIndex(this.fineChannelAliases[i - 1], switchingChannelBehaviour) !== -1) {
        return i;
      }
    }
    return 0;
  }

  /**
   * @returns {!number} The dmx bound size for the maximum fineness. E.g. 65535 for a 16bit channel.
   */
  get maxDmxBound() {
    return Math.pow(256, this.fineChannelAliases.length + 1) - 1;
  }

  /**
   * @returns {!boolean} Whether this channel has a defaultValue.
   */
  get hasDefaultValue() {
    return `defaultValue` in this._jsonObject;
  }

  /**
   * @returns {!number} The DMX value this channel initially should be set to. Note that it's specified in the finest possible resolution.
   */
  get defaultValue() {
    return this._jsonObject.defaultValue || 0;
  }

  /**
   * @param {!Fineness} fineness The grade of fineness the defaultValue should be scaled to.
   * @returns {!number} The DMX value this channel initially should be set to, scaled down to match the given fineness.
   */
  getDefaultValueWithFineness(fineness) {
    const max = this.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a non-zero integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    return Math.floor(this.defaultValue / Math.pow(256, max - fineness));
  }

  /**
   * @returns {!boolean} Whether this channel has a highlightValue.
   */
  get hasHighlightValue() {
    return `highlightValue` in this._jsonObject;
  }

  /**
   * @returns {!number} A DMX value that "highlights" the function of this channel. Note that it's specified in the finest possible resolution. Default is the highest possible DMX value.
   */
  get highlightValue() {
    return this._jsonObject.highlightValue || this.maxDmxBound;
  }

  /**
   * @param {!Fineness} fineness The grade of fineness the highlightValue should be scaled to.
   * @returns {!number} A DMX value that "highlights" the function of this channel, scaled down to match the given fineness.
   */
  getHighlightValueWithFineness(fineness) {
    const max = this.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a non-zero integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    return Math.floor(this.highlightValue / Math.pow(256, max - fineness));
  }

  /**
   * @returns {!boolean} Whether a fader for this channel should be displayed upside down.
   */
  get isInverted() {
    return `invert` in this._jsonObject && this._jsonObject.invert;
  }

  /**
   * @returns {!boolean} Whether this channel should constantly stay at the same value.
   */
  get constant() {
    return `constant` in this._jsonObject && this._jsonObject.constant;
  }

  /**
   * @returns {!boolean} Whether a switch from one DMX value to another in this channel can be faded smoothly.
   */
  get crossfade() {
    return `crossfade` in this._jsonObject && this._jsonObject.crossfade;
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
   * @returns {!Array.<string>} The keys of channels to which the switching channels defined in this template channel can be switched to.
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
   * @returns {!boolean} Whether capabilities are defined in this channel.
   */
  get hasCapabilities() {
    return `capabilities` in this._jsonObject;
  }

  /**
   * @returns {!Array.<Capability>} All capabilities of this channel, ordered by DMX range. Defaults to a 0-100% capability
   */
  get capabilities() {
    if (!(`capabilities` in this._cache)) {
      if (this.hasCapabilities) {
        /** @type {!Fineness} Calculate how fine the capabilties are defined. */
        const fineness = (Math.log(this._jsonObject.capabilities[this._jsonObject.capabilities.length - 1].range[1] + 1) / Math.log(256)) - 1;

        this._cache.capabilities = this._jsonObject.capabilities.map(cap => new Capability(cap, fineness, this));
      }
      else {
        this._cache.capabilities = [
          new Capability({
            range: [0, 255],
            name: `0-100%`
          }, 0, this)
        ];
      }
    }

    return this._cache.capabilities;
  }
}
