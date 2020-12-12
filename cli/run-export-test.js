#!/usr/bin/node
const path = require(`path`);
const minimist = require(`minimist`);
const chalk = require(`chalk`);

const { fixtureFromFile, fixtureFromRepository } = require(`../lib/model.js`);
const importJson = require(`../lib/import-json.js`);

(async () => {
  try {
    const plugins = await importJson(`../plugins/plugins.json`, __dirname);
    const testFixtures = await importJson(`../tests/test-fixtures.json`, __dirname);

    const cliArguments = minimist(process.argv.slice(2), {
      string: [`p`],
      boolean: [`h`],
      alias: { p: `plugin`, h: `help` },
    });

    const helpMessage = [
      `Run the plugin's export tests against the specified fixtures`,
      `(or the test fixtures, if no fixtures are specified).`,
      `Usage: node ${path.relative(process.cwd(), __filename)} -p <plugin> [ <fixtures> ]`,
      `Options:`,
      `  --plugin,   -p: Key of the plugin whose export tests should be called`,
      `  --help,     -h: Show this help message.`,
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

    if (!plugins.exportPlugins.includes(cliArguments.plugin)) {
      console.error(chalk.red(`[Error]`), `Plugin '${cliArguments.plugin}' is not a valid export plugin.\nAvailable export plugins:`, plugins.exportPlugins.join(`, `));
      process.exit(1);
    }

    const pluginData = plugins.data[cliArguments.plugin];
    if (pluginData.exportTests.length === 0) {
      console.log(chalk.green(`[PASS]`), `Plugin '${cliArguments.plugin}' has no export tests.`);
      process.exit(0);
    }

    const fixtures = cliArguments._.length === 0
      ? testFixtures.map(fixture => fixtureFromRepository(fixture.man, fixture.key))
      : cliArguments._.map(relativePath => fixtureFromFile(path.join(process.cwd(), relativePath)));

    const pluginExport = require(`../plugins/${cliArguments.plugin}/export.js`);

    const files = await pluginExport.exportFixtures(
      await Promise.all(fixtures),
      {
        baseDirectory: path.join(__dirname, `..`),
        date: new Date(),
      },
    );

    await Promise.all(pluginData.exportTests.map(async testKey => {
      const exportTest = require(`../plugins/${cliArguments.plugin}/exportTests/${testKey}.js`);

      const outputPerFile = await Promise.all(files.map(async file => {
        try {
          await exportTest(file, files);
          return `${chalk.green(`[PASS]`)} ${file.name}`;
        }
        catch (testError) {
          const errors = Array.isArray(testError) ? testError : [testError];

          return [`${chalk.red(`[FAIL]`)} ${file.name}`].concat(
            errors.map(error => `- ${error}`),
          ).join(`\n`);
        }
      }));

      console.log(`\n${chalk.yellow(`Test ${testKey}`)}`);
      console.log(outputPerFile.join(`\n`));
    }));
  }
  catch (error) {
    console.error(chalk.red(`[Error]`), `Exporting failed:`, error);
    process.exit(1);
  }
})();
