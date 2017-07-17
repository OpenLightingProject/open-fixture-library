const path = require('path');
const fs = require('fs');

const Manufacturer = require('./Manufacturer.js');
const Meta = require('./Meta.js');
const Physical = require('./Physical.js');
const Channel = require('./Channel.js');
const NullChannel = require('./NullChannel.js');
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

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get key() {
    return this._key;
  }

  get manufacturer() {
    return this._manufacturer;
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

  get physical() {
    if (!('physical' in this._cache)) {
      this._cache.physical = 'physical' in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }

    return this._cache.physical;
  }

  // array of all channel keys and aliases, ordered by appearance
  get allChannelKeys() {
    if (!('allChannelKeys' in this._cache)) {
      this._cache.allChannelKeys = this.allChannels.map(ch => ch.key);
    }

    return this._cache.allChannelKeys;
  }

  // array of objects extending AbstractChannel, ordered by appearance
  // (e.g. Channel, FineChannel, SwitchingChannel)
  get allChannels() {
    if (!('allChannels' in this._cache)) {
      let channels = [];

      for (const channel of this.availableChannels) {
        channels = channels.concat(channel, channel.fineChannels, channel.switchingChannels);
      }
      channels = channels.concat(this.nullChannels);

      this._cache.allChannels = channels;
    }

    return this._cache.allChannels;
  }

  // returns object whose keys are all items in this.allChannelKeys
  // { 'channel key': 'unique channel name' }
  get uniqueChannelNames() {
    if (!('uniqueChannelNames' in this._cache)) {
      this._cache.uniqueChannelNames = {};

      let names = this.allChannels.map(ch => ch.name);

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
    return Object.keys(this._jsonObject.availableChannels);
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

  // array
  get nullChannelKeys() {
    return this.nullChannels.map(ch => ch.key);
  }

  // array of NullChannel objects
  get nullChannels() {
    if (!('nullChannels' in this._cache)) {
      // we only need to create as many NullChannels as in the mode with the most null channels
      // e.g. Mode 1: 1x null, Mode 2: 3x null, Mode 3: 2x null => 3 NullChannels
      let maxNullPerMode = Math.max(...this.modes.map(mode => mode.nullChannelCount));
      this._cache.nullChannels = [];
      for (let i = 0; i < maxNullPerMode; i++) {
        const channel = new NullChannel(this);
        this._cache.nullChannels.push(channel);
      }
    }

    return this._cache.nullChannels;
  }

  // returns an object extending AbstractChannel or returns null if key doesn't exist
  // (e.g. Channel, FineChannel, SwitchingChannel, NullChannel)
  getChannelByKey(key) {
    if (!('channelsByKey' in this._cache)) {
      this._cache.channelsByKey = {};

      for (const channel of this.allChannels) {
        this._cache.channelsByKey[channel.key] = channel;
      }
    }

    return this._cache.channelsByKey[key] || null;
  }

  get heads() {
    return this._jsonObject.heads || {};
  }

  get modes() {
    if (!('modes' in this._cache)) {
      this._cache.modes = this._jsonObject.modes.map(jsonMode => new Mode(jsonMode, this));
    }

    return this._cache.modes;
  }


  static fromRepository(man, fix) {
    const fixPath = path.join(__dirname, '..', '..', 'fixtures', man, fix + '.json');
    return new this(man, fix, JSON.parse(fs.readFileSync(fixPath, 'utf8')));
  }
};