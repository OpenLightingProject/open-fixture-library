const fs = require('fs');
const path = require('path');
const colors = require('colors');

let failed = false;

const fixturePath = path.join(__dirname, '..', 'fixtures');

// get manufacturer data
const manDataPath = path.join(fixturePath, 'manufacturers.json');
let manData = JSON.parse(fs.readFileSync(manDataPath, 'utf8'));
console.log('Parsing manufacturer data file ' + manDataPath);

// get index
const indexPath = path.join(fixturePath, 'index_manufacturers.json');
let index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log('Parsing manufacturers index file ' + indexPath);

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
        fsData[man].push(path.basename(fixture, ext));
      }
    }
  }
}


console.log('\nTesting if manufacturer data and index mention the same manufacturers.')
for (const man in index) {
  if (man in manData) {
    delete manData[man];
  }
  else {
    failed = true;
    console.error(colors.red('Error:') + ` Manufacturer '${man}' is mentioned in index but not in manufacturer data.`);
  }
}
if (Object.keys(manData).length > 0) {
  for (const man in manData) {
    console.error(colors.red('Error:') + ` Manufacturer '${man}' is mentioned in manufacturer data but not in index.`);
  }
  failed = true;
}
if (!failed) {
  console.log(colors.green('[PASS]') + ' Manufacturer data and index mention the same manufacturers.');
}


console.log('\nTesting if index mentions all manufacturers which are present in file structure.');
let lastFailed = failed;
failed = false;
for (const man in fsData) {
  if (!(man in index)) {
    failed = true;
    console.error(colors.red('Error:') + ` Manufacturer '${man}' is present in file structure but not mentioned in index.`);
  }
}
if (!failed) {
  console.log(colors.green('[PASS]') + ' Index mentions all manufacturers which are present in file structure.');
  failed = lastFailed;
}


console.log('\nTesting if index and file structure mention the same fixtures.');
lastFailed = failed;
failed = false;
for (const man in index) {
  const indexFixtures = index[man];
  const fsDataFixtures = fsData[man];

  if (indexFixtures.length > 0 || fsDataFixtures !== undefined) {
    indexFixtures.sort();
    if (fsDataFixtures !== undefined) {
      fsDataFixtures.sort();
    }

    const indexFixturesJSON = JSON.stringify(indexFixtures);
    const fsDataFixturesJSON = JSON.stringify(fsDataFixtures);

    if (indexFixturesJSON != fsDataFixturesJSON) {
      failed = true;
      console.error(colors.red('Error:') + ` Fixtures of manufacturer '${man}' mentioned in index doen't equal the fixtures which are present in file structure.`);
      console.error('From index:     ' + indexFixturesJSON);
      console.error('File structure: ' + fsDataFixturesJSON);
    }
  }
}
if (!failed) {
  console.log(colors.green('[PASS]') + ' Index and file structure mention the same fixtures.');
  failed = lastFailed;
}


if (failed) {
  console.error('\n' + colors.red('[FAIL]') + ' Test failed with errors (see above).');
  process.exit(1);
}
process.exit(0);