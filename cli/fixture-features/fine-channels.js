module.exports = [
  {
    id: 'fine-channel-alias',
    name: 'Fine channels (16bit)',
    description: 'Whether a channel defines exactly one fine channel alias',
    order: 81,
    hasFeature: function(fixture, fineChannels) {
      for (const ch of Object.keys(fixture.availableChannels)) {
        const channel = fixture.availableChannels[ch];
        if ('fineChannelAliases' in channel && channel.fineChannelAliases.length === 1) {
          return true;
        }
      }
      return false;
    }
  },
  {
    id: 'fine-channel-aliases',
    name: 'Fine channels (>16bit)',
    description: 'Whether a channel defines two or more fine channel aliases',
    order: 80,
    hasFeature: function(fixture, fineChannels) {
      for (const ch of Object.keys(fixture.availableChannels)) {
        const channel = fixture.availableChannels[ch];
        if ('fineChannelAliases' in channel && channel.fineChannelAliases.length > 1) {
          return true;
        }
      }
      return false;
    }
  }
];