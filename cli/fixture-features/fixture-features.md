Fixture features are specific fixture characteristics (like "uses heads" or "uses fine channel before coarse channel"), especially ones that produced or are likely to produce bugs and errors.

Each fixture feature file looks like this:

```js
module.exports.name = 'Fine channels'; // Required. Try to be as short as possible as it's used in generated table header. Markdown is allowed.

module.exports.description = 'Whether fine channel aliases are defined'; // Optional. Is used as tooltip in generated table header. Markdown is not allowed.

module.exports.order = 80; // Optional. The features with the highest order is in the first column, the feature with the lowest order in the last column. Default value is 0, negative values are allowed (to appear after the features with default order).

/**
 * Required. Checks if the given fixtures uses this file's feature.
 * @param {Object} fixture - The parsed json data
 * @param {Object} fineChannels - { fineChannelAlias -> coarseChannelKey }
 * @return {Boolean} true if fixture uses the feature
 */
module.exports.hasFeature = function(fixture, fineChannels) {
  return Object.keys(fineChannels).length > 0;
}
```