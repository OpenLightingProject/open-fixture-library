const fixtureSchema = require(`../schemas/dereferenced/fixture.json`);
const manufacturersSchema = require(`../schemas/dereferenced/manufacturers.json`);

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
  definitions: fixtureSchema.definitions,
  dimensionsXYZ: fixtureSchema.definitions.dimensionsXYZ
};
