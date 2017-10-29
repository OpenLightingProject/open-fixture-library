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
  * [Export Tests](#export-tests)
* [Testing](#testing)
* [UI / Website](#ui--website)

## Fixtures
*[⬆️ Back to top](#technical-overview)*

A fixture (sometimes also *personality*) is a lighting device that can be controlled with DMX. OFL gathers fixture definitions, that are specifications of a fixture's general information (like physical data) and the details of its [DMX](https://www.learnstagelighting.com/what-is-dmx-512/) controlment.

Each fixture belongs to a [manufacturer](#manufacturers) (many-to-one relationship). A manufacturer is the vendor or brand of the fixture.

The fixtures are saved as [JSON](http://www.json.org/) files at `fixtures/<manufacturer-key>/<fixture-key>.json`. The fixture key is only defined by the filename. See [details about the fixture JSON format](TODO).

The JSON fixture data is parsed and processed using our [model](#fixture-model).

## Manufacturers
*[⬆️ Back to top](#technical-overview)*

A manufacturer is a [fixture](#fixtures) vendor or brand. Each fixture belongs to a manufacturer (0-n fixtures to 1 manufacturer relationship).

All used manufacturers must be defined in `fixtures/manufacturers.json` in order that their unique keys can be registered. All fixtures of a manufacturer are saved in the `fixtures/<manufacturer-key>/` directory.

We also store (optional) additional manufacturer data like comment, website or [RDM](TODO) data.

## Fixture model
*[⬆️ Back to top](#technical-overview)*

Instead of parsing a [fixture](#fixtures)'s JSON data directly, it is recommended to use the model. We developed it to easier handle complicated fixture features like fine/switching channels.

The model uses [ES2015 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) to represent the fixtures. E. g., `Fixture.fromRepository('cameo', 'nanospot-120')` returns an instance of the `Fixture` class, instantiated with the specified fixture's data. These objects have several convenient properties that allow an easy usage of the fixture data in [plugins](#plugins), [UI](#ui--website) and more.

All model classes (like `Fixture`, `Manufacturer`, `Physical`, `Channel` or `Range`) are located in the `lib/model/` directory. When using the model, it should be enough importing the `Fixture` module; instances of other classes are returned by the fixture's properties:

```js
const Fixture = require('lib/model/Fixture.js');

const myFix = Fixture.fromRepository('cameo', 'nanospot-120'); // instanceof Fixture

const physicalData = myFix.physical; // instanceof Physical
const panFine = myFix.getChannelByKey('Pan fine'); // instanceof FineChannel

if (panFine.coarseChannel.hasHighlightValue) {
  console.log(`Hightlight at ${panFine.coarseChannel.highlightValue}`)
}
```

Model properties are always implemented using getters and setters. To store data, we use backing fields (prefixed with underscore, like `_jsonObject`) that should never be invoked from outside. Properties that need further computation or create other objects should be cached in the internal `_cache` object. Avoid returning `undefined` under all circumstances! To achieve this, use defaults for optional properties – if the default is not `null`, it's good practice providing a `hasXY` boolean.

*It is planned* to document all available classes with their properties and methods using [JSDoc](http://usejsdoc.org/). That's why JSDoc annotations are required for new properties/methods and should be gradually added to existing ones.

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

  // it's not good creating a Meta object with each property access, so we cache it
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

## Fixture features
*[⬆️ Back to top](#technical-overview)*

Fixture features are specific [fixture](#fixtures) characteristics (like "uses RDM" or "uses fine channel before coarse channel"), especially ones that have produced or are likely to produce bugs and errors.

We use fixture features for the following purposes:
- Generate a possibly short variety of test fixtures that use possibly many different fixture features so we can check all special cases
- *(planned)* The fixture editor can only edit/import fixtures that only use editor-compatible fixture features
- *(planned)* Search for fixtures with specific fixture features (mainly for testing)

Fixture features are saved in the the `cli/fixture-features/` directory as JS modules that export an array of features. It is adviced to put similar features into one module. A sample module looks like this:

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

The aim of OFL is to import and export our fixture definitions from/to fixture formats of third-party lighting controlment software, for example [QLC+](https://github.com/mcallegari/qlcplus)'s `.qfx` format. A plugin is a converter between our and an external format. It implements an import and/or export method that processes/generates the third-party format.

Each plugin has its own directory `plugins/<plugin-key>/` which contains all information, methods and tests about the external format. Please provide a `README.md` as markdown file with a short explanation about the fixture format. If applicable, it should include

* a link to the software that uses this format
* how to import fixtures into the software
* a place where fixtures of this format can be obtained from

### Exporting
*[⬆️ Back to top](#technical-overview)*

If exporting is supported, create a `plugins/<plugin-key>/export.js` module that exports the plugin name, version and a method that generates the needed third-party files out of an given array of fixtures. This method should return an array of objects for each file; the files are zipped together automatically. A file object looks like this:

```js
{
  name: 'filename.ext',
  content: 'file content',
  mimetype: 'text/plain'
}
```

A very simple plugin looks like this:

```js
module.exports.name = 'Plugin Name';
module.exports.version = '0.1.0';  // semantic versioning of export plugin

/**
 * @param {!Fixture[]} fixtures An array of Fixture objects, see our fixture model
 * @param {!object} options Some global options, for example:
 * @param {!string} options.baseDir
 * @param {?Date} options.date
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

As file parsing (like xml processing) can be asynchronous, the import method returns it results asynchronously using the given `resolve` and `reject` functions (see [Promises](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise)). When processing is finished, the `resolve` function should be called with a result object that looks like this:
```js
{
  manufacturers: {},  // like in manufacturers.json
  fixtures: {},       // key: 'manufacturer-key/fixture-key', value: like in a fixture JSON
  warnings: {}        // key: 'manufacturer-key/fixture-key' to which a warning belongs, value: string
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
module.exports.import = function importPluginName(str, filename, resolve, reject) {
  let out = {
    manufacturers: {},  // like in manufacturers.json
    fixtures: {},       // key: 'manufacturer-key/fixture-key', value: like in a fixture JSON
    warnings: {}        // key: 'manufacturer-key/fixture-key' to which a warning belongs, value: string
  };

  // just an example
  const manKey = 'cameo';
  const fixKey = 'thunder-wash-600-rgb'

  if (couldNotParse) {
    return reject(`Could not parse '${filename}'.`);
  }

  // Add warning if a necessary property is not included in parsed file
  out.warnings[manKey + '/' + fixKey].push('Could not parse categories, please specify them manually.');

  out.fixtures[manKey + '/' + fixKey] = fixtureObject;

  resolve(out);
};
```

### Export tests
*[⬆️ Back to top](#technical-overview)*

...

## Testing
*[⬆️ Back to top](#technical-overview)*

...

## UI / Website
*[⬆️ Back to top](#technical-overview)*

...