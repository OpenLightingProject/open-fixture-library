module.exports.name = '`null` channels';

module.exports.hasFeature = function(fixture, fineChannels) {
  for (const mode of fixture.modes) {
    if (mode.channels.includes(null)) {
      return true;
    }
  }
  return false;
}