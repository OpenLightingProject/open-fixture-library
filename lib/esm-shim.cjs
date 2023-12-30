/**
 * @fileoverview
 * There are some JSON files that need to be imported synchronously, but we
 * don't want to use the `--experimental-json-modules` command-line flag for
 * every `node` command. Thus, we require them all here in this CommonJS module
 * and re-export them for use in ECMAScript modules.
 * @see https://nodejs.org/docs/latest-v14.x/api/esm.html#esm_experimental_json_modules
 */

module.exports.manufacturersSchema = require(`../schemas/manufacturers.json`);
module.exports.fixtureRedirectSchema = require(`../schemas/fixture-redirect.json`);
module.exports.fixtureSchema = require(`../schemas/fixture.json`);
module.exports.channelSchema = require(`../schemas/channel.json`);
module.exports.capabilitySchema = require(`../schemas/capability.json`);
module.exports.wheelSlotSchema = require(`../schemas/wheel-slot.json`);
module.exports.definitionsSchema = require(`../schemas/definitions.json`);
