#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  boolean: ['compress', 'help'],
  alias: { compress: 'c', help: 'h' }
});

const helpMessage = [
  'Generates a markdown table with all fixtures and the features they support.',
  `Usage: ${process.argv[1]} [-c <compress>]`,
  'Options:',
  '  --compress, -c: Reduce fixture list size by sorting out fixtures that don\'t use new features,',
  '                  beginning with the fixtures using the least count of features',
  '  --help,     -h: Show this help message.'
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
    let fixFeature = require(path.join(fixFeaturesDir, featureFile));
    fixFeature.id = path.basename(featureFile, '.js');
    if (!('order' in fixFeature)) {
      fixFeature.order = 0;
    }
    fixFeatures.push(fixFeature);
    featuresUsed[fixFeature.id] = 0;
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
let fixtures = []; // [{manFix: "man/fix", features: [used features]]
const manufacturers = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'register.json'), 'utf8')).manufacturers;
for (const man of Object.keys(manufacturers)) {
  for (const fix of manufacturers[man]) {
    const manFix = `${man}/${fix}`;
    let fixture = {
      manFix: manFix,
      features: []
    };
    fixtures.push(fixture);

    // pre-process data
    const fixData = JSON.parse(fs.readFileSync(path.join(fixturesDir, man, fix + '.json'), 'utf8'));
    let fineChannels = {};
    for (const ch of Object.keys(fixData.availableChannels)) {
      const channel = fixData.availableChannels[ch];

      if ('fineChannelAliases' in channel) {
        for (const alias of channel.fineChannelAliases) {
          fineChannels[alias] = ch;
        }
      }
    }

    // check all features
    for (const fixFeature of fixFeatures) {
      if (fixFeature.hasFeature(fixData, fineChannels)) {
        fixture.features.push(fixFeature.id);
        featuresUsed[fixFeature.id]++;
      }
    }
  }
}

if (args.compress) {
  fixtures.sort((a, b) => {
    return a.features.length - b.features.length;
  });
  fixtures = fixtures.filter(fixture => {
    for (const feature of fixture.features) {
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
}

fixtures.sort((a, b) => {
  return a.manFix > b.manFix ? 1 : a.manFix < b.manFix ? -1 : 0;
});

// generate markdown code
const markdown = []; // lines
markdown[0] = '|';
for (const fixFeature of fixFeatures) {
  markdown[0] += ' | ';
  markdown[0] += 'description' in fixFeature ? `<abbr title="${fixFeature.description}">${fixFeature.name}</abbr>` : fixFeature.name;
}
markdown[1] = '|-'.repeat(fixFeatures.length + 1);
for (const fixture of fixtures) {
  let line = `[${fixture.manFix}](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/${fixture.manFix}.json)`;

  for (const fixFeature of fixFeatures) {
    line += fixture.features.includes(fixFeature.id) ? ' | :white_check_mark:' : ' | :x:';
  }

  markdown.push(line);
}

// output resulting markdown
console.log(markdown.join('\n'));