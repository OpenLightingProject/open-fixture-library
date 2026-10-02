/** @import Fixture from './model/Fixture.js' */

/**
 * Replaces null switching channel targets with distinct numbered "No Function" channels.
 * @param {object} fixtureJson - The fixture JSON object to modify.
 * @param {Readonly<Fixture>} fixture - The fixture model.
 */
export default function replaceNullSwitchChannels(fixtureJson, fixture) {
  if (!fixtureJson.availableChannels) {
    return;
  }

  const nullChannelKeysByAlias = new Map(fixture.nullSwitchingChannelAliases.map(
    (alias) => [alias, fixture.getNullChannelForSwitchingAlias(alias).key],
  ));

  for (const channel of Object.values(fixtureJson.availableChannels)) {
    replaceChannelSwitchTargets(channel, nullChannelKeysByAlias);
  }

  for (const key of nullChannelKeysByAlias.values()) {
    fixtureJson.availableChannels[key] = {
      name: 'No Function',
      capability: {
        type: 'NoFunction',
      },
    };
  }
}

/**
 * @param {object} channel - The channel whose switching targets should be replaced.
 * @param {Map<string, string>} nullChannelKeysByAlias - Null switching aliases mapped to channel keys.
 */
function replaceChannelSwitchTargets(channel, nullChannelKeysByAlias) {
  const capabilities = channel.capabilities || [channel.capability];

  for (const capability of capabilities) {
    if (!capability.switchChannels) {
      continue;
    }

    for (const alias of Object.keys(capability.switchChannels)) {
      if (capability.switchChannels[alias] === null) {
        capability.switchChannels[alias] = nullChannelKeysByAlias.get(alias);
      }
    }
  }
}
