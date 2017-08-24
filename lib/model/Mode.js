const Physical = require('./Physical.js');
const TemplateChannel = require('./TemplateChannel.js');
const SwitchingChannel = require('./SwitchingChannel.js');
const ChannelReference = require('./ChannelReference.js');

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

  /**
   * @return {!ChannelReference[]} The list of channels used in this mode. The count and position equals the actual DMX channel count and position.
   */
  get channelReferences() {
    if (!('channelReferences' in this._cache)) {
      let chRefs = [];

      for (const rawReference of this._jsonObject.channels) {
        // channel insert blocks
        if (typeof rawReference !== 'string' && rawReference !== null) {
          switch (rawReference.insert) {
            case 'matrixChannels':
              chRefs = chRefs.concat(ChannelReference.fromMatrixInsert(rawReference, this.fixture));
              break;
          }
        }
        // normal channel keys
        else {
          chRefs.push(ChannelReference.fromChannelKey(rawReference, this.fixture));
        }
      }

      this._cache.channelReferences = chRefs;
    }

    return this._cache.channelReferences;
  }
  
  /**
   * @return {!number} The amount of null channels used in this mode.
   */
  get nullChannelCount() {
    return this.channelReferences.filter(chRef => chRef.chKey === null).length;
  }

  /**
   * @return {!string[]} The mode's channel keys. The count and position equals the actual DMX channel count and position.
   */
  get channelKeys() {
    if (!('channelKeys' in this._cache)) {
      let nullCount = 0;
      this._cache.channelKeys = this.channelReferences.map(chRef => {
        if (chRef.chKey === null) {
          return this.fixture.nullChannelKeys[nullCount++];
        }
        return chRef.chKey;
      });
    }

    return this._cache.channelKeys;
  }

  /**
   * @return {!Object.<string, Set<string>>} Each used template channel key pointing to a Set of used pixelKeys/pixelGroupKeys.
   */
  get usedPixelKeys() {
    if (!('usedPixelKeys' in this._cache)) {
      let usedPixelKeys = {};

      for (const chRef of this.channelReferences) {
        this._addUsedPixelKey(usedPixelKeys, chRef);
      
        const switchingChannel = this.fixture.getSwitchingChannelByKey(chRef.chKey);
        if (switchingChannel !== null) {
          for (const chKey of switchingChannel.switchToChannelKeys) {
            this._addUsedPixelKey(usedPixelKeys, ChannelReference.fromChannelKey(chKey, this.fixture));
          }
        }
      }

      this._cache.usedPixelKeys = usedPixelKeys;
    }

    return this._cache.usedPixelKeys;
  }

  _addUsedPixelKey(usedPixelKeys, chRef) {
    if (chRef.isMatrixChannel) {
      if (!(chRef.templateKey in usedPixelKeys)) {
        usedPixelKeys[chRef.templateKey] = new Set();
      }
      usedPixelKeys[chRef.templateKey].add(chRef.pixelKey);
    }
  }

  /**
   * @return {!Array.<AbstractChannel, null>} The mode's channels. The count and position equals the actual DMX channel count and position. If a channel isn't found by its key, it is null.
   */
  get channels() {
    if (!('channels' in this._cache)) {
      this._cache.channels = this.channelKeys.map(chKey => this.fixture.getChannelByKey(chKey));
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
