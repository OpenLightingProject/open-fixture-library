Fixture features are specific fixture characteristics (like "uses heads" or "uses fine channel before coarse channel"), especially ones that have produced or are likely to produce bugs and errors.

Each fixture feature module has to export an array of one or more feature objects that look like this:

```js
module.exports = [{
  // Optional. Used internally and in test-fixtures.json.
  // Default is the filename (without '.js'), succeded by `-${i}` if multiple features per module are provided.
  id: 'uses-fine-channels',

  // Required. Try to be as short as possible as it's used in generated table header. Markdown is allowed.
  name: 'Fine channels',

  // Optional. Is used as tooltip in generated table header. Markdown is not allowed.
  description: 'Whether fine channel aliases are defined',

  /**
   * Required. Checks if the given fixture uses this module's feature.
   * @param {Fixture} fixture - The fixture data
   * @return {Boolean} true if fixture uses the feature
   */
  hasFeature: fixture => {
    return fixture.fineChannels.length > 0;
  }
}];
```