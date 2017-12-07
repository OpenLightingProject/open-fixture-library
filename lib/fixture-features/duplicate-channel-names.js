module.exports = [{
  name: 'Duplicate channel names',
  hasFeature: fixture => {
    const names = fixture.availableChannels.map(ch => ch.name);
    return names.some((name, pos) => names.indexOf(name) !== pos);
  }
}];