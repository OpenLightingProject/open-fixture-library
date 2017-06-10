module.exports.name = 'Heads';
module.exports.description = 'Whether there are heads defined';

module.exports.hasFeature = function(fixture, fineChannels) {
  return 'heads' in fixture && Object.keys(fixture.heads).length > 0;
}