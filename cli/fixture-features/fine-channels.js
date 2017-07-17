module.exports = [
  {
    id: 'fine-channel-alias',
    name: 'Fine channels (16bit)',
    description: 'Whether a channel defines exactly one fine channel alias',
    order: 81,
    hasFeature: fixture => fixture.availableChannels.some(channel => channel.fineChannelAliases.length === 1)
  },
  {
    id: 'fine-channel-aliases',
    name: 'Fine channels (>16bit)',
    description: 'Whether a channel defines two or more fine channel aliases',
    order: 80,
    hasFeature: fixture => fixture.availableChannels.some(channel => channel.fineChannelAliases.length > 1)
  },
  {
    id: 'fine-channel-capabilities',
    name: 'Fine channel capabilities',
    description: 'Whether a channel with fine channel aliases has capabilities',
    order: 79,
    hasFeature: fixture => fixture.fineChannels.some(fineChannel => fineChannel.coarseChannel.hasCapabilities)
  }
];