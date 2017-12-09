# Fixture model

Instead of parsing [fixtures' JSON data](fixture-format.md) directly, it is recommended to use the model. We developed it to ease handling complicated fixture features like fine channels or switching channels.

The model uses [ES2015 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) to represent the fixtures. E.g., `Fixture.fromRepository('cameo', 'nanospot-120')` returns a [`Fixture`](../lib/model/Fixture.js) object, instantiated with the specified fixture's data. These objects have several convenient properties that allow easy usage of the fixture data in [plugins](plugins.md), [UI](ui.md) and more.

All model classes are located in the [`lib/model/`](../lib/model) directory. When using the model, it should suffice to import the `Fixture` module; instances of other classes are returned by the fixture's properties:

```js
const Fixture = require('./lib/model/Fixture.js');

const myFix = Fixture.fromRepository('cameo', 'nanospot-120'); // instanceof Fixture

const physicalData = myFix.physical; // instanceof Physical
const panFine = myFix.getChannelByKey('Pan fine'); // instanceof FineChannel

if (panFine.coarseChannel.hasHighlightValue) {
  console.log(`Highlight at ${panFine.coarseChannel.highlightValue}`)
}
```

Model properties are always implemented using getters and setters. To store data, we use backing fields (an internal property prefixed with underscore, e.g. `_jsonObject`) to hold the data. The backing field should never be accessed directly, but only through its getter and setter functions (without underscore).

Avoid returning `undefined` by returning smart default values if necessary. If the default value is not `null`, also provide a `hasXY` boolean getter function. Properties that need further computation or create other objects should be cached in an internal `_cache` object.

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
