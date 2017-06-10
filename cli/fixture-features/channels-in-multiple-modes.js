module.exports.name = 'Channels used in multiple modes';

module.exports.hasFeature = function(fixture, fineChannels) {
  let usedChannels = [];
  for (const mode of fixture.modes) {
    for (const ch of mode.channels) {
      if (usedChannels.includes(ch)) {
        return true;
      }
      usedChannels.push(ch);
    }
  }
  return false;
}