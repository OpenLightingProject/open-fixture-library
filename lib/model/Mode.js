const Physical = require('./Physical.js');
const SwitchingChannel = require('./SwitchingChannel.js');
const TemplateChannel = require('./TemplateChannel.js');

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
   * @returns {!object} The JSON data representing this mode. It's a fragment of a fixture's JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  set fixture(fixture) {
    this._fixture = fixture;
    this._cache = {};
  }

  /**
   * @returns {!Fixture} The fixture this mode belongs to.
   */
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
        const physicalData = Object.assign({}, fixturePhysical, physicalOverride);

        for (const property of ['bulb', 'lens', 'focus', 'matrixPixels']) {
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
   * @returns {!Array.<string>} The mode's channel keys. The count and position equals the actual DMX channel count and position.
   */
  get channelKeys() {
    if (!('channelKeys' in this._cache)) {
      let chKeys = [];

      for (const rawReference of this._jsonObject.channels) {
        if (rawReference !== null && rawReference.insert === 'matrixChannels') {
          // channel insert block
          chKeys = chKeys.concat(this._parseMatrixChannelInsert(rawReference));
        }
        else {
          // normal channel key
          chKeys.push(rawReference);
        }
      }

      this._cache.channelKeys = chKeys;
    }

    return this._cache.channelKeys;
  }

  /**
   * @returns {!number} The amount of null channels used in this mode.
   */
  get nullChannelCount() {
    return this.channelKeys.filter(chKey => chKey === null).length;
  }

  /**
   * Resolves the matrix channel insert block into a list of channel keys
   * @private
   * @param {!object} channelInsert The JSON channel insert block
   * @returns {!Array.<?string>} The resolved channel keys
   */
  _parseMatrixChannelInsert(channelInsert) {
    let pixelKeys;
    if (channelInsert.repeatFor === 'eachPixel') {
      pixelKeys = this.fixture.matrix.pixelKeys;
    }
    else if (channelInsert.repeatFor === 'eachPixelGroup') {
      pixelKeys = this.fixture.matrix.pixelGroupKeys;
    }
    else {
      pixelKeys = channelInsert.repeatFor;
    }

    const channelKeys = [];
    if (channelInsert.channelOrder === 'perPixel') {
      for (const pixelKey of pixelKeys) {
        for (const templateChannelKey of channelInsert.templateChannels) {
          channelKeys.push(TemplateChannel.parseTemplateString(templateChannelKey, {
            pixelKey: pixelKey
          }));
        }
      }
    }
    else {
      for (const templateChannelKey of channelInsert.templateChannels) {
        for (const pixelKey of pixelKeys) {
          channelKeys.push(TemplateChannel.parseTemplateString(templateChannelKey, {
            pixelKey: pixelKey
          }));
        }
      }
    }

    return channelKeys;
  }

  /**
   * @typedef {!Object.<string, Set<string>>} MatrixChannelReferences
   */

  /**
   * @returns {!MatrixChannelReferences} Each used template channel key pointing to a Set of used pixelKeys/pixelGroupKeys.
   */
  get matrixChannelReferences() {
    if (!('matrixChannelReferences' in this._cache)) {
      /** @type {!MatrixChannelReferences} */
      const matrixChannelReferences = {};

      for (const chKey of this.channelKeys) {
        // add chKey if it is a matrix channel
        this._addMatrixChannelReferenceByChKey(matrixChannelReferences, chKey);

        // also add switched channels if they are matrix channels
        const switchingChannel = this.fixture.getSwitchingChannelByKey(chKey);
        if (switchingChannel !== null) {
          for (const switchTo of switchingChannel.switchToChannelKeys) {
            this._addMatrixChannelReferenceByChKey(matrixChannelReferences, switchTo);
          }
        }
      }

      this._cache.matrixChannelReferences = matrixChannelReferences;
    }

    return this._cache.matrixChannelReferences;
  }

  /**
   * Checks if the given channel key can be created by a TemplateChannel. If so, add it to matrixChannelReferences.
   * @param {!MatrixChannelReferences} matrixChannelReferences The object to which the channel references are added.
   * @param {!string} chKey The key of the channel to add if it is a matrix channel
   */
  _addMatrixChannelReferenceByChKey(matrixChannelReferences, chKey) {
    for (const templateChannel of this.fixture.templateChannels) {
      if (templateChannel.matrixChannelKeys.has(chKey)) {
        this._addMatrixChannelReference(
          matrixChannelReferences,
          templateChannel.key,
          templateChannel.matrixChannelKeys.get(chKey)
        );
        return;
      }
    }
  }

  /**
   * Adds the given matrix channel to matrixChannelReferences
   * @param {!MatrixChannelReferences} matrixChannelReferences The object to which the channel references are added.
   * @param {!string} templateKey From which TemplateChannel the channel originates
   * @param {!string} pixelKey To which pixel (group) te channel belongs
   */
  _addMatrixChannelReference(matrixChannelReferences, templateKey, pixelKey) {
    if (!(templateKey in matrixChannelReferences)) {
      matrixChannelReferences[templateKey] = new Set();
    }
    matrixChannelReferences[templateKey].add(pixelKey);

    // also add switched template channels
    const templateChannel = this.fixture.getTemplateChannelByKey(templateKey);
    for (const switchTo of templateChannel.switchToChannelKeys) {
      this._addMatrixChannelReference(matrixChannelReferences, switchTo, pixelKey);
    }
  }

  /**
   * @returns {!Array.<AbstractChannel, null>} The mode's channels. The count and position equals the actual DMX channel count and position. If a channel isn't found by its key, it is null.
   */
  get channels() {
    if (!('channels' in this._cache)) {
      let nullChannelsFound = 0;
      this._cache.channels = this.channelKeys.map(chKey => {
        if (chKey === null) {
          nullChannelsFound++;
          return this.fixture.nullChannels[nullChannelsFound - 1];
        }
        return this.fixture.getChannelByKey(chKey);
      });
    }

    return this._cache.channels;
  }

  /**
   * @param {!string|!Channel} channel Either a channel key or a Channel object.
   * @param {!SwitchingChannelBehavior} [switchingChannelBehaviour='all'] Controls how switching channels are counted, @see SwitchingChannel.usesChannelKey for possible values.
   * @returns {number} The index of the given channel in this mode or -1 if not found.
  */
  getChannelIndex(channel, switchingChannelBehaviour = 'all') {
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
