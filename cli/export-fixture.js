#!/usr/bin/node
const fs = require(`fs`);
const path = require(`path`);
const minimist = require(`minimist`);
const chalk = require(`chalk`);
const mkdirp = require(`mkdirp`);

const plugins = require(`../plugins/plugins.json`);
const { fixtureFromRepository } = require(`../lib/model.js`);

const cliArguments = minimist(process.argv.slice(2), {
  string: [`p`, `o`],
  boolean: [`h`, `a`],
  alias: { p: `plugin`, h: `help`, a: `all-fixtures`, o: `output-dir` },
});

const helpMessage = [
  `Usage: ${process.argv[1]} -p <plugin name> [ -a | <fixture> [<more fixtures>] ]`,
  `Options:`,
  `  --plugin,       -p: Which plugin should be used to export fixtures.`,
  `                      E. g. ecue or qlcplus`,
  `  --all-fixtures, -a: Use all fixtures from register`,
  `  --output-dir,   -o: If set, save outputted files in this directory`,
  `                      instead of printing the contents in the console`,
  `  --help,         -h: Show this help message.`,
].join(`\n`);

if (cliArguments.help) {
  console.log(helpMessage);
  process.exit(0);
}

if (!cliArguments.plugin) {
  console.error(`${chalk.red(`[Error]`)} No plugin specified. See --help for usage.`);
  process.exit(1);
}

if (cliArguments._.length === 0 && !cliArguments.a) {
  console.error(`${chalk.red(`[Error]`)} No fixtures specified. See --help for usage.`);
  process.exit(1);
}

if (!plugins.exportPlugins.includes(cliArguments.plugin)) {
  console.error(`${chalk.red(`[Error]`)} Plugin '${cliArguments.plugin}' does not exist or does not support exporting.\n\navailable plugins: ${Object.keys(plugins.exportPlugins).join(`, `)}`);
  process.exit(1);
}

let fixtures;
if (cliArguments.a) {
  const register = require(`../fixtures/register.json`);
  fixtures = Object.keys(register.filesystem).filter(
    fixKey => !(`redirectTo` in register.filesystem[fixKey]) || register.filesystem[fixKey].reason === `SameAsDifferentBrand`,
  ).map(fixKey => fixKey.split(`/`));
}
else {
  fixtures = cliArguments._.map(relativePath => {
    const absolutePath = path.join(process.cwd(), relativePath);
    return [
      path.basename(path.dirname(absolutePath)), // man key
      path.basename(absolutePath, path.extname(absolutePath)), // fix key
    ];
  });
}

const outDirectory = cliArguments.o ? path.resolve(process.cwd(), cliArguments.o) : null;

(async () => {
  try {
    const plugin = require(path.join(__dirname, `../plugins`, cliArguments.plugin, `export.js`));
    const files = await plugin.export(
      fixtures.map(([man, fix]) => fixtureFromRepository(man, fix)),
      {
        baseDirectory: path.join(__dirname, `..`),
        date: new Date(),
      },
    );
    for (const file of files) {
      if (cliArguments.o) {
        const filePath = path.join(outDirectory, file.name);
        await mkdirp(path.dirname(filePath));
        fs.writeFileSync(filePath, file.content);
        console.log(`Created file ${filePath}`);
      }
      else {
        console.log(`\n${chalk.yellow(`File name: '${file.name}'`)}`);
        console.log(file.content);
      }
    }
  }
  catch (error) {
    console.error(`${chalk.red(`[Error]`)} Exporting failed:`, error);
    process.exit(1);
  }
})();
