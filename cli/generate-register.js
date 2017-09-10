#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const colors = require('colors');

let register = {
  filesystem: {},
  manufacturers: {},
  categories: {},
  contributors: {}
};
let categories = {};
let contributors = {};

const fixturePath = path.join(__dirname, '..', 'fixtures');

try {
  // add all fixture.json files to the register
  for (const manKey of fs.readdirSync(fixturePath).sort()) {
    const manDir = path.join(fixturePath, manKey);

    // only directories
    if (fs.statSync(manDir).isDirectory()) {
      register.manufacturers[manKey] = [];

      for (const filename of fs.readdirSync(manDir).sort()) {
        const ext = path.extname(filename);
        if (ext === '.json') {
          const fixKey = path.basename(filename, ext);
          const fixData = JSON.parse(fs.readFileSync(path.join(fixturePath, manKey, filename), 'utf8'));

          // add to filesystem register
          register.filesystem[manKey + '/' + fixKey] = {
            name: fixData.name,
            lastModifyDate: fixData.meta.lastModifyDate
          };
          
          // add to manufacturer register
          register.manufacturers[manKey].push(fixKey);

          // add to category register
          for (const cat of fixData.categories) {
            if (!(cat in categories)) {
              categories[cat] = [];
            }
            categories[cat].push(manKey + '/' + fixKey);
          }

          // add to contributor register
          for (const contributor of fixData.meta.authors) {
            if (!(contributor in contributors)) {
              contributors[contributor] = [];
            }
            contributors[contributor].push(manKey + '/' + fixKey);
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

// copy sorted contributors into register
const sortedContributors = Object.keys(contributors).sort(
  (a, b) => contributors[b].length - contributors[a].length
);
for (const contributor of sortedContributors) {
  register.contributors[contributor] = contributors[contributor];
}

// add fixture list sorted by lastModifyDate
register.latest = Object.keys(register.filesystem).sort((a, b) => {
  const aDate = new Date(register.filesystem[a].lastModifyDate);
  const bDate = new Date(register.filesystem[b].lastModifyDate);
  return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
});

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
