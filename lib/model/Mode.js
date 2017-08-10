const Physical = require('./Physical.js');
const TemplateChannel = require('./TemplateChannel.js');
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
  
  /**
   * @return {!number} The amount of null channels used in this mode.
   */
  get nullChannelCount() {
    return this.channelKeys.filter(ch => ch === null).length;
  }

  /**
   * @return {!Array.<string, null>} The mode's channel keys. The count and position equals the actual DMX channel count and position.
   */
  get channelKeys() {
    if (!('channelKeys' in this._cache)) {
      let chKeys = [];

      for (const chReference of this._jsonObject.channels) {
        // channel insert blocks
        if (typeof chReference !== 'string' && chReference !== null) {
          switch (chReference.insert) {
            case 'matrixChannels':
              chKeys = chKeys.concat(this._getMatrixChannelInfos(chReference).map(chInfo => chInfo.key));
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
   * @typedef {!Object} MatrixChannelInfo
   * @property {?string} key The channel key, null for null channels.
   * @property {!string} pixelKey The pixelKey of this matrix channel.
   * @property {?string} templateChannelKey The TemplateChannel's key, if this channel was templated.
   */

  /**
   * Resolves the given matrix channel reference.
   * @param {!object} rawReference The matrix channel reference specified in the mode's json channel list.
   * @param {'matrixChannels'} rawReference.insert Indicates that this is a matrix insert.
   * @param {'eachPixel'|'eachPixelGroup'|string[]} rawReference.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
   * @param {'perPixel'|'perChannel'} rawReference.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
   * @param {!Array.<string, null>} rawReference.templateChannels The template channel keys (and aliases) or null channels to be repeated.
   * @return {!MatrixChannelData[]} Infos for all created matrix channels.
   */
  _getMatrixChannelInfos(rawReference) {
    let pixelKeys = rawReference.repeatFor;
    if (rawReference.repeatFor === 'eachPixel') {
      pixelKeys = Object.keys(this.fixture.matrix.pixelKeyPositions);
    }
    else if (rawReference.repeatFor === 'eachPixelGroup') {
      pixelKeys = this.fixture.matrix.pixelGroupKeys;
    }

    let channels = [];
    if (rawReference.channelOrder === 'perPixel') {
      // for each pixel
      for (const pixelKey of pixelKeys) {
        // add chReference for each templateChannel
        channels = channels.concat(rawReference.templateChannels.map(
          templateChannelKey => this._getMatrixChannelInfo(templateChannelKey, pixelKey)
        ));
      }
    }
    else {
      // for each templateChannel
      for (const templateChannelKey of rawReference.templateChannels) {
        // add chReference for each pixel
        channels = channels.concat(pixelKeys.map(
          pixelKey => this._getMatrixChannelInfo(templateChannelKey, pixelKey)
        ));
      }
    }

    return channels;
  }
  
  /**
   * @return {!MatrixChannelInfo} Info about the specified matrix channel.
   */
  _getMatrixChannelInfo(templateChannelKey, pixelKey) {
    return {
      key: templateChannelKey === null ? null : TemplateChannel.parseTemplateString(templateChannelKey, {pixelKey: pixelKey}),
      pixelKey: pixelKey,
      templateChannelKey: templateChannelKey
    };
  }

  /**
   * @param {!string} chKey The channel key to get data from.
   * @return {?MatrixChannelInfo} The data of the found matrix channel, null if not found.
   */
  _getMatrixChannelInfoByChKey(chKey) {
    for (const templateChannel of this.fixture.templateChannels) {
      if (chKey in templateChannel.matrixChannelKeys) {
        return this._getMatrixChannelInfo(templateChannel.key, templateChannel.matrixChannelKeys[chKey]);
      }
    }
    return null;
  }

  /**
   * Each used template channel key pointing to a Set of used pixelKeys/pixelGroupKeys
   * @typedef {!Object.<string, Set<string>>}} UsedPixelKeys
   */

  /**
   * @return {!UsedTemplateChannels} Which template channels are used in this mode with which pixels.
   */
  get usedPixelKeys() {
    if (!('usedPixelKeys' in this._cache)) {
      /** @type {!UsedPixelKeys} */
      let usedPixelKeys = {};

      for (const chReference of this._jsonObject.channels) {
        // channel insert blocks
        if (typeof chReference !== 'string' && chReference !== null) {
          switch (chReference.insert) {
            case 'matrixChannels':
              const matrixChannelInfos = this._getMatrixChannelInfos(chReference);
              for (const channelInfo of matrixChannelInfos) {
                this._findUsedPixelKeys(usedPixelKeys, channelInfo);
              }
              break;
          }
        }
        // normal channel keys
        else {
          this._findUsedPixelKeys(usedPixelKeys, this._getMatrixChannelInfoByChKey(chReference));
        }
      }

      this._cache.usedPixelKeys = usedPixelKeys;
    }

    return this._cache.usedPixelKeys;
  }

  /**
   * Fínd the used pixelKeys for each template channel and add them to the template channels' Set
   * @param {!UsedPixelKeys} usedPixelKeys
   * @param {?MatrixChannelInfo} matrixChannelInfo
   */
  _findUsedPixelKeys(usedPixelKeys, matrixChannelInfo) {
    if (matrixChannelInfo === null) {
      return;
    }

    if (matrixChannelInfo.templateChannelKey !== null) {
      this._addUsedPixelKey(usedPixelKeys, matrixChannelInfo.templateChannelKey, matrixChannelInfo.pixelKey);
    }
  }

  /**
   * Add the specfied pixel to the template channels' Set. Create the Set first if needed.
   * @param {!UsedPixelKeys} usedPixelKeys 
   * @param {!string} templateChannelKey 
   * @param {!string} pixelKey 
   */
  _addUsedPixelKey(usedPixelKeys, templateChannelKey, pixelKey) {
    if (!(templateChannelKey in usedPixelKeys)) {
      usedPixelKeys[templateChannelKey] = new Set();
    }
    usedPixelKeys[templateChannelKey].add(pixelKey);
  }

  /**
   * @return {!Array.<AbstractChannel, null>} The mode's channels. The count and position equals the actual DMX channel count and position. If a channel isn't found by its key, it is null.
   */
  get channels() {
    if (!('channels' in this._cache)) {
      let nullCount = 0;
      this._cache.channels = this.channelKeys.map(chKey => {
        if (chKey === null) {
          return this.fixture.nullChannels[nullCount++];
        }
        return this.fixture.getChannelByKey(chKey);
      });
    }

    return this._cache.channels;
  }

  /**
   * channel can be either a channel key or a Channel object
   * switchingChannelBehaviour controls how switching channels are counted, @see SwitchingChannel.containsKey for possible values
   * @return {number} the index or -1 if not found
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
