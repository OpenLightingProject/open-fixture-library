module.exports.name = '`null` channels';
module.exports.description = 'Channel list of a mode contains null, so it has an unused channel';
module.exports.order = 30;

module.exports.hasFeature = function(fixture, fineChannels) {
  for (const mode of fixture.modes) {
    if (mode.channels.includes(null)) {
      return true;
    }
  }
  return false;
}