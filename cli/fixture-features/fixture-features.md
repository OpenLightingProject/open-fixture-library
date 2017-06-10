Fixture features are specific fixture characteristics (like "uses heads" or "uses fine channel before coarse channel"), especially ones that produced or are likely to produce bugs and errors.

Each fixture feature file looks like this:

```js
module.exports.name = 'Heads'; // Required. Try to be as short as possible as it's used in generated table header

/**
 * Required. Checks if the given fixtures uses this file's feature.
 * @param {Object} fixture - The parsed json data
 * @param {Object} fineChannels - { fineChannelAlias -> coarseChannelKey }
 * @return {Boolean} true if fixture uses the feature
 */
module.exports.hasFeature = function(fixture, fineChannels) {
  return Object.keys(fixture).includes('heads');
}
```