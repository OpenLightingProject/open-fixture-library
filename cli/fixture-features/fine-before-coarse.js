module.exports = [{
  name: 'Fine before coarse',
  description: 'Fine channel used in a mode before its coarse channel',
  order: 35,
  hasFeature: function(fixture, fineChannels) {
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
}];