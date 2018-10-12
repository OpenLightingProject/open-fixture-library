#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);

const { Register } = require(`../lib/register.js`);
const manufacturers = require(`../fixtures/manufacturers.json`);

const register = new Register(manufacturers);

const fixturePath = path.join(__dirname, `../fixtures`);

try {
  // add all fixture.json files to the register
  for (const manKey of fs.readdirSync(fixturePath)) {
    const manDir = path.join(fixturePath, manKey);

    // only directories
    if (!fs.statSync(manDir).isDirectory()) {
      continue;
    }


    register.addManufacturer(manKey, manufacturers[manKey]);

    for (const filename of fs.readdirSync(manDir)) {
      if (path.extname(filename) !== `.json`) {
        continue;
      }

      const fixKey = path.basename(filename, `.json`);
      const fixData = JSON.parse(fs.readFileSync(path.join(fixturePath, manKey, filename), `utf8`));

      if (fixData.$schema.endsWith(`/fixture-redirect.json`)) {
        const redirectToData = JSON.parse(fs.readFileSync(path.join(fixturePath, `${fixData.redirectTo}.json`), `utf8`));

        register.addFixtureRedirect(manKey, fixKey, fixData, redirectToData);
      }
      else {
        register.addFixture(manKey, fixKey, fixData);
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
    console.error(`${colors.red(`[Fail]`)} Could not write register file.`, error);
    process.exit(1);
  }
  console.log(`${colors.green(`[Success]`)} Updated register file ${filename}`);
  process.exit(0);
});
