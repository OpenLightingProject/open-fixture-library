#!/usr/bin/node

const fs = require('fs');
const path = require('path');

let register = {
  filesystem: {},
  manufacturers: {},
  types: {}
};

const fixturePath = path.join(__dirname, 'fixtures');

const manufacturers = JSON.parse(fs.readFileSync(path.join(fixturePath, 'manufacturers.json')));

let promises = [];

// add all fixture.json files to the register
for (const man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    register.manufacturers[man] = [];

    for (const filename of fs.readdirSync(manDir)) {
      const ext = path.extname(filename);
      if (ext == '.json') {
        const fix = path.basename(filename, ext);

        // add to manufacturer register
        register.manufacturers[man].push(fix);

        // add to filesystem and type register
        promises.push(handleFile(path.join(man, filename), man, fix));
      }
    }
  }
}

function handleFile(filename, man, fix) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(fixturePath, filename), 'utf8', (error, data) => {
      if (error) {
        return reject({
          description: 'Could not read fixture file.',
          error: error
        });
      }

      const fixData = JSON.parse(data);

      register.filesystem[man + '/' + fix] = {
        name: fixData.name,
        manufacturerName: manufacturers[man].name
      };

      if (!(fixData.type in register.types)) {
        register.types[fixData.type] = [];
      }
      register.types[fixData.type].push(man + '/' + fix);

      resolve(filename);
    });
  });
}

Promise.all(promises)
  .then(fixtureFileNames => {
    const filename = path.join(fixturePath, (process.argv.length == 3 ? process.argv[2] : 'register.json'));

    fs.writeFile(filename, JSON.stringify(register, null, 2), 'utf8', error => {
      if (error) {
        console.error('Could not write register file.', error);
        process.exit(1);
      }
      console.log(`Register file ${filename} successfully written.`);
      process.exit(0);
    });
  })
  .catch(error => {
    console.error(error.description, error.error);
    process.exit(1);
  });