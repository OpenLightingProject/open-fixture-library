#!/usr/bin/node

/**
 * @fileoverview This script generates a set of test fixtures that cover all defined fixture features (while
 * keeping the set as small as possible) and updates tests/test-fixtures.json and tests/test-fixtures.md.
 */

const { readdir, writeFile } = require(`fs/promises`);
const path = require(`path`);
const chalk = require(`chalk`);

const { fixtureFromRepository } = require(`../lib/model.js`);
const register = require(`../fixtures/register.json`);
const manufacturers = require(`../fixtures/manufacturers.json`);

const fixtureFeaturesDirectory = path.join(__dirname, `../lib/fixture-features`);
const jsonFile = path.join(__dirname, `../tests/test-fixtures.json`);
const markdownFile = path.join(__dirname, `../tests/test-fixtures.md`);

/**
 * @typedef {Object} FixtureFeature
 * @property {String|undefined} id The fixture feature's ID
 * @property {String} name A short name of the fixture feature.
 * @property {String} description A longer description of the fixture feature.
 * @property {Function} hasFeature A function that returns whether a given fixture supports this feature.
 */

/**
 * @typedef {Object} FixtureFeatureResult
 * @property {String} man The fixture manufacturer's name.
 * @property {String} key The combined manufacturer/fixture key.
 * @property {String} name The fixture name.
 * @property {Array.<String>} features The IDs of all fixture features that the fixture supports.
 */

(async () => {
  const fixtureFeatures = await getFixtureFeatures();
  const featuresUsed = Object.fromEntries(fixtureFeatures.map(feature => [feature.id, 0]));// check which features each fixture supports

  /** @type {Array.<FixtureFeatureResult>} */
  let fixtures = [];

  for (const manufacturerFixture of Object.keys(register.filesystem)) {
    const [manufacturerKey, fixtureKey] = manufacturerFixture.split(`/`);

    // pre-process data
    const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);
    const fixtureResult = {
      man: manufacturerKey,
      key: fixtureKey,
      name: fixture.name,
      features: [],
    };

    // check all features
    for (const fixtureFeature of fixtureFeatures) {
      if (fixtureFeature.hasFeature(fixture)) {
        fixtureResult.features.push(fixtureFeature.id);
        featuresUsed[fixtureFeature.id]++;
      }
    }

    fixtures.push(fixtureResult);
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

  console.log(chalk.yellow(`Generated list of test fixtures:`));
  for (const fixture of fixtures) {
    console.log(` - ${fixture.man}/${fixture.key}`);
  }

  try {
    await writeFile(jsonFile, `${JSON.stringify(fixtures, null, 2)}\n`, `utf8`);
    console.log(chalk.green(`[Success]`), `Updated ${jsonFile}`);

    await writeFile(markdownFile, getMarkdownCode(fixtures, fixtureFeatures), `utf8`);
    console.log(chalk.green(`[Success]`), `Updated ${markdownFile}`);
  }
  catch (error) {
    console.error(chalk.red(`[Fail]`), `Could not write test fixtures file:`, error);
  }
})();


/**
 * @returns {Promise.<Array.<FixtureFeature>>} A Promise that resolves to an array of all defined fixture features.
 */
async function getFixtureFeatures() {
  const fixtureFeatures = [];

  for (const featureFile of await readdir(fixtureFeaturesDirectory)) {
    if (path.extname(featureFile) !== `.js`) {
      continue;
    }

    // module exports array of fix features
    const fixtureFeatureFile = require(path.join(fixtureFeaturesDirectory, featureFile));

    for (const [index, fixtureFeature] of fixtureFeatureFile.entries()) {
      // default id
      if (!(`id` in fixtureFeature)) {
        fixtureFeature.id = path.basename(featureFile, `.js`);
        if (fixtureFeatureFile.length > 1) {
          fixtureFeature.id += `-${index}`;
        }
      }

      // check uniqueness of id
      const featureIdExists = fixtureFeatures.some(feature => feature.id === fixtureFeature.id);
      if (featureIdExists) {
        console.error(chalk.red(`[Error]`), `Fixture feature id '${fixtureFeature.id}' is used multiple times.`);
        process.exit(1);
      }

      fixtureFeatures.push(fixtureFeature);
    }
  }

  return fixtureFeatures;
}

/**
 * Generates a markdown table presenting the test fixtures and all fix features.
 * @param {Array.<FixtureFeatureResult>} fixtures The fixture feature results.
 * @param {Array.<FixtureFeature>} fixtureFeatures All fixture features.
 * @returns {String} The markdown code to be used in a markdown file.
 */
function getMarkdownCode(fixtures, fixtureFeatures) {
  const mdLines = [
    `# Test fixtures`,
    ``,
    `See the [fixture feature documentation](../docs/fixture-features.md). This file is automatically`,
    `generated by [\`cli/make-test-fixtures.js\`](../cli/make-test-fixtures.js).`,
    ``,
    ...fixtures.map(
      (fixture, index) => `${index + 1}. [*${manufacturers[fixture.man].name}* ${fixture.name}](../fixtures/${fixture.man}/${fixture.key}.json)`,
    ),
    ``,
  ];

  // table head
  const tableHead = [`*Fixture number*`, ...fixtures.map((fixture, index) => index + 1)].join(` | `);

  mdLines.push(tableHead);
  mdLines.push(`|-`.repeat(fixtures.length + 1));

  // table body
  const footnotes = [];
  fixtureFeatures.forEach((fixtureFeature, index) => {
    let line = `**${fixtureFeature.name}**`;

    if (fixtureFeature.description) {
      footnotes.push(fixtureFeature.description);
      const n = footnotes.length;
      line += ` [<sup>[${n}]</sup>](#user-content-footnote-${n})`;
    }

    for (const fixture of fixtures) {
      line += fixture.features.includes(fixtureFeature.id) ? ` | ✅` : ` | ❌`;
    }

    mdLines.push(line);

    // repeat table head
    if ((index + 1) % 15 === 0) {
      mdLines.push(tableHead);
    }
  });
  mdLines.push(``);

  // footnotes
  mdLines.push(`## Footnotes`, ``);
  for (const [index, footnote] of footnotes.entries()) {
    mdLines.push(`**<a id="user-content-footnote-${index + 1}">[${index + 1}]</a>**: ${footnote}  `);
  }
  mdLines.push(``);

  return mdLines.join(`\n`);
}
