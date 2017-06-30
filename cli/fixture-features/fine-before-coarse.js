module.exports = [{
  name: 'Fine before coarse',
  description: 'Fine channel used in a mode before its coarse channel',
  order: 35,
  hasFeature: fixture => fixture.modes.some(mode =>
    mode.channelKeys.some((key, pos) =>
      fixture.fineChannelAliases.includes(key)
      && mode.channelKeys.indexOf(fixture.getChannelByKey(key).coarseChannelKey) > pos
    )
  )
}];