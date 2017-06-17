const path = require('path');
const fs = require('fs');


class Physical {
  constructor(_jsonObject) {
    this._jsonObject = _jsonObject;
    this._cache = {};
    this.now = new Date();
  }

  get dimensions() {
    return nullIfNotExists(this._jsonObject, 'dimensions');
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
    return nullIfNotExists(this._jsonObject, 'weight');
  }

  get power() {
    return nullIfNotExists(this._jsonObject, 'power');
  }

  get DMXconnector() {
    return nullIfNotExists(this._jsonObject, 'DMXconnector');
  }


  get hasBulb() {
    return 'bulb' in this._jsonObject;
  }

  get bulbType() {
    return this.hasBulb ? nullIfNotExists(this._jsonObject.bulb, 'type') : null;
  }

  get bulbColorTemperature() {
    return this.hasBulb ? nullIfNotExists(this._jsonObject.bulb, 'colorTemperature') : null;
  }

  get bulbLumens() {
    return this.hasBulb ? nullIfNotExists(this._jsonObject.bulb, 'lumens') : null;
  }


  get hasLens() {
    return 'lens' in this._jsonObject;
  }

  get lensName() {
    return this.hasLens ? nullIfNotExists(this._jsonObject.lens, 'name') : null;
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
    return this.hasFocus ? nullIfNotExists(this._jsonObject.focus, 'type') : null;
  }

  get focusPanMax() {
    return this.hasFocus ? nullIfNotExists(this._jsonObject.focus, 'panMax') : null;
  }

  get focusTiltMax() {
    return this.hasFocus ? nullIfNotExists(this._jsonObject.focus, 'tiltMax') : null;
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
    return nullIfNotExists(this._jsonObject, 'type');
  }

  get color() {
    return nullIfNotExists(this._jsonObject, 'color');
  }

  get fineChannelAliases() {
    return nullIfNotExists(this._jsonObject, 'fineChannelAliases');
  }

  get defaultValue() {
    return nullIfNotExists(this._jsonObject, 'defaultValue');
  }

  get highlightValue() {
    return nullIfNotExists(this._jsonObject, 'highlightValue');
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
    return this._jsonObject.name;
  }

  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  get categories() {
    return this._jsonObject.categories;
  }

  get mainCategory() {
    return this.categories[0];
  }

  get meta() {
    if (!('meta' in this._cache)) {
      const jsonMeta = this._jsonObject.meta;
      this._cache.meta = {
        authors: jsonMeta.authors,
        createDate: new Date(jsonMeta.createDate),
        lastModifyDate: new Date(jsonMeta.lastModifyDate),
        importPlugin: 'importPlugin' in jsonMeta ? {
          plugin: jsonMeta.importPlugin.plugin,
          date: new Date(jsonMeta.importPlugin.date),
          comment: 'comment' in jsonMeta.importPlugin ? jsonMeta.importPlugin.comment : null
        } : null
      };
    }
    return this._cache.meta;
  }

  get comment() {
    return nullIfNotExists(this._jsonObject, 'comment');
  }

  get manualURL() {
    return nullIfNotExists(this._jsonObject, 'manualURL');
  }

  /*
    benchmark results (10,000,000 iterations):
    - without cache: ~1.9s
    - with cache: ~0.52s (nearly 4 times faster!)
    => that proofs why caching, even for these small objects, is useful
  */
  get physical() {
    if (!('physical' in this._cache)) {
      this._cache.physical = new Physical(this._jsonObject.physical);
    }

    return this._cache.physical;
  }

  get channelKeys() {
    return Object.keys(this._jsonObject.availableChannels);
  }

  getChannelByKey(key) {
    if (key in this._jsonObject.availableChannels) {
      return new Channel(this._jsonObject.availableChannels[key], key);
    }
  }

  get modes() {
    if (!('modes' in this._cache)) {
      this._cache.modes = [];
      for (const jsonMode of this._jsonObject.modes) {
        this._cache.modes.push({
          name: jsonMode.name,
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


function nullIfNotExists(object, key) {
  return key in object ? object[key] : null;
}