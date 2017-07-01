const path = require('path');

let manufacturers;
const manufacturerDataPath = path.join(__dirname, '..', '..', 'fixtures', 'manufacturers');

const Manufacturer = class {
  constructor(man) {
    this.key = man;
  }

  get name() {
    return manufacturers[this.key].name;
  }

  get website() {
    return manufacturers[this.key].website || null;
  }

  get hasComment() {
    return 'comment' in manufacturers[this.key];
  }

  get comment() {
    return manufacturers[this.key].comment || '';
  }

  static reloadManufacturerData() {
    delete require.cache[require.resolve(manufacturerDataPath)];
    manufacturers = require(manufacturerDataPath);
  }
};

Manufacturer.reloadManufacturerData();

module.exports = Manufacturer;