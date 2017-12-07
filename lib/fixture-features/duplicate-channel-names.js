module.exports = [{
  name: 'Duplicate channel names',
  hasFeature: fixture => {
    const names = fixture.availableChannels.map(ch => ch.name).concat(fixture.matrixChannels.map(ch => ch.wrappedChannel.name));
    return names.some((name, pos) => names.indexOf(name) !== pos);
  }
}];