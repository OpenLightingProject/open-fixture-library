const path = require('path');

const manufacturers = require(path.join(__dirname, '..', '..', 'fixtures', 'manufacturers'));

module.exports = class Manufacturer {
  constructor(man) {
    this.key = man;
  }

  get name() {
    return manufacturers[this.key].name;
  }

  get website() {
    return manufacturers[this.key].website || null;
  }

  get comment() {
    return manufacturers[this.key].comment || '';
  }
};