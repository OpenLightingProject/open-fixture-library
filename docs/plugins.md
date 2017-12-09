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

If exporting is supported, create a `plugins/<plugin-key>/export.js` module that provides the plugin name, version and a method that generates the needed third-party files out of an given array of fixtures. This method should return an array of objects for each file that should be exported / downloadable; the files are zipped together automatically if neccessary. A file object looks like this:

```js
{
  name: 'filename.ext',
  content: 'file content',
  mimetype: 'text/plain'
}
```

A very simple export plugin looks like this:

```js
module.exports.name = 'Plugin Name';
module.exports.version = '0.1.0';  // semantic versioning of export plugin

/**
 * @param {!Array.<Fixture>} fixtures An array of Fixture objects, see our fixture model
 * @param {!object} options Some global options, for example:
 * @param {!string} options.baseDir Absolute path to OFL's root directory
 * @param {?Date} options.date The current time (prefer this over new Date())
 * @returns {!Array.<object>} All generated files (see file schema above)
*/
module.exports.export = function exportPluginName(fixtures, options) {
  const outfiles = [];

  for (const fixture of fixtures) {
    for (const mode of fixture.modes) {
      outfiles.push({
        name: `${fixture.manufacturer.key}-${fixture.key}-${mode.shortName}.xml`,
        // that's just an example, normally, the (way larger) file contents are computated using several helper functions
        content: `<title>${fixture.name}: ${mode.channels.length}ch</title>`,
        mimetype: 'application/xml'
      });
    }
  }

  return outfiles;
};
```

## Importing

If importing is supported, create a `plugins/<plugin-key>/import.js` module that exports the plugin name, version and a method that creates OFL fixture definitions out of a given third-party file.

As file parsing (like xml processing) can be asynchronous, the import method returns its results asynchronously using the given `resolve` and `reject` functions (see [Promises](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise)). When processing is finished, the `resolve` function should be called with a result object that looks like this:

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

The `reject` function should be called with an error string if it's not possible to parse the given file.

Example:

```js
module.exports.name = 'Plugin Name';
module.exports.version = '0.1.0';  // semantic versioning of import plugin

/**
 * @param {!string} fileContent The imported file's content
 * @param {!string} fileName The imported file's name
 * @param {!Function} resolve For usage, see above
 * @param {!Function} reject For usage, see above
**/
module.exports.import = function importPluginName(fileContent, fileName, resolve, reject) {
  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {}
  };

  // just an example
  const manKey = 'cameo';
  const fixKey = 'thunder-wash-600-rgb'; // use a sanitized key as it's used as filename!

  const fixtureObject = {};
  out.warnings[`${manKey}/${fixKey}`] = [];

  const couldNotParse = fileContent.includes('Error');
  if (couldNotParse) {
    reject(`Could not parse '${fileName}'.`);
    return;
  }

  fixtureObject.name = 'Thunder Wash 600 RGB';

  // Add warning if a necessary property is not included in parsed file
  out.warnings[`${manKey}/${fixKey}`].push('Could not parse categories, please specify them manually.');

  // That's the imported fixture
  out.fixtures[`${manKey}/${fixKey}`] = fixtureObject;

  resolve(out);
};
```

## Export tests

We want to run unit tests whereever possible (see [Testing](testing.md)), that's why it's possible to write plugin specific tests for exported fixtures, so called export tests. Of course they're only possible if the plugin provides an export module.

A plugin's export test takes an exported fixture as argument and evaluates it against plugin-specific requirements. For example, there is a [QLC+ export test](../plugins/qlcplus/exportTests/xsd-schema-conformity.js) that compares the generated xml file with the given QLC+ xsd fixture schema (if an official xml schema is available, it should definitely be used in an export test). We run these export tests automatically using the Travis CI.

Each test module should be located at `plugins/<plugin-key>/exportTests/<export-test-key>.js`. Here's a dummy test illustrating the structure:

```js
const xml2js = require('xml2js');

/**
 * @param {string} exportFileData The content of a file returned by the plugins' export module.
 * @returns {Promise} Resolve when the test passes or reject with an error if the test fails.
**/
module.exports = function testValueCorrectness(exportFileData) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();

    parser.parseString(exportFileData, (parseError, xml) => {
      if (parseError) {
        return reject(`Error parsing XML: ${parseError}`);
      }

      // the plugin crashes if the name is empty, so we must ensure that this won't happen
      // (just an example)
      if (xml.Fixture.Name[0].length === 0) {
        return reject('Name missing');
      }

      // everything's ok
      return resolve();
    });
  });
};
```

You can try an export test from the command line:

```bash
node cli/run-export-test.js -p <plugin> [ <fixtures> ]
node cli/run-export-test.js -h # Help message
```

Export tests are automatically run in pull requests, where they add a comment with the changes introduced by the pull request.
