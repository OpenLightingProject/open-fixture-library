#!/usr/bin/node

/**
 * This script generates a possibly small set of test fixtures that use all defined fixture features
 * and updates tests/test-fixtures.json and tests/test-fixtures.md.
 */

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const colors = require('colors');

const Fixture = require('../lib/model/Fixture.js');

const args = minimist(process.argv.slice(2), {
  boolean: ['help'],
  alias: { all: 'a', help: 'h' }
});

const fixFeaturesDir = path.join(__dirname, 'fixture-features');
const fixturesDir = path.join(__dirname, '..', 'fixtures');

const fixFeatures = [];
const featuresUsed = {}; // feature id -> times used
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
        console.error(`${colors.red('[Error]')} Fix feature id ${fixFeature.id} used multiple times.`);
        process.exit(1);
      }

      fixFeatures.push(fixFeature);
      featuresUsed[fixFeature.id] = 0;
    }
  }
}

// check which features each fixture supports
let fixtures = [];
const manufacturers = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'register.json'), 'utf8')).manufacturers;
for (const man of Object.keys(manufacturers)) {
  for (const fixKey of manufacturers[man]) {
    // pre-process data
    const fix = Fixture.fromRepository(man, fixKey);
    const fixResult = {
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

// first fixtures are more likely to be filtered out, so we start with the ones with the fewest features
fixtures.sort((a, b) => {
  return a.features.length - b.features.length;
});
// filter out
fixtures = fixtures.filter(fixture => {
  for (const feature of fixture.features) {
    // this is the only remaining fixture with that feature -> keep it
    if (featuresUsed[feature] === 1) {
      return true;
    }
  }
  // has no new features -> filter out
  for (const feature of fixture.features) {
    featuresUsed[feature]--;
  }
  return false;
});
// original alphabetic ordering
fixtures.sort((a, b) => {
  const manFixA = `${a.man}/${a.key}`;
  const manFixB = `${b.man}/${b.key}`;
  return manFixA > manFixB ? 1 : manFixA < manFixB ? -1 : 0;
});

console.log(colors.yellow('Generated list of test fixtures:'));
for (const fixture of fixtures) {
  console.log(` - ${fixture.man}/${fixture.key}`);
}

const jsonFile = path.join(__dirname, '../tests/test-fixtures.json');
fs.writeFileSync(jsonFile, JSON.stringify(fixtures, null, 2));
console.log(`\nUpdated ${jsonFile}`);

const markdownFile = path.join(__dirname, '../tests/test-fixtures.md');
fs.writeFileSync(markdownFile, getMarkdownCode());
console.log(`Updated ${markdownFile}`);


function getMarkdownCode() {
  let mdLines = [];

  // Header
  mdLines[0] = '|';
  for (const fixture of fixtures) {
    mdLines[0] +=` | [*${fixture.man}* ${fixture.name}](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/${fixture.man}/${fixture.key}.json)`;
  }
  mdLines[1] = '|-'.repeat(fixtures.length + 1);

  // Content
  let footnotes = [];
  for (const fixFeature of fixFeatures) {
    let line = `**${fixFeature.name}**`;
    
    if (fixFeature.description) {
      footnotes.push(fixFeature.description);
      const n = footnotes.length;
      line += ` [[${n}]](#user-content-footnote-${n})`;
    }

    for (const fixture of fixtures) {
      line += fixture.features.includes(fixFeature.id) ? ' | ✅' : ' | ❌';
    }

    mdLines.push(line);
  }
  mdLines.push('');

  // Footnotes
  for (let i = 0; i < footnotes.length; i++) {
    mdLines.push(`**<a id="user-content-footnote-${i+1}">[${i+1}]</a>**: ${footnotes[i]}`);
    mdLines.push('');
  }

  return mdLines.join('\n');
}
