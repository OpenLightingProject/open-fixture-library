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

  /*
    switchingChannelBehaviour controls how switching channels are counted:
      'all' (default) includes the switching channel key and all switched channels
      'keyOnly' includes only the switching channel key
      'defaultOnly' includes only the default channel key
      'switchedOnly' includes all switched to channel keys
  */
  getChannelIndex(chKey, switchingChannelBehaviour = 'all') {
    return this.channels.findIndex(channel => {
      if (channel instanceof SwitchingChannel) {
        switch (switchingChannelBehaviour) {
          case 'keyOnly':
            return channel.key === chKey;

          case 'defaultOnly':
            return channel.defaultChannel.key === chKey;

          case 'switchedOnly':
            return channel.switchToChannels.includes(chKey);

          case 'all':
            return channel.switchToChannels.includes(chKey) || channel.key === chKey;
        }
      }

      return channel.key === chKey;
    });
  }
};