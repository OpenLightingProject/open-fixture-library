#!/usr/bin/node
const fs = require(`fs`);
const path = require(`path`);
const minimist = require(`minimist`);
const colors = require(`colors`);
const mkdirp = require(`mkdirp`);

const plugins = require(`../plugins/plugins.json`);
const { fixtureFromRepository } = require(`../lib/model.js`);

const args = minimist(process.argv.slice(2), {
  string: [`p`, `o`],
  boolean: [`h`, `a`],
  alias: { p: `plugin`, h: `help`, a: `all-fixtures`, o: `output-dir`}
});

const helpMessage = [
  `Usage: ${process.argv[1]} -p <plugin name> [ -a | <fixture> [<more fixtures>] ]`,
  `Options:`,
  `  --plugin,       -p: Which plugin should be used to export fixtures.`,
  `                      E. g. ecue or qlcplus`,
  `  --all-fixtures, -a: Use all fixtures from register`,
  `  --output-dir,   -o: If set, save outputted files in this directory`,
  `                      instead of printing the contents in the console`,
  `  --help,         -h: Show this help message.`
].join(`\n`);

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!args.plugin) {
  console.error(`${colors.red(`[Error]`)} No plugin specified. See --help for usage.`);
  process.exit(1);
}

if (args._.length === 0 && !args.a) {
  console.error(`${colors.red(`[Error]`)} No fixtures specified. See --help for usage.`);
  process.exit(1);
}

if (!plugins.exportPlugins.includes(args.plugin)) {
  console.error(`${colors.red(`[Error]`)} Plugin '${args.plugin}' does not exist or does not support exporting.\n\navailable plugins: ${Object.keys(plugins.exportPlugins).join(`, `)}`);
  process.exit(1);
}

let fixtures;
if (args.a) {
  const register = require(`../fixtures/register.json`);
  fixtures = Object.keys(register.filesystem).map(fixKey => fixKey.split(`/`));
}
else {
  fixtures = args._.map(relativePath => {
    const absolutePath = path.join(process.cwd(), relativePath);
    return [
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)) // fix key
    ];
  });
}

const outDir = args.o ? path.join(process.cwd(), args.o) : null;

const plugin = require(path.join(__dirname, `../plugins`, args.plugin, `export.js`));
plugin.export(
  fixtures.map(([man, fix]) => fixtureFromRepository(man, fix)),
  {
    baseDir: path.join(__dirname, `..`),
    date: new Date()
  }
)
  .then(files => {
    files.forEach(file => {
      if (args.o) {
        const filePath = path.join(outDir, file.name);
        mkdirp.sync(path.dirname(filePath));
        fs.writeFileSync(filePath, file.content);
        console.log(`Created file ${filePath}`);
      }
      else {
        console.log(`\n${colors.yellow(`File name: '${file.name}'`)}`);
        console.log(file.content);
      }
    });
  })
  .catch(error => {
    console.error(`${colors.red(`[Error]`)} Exporting failed:`, error);
    process.exit(1);
  });
