const fixtureSchema = require(`../schema-fixture-dereferenced.json`);
const manufacturersSchema = require(`../schema-manufacturers-dereferenced.json`);

const fixtureProperties = fixtureSchema.properties;
const channelProperties = fixtureProperties.availableChannels.additionalProperties.properties;
const physicalProperties = fixtureProperties.physical.properties;

module.exports = {
  manufacturerKey: manufacturersSchema.propertyNames,
  manufacturer: manufacturersSchema.additionalProperties.properties,
  fixture: fixtureProperties,
  physical: physicalProperties,
  physicalBulb: physicalProperties.bulb.properties,
  physicalLens: physicalProperties.lens.properties,
  physicalFocus: physicalProperties.focus.properties,
  channel: channelProperties,
  capability: channelProperties.capabilities.items.properties,
  mode: fixtureProperties.modes.items.properties,
  dimensionsXYZ: fixtureSchema.definitions.dimensionsXYZ
};
