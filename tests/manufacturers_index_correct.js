const fs = require('fs');
const path = require('path');
const colors = require('colors');

let failed = false;

// get index (and adjust the fixtures' names)
const fixturePath = path.join(__dirname, '..', 'fixtures');
const index = JSON.parse(fs.readFileSync(path.join(fixturePath, 'index_manufacturers.json'), 'utf8'));
for (let man in index) {
  for (let i in index[man]) {
    index[man][i] = path.join(man, index[man][i]);
  }
}

// get actual data from file system
const data = {};
for (let man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    data[man] = [];

    for (let fixture of fs.readdirSync(manDir)) {
      const ext = path.extname(fixture);
      if (ext == '.json') {
        data[man].push(path.join(man, path.basename(fixture, ext)));
      }
    }
  }
}

// all manufacturers with fixtures and all fixtures themselves mentioned in index must be in data
for (let man in index) {
  if (index[man].length > 0) {
    if (data[man] === undefined) {
      console.error(colors.red(`Error: Manufacturer '${man}' is mentioned in index but not present in file structure.`));
      failed = true;
    }
    else {
      for (let fixture of index[man]) {
        if (!data[man].includes(fixture)) {
          console.error(colors.red(`Error: Fixture '${fixture}' is mentioned in index but not present in file structure.`));
          failed = true;
        }
      }
    }
  }
}

// all manufacturers and fixtures mentioned in data must be in index
for (let man in data) {
  if (index[man] === undefined) {
    console.error(colors.red(`Error: Manufacturer '${man}' is present in file structure but not mentioned in index.`));
    failed = true;
  }
  else {
    for (let fixture of data[man]) {
      if (!index[man].includes(fixture)) {
        console.error(colors.red(`Error: Fixture '${fixture}' is present in file structure but not mentioned in index.`));
        failed = true;
      }
    }
  }
}

if (!failed) {
  console.log(colors.green('Test passed.'));
  process.exit(0);
}
process.exit(1);