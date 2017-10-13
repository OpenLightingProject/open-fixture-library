const Physical = require('./Physical.js');
const SwitchingChannel = require('./SwitchingChannel.js');

module.exports = class Mode {
  constructor(jsonObject, fixture) {
    this.jsonObject = jsonObject; // calls the setter
    this.fixture = fixture; // also calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @return {!Object} The JSON data representing this mode. It's a fragment of a fixture's JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  set fixture(fixture) {
    this._fixture = fixture;
    this._cache = {};
  }

  get fixture() {
    return this._fixture;
  }

  get name() {
    return this._jsonObject.name; // required
  }

  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  get hasShortName() {
    return 'shortName' in this._jsonObject;
  }

  get rdmPersonalityIndex() {
    return this._jsonObject.rdmPersonalityIndex || null;
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
      if (this.fixture.physical === null) {
        this._cache.physical = this.physicalOverride;
      }
      else if (this.physicalOverride === null) {
        this._cache.physical = this.fixture.physical;
      }
      else {
        const fixturePhysical = this.fixture.physical.jsonObject;
        const physicalOverride = this._jsonObject.physical;
        let physicalData = Object.assign({}, fixturePhysical, physicalOverride);

        for (const property of ['bulb', 'lens', 'focus']) {
          if (property in physicalData) {
            physicalData[property] = Object.assign({}, fixturePhysical[property], physicalOverride[property]);
          }
        }

        this._cache.physical = new Physical(physicalData);
      }
    }

    return this._cache.physical;
  }

  get nullChannelCount() {
    return this._jsonObject.channels.filter(ch => ch === null).length;
  }

  get channelKeys() {
    if (!('channelKeys' in this._cache)) {
      let nullCount = -1;
      this._cache.channelKeys = this._jsonObject.channels.map(ch => {
        if (ch === null) {
          nullCount++;
          return this.fixture.nullChannelKeys[nullCount];
        }
        return ch;
      });
    }

    return this._cache.channelKeys;
  }

  get channels() {
    if (!('channels' in this._cache)) {
      this._cache.channels = this.channelKeys.map(key => this.fixture.getChannelByKey(key));
    }

    return this._cache.channels;
  }


  /**
   * @param {!string|!Channel} channel Either a channel key or a Channel object.
   * @param {!SwitchingChannelBehavior} [switchingChannelBehaviour='all'] Controls how switching channels are counted, @see SwitchingChannel.usesChannelKey for possible values.
   * @return {number} The index of the given channel in this mode or -1 if not found.
  */
  getChannelIndex(channel, switchingChannelBehaviour='all') {
    const chKey = channel.key || channel;

    return this.channels.findIndex(ch => {
      if (ch === null) {
        return false;
      }

      if (ch instanceof SwitchingChannel) {
        return ch.usesChannelKey(chKey);
      }

      return ch.key === chKey;
    });
  }
};
