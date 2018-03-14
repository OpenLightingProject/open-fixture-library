#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);
const schemaRefParser = require(`json-schema-ref-parser`);

const schemaDir = path.join(__dirname, `../schemas/`);

const schemaFiles = fs.readdirSync(schemaDir).filter(
  schemaFile => path.extname(schemaFile) === `.json`
);

process.chdir(schemaDir);
for (const schemaFile of schemaFiles) {
  const schema = require(path.join(schemaDir, schemaFile));
  const dereferencedSchemaFile = path.join(schemaDir, `dereferenced`, schemaFile);

  schemaRefParser.dereference(schema)
    .then(dereferencedSchema => fs.writeFileSync(
      dereferencedSchemaFile,
      JSON.stringify(dereferencedSchema, null, 2)
    ))
    .then(() => {
      console.log(`${colors.green(`[Success]`)} Updated dereferenced schema ${dereferencedSchemaFile}.`);
    })
    .catch(error => {
      console.error(colors.red(`[Error]`), error);
    });
}