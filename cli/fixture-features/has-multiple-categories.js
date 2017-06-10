module.exports.name = 'Multiple categories';

module.exports.hasFeature = function(fixture, fineChannels) {
  return fixture.categories.length > 1;
}