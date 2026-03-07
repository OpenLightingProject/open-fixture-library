import manufacturersSchema from '../schemas/manufacturers.json' with { type: 'json' };
import fixtureRedirectSchema from '../schemas/fixture-redirect.json' with { type: 'json' };
import fixtureSchema from '../schemas/fixture.json' with { type: 'json' };
import channelSchema from '../schemas/channel.json' with { type: 'json' };
import capabilitySchema from '../schemas/capability.json' with { type: 'json' };
import wheelSlotSchema from '../schemas/wheel-slot.json' with { type: 'json' };
import definitionsSchema from '../schemas/definitions.json' with { type: 'json' };

export const fixtureProperties = fixtureSchema.properties;
export const physicalProperties = fixtureProperties.physical.properties;

export const capabilityTypes = Object.fromEntries(capabilitySchema.oneOf.map(
  (schema) => [schema.properties.type.const, schema],
));

export const wheelSlotTypes = Object.fromEntries(wheelSlotSchema.oneOf.map(
  (schema) => [schema.properties.type.const, schema],
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
