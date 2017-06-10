#!/usr/bin/node

const fs = require('fs');
const path = require('path');

let register = {
  filesystem: {},
  manufacturers: {},
  categories: {}
};

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
            if (!(cat in register.categories)) {
              register.categories[cat] = [];
            }
            register.categories[cat].push(man + '/' + fix);
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

const filename = path.join(fixturePath, (process.argv.length === 3 ? process.argv[2] : 'register.json'));

fs.writeFile(filename, JSON.stringify(register, null, 2), 'utf8', error => {
  if (error) {
    console.error('Could not write register file.', error);
    process.exit(1);
  }
  console.log(`Register file ${filename} successfully written.`);
  process.exit(0);
});