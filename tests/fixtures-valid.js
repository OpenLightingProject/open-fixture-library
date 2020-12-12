#!/usr/bin/node

const { readdir } = require(`fs/promises`);
const path = require(`path`);
const chalk = require(`chalk`);
const Ajv = require(`ajv`);
const minimist = require(`minimist`);

const getAjvErrorMessages = require(`../lib/get-ajv-error-messages.js`);
const { checkFixture, checkUniqueness } = require(`./fixture-valid.js`);
const importJson = require(`../lib/import-json.js`);


const cliArguments = minimist(process.argv.slice(2), {
  boolean: [`h`, `a`],
  alias: { h: `help`, a: `all-fixtures` },
});


const helpMessage = [
  `Check validity of some/all fixtures`,
  `Usage: node ${path.relative(process.cwd(), __filename)} -a | -h | fixtures [...]`,
  `Options:`,
  `  fixtures: a list of fixtures contained in the fixtures/ directory.`,
  `     has to resolve to the form 'manufacturer/fixture'`,
  `     depending on your shell, you can use glob-patterns to match multiple fixtures`,
  `  --all-fixtures, -a:`,
  `     check all fixtures contained in the fixtures/ directory`,
  `  --help, -h:`,
  `     Show this help message.`,
].join(`\n`);

let fixturePaths = cliArguments._;

// print help and exit on -h or no fixtures given.
if (cliArguments.help || (fixturePaths.length === 0 && !cliArguments.a)) {
  console.log(helpMessage);
  process.exit(0);
}

/**
 * @typedef {Object} UniqueValues
 * @property {Set.<String>} manNames All manufacturer names
 * @property {Object.<String, Set.<String>>} fixKeysInMan All fixture keys by manufacturer key
 * @property {Object.<String, Set.<String>>} fixNamesInMan All fixture names by manufacturer key
 * @property {Object.<String, Set.<String>>} fixRdmIdsInMan All RDM ids by manufacturer key
 * @property {Set.<String>} fixShortNames All fixture short names
 */
/** @type {UniqueValues} */
const uniqueValues = {
  manNames: new Set(),
  manRdmIds: new Set(),
  fixKeysInMan: {}, // new Set() for each manufacturer
  fixNamesInMan: {}, // new Set() for each manufacturer
  fixRdmIdsInMan: {}, // new Set() for each manufacturer
  fixShortNames: new Set(),
};

const fixtureDirectory = path.join(__dirname, `..`, `fixtures/`);

/**
 * @returns {Promise.<Array.<Object>>} A Promise that resolves to an array of result objects.
 */
async function runTests() {
  const promises = [];

  if (cliArguments.a) {
    const directoryEntries = await readdir(fixtureDirectory, { withFileTypes: true });
    const manufacturerKeys = directoryEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

    for (const manufacturerKey of manufacturerKeys) {
      const manufacturersDirectory = path.join(fixtureDirectory, manufacturerKey);

      for (const file of await readdir(manufacturersDirectory)) {
        if (path.extname(file) === `.json`) {
          const fixtureKey = path.basename(file, `.json`);
          promises.push(checkFixtureFile(manufacturerKey, fixtureKey));
        }
      }
    }
    promises.push(checkManufacturers());
  }
  else {
    // sanitize given path
    fixturePaths = fixturePaths.map(relativePath => path.resolve(relativePath));
    for (const fixturePath of fixturePaths) {
      if (path.extname(fixturePath) !== `.json`) {
        // TODO: only produce this warning at a higher verbosity level
        promises.push({
          name: fixturePath,
          errors: [],
          warnings: [`specified file is not a .json document`],
        });
        continue;
      }
      const fixtureKey = path.basename(fixturePath, `.json`);
      const manufacturerKey = path.dirname(fixturePath).split(path.sep).pop();
      promises.push(checkFixtureFile(manufacturerKey, fixtureKey));
    }
  }

  return Promise.all(promises);
}

/**
 * Checks (asynchronously) the given fixture.
 * @param {String} manufacturerKey The manufacturer key.
 * @param {String} fixtureKey The fixture key.
 * @returns {Promise.<Object>} A Promise resolving to a result object.
 */
async function checkFixtureFile(manufacturerKey, fixtureKey) {
  const filename = `${manufacturerKey}/${fixtureKey}.json`;
  const result = {
    name: filename,
    errors: [],
    warnings: [],
  };

  try {
    const fixtureJson = await importJson(filename, fixtureDirectory);
    Object.assign(result, await checkFixture(manufacturerKey, fixtureKey, fixtureJson, uniqueValues));
  }
  catch (error) {
    result.errors.push(error);
  }
  return result;
}

/**
 * Checks Manufacturers file
 * @returns {Promise.<Object>} A Promise resolving to a result object.
 */
async function checkManufacturers() {
  const result = {
    name: `manufacturers.json`,
    errors: [],
    warnings: [],
  };

  try {
    const manufacturers = await importJson(result.name, fixtureDirectory);
    const manufacturerSchema = await importJson(`../schemas/dereferenced/manufacturers.json`, __dirname);
    const validate = (new Ajv({ verbose: true })).compile(manufacturerSchema);
    const valid = validate(manufacturers);
    if (!valid) {
      throw getAjvErrorMessages(validate.errors, `manufacturers`);
    }

    for (const [manufacturerKey, manufacturerProperties] of Object.entries(manufacturers)) {
      if (manufacturerKey.startsWith(`$`)) {
        // JSON schema property
        continue;
      }

      // legacy purposes
      const uniquenessTestResults = {
        errors: [],
      };
      checkUniqueness(
        uniqueValues.manNames,
        manufacturerProperties.name,
        uniquenessTestResults,
        `Manufacturer name '${manufacturerProperties.name}' is not unique (test is not case-sensitive).`,
      );
      if (`rdmId` in manufacturerProperties) {
        checkUniqueness(
          uniqueValues.manRdmIds,
          `${manufacturerProperties.rdmId}`,
          uniquenessTestResults,
          `Manufacturer RDM ID '${manufacturerProperties.rdmId}' is not unique.`,
        );
      }
      result.errors.push(...uniquenessTestResults.errors);
    }
  }
  catch (error) {
    const isIterable = typeof error[Symbol.iterator] === `function`;
    result.errors.push(...(isIterable ? error : [error]));
  }
  return result;
}


// print results
runTests().then(results => {
  let totalFails = 0;
  let totalWarnings = 0;

  // each file
  results.forEach(result => {
    const failed = result.errors.length > 0;

    console.log(
      failed ? chalk.red(`[FAIL]`) : chalk.green(`[PASS]`),
      result.name,
    );

    totalFails += failed ? 1 : 0;
    for (const error of result.errors) {
      console.log(`└`, chalk.red(`Error:`), error);
    }

    totalWarnings += result.warnings.length;
    for (const warning of result.warnings) {
      console.log(`└`, chalk.yellow(`Warning:`), warning);
    }
  });

  // newline
  console.log();

  // summary
  if (totalWarnings > 0) {
    console.log(chalk.yellow(`[INFO]`), `${totalWarnings} unresolved warning(s)`);
  }

  if (totalFails === 0) {
    console.log(chalk.green(`[PASS]`), `All ${results.length} tested files were valid.`);
    process.exit(0);
  }

  console.error(chalk.red(`[FAIL]`), `${totalFails} of ${results.length} tested files failed.`);
  process.exit(1);
}).catch(error => console.error(chalk.red(`[Error]`), `Test errored:`, error));
