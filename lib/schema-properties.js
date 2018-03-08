const manufacturersSchema = require(`../schemas/dereferenced/manufacturers.json`);
const fixtureSchema = require(`../schemas/dereferenced/fixture.json`);
const channelSchema = require(`../schemas/dereferenced/channel.json`);
const capabilitySchema = require(`../schemas/dereferenced/capability.json`);
const definitionsSchema = require(`../schemas/dereferenced/definitions.json`);

const fixtureProperties = fixtureSchema.properties;
const channelProperties = channelSchema.properties;
const capabilityProperties = capabilitySchema.properties;
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
  capability: capabilityProperties,
  mode: fixtureProperties.modes.items.properties,
  dimensionsXYZ: definitionsSchema.dimensionsXYZ,
  definitions: definitionsSchema,
  units: definitionsSchema.units,
  entities: definitionsSchema.entities
};
