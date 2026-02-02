# Plugins

The aim of the *Open Fixture Library* is to import and export our fixture definitions from / to fixture formats of third-party lighting control software, for example [QLC+](https://github.com/mcallegari/qlcplus)'s `.qfx` format. A plugin is a converter between our format and one such external format. It implements an import and / or export method that parses / generates the third-party format.

Each plugin has its own directory `plugins/<plugin-key>/` which contains all information, methods and tests about the external format. You have to provide a `plugin.json` file in that directory, containing at least the plugin name, description and one or more links. See the [schema](../schemas/plugin.json) or other plugins' `plugin.json` files as a reference. This data is also used to create the about page for this plugin in the UI.

Be sure to always run `npm run build` after editing `plugin.json` or adding export/import scripts and export tests.

You can try plugins from the command line:

```bash
# Import
node cli/import-fixture.js -p <plugin> <filename>
node cli/import-fixture.js -h # Help message

# Export
node cli/export-fixture.js -p <plugin> <fixture> [<more fixtures>]
```

## Exporting

If exporting is supported, create a `plugins/<plugin-key>/export.js` module that provides the plugin name, version and a method that generates the needed third-party files out of an given array of [Fixture](model-api.md#Fixture) objects. This method should return a Promise of an array of objects for each file that should be exported / downloadable; the files are zipped together automatically if necessary. A file object looks like this:

<!-- eslint-skip -->
```js
{
  name: `filename.ext`, // Required, may include forward slashes to generate a folder structure
  content: `file content`, // Required
  mimetype: `text/plain`, // Required
  fixtures: [fixA, fixB], // Optional, list of Fixture objects that are described in this file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information)
  mode: `8ch` // Optional, mode's shortName if this file only describes a single mode
}
```

A very simple export plugin looks like this:

```js
export const version = `0.1.0`; // semantic versioning of export plugin

/**
 * @param {Fixture[]} fixtures An array of Fixture objects, see our fixture model
 * @param {object} options Some global options, for example:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} All generated files (see file schema above)
 */
export async function exportFixtures(fixtures, options) {
  const outfiles = [];

  for (const fixture of fixtures) {
    for (const mode of fixture.modes) {
      outfiles.push({
        name: `${fixture.manufacturer.key}-${fixture.key}-${mode.shortName}.xml`,

        // That's just an example! Usually, the (way larger) file contents are
        // computed using several (possibly asynchronous) helper functions
        content: `<title>${fixture.name}: ${mode.channels.length}ch</title>`,
        mimetype: `application/xml`,
      });
    }
  }

  return outfiles;
}
```

## Importing

If importing is supported, create a `plugins/<plugin-key>/import.js` module that exports the plugin name, version and a method that creates OFL fixture definitions out of a given third-party file.

As file parsing (like XML processing) can be asynchronous, the import method returns its results asynchronously using a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to an object that looks like this:

<!-- eslint-skip -->
```js
{
  // Imported manufacturer data; like in manufacturers.json:
  // key: 'manufacturer-key', value: manufacturer data
  manufacturers: {},
  // Imported fixtures
  // key: 'manufacturer-key/fixture-key', value: like in a fixture JSON
  fixtures: {},
  // Warnings about each imported fixture
  // (e.g. if the definition was incorrect or lacks required information)
  // key: 'manufacturer-key/fixture-key', value: array of strings (warning messages)
  warnings: {}
};
```

If the file can not be parsed by the import plugin or contains errors, the returned Promise should reject with an Error.

Example:

```js
export const version = `0.1.0`; // semantic versioning of import plugin

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} fileName The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise<object, Error>} A Promise that resolves to an out object (see above) or rejects with an error.
 */
export async function importFixtures(buffer, fileName, authorName) {
  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
  };

  // just an example
  const manufacturerKey = `cameo`;
  const fixtureKey = `thunder-wash-600-rgb`; // use a sanitized key as it's used as filename!

  const fixtureObject = {};
  out.warnings[`${manufacturerKey}/${fixtureKey}`] = [];

  const fileContent = buffer.toString();
  const couldNotParse = fileContent.includes(`Error`);
  if (couldNotParse) {
    throw new Error(`Could not parse '${fileName}'.`);
  }

  fixtureObject.name = `Thunder Wash 600 RGB`;

  // Add warning if a necessary property is not included in parsed file
  out.warnings[`${manufacturerKey}/${fixtureKey}`].push(`Could not parse categories, please specify them manually.`);

  // That's the imported fixture
  out.fixtures[`${manufacturerKey}/${fixtureKey}`] = fixtureObject;

  return out;
}
```

## Export tests

We want to run unit tests wherever possible (see [Testing](testing.md)), that's why it's possible to write plugin specific tests for exported fixtures, so called export tests. Of course they're only possible if the plugin provides an export module.

A plugin's export test takes an exported file object as argument and evaluates it against plugin-specific requirements. For example, there is a [QLC+ export test](../plugins/qlcplus_4.12.2/exportTests/xsd-schema-conformity.js) that compares the generated XML file with the given QLC+ XSD fixture schema (if an official XML schema is available, it should definitely be used in an export test). We run these export tests automatically using GitHub Actions.

Each test module should be located at `plugins/<plugin-key>/exportTests/<export-test-key>.js`. Here's a dummy test illustrating the structure:

```js
import xml2js from 'xml2js';

/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {string} exportFile.content File content.
 * @param {string} exportFile.mimetype File mime type.
 * @param {Fixture[] | null} exportFile.fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {string | null} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {Promise<void, string[] | string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
 */
export default async function testValueCorrectness(exportFile) {
  const xml = await xml2js.parseStringPromise(exportFile.content);

  const errors = [];

  // the lighting software crashes if the name is empty, so we must ensure that this won't happen
  // (just an example)
  if (!(Name in xml.Fixture) || xml.Fixture.Name[0] === ``) {
    errors.push(`Name missing`);
  }

  if (errors.length > 0) {
    throw errors;
  }

  // everything's ok
}
```

You can execute an export test from the command line:

```bash
node cli/run-export-test.js -p <plugin> [ <fixtures> ]
node cli/run-export-test.js -h # Help message
```

Export tests are automatically run in pull requests, where they add a comment with the changes introduced by the pull request.
