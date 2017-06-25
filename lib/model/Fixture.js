const path = require('path');
const fs = require('fs');

const Channel = require(path.join(__dirname, 'Channel.js'));
const Physical = require(path.join(__dirname, 'Physical.js'));

module.exports = class Fixture {
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  get name() {
    return this._jsonObject.name; // required
  }

  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  get categories() {
    return this._jsonObject.categories; // required
  }

  get mainCategory() {
    return this.categories[0];
  }

  get meta() {
    if (!('meta' in this._cache)) {
      const jsonMeta = this._jsonObject.meta; // required
      this._cache.meta = {
        authors: jsonMeta.authors, // required
        createDate: new Date(jsonMeta.createDate), // required
        lastModifyDate: new Date(jsonMeta.lastModifyDate), // required
        importPlugin: 'importPlugin' in jsonMeta ? {
          plugin: jsonMeta.importPlugin.plugin, // required
          date: new Date(jsonMeta.importPlugin.date), // required
          comment: jsonMeta.importPlugin.comment || '',
          hasComment: 'comment' in jsonMeta.importPlugin
        } : null
      };
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

  /*
    benchmark results (10,000,000 iterations):
    - without cache: ~1.9s
    - with cache: ~0.52s (nearly 4 times faster!)
    => that proves why caching, even for these small objects, is useful
  */
  get physical() {
    if (!('physical' in this._cache)) {
      this._cache.physical = new Physical(this._jsonObject.physical);
    }

    return this._cache.physical;
  }

  // array of all channel keys and aliases, ordered by appearance
  get channelKeys() {
    if (!('channelKeys' in this._cache)) {
      this._cache.channelKeys = [];

      for (const chKey of Object.keys(this.availableChannels)) {
        this._cache.channelKeys.push(chKey);

        const channel = this.availableChannels[chKey];
        for (const alias of channel.fineChannelAliases) {
          this._cache.channelKeys.push(alias);
        }

        for (const alias of Object.keys(channel.switchingChannels)) {
          this._cache.channelKeys.push(alias);
        }
      }
    }

    return this._cache.channelKeys;
  }

  // { 'channel key': Channel, ... }
  get availableChannels() {
    if (!('availableChannels' in this._cache)) {
      this._cache.availableChannels = {};

      for (const key of Object.keys(this._jsonObject.availableChannels)) {
        this._cache.availableChannels[key] = new Channel(this._jsonObject.availableChannels[key], key);
      }
    }

    return this._cache.availableChannels;
  }

  // { 'fine channel alias': FineChannel, ... }
  get fineChannels() {
    if (!('fineChannels' in this._cache)) {
      this._cache.fineChannels = {};

      for (const ch of Object.keys(this.availableChannels)) {
        const channel = this.availableChannels[ch];
        Object.assign(this._cache.fineChannels, channel.fineChannels);
      }
    }

    return this._cache.fineChannels;
  }

  // { 'switching channel alias': SwitchingChannel, ... }
  get switchingChannels() {
    if (!('switchingChannels' in this._cache)) {
      this._cache.switchingChannels = {};

      for (const ch of Object.keys(this.availableChannels)) {
        const channel = this.availableChannels[ch];
        Object.assign(this._cache.switchingChannels, channel.switchingChannels);
      }
    }

    return this._cache.switchingChannels;
  }

  // returns Channel, FineChannel, SwitchingChannel or null
  getChannelByKey(key) {
    if (key in this.availableChannels) {
      return this.availableChannels[key];
    }
    if (key in this.fineChannels) {
      return this.fineChannels[key];
    }
    if (key in this.switchingChannels) {
      return this.switchingChannels[key];
    }
    return null;
  }

  get modes() {
    if (!('modes' in this._cache)) {
      this._cache.modes = [];
      for (const jsonMode of this._jsonObject.modes) {
        this._cache.modes.push({
          name: jsonMode.name, // required
          shortName: jsonMode.shortName || jsonMode.name,
          physical: 'physical' in jsonMode ? new Physical(jsonMode.physical) : null,
          channels: jsonMode.channels
        });
      }
    }

    return this._cache.modes;
  }


  static fromRepository(man, fix) {
    const fixPath = path.join(__dirname, '..', '..', 'fixtures', man, fix + '.json');
    return new this(JSON.parse(fs.readFileSync(fixPath, 'utf8')));
  }
};