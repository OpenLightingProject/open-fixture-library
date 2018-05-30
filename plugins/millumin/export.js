const { Channel } = require(`../../lib/model.js`);

module.exports.name = `Millumin`;
module.exports.version = `0.0.1`;

module.exports.export = function exportMillumin(fixtures, options) {
  // one JSON file for each fixture
  return fixtures.map(fixture => {
    const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
    jsonData.$schema = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/schema-7.0.0/schemas/fixture.json`;

    jsonData.fixtureKey = fixture.key;
    jsonData.manufacturerKey = fixture.manufacturer.key;
    jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

    if (jsonData.availableChannels) {
      Object.keys(jsonData.availableChannels).forEach(
        chKey => downgradeChannel(jsonData.availableChannels, chKey)
      );
    }

    if (jsonData.templateChannels) {
      Object.keys(jsonData.templateChannels).forEach(
        chKey => downgradeChannel(jsonData.templateChannels, chKey)
      );
    }

    return {
      name: `${fixture.manufacturer.key}/${fixture.key}.json`,
      content: JSON.stringify(jsonData, null, 2),
      mimetype: `application/ofl-fixture`
    };
  });
};

/**
 * Replaces the specified channel in the specified channels object with a downgraded version for schema 7.1.0.
 * @param {!object} channelObject Either availableChannels or templateChannels.
 * @param {!string} channelKey A key that exists in given channelObject and specifies the channel that should be downgraded.
 */
function downgradeChannel(channelObject, channelKey) {
  const jsonChannel = channelObject[channelKey];
  const channel = new Channel(channelKey, jsonChannel, null);

  const downgradedChannel = {};

  addIfTruthy(jsonChannel, `name`, downgradedChannel);
  downgradedChannel.type = channel.type;
  addIfTruthy(channel, `color`, downgradedChannel);
  addIfTruthy(jsonChannel, `fineChannelAliases`, downgradedChannel);
  addIfTruthy(jsonChannel, `defaultValue`, downgradedChannel);
  addIfTruthy(jsonChannel, `highlightValue`, downgradedChannel);
  addIfTruthy(channel, `isInverted`, downgradedChannel, `invert`);
  addIfTruthy(channel, `constant`, downgradedChannel);
  addIfTruthy(channel, `canCrossfade`, downgradedChannel, `crossfade`);
  addIfTruthy(jsonChannel, `precedence`, downgradedChannel);

  channelObject[channelKey] = downgradedChannel;

  if (jsonChannel.capability || jsonChannel.capabilities) {
    downgradedChannel.capabilities = [];

    for (const cap of channel.capabilities) {
      const downgradedCap = {
        range: [cap.rawDmxRange.start, cap.rawDmxRange.end],
        name: cap.name
      };

      addIfTruthy(cap.jsonObject, `menuClick`, downgradedCap);
      if (cap.colors) {
        downgradedCap.color = cap.colors[0];

        if (cap.colors[1]) {
          downgradedCap.color2 = cap.colors[1];
        }
      }
      addIfTruthy(cap.jsonObject, `switchChannels`, downgradedCap);

      downgradedChannel.capabilities.push(downgradedCap);
    }
  }
}

/**
 * Copies the contents of sourceObj[sourceProperty] into destinationObj[destinationProperty]
 * if sourceObj[sourceProperty] is truthy, i.e. the property exists and is valid in sourceObj.
 * @param {!object} sourceObj The object where the property value comes from.
 * @param {!string} sourceProperty A property name that may or not be present in sourceObj.
 * @param {!object} destinationObj The object where the property value should be saved to.
 * @param {?string} [destinationProperty=null] The property where the property value should be saved to. Defaults to sourceProperty.
 */
function addIfTruthy(sourceObj, sourceProperty, destinationObj, destinationProperty = null) {
  destinationProperty = destinationProperty || sourceProperty;

  if (sourceObj[sourceProperty]) {
    destinationObj[sourceProperty] = sourceObj[destinationProperty];
  }
}
