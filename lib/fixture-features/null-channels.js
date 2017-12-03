module.exports = [{
  name: '`null` channels',
  description: 'Channel list of a mode contains null, so it has an unused channel',
  hasFeature: fixture => fixture.nullChannels.length > 0
}];