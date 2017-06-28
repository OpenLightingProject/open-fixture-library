const path = require('path');

const Physical = require(path.join(__dirname, 'Physical.js'));

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
    return this._jsonObject.name; // required
  }

  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  get physicalOverride() {
    if (!('physicalOverride' in this._cache)) {
      this._cache.physicalOverride = 'physical' in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }
    return this._cache.physicalOverride;
  }

  // fixture's physical with mode's physical override applied on
  get physical() {
    if (!('physical' in this._cache)) {
      if (this._fixture.physical === null) {
        this._cache.physical = this.physicalOverride;
      }
      else if (this.physicalOverride === null) {
        this._cache.physical = this._fixture.physical;
      }
      else {
        const fixturePhysical = this._fixture.physical.jsonObject;
        const physicalOverride = this._jsonObject.physical;
        let physicalData = Object.assign({}, fixturePhysical, physicalOverride);

        if (this.physicalOverride.hasBulb) {
          physicalData.bulb = Object.assign({}, fixturePhysical.bulb, physicalOverride.bulb);
        }
        if (this.physicalOverride.hasLens) {
          physicalData.lens = Object.assign({}, fixturePhysical.lens, physicalOverride.lens);
        }
        if (this.physicalOverride.hasFocus) {
          physicalData.focus = Object.assign({}, fixturePhysical.focus, physicalOverride.focus);
        }

        this._cache.physical = new Physical(physicalData);
      }
    }

    return this._cache.physical;
  }

  get channelKeys() {
    return this._jsonObject.channels;
  }
};