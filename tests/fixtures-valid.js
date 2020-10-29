#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const chalk = require(`chalk`);
const Ajv = require(`ajv`);
const getAjvErrorMessages = require(`../lib/get-ajv-error-messages.js`);

// interactive commandline support
const minimist = require(`minimist`);

const promisify = require(`util`).promisify;
const readFile = promisify(fs.readFile);

const manufacturerSchema = require(`../schemas/dereferenced/manufacturers.json`);
const { checkFixture, checkUniqueness } = require(`./fixture-valid.js`);


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

const promises = [];
const fixturePath = path.join(__dirname, `..`, `fixtures`);

if (cliArguments.a) {
  for (const manKey of fs.readdirSync(fixturePath)) {
    const manufacturersDirectory = path.join(fixturePath, manKey);

    // files in manufacturer directory
    if (fs.statSync(manufacturersDirectory).isDirectory()) {
      for (const file of fs.readdirSync(manufacturersDirectory)) {
        if (path.extname(file) === `.json`) {
          const fixKey = path.basename(file, `.json`);
          promises.push(checkFixtureFile(manKey, fixKey));
        }
      }
    }
  }
  promises.push(checkManufacturers());
}
else {
  // sanitize given path
  fixturePaths = fixturePaths.map(relativePath => path.resolve(relativePath));
  for (const fixPath of fixturePaths) {
    if (path.extname(fixPath) !== `.json`) {
      // TODO: only produce this warning at a higher verbosity level
      promises.push({
        name: fixPath,
        errors: [],
        warnings: [`specified file is not a .json document`],
      });
      continue;
    }
    const fixKey = path.basename(fixPath, `.json`);
    const manKey = path.dirname(fixPath).split(path.sep).pop();
    promises.push(checkFixtureFile(manKey, fixKey));
  }
}

/**
 * Checks (asynchronously) the given fixture.
 * @param {String} manKey The manufacturer key.
 * @param {String} fixKey The fixture key.
 * @returns {Promise.<Object>} A Promise resolving to a result object.
 */
async function checkFixtureFile(manKey, fixKey) {
  const filename = `${manKey}/${fixKey}.json`;
  const result = {
    name: filename,
    errors: [],
    warnings: [],
  };

  const filepath = path.join(fixturePath, filename);

  try {
    const data = await readFile(filepath, `utf8`);
    const fixtureJson = JSON.parse(data);
    Object.assign(result, checkFixture(manKey, fixKey, fixtureJson, uniqueValues));
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

  const filename = path.join(fixturePath, result.name);

  try {
    const data = await readFile(filename, `utf8`);
    const manufacturers = JSON.parse(data);
    const validate = (new Ajv({ verbose: true })).compile(manufacturerSchema);
    const valid = validate(manufacturers);
    if (!valid) {
      throw getAjvErrorMessages(validate.errors, `manufacturers`);
    }

    for (const [manKey, manProperties] of Object.entries(manufacturers)) {
      if (manKey.startsWith(`$`)) {
        // JSON schema property
        continue;
      }

      // legacy purposes
      const uniquenessTestResults = {
        errors: [],
      };
      checkUniqueness(
        uniqueValues.manNames,
        manProperties.name,
        uniquenessTestResults,
        `Manufacturer name '${manProperties.name}' is not unique (test is not case-sensitive).`,
      );
      if (`rdmId` in manProperties) {
        checkUniqueness(
          uniqueValues.manRdmIds,
          `${manProperties.rdmId}`,
          uniquenessTestResults,
          `Manufacturer RDM ID '${manProperties.rdmId}' is not unique.`,
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
Promise.all(promises).then(results => {
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
