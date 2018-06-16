import Channel from './Channel.mjs';
import Manufacturer from './Manufacturer.mjs';
import Matrix from './Matrix.mjs';
import Meta from './Meta.mjs';
import Mode from './Mode.mjs';
import NullChannel from './NullChannel.mjs';
import Physical from './Physical.mjs';
import TemplateChannel from './TemplateChannel.mjs';

import packageJson from '../../package.json';


/*
  benchmark results for accessing fix.physical (10,000,000 iterations):
  - without cache: ~1.9s
  - with cache: ~0.52s (nearly 4 times faster!)
  => that proves why caching, even for these small objects, is useful

  Code:
    const benchmarkIterations = 10000000;
    function benchmark() {
      const t0 = process.hrtime();

      for (let i = 0; i < benchmarkIterations; i++) {
        fix1.physical;
      }

      const deltaT = process.hrtime(t0);

      console.log(deltaT);
    }
*/


/** A physical DMX device */
export default class Fixture {
  /**
   * Create a new Fixture instance.
   * @param {!string|!Manufacturer} man Either the fixture's manufacturer's key or a Manufacturer instance.
   * @param {!string} key The fixture's unique key. Equals the filename without '.json'.
   * @param {!object} jsonObject The fixture's parsed JSON data.
   */
  constructor(man, key, jsonObject) {
    this.manufacturer = man; // calls the setter
    this._key = key;
    this.jsonObject = jsonObject; // also calls the setter
  }

  /**
   * @param {!string|!Manufacturer} newMan Either the fixture's manufacturer's key or a Manufacturer instance.
   */
  set manufacturer(newMan) {
    if (newMan instanceof Manufacturer) {
      this._manufacturer = newMan;
    }
    else {
      this._manufacturer = new Manufacturer(newMan);
    }
  }

  /**
   * @returns {!Manufacturer} The fixture's manufacturer.
   */
  get manufacturer() {
    return this._manufacturer;
  }

  /**
   * @param {!string} key The fixture's unique key. Equals the filename without '.json'.
   */
  get key() {
    return this._key;
  }

  /**
   * @param {!object} jsonObject The fixture's parsed JSON data.
   */
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @returns {!object} The fixture's parsed JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {!string} An url pointing to the fixture's page on the Open Fixture Library website.
   */
  get url() {
    return `${packageJson.homepage}${this.manufacturer.key}/${this.key}`;
  }

  /**
   * @returns {!string} The fixture's product name.
   */
  get name() {
    return this._jsonObject.name; // required
  }

  /**
   * @returns {!boolean} Whether the fixture has a short name defined.
   */
  get hasShortName() {
    return `shortName` in this._jsonObject;
  }

  /**
   * @returns {!string} A globally unique and as short as possible product name, defaults to name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  /**
   * @returns {!Array.<string>} The fixture's categories with the most applicable one first.
   */
  get categories() {
    return this._jsonObject.categories; // required
  }

  /**
   * @returns {!string} The fixture's most applicable category. Equals the first item of categories.
   */
  get mainCategory() {
    return this.categories[0];
  }

  /**
   * @returns {!Meta} A Meta instance providing information like author or create date.
   */
  get meta() {
    if (!(`meta` in this._cache)) {
      this._cache.meta = new Meta(this._jsonObject.meta);
    }

    return this._cache.meta;
  }

  /**
   * @returns {!boolean} Whether the fixture has a comment defined.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {!boolean} A comment about the fixture (often a note about a incorrectness in the manual). Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {?string} A string describing the help that is needed for this fixture, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }

  /**
   * @returns {!boolean} True if help is needed in this fixture (maybe in a capability), false otherwise.
   */
  get isHelpWanted() {
    if (!(`isHelpWanted` in this._cache)) {
      this._cache.isHelpWanted = this.helpWanted !== null || this.capabilities.some(
        cap => cap.helpWanted !== null
      );
    }

    return this._cache.isHelpWanted;
  }

  /**
   * @returns {?string} An url to an online version of the fixture's manual. Used as reference for all the information included in this fixture. Defaults to null.
   */
  get manualURL() {
    return this._jsonObject.manualURL || null;
  }

