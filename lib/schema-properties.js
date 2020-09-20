import manufacturersSchema from '../schemas/manufacturers.json';
import fixtureRedirectSchema from '../schemas/fixture-redirect.json';
import fixtureSchema from '../schemas/fixture.json';
import channelSchema from '../schemas/channel.json';
import capabilitySchema from '../schemas/capability.json';
import wheelSlotSchema from '../schemas/wheel-slot.json';
import definitionsSchema from '../schemas/definitions.json';

const fixtureProperties = fixtureSchema.properties;
const physicalProperties = fixtureProperties.physical.properties;

const capabilityTypes = {};
capabilitySchema.allOf.forEach(ifThenClause => {
  const type = ifThenClause[`if`].properties.type.const;
  capabilityTypes[type] = ifThenClause[`then`];
});

const wheelSlotTypes = {};
wheelSlotSchema.allOf.forEach(ifThenClause => {
  const type = ifThenClause[`if`].properties.type.const;
  wheelSlotTypes[type] = ifThenClause[`then`];
});

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
