const path = require('path');

const Capability = require(path.join(__dirname, 'Capability.js'));

module.exports = class Channel {
  constructor(jsonObject, key) {
    this.jsonObject = jsonObject;
    this.key = key;
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
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

  /*
    {
      'switching channel alias': {
        triggerChannel: 'trigger channel key',
        switchToChannels: ['switch to channel key', ...],
        defaultChannel: 'default channel key'
      },
      ...
    }
  */
  get switchingChannels() {
    if (!('switchingChannels' in this._cache)) {
      let channels = {};

      for (const cap of this.capabilities) {
        for (const alias of Object.keys(cap.switchChannels)) {
          const switchTo = cap.switchChannels[alias];

          if (!(alias in channels)) {
            channels[alias] = {
              triggerChannel: this.key,
              switchToChannels: [switchTo],
              defaultChannel: null
            };
          }
          else if (!channels[alias].switchToChannels.includes(switchTo)) {
            channels[alias].switchToChannels.push(switchTo);
          }

          if (cap.range[0] <= this.defaultValue && this.defaultValue <= cap.range[1]) {
            channels[alias].defaultChannel = switchTo;
          }
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