  /**
   * @returns {?object} Information about the RDM functionality of this fixture. Defaults to null.
   * @property {!number} modelId The RDM model/product id of the fixture, given in decimal format.
   * @property {?string} softwareVersion The software version used as reference in this fixture definition.
   */
  get rdm() {
    return this._jsonObject.rdm || null;
  }

  /**
   * @returns {?Physical} The general physical information for the fixture, may be overriden by modes.
   */
  get physical() {
    if (!(`physical` in this._cache)) {
      this._cache.physical = `physical` in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }

    return this._cache.physical;
  }

  /**
   * @returns {?Matrix} The matrix information for this fixture.
   */
  get matrix() {
    if (!(`matrix` in this._cache)) {
      this._cache.matrix = `matrix` in this._jsonObject ? new Matrix(this._jsonObject.matrix) : null;
    }

    return this._cache.matrix;
  }

  /**
   * @returns {!object<string, string>} Channel keys from allChannelKeys pointing to unique versions of their channel names.
   */
  get uniqueChannelNames() {
    if (!(`uniqueChannelNames` in this._cache)) {
      this._cache.uniqueChannelNames = {};

      const names = this.allChannels.map(ch => ch.name || ch.wrappedChannel.name);

      for (let i = 0; i < names.length; i++) {
        const originalName = names[i];

        // make unique by appending ' 2', ' 3', ...
        let duplicates = 1;
        while (names.indexOf(names[i]) !== i) {
          duplicates++;
          names[i] = `${originalName} ${duplicates}`;
        }

        // save unique name
        this._cache.uniqueChannelNames[this.allChannelKeys[i]] = names[i];
      }
    }

    return this._cache.uniqueChannelNames;
  }

  /**
   * @returns {!Array.<string>} Available channels' keys, ordered by appearance.
   */
  get availableChannelKeys() {
    return Object.keys(this._jsonObject.availableChannels || {});
  }

  /**
   * @returns {!Array.<Channel>} Available channels, ordered by appearance.
   */
  get availableChannels() {
    if (!(`availableChannels` in this._cache)) {
      this._cache.availableChannels = this.availableChannelKeys.map(
        key => new Channel(key, this._jsonObject.availableChannels[key], this)
      );
    }

    return this._cache.availableChannels;
  }

  /**
   * @param {!string} key The available channel's key.
   * @returns {?Channel} The found channel, null if not found.
   */
  getAvailableChannelByKey(key) {
    if (!(`availableChannelsByKey` in this._cache)) {
      this._cache.availableChannelsByKey = {};

      for (const channel of this.availableChannels) {
        this._cache.availableChannelsByKey[channel.key] = channel;
      }
    }

    return this._cache.availableChannelsByKey[key] || null;
  }

  /**
   * @returns {!Array.<string>} All availableChannels' fine channel aliases, ordered by appearance.
   */
  get fineChannelAliases() {
    if (!(`fineChannelAliases` in this._cache)) {
      this._cache.fineChannelAliases = concatArrayProperty(this.availableChannels, `fineChannelAliases`);
    }

    return this._cache.fineChannelAliases;
  }

  /**
   * @returns {!Array.<FineChannel>} All availableChannels' fine channels, ordered by appearance.
   */
  get fineChannels() {
    if (!(`fineChannels` in this._cache)) {
      this._cache.fineChannels = concatArrayProperty(this.availableChannels, `fineChannels`);
    }

    return this._cache.fineChannels;
  }

  /**
   * @returns {!Array.<string>} All availableChannels' switching channel aliases, ordered by appearance.
   */
  get switchingChannelAliases() {
    if (!(`switchingChannelAliases` in this._cache)) {
      this._cache.switchingChannelAliases = concatArrayProperty(this.availableChannels, `switchingChannelAliases`);
    }

    return this._cache.switchingChannelAliases;
  }

  /**
   * @returns {!Array.<SwitchingChannel>} All availableChannels' switching channels, ordered by appearance.
   */
  get switchingChannels() {
    if (!(`switchingChannels` in this._cache)) {
      this._cache.switchingChannels = concatArrayProperty(this.availableChannels, `switchingChannels`);
    }

    return this._cache.switchingChannels;
  }

