#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);

const register = {
  filesystem: {},
  manufacturers: {},
  categories: {},
  contributors: {},
  rdm: {}
};
const categories = {};
const contributors = {};
const rdm = {};

const fixturePath = path.join(__dirname, `../fixtures`);

try {
  const manufacturers = JSON.parse(fs.readFileSync(path.join(fixturePath, `manufacturers.json`), `utf8`));

  // add all fixture.json files to the register
  for (const manKey of fs.readdirSync(fixturePath).sort(localeSort)) {
    const manDir = path.join(fixturePath, manKey);

    // only directories
    if (fs.statSync(manDir).isDirectory()) {
      register.manufacturers[manKey] = [];

      if (`rdmId` in manufacturers[manKey]) {
        rdm[manufacturers[manKey].rdmId] = {
          key: manKey,
          models: {}
        };
      }

      for (const filename of fs.readdirSync(manDir).sort(localeSort)) {
        if (path.extname(filename) !== `.json`) {
          continue;
        }

        const fixKey = path.basename(filename, `.json`);
        const fixData = JSON.parse(fs.readFileSync(path.join(fixturePath, manKey, filename), `utf8`));
        let isRedirect = false;
        let redirectToData = null;

        if (fixData.$schema.endsWith(`/fixture-redirect.json`)) {
          isRedirect = true;
          redirectToData = JSON.parse(fs.readFileSync(path.join(fixturePath, `${fixData.redirectTo}.json`), `utf8`));

          // add to filesystem register
          register.filesystem[`${manKey}/${fixKey}`] = {
            name: fixData.name,
            redirectTo: fixData.redirectTo,
            reason: fixData.reason
          };
        }
        else {
          let lastAction = `modified`;
          let lastModifyDate = fixData.meta.lastModifyDate;
          if (fixData.meta.lastModifyDate === fixData.meta.createDate) {
            lastAction = `created`;
          }
          else if (`importPlugin` in fixData.meta && new Date(fixData.meta.lastModifyDate) <= new Date(fixData.meta.importPlugin.date)) {
            lastAction = `imported`;
            lastModifyDate = fixData.meta.importPlugin.date;
          }

          // add to filesystem register
          register.filesystem[`${manKey}/${fixKey}`] = {
            name: fixData.name,
            lastModifyDate,
            lastAction
          };
        }

        if (!isRedirect || fixData.reason === `SameAsDifferentBrand`) {
          // add to manufacturer register
          register.manufacturers[manKey].push(fixKey);

          // add to category register
          for (const cat of fixData.categories || redirectToData.categories) {
            if (!(cat in categories)) {
              categories[cat] = [];
            }
            categories[cat].push(`${manKey}/${fixKey}`);
          }
        }

        // add to contributor register
        if (!isRedirect) {
          for (const contributor of fixData.meta.authors) {
            if (!(contributor in contributors)) {
              contributors[contributor] = [];
            }
            contributors[contributor].push(`${manKey}/${fixKey}`);
          }
        }

        // add to rdm register
        if (`rdm` in fixData) {
          rdm[manufacturers[manKey].rdmId].models[fixData.rdm.modelId] = fixKey;
        }
      }
    }
  }
}
catch (readError) {
  console.error(`Read error. `, readError);
  process.exit(1);
}

// copy sorted categories into register
for (const cat of Object.keys(categories).sort(localeSort)) {
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

// the higher the value, the higher the rank if the dates are the same
const lastActionRankMapping = {
  'modified': 10,
  'imported': 20,
  'created': 30
};

// add fixture list sorted by lastModifyDate
register.lastUpdated = Object.keys(register.filesystem).filter(
  fixtureKey => `lastModifyDate` in register.filesystem[fixtureKey]
).sort((a, b) => {
  const fixA = register.filesystem[a];
  const fixB = register.filesystem[b];
  const dateDelta = new Date(fixB.lastModifyDate) - new Date(fixA.lastModifyDate);
  const actionDelta = lastActionRankMapping[fixB.lastAction] - lastActionRankMapping[fixA.lastAction];
  const keyDelta = a > b ? 1 : a < b ? -1 : 0;
  return dateDelta !== 0 ? dateDelta : (actionDelta !== 0 ? actionDelta : keyDelta);
});

// copy sorted RDM data into register
for (const manId of Object.keys(rdm).sort(localeSort)) {
  register.rdm[manId] = {
    key: rdm[manId].key,
    models: {}
  };

  for (const fixId of Object.keys(rdm[manId].models).sort(localeSort)) {
    register.rdm[manId].models[fixId] = rdm[manId].models[fixId];
  }
}

const filename = path.join(fixturePath, (process.argv.length === 3 ? process.argv[2] : `register.json`));

fs.writeFile(filename, `${JSON.stringify(register, null, 2)}\n`, `utf8`, error => {
  if (error) {
    console.error(`${colors.red(`[Fail]`)} Could not write register file.`, error);
    process.exit(1);
  }
  console.log(`${colors.green(`[Success]`)} Updated register file ${filename}`);
  process.exit(0);
});


/**
 * Function to pass into Array.sort().
 * @param {string} a The first string.
 * @param {string} b The second string.
 * @returns {number} A number indicating the order of the two strings.
 */
function localeSort(a, b) {
  return a.localeCompare(b, `en`, {
    numeric: true
  });
}
