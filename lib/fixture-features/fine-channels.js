module.exports = [
  {
    id: 'fine-channel-alias',
    name: 'Fine channels (16bit)',
    description: 'Whether a channel defines exactly one fine channel alias',
    hasFeature: fixture => fixture.availableChannels.some(channel => channel.fineChannelAliases.length === 1)
  },
  {
    id: 'fine-channel-aliases',
    name: 'Fine channels (>16bit)',
    description: 'Whether a channel defines two or more fine channel aliases',
    hasFeature: fixture => fixture.availableChannels.some(channel => channel.fineChannelAliases.length > 1)
  },
  {
    id: 'fine-channel-capabilities',
    name: 'Fine channel capabilities',
    description: 'Whether a channel with fine channel aliases has capabilities',
    hasFeature: fixture => fixture.fineChannels.some(fineChannel => fineChannel.coarseChannel.hasCapabilities)
  }
];