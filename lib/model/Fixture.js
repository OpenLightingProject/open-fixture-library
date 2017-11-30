const path = require('path');
const fs = require('fs');

const Manufacturer = require('./Manufacturer.js');
const Meta = require('./Meta.js');
const Physical = require('./Physical.js');
const Channel = require('./Channel.js');
const TemplateChannel = require('./TemplateChannel.js');
const NullChannel = require('./NullChannel.js');
const Matrix = require('./Matrix.js');
const Mode = require('./Mode.js');


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


module.exports = class Fixture {
  constructor(man, key, jsonObject) {
    this.manufacturer = man; // calls the setter
    this._key = key;
    this.jsonObject = jsonObject; // also calls the setter
  }

  set manufacturer(newMan) {
    if (newMan instanceof Manufacturer) {
      this._manufacturer = newMan;
    }
    else {
      this._manufacturer = new Manufacturer(newMan);
    }
  }

  get manufacturer() {
    return this._manufacturer;
  }

  get key() {
    return this._key;
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get jsonObject() {
    return this._jsonObject;
  }

  get url() {
    return `https://open-fixture-library.herokuapp.com/${this.manufacturer.key}/${this.key}`;
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

  get categories() {
    return this._jsonObject.categories; // required
  }

  get mainCategory() {
    return this.categories[0];
  }

  get meta() {
    if (!('meta' in this._cache)) {
      this._cache.meta = new Meta(this._jsonObject.meta);
    }

    return this._cache.meta;
  }

  get comment() {
    return this._jsonObject.comment || '';
  }

  get hasComment() {
    return 'comment' in this._jsonObject;
  }

  get manualURL() {
    return this._jsonObject.manualURL || null;
  }

  get rdm() {
    return this._jsonObject.rdm || null;
  }

  /**
   * @return {?Physical} The physical information for the whole fixture.
   */
  get physical() {
    if (!('physical' in this._cache)) {
      this._cache.physical = 'physical' in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }

    return this._cache.physical;
  }

  /**
   * @return {?Matrix} The matrix information for this fixture.
   */
  get matrix() {
    if (!('matrix' in this._cache)) {
      this._cache.matrix = 'matrix' in this._jsonObject ? new Matrix(this._jsonObject.matrix) : null;
    }

    return this._cache.matrix;
  }

  // returns object whose keys are all items in this.allChannelKeys
  // { 'channel key': 'unique channel name' }
  get uniqueChannelNames() {
    if (!('uniqueChannelNames' in this._cache)) {
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

  // array, ordered by appearance
  get availableChannelKeys() {
    return Object.keys(this._jsonObject.availableChannels || {});
  }

  // array of Channel objects, ordered by appearance
  get availableChannels() {
    if (!('availableChannels' in this._cache)) {
      this._cache.availableChannels = this.availableChannelKeys.map(
        key => new Channel(key, this._jsonObject.availableChannels[key], this)
      );
    }

    return this._cache.availableChannels;
  }

  // array, ordered by appearance
  get fineChannelAliases() {
    return this._concatChannelArrayProperty('fineChannelAliases');
  }

  // array of FineChannel objects, ordered by appearance
  get fineChannels() {
    return this._concatChannelArrayProperty('fineChannels');
  }

  // array, ordered by appearance
  get switchingChannelAliases() {
    return this._concatChannelArrayProperty('switchingChannelAliases');
  }

  // array of SwitchingChannel objects, ordered by appearance
  get switchingChannels() {
    return this._concatChannelArrayProperty('switchingChannels');
  }

  /**
   * @param {!string} key The switching channel's key.
   * @return {?SwitchingChannel} The found channel, null if not found.
   */
  getSwitchingChannelByKey(key) {
    if (!('switchingChannelsByKey' in this._cache)) {
      this._cache.switchingChannelsByKey = {};

      for (const channel of this.switchingChannels) {
        this._cache.switchingChannelsByKey[channel.key] = channel;
      }
    }

    return this._cache.switchingChannelsByKey[key] || null;
  }

  _concatChannelArrayProperty(property) {
    if (!(property in this._cache)) {
      let values = [];

      for (const channel of this.availableChannels) {
        values = values.concat(channel[property]);
      }

      this._cache[property] = values;
    }

    return this._cache[property];
  }

  /**
   * Template channels are used to automatically generate channels (currently only matrix channels).
   * @return {!string[]} All template channel keys, ordered by appearance.
   */
  get templateChannelKeys() {
    return Object.keys(this._jsonObject.templateChannels || {});
  }

  /**
   * Template channels are used to automatically generate channels (currently only matrix channels).
   * @return {!TemplateChannel[]} TemplateChannel instances for all template channels, ordered by appearance.
   */
  get templateChannels() {
    if (!('templateChannels' in this._cache)) {
      this._cache.templateChannels = this.templateChannelKeys.map(
        key => new TemplateChannel(key, this._jsonObject.templateChannels[key], this)
      );
    }

    return this._cache.templateChannels;
  }

  /**
   * Searches the template channel with the given key. Fine and switching template channel keys can't be found.
   * @param {!string} chKey The template channel's key
   * @return {?TemplateChannel}
   */
  getTemplateChannelByKey(chKey) {
    if (!('templateChannelByKey' in this._cache)) {
      this._cache.templateChannelByKey = {};

      for (const channel of this.templateChannels) {
        this._cache.templateChannelByKey[channel.key] = channel;
      }
    }

    return this._cache.templateChannelByKey[chKey] || null;
  }

  /**
   * @return {!Object.<string, Set<string>>} Each used template channel key pointing to a Set of used pixelKeys/pixelGroupKeys.
   */
  get usedPixelKeys() {
    if (!('usedPixelKeys' in this._cache)) {
      /** @type {!UsedPixelKeys} */
      let usedPixelKeys = {};

      for (const mode of this.modes) {
        for (const templateChannelKey of Object.keys(mode.usedPixelKeys)) {
          if (!(templateChannelKey in usedPixelKeys)) {
            usedPixelKeys[templateChannelKey] = mode.usedPixelKeys[templateChannelKey];
          }
          else {
            usedPixelKeys[templateChannelKey] = new Set([
              ...usedPixelKeys[templateChannelKey],
              ...mode.usedPixelKeys[templateChannelKey]
            ]);
          }
        }
      }

      this._cache.usedPixelKeys = usedPixelKeys;
    }

    return this._cache.usedPixelKeys;
  }

  /**
   * @return {!string[]} All used matrix channels' keys.
   */
  get matrixChannelKeys() {
    if (!('matrixChannelKeys' in this._cache)) {
      this._cache.matrixChannelKeys = this.matrixChannels.map(ch => ch.key);
    }

    return this._cache.matrixChannelKeys;
  }

  /**
   * @return {!MatrixChannel[]} All used matrix channels.
   */
  get matrixChannels() {
    if (!('matrixChannels' in this._cache)) {
      let channels = [];

      for (const templateChannelKey of Object.keys(this.usedPixelKeys)) {
        const templateChannel = this.getTemplateChannelByKey(templateChannelKey);

        // fine template channels aren't found and return null, but they're created with their coarse channel automatically.
        if (templateChannel !== null) {
          for (const pixelKey of this.usedPixelKeys[templateChannelKey]) {
            channels = channels.concat(templateChannel.createMatrixChannels(pixelKey));
          }
        }
      }

      this._cache.matrixChannels = channels;
    }

    return this._cache.matrixChannels;
  }

  // array
  get nullChannelKeys() {
    return this.nullChannels.map(ch => ch.key);
  }

  // array of NullChannel objects
  get nullChannels() {
    if (!('nullChannels' in this._cache)) {
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
   * @return {!string[]} All generated channel keys. If possible, ordered by appearance.
   */
  get allChannelKeys() {
    if (!('allChannelKeys' in this._cache)) {
      this._cache.allChannelKeys = this.allChannels.map(ch => ch.key);
    }

    return this._cache.allChannelKeys;
  }

  /**
   * @return {!Array.<AbstractChannel, MatrixChannel>} All generated channels. If possible, ordered by appearance.
   */
  get allChannels() {
    if (!('allChannels' in this._cache)) {
      let channels = [];

      for (const channel of this.availableChannels) {
        channels = channels.concat(channel, channel.fineChannels, channel.switchingChannels);
      }
      channels = channels.concat(this.nullChannels, this.matrixChannels);

      this._cache.allChannels = channels;
    }

    return this._cache.allChannels;
  }

  /**
   * @param {!string} key The channel's key.
   * @return {AbstractChannel|MatrixChannel|null} The found channel, null if not found.
   */
  getChannelByKey(key) {
    if (!('channelsByKey' in this._cache)) {
      this._cache.channelsByKey = {};

      for (const channel of this.allChannels) {
        this._cache.channelsByKey[channel.key] = channel;
      }
    }

    return this._cache.channelsByKey[key] || null;
  }

  get modes() {
    if (!('modes' in this._cache)) {
      this._cache.modes = this._jsonObject.modes.map(jsonMode => new Mode(jsonMode, this));
    }

    return this._cache.modes;
  }


  /**
   * Looks up the fixture definition in the directory structure and creates a Fixture instance.
   * @param {!string} man The manufacturer's key (directory name)
   * @param {!string} fix The fixture's key (filename without .json)
   * @returns {?Fixture} The created Fixture instance, null if not found.
   */
  static fromRepository(man, fix) {
    const fixPath = path.join(__dirname, '..', '..', 'fixtures', man, `${fix}.json`);
    return new this(man, fix, JSON.parse(fs.readFileSync(fixPath, 'utf8')));
  }
};
