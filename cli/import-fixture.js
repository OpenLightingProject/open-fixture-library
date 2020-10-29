#!/usr/bin/env node

const path = require(`path`);
const minimist = require(`minimist`);
const promisify = require(`util`).promisify;
const readFile = promisify(require(`fs`).readFile);

const { checkFixture } = require(`../tests/fixture-valid.js`);
const plugins = require(`../plugins/plugins.json`);
const fixtureJsonStringify = require(`../lib/fixture-json-stringify.js`);
const createPullRequest = require(`../lib/create-github-pr.js`);

/** @typedef {import('../lib/types.js').FixtureCreateResult} FixtureCreateResult */

const cliArguments = minimist(process.argv.slice(2), {
  string: [`p`, `a`],
  boolean: `c`,
  alias: {
    a: `author-name`,
    p: `plugin`,
    c: `create-pull-request`,
  },
});

const filename = cliArguments._[0];
const authorName = cliArguments[`author-name`];

if (cliArguments._.length !== 1 || !plugins.importPlugins.includes(cliArguments.plugin) || !authorName) {
  console.error(`Usage: ${process.argv[1]} -p <plugin> -a <author name> [--create-pull-request] <filename>\n\navailable plugins: ${plugins.importPlugins.join(`, `)}`);
  process.exit(1);
}

(async () => {
  try {
    const buffer = await readFile(filename);

    const plugin = require(path.join(__dirname, `../plugins`, cliArguments.plugin, `import.js`));
    const { manufacturers, fixtures, warnings } = await plugin.import(buffer, filename, authorName);

    /** @type {FixtureCreateResult} */
    const result = {
      manufacturers,
      fixtures,
      warnings,
      errors: {},
    };

    for (const key of Object.keys(result.fixtures)) {
      const [manufacturerKey, fixtureKey] = key.split(`/`);

      const checkResult = checkFixture(manufacturerKey, fixtureKey, result.fixtures[key]);

      result.warnings[key] = result.warnings[key].concat(checkResult.warnings);
      result.errors[key] = checkResult.errors;
    }

    if (cliArguments[`create-pull-request`]) {
      try {
        const pullRequestUrl = await createPullRequest(result);
        console.log(`URL: ${pullRequestUrl}`);
      }
      catch (error) {
        console.log(fixtureJsonStringify(result));
        console.error(`Error creating pull request: ${error.message}`);
      }
    }
    else {
      console.log(fixtureJsonStringify(result));
    }
  }
  catch (error) {
    console.error(`Error parsing '${filename}':`);
    console.error(error);
    process.exit(1);
  }
})();
