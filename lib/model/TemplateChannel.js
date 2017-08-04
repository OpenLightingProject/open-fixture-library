module.exports = class TemplateChannel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {!string} key The templateChannel's key with all allowed variables.
   * @param {!Object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases can include variables.
   * @param {!Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    this._key = key;
    this.jsonObject = jsonObject; // calls the setter
    this._fixture = fixture;
  }

  /**
   * The templateChannel's key with all allowed variables.
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
};