module.exports = [{
  name: 'Fine channels',
  description: 'Whether at least one channel defines fine channel aliases',
  order: 80,
  hasFeature: function(fixture, fineChannels) {
    return Object.keys(fineChannels).length > 0;
  }
}];