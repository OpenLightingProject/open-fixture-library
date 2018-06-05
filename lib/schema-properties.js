const manufacturersSchema = require(`../schemas/manufacturers.json`);
const fixtureSchema = require(`../schemas/fixture.json`);
const channelSchema = require(`../schemas/channel.json`);
const capabilitySchema = require(`../schemas/capability.json`);
const definitionsSchema = require(`../schemas/definitions.json`);

const fixtureProperties = fixtureSchema.properties;
const physicalProperties = fixtureProperties.physical.properties;

module.exports = {
  manufacturerKey: manufacturersSchema.propertyNames,
  manufacturer: manufacturersSchema.additionalProperties.properties,
  fixture: fixtureProperties,
  physical: physicalProperties,
  physicalBulb: physicalProperties.bulb.properties,
  physicalLens: physicalProperties.lens.properties,
  physicalFocus: physicalProperties.focus.properties,
  mode: fixtureProperties.modes.items.properties,
  channel: channelSchema.properties,
  capability: capabilitySchema.properties,
  definitions: definitionsSchema,
  dimensionsXYZ: definitionsSchema.dimensionsXYZ
};
