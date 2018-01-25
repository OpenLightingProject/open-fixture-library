const fixtureSchema = require(`../schema-fixture.json`);
const manufacturersSchema = require(`../schema-manufacturers.json`);

const fixtureProperties = fixtureSchema.properties;
const channelProperties = fixtureProperties.availableChannels.additionalProperties.properties;

module.exports = {
  manufacturer: manufacturersSchema.additionalProperties.properties,
  fixture: fixtureProperties,
  physical: fixtureProperties.physical.properties,
  channel: channelProperties,
  capability: channelProperties.capabilities.items.properties,
  mode: fixtureProperties.modes.items.properties
};
