module.exports.name = 'Multiple categories';
module.exports.order = 100;

module.exports.hasFeature = function(fixture, fineChannels) {
  return fixture.categories.length > 1;
}