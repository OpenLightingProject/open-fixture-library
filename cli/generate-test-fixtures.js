#!/usr/bin/node

const fs = require('fs');
const path = require('path');

const fixFeaturesDir = path.join(__dirname, 'fixture-features');
const fixturesDir = path.join(__dirname, '..', 'fixtures');

let fixFeatures = [];
for (const featureFile of fs.readdirSync(fixFeaturesDir)) {
  if (path.extname(featureFile) === '.js') {
    let fixFeature = require(path.join(fixFeaturesDir, featureFile));
    fixFeature.id = path.basename(featureFile, '.js');
    if (!('order' in fixFeature)) {
      fixFeature.order = 0;
    }
    fixFeatures.push(fixFeature);
  }
}
fixFeatures.sort((a, b) => {
  if (a.order == b.order) {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    else if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
  }
  return b.order - a.order;
});

fs.readFile(path.join(fixturesDir, 'register.json'), 'utf8', (error, data) => {
  if (error) {
    console.error('read error', error);
    process.exit(1);
    return;
  }

  let fixtures = {}; // "man/key" -> [used features]

  const manufacturers = JSON.parse(data).manufacturers;
  for (const man of Object.keys(manufacturers)) {
    for (const fix of manufacturers[man]) {
      const manFix = `${man}/${fix}`;
      fixtures[manFix] = [];

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
          fixtures[manFix].push(fixFeature.id);
        }
      }
    }
  }

  const markdown = [];
  markdown[0] = '|';
  for (const fixFeature of fixFeatures) {

    markdown[0] += ' | ';
    if ('description' in fixFeature) {
      markdown[0] += `<abbr title="${fixFeature.description}">${fixFeature.name}</abbr>`;
    }
    else {
      markdown[0] += fixFeature.name;
    }
  }
  markdown[1] = '|-'.repeat(fixFeatures.length + 1);
  for (const manFix of Object.keys(fixtures)) {
    let line = `[${manFix}](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/${manFix}.json)`;

    for (const fixFeature of fixFeatures) {
      line += ' |';
      if (fixtures[manFix].includes(fixFeature.id)) {
        line += ' :white_check_mark:';
      }
      else {
        line += ' :x:';
      }
    }

    markdown.push(line);
  }

  console.log(markdown.join('\n'));
});