const fixtureSchema = require(`../schemas/dereferenced/fixture.json`);
const manufacturersSchema = require(`../schemas/dereferenced/manufacturers.json`);
const definitionsSchema = require(`../schemas/dereferenced/definitions.json`);

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
  dimensionsXYZ: fixtureSchema.definitions.dimensionsXYZ,
  definitions: definitionsSchema,
  units: definitionsSchema.units,
  entities: definitionsSchema.entities
};
