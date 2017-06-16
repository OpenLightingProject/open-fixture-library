module.exports = [{
  name: '`null` channels',
  description: 'Channel list of a mode contains null, so it has an unused channel',
  order: 30,
  hasFeature: function(fixture, fineChannels) {
    for (const mode of fixture.modes) {
      if (mode.channels.includes(null)) {
        return true;
      }
    }
    return false;
  }
}];