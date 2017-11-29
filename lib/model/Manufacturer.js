const path = require('path');

let manufacturers;
const manufacturerDataPath = path.join(__dirname, '../../fixtures/manufacturers.json');

const Manufacturer = class {
  constructor(man) {
    this.key = man;
  }

  get name() {
    return manufacturers[this.key].name;
  }

  get comment() {
    return manufacturers[this.key].comment || '';
  }

  get hasComment() {
    return 'comment' in manufacturers[this.key];
  }

  get website() {
    return manufacturers[this.key].website || null;
  }

  get rdmId() {
    return manufacturers[this.key].rdmId || null;
  }

  static reloadManufacturerData() {
    delete require.cache[require.resolve(manufacturerDataPath)];
    manufacturers = require(manufacturerDataPath);
  }
};

Manufacturer.reloadManufacturerData();

module.exports = Manufacturer;
