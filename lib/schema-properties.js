/* eslint-disable import/no-commonjs */
const manufacturersSchema = require(`../schemas/manufacturers.json`);
const fixtureRedirectSchema = require(`../schemas/fixture-redirect.json`);
const fixtureSchema = require(`../schemas/fixture.json`);
const channelSchema = require(`../schemas/channel.json`);
const capabilitySchema = require(`../schemas/capability.json`);
const wheelSlotSchema = require(`../schemas/wheel-slot.json`);
const definitionsSchema = require(`../schemas/definitions.json`);
/* eslint-enable import/no-commonjs */

const fixtureProperties = fixtureSchema.properties;
const physicalProperties = fixtureProperties.physical.properties;

const capabilityTypes = Object.fromEntries(capabilitySchema.allOf.map(
  ({ if: ifClause, then: thenClause }) => [ifClause.properties.type.const, thenClause],
));

const wheelSlotTypes = Object.fromEntries(wheelSlotSchema.allOf.map(
  ({ if: ifClause, then: thenClause }) => [ifClause.properties.type.const, thenClause],
));

export default {
  manufacturerKey: manufacturersSchema.propertyNames,
  manufacturer: manufacturersSchema.additionalProperties.properties,
  fixtureRedirect: fixtureRedirectSchema.properties,
  fixture: fixtureProperties,
  links: fixtureProperties.links.properties,
  physical: physicalProperties,
  physicalBulb: physicalProperties.bulb.properties,
  physicalLens: physicalProperties.lens.properties,
  mode: fixtureProperties.modes.items.properties,
  channel: channelSchema.properties,
  capability: capabilitySchema.properties,
  capabilityTypes,
  wheelSlot: wheelSlotSchema.properties,
  wheelSlotTypes,
  definitions: definitionsSchema,
  dimensionsXYZ: definitionsSchema.dimensionsXYZ,
  units: definitionsSchema.units,
  entities: definitionsSchema.entities,
};
