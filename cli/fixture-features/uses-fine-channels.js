module.exports = [{
  name: 'Fine channels',
  description: 'Whether fine channel aliases are defined',
  order: 80,
  hasFeature: function(fixture, fineChannels) {
    return Object.keys(fineChannels).length > 0;
  }
}];