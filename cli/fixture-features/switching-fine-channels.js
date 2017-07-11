const path = require('path');

const FineChannel = require(path.join(__dirname, '..', '..', 'lib', 'model', 'FineChannel.js'));

module.exports = [{
  name: 'Switches fine channels',
  description: 'Whether at least one switching channel switches fine channels',
  order: 75,
  hasFeature: fixture => fixture.switchingChannels.some(
    switchingChannel => switchingChannel.switchToChannels.some(
      chKey => fixture.getChannelByKey(chKey) instanceof FineChannel
    )
  )
}];