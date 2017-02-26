const fs = require('fs');
const path = require('path');
const colors = require('colors');

let failed = false;

const fixturePath = path.join(__dirname, '..', 'fixtures');

// get index (and adjust the fixtures' names)
const indexPath = path.join(fixturePath, 'index_manufacturers.json')
let index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log('Parsing index file ' + indexPath);
for (const man in index) {
  for (const i in index[man]) {
    index[man][i] = path.join(man, index[man][i]);
  }
}

// get actual data from file system
let data = {};
for (const man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    data[man] = [];

    for (const fixture of fs.readdirSync(manDir)) {
      const ext = path.extname(fixture);
      if (ext == '.json') {
        data[man].push(path.join(man, path.basename(fixture, ext)));
      }
    }
  }
}

// all manufacturers with fixtures and all fixtures themselves mentioned in index must be in data
for (const man in index) {
  if (index[man].length > 0) {
    if (data[man] === undefined) {
      console.error(colors.red('Error:') + ` Manufacturer '${man}' is mentioned in index but not present in file structure.`);
      failed = true;
    }
    else {
      for (const fixture of index[man]) {
        if (!data[man].includes(fixture)) {
          console.error(colors.red('Error:') + ` Fixture '${fixture}' is mentioned in index but not present in file structure.`);
          failed = true;
        }
      }
    }
  }
}

// all manufacturers and fixtures mentioned in data must be in index
for (const man in data) {
  if (index[man] === undefined) {
    console.error(colors.red('Error:') + ` Manufacturer '${man}' is present in file structure but not mentioned in index.`);
    failed = true;
  }
  else {
    for (const fixture of data[man]) {
      if (!index[man].includes(fixture)) {
        console.error(colors.red('Error:') + ` Fixture '${fixture}' is present in file structure but not mentioned in index.`);
        failed = true;
      }
    }
  }
}

if (!failed) {
  console.log(colors.green('[PASS]') + ' Data in index file has no conflicts with actual data in file system.');
  process.exit(0);
}
console.error(colors.red('[FAIL]') + ' Test failed with errors (see above).');
process.exit(1);