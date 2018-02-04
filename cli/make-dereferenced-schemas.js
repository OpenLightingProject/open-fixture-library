#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);
const schemaRefParser = require(`json-schema-ref-parser`);

const fixtureSchema = require(`../schema-fixture.json`);
const manufacturersSchema = require(`../schema-manufacturers.json`);

dereference(fixtureSchema, path.join(__dirname, `../schema-fixture-dereferenced.json`));
dereference(manufacturersSchema, path.join(__dirname, `../schema-manufacturers-dereferenced.json`));

/**
 * Resolve all "$ref" properties in the given schema and save the resolved version.
 * @param {!object} schema The raw JSON schema data.
 * @param {!string} newFilename The absolute path to the dereferenced schema.
 */
function dereference(schema, newFilename) {
  schemaRefParser.dereference(schema).then(dereferencedSchema => {
    return fs.writeFile(
      newFilename,
      JSON.stringify(dereferencedSchema, null, 2)
    );
  })
    .then(() => {
      console.log(`${colors.green(`[Success]`)} Updated dereferenced schema ${newFilename}.`);
    })
    .catch(error => {
      console.error(colors.red(`[Error]`), error);
    });
}