const fs = require('fs');
const path = require('path');
const colors = require('colors');

let failed = false;

const fixturePath = path.join(__dirname, '..', 'fixtures');

let manData = JSON.parse(fs.readFileSync(path.join(fixturePath, 'manufacturers.json'), 'utf8'));

// get index (and adjust the fixtures' names)
const indexPath = path.join(fixturePath, 'index_manufacturers.json');
let index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log('Parsing index file ' + indexPath);
for (const man in index) {
  for (const i in index[man]) {
    index[man][i] = path.join(man, index[man][i]);
  }
}

// get actual data from file system
let fsData = {};
for (const man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    fsData[man] = [];

    for (const fixture of fs.readdirSync(manDir)) {
      const ext = path.extname(fixture);
      if (ext == '.json') {
        fsData[man].push(path.join(man, path.basename(fixture, ext)));
      }
    }
  }
}

// manData and index must mention the same manufacturers
const sameManufacturers = Object.keys(index).every(man => {
  if (man in manData) {
    delete manData[man];
    return true;
  }
  console.error(colors.red('Error:') + ` Manufacturer '${man}' mentioned in index but not in manufacturer data.`);
  return false;
});
if (!sameManufacturers) {
  failed = true;
}
else if (Object.keys(manData).length > 0) {
  console.error(colors.red('Error:') + ` Manufacturers [${Object.keys(manData)}] mentioned in manufacturer data but not in index.`);
  failed = true;
}

// all manufacturers with fixtures and all fixtures themselves mentioned in index must be in fsData
for (const man in index) {
  if (index[man].length > 0) {
    if (fsData[man] === undefined) {
      console.error(colors.red('Error:') + ` Manufacturer '${man}' is mentioned in index but not present in file structure.`);
      failed = true;
    }
    else {
      for (const fixture of index[man]) {
        if (!fsData[man].includes(fixture)) {
          console.error(colors.red('Error:') + ` Fixture '${fixture}' is mentioned in index but not present in file structure.`);
          failed = true;
        }
      }
    }
  }
}

// all manufacturers and fixtures mentioned in fsData must be in index
for (const man in fsData) {
  if (index[man] === undefined) {
    console.error(colors.red('Error:') + ` Manufacturer '${man}' is present in file structure but not mentioned in index.`);
    failed = true;
  }
  else {
    for (const fixture of fsData[man]) {
      if (!index[man].includes(fixture)) {
        console.error(colors.red('Error:') + ` Fixture '${fixture}' is present in file structure but not mentioned in index.`);
        failed = true;
      }
    }
  }
}

if (!failed) {
  console.log('\n' + colors.green('[PASS]') + ' Data in index file has no conflicts with actual data in file system.');
  process.exit(0);
}
console.error('\n' + colors.red('[FAIL]') + ' Test failed with errors (see above).');
process.exit(1);