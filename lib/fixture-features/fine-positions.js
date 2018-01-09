/* eslint-disable no-unused-vars */
const AbstractChannel = require('../model/AbstractChannel.js');
const Capability = require('../model/Capability.js');
const Channel = require('../model/Channel.js');
const FineChannel = require('../model/FineChannel.js');
const Fixture = require('../model/Fixture.js');
const Manufacturer = require('../model/Manufacturer.js');
const Matrix = require('../model/Matrix.js');
const MatrixChannel = require('../model/MatrixChannel.js');
const MatrixChannelReference = require('../model/MatrixChannelReference.js');
const Meta = require('../model/Meta.js');
const Mode = require('../model/Mode.js');
const NullChannel = require('../model/NullChannel.js');
const Physical = require('../model/Physical.js');
const Range = require('../model/Range.js');
const SwitchingChannel = require('../model/SwitchingChannel.js');
const TemplateChannel = require('../model/TemplateChannel.js');
/* eslint-enable no-unused-vars */

module.exports = [
  {
    name: 'Fine before coarse',
    description: 'Fine channel used in a mode before its coarse channel',

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(mode =>
      mode.channelKeys.some((chKey, chPos) => {
        const channel = fixture.getChannelByKey(chKey);
        return channel instanceof FineChannel && chPos < mode.getChannelIndex(channel.coarseChannel.key);
      })
    )
  },

  {
    name: 'Fine not-adjacent after coarse',
    description: 'Coarse channel with fine channels are not directly after each other',

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => fixture.modes.some(mode =>
      mode.channelKeys.some((chKey, chPos) => {
        const channel = fixture.getChannelByKey(chKey);
        return channel instanceof FineChannel && chPos > mode.getChannelIndex(channel.coarserChannel.key) + 1;
      })
    )
  }
];
