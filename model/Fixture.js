const path = require('path');
const fs = require('fs');

class Physical {
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
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

module.exports = class Fixture {
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
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
    const jsonMeta = this._jsonObject.meta;
    return {
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

  get comment() {
    return nullIfNotExists(this._jsonObject, 'comment');
  }

  get manualURL() {
    return nullIfNotExists(this._jsonObject, 'manualURL');
  }

  get physical() {
    return new Physical(this._jsonObject.physical);
  }

  get modes() {
    let modes = [];
    for (const jsonMode of this._jsonObject.modes) {
      modes.push({
        name: jsonMode.name,
        shortName: jsonMode.shortName || jsonMode.name,
        physical: 'physical' in jsonMode ? new Physical(jsonMode.physical) : null,
        channels: jsonMode.channels
      });
    }
    return modes
  }


  static fromRepository(man, fix) {
    const fixPath = path.join(__dirname, '..', 'fixtures', man, fix + '.json');
    return new this(JSON.parse(fs.readFileSync(fixPath, 'utf8')));
  }
}

function nullIfNotExists(object, key) {
  return key in object ? object[key] : null;
}