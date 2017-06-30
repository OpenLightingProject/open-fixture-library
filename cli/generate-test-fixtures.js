#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const Fixture = require(path.join(__dirname, '..', 'lib', 'model', 'Fixture.js'));

const args = minimist(process.argv.slice(2), {
  boolean: ['all', 'help'],
  alias: { all: 'a', help: 'h' }
});

const helpMessage = [
  'Generates a possibly small set of test fixtures that use all defined fixture features, outputs a markdown code to use in GitHub wiki and updates the tests/test-fixtures.json file.',
  `Usage: ${process.argv[1]} [-a | --all]`,
  'Options:',
  '  --all,  -a: Output markdown with all fixtures and don\'t update test-fixtures.json.',
  '  --help, -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

const fixFeaturesDir = path.join(__dirname, 'fixture-features');
const fixturesDir = path.join(__dirname, '..', 'fixtures');

let fixFeatures = [];
let featuresUsed = {}; // feature id -> times used
for (const featureFile of fs.readdirSync(fixFeaturesDir)) {
  if (path.extname(featureFile) === '.js') {
    // module exports array of fix features
    const fixFeatureFile = require(path.join(fixFeaturesDir, featureFile));

    for (let i = 0; i < fixFeatureFile.length; i++) {
      const fixFeature = fixFeatureFile[i];

      // default id
      if (!('id' in fixFeature)) {
        fixFeature.id = path.basename(featureFile, '.js');
        if (fixFeatureFile.length > 1) {
          fixFeature.id += `-${i}`;
        }
      }

      // check uniquness of id
      if (fixFeature.id in featuresUsed) {
        console.error(colors.red('[Error]') + ` Fix feature id ${fixFeature.id} used multiple times.`);
        process.exit(1);
      }

      // default order
      if (!('order' in fixFeature)) {
        fixFeature.order = 0;
      }

      fixFeatures.push(fixFeature);
      featuresUsed[fixFeature.id] = 0;
    }
  }
}
fixFeatures.sort((a, b) => {
  if (a.order === b.order) {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    else if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
  }
  return b.order - a.order;
});


// check which features each fixture supports
let fixtures = [];
const manufacturers = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'register.json'), 'utf8')).manufacturers;
for (const man of Object.keys(manufacturers)) {
  for (const fixKey of manufacturers[man]) {
    // pre-process data
    let fix = Fixture.fromRepository(man, fixKey);
    let fixResult = {
      man: man,
      key: fixKey,
      name: fix.name,
      features: []
    };
    fixtures.push(fixResult);

    // check all features
    for (const fixFeature of fixFeatures) {
      if (fixFeature.hasFeature(fix)) {
        fixResult.features.push(fixFeature.id);
        featuresUsed[fixFeature.id]++;
      }
    }
  }
}

// compress list
if (!args.all) {
  // sort out fixtures with least features first
  fixtures.sort((a, b) => {
    return a.features.length - b.features.length;
  });
  // sort out
  fixtures = fixtures.filter(fixture => {
    for (const feature of fixture.features) {
      // there's only one fixture that has this feature
      // this must be the current fixture, so we keep it
      if (featuresUsed[feature] === 1) {
        return true;
      }
    }
    // has no new features, so remove it
    for (const feature of fixture.features) {
      featuresUsed[feature]--;
    }
    return false;
  });
  // original ordering
  fixtures.sort((a, b) => {
    const manFixA = `${a.man}/${a.key}`;
    const manFixB = `${b.man}/${b.key}`;
    return manFixA > manFixB ? 1 : manFixA < manFixB ? -1 : 0;
  });

  console.log(colors.yellow('Generated list of test fixtures:'));
  for (const fixture of fixtures) {
    console.log(` - ${fixture.man}/${fixture.key}`);
  }
  let testFixturesFile = path.join(__dirname, '..', 'tests', 'test-fixtures.json');
  fs.writeFileSync(testFixturesFile, JSON.stringify(fixtures, null, 2));
  console.log(`\nSuccessfully updated ${testFixturesFile}.\n`);
}

// generate markdown code
let mdLines = [];
mdLines[0] = '|';
for (const fixFeature of fixFeatures) {
  mdLines[0] += ' | ';
  mdLines[0] += 'description' in fixFeature ? `<abbr title="${fixFeature.description}">${fixFeature.name}</abbr>` : fixFeature.name;
}
mdLines[1] = '|-'.repeat(fixFeatures.length + 1);
for (const fixture of fixtures) {
  let line = `[*${fixture.man}* **${fixture.name}**](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/${fixture.man}/${fixture.key}.json)`;

  for (const fixFeature of fixFeatures) {
    line += fixture.features.includes(fixFeature.id) ? ' | :white_check_mark:' : ' | :x:';
  }

  mdLines.push(line);
}
console.log(colors.yellow('Markdown code (e.g. for usage in GitHub wiki):'));
console.log(mdLines.join('\n'));