import cacheResult from '../cache-result.js';
/** @ignore @typedef {import('./AbstractChannel.js').default} AbstractChannel */
/** @ignore @typedef {import('./Capability.js').default} Capability */
import CoarseChannel from './CoarseChannel.js';
import FineChannel from './FineChannel.js';
/** @ignore @typedef {import('./Manufacturer.js').default} Manufacturer */
import Matrix from './Matrix.js';
import Meta from './Meta.js';
import Mode from './Mode.js';
import NullChannel from './NullChannel.js';
import Physical from './Physical.js';
import SwitchingChannel from './SwitchingChannel.js';
import TemplateChannel from './TemplateChannel.js';
import Wheel from './Wheel.js';


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


/**
 * A physical DMX device.
 */
class Fixture {
  /**
   * Create a new Fixture instance.
   * @param {Manufacturer} manufacturer A Manufacturer instance.
   * @param {String} key The fixture's unique key. Equals to filename without '.json'.
   * @param {Object} jsonObject The fixture's parsed JSON data.
   */
  constructor(manufacturer, key, jsonObject) {
    this._manufacturer = manufacturer;
    this._key = key;
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  /**
   * @returns {Manufacturer} The fixture's manufacturer.
   */
  get manufacturer() {
    return this._manufacturer;
  }

  /**
   * @returns {String} The fixture's unique key. Equals to filename without '.json'.
   */
  get key() {
    return this._key;
  }

  /**
   * @returns {Object} The fixture's parsed JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }

  /**
   * @returns {String} An URL pointing to the fixture's page on the Open Fixture Library website.
   */
  get url() {
    const websiteUrl = process.env.WEBSITE_URL || `https://open-fixture-library.org/`;
    return `${websiteUrl}${this.manufacturer.key}/${this.key}`;
  }

  /**
   * @returns {String} The fixture's product name.
   */
  get name() {
    return this._jsonObject.name; // required
  }

  /**
   * @returns {Boolean} Whether a short name is defined for this fixture.
   */
  get hasShortName() {
    return `shortName` in this._jsonObject;
  }

  /**
   * @returns {String} A globally unique and as short as possible product name, defaults to name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  /**
   * @returns {Array.<String>} The fixture's categories with the most applicable one first.
   */
  get categories() {
    return this._jsonObject.categories; // required
  }

  /**
   * @returns {String} The fixture's most applicable category. Equals to first item of categories.
   */
  get mainCategory() {
    return this.categories[0];
  }

  /**
   * @returns {Meta} A Meta instance providing information like author or create date.
   */
  get meta() {
    return cacheResult(this, `meta`, new Meta(this._jsonObject.meta));
  }

  /**
   * @returns {Boolean} Whether a comment is defined for this fixture.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {Boolean} A comment about the fixture (often a note about a incorrectness in the manual). Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {String|null} A string describing the help that is needed for this fixture, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }

  /**
   * @returns {Boolean} True if help is needed in this fixture (maybe in a capability), false otherwise.
   */
  get isHelpWanted() {
    return this.helpWanted !== null || this.isCapabilityHelpWanted;
  }

  /**
   * @returns {Boolean} True if help is needed in a capability, false otherwise.
   */
  get isCapabilityHelpWanted() {
    return cacheResult(this, `isCapabilityHelpWanted`, this.allChannels.some(
      channel => channel.isHelpWanted,
    ));
  }

  /**
   * @returns {Object.<String, Array>|null} An object with URL arrays, organized by link type, or null if no links are available for this fixture.
   */
  get links() {
    return this._jsonObject.links || null;
  }

  /**
   * @param {String} type The type of the links that should be returned.
   * @returns {Array.<String>} An array of URLs of the specified type (may be empty).
   */
  getLinksOfType(type) {
    if (this.links === null) {
      return [];
    }

    return this.links[type] || [];
  }

  /**
   * @returns {Object|null} Information about the RDM functionality of this fixture. Defaults to null.
   * @property {Number} modelId The RDM model/product id of the fixture, given in decimal format.
   * @property {String|null} softwareVersion The software version used as reference in this fixture definition.
   */
  get rdm() {
    return this._jsonObject.rdm || null;
  }

  /**
   * @returns {Physical|null} The general physical information for the fixture, may be overridden by modes.
   */
  get physical() {
    if (`physical` in this._jsonObject) {
      return cacheResult(this, `physical`, new Physical(this._jsonObject.physical));
    }

    return cacheResult(this, `physical`, null);
  }

  /**
   * @returns {Matrix|null} The matrix information for this fixture.
   */
  get matrix() {
    if (`matrix` in this._jsonObject) {
      return cacheResult(this, `matrix`, new Matrix(this._jsonObject.matrix));
    }

    return cacheResult(this, `matrix`, null);
  }

  /**
   * @returns {Array.<Wheel>} The fixture's wheels as {@link Wheel} instances.
   */
  get wheels() {
    const wheels = Object.entries(this._jsonObject.wheels || {}).map(
      ([wheelName, wheelJson]) => new Wheel(wheelName, wheelJson),
    );
    return cacheResult(this, `wheels`, wheels);
  }

  /**
   * @param {String} wheelName The name of the wheel.
   * @returns {Wheel|null} The wheel with the given name, or null if no wheel with the given name exists.
   */
  getWheelByName(wheelName) {
    if (!(`wheelByName` in this._cache)) {
      this._cache.wheelByName = Object.fromEntries(
        this.wheels.map(wheel => [wheel.name, wheel]),
      );
    }

    return this._cache.wheelByName[wheelName] || null;
  }

  /**
   * @returns {Object.<String, String>} Channel keys from {@link Fixture#allChannelKeys} pointing to unique versions of their channel names.
   */
  get uniqueChannelNames() {
    const uniqueChannelNames = {};

    const names = this.allChannels.map(channel => channel.name);

    for (let index = 0; index < names.length; index++) {
      const originalName = names[index];

      // make unique by appending ' 2', ' 3', ...
      let duplicates = 1;
      while (names.indexOf(names[index]) !== index) {
        duplicates++;
        names[index] = `${originalName} ${duplicates}`;
      }

      // save unique name
      uniqueChannelNames[this.allChannelKeys[index]] = names[index];
    }

    return cacheResult(this, `uniqueChannelNames`, uniqueChannelNames);
  }

  /**
   * @returns {Array.<String>} Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.
   */
  get availableChannelKeys() {
    return cacheResult(this, `availableChannelKeys`, Object.keys(this._jsonObject.availableChannels || {}));
  }

  /**
   * @returns {Array.<CoarseChannel>} Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.
   */
  get availableChannels() {
    return cacheResult(this, `availableChannels`, this.availableChannelKeys.map(
      channelKey => new CoarseChannel(channelKey, this._jsonObject.availableChannels[channelKey], this),
    ));
  }

  /**
   * @returns {Array.<String>} Coarse channels' keys, including matrix channels' keys. If possible, ordered by appearance.
   */
  get coarseChannelKeys() {
    return cacheResult(this, `coarseChannelKeys`, this.coarseChannels.map(
      channel => channel.key,
    ));
  }

  /**
   * @returns {Array.<CoarseChannel>} Coarse channels, including matrix channels. If possible, ordered by appearance.
   */
  get coarseChannels() {
    return cacheResult(this, `coarseChannels`, this.allChannels.filter(
      channel => channel instanceof CoarseChannel,
    ));
  }

  /**
   * @returns {Array.<String>} All fine channels' aliases, including matrix fine channels' aliases. If possible, ordered by appearance.
   */
  get fineChannelAliases() {
    return cacheResult(this, `fineChannelAliases`, this.fineChannels.map(
      channel => channel.key,
    ));
  }

  /**
   * @returns {Array.<FineChannel>} All fine channels, including matrix fine channels. If possible, ordered by appearance.
   */
  get fineChannels() {
    return cacheResult(this, `fineChannels`, this.allChannels.filter(
      channel => channel instanceof FineChannel,
    ));
  }

  /**
   * @returns {Array.<String>} All switching channels' aliases, including matrix switching channels' aliases. If possible, ordered by appearance.
   */
  get switchingChannelAliases() {
    return cacheResult(this, `switchingChannelAliases`, this.switchingChannels.map(
      channel => channel.key,
    ));
  }

  /**
   * @returns {Array.<SwitchingChannel>} All switching channels, including matrix switching channels. If possible, ordered by appearance.
   */
  get switchingChannels() {
    return cacheResult(this, `switchingChannels`, this.allChannels.filter(
      channel => channel instanceof SwitchingChannel,
    ));
  }

  /**
   * Template channels are used to automatically generate channels.
   * @returns {Array.<String>} All template channel keys from the fixture definition's `templateChannels` section. Ordered by appearance.
   */
  get templateChannelKeys() {
    return Object.keys(this._jsonObject.templateChannels || {});
  }

  /**
   * Template channels are used to automatically generate channels.
   * @returns {Array.<TemplateChannel>} TemplateChannel instances for all template channels from the fixture definition's `templateChannels` section. Ordered by appearance.
   */
  get templateChannels() {
    return cacheResult(this, `templateChannels`, this.templateChannelKeys.map(
      key => new TemplateChannel(key, this._jsonObject.templateChannels[key], this),
    ));
  }

  /**
   * Searches the template channel with the given key. Fine and switching template channel aliases *can't* be found.
   * @param {String} channelKey The template channel's key
   * @returns {TemplateChannel|null} The corresponding template channel.
   */
  getTemplateChannelByKey(channelKey) {
    if (!(`templateChannelByKey` in this._cache)) {
      this._cache.templateChannelByKey = {};

      for (const channel of this.templateChannels) {
        this._cache.templateChannelByKey[channel.key] = channel;
      }
    }

    return this._cache.templateChannelByKey[channelKey] || null;
  }

  /**
   * @returns {Array.<String>} Keys of all resolved matrix channels.
   */
  get matrixChannelKeys() {
    return cacheResult(this, `matrixChannelKeys`, this.matrixChannels.map(
      channel => channel.key,
    ));
  }

  /**
   * @returns {Array.<AbstractChannel>} All (resolved) channels with `pixelKey` information (including fine and switching channels).
   */
  get matrixChannels() {
    if (this.matrix === null) {
      return cacheResult(this, `matrixChannels`, []);
    }

    return cacheResult(this, `matrixChannels`, this.allChannels.filter(
      channel => channel.pixelKey !== null,
    ));
  }

  /**
   * @returns {Array.<String>} All null channels' keys.
   */
  get nullChannelKeys() {
    return this.nullChannels.map(channel => channel.key);
  }

  /**
   * @returns {Array.<NullChannel>} Automatically generated null channels.
   */
  get nullChannels() {
    // we only need to create as many NullChannels as in the mode with the most null channels
    // e.g. Mode 1: 1x null, Mode 2: 3x null, Mode 3: 2x null => 3 NullChannels
    const maxNullPerMode = Math.max(...this.modes.map(mode => mode.nullChannelCount));
    const nullChannels = Array.from({ length: maxNullPerMode }, () => new NullChannel(this));

    return cacheResult(this, `nullChannels`, nullChannels);
  }

  /**
   * @returns {Array.<String>} All channel keys used in this fixture, including resolved matrix channels' keys. If possible, ordered by appearance.
   */
  get allChannelKeys() {
    return cacheResult(this, `allChannelKeys`, Object.keys(this.allChannelsByKey));
  }

  /**
   * @returns {Array.<AbstractChannel>} All channels used in this fixture, including resolved matrix channels. If possible, ordered by appearance.
   */
  get allChannels() {
    return cacheResult(this, `allChannels`, Object.values(this.allChannelsByKey));
  }

  /**
   * @returns {Object.<String, AbstractChannel>} All channel keys used in this fixture pointing to the respective channel, including matrix channels. If possible, ordered by appearance.
   */
  get allChannelsByKey() {
    const allChannels = [
      ...this.availableChannels.flatMap(mainChannel => [
        mainChannel,
        ...mainChannel.fineChannels,
        ...mainChannel.switchingChannels,
      ]),
      ...this.nullChannels,
    ];

    const allChannelsByKey = Object.fromEntries(
      allChannels.map(channel => [channel.key, channel]),
    );

    const allMatrixChannelsByKey = {};
    for (const templateChannel of this.templateChannels) {
      for (const channel of templateChannel.createMatrixChannels()) {
        allMatrixChannelsByKey[channel.key] = channel;
      }
    }

    for (let matrixChannel of Object.values(allMatrixChannelsByKey)) {
      if (matrixChannel.key in allChannelsByKey) {
        // matrix channel is overridden by an available channel
        const overrideChannel = allChannelsByKey[matrixChannel.key];
        overrideChannel.pixelKey = matrixChannel.pixelKey;

        // move channel to the place where the matrix channel would have been inserted
        delete allChannelsByKey[matrixChannel.key];
        matrixChannel = overrideChannel;
      }

      // check if matrix channel is used in a mode's channel list
      // (maybe indirect in switching channels)
      const matrixChannelUsed = this.modes.some(
        mode => mode.channelKeys.some(channelKey => {
          if (matrixChannel.key === channelKey) {
            // matrix channel used directly
            return true;
          }

          const otherChannel = allChannelsByKey[channelKey] || allMatrixChannelsByKey[channelKey];
          if (otherChannel instanceof SwitchingChannel && otherChannel.switchToChannelKeys.includes(matrixChannel.key)) {
            // matrix channel used in a switching channel
            return true;
          }

          return false;
        }),
      );

      if (matrixChannelUsed) {
        allChannelsByKey[matrixChannel.key] = matrixChannel;
      }
    }

    return cacheResult(this, `allChannelsByKey`, allChannelsByKey);
  }

  /**
   * @param {String} key The channel's key.
   * @returns {AbstractChannel|null} The found channel, null if not found.
   */
  getChannelByKey(key) {
    return this.allChannelsByKey[key] || null;
  }

  /**
   * @returns {Array.<Capability>} All available channels' and template channels' capabilities.
   */
  get capabilities() {
    const channels = [...this.availableChannels, ...this.templateChannels];
    const capabilities = channels.flatMap(channel => channel.capabilities);
    return cacheResult(this, `capabilities`, capabilities);
  }

  /**
   * @returns {Array.<Mode>} The fixture's modes.
   */
  get modes() {
    return cacheResult(this, `modes`, this._jsonObject.modes.map(
      jsonMode => new Mode(jsonMode, this),
    ));
  }
}

export default Fixture;
