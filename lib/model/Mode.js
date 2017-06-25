module.exports = class Mode {
  constructor(jsonObject, fixture) {
    this.jsonObject = jsonObject; // calls the setter
    this.fixture = fixture; // also calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  set fixture(fixture) {
    this._fixture = fixture;
    this._cache = {};
  }


  get name() {
    this._jsonObject.name; // required
  }

  get shortName() {
    this._jsonObject.shortName || this._jsonObject.name;
  }

  get physicalOverride() {
    if (!('physicalOverride' in this._cache)) {
      this._cache.physicalOverride = 'physical' in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }
    return this._cache.physicalOverride;
  }

  // fixture's physical with mode's phyiscal override applied on
  get physical() {
    if (!('physical' in this._cache)) {
      if (this._fixture.physical === null) {
        this._cache.physical = this.physicalOverride;
      }
      else if (this.physicalOverride === null) {
        this._cache.physical = this._fixture.physical;
      }
      else {
        this._cache.physical = new Physical(Object.assign({}, this._fixture.physical.jsonObject, this._jsonObject.physical));
      }
    }

    return this._cache.physical;
  }

  get channelKeys() {
    this._jsonObject.channels;
  }
};