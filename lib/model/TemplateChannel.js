const Channel = require('./Channel.js');

module.exports = class TemplateChannel extends Channel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {!string} key The templateChannel's key with the required variables.
   * @param {!Object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases can include variables.
   * @param {!Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    super(key, jsonObject, fixture);
  }
  
  /**
   * @return The channels to which the switching channels defined in this template channel can be switched to.
   */
  get switchToChannelKeys() {
    if (!('switchToChannelKeys' in this._cache)) {
      let keys = [];

      for (const switchingChannel of this.switchingChannels) {
        keys = keys.concat(switchingChannel.switchToChannelKeys);
      }

      this._cache.switchToChannelKeys = keys;
    }

    return this._cache.switchToChannelKeys;
  }

  /**
   * @return {!string[]} All template keys/aliases used in this channel, even references to other channels.
   */
  get allTemplateKeys() {
    if (!('allTemplateKeys' in this._jsonObject)) {
      this._cache.allTemplateKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases, this.switchToChannelKeys);
    }

    return this._cache.allTemplateKeys;
  }

  /**
   * @return {!Object.<string, string>} All resolved keys/aliases created in this channel pointing to its pixelKey/pixelGroupKey.
   */
  get matrixChannelKeys() {
    if (!('matrixChannelKeys' in this._cache)) {
      let matrixChKeys = {};

      const pixelKeys = Object.keys(this.fixture.matrix.pixelKeyPositions).concat(this.fixture.matrix.pixelGroupKeys);
      const chKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases);
      for (const pixelKey of pixelKeys) {
        for (const chKey of chKeys) {
          const matrixChKey = TemplateChannel.parseTemplateString(chKey, {pixelKey: pixelKey});
          matrixChKeys[matrixChKey] = pixelKey;
        }
      }

      this._cache.matrixChannelKeys = matrixChKeys;
    }

    return this._cache.matrixChannelKeys;
  }

  /**
   * Replaces the specified variables in the specified string.
   * @param {!string} str The string which has to be modified.
   * @param {!Object.<string, string>} variables Each variable (without $) pointing to its value.
   * @return The modified string.
   */
  static parseTemplateString(str, variables) {
    for (const variable of (Object.keys(variables))) {
      const regex = new RegExp(`\\$${variable}`, 'g');
      str = str.replace(regex, variables[variable]);
    }
    return str;
  }
};