  /**
   * @param {!string} key The switching channel's alias / key.
   * @returns {?SwitchingChannel} The found channel, null if not found.
   */
  getSwitchingChannelByKey(key) {
    if (!(`switchingChannelsByKey` in this._cache)) {
      this._cache.switchingChannelsByKey = {};

      for (const channel of this.switchingChannels) {
        this._cache.switchingChannelsByKey[channel.key] = channel;
      }
    }

    return this._cache.switchingChannelsByKey[key] || null;
  }

  /**
   * Template channels are used to automatically generate channels (currently only matrix channels).
   * @returns {!Array.<string>} All template channel keys, ordered by appearance.
   */
  get templateChannelKeys() {
    return Object.keys(this._jsonObject.templateChannels || {});
  }

  /**
   * Template channels are used to automatically generate channels (currently only matrix channels).
   * @returns {!Array.<TemplateChannel>} TemplateChannel instances for all template channels, ordered by appearance.
   */
  get templateChannels() {
    if (!(`templateChannels` in this._cache)) {
      this._cache.templateChannels = this.templateChannelKeys.map(
        key => new TemplateChannel(key, this._jsonObject.templateChannels[key], this)
      );
    }

    return this._cache.templateChannels;
  }

  /**
   * Searches the template channel with the given key. Fine and switching template channel keys can't be found.
   * @param {!string} chKey The template channel's key
   * @returns {?TemplateChannel} The corresponding template channel.
   */
  getTemplateChannelByKey(chKey) {
    if (!(`templateChannelByKey` in this._cache)) {
      this._cache.templateChannelByKey = {};

      for (const channel of this.templateChannels) {
        this._cache.templateChannelByKey[channel.key] = channel;
      }
    }

    return this._cache.templateChannelByKey[chKey] || null;
  }

  /**
   * @returns {!Array.<MatrixChannelReference>} References to all matrix channels (identified by a templateKey / pixelKey pair) that are used in any mode.
   */
  get matrixChannelReferences() {
    if (!(`matrixChannelReferences` in this._cache)) {
      const refs = [];

      // concat all modes' matrixChannelReferences without duplicates
      for (const mode of this.modes) {
        for (const modeRef of mode.matrixChannelReferences) {
          const isDuplicate = refs.some(ref => modeRef.equals(ref));
          if (!isDuplicate) {
            refs.push(modeRef);
          }
        }
      }

      this._cache.matrixChannelReferences = refs;
    }

    return this._cache.matrixChannelReferences;
  }

  /**
   * @returns {!Array.<string>} Keys of all matrix channels.
   */
  get matrixChannelKeys() {
    if (!(`matrixChannelKeys` in this._cache)) {
      this._cache.matrixChannelKeys = this.matrixChannels.map(ch => ch.key);
    }

    return this._cache.matrixChannelKeys;
  }

  /**
   * Creates all needed MatrixChannels from the templateKey / pixelKey pairs from Fixture.matrixChannelReferences.
   * @returns {!Array.<MatrixChannel>} All matrix channels.
   */
  get matrixChannels() {
    if (this.matrix === null) {
      return [];
    }

    if (!(`matrixChannels` in this._cache)) {
      let channels = [];

      for (const matrixChannelReference of this.matrixChannelReferences) {
        const templateChannel = this.getTemplateChannelByKey(matrixChannelReference.templateKey);

        // template fine or switching channels are included in matrixChannelReferences but do not need to
        // be created manually, since they are created together with their defining channel
        if (templateChannel !== null) {
          channels = channels.concat(templateChannel.createMatrixChannels(matrixChannelReference.pixelKey));
        }
      }

      this._cache.matrixChannels = channels;
    }

    return this._cache.matrixChannels;
  }

  /**
   * @returns {!Array.<Channel>} Keys of available channels and unwrapped matrix channels
   */
  get normalizedChannelKeys() {
    return this.normalizedChannels.map(ch => ch.key);
  }

