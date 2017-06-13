const path = require('path');
const fs = require('fs');

module.exports = class Fixture {
  constructor(jsonFixture) {
    this.jsonFixture = jsonFixture;
  }

  static fromRepository(man, fix) {
    const fixPath = path.join(__dirname, '..', 'fixtures', man, fix + '.json');
    return new this(fs.readFileSync(fixPath, 'utf8'));
  }
}