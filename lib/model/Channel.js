const AbstractChannel = require('./AbstractChannel.js');
const Capability = require('./Capability.js');
const FineChannel = require('./FineChannel.js');
const SwitchingChannel = require('./SwitchingChannel.js');

module.exports = class Channel extends AbstractChannel {
  constructor(key, jsonObject, fixture) {
    super(key);
    this.jsonObject = jsonObject; // calls the setter
    this._fixture = fixture;
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get jsonObject() {
    return this._jsonObject;
  }

  // must be implemented when extending AbstractChannel
  get fixture() {
    return this._fixture;
  }


  // overrides AbstractChannel.name
  get name() {
    return this._jsonObject.name || this.key;
  }

  get type() {
    return this._jsonObject.type; // required
  }

  get color() {
    return this._jsonObject.color || null; // required if Single Color, else forbidden
  }

  // array, ordered by fineness (coarsest first)
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  // array of FineChannel objects, ordered by fineness (coarsest first)
  get fineChannels() {
    if (!('fineChannels' in this._cache)) {
      this._cache.fineChannels = this.fineChannelAliases.map(alias => new FineChannel(alias, this));
    }

    return this._cache.fineChannels;
  }

  /**
   * 0 for 8bit, 1 for 16bit, ...
   * @typedef {!number} Fineness
   */

  /**
   * @return {!Fineness} How fine the channel is declared. Equals the amout of fine channels.
   */
  get maxFineness() {
    return this.fineChannelAliases.length;
  }

  // see Mode.getChannelIndex for possible switchingChannelBehaviour values
  getFinenessInMode(mode, switchingChannelBehaviour = undefined) {
    for (let i = this.maxFineness; i > 0; i--) {
      if (mode.getChannelIndex(this.fineChannelAliases[i - 1], switchingChannelBehaviour) !== -1) {
        return i;
      }
    }
    return 0;
  }

  get maxDmxBound() {
    return Math.pow(256, this.fineChannelAliases.length + 1) - 1;
  }

  get defaultValue() {
    return this._jsonObject.defaultValue || 0;
  }

  // scales down the default value to match the given fineness
  getDefaultValueWithFineness(fineness) {
    const max = this.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a non-zero integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    return Math.floor(this.defaultValue / Math.pow(256, max - fineness));
  }

  get hasDefaultValue() {
    return 'defaultValue' in this._jsonObject;
  }

  get highlightValue() {
    return this._jsonObject.highlightValue || this.maxDmxBound;
  }

  // scales down the highlight value to match the given fineness
  getHighlightValueWithFineness(fineness) {
    const max = this.maxFineness;
    if (fineness > max || fineness < 0 || fineness % 1 !== 0) {
      throw new RangeError(`fineness must be a non-zero integer not greater than channel ${this._channel.key}'s maxFineness`);
    }

    return Math.floor(this.highlightValue / Math.pow(256, max - fineness));
  }

  get hasHighlightValue() {
    return 'highlightValue' in this._jsonObject;
  }

  get invert() {
    return 'invert' in this._jsonObject && this._jsonObject.invert;
  }

  get constant() {
    return 'constant' in this._jsonObject && this._jsonObject.constant;
  }

  get crossfade() {
    return 'crossfade' in this._jsonObject && this._jsonObject.crossfade;
  }

  get precedence() {
    return 'precedence' in this._jsonObject ? this._jsonObject.precedence : 'LTP';
  }

  // array, ordered by appearance
  get switchingChannelAliases() {
    if (!('switchingChannelAliases' in this._cache)) {
      this._cache.switchingChannelAliases = Object.keys(this.capabilities[0].switchChannels);
    }

    return this._cache.switchingChannelAliases;
  }

  // array of SwitchingChannel objects, ordered by appearance
  get switchingChannels() {
    if (!('switchingChannels' in this._cache)) {
      this._cache.switchingChannels = this.switchingChannelAliases.map(
        alias => new SwitchingChannel(alias, this)
      );
    }

    return this._cache.switchingChannels;
  }

  /**
   * @return {!Array.<Capability>} All capabilities of this channel, ordered by range. Defaults to a 0-100% capability
   */
  get capabilities() {
    if (!('capabilities' in this._cache)) {
      if (this.hasCapabilities) {
        /** @type {!Fineness} Calculate how fine the capabilties are defined. */
        const fineness = (Math.log(this._jsonObject.capabilities[this._jsonObject.capabilities.length - 1].range[1] + 1) / Math.log(256)) - 1;

        this._cache.capabilities = this._jsonObject.capabilities.map(cap => new Capability(cap, fineness, this));
      }
      else {
        this._cache.capabilities = [
          new Capability({
            range: [0, 255],
            name: '0-100%'
          }, 0, this)
        ];
      }
    }

    return this._cache.capabilities;
  }

  get hasCapabilities() {
    return 'capabilities' in this._jsonObject;
  }
};
