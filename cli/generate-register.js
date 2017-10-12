#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const colors = require('colors');

let register = {
  filesystem: {},
  manufacturers: {},
  categories: {},
  contributors: {},
  rdm: {}
};
let categories = {};
let contributors = {};

const fixturePath = path.join(__dirname, '..', 'fixtures');

try {
  const manufacturers = JSON.parse(fs.readFileSync(path.join(fixturePath, 'manufacturers.json'), 'utf8'));

  // add all fixture.json files to the register
  for (const manKey of fs.readdirSync(fixturePath).sort()) {
    const manDir = path.join(fixturePath, manKey);

    // only directories
    if (fs.statSync(manDir).isDirectory()) {
      register.manufacturers[manKey] = [];

      if ('rdmId' in manufacturers[manKey]) {
        register.rdm[manufacturers[manKey].rdmId] = {
          key: manKey,
          models: {}
        };
      }

      for (const filename of fs.readdirSync(manDir).sort()) {
        const ext = path.extname(filename);
        if (ext === '.json') {
          const fixKey = path.basename(filename, ext);
          const fixData = JSON.parse(fs.readFileSync(path.join(fixturePath, manKey, filename), 'utf8'));

          let lastAction = 'modified';
          if (fixData.meta.lastModifyDate === fixData.meta.createDate) {
            lastAction = 'created';
          }
          else if ('importPlugin' in fixData.meta && fixData.meta.lastModifyDate === fixData.meta.importPlugin) {
            lastAction = 'imported';
          }

          // add to filesystem register
          register.filesystem[manKey + '/' + fixKey] = {
            name: fixData.name,
            lastModifyDate: fixData.meta.lastModifyDate,
            lastAction: lastAction
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

          // add to rdm register
          if ('rdm' in fixData) {
            register.rdm[manufacturers[manKey].rdmId].models[fixData.rdm.modelId] = fixKey;
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
const sortedContributors = Object.keys(contributors).sort((a, b) => {
  const fixturesDelta = contributors[b].length - contributors[a].length;
  const nameDelta = a > b ? 1 : a < b ? -1 : 0;
  return fixturesDelta !== 0 ? fixturesDelta : nameDelta;
});
for (const contributor of sortedContributors) {
  register.contributors[contributor] = contributors[contributor];
}

// add fixture list sorted by lastModifyDate
register.lastUpdated = Object.keys(register.filesystem).sort((a, b) => {
  const fixA = register.filesystem[a];
  const fixB = register.filesystem[b];
  const dateDelta = new Date(fixB.lastModifyDate) - new Date(fixA.lastModifyDate);
  const keyDelta = a > b ? 1 : a < b ? -1 : 0;
  return dateDelta !== 0 ? dateDelta : keyDelta;
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
