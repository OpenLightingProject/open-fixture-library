#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const chalk = require(`chalk`);
const schemaRefParser = require(`@apidevtools/json-schema-ref-parser`);

const schemaDirectory = path.join(__dirname, `../schemas/`);

const schemaFiles = process.argv.length > 2
  ? process.argv.slice(2)
  : fs.readdirSync(schemaDirectory).filter(
    schemaFile => path.extname(schemaFile) === `.json`,
  );

(async () => {
  process.chdir(schemaDirectory);
  for (const schemaFile of schemaFiles) {
    const schema = require(path.join(schemaDirectory, schemaFile));
    const dereferencedSchemaFile = path.join(schemaDirectory, `dereferenced`, schemaFile);

    try {
      const dereferencedSchema = await schemaRefParser.dereference(schema);
      fs.writeFileSync(
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
