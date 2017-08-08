module.exports = class TemplateChannel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {!string} key The templateChannel's key with the required variables.
   * @param {!Object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases can include variables.
   * @param {!Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    this._key = key;
    this.jsonObject = jsonObject; // calls the setter
    this._fixture = fixture;
  }

  /**
   * @return {!string} The templateChannel's key with the required variables.
   */
  get key() {
    return this._key;
  }
  
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get jsonObject() {
    return this._jsonObject;
  }
  
  get fixture() {
    return this._fixture;
  }
    
  get name() {
    return this._jsonObject.name || this._key;
  }

  /**
   * @return {!string[]} All fine template channel aliases with the required variables.
   */
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  /**
   * @return {!string[]} All fine template channel aliases with the required variables.
   */
  get switchingChannelAliases() {
    if (!('switchingChannelAliases' in this._cache)) {
      let aliases = [];
      if ('capabilities' in this._jsonObject) {
        if (this._jsonObject.capabilities.length > 0 && 'switchChannels' in this._jsonObject.capabilities[0]) {
          aliases = aliases.concat(Object.keys(this._jsonObject.capabilities[0].switchChannels));
        }
      }
      this._cache.switchingChannelAliases = aliases;
    }

    return this._cache.switchingChannelAliases;
  }

  /**
   * @return {!string[]} The channel key and all fine and switching channel aliases
   */
  get allChannelKeys() {
    if (!('allChannelKeys' in this._jsonObject)) {
      this._cache.allChannelKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases);
    }

    return this._cache.allChannelKeys;
  }

  /**
   * @return {!string[]} Each pixelKey/pixelGroupKey pointing to a resolved matrix channel key
   */
  get matrixChannelKeys() {
    if (!('matrixChannelKeys' in this._cache)) {
      let chKeys = [];

      const pixelKeys = Object.keys(this.fixture.matrix.pixelKeyPositions).concat(this.fixture.matrix.pixelGroupKeys);
      for (const pixelKey of pixelKeys) {
        chKeys = chKeys.concat(this.allChannelKeys.map(
          chKey => this.constructor.parseTemplateString(chKey, {pixelKey: pixelKey}))
        );
      }

      this._cache.matrixChannelKeys = chKeys;
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