# Plugins

The aim of the *Open Fixture Library* is to import and export our fixture definitions from / to fixture formats of third-party lighting control software, for example [QLC+](https://github.com/mcallegari/qlcplus)'s `.qfx` format. A plugin is a converter between our format and one such external format. It implements an import and / or export method that parses / generates the third-party format.

Each plugin has its own directory `plugins/<plugin-key>/` which contains all information, methods and tests about the external format. Please provide a `README.md` as Markdown file with a short explanation about the fixture format. If applicable, it should include

* a link to the software that uses this format,
* how to use our exported fixtures in the software,
* places where fixtures of this format can be obtained from.

You can try plugins from the command line:

```bash
# Import
node cli/import-fixture.js -p <plugin> <filename>
node cli/import-fixture.js -h # Help message

# Export
node cli/export-fixture.js -p <plugin> <fixture> [<more fixtures>]
```

## Exporting

If exporting is supported, create a `plugins/<plugin-key>/export.js` module that provides the plugin name, version and a method that generates the needed third-party files out of an given array of fixtures. This method should return a Promise of an array of objects for each file that should be exported / downloadable; the files are zipped together automatically if necessary. A file object looks like this:

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
module.exports.name = `Plugin Name`;
module.exports.version = `0.1.0`;  // semantic versioning of export plugin

/**
 * @param {array.<Fixture>} fixtures An array of Fixture objects, see our fixture model
 * @param {object} options Some global options, for example:
 * @param {string} options.baseDir Absolute path to OFL's root directory
 * @param {Date|null} options.date The current time (prefer this over new Date())
 * @returns {Promise.<array.<object>, Error>} All generated files (see file schema above)
*/
module.exports.export = function exportPluginName(fixtures, options) {
  const outfiles = [];

  for (const fixture of fixtures) {
    for (const mode of fixture.modes) {
      outfiles.push({
        name: `${fixture.manufacturer.key}-${fixture.key}-${mode.shortName}.xml`,

        // That's just an example! Usually, the (way larger) file contents are
        // computed using several (possibly asynchronous) helper functions
        content: `<title>${fixture.name}: ${mode.channels.length}ch</title>`,
        mimetype: `application/xml`
      });
    }
  }

  return Promise.resolve(outfiles);
};
```

## Importing

If importing is supported, create a `plugins/<plugin-key>/import.js` module that exports the plugin name, version and a method that creates OFL fixture definitions out of a given third-party file.

As file parsing (like XML processing) can be asynchronous, the import method returns its results asynchronously using a [Promise](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to an object that looks like this:

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
module.exports.name = `Plugin Name`;
module.exports.version = `0.1.0`;  // semantic versioning of import plugin

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} fileName The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise.<object, Error>} A Promise resolving to an out object
 *                                    (see above) or rejects with an error.
**/
module.exports.import = function importPluginName(buffer, fileName, authorName) {
  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {}
  };

  // just an example
  const manKey = `cameo`;
  const fixKey = `thunder-wash-600-rgb`; // use a sanitized key as it's used as filename!

  const fixtureObject = {};
  out.warnings[`${manKey}/${fixKey}`] = [];

  const fileContent = buffer.toString();
  const couldNotParse = fileContent.includes(`Error`);
  if (couldNotParse) {
    return Promise.reject(new Error(`Could not parse '${fileName}'.`));
  }

  fixtureObject.name = `Thunder Wash 600 RGB`;

  // Add warning if a necessary property is not included in parsed file
  out.warnings[`${manKey}/${fixKey}`].push(`Could not parse categories, please specify them manually.`);

  // That's the imported fixture
  out.fixtures[`${manKey}/${fixKey}`] = fixtureObject;

  return Promise.resolve(out);
};
```

Note that this example did not use asynchronous functions, so `Promise.resolve` and `Promise.reject` are called to wrap the (synchronously obtained) results in a Promise.

## Export tests

We want to run unit tests wherever possible (see [Testing](testing.md)), that's why it's possible to write plugin specific tests for exported fixtures, so called export tests. Of course they're only possible if the plugin provides an export module.

A plugin's export test takes an exported file object as argument and evaluates it against plugin-specific requirements. For example, there is a [QLC+ export test](../plugins/qlcplus/exportTests/xsd-schema-conformity.js) that compares the generated XML file with the given QLC+ XSD fixture schema (if an official XML schema is available, it should definitely be used in an export test). We run these export tests automatically using the Travis CI.

Each test module should be located at `plugins/<plugin-key>/exportTests/<export-test-key>.js`. Here's a dummy test illustrating the structure:

```js
const xml2js = require(`xml2js`);
const promisify = require(`util`).promisify;

/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {string} exportFile.content File content.
 * @param {string} exportFile.mimetype File mime type.
 * @param {array.<Fixture>|null} exportFile.fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {string|null} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {Promise.<undefined, array.<string>|string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
**/
module.exports = function testValueCorrectness(exportFile) {
  const parser = new xml2js.Parser();

  return promisify(parser.parseString)(exportFile.content)
    .then(xml => {
      const errors = [];

      // the lighting software crashes if the name is empty, so we must ensure that this won't happen
      // (just an example)
      if (!(Name in xml.Fixture) || xml.Fixture.Name[0] === ``) {
        errors.push(`Name missing`);
      }

      if (errors.length > 0) {
        return Promise.reject(errors);
      }

      // everything's ok
      return Promise.resolve();
    })
    .catch(parseError => Promise.reject(`Error parsing XML: ${parseError}`));
};
```

You can execute an export test from the command line:

```bash
node cli/run-export-test.js -p <plugin> [ <fixtures> ]
node cli/run-export-test.js -h # Help message
```

Export tests are automatically run in pull requests, where they add a comment with the changes introduced by the pull request.
