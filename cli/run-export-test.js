#!/usr/bin/node
const path = require(`path`);
const minimist = require(`minimist`);
const colors = require(`colors`);

const plugins = require(`../plugins/plugins.json`);
const { fixtureFromFile, fixtureFromRepository } = require(`../lib/model.js`);

const testFixtures = require(`../tests/test-fixtures.json`);

const args = minimist(process.argv.slice(2), {
  string: [`p`],
  boolean: [`h`],
  alias: { p: `plugin`, h: `help` }
});

const helpMessage = [
  `Run the plugin's export tests against the specified fixtures`,
  `(or the test fixtures, if no fixtures are specified).`,
  `Usage: node ${path.relative(process.cwd(), __filename)} -p <plugin> [ <fixtures> ]`,
  `Options:`,
  `  --plugin,   -p: Key of the plugin whose export tests should be called`,
  `  --help,     -h: Show this help message.`
].join(`\n`);

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!args.plugin) {
  console.error(`${colors.red(`[Error]`)} Plugin has to be specified using --plugin`);
  console.log(helpMessage);
  process.exit(1);
}

if (!plugins.exportPlugins.includes(args.plugin)) {
  console.error(`${colors.red(`[Error]`)} Plugin '${args.plugin}' is not a valid export plugin.\nAvailable export plugins: ${plugins.exportPlugins.join(`, `)}`);
  process.exit(1);
}

const pluginData = plugins.data[args.plugin];
if (pluginData.exportTests.length === 0) {
  console.log(`${colors.green(`[PASS]`)} Plugin '${args.plugin}' has no export tests.`);
  process.exit(0);
}

let fixtures;
if (args._.length === 0) {
  fixtures = testFixtures.map(
    fixture => fixtureFromRepository(fixture.man, fixture.key)
  );
}
else {
  fixtures = args._.map(
    relativePath => fixtureFromFile(path.join(process.cwd(), relativePath))
  );
}

const pluginExport = require(path.join(__dirname, `../plugins`, args.plugin, `export.js`));
pluginExport.export(fixtures, {
  baseDir: path.join(__dirname, `..`),
  date: new Date()
})
  .then(files => Promise.all(
    pluginData.exportTests.map(testKey => {
      const exportTest = require(path.join(__dirname, `../plugins`, args.plugin, `exportTests/${testKey}.js`));

      const filePromises = files.map(file =>
        exportTest(file)
          .then(() => `${colors.green(`[PASS]`)} ${file.name}`)
          .catch(err => {
            const errors = Array.isArray(err) ? err : [err];

            return [`${colors.red(`[FAIL]`)} ${file.name}`].concat(
              errors.map(error => `- ${error}`)
            ).join(`\n`);
          })
      );

      return Promise.all(filePromises).then(outputPerFile => {
        console.log(`\n${colors.yellow(`Test ${testKey}`)}`);
        console.log(outputPerFile.join(`\n`));
      });
    })
  ))
  .catch(error => {
    console.error(`${colors.red(`[Error]`)} Exporting failed:`, error);
    process.exit(1);
  });
