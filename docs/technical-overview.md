*[➡️ Documentation index](./index.md)*

# Technical Overview

**Table of contents**

* [Fixtures](#fixtures)
* [Manufacturers](#manufacturers)
* [Fixture model](#fixture-model)
* [Fixture features](#fixture-features)
* [Plugins](#plugins)
  * [Exporting](#exporting)
  * [Importing](#importing)
  * [Export tests](#export-tests)
* [Testing](#testing)
* [UI / Website](#ui--website)

## Fixtures
*[⬆️ Back to top](#technical-overview)*

A fixture is a lighting device that can be controlled with DMX. OFL gathers fixture definitions (sometimes also *personalities* or *profiles*), that are specifications of a fixture's general information (like physical data) and the details of its [DMX](https://www.learnstagelighting.com/what-is-dmx-512/) controlment.

Each fixture belongs to exactly one [manufacturer](#manufacturers). A manufacturer is the vendor or brand of the fixture.

The fixtures are saved as [JSON](http://www.json.org/) files at `fixtures/<manufacturer-key>/<fixture-key>.json`. The fixture key is only defined by the filename. See [details about the fixture JSON format](TODO).

The JSON fixture data is parsed and processed using our [model](#fixture-model).

## Manufacturers
*[⬆️ Back to top](#technical-overview)*

A manufacturer is a [fixture](#fixtures) vendor or brand. Each fixture belongs to a manufacturer.

All used manufacturers must be defined in `fixtures/manufacturers.json` in order that their unique keys can be registered. All fixtures of a manufacturer are saved in the `fixtures/<manufacturer-key>/` directory.

We also store (optional) additional manufacturer data in `manufacturers.json` like comment, website or [RDM](TODO) data.

## Fixture model
*[⬆️ Back to top](#technical-overview)*

Instead of parsing a [fixture](#fixtures)'s JSON data directly, it is recommended to use the model. We developed it to make handling complicated fixture features like fine/switching channels easier.

The model uses [ES2015 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) to represent the fixtures. E. g., `Fixture.fromRepository('cameo', 'nanospot-120')` returns a `Fixture` object, instantiated with the specified fixture's data. These objects have several convenient properties that allow easy usage of the fixture data in [plugins](#plugins), [UI](#ui--website) and more.

All model classes (like `Fixture`, `Manufacturer`, `Physical`, `Channel` or `Range`) are located in the `lib/model/` directory. When using the model, it should suffice to import the `Fixture` module; instances of other classes are returned by the fixture's properties:

```js
const Fixture = require('lib/model/Fixture.js');

const myFix = Fixture.fromRepository('cameo', 'nanospot-120'); // instanceof Fixture

const physicalData = myFix.physical; // instanceof Physical
const panFine = myFix.getChannelByKey('Pan fine'); // instanceof FineChannel

if (panFine.coarseChannel.hasHighlightValue) {
  console.log(`Highlight at ${panFine.coarseChannel.highlightValue}`)
}
```

Model properties are always implemented using getters and setters. To store data, we use backing fields, an internal property prefixed with underscore (like `_jsonObject`) that holds the data. The backing field should never be accessed directly but only with its getter and setter (without underscore).

Avoid returning `undefined` under all circumstances! To achieve this, use defaults for optional properties – if the default is not `null`, it's good practice to provide a `hasXY` boolean. Properties that need further computation or create other objects should be cached in the internal `_cache` object.

```js
module.exports = class Fixture {
  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  // only returns backing field to avoid accessing _jsonObject from outside
  get jsonObject() {
    return this._jsonObject;
  }

  // required, no default needed
  get name() {
    return this._jsonObject.name;
  }

  // defaults to the name
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  get hasShortName() {
    return 'shortName' in this._jsonObject;
  }

  // it's not good to create a Meta object with each property access, so we cache it
  get meta() {
    if (!('meta' in this._cache)) {
      this._cache.meta = new Meta(this._jsonObject.meta);
    }

    return this._cache.meta;
  }

  // defaults to null as there is no meaningful other default
  get manualURL() {
    return this._jsonObject.manualURL || null;
  }

  // ...
}
```

*It is planned* to document all available classes with their properties and methods using [JSDoc](http://usejsdoc.org/). That's why JSDoc annotations are required for new properties/methods and should be gradually added to existing ones.

## Fixture features
*[⬆️ Back to top](#technical-overview)*

Fixture features are specific [fixture](#fixtures) characteristics (like "uses RDM" or "uses fine channel before coarse channel"), especially ones that have produced or are likely to produce bugs and errors.

We use fixture features for the following purposes:
- Generate a minimal collection of test fixtures that cover all fixture features so we can check all special cases with minimum work
- *(planned)* The fixture editor can only edit/import fixtures that only use editor-compatible fixture features
- *(planned)* Search for fixtures with specific fixture features (mainly for testing)

Fixture features are saved in the the `cli/fixture-features/` directory as JS modules that export an array of features. It is advised to put similar features into one module. A sample module looks like this:

```js
module.exports = [{
  // Optional. Used internally and in test-fixtures.json.
  // Default is the filename (without '.js'), succeded by `-${i}` if multiple features per module are provided.
  id: 'fine-channel-alias',

  // Required. Try to be as short as possible as it's used in generated table header. Markdown is allowed.
  name: 'Fine channels (16bit)',

  // Optional. Is used as tooltip in generated table header. Markdown is not allowed.
  description: 'Whether a channel defines exactly one fine channel alias',

  // Optional. The feature with the highest order is in the first (most-left) column.
  // Default value is 0, negative values are allowed (to appear right to the features with default order).
  order: 81,

  /**
   * Required. Checks if the given fixture uses this module's feature.
   * @param {!Fixture} fixture The Fixture instance, see our model.
   * @return {!Boolean} true if fixture uses the feature
   */
  hasFeature: fixture =>
    fixture.availableChannels.some(
      channel => channel.fineChannelAliases.length === 1
    )
}];
```

## Plugins
*[⬆️ Back to top](#technical-overview)*

The aim of OFL is to import and export our fixture definitions from/to fixture formats of third-party lighting control software, for example [QLC+](https://github.com/mcallegari/qlcplus)'s `.qfx` format. A plugin is a converter between our and an external format. It implements an import and/or export method that processes/generates the third-party format.

Each plugin has its own directory `plugins/<plugin-key>/` which contains all information, methods and tests about the external format. Please provide a `README.md` as markdown file with a short explanation about the fixture format. If applicable, it should include

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

### Exporting
*[⬆️ Back to top](#technical-overview)*

If exporting is supported, create a `plugins/<plugin-key>/export.js` module that provides the plugin name, version and a method that generates the needed third-party files out of an given array of fixtures. This method should return an array of objects for each file that should be exported/downloadable; the files are zipped together automatically if neccessary. A file object looks like this:

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
 * @param {!Fixture[]} fixtures An array of Fixture objects, see our fixture model
 * @param {!object} options Some global options, for example:
 * @param {!string} options.baseDir Absolute path to OFL's root directory
 * @param {?Date} options.date The current time (prefer this over new Date())
 * @return {!object[]} All generated files (see file schema above)
*/
module.exports.export = function exportPluginName(fixtures, options) {
  let outfiles = [];

  for (const fixture of fixtures) {
    for (const mode of fixture.modes)
      outfiles.push({
        name: `${fixture.manufacturer.key}-${fixture.key}-${mode.shortName}.xml`,
        content: `<title>${fixture.name}: ${mode.channels.length}ch</title>`, // this fixture definition is quite useless, normally it's way larger and computated using several helper functions
        mimetype: 'application/xml'
      });
    }
  }

  return outfiles;
};
```

### Importing
*[⬆️ Back to top](#technical-overview)*

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
 * @param {!String} fileContent The imported file's content
 * @param {!String} fileName The imported file's name
 * @param {!Function} resolve For usage, see above
 * @param {!Function} reject For usage, see above
**/
module.exports.import = function importPluginName(fileContent, fileName, resolve, reject) {
  let out = {
    manufacturers: {},
    fixtures: {},
    warnings: {}
  };

  // just an example
  const manKey = 'cameo';
  const fixKey = 'thunder-wash-600-rgb'; // use a sanitized key as it's used as filename!

  let fixtureObject = {};
  out.warnings[manKey + '/' + fixKey] = [];

  if (couldNotParse) {
    reject(`Could not parse '${fileName}'.`);
    return;
  }

  fixtureObject.name = "Thunder Wash 600 RGB";

  // Add warning if a necessary property is not included in parsed file
  out.warnings[manKey + '/' + fixKey].push('Could not parse categories, please specify them manually.');

  out.fixtures[manKey + '/' + fixKey] = fixtureObject;

  resolve(out);
};
```

### Export tests
*[⬆️ Back to top](#technical-overview)*

We want to run unit tests whereever possible (see section [Testing](#testing)), that's why it's possible to write plugin specific tests for exported fixtures, so called export tests. Of course they're only possible if the plugin provides an export module.

A plugin's export test takes an exported fixture as argument and evaluates it against plugin-specific requirements. For example, there is a [QLC+ export test](../plugins/qlcplus/exportTests/xsd-schema-conformity.js) that compares the generated xml file with the given QLC+ xsd fixture schema (if an official xml schema is available, it should definitely be used in an export test). We run these export tests automatically using the Travis CI.

Each test module should be located at `/plugins/<plugin-key>/exportTests/<export-test-key>.js`. Here's a dummy test illustrating the structure:

```js
/**
 * @param exportFileData {string} The content of a file returned by the plugins' export module.
 * @return {Promise} Resolve when the test passes or reject with an error if the test fails.
**/
module.exports = function testValueCorrectness(exportFileData) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();

    parser.parseString(exportFileData, (parseError, xml) => {
      if (parseError) {
        return reject('Error parsing XML: ' + parseError.toString());
      }
      
      // the plugin crashes if the name is empty, so we must ensure that this won't happen
      // (just an example)
      if (xml.Fixture.Name[0].length == 0) {
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

## Testing
*[⬆️ Back to top](#technical-overview)*

...

## UI / Website
*[⬆️ Back to top](#technical-overview)*

...