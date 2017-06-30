module.exports = [
  {
    id: 'fine-channel-alias',
    name: 'Fine channels (16bit)',
    description: 'Whether a channel defines exactly one fine channel alias',
    order: 81,
    hasFeature: fixture => fixture.fineChannels.some(fineChannel => fineChannel.fineness === 1)
  },
  {
    id: 'fine-channel-aliases',
    name: 'Fine channels (>16bit)',
    description: 'Whether a channel defines two or more fine channel aliases',
    order: 80,
    hasFeature: fixture => fixture.fineChannels.some(fineChannel => fineChannel.fineness > 1)
  }
];