module.exports.name = 'Switching channels';
module.exports.description = 'Whether switching channel aliases are defined';
module.exports.order = 70;

module.exports.hasFeature = function(fixture, fineChannels) {
  for (const ch of Object.keys(fixture.availableChannels)) {
    if ('switchesChannels' in fixture.availableChannels[ch]) {
      return true;
    }
  }
  return false;
};