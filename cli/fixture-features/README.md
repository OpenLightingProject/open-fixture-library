Fixture features are specific fixture characteristics (like "uses heads" or "uses fine channel before coarse channel"), especially ones that have produced or are likely to produce bugs and errors.

Each fixture feature module looks like this:

```js
// Required. Try to be as short as possible as it's used in generated table header. Markdown is allowed.
module.exports.name = 'Fine channels';

// Optional. Is used as tooltip in generated table header. Markdown is not allowed.
module.exports.description = 'Whether fine channel aliases are defined';

// Optional. The feature with the highest order is in the first (most-left) column.
// Default value is 0, negative values are allowed (to appear right to the features with default order).
module.exports.order = 80;

/**
 * Required. Checks if the given fixture uses this module's feature.
 * @param {Object} fixture - The parsed json data
 * @param {Object} fineChannels - { fineChannelAlias -> coarseChannelKey }
 * @return {Boolean} true if fixture uses the feature
 */
module.exports.hasFeature = function(fixture, fineChannels) {
  return Object.keys(fineChannels).length > 0;
};
```

A single fixture feature module can also provide several features by exporting an array of features:
```js
module.exports = [
  {
    name: '...'
    description: '...',
    hasFeature: function(fixture, fineChannels) {
      return true;
    }
  },
  // ...
];
```