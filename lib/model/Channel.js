const path = require('path');

const AbstractChannel = require(path.join(__dirname, 'AbstractChannel.js'));
const Capability = require(path.join(__dirname, 'Capability.js'));
const FineChannel = require(path.join(__dirname, 'FineChannel.js'));
const SwitchingChannel = require(path.join(__dirname, 'SwitchingChannel.js'));

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
    return this._jsonObject.color || null; // required if SingleColor, else forbidden
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

  // 0 for 8bit, 1 for 16bit, ...
  get maxFineness() {
    return this.fineChannelAliases.length;
  }

  getFinenessInMode(mode) {
    for (let i = this.maxFineness; i >= 0; i--) {
      if (mode.channelKeys.includes(this.fineChannelAliases[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  get maxDmxBound() {
    return Math.pow(256, this.fineChannelAliases.length+1) - 1;
  }

  get defaultValue() {
    return this._jsonObject.defaultValue || 0;
  }

  // scales down the default value to match the given fineness
  getDefaultValueWithFineness(fineness) {
    const max = this.maxFineness;
    if (fineness > max) {
      throw RangeError(`fineness must not be greater than channel ${this._channel.key}'s maxFineness`);
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
    if (fineness > max) {
      throw RangeError(`fineness must not be greater than channel ${this._channel.key}'s maxFineness`);
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

  // array of Capability objects, ordered by range
  // defaults to a 0-100% capability
  get capabilities() {
    if (!('capabilities' in this._cache)) {
      this._cache.capabilities = this.hasCapabilities
        ? this._jsonObject.capabilities.map(cap => new Capability(cap, this))
        : [
          new Capability({
            range: [0, this.maxDmxBound],
            name: '0-100%'
          }, this)
        ];
    }

    return this._cache.capabilities;
  }

  get hasCapabilities() {
    return 'capabilities' in this._jsonObject;
  }
};