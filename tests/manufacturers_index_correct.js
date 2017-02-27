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
for (const man in manData) {
  failed = true;
  console.error(colors.red('Error:') + ` Manufacturer '${man}' is mentioned in manufacturer data but not in index.`);
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
    for (const i in indexFixtures) {
      const fixture = indexFixtures[i];
      if (fsDataFixtures !== undefined && fsDataFixtures.includes(fixture)) {
        delete fsDataFixtures[fsDataFixtures.indexOf(fixture)];
      }
      else {
        failed = true;
        if (indexFixtures.indexOf(fixture) != i) {
          console.error(colors.red('Error:') + ` Index has already mentioned fixture '${fixture}' of manufacturer '${man}' before.`);
        }
        else {
          console.error(colors.red('Error:') + ` Index mentions fixture '${fixture}' of manufacturer '${man}' which is not present in file structure.`);
        }
      }
    }

    if (fsDataFixtures !== undefined) {
      for (const fixture of fsDataFixtures) {
        if (fixture !== undefined) {
          failed = true;
          console.error(colors.red('Error:') + ` Fixture '${fixture}' of manufacturer '${man}' is present in file structure but not mentioned in index.`);
        }
      }
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