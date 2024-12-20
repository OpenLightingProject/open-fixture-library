import cacheResult from '../cache-result.js';
/** @ignore @typedef {import('./AbstractChannel.js').default} AbstractChannel */
/** @ignore @typedef {import('./Fixture.js').default} Fixture */
import Physical from './Physical.js';
import SwitchingChannel from './SwitchingChannel.js';
import TemplateChannel from './TemplateChannel.js';

/**
 * A fixture's configuration that enables a fixed set of channels and channel order.
 */
class Mode {
  /**
   * Creates a new Mode instance
   * @param {object} jsonObject The mode object from the fixture's JSON data.
   * @param {Fixture} fixture The fixture this mode is associated to.
   */
  constructor(jsonObject, fixture) {
    this._jsonObject = jsonObject;
    this._fixture = fixture;
  }

  /**
   * @returns {object} The JSON data representing this mode. It's a fragment of a fixture's JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {Fixture} The fixture this mode belongs to.
   */
  get fixture() {
    return this._fixture;
  }

  /**
   * @returns {string} The mode's name from the JSON data.
   */
  get name() {
    return this._jsonObject.name; // required
  }

  /**
   * @returns {string} A shorter mode name from the JSON data. Defaults to the normal name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  /**
   * @returns {boolean} Whether this mode has a short name set in the JSON data.
   */
  get hasShortName() {
    return `shortName` in this._jsonObject;
  }

  /**
   * @returns {number | null} The index used in the RDM protocol to reference this mode. Defaults to null.
   */
  get rdmPersonalityIndex() {
    return this._jsonObject.rdmPersonalityIndex || null;
  }

  /**
   * @returns {Physical | null} Extend the fixture's physical data with this physical data object when this mode is activated. Defaults to null.
   */
  get physicalOverride() {
    if (`physical` in this._jsonObject) {
      return cacheResult(this, `physicalOverride`, new Physical(this._jsonObject.physical));
    }

    return cacheResult(this, `physicalOverride`, null);
  }

  /**
   * @returns {Physical | null} Fixture's physical with mode's physical override (if present) applied on. Null if neither fixture nor mode define physical data.
   */
  get physical() {
    if (this.fixture.physical === null) {
      return cacheResult(this, `physical`, this.physicalOverride);
    }

    if (this.physicalOverride === null) {
      return cacheResult(this, `physical`, this.fixture.physical);
    }

    const fixturePhysical = this.fixture.physical.jsonObject;
    const physicalOverride = this._jsonObject.physical;
    const physicalData = { ...fixturePhysical, ...physicalOverride };

    for (const property of [`bulb`, `lens`, `matrixPixels`]) {
      if (property in physicalData) {
        physicalData[property] = {
          ...fixturePhysical[property],
          ...physicalOverride[property],
        };
      }
    }

    return cacheResult(this, `physical`, new Physical(physicalData));
  }

  /**
   * @returns {string[]} The mode's channel keys. The count and position equals to actual DMX channel count and position.
   */
  get channelKeys() {
    const channelKeys = this._jsonObject.channels.flatMap(rawReference => {
      if (rawReference !== null && rawReference.insert === `matrixChannels`) {
        // channel insert block
        return this._getMatrixChannelKeysFromInsertBlock(rawReference);
      }

      // normal channel key
      return rawReference;
    });
    return cacheResult(this, `channelKeys`, channelKeys);
  }

  /**
   * @returns {number} The number of null channels used in this mode.
   */
  get nullChannelCount() {
    return this.channelKeys.filter(channelKey => channelKey === null).length;
  }

  /**
   * Resolves the matrix channel insert block into a list of channel keys
   * @private
   * @param {object} channelInsert The JSON channel insert block
   * @returns {string[]} The resolved channel keys
   */
  _getMatrixChannelKeysFromInsertBlock(channelInsert) {
    const pixelKeys = this._getRepeatForPixelKeys(channelInsert.repeatFor);

    const channelKeys = [];
    if (channelInsert.channelOrder === `perPixel`) {
      for (const pixelKey of pixelKeys) {
        for (const templateChannelKey of channelInsert.templateChannels) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey,
          }));
        }
      }
    }
    else if (channelInsert.channelOrder === `perChannel`) {
      for (const templateChannelKey of channelInsert.templateChannels) {
        for (const pixelKey of pixelKeys) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey,
          }));
        }
      }
    }

    return channelKeys;
  }

  /**
   * Resolves `repeatFor` keywords into a list of pixel (group) keys or just returns the given pixel (group) key array.
   * @private
   * @param {string | string[]} repeatFor A matrix channel insert's repeatFor property.
   * @returns {string[]} The properly ordered list of pixel (group) keys.
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
   * @returns {AbstractChannel[]} The mode's channels. The count and position equals to actual DMX channel count and position.
   */
  get channels() {
    let nullChannelsFound = 0;
    const channels = this.channelKeys.map(channelKey => {
      if (channelKey === null) {
        nullChannelsFound++;
        return this.fixture.nullChannels[nullChannelsFound - 1];
      }
      return this.fixture.getChannelByKey(channelKey);
    });

    return cacheResult(this, `channels`, channels);
  }

  /**
   * @param {string} channelKey The key of the channel to get the index for.
   * @param {SwitchingChannelBehavior} [switchingChannelBehavior='all'] Controls how switching channels are counted, see {@link SwitchingChannel#usesChannelKey} for possible values.
   * @returns {number} The index of the given channel in this mode or -1 if not found.
   */
  getChannelIndex(channelKey, switchingChannelBehavior = `all`) {
    return this.channels.findIndex(channel => {
      if (channel === null) {
        return false;
      }

      if (channel instanceof SwitchingChannel) {
        return channel.usesChannelKey(channelKey, switchingChannelBehavior);
      }

      return channel.key === channelKey;
    });
  }
}

export default Mode;
