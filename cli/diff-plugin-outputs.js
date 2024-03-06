#!/usr/bin/env node

import chalk from 'chalk';
import minimist from 'minimist';

import diffPluginOutputs from '../lib/diff-plugin-outputs.js';
import importJson from '../lib/import-json.js';

const plugins = await importJson(`../plugins/plugins.json`, import.meta.url);
const testFixtures = await importJson(`../tests/test-fixtures.json`, import.meta.url);
const testFixtureKeys = testFixtures.map(fixture => `${fixture.man}/${fixture.key}`);

const cliArguments = minimist(process.argv.slice(2), {
  string: [`p`, `c`, `r`],
  boolean: [`t`, `h`],
  alias: { p: `plugin`, c: `compare-plugin`, r: `ref`, t: `test-fix`, h: `help` },
  default: { r: `HEAD` },
});
cliArguments.comparePlugin = cliArguments[`compare-plugin`];
cliArguments.testFix = cliArguments[`test-fix`];
cliArguments.fixtures = cliArguments._;

const scriptName = import.meta.url.split(`/`).slice(-2).join(`/`);
const exportPlugins = plugins.exportPlugins.join(`, `);

const helpMessage = [
  `This script exports the given fixtures with the current version of the given plugin and diffs the results`,
  `against the files exported with the comparePlugin at the state of the given Git reference.`,
  `Fixtures have to be declared with the path to its file in the fixtures/ directory.`,
  `Usage: node ${scriptName} -p <plugin-key> [-c <compare-plugin-key>] [-r <git-ref>] [ -t | <fixture> [<more fixtures>] ]`,
  `Options:`,
  `  --plugin,         -p: Which plugin should be used to output fixtures. Allowed values:`,
  `                        ${exportPlugins}`,
  `  --compare-plugin, -c: A plugin from the given git reference (may not exist anymore). Defaults to --plugin.`,
  `  --ref,            -r: The Git reference with which the current repo should be compared.`,
  `                        E. g. 02ba13, HEAD~1 or master.`,
  `                        Defaults to HEAD.`,
  `  --test-fix,       -t: Use the test fixtures instead of specifing custom fixtures.`,
  `  --help,           -h: Show this help message.`,
].join(`\n`);

if (cliArguments.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!cliArguments.plugin) {
  console.error(chalk.red(`[Error]`), `Plugin has to be specified using --plugin`);
  console.log(helpMessage);
  process.exit(1);
}

if (!cliArguments.comparePlugin) {
  cliArguments.comparePlugin = cliArguments.plugin;
  cliArguments.c = cliArguments.p;
}

if (cliArguments.fixtures.length === 0 && !cliArguments.testFix) {
  console.log(chalk.yellow(`[Warning]`), `No fixtures specified. See --help for usage.`);
}

diffPluginOutputs(cliArguments.plugin, cliArguments.comparePlugin, cliArguments.ref, cliArguments.testFix ? testFixtureKeys : cliArguments.fixtures);
