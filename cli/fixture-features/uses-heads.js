module.exports = [{
  name: 'Heads',
  description: 'Whether there are heads defined',
  order: 60,
  hasFeature: function(fixture, fineChannels) {
    return 'heads' in fixture && Object.keys(fixture.heads).length > 0;
  }
}];