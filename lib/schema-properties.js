import {
  capabilitySchema,
  channelSchema,
  definitionsSchema,
  fixtureRedirectSchema,
  fixtureSchema,
  manufacturersSchema,
  wheelSlotSchema,
} from '../lib/esm-shim.cjs';

export const fixtureProperties = fixtureSchema.properties;
export const physicalProperties = fixtureProperties.physical.properties;

export const capabilityTypes = Object.fromEntries(capabilitySchema.oneOf.map(
  schema => [schema.properties.type.const, schema],
));

export const wheelSlotTypes = Object.fromEntries(wheelSlotSchema.oneOf.map(
  schema => [schema.properties.type.const, schema],
));

export const manufacturerProperties = manufacturersSchema.additionalProperties.properties;
export const fixtureRedirectProperties = fixtureRedirectSchema.properties;
export const linksProperties = fixtureProperties.links.properties;
export const physicalBulbProperties = physicalProperties.bulb.properties;
export const physicalLensProperties = physicalProperties.lens.properties;
export const modeProperties = fixtureProperties.modes.items.properties;
export const channelProperties = channelSchema.properties;
export const capabilityDmxRange = capabilitySchema.definitions.dmxRange;
export const schemaDefinitions = definitionsSchema;
export const unitsSchema = definitionsSchema.units;
export const entitiesSchema = definitionsSchema.entities;
