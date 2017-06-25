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

  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  // { 'fine channel alias': FineChannel, ... }
  get fineChannels() {
    if (!('fineChannels' in this._cache)) {
      this._cache.fineChannels = {};

      for (const alias of this.fineChannelAliases) {
        this._cache.fineChannels[alias] = new FineChannel(alias, this);
      }
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

  // { 'switching channel alias': SwitchingChannel, ... }
  get switchingChannels() {
    if (!('switchingChannels' in this._cache)) {
      let channels = {};

      if (this.capabilities.length > 0 && Object.keys(this.capabilities[0].switchChannels).length > 0) {
        for (const alias of Object.keys(this.capabilities[0].switchChannels)) {
          channels[alias] = new SwitchingChannel(alias, this);
        }
      }

      this._cache.switchingChannels = channels;
    }

    return this._cache.switchingChannels;
  }

  get capabilities() {
    if (!('capabilities' in this._cache)) {
      this._cache.capabilities = [];

      if ('capabilities' in this._jsonObject) {
        for (const cap of this._jsonObject.capabilities) {
          this._cache.capabilities.push(new Capability(cap));
        }
      }
    }

    return this._cache.capabilities;
  }
};