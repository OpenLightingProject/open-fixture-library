const path = require('path');
const fs = require('fs');


class Physical {
  constructor(_jsonObject) {
    this._jsonObject = _jsonObject;
    this._cache = {};
  }

  get dimensions() {
    return this._jsonObject.dimensions || null;
  }

  get width() {
    return this.dimensions !== null ? this.dimensions[0] : null;
  }

  get height() {
    return this.dimensions !== null ? this.dimensions[1] : null;
  }

  get depth() {
    return this.dimensions !== null ? this.dimensions[2] : null;
  }

  get weight() {
    return this._jsonObject.weight || null;
  }

  get power() {
    return this._jsonObject.power || null;
  }

  get DMXconnector() {
    return this._jsonObject.DMXconnector || null;
  }


  get hasBulb() {
    return 'bulb' in this._jsonObject;
  }

  get bulbType() {
    return this.hasBulb ? this._jsonObject.bulb.type || null : null;
  }

  get bulbColorTemperature() {
    return this.hasBulb ? this._jsonObject.bulb.colorTemperature || null : null;
  }

  get bulbLumens() {
    return this.hasBulb ? this._jsonObject.bulb.lumens || null : null;
  }


  get hasLens() {
    return 'lens' in this._jsonObject;
  }

  get lensName() {
    return this.hasLens ? this._jsonObject.lens.name || null : null;
  }

  get lensDegreesMin() {
    return this.hasLens && 'degreesMinMax' in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[0] : null;
  }

  get lensDegreesMax() {
    return this.hasLens && 'degreesMinMax' in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[1] : null;
  }


  get hasFocus() {
    return 'focus' in this._jsonObject;
  }

  get focusType() {
    return this.hasFocus ? this._jsonObject.focus.type || null : null;
  }

  get focusPanMax() {
    return this.hasFocus ? this._jsonObject.focus.panMax || null : null;
  }

  get focusTiltMax() {
    return this.hasFocus ? this._jsonObject.focus.tiltMax || null : null;
  }
}


class Channel {
  constructor(jsonObject, key) {
    this._jsonObject = jsonObject;
    this.key = key;
  }

  get name() {
    return this._jsonObject.name || this.key;
  }

  get type() {
    return this._jsonObject.type; // required
  }

  get color() {
    return this._jsonObject.color || null; // required if SingleColor, else forbidden
  }

  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }

  get defaultValue() {
    return this._jsonObject.defaultValue || 0;
  }

  get hasDefaultValue() {
    return 'defaultValue' in this._jsonObject;
  }

  get highlightValue() {
    return this._jsonObject.highlightValue || 255;
  }

  get hasHighlightValue() {
    return 'highlightValue' in this._jsonObject;
  }

  get invert() {
    return 'invert' in this._jsonObject && this._jsonObject.invert;
  }

  get constant() {
    return 'constant' in this._jsonObject && this._jsonObject.constant;
  }

  get crossfade() {
    return 'crossfade' in this._jsonObject && this._jsonObject.crossfade;
  }

  get isLTP() {
    return 'precedence' in this._jsonObject && this._jsonObject.precedence === 'LTP';
  }

  get isHTP() {
    return !this.isLTP;
  }
}


module.exports = class Fixture {
  constructor(jsonObject) {
    this.jsonObject = jsonObject;
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

  get availableChannelKeys() {
    return Object.keys(this._jsonObject.availableChannels);
  }

  get channelKeys() {
    if (!('channelKeys' in this._cache)) {
      this._cache.channelKeys = [];

      for (const ch of this.availableChannelKeys) {
        this._cache.channelKeys.push(ch);

        const channel = this.getChannelByKey(ch);
        for (const fineAlias of channel.fineChannelAliases) {
          this._cache.channelKeys.push(fineAlias);
        }

        // TODO: Add switching channels
      }
    }

    return this._cache.channelKeys;
  }

  /*
    { 'fine channel alias': 'coarse channel key', ... }
  */
  get fineChannels() {
    if (!('fineChannels' in this._cache)) {
      this._cache.fineChannels = {};

      for (const ch of this.availableChannelKeys) {
        const channel = this.getChannelByKey(ch);
        for (const fineAlias of channel.fineChannelAliases) {
          this._cache.fineChannels[fineAlias] = ch;
        }
      }
    }

    return this._cache.fineChannels;
  }

  // don't call this method with channel aliases!
  getChannelByKey(key) {
    if (!('channels' in this._cache)) {
      this._cache.channels = {};
    }

    if (this.availableChannelKeys.includes(key)) {
      if (!(key in this._cache.channels)) {
        this._cache.channels[key] = new Channel(this._jsonObject.availableChannels[key], key);
      }
      return this._cache.channels[key];
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
    const fixPath = path.join(__dirname, '..', 'fixtures', man, fix + '.json');
    return new this(JSON.parse(fs.readFileSync(fixPath, 'utf8')));
  }
};