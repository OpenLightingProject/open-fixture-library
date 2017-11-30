module.exports = [{
  name: 'Switching channels',
  description: 'Whether at least one channel defines switching channel aliases',
  hasFeature: fixture => fixture.switchingChannels.length > 0
}];