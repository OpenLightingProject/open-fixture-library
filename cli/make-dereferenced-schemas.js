#!/usr/bin/node

const fs = require(`fs`);
const path = require(`path`);
const colors = require(`colors`);
const schemaRefParser = require(`json-schema-ref-parser`);

const fixtureSchema = require(`../schemas/fixture.json`);
const manufacturersSchema = require(`../schemas/manufacturers.json`);
const definitionsSchema = require(`../schemas/definitions.json`);

dereference(fixtureSchema, path.join(__dirname, `../schemas/dereferenced/fixture.json`));
dereference(manufacturersSchema, path.join(__dirname, `../schemas/dereferenced/manufacturers.json`));
dereference(definitionsSchema, path.join(__dirname, `../schemas/dereferenced/definitions.json`));

/**
 * Resolve all "$ref" properties in the given schema and save the resolved version.
 * @param {!object} schema The raw JSON schema data.
 * @param {!string} newFilename The absolute path to the dereferenced schema.
 */
function dereference(schema, newFilename) {
  process.chdir(path.join(__dirname, `../schemas/`));

  schemaRefParser.dereference(schema)
    .then(dereferencedSchema => fs.writeFileSync(
      newFilename,
      JSON.stringify(dereferencedSchema, null, 2)
    ))
    .then(() => {
      console.log(`${colors.green(`[Success]`)} Updated dereferenced schema ${newFilename}.`);
    })
    .catch(error => {
      console.error(colors.red(`[Error]`), error);
    });
}