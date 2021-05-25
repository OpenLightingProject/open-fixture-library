#!/usr/bin/env node

import { readFile } from 'fs/promises';
import minimist from 'minimist';

import createPullRequest from '../lib/create-github-pr.js';
import fixtureJsonStringify from '../lib/fixture-json-stringify.js';
import importJson from '../lib/import-json.js';
import { checkFixture } from '../tests/fixture-valid.js';

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

    const plugin = await import(`../plugins/${cliArguments.plugin}/import.js`);
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
  const plugins = await importJson(`../plugins/plugins.json`, import.meta.url);

  if (cliArguments._.length !== 1 || !plugins.importPlugins.includes(cliArguments.plugin) || !cliArguments[`author-name`]) {
    console.error(`Usage: ${process.argv[1]} -p <plugin> -a <author name> [--create-pull-request] <filename>\n\navailable plugins: ${plugins.importPlugins.join(`, `)}`);
    process.exit(1);
  }
}
