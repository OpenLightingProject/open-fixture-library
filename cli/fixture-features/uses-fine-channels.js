module.exports.name = 'Fine channels';

module.exports.hasFeature = function(fixture, fineChannels) {
  return Object.keys(fineChannels).length > 0;
}