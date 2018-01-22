#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);

const schemas = require(`../fixtures/schema.js`);
const checkFixture = require(`./fixture-valid.js`);

/**
 * @typedef UniqueValues
 * @type {object}
 * @property {Set<string>} manKeys All manufacturer keys
 * @property {Set<string>} manNames All manufacturer names
 * @property {Object.<string, Set<string>>} fixKeysInMan All fixture keys by manufacturer key
 * @property {Object.<string, Set<string>>} fixNamesInMan All fixture names by manufacturer key
 * @property {Set<string>} fixShortNames All fixture short names
 */
const uniqueValues = {
  manKeys: new Set(),
  manNames: new Set(),
  manRdmIds: new Set(),
  fixKeysInMan: {}, // new Set() for each manufacturer
  fixNamesInMan: {}, // new Set() for each manufacturer
  fixRdmIdsInMan: {}, // new Set() for each manufacturer
  fixShortNames: new Set()
};

const promises = [];

// search fixture files
const fixturePath = path.join(__dirname, `..`, `fixtures`);
for (const manKey of fs.readdirSync(fixturePath)) {
  const manDir = path.join(fixturePath, manKey);

  // files in manufacturer directory
  if (fs.statSync(manDir).isDirectory()) {
    for (const file of fs.readdirSync(manDir)) {
      if (path.extname(file) === `.json`) {
        const fixKey = path.basename(file, `.json`);
        handleFixtureFile(manKey, fixKey);
      }
    }
  }
}

function handleFixtureFile(manKey, fixKey) {
  const filename = `${manKey}/${fixKey}.json`;
  const result = {
    name: filename,
    errors: [],
    warnings: []
  };

  const filepath = path.join(fixturePath, filename);

  promises.push(new Promise((resolve, reject) => {
    fs.readFile(filepath, `utf8`, (readError, data) => {
      if (readError) {
        result.errors.push(checkFixture.getErrorString(`File could not be read.`, readError));
        return resolve(result);
      }

      let fixtureJson;
      try {
        fixtureJson = JSON.parse(data);
      }
      catch (parseError) {
        result.errors.push(checkFixture.getErrorString(`File could not be parsed as JSON.`, parseError));
        return resolve(result);
      }

      try {
        // checkFixture(..) returns { errors: [..], warnings: [..] }
        Object.assign(result, checkFixture(manKey, fixKey, fixtureJson, uniqueValues));
      }
      catch (validateError) {
        result.errors.push(checkFixture.getErrorString(`Fixture could not be validated.`, validateError));
      }
      return resolve(result);
    });
  }));
}

// check manufacturers file
promises.push(new Promise((resolve, reject) => {
  const result = {
    name: `manufacturers.json`,
    errors: [],
    warnings: []
  };
  const filename = path.join(fixturePath, result.name);

  fs.readFile(filename, `utf8`, (readError, data) => {
    if (readError) {
      result.errors.push(checkFixture.getErrorString(`File could not be read.`, readError));
      return resolve(result);
    }

    let manufacturers;
    try {
      manufacturers = JSON.parse(data);
    }
    catch (parseError) {
      result.errors.push(checkFixture.getErrorString(`File could not be parsed.`, parseError));
      return resolve(result);
    }

    const schemaErrors = schemas.Manufacturers.errors(manufacturers);
    if (schemaErrors !== false) {
      result.errors = [checkFixture.getErrorString(`File does not match schema.`, schemaErrors)];
    }

    for (const manKey of Object.keys(manufacturers)) {
      checkFixture.checkUniqueness(
        uniqueValues.manKeys,
        manKey,
        result,
        `Manufacturer key '${manKey}' is not unique (test is not case-sensitive).`
      );
      checkFixture.checkUniqueness(
        uniqueValues.manNames,
        manufacturers[manKey].name,
        result,
        `Manufacturer name '${manufacturers[manKey].name}' is not unique (test is not case-sensitive).`
      );

      if (`rdmId` in manufacturers[manKey]) {
        checkFixture.checkUniqueness(
          uniqueValues.manRdmIds,
          `${manufacturers[manKey].rdmId}`,
          result,
          `Manufacturer RDM ID '${manufacturers[manKey].rdmId}' is not unique.`
        );
      }
    }

    return resolve(result);
  });
}));


// print results
Promise.all(promises).then(results => {
  let totalFails = 0;
  let totalWarnings = 0;

  // each file
  for (const result of results) {
    const failed = result.errors.length > 0;

    console.log(
      failed ? colors.red(`[FAIL]`) : colors.green(`[PASS]`),
      result.name
    );

    totalFails += failed ? 1 : 0;
    for (const error of result.errors) {
      console.log(`└`, colors.red(`Error:`), error);
    }

    totalWarnings += result.warnings.length;
    for (const warning of result.warnings) {
      console.log(`└`, colors.yellow(`Warning:`), warning);
    }
  }

  // newline
  console.log();

  // summary
  if (totalWarnings > 0) {
    console.log(colors.yellow(`[INFO]`), `${totalWarnings} unresolved warning(s)`);
  }

  if (totalFails === 0) {
    console.log(colors.green(`[PASS]`), `All ${results.length} tested files were valid.`);
    process.exit(0);
  }

  console.error(colors.red(`[FAIL]`), `${totalFails} of ${results.length} tested files failed.`);
  process.exit(1);
});
