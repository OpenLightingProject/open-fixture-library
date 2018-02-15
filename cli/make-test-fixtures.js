#!/usr/bin/node

/**
 * @fileoverview This script generates a set of test fixtures that cover all defined fixture features (while
 * keeping the set as small as possible) and updates tests/test-fixtures.json and tests/test-fixtures.md.
 */

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);

const { fixtureFromRepository } = require(`../lib/model.js`);
const register = require(`../fixtures/register.json`);

const fixFeaturesDir = path.join(__dirname, `../lib/fixture-features`);
const jsonFile = path.join(__dirname, `../tests/test-fixtures.json`);
const markdownFile = path.join(__dirname, `../tests/test-fixtures.md`);


const fixFeatures = [];
const featuresUsed = {}; // feature id -> times used
for (const featureFile of fs.readdirSync(fixFeaturesDir)) {
  if (path.extname(featureFile) === `.js`) {
    // module exports array of fix features
    const fixFeatureFile = require(path.join(fixFeaturesDir, featureFile));

    for (let i = 0; i < fixFeatureFile.length; i++) {
      const fixFeature = fixFeatureFile[i];

      // default id
      if (!(`id` in fixFeature)) {
        fixFeature.id = path.basename(featureFile, `.js`);
        if (fixFeatureFile.length > 1) {
          fixFeature.id += `-${i}`;
        }
      }

      // check uniquness of id
      if (fixFeature.id in featuresUsed) {
        console.error(`${colors.red(`[Error]`)} Fix feature id ${fixFeature.id} used multiple times.`);
        process.exit(1);
      }

      fixFeatures.push(fixFeature);
      featuresUsed[fixFeature.id] = 0;
    }
  }
}

// check which features each fixture supports
let fixtures = [];
for (const man of Object.keys(register.manufacturers)) {
  for (const fixKey of register.manufacturers[man]) {
    // pre-process data
    const fix = fixtureFromRepository(man, fixKey);
    const fixResult = {
      man: man,
      key: fixKey,
      name: fix.name,
      features: []
    };

    // check all features
    for (const fixFeature of fixFeatures) {
      if (fixFeature.hasFeature(fix)) {
        fixResult.features.push(fixFeature.id);
        featuresUsed[fixFeature.id]++;
      }
    }

    fixtures.push(fixResult);
  }
}

// first fixtures are more likely to be filtered out, so we start with the ones with the fewest features
fixtures.sort((a, b) => {
  if (a.features.length === b.features.length) {
    return `${a.man}/${a.key}`.localeCompare(`${b.man}/${b.key}`, `en`);
  }

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
  return `${a.man}/${a.key}`.localeCompare(`${b.man}/${b.key}`, `en`);
});

console.log(colors.yellow(`Generated list of test fixtures:`));
for (const fixture of fixtures) {
  console.log(` - ${fixture.man}/${fixture.key}`);
}

fs.writeFile(jsonFile, JSON.stringify(fixtures, null, 2), `utf8`, error => {
  if (error) {
    console.error(`${colors.red(`[Fail]`)} Could not write test-fixtures.json`, error);
  }
  else {
    console.log(`${colors.green(`[Success]`)} Updated ${jsonFile}`);
  }
});

fs.writeFile(markdownFile, getMarkdownCode(), `utf8`, error => {
  if (error) {
    console.error(`${colors.red(`[Fail]`)} Could not write test-fixtures.md`, error);
  }
  else {
    console.log(`${colors.green(`[Success]`)} Updated ${markdownFile}`);
  }
});

/**
 * Generates a markdown table presenting the test fixtures and all fix features.
 * @returns {!string} The markdown code to be used in a markdown file.
 */
function getMarkdownCode() {
  const mdLines = [];

  // Header
  mdLines[0] = `|`;
  for (const fixture of fixtures) {
    mdLines[0] += ` | [*${fixture.man}* ${fixture.name}](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/${fixture.man}/${fixture.key}.json)`;
  }
  mdLines[1] = `|-`.repeat(fixtures.length + 1);

  // Content
  const footnotes = [];
  for (const fixFeature of fixFeatures) {
    let line = `**${fixFeature.name}**`;

    if (fixFeature.description) {
      footnotes.push(fixFeature.description);
      const n = footnotes.length;
      line += ` [[${n}]](#user-content-footnote-${n})`;
    }

    for (const fixture of fixtures) {
      line += fixture.features.includes(fixFeature.id) ? ` | ✅` : ` | ❌`;
    }

    mdLines.push(line);
  }
  mdLines.push(``);

  // Footnotes
  for (let i = 0; i < footnotes.length; i++) {
    mdLines.push(`**<a id="user-content-footnote-${i + 1}">[${i + 1}]</a>**: ${footnotes[i]}`);
    mdLines.push(``);
  }

  return mdLines.join(`\n`);
}
