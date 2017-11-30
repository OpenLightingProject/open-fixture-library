module.exports = [{
  name: 'Reused channels',
  description: 'Whether there is at least one channel that is used in different modes',
  order: 40,
  hasFeature: fixture => {
    const usedChannels = [];
    for (const mode of fixture.modes) {
      for (const ch of mode.channelKeys) {
        if (usedChannels.includes(ch)) {
          return true;
        }
        usedChannels.push(ch);
      }
    }
    return false;
  }
}];
