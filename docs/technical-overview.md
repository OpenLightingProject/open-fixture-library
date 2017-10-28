*[➡️ Documentation index](./index.md)*

# Technical Overview

**Table of contents**

* [Fixtures](#fixtures)
* [Fixture model](#fixture-model)
* [Fixture features](#fixture-features)

## Fixtures
*[⬆️ Back to top](#technical-overview)*

A fixture (sometimes also *personality*) is a lighting device that can be controlled with DMX. OFL gathers fixture definitions, that are specifications of a fixture's general information (like physical data) and the details of its [DMX](TODO) controlment.

Each fixture belongs to a manufacturer (many-to-one relationship). A manufacturer is the vendor or brand of the fixture. See [manufacturers](TODO).

The fixtures are saved as [JSON](TODO) files at `fixtures/<manufacturer-key>/<fixture-key>.json`. The fixture key is only defined by the filename. See [details about the fixture JSON format](TODO).

The JSON fixture data is parsed and processed using our [model](#fixture-model).

## Fixture model
*[⬆️ Back to top](#technical-overview)*

...

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
   * @param {Fixture} fixture The Fixture instance, see our model.
   * @return {Boolean} true if fixture uses the feature
   */
  hasFeature: fixture =>
    fixture.availableChannels.some(
      channel => channel.fineChannelAliases.length === 1
    )
}];
```