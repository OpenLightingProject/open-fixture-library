module.exports.name = 'Switching channels';
module.exports.description = 'Whether switching channel aliases are defined';
module.exports.order = 70;

module.exports.hasFeature = function(fixture, fineChannels) {
  for (const ch of Object.keys(fixture.availableChannels)) {
    const channel = fixture.availableChannels[ch];

    if ('capabilities' in channel &&
        'switchChannels' in channel.capabilities[0]) {
      return true;
    }
  }
  return false;
};