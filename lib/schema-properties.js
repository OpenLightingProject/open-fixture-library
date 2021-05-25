import {
  manufacturersSchema,
  fixtureRedirectSchema,
  fixtureSchema,
  channelSchema,
  capabilitySchema,
  wheelSlotSchema,
  definitionsSchema,
} from '../lib/esm-shim.cjs';

export const fixtureProperties = fixtureSchema.properties;
export const physicalProperties = fixtureProperties.physical.properties;

export const capabilityTypes = Object.fromEntries(capabilitySchema.allOf.map(
  ({ if: ifClause, then: thenClause }) => [ifClause.properties.type.const, thenClause],
));

export const wheelSlotTypes = Object.fromEntries(wheelSlotSchema.allOf.map(
  ({ if: ifClause, then: thenClause }) => [ifClause.properties.type.const, thenClause],
));

export const manufacturerProperties = manufacturersSchema.additionalProperties.properties;
export const fixtureRedirectProperties = fixtureRedirectSchema.properties;
export const linksProperties = fixtureProperties.links.properties;
export const physicalBulbProperties = physicalProperties.bulb.properties;
export const physicalLensProperties = physicalProperties.lens.properties;
export const modeProperties = fixtureProperties.modes.items.properties;
export const channelProperties = channelSchema.properties;
export const capabilityProperties = capabilitySchema.properties;
export const wheelSlotProperties = wheelSlotSchema.properties;
export const schemaDefinitions = definitionsSchema;
export const unitsSchema = definitionsSchema.units;
export const entitiesSchema = definitionsSchema.entities;
