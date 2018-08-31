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

const plugin = require(path.join(__dirname, `../plugins`, args.plugin, `export.js`));
plugin.export(fixtures, {
  baseDir: path.join(__dirname, `..`),
  date: new Date()
}).then(files => {
  for (const testKey of plugins.data[args.plugin].exportTests) {
    const exportTest = require(path.join(__dirname, `../plugins`, args.plugin, `exportTests/${testKey}.js`));

    const filePromises = files.map(file =>
      exportTest(file)
        .then(() => `${colors.green(`[PASS]`)} ${file.name}`)
        .catch(err => {
          const errors = Array.isArray(err) ? err : [err];

          return [].concat(
            `${colors.red(`[FAIL]`)} ${file.name}`,
            errors.map(error => `- ${error}`)
          ).join(`\n`);
        })
    );

    Promise.all(filePromises).then(outputPerFile => {
      console.log(`\n${colors.yellow(`Test ${testKey}`)}`);
      console.log(outputPerFile.join(`\n`));
    });
  }
});
