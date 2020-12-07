#!/usr/bin/env node

const minimist = require(`minimist`);
const { readFile } = require(`fs/promises`);

const { checkFixture } = require(`../tests/fixture-valid.js`);
const fixtureJsonStringify = require(`../lib/fixture-json-stringify.js`);
const createPullRequest = require(`../lib/create-github-pr.js`);
const importJson = require(`../lib/import-json.js`);

/** @typedef {import('../lib/types.js').FixtureCreateResult} FixtureCreateResult */

(async () => {
  const cliArguments = minimist(process.argv.slice(2), {
    string: [`p`, `a`],
    boolean: `c`,
    alias: {
      a: `author-name`,
      p: `plugin`,
      c: `create-pull-request`,
    },
  });

  await checkCliArguments(cliArguments);

  const filename = cliArguments._[0];

  try {
    const buffer = await readFile(filename);

    const plugin = require(`../plugins/${cliArguments.plugin}/import.js`);
    const { manufacturers, fixtures, warnings } = await plugin.importFixtures(buffer, filename, cliArguments[`author-name`]);

    /** @type {FixtureCreateResult} */
    const result = {
      manufacturers,
      fixtures,
      warnings,
      errors: {},
    };

    for (const key of Object.keys(result.fixtures)) {
      const [manufacturerKey, fixtureKey] = key.split(`/`);

      const checkResult = await checkFixture(manufacturerKey, fixtureKey, result.fixtures[key]);

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


/**
 * @param {Object.<String, *>} cliArguments Command line interface arguments parsed by minimist.
 */
async function checkCliArguments(cliArguments) {
  const plugins = await importJson(`../plugins/plugins.json`, __dirname);

  if (cliArguments._.length !== 1 || !plugins.importPlugins.includes(cliArguments.plugin) || !cliArguments[`author-name`]) {
    console.error(`Usage: ${process.argv[1]} -p <plugin> -a <author name> [--create-pull-request] <filename>\n\navailable plugins: ${plugins.importPlugins.join(`, `)}`);
    process.exit(1);
  }
}
