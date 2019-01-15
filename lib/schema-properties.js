const manufacturersSchema = require(`../schemas/manufacturers.json`);
const fixtureSchema = require(`../schemas/fixture.json`);
const channelSchema = require(`../schemas/channel.json`);
const capabilitySchema = require(`../schemas/capability.json`);
const wheelSlotSchema = require(`../schemas/wheel-slot.json`);
const definitionsSchema = require(`../schemas/definitions.json`);

const fixtureProperties = fixtureSchema.properties;
const physicalProperties = fixtureProperties.physical.properties;

const capabilityTypes = {};
capabilitySchema.allOf.forEach(ifThenClause => {
  const type = ifThenClause[`if`].properties.type.enum[0];
  capabilityTypes[type] = ifThenClause.then;
});

const wheelSlotTypes = {};
wheelSlotSchema.allOf.forEach(ifThenClause => {
  const type = ifThenClause[`if`].properties.type.const;
  wheelSlotTypes[type] = ifThenClause.then;
});

module.exports = {
  manufacturerKey: manufacturersSchema.propertyNames,
  manufacturer: manufacturersSchema.additionalProperties.properties,
  fixture: fixtureProperties,
  links: fixtureProperties.links.properties,
  physical: physicalProperties,
  physicalBulb: physicalProperties.bulb.properties,
  physicalLens: physicalProperties.lens.properties,
  physicalFocus: physicalProperties.focus.properties,
  mode: fixtureProperties.modes.items.properties,
  channel: channelSchema.properties,
  capability: capabilitySchema.properties,
  capabilityTypes,
  wheelSlot: wheelSlotSchema.properties,
  wheelSlotTypes,
  definitions: definitionsSchema,
  dimensionsXYZ: definitionsSchema.dimensionsXYZ,
  units: definitionsSchema.units,
  entities: definitionsSchema.entities
};
