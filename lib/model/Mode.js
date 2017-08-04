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
      let chKeys = [];
      
      for (const chReference of this._jsonObject.channels) {
        // null channels
        if (chReference === null) {
          nullCount++;
          chKeys.push(this.fixture.nullChannelKeys[nullCount]);
        }
        // channel insert blocks
        else if (typeof chReference !== 'string') {
          switch (chReference.insert) {
            case 'matrixChannels':
              chKeys = chKeys.concat(this._getMatrixChannelKeys(chReference));
              break;
          }
        }
        // normal channel keys
        else {
          chKeys.push(chReference);
        }
      }

      this._cache.channelKeys = chKeys;
    }

    return this._cache.channelKeys;
  }

  /**
   * Resolves the matrix channel reference and computes the channel keys for all specified pixels.
   * @param {!Object} chReference The matrix channel reference specified in the mode's json channel list.
   * @param {'matrixChannels'} chReference.insert Indicates that this is a matrix insert.
   * @param {'eachPixel'|'eachPixelGroup'|string[]} chReference.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
   * @param {'perPixel'|'perChannel'} chReference.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
   * @param {Array<string, null>} chReference.templateChannels The template channel keys (and aliases) or null channels to be repeated.
   */
  _getMatrixChannelKeys(chReference) {
    let pixelKeys = chReference.repeatFor;
    if (chReference.repeatFor === 'eachPixel') {
      pixelKeys = Object.keys(this.fixture.matrix.pixelKeyPositions);
    }
    else if (chReference.repeatFor === 'eachPixelGroup') {
      pixelKeys = this.fixture.matrix.pixelGroupKeys;
    }

    let channelKeys = [];
    if (chReference.channelOrder === 'perPixel') {
      for (const pixelKey of pixelKeys) {
        channelKeys = channelKeys.concat(chReference.templateChannels.map(
          templateChannelKey => templateChannelKey.replace('$pixelKey', pixelKey)
        ));
      }
    }
    else {
      for (const templateChannelKey of chReference.templateChannels) {
        channelKeys = channelKeys.concat(pixelKeys.map(
          pixelKey => templateChannelKey.replace('$pixelKey', pixelKey)
        ));
      }
    }

    return channelKeys;
  }

  get channels() {
    if (!('channels' in this._cache)) {
      this._cache.channels = this.channelKeys.map(key => this.fixture.getChannelByKey(key));
    }

    return this._cache.channels;
  }

  /*
    channel can be either a channel key or a Channel object
    switchingChannelBehaviour controls how switching channels are counted, see
        SwitchingChannel.containsKey for possible values
    returns the index or -1 if not found
  */
  getChannelIndex(channel, switchingChannelBehaviour = 'all') {
    const chKey = channel.key || channel;

    return this.channels.findIndex(ch => {
      if (ch === null) {
        return false;
      }

      if (ch instanceof SwitchingChannel) {
        return ch.containsChannelKey(chKey);
      }

      return ch.key === chKey;
    });
  }
};
