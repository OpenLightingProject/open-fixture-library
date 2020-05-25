#!/usr/bin/node

/**
 * @fileoverview Export RDM data that can be imported to <http://rdm.openlighting.org/incoming/model_data>.
 */

const fs = require(`fs`);
const path = require(`path`);
const minimist = require(`minimist`);
const chalk = require(`chalk`);

const { fixtureFromRepository } = require(`../lib/model.js`);

const args = minimist(process.argv.slice(2), {
  string: [`o`],
  boolean: [`h`, `a`],
  alias: { h: `help`, a: `all-fixtures`, o: `output` }
});

const helpMessage = [
  `Usage: ${process.argv[1]} -p <plugin name> [ -a | <fixture> [<more fixtures>] ]`,
  `Options:`,
  `  --all-fixtures, -a: Use all fixtures from register`,
  `  --output,       -o: If set, save outputted data to this file`,
  `                      instead of printing to the console`,
  `  --help,         -h: Show this help message.`
].join(`\n`);

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (args._.length === 0 && !args.a) {
  console.error(`${chalk.red(`[Error]`)} No fixtures specified. See --help for usage.`);
  process.exit(1);
}

const fixtures = args._.map(relativePath => {
  const absolutePath = path.join(process.cwd(), relativePath);
  const manKey = path.basename(path.dirname(absolutePath));
  const fixKey = path.basename(absolutePath, path.extname(absolutePath));
  return `${manKey}/${fixKey}`;
});

const register = require(`../fixtures/register.json`);

const productCategories = {
  Smoke: 1025, // Atmospheric Effect
  Hazer: 1025, // Atmospheric Effect
  Dimmer: 1280, // Dimmer
  Scanner: 259, // Fixture Moving Mirror
  'Barrel Scanner': 259, // Fixture Moving Mirror
  'Moving Head': 258, // Fixture Moving Yoke
  Default: 257 // Fixture Fixed
};

const rdmData = {};

for (const [manufacturerId, { key, models }] of Object.entries(register.rdm)) {
  const rdmModels = [];

  for (const [modelId, fixtureKey] of Object.entries(models)) {
    if (!args.a && !fixtures.includes(`${key}/${fixtureKey}`)) {
      continue;
    }

    const fixture = fixtureFromRepository(key, fixtureKey);
    const productCategory = fixture.categories.find(category => category in productCategories) || `Default`;

    const personalities = fixture.modes.map((mode, index) => ({
      description: `${mode.name} mode`,
      index: mode.rdmPersonalityIndex || (index + 1),
      'slot_count': mode.channelKeys.length
    }));

    rdmModels.push({
      '$comment': `http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&model=${modelId}`,
      'device_model': Number(modelId),
      'model_description': fixture.name,
      'product_category': productCategories[productCategory],
      'link_url': fixture.getLinksOfType(`productPage`)[0],
      'software_versions': {
        1: {
          label: fixture.rdm.softwareVersion,
          personalities,
          sensors: [],
          'supported_parameters': []
        }
      }
    });
  }

  if (rdmModels.length > 0) {
    rdmData[manufacturerId] = rdmModels;
  }
}

const output = JSON.stringify(rdmData, null, 2)
  .replace(/"(\d+)":/g, `$1:`)
  .replace(/"\$comment": "(.+)",/g, `# $1`);

if (args.output) {
  fs.writeFileSync(args.output, output);
  console.log(`Written to file ${args.output}`);
}
else {
  console.log(output);
}
