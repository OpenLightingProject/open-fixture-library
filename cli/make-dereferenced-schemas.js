#!/usr/bin/node

const { readdir, writeFile } = require(`fs/promises`);
const path = require(`path`);
const chalk = require(`chalk`);
const schemaRefParser = require(`@apidevtools/json-schema-ref-parser`);

const importJson = require(`../lib/import-json.js`);

const schemaDirectory = path.join(__dirname, `../schemas/`);

(async () => {
  const schemaFiles = process.argv.length > 2
    ? process.argv.slice(2)
    : await readdir(schemaDirectory).filter(
      schemaFile => path.extname(schemaFile) === `.json`,
    );

  process.chdir(schemaDirectory);
  for (const schemaFile of schemaFiles) {
    const schema = await importJson(schemaFile, schemaDirectory);
    const dereferencedSchemaFile = path.join(schemaDirectory, `dereferenced`, schemaFile);

    try {
      const dereferencedSchema = await schemaRefParser.dereference(schema);
      await writeFile(
        dereferencedSchemaFile,
        `${JSON.stringify(dereferencedSchema, null, 2)}\n`,
      );
      console.log(chalk.green(`[Success]`), `Updated dereferenced schema ${dereferencedSchemaFile}.`);
    }
    catch (error) {
      console.error(chalk.red(`[Error]`), error);
    }
  }
})();
