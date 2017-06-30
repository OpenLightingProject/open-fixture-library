module.exports = [{
  name: 'Switching channels',
  description: 'Whether at least one channel defines switching channel aliases',
  order: 70,
  hasFeature: fixture => fixture.switchingChannels.length > 0
}];