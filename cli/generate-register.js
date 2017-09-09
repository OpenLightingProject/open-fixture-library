#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const colors = require('colors');

let register = {
  filesystem: {},
  manufacturers: {},
  categories: {}
};
let categories = {};

const fixturePath = path.join(__dirname, '..', 'fixtures');

try {
  // add all fixture.json files to the register
  for (const man of fs.readdirSync(fixturePath).sort()) {
    const manDir = path.join(fixturePath, man);

    // only directories
    if (fs.statSync(manDir).isDirectory()) {
      register.manufacturers[man] = [];

      for (const filename of fs.readdirSync(manDir).sort()) {
        const ext = path.extname(filename);
        if (ext === '.json') {
          const fix = path.basename(filename, ext);

          // add to manufacturer register
          register.manufacturers[man].push(fix);

          // add to filesystem and type register
          const fixData = JSON.parse(fs.readFileSync(path.join(fixturePath, man, filename), 'utf8'));

          register.filesystem[man + '/' + fix] = {
            name: fixData.name
          };

          for (const cat of fixData.categories) {
            if (!(cat in categories)) {
              categories[cat] = [];
            }
            categories[cat].push(man + '/' + fix);
          }
        }
      }
    }
  }
}
catch (readError) {
  console.error('Read error. ', readError);
  process.exit(1);
}

// copy sorted categories into register
for (const cat of Object.keys(categories).sort()) {
  register.categories[cat] = categories[cat];
}

const filename = path.join(fixturePath, (process.argv.length === 3 ? process.argv[2] : 'register.json'));

fs.writeFile(filename, JSON.stringify(register, null, 2), 'utf8', error => {
  if (error) {
    console.error('Could not write register file.', error);
    process.exit(1);
  }
  console.log(colors.green('[Success]') + ` Register file ${filename} successfully written.`);
  console.log(colors.yellow('[Info]') + ' If new fixtures were added, it may be worth generating a new set of test fixtures by running ' + colors.yellow('node cli/generate-test-fixtures.js') + '.');
  process.exit(0);
});
