module.exports.name = 'Fine channel used before its coarse channel';

module.exports.hasFeature = function(fixture, fineChannels) {
  for (const mode of fixture.modes) {
    for (const fineChannel of Object.keys(fineChannels)) {
      if (mode.channels.includes(fineChannel) &&
        mode.channels.indexOf(fineChannel) < mode.channels.indexOf(fineChannels[fineChannel])) {
        return true;
      }
    }
  }
  return false;
}