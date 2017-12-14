const FineChannel = require('../model/FineChannel.js');
const MatrixChannel = require('../model/MatrixChannel.js');
const SwitchingChannel = require('../model/SwitchingChannel.js');

module.exports = [
  {
    id: 'matrix-pixelKeys',
    name: 'Uses pixelKeys',
    description: 'The fixture has a matrix and has set the pixelKeys individually.',
    hasFeature: fixture => fixture.matrix !== null && 'pixelKeys' in fixture.matrix.jsonObject
  },
  {
    id: 'matrix-pixelCount',
    name: 'Uses pixelCount',
    description: 'The fixture has a matrix and has set the pixelCount property.',
    hasFeature: fixture => fixture.matrix !== null && 'pixelCount' in fixture.matrix.jsonObject
  },
  {
    id: 'matrix-pixelGroups',
    name: 'Uses pixelGroups',
    description: 'The fixture has a matrix and has set pixelGroups.',
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelGroupKeys.length > 0
  },
  {
    id: 'matrix-custom-layout',
    name: 'Custom matrix layout',
    description: 'The fixture has a matrix and it uses null pixelKeys – it is no line, rectangle or cube.',
    hasFeature: fixture => fixture.matrix !== null && fixture.matrix.pixelKeyStructure.some(
      zLevel => zLevel.some(
        row => row.some(
          pixelKey => pixelKey === null
        )
      )
    )
  },
  {
    id: 'fine-matrix-channel',
    name: 'Fine matrix channel',
    description: 'The fixture repeats fine channels for matrix pixels.',
    hasFeature: fixture => fixture.matrixChannels.some(ch => ch.wrappedChannel instanceof FineChannel)
  },
  {
    id: 'switching-matrix-channel',
    name: 'Switching matrix channel',
    description: 'The fixture repeats switching channels for matrix pixels.',
    hasFeature: fixture => fixture.matrixChannels.some(ch => ch.wrappedChannel instanceof SwitchingChannel)
  },
  {
    id: 'matrix-channel-used-directly',
    name: 'Matrix channel used directly',
    description: 'If a mode contains a resolved matrix channel key in its raw channel list or if a non-matrix switching channel switches to a matrix channel.',
    hasFeature: fixture => fixture.modes.some(
      mode => mode.jsonObject.channels.some(
        chKey => fixture.matrixChannelKeys.includes(chKey)
      )
    ) || fixture.switchingChannels.some(
        swCh => swCh.switchToChannels.some(
          ch => ch instanceof MatrixChannel
        )
      )
  }
];
