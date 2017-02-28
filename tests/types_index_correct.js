const fs = require('fs');
const path = require('path');
const colors = require('colors');

let failed = false;

const fixturePath = path.join(__dirname, '..', 'fixtures');

// get index
const indexPath = path.join(fixturePath, 'index_types.json');
let index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log('Parsing types index file ' + indexPath);


// reverse `f(type) -> fixtures` to `f(fixture) -> type`
// (mathematical notation)
const fixtureTypes = {};
for (const type in index) {
  for (const fixture of index[type]) {
    if (fixtureTypes[fixture] === undefined) {
      fixtureTypes[fixture] = [type];
    }
    else {
      fixtureTypes[fixture].push(type);
    }
  }
}
console.log(fixtureTypes);