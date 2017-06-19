module.exports = [{
  name: 'Switching channels',
  description: 'Whether at least one channel defines switching channel aliases',
  order: 70,
  hasFeature: function(fixture, fineChannels) {
    for (const ch of Object.keys(fixture.availableChannels)) {
      const channel = fixture.availableChannels[ch];

      if ('capabilities' in channel &&
          'switchChannels' in channel.capabilities[0]) {
        return true;
      }
    }
    return false;
  }
}];