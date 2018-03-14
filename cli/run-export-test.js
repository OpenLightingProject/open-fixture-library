#!/usr/bin/node
const fs = require(`fs`);
const path = require(`path`);
const minimist = require(`minimist`);
const colors = require(`colors`);

const plugins = require(`../plugins/plugins.json`);
const { Fixture, fixtureFromRepository } = require(`../lib/model.js`);

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
  fixtures = args._.map(relativePath => {
    const absolutePath = path.join(process.cwd(), relativePath);
    return new Fixture(
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)), // fix key
      JSON.parse(fs.readFileSync(absolutePath, `utf-8`))
    );
  });
}

const plugin = require(path.join(__dirname, `../plugins`, args.plugin, `export.js`));
const files = plugin.export(fixtures, {});

for (const testKey of plugins.data[args.plugin].exportTests) {
  const test = require(path.join(__dirname, `../plugins`, args.plugin, `exportTests/${testKey}.js`));
  const filePromises = files.map(file =>
    test(file.content)
      .then(() => colors.green(`[PASS] `) + file.name)
      .catch(err => {
        const lines = [colors.red(`[FAIL] `) + file.name];
        const errors = Array.isArray(err) ? err : [err];
        for (const error of errors) {
          lines.push(`- ${error}`);
        }
        return lines.join(`\n`);
      })
  );

  Promise.all(filePromises)
    .then(fileLines => {
      console.log(`\n${colors.yellow(`Test ${testKey}`)}`);
      console.log(fileLines.join(`\n`));
    });
}
