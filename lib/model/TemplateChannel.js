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
};