import Physical from './Physical.mjs';
import SwitchingChannel from './SwitchingChannel.mjs';
import TemplateChannel from './TemplateChannel.mjs';

/**
 * A fixture's configuration that enables a fixed set of channels and channel order.
 */
class Mode {
  /**
   * Creates a new Mode instance
   * @param {!object} jsonObject The mode object from the fixture's JSON data.
   * @param {!Fixture} fixture The fixture this mode is associated to.
   */
  constructor(jsonObject, fixture) {
    this.jsonObject = jsonObject; // calls the setter
    this.fixture = fixture; // also calls the setter
  }

  /**
   * Sets a new JSON object and resets the cache.
   * @param {!object} jsonObject The mode's new JSON object.
   */
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

  /**
   * Sets a new fixture and resets the cache.
   * @param {!Fixture} fixture The new fixture.
   */
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

  /**
   * @returns {!string} The mode's name from the JSON data.
   */
  get name() {
    return this._jsonObject.name; // required
  }

  /**
   * @returns {!string} A shorter mode name from the JSON data. Defaults to the normal name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  /**
   * @returns {!boolean} Whether this mode has a short name set in the JSON data.
   */
  get hasShortName() {
    return `shortName` in this._jsonObject;
  }

  /**
   * @returns {?number} The index used in the RDM protocol to reference this mode. Defaults to null.
   */
  get rdmPersonalityIndex() {
    return this._jsonObject.rdmPersonalityIndex || null;
  }

  /**
   * @returns {?Physical} Override or extend the fixture's physical data with this physical data when this mode is activated. Defaults to null.
   */
  get physicalOverride() {
    if (!(`physicalOverride` in this._cache)) {
      this._cache.physicalOverride = `physical` in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }
    return this._cache.physicalOverride;
  }

  /**
   * @returns {?Physical} Fixture's physical with mode's physical override (if present) applied on. Null if neither fixture nor mode define physical data.
   */
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
          chKeys = chKeys.concat(this._getMatrixChannelKeysFromInsertBlock(rawReference));
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
  _getMatrixChannelKeysFromInsertBlock(channelInsert) {
    const pixelKeys = this._getRepeatForPixelKeys(channelInsert.repeatFor);

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
   * @private
   * @param {string|Array.<string>} repeatFor A matrix channel insert's repeatFor property.
   * @returns {!Array.<string>} The properly ordered list of pixel (group) keys.
   */
  _getRepeatForPixelKeys(repeatFor) {
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
    return matrix.getPixelKeysByOrder(orderByAxes[0], orderByAxes[1], orderByAxes[2]);
  }

  /**
   * @returns {!Array.<AbstractChannel>} The mode's channels. The count and position equals the actual DMX channel count and position.
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
   * @param {!SwitchingChannelBehavior} [switchingChannelBehaviour='all'] Controls how switching channels are counted, see {@link SwitchingChannel#usesChannelKey} for possible values.
   * @returns {number} The index of the given channel in this mode or -1 if not found.
  */
  getChannelIndex(channel, switchingChannelBehaviour = `all`) {
    const chKey = channel.key || channel;

    return this.channels.findIndex(ch => {
      if (ch === null) {
        return false;
      }

      if (ch instanceof SwitchingChannel) {
        return ch.usesChannelKey(chKey, switchingChannelBehaviour);
      }

      return ch.key === chKey;
    });
  }
}

export default Mode;
