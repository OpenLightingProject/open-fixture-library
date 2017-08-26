const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');
const MatrixChannel = require('../../lib/model/MatrixChannel.js');

let currentOrder = 69;

module.exports = [
  {
    id: 'matrix-pixelKeys',
    name: 'Uses pixelKeys',
    description: 'The fixture has a matrix and has set the pixelKeys individually.',
    order: currentOrder--,
    hasFeature: fixture => fixture.matrix !== null && 'pixelKeys' in fixture.matrix.jsonObject
  },
  {
    id: 'matrix-pixelCount',
    name: 'Uses pixelCount',
    description: 'The fixture has a matrix and has set the pixelCount property.',
    order: currentOrder--,
    hasFeature: fixture => fixture.matrix !== null && 'pixelCount' in fixture.matrix.jsonObject
  },
  {
    id: 'matrix-pixelGroups',
    name: 'Uses pixelGroups',
    description: 'The fixture has a matrix and has set pixelGroups.',
    order: currentOrder--,
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelGroupKeys.length > 0
  },
  {
    id: 'matrix-custom-layout',
    name: 'Custom matrix layout',
    description: 'The fixture has a matrix and it uses null pixelKeys – it is no line, rectangle or cube.',
    order: currentOrder--,
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelKeys.some(
      zLevel => zLevel.some(
        row => row.some(
          pixelKey => pixelKey === null
        )
      )
    )
  },
  {
    id: 'switching-matrix-channel',
    name: 'Switching matrix channel',
    description: 'The fixture repeats switching channels for matrix pixels.',
    order: currentOrder--,
    hasFeature: fixture => fixture.matrixChannels.some(ch => ch.wrappedChannel instanceof SwitchingChannel)
  },
  {
    id: 'matrix-channel-used-directly',
    name: 'Matrix channel used directly',
    description: 'If a mode contains a resolved matrix channel key in its raw channel list or if a non-matrix switching channel switches to a matrix channel.',
    order: currentOrder--,
    hasFeature: fixture => fixture.modes.some(
      mode => mode.channelReferences.some(
        chRef => chRef.isMatrixChannel && mode.jsonObject.channels.includes(chRef.chKey)
      )
    ) || fixture.switchingChannels.some(
      swCh => swCh.switchToChannels.some(
        ch => ch instanceof MatrixChannel
      )
    )
  }
];