module.exports = [{
  name: 'Multiple categories',
  order: 100,
  hasFeature: function(fixture, fineChannels) {
    return fixture.categories.length > 1;
  }
}];