const Physical = require(`./Physical.js`);
const SwitchingChannel = require(`./SwitchingChannel.js`);
const TemplateChannel = require(`./TemplateChannel.js`);

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
    return `shortName` in this._jsonObject;
  }

  get rdmPersonalityIndex() {
    return this._jsonObject.rdmPersonalityIndex || null;
  }

  get physicalOverride() {
    if (!(`physicalOverride` in this._cache)) {
      this._cache.physicalOverride = `physical` in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }
    return this._cache.physicalOverride;
  }

  // fixture's physical with mode's physical override applied on
  get physical() {
    if (!(`physical` in this._cache)) {
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

        for (const property of [`bulb`, `lens`, `focus`, `matrixPixels`]) {
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
    if (!(`channelKeys` in this._cache)) {
      let chKeys = [];

      for (const rawReference of this._jsonObject.channels) {
        if (rawReference !== null && rawReference.insert === `matrixChannels`) {
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
    const pixelKeys = this._parseRepeatFor(channelInsert.repeatFor);

    const channelKeys = [];
    if (channelInsert.channelOrder === `perPixel`) {
      for (const pixelKey of pixelKeys) {
        for (const templateChannelKey of channelInsert.templateChannels) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey: pixelKey
          }));
        }
      }
    }
    else if (channelInsert.channelOrder === `perChannel`) {
      for (const templateChannelKey of channelInsert.templateChannels) {
        for (const pixelKey of pixelKeys) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey: pixelKey
          }));
        }
      }
    }

    return channelKeys;
  }

  /**
   * Resolves repeatFor keywords into a list of pixel (group) keys or just returns the given pixel (group) key array.
   * @param {string|Array.<string>} repeatFor A matrix channel insert's repeatFor property.
   * @returns {!Array.<string>} The properly ordered list of pixel (group) keys.
   */
  _parseRepeatFor(repeatFor) {
    if (Array.isArray(repeatFor)) {
      // custom pixel key list
      return repeatFor;
    }

    const matrix = this.fixture.matrix;

    if (repeatFor === `eachPixelGroup`) {
      return matrix.pixelGroupKeys;
    }

    if (repeatFor === `eachPixelABC`) {
      return matrix.pixelKeys;
    }

    // eachPixelXYZ, eachPixelZYX, ...
    const orderByAxes = repeatFor.replace(`eachPixel`, ``).split(``); // eachPixelYXZ -> ['Y', 'X', 'Z']
    const [firstPosIndex, secondPosIndex, thirdPosIndex] = orderByAxes.map(
      axis => ({X: 0, Y: 1, Z: 2}[axis])
    ); // ['Y', 'X', 'Z'] -> [1, 0, 2]

    return matrix.pixelKeys.sort((keyA, keyB) => {
      const [posA, posB] = [matrix.pixelKeyPositions[keyA], matrix.pixelKeyPositions[keyB]];

      if (posA[thirdPosIndex] !== posB[thirdPosIndex]) {
        return posA[thirdPosIndex] - posB[thirdPosIndex];
      }
      if (posA[secondPosIndex] !== posB[secondPosIndex]) {
        return posA[secondPosIndex] - posB[secondPosIndex];
      }
      return posA[firstPosIndex] - posB[firstPosIndex];
    });
  }

  /**
   * @returns {!Array.<MatrixChannelReference>} References to all matrix channels that are used in this mode (identified by templateKey / pixelKey pair).
   */
  get matrixChannelReferences() {
    if (!(`matrixChannelReferences` in this._cache)) {
      let allReferences = [];

      for (const chKey of this.channelKeys) {
        const channelReferences = this._getMatrixChannelReferences(chKey);
        if (channelReferences.length > 0) {
          // this is a matrix channel
          allReferences = allReferences.concat(channelReferences);
        }
        else {
          // this is not a matrix channel, but it may be a switching channel that switches to a matrix channel
          const switchingChannel = this.fixture.getSwitchingChannelByKey(chKey);
          if (switchingChannel !== null) {
            for (const switchToChKey of switchingChannel.switchToChannelKeys) {
              allReferences = allReferences.concat(this._getMatrixChannelReferences(switchToChKey));
            }
          }
        }
      }

      this._cache.matrixChannelReferences = allReferences;
    }

    return this._cache.matrixChannelReferences;
  }

  /**
   * Tests all template channels if they can create chKey.
   * @param {!string} chKey The key of the channel to test
   * @returns {!Array.<MatrixChannelReference>} References for each templateKey / pixelKey pair needed to create chKey. Empty if the channel key can't be created by any TemplateChannel.
   */
  _getMatrixChannelReferences(chKey) {
    for (const templateChannel of this.fixture.templateChannels) {
      const channelReferences = templateChannel.getMatrixChannelReferences(chKey);
      if (channelReferences.length > 0) {
        return channelReferences;
      }
    }
    return [];
  }

  /**
   * @returns {!Array.<AbstractChannel, MatrixChannel>} The mode's channels. The count and position equals the actual DMX channel count and position.
   */
  get channels() {
    if (!(`channels` in this._cache)) {
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
  getChannelIndex(channel, switchingChannelBehaviour = `all`) {
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
