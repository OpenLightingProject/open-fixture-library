const path = require('path');

const Capability = require(path.join(__dirname, 'Capability.js'));
const FineChannel = require(path.join(__dirname, 'FineChannel.js'));
const SwitchingChannel = require(path.join(__dirname, 'SwitchingChannel.js'));

module.exports = class Channel {
  constructor(jsonObject, key) {
    this.jsonObject = jsonObject; // calls the setter
    this._key = key;
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get key() {
    return this._key;
  }

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

  get defaultValue() {
    return this._jsonObject.defaultValue || 0;
  }

  get hasDefaultValue() {
    return 'defaultValue' in this._jsonObject;
  }

  get highlightValue() {
    return this._jsonObject.highlightValue || 255;
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

  get isLTP() {
    return 'precedence' in this._jsonObject && this._jsonObject.precedence === 'LTP';
  }

  get isHTP() {
    return !this.isLTP;
  }

  // array, ordered by appearance
  get switchingChannelAliases() {
    if (!('switchingChannelAliases' in this._cache)) {
      this._cache.switchingChannelAliases = this.capabilities.length > 0 ? Object.keys(this.capabilities[0].switchChannels) : [];
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
  get capabilities() {
    if (!('capabilities' in this._cache)) {
      this._cache.capabilities = 'capabilities' in this._jsonObject
        ? this._jsonObject.capabilities.map(cap => new Capability(cap))
        : [];
    }

    return this._cache.capabilities;
  }
};