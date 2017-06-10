module.exports.name = 'Fine before coarse';
module.exports.description = 'Fine channel used in a mode before its coarse channel';
module.exports.order = 35;

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