  /**
   * @returns {!Array.<Channel>} Available channels and unwrapped matrix channels
   */
  get normalizedChannels() {
    if (!(`normalizedChannels` in this._cache)) {
      // matrix channels are added later, so we exclude channels that override matrix channels
      const availableChannels = this.availableChannels.filter(
        ch => !this.matrixChannelKeys.includes(ch.key)
      );

      const unwrappedMatrixChannels = this.matrixChannels.map(
        matrixCh => matrixCh.wrappedChannel
      ).filter(
        ch => ch instanceof Channel
      );

      this._cache.normalizedChannels = availableChannels.concat(unwrappedMatrixChannels);
    }

    return this._cache.normalizedChannels;
  }

  /**
   * @returns {!Array.<string>} All null channels' keys.
   */
  get nullChannelKeys() {
    return this.nullChannels.map(ch => ch.key);
  }

  /**
   * @returns {!Array.<NullChannel>} Automatically generated null channels.
   */
  get nullChannels() {
    if (!(`nullChannels` in this._cache)) {
      // we only need to create as many NullChannels as in the mode with the most null channels
      // e.g. Mode 1: 1x null, Mode 2: 3x null, Mode 3: 2x null => 3 NullChannels
      const maxNullPerMode = Math.max(...this.modes.map(mode => mode.nullChannelCount));
      this._cache.nullChannels = [];
      for (let i = 0; i < maxNullPerMode; i++) {
        const channel = new NullChannel(this);
        this._cache.nullChannels.push(channel);
      }
    }

    return this._cache.nullChannels;
  }

  /**
   * @returns {!Array.<string>} All generated channel keys. If possible, ordered by appearance.
   */
  get allChannelKeys() {
    if (!(`allChannelKeys` in this._cache)) {
      this._cache.allChannelKeys = this.allChannels.map(ch => ch.key);
    }

    return this._cache.allChannelKeys;
  }

  /**
   * @returns {!Array.<AbstractChannel, MatrixChannel>} All generated channels. If possible, ordered by appearance.
   */
  get allChannels() {
    if (!(`allChannels` in this._cache)) {
      let channels = [];

      // add available channels with their fine and switching channels
      // matrix channels are added later, so we exclude channels that override matrix channels
      const availableChannelsWithoutMatrixChannels = this.availableChannels.filter(
        ch => !this.matrixChannelKeys.includes(ch.key)
      );
      for (const channel of availableChannelsWithoutMatrixChannels) {
        channels = channels.concat(channel, channel.fineChannels, channel.switchingChannels);
      }

      // add null channels and matrix channels
      channels = channels.concat(this.nullChannels, this.matrixChannels);

      this._cache.allChannels = channels;
    }

    return this._cache.allChannels;
  }

  /**
   * @param {!string} key The channel's key.
   * @returns {AbstractChannel|MatrixChannel|null} The found channel, null if not found.
   */
  getChannelByKey(key) {
    if (!(`channelsByKey` in this._cache)) {
      this._cache.channelsByKey = {};

      for (const channel of this.allChannels) {
        this._cache.channelsByKey[channel.key] = channel;
      }
    }

    return this._cache.channelsByKey[key] || null;
  }

  /**
   * @returns {!Array.<Capability>} All available channels' and template channels' capabilities.
   */
  get capabilities() {
    if (!(`capabilities` in this._cache)) {
      const channels = this.availableChannels.concat(this.templateChannels);
      this._cache.capabilities = concatArrayProperty(channels, `capabilities`);
    }

    return this._cache.capabilities;
  }

  /**
   * @returns {!Array.<Mode>} The fixture's different modes providing different channel lists.
   */
  get modes() {
    if (!(`modes` in this._cache)) {
      this._cache.modes = this._jsonObject.modes.map(jsonMode => new Mode(jsonMode, this));
    }

    return this._cache.modes;
  }
}


/**
 * Helper function to merge array properties of an array of items.
 * @param {!Array.<object>} items The items whose property values should be merged.
 * @param {!string} property The items' property name to merge.
 * @returns {!Array} Array of concatenated property values.
 */
function concatArrayProperty(items, property) {
  let values = [];

  for (const item of items) {
    values = values.concat(item[property]);
  }

  return values;
}
