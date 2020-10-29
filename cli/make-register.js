#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const chalk = require(`chalk`);

const { Register } = require(`../lib/register.js`);
const manufacturers = require(`../fixtures/manufacturers.json`);

const register = new Register(manufacturers);

const fixturePath = path.join(__dirname, `../fixtures`);

try {
  // add all fixture.json files to the register
  for (const manufacturerKey of fs.readdirSync(fixturePath)) {
    const manufacturerDirectory = path.join(fixturePath, manufacturerKey);

    // only directories
    if (!fs.statSync(manufacturerDirectory).isDirectory()) {
      continue;
    }


    register.addManufacturer(manufacturerKey, manufacturers[manufacturerKey]);

    for (const filename of fs.readdirSync(manufacturerDirectory)) {
      if (path.extname(filename) !== `.json`) {
        continue;
      }

      const fixtureKey = path.basename(filename, `.json`);
      const fixtureData = JSON.parse(fs.readFileSync(path.join(fixturePath, manufacturerKey, filename), `utf8`));

      if (fixtureData.$schema.endsWith(`/fixture-redirect.json`)) {
        const redirectToData = JSON.parse(fs.readFileSync(path.join(fixturePath, `${fixtureData.redirectTo}.json`), `utf8`));

        register.addFixtureRedirect(manufacturerKey, fixtureKey, fixtureData, redirectToData);
      }
      else {
        register.addFixture(manufacturerKey, fixtureKey, fixtureData);
      }
    }
  }
}
catch (readError) {
  console.error(`Read error:`, readError);
  process.exit(1);
}


const filename = path.join(fixturePath, (process.argv.length === 3 ? process.argv[2] : `register.json`));
const fileContents = `${JSON.stringify(register.getAsSortedObject(), null, 2)}\n`;

fs.writeFile(filename, fileContents, `utf8`, error => {
  if (error) {
    console.error(`${chalk.red(`[Fail]`)} Could not write register file.`, error);
    process.exit(1);
  }
  console.log(`${chalk.green(`[Success]`)} Updated register file ${filename}`);
  process.exit(0);
});
