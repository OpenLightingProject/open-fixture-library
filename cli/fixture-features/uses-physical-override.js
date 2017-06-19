module.exports = [{
  name: 'Physical override',
  description: 'Whether at least one mode uses the \'physical\' property',
  order: 50,
  hasFeature: function(fixture, fineChannels) {
    for (const mode of fixture.modes) {
      if ('physical' in mode && Object.keys(mode.physical).length > 0) {
        return true;
      }
    }
    return false;
  }
}];