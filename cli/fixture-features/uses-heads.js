module.exports.name = 'Heads';

module.exports.hasFeature = function(fixture, fineChannels) {
  return Object.keys(fixture).includes('heads');
}