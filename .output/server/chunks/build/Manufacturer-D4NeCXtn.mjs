import { a as __nuxt_component_1$2 } from './LabeledInput-818znnbz.mjs';
import { p as propOptionsGenerator, _ as _export_sfc, b as __nuxt_component_1$1$1, l as instanceOfProp, m as getColorCircleSvgFragment } from './server.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-BmOBtkDI.mjs';
import { withCtx, openBlock, createBlock, Fragment, renderList, createVNode, createTextVNode, toDisplayString, createCommentVNode, mergeProps, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { a as __nuxt_component_0$1 } from './HelpWantedMessage-b-LiPWlj.mjs';
import { _ as __nuxt_component_3 } from './ConditionalDetails-BGP2N0Fc.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { b as booleanProp, s as stringProp } from '../_/object.mjs';
import { v as v4 } from '../nitro/nitro.mjs';

/**
 * Allows any number (validated at runtime and compile time).
 *
 * @template T - can be used to restrict the type at compile time with a union type.
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const numberProp = (validator) => propOptionsGenerator(Number, validator);

var esmShim = {};
const $schema$6 = "http://json-schema.org/draft-07/schema#";
const $id$6 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json";
const version$2 = "12.5.0";
const type$5 = "object";
const properties$3 = { "$schema": { "const": "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json" } };
const required$2 = ["$schema"];
const propertyNames = { "$comment": "manufacturer key", "type": "string", "pattern": "^[a-z0-9\\-]+$|^\\$" };
const additionalProperties$3 = { "type": "object", "properties": { "name": { "$ref": "definitions.json#/nonEmptyString" }, "comment": { "$ref": "definitions.json#/nonEmptyMultilineString" }, "website": { "$ref": "definitions.json#/urlString" }, "rdmId": { "type": "integer", "minimum": 1, "maximum": 32767 } }, "required": ["name"], "additionalProperties": false };
const require$$0 = {
  $schema: $schema$6,
  $id: $id$6,
  version: version$2,
  type: type$5,
  properties: properties$3,
  required: required$2,
  propertyNames,
  additionalProperties: additionalProperties$3
};
const $schema$5 = "http://json-schema.org/draft-07/schema#";
const $id$5 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture-redirect.json";
const version$1 = "12.5.0";
const type$4 = "object";
const properties$2 = { "$schema": { "const": "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture-redirect.json" }, "name": { "description": "unique in manufacturer", "$ref": "definitions.json#/nonEmptyString" }, "redirectTo": { "type": "string", "pattern": "^[a-z0-9\\-]+/[a-z0-9\\-]+$" }, "reason": { "enum": ["FixtureRenamed", "SameAsDifferentBrand"] } };
const required$1 = ["$schema", "name", "redirectTo", "reason"];
const additionalProperties$2 = false;
const require$$1 = {
  $schema: $schema$5,
  $id: $id$5,
  version: version$1,
  type: type$4,
  properties: properties$2,
  required: required$1,
  additionalProperties: additionalProperties$2
};
const $schema$4 = "http://json-schema.org/draft-07/schema#";
const $id$4 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json";
const version = "12.5.0";
const type$3 = "object";
const properties$1 = { "$schema": { "const": "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json" }, "name": { "description": "unique in manufacturer", "$ref": "definitions.json#/nonEmptyString" }, "shortName": { "description": "unique globally; if not set: use name", "$ref": "definitions.json#/nonEmptyString" }, "categories": { "type": "array", "description": "most important category first", "minItems": 1, "uniqueItems": true, "items": { "enum": ["Barrel Scanner", "Blinder", "Color Changer", "Dimmer", "Effect", "Fan", "Flower", "Hazer", "Laser", "Matrix", "Moving Head", "Pixel Bar", "Scanner", "Smoke", "Stand", "Strobe", "Other"] } }, "meta": { "type": "object", "properties": { "authors": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "$ref": "definitions.json#/nonEmptyString" } }, "createDate": { "$ref": "definitions.json#/isoDateString" }, "lastModifyDate": { "$ref": "definitions.json#/isoDateString" }, "importPlugin": { "type": "object", "properties": { "plugin": { "$ref": "definitions.json#/nonEmptyString" }, "date": { "$ref": "definitions.json#/isoDateString" }, "comment": { "$ref": "definitions.json#/nonEmptyMultilineString" } }, "required": ["plugin", "date"], "additionalProperties": false } }, "required": ["authors", "createDate", "lastModifyDate"], "additionalProperties": false }, "comment": { "$ref": "definitions.json#/nonEmptyMultilineString" }, "links": { "type": "object", "properties": { "manual": { "$ref": "definitions.json#/urlArray" }, "productPage": { "$ref": "definitions.json#/urlArray" }, "video": { "$ref": "definitions.json#/urlArray" }, "other": { "$ref": "definitions.json#/urlArray" } }, "anyOf": [{ "required": ["manual"] }, { "required": ["productPage"] }, { "required": ["video"] }, { "required": ["other"] }], "additionalProperties": false }, "helpWanted": { "$ref": "definitions.json#/nonEmptyString" }, "rdm": { "type": "object", "properties": { "modelId": { "type": "integer", "minimum": 0, "maximum": 65535 }, "softwareVersion": { "$ref": "definitions.json#/nonEmptyString" } }, "required": ["modelId"], "additionalProperties": false }, "physical": { "type": "object", "minProperties": 1, "properties": { "dimensions": { "$ref": "definitions.json#/dimensionsXYZ" }, "weight": { "description": "in kg", "type": "number", "exclusiveMinimum": 0 }, "power": { "description": "in W", "type": "number", "exclusiveMinimum": 0 }, "powerConnectors": { "type": "object", "minProperties": 1, "additionalProperties": false, "properties": { "IEC C13": { "$ref": "definitions.json#/powerConnectorType" }, "IEC C19": { "type": "string", "const": "input only" }, "powerCON": { "$ref": "definitions.json#/powerConnectorType" }, "powerCON TRUE1": { "$ref": "definitions.json#/powerConnectorType" }, "powerCON TRUE1 TOP": { "$ref": "definitions.json#/powerConnectorType" }, "powerCON 32 A": { "type": "string", "const": "input only" }, "Hardwired": { "$ref": "definitions.json#/powerConnectorType" }, "Proprietary": { "$ref": "definitions.json#/powerConnectorType" } } }, "DMXconnector": { "$comment": "additions are welcome", "enum": ["3-pin", "3-pin (swapped +/-)", "3-pin XLR IP65", "5-pin", "5-pin XLR IP65", "3-pin and 5-pin", "3.5mm stereo jack", "RJ45"] }, "bulb": { "type": "object", "minProperties": 1, "properties": { "type": { "description": "e.g. 'LED'", "$ref": "definitions.json#/nonEmptyString" }, "colorTemperature": { "description": "in K", "type": "number", "exclusiveMinimum": 0 }, "lumens": { "type": "number", "exclusiveMinimum": 0 } }, "additionalProperties": false }, "lens": { "type": "object", "minProperties": 1, "properties": { "name": { "description": "e.g. 'PC', 'Fresnel'", "$ref": "definitions.json#/nonEmptyString" }, "degreesMinMax": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "type": "number", "minimum": 0, "maximum": 360 } } }, "additionalProperties": false }, "matrixPixels": { "type": "object", "minProperties": 1, "properties": { "dimensions": { "$ref": "definitions.json#/dimensionsXYZ" }, "spacing": { "$ref": "definitions.json#/dimensionsXYZ" } }, "additionalProperties": false } }, "additionalProperties": false }, "matrix": { "$ref": "matrix.json#" }, "wheels": { "type": "object", "minProperties": 1, "propertyNames": { "$comment": "wheel names", "$ref": "definitions.json#/nonEmptyString" }, "additionalProperties": { "type": "object", "properties": { "direction": { "enum": ["CW", "CCW"] }, "slots": { "type": "array", "minItems": 2, "items": { "$ref": "wheel-slot.json#" } } }, "required": ["slots"], "additionalProperties": false } }, "availableChannels": { "type": "object", "minProperties": 1, "propertyNames": { "$comment": "channel keys", "$ref": "definitions.json#/noVariablesString" }, "additionalProperties": { "$ref": "channel.json#" } }, "templateChannels": { "type": "object", "minProperties": 1, "propertyNames": { "$comment": "template channel keys", "$ref": "definitions.json#/variablePixelKeyString" }, "additionalProperties": { "$ref": "channel.json#" } }, "modes": { "type": "array", "minItems": 1, "items": { "type": "object", "properties": { "name": { "$ref": "definitions.json#/modeNameString" }, "shortName": { "$ref": "definitions.json#/modeNameString" }, "rdmPersonalityIndex": { "type": "integer", "minimum": 1 }, "physical": { "$ref": "#/properties/physical" }, "channels": { "type": "array", "minItems": 1, "items": { "oneOf": [{ "$comment": "for unused channels", "type": "null" }, { "$comment": "normal channel keys, resolved template channel keys or channel alias keys", "$ref": "definitions.json#/noVariablesString" }, { "$comment": "matrix channel insert block", "type": "object", "properties": { "insert": { "const": "matrixChannels" }, "repeatFor": { "oneOf": [{ "enum": ["eachPixelABC", "eachPixelXYZ", "eachPixelXZY", "eachPixelYXZ", "eachPixelYZX", "eachPixelZXY", "eachPixelZYX", "eachPixelGroup"] }, { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "$comment": "pixel key or pixel group key", "$ref": "definitions.json#/noVariablesString" } }] }, "channelOrder": { "enum": ["perPixel", "perChannel"] }, "templateChannels": { "type": "array", "minItems": 1, "items": { "oneOf": [{ "$comment": "for unused channels", "type": "null" }, { "$comment": "template channel key or template channel alias key", "$ref": "definitions.json#/variablePixelKeyString" }] } } }, "required": ["insert", "repeatFor", "channelOrder", "templateChannels"], "additionalProperties": false }] } } }, "required": ["name", "channels"], "additionalProperties": false } } };
const dependencies$1 = { "matrix": ["templateChannels"], "templateChannels": ["matrix"] };
const required = ["$schema", "name", "categories", "meta", "modes"];
const allOf$1 = [{ "if": { "properties": { "modes": { "contains": { "required": ["rdmPersonalityIndex"] } } } }, "then": { "required": ["rdm"] } }, { "anyOf": [{ "required": ["availableChannels"] }, { "required": ["templateChannels"] }] }];
const additionalProperties$1 = false;
const require$$2 = {
  $schema: $schema$4,
  $id: $id$4,
  version,
  type: type$3,
  properties: properties$1,
  dependencies: dependencies$1,
  required,
  allOf: allOf$1,
  additionalProperties: additionalProperties$1
};
const $schema$3 = "http://json-schema.org/draft-07/schema#";
const $id$3 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/channel.json";
const $comment$3 = "This file is used by another schema file and should not be used directly as a JSON schema.";
const type$2 = "object";
const properties = { "name": { "description": "if not set: use channel key", "$ref": "definitions.json#/nonEmptyString" }, "fineChannelAliases": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "oneOf": [{ "$ref": "definitions.json#/noVariablesString" }, { "$ref": "definitions.json#/variablePixelKeyString", "$comment": "only in template channels" }] } }, "dmxValueResolution": { "enum": ["8bit", "16bit", "24bit"] }, "defaultValue": { "oneOf": [{ "$ref": "definitions.json#/units/dmxValue" }, { "$ref": "definitions.json#/units/dmxValuePercent" }] }, "highlightValue": { "oneOf": [{ "$ref": "definitions.json#/units/dmxValue" }, { "$ref": "definitions.json#/units/dmxValuePercent" }] }, "constant": { "type": "boolean" }, "precedence": { "enum": ["LTP", "HTP"] }, "capability": { "allOf": [{ "$ref": "capability.json#" }], "not": { "anyOf": [{ "required": ["dmxRange"] }, { "required": ["switchChannels"] }] } }, "capabilities": { "type": "array", "minItems": 2, "uniqueItems": true, "items": { "allOf": [{ "$ref": "capability.json#" }], "required": ["dmxRange"] } } };
const dependencies = { "dmxValueResolution": ["fineChannelAliases"] };
const oneOf$2 = [{ "required": ["capability"] }, { "required": ["capabilities"] }];
const allOf = [{ "if": { "$comment": "one capability sets switchChannels", "properties": { "capabilities": { "contains": { "required": ["switchChannels"] } } }, "required": ["capabilities"] }, "then": { "$comment": "defaultValue must be set and all capabilities have to set switchChannels", "required": ["defaultValue"], "properties": { "capabilities": { "items": { "required": ["switchChannels"] } } } } }, { "if": { "$comment": "channel contains only one NoFunction capability", "properties": { "capability": { "properties": { "type": { "const": "NoFunction" } } } }, "required": ["capability"] }, "then": { "$comment": "fineChannelAliases must not be set", "not": { "required": ["fineChannelAliases"] } } }];
const additionalProperties = false;
const require$$3 = {
  $schema: $schema$3,
  $id: $id$3,
  $comment: $comment$3,
  type: type$2,
  properties,
  dependencies,
  oneOf: oneOf$2,
  allOf,
  additionalProperties
};
const $schema$2 = "http://json-schema.org/draft-07/schema#";
const $id$2 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/capability.json";
const $comment$2 = "This file is used by another schema file and should not be used directly as a JSON schema.";
const definitions = { "dmxRange": { "type": "array", "minItems": 2, "maxItems": 2, "items": { "$ref": "definitions.json#/units/dmxValue" } }, "menuClick": { "enum": ["start", "center", "end", "hidden"] }, "switchChannels": { "type": "object", "minProperties": 1, "propertyNames": { "$comment": "switching channel alias keys", "oneOf": [{ "$ref": "definitions.json#/noVariablesString" }, { "$ref": "definitions.json#/variablePixelKeyString" }] }, "additionalProperties": { "oneOf": [{ "$comment": "channel key or channel alias key", "$ref": "definitions.json#/noVariablesString" }, { "$comment": "template channel key or template channel alias key", "$ref": "definitions.json#/variablePixelKeyString" }] } } };
const type$1 = "object";
const discriminator$1 = { "propertyName": "type" };
const oneOf$1 = /* @__PURE__ */ JSON.parse('[{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"NoFunction"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"ShutterStrobe"},"shutterEffect":{"enum":["Open","Closed","Strobe","Pulse","RampUp","RampDown","RampUpDown","Lightning","Spikes","Burst"]},"soundControlled":{"type":"boolean"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"duration":{"$ref":"definitions.json#/entities/time"},"durationStart":{"$ref":"definitions.json#/entities/time"},"durationEnd":{"$ref":"definitions.json#/entities/time"},"randomTiming":{"type":"boolean"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","shutterEffect"],"not":{"anyOf":[{"required":["speed","speedStart"]},{"required":["duration","durationStart"]}]},"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"durationStart":["durationEnd"],"durationEnd":["durationStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"StrobeSpeed"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"StrobeDuration"},"duration":{"$ref":"definitions.json#/entities/time"},"durationStart":{"$ref":"definitions.json#/entities/time"},"durationEnd":{"$ref":"definitions.json#/entities/time"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["duration"]},{"required":["durationStart"]}],"dependencies":{"durationStart":["durationEnd"],"durationEnd":["durationStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Intensity"},"brightness":{"$ref":"definitions.json#/entities/brightness"},"brightnessStart":{"$ref":"definitions.json#/entities/brightness"},"brightnessEnd":{"$ref":"definitions.json#/entities/brightness"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"not":{"required":["brightness","brightnessStart"]},"dependencies":{"brightnessStart":["brightnessEnd"],"brightnessEnd":["brightnessStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"ColorIntensity"},"color":{"enum":["Red","Green","Blue","Cyan","Magenta","Yellow","Amber","White","Warm White","Cold White","UV","Lime","Indigo"]},"brightness":{"$ref":"definitions.json#/entities/brightness"},"brightnessStart":{"$ref":"definitions.json#/entities/brightness"},"brightnessEnd":{"$ref":"definitions.json#/entities/brightness"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","color"],"not":{"required":["brightness","brightnessStart"]},"dependencies":{"brightnessStart":["brightnessEnd"],"brightnessEnd":["brightnessStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"ColorPreset"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"colors":{"type":"array","minItems":1,"items":{"$ref":"definitions.json#/colorString"}},"colorsStart":{"type":"array","minItems":1,"items":{"$ref":"definitions.json#/colorString"}},"colorsEnd":{"type":"array","minItems":1,"items":{"$ref":"definitions.json#/colorString"}},"colorTemperature":{"$ref":"definitions.json#/entities/colorTemperature"},"colorTemperatureStart":{"$ref":"definitions.json#/entities/colorTemperature"},"colorTemperatureEnd":{"$ref":"definitions.json#/entities/colorTemperature"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"not":{"anyOf":[{"required":["colors","colorsStart"]},{"required":["colorTemperature","colorTemperatureStart"]}]},"dependencies":{"colorsStart":["colorsEnd"],"colorsEnd":["colorsStart"],"colorTemperatureStart":["colorTemperatureEnd"],"colorTemperatureEnd":["colorTemperatureStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"ColorTemperature"},"colorTemperature":{"$ref":"definitions.json#/entities/colorTemperature"},"colorTemperatureStart":{"$ref":"definitions.json#/entities/colorTemperature"},"colorTemperatureEnd":{"$ref":"definitions.json#/entities/colorTemperature"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["colorTemperature"]},{"required":["colorTemperatureStart"]}],"dependencies":{"colorTemperatureStart":["colorTemperatureEnd"],"colorTemperatureEnd":["colorTemperatureStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Pan"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"PanContinuous"},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Tilt"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"TiltContinuous"},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"PanTiltSpeed"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"duration":{"$ref":"definitions.json#/entities/time"},"durationStart":{"$ref":"definitions.json#/entities/time"},"durationEnd":{"$ref":"definitions.json#/entities/time"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]},{"required":["duration"]},{"required":["durationStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"durationStart":["durationEnd"],"durationEnd":["durationStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"WheelSlot"},"wheel":{"$ref":"definitions.json#/nonEmptyString"},"slotNumber":{"$ref":"definitions.json#/entities/slotNumber"},"slotNumberStart":{"$ref":"definitions.json#/entities/slotNumber"},"slotNumberEnd":{"$ref":"definitions.json#/entities/slotNumber"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["slotNumber"]},{"required":["slotNumberStart"]}],"dependencies":{"slotNumberStart":["slotNumberEnd"],"slotNumberEnd":["slotNumberStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"WheelShake"},"wheel":{},"isShaking":{"enum":["wheel","slot"]},"slotNumber":{"$ref":"definitions.json#/entities/slotNumber"},"slotNumberStart":{"$ref":"definitions.json#/entities/slotNumber"},"slotNumberEnd":{"$ref":"definitions.json#/entities/slotNumber"},"shakeSpeed":{"$ref":"definitions.json#/entities/speed"},"shakeSpeedStart":{"$ref":"definitions.json#/entities/speed"},"shakeSpeedEnd":{"$ref":"definitions.json#/entities/speed"},"shakeAngle":{"$ref":"definitions.json#/entities/swingAngle"},"shakeAngleStart":{"$ref":"definitions.json#/entities/swingAngle"},"shakeAngleEnd":{"$ref":"definitions.json#/entities/swingAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"not":{"anyOf":[{"required":["slotNumber","slotNumberStart"]},{"required":["shakeSpeed","shakeSpeedStart"]},{"required":["shakeAngle","shakeAngleStart"]}]},"dependencies":{"shakeSpeedStart":["shakeSpeedEnd"],"shakeSpeedEnd":["shakeSpeedStart"],"shakeAngleStart":["shakeAngleEnd"],"shakeAngleEnd":["shakeAngleStart"],"slotNumberStart":["slotNumberEnd"],"slotNumberEnd":["slotNumberStart"]},"if":{"$comment":"slotNumber is set","anyOf":[{"required":["slotNumber"]},{"required":["slotNumberStart"]}]},"then":{"$comment":"wheel must be a single wheel","properties":{"wheel":{"$ref":"definitions.json#/nonEmptyString"}}},"else":{"$comment":"wheel can be a single wheel or multiple wheels","properties":{"wheel":{"oneOf":[{"$ref":"definitions.json#/nonEmptyString"},{"type":"array","uniqueItems":true,"minItems":2,"items":{"$ref":"definitions.json#/nonEmptyString"}}]}}},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"WheelSlotRotation"},"wheel":{},"slotNumber":{"$ref":"definitions.json#/entities/slotNumber"},"slotNumberStart":{"$ref":"definitions.json#/entities/slotNumber"},"slotNumberEnd":{"$ref":"definitions.json#/entities/slotNumber"},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]},{"required":["angle"]},{"required":["angleStart"]}],"not":{"required":["slotNumber","slotNumberStart"]},"dependencies":{"slotNumberStart":["slotNumberEnd"],"slotNumberEnd":["slotNumberStart"],"speedStart":["speedEnd"],"speedEnd":["speedStart"],"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"if":{"$comment":"slotNumber is set","anyOf":[{"required":["slotNumber"]},{"required":["slotNumberStart"]}]},"then":{"$comment":"wheel must be a single wheel","properties":{"wheel":{"$ref":"definitions.json#/nonEmptyString"}}},"else":{"$comment":"wheel can be a single wheel or multiple wheels","properties":{"wheel":{"oneOf":[{"$ref":"definitions.json#/nonEmptyString"},{"type":"array","uniqueItems":true,"minItems":2,"items":{"$ref":"definitions.json#/nonEmptyString"}}]}}},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"WheelRotation"},"wheel":{"oneOf":[{"$ref":"definitions.json#/nonEmptyString"},{"type":"array","uniqueItems":true,"minItems":2,"items":{"$ref":"definitions.json#/nonEmptyString"}}]},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]},{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Effect"},"effectName":{"$ref":"definitions.json#/nonEmptyString"},"effectPreset":{"$ref":"definitions.json#/effectPreset"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"duration":{"$ref":"definitions.json#/entities/time"},"durationStart":{"$ref":"definitions.json#/entities/time"},"durationEnd":{"$ref":"definitions.json#/entities/time"},"parameter":{"$ref":"definitions.json#/entities/parameter"},"parameterStart":{"$ref":"definitions.json#/entities/parameter"},"parameterEnd":{"$ref":"definitions.json#/entities/parameter"},"soundControlled":{"type":"boolean"},"soundSensitivity":{"$ref":"definitions.json#/entities/percent"},"soundSensitivityStart":{"$ref":"definitions.json#/entities/percent"},"soundSensitivityEnd":{"$ref":"definitions.json#/entities/percent"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["effectName"]},{"required":["effectPreset"]}],"not":{"anyOf":[{"required":["speed","speedStart"]},{"required":["duration","durationStart"]},{"required":["parameter","parameterStart"]},{"required":["soundSensitivity","soundSensitivityStart"]}]},"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"durationStart":["durationEnd"],"durationEnd":["durationStart"],"parameterStart":["parameterEnd"],"parameterEnd":["parameterStart"],"soundSensitivityStart":["soundSensitivityEnd"],"soundSensitivityEnd":["soundSensitivityStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"EffectSpeed"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"EffectDuration"},"duration":{"$ref":"definitions.json#/entities/time"},"durationStart":{"$ref":"definitions.json#/entities/time"},"durationEnd":{"$ref":"definitions.json#/entities/time"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["duration"]},{"required":["durationStart"]}],"dependencies":{"durationStart":["durationEnd"],"durationEnd":["durationStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"EffectParameter"},"parameter":{"$ref":"definitions.json#/entities/parameter"},"parameterStart":{"$ref":"definitions.json#/entities/parameter"},"parameterEnd":{"$ref":"definitions.json#/entities/parameter"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["parameter"]},{"required":["parameterStart"]}],"dependencies":{"parameterStart":["parameterEnd"],"parameterEnd":["parameterStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"SoundSensitivity"},"soundSensitivity":{"$ref":"definitions.json#/entities/percent"},"soundSensitivityStart":{"$ref":"definitions.json#/entities/percent"},"soundSensitivityEnd":{"$ref":"definitions.json#/entities/percent"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["soundSensitivity"]},{"required":["soundSensitivityStart"]}],"dependencies":{"soundSensitivityStart":["soundSensitivityEnd"],"soundSensitivityEnd":["soundSensitivityStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"BeamAngle"},"angle":{"$ref":"definitions.json#/entities/beamAngle"},"angleStart":{"$ref":"definitions.json#/entities/beamAngle"},"angleEnd":{"$ref":"definitions.json#/entities/beamAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"BeamPosition"},"horizontalAngle":{"$ref":"definitions.json#/entities/horizontalAngle"},"horizontalAngleStart":{"$ref":"definitions.json#/entities/horizontalAngle"},"horizontalAngleEnd":{"$ref":"definitions.json#/entities/horizontalAngle"},"verticalAngle":{"$ref":"definitions.json#/entities/verticalAngle"},"verticalAngleStart":{"$ref":"definitions.json#/entities/verticalAngle"},"verticalAngleEnd":{"$ref":"definitions.json#/entities/verticalAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"anyOf":[{"oneOf":[{"required":["horizontalAngle"]},{"required":["horizontalAngleStart"]}]},{"oneOf":[{"required":["verticalAngle"]},{"required":["verticalAngleStart"]}]}],"dependencies":{"horizontalAngleStart":["horizontalAngleEnd"],"horizontalAngleEnd":["horizontalAngleStart"],"verticalAngleStart":["verticalAngleEnd"],"verticalAngleEnd":["verticalAngleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Focus"},"distance":{"$ref":"definitions.json#/entities/distance"},"distanceStart":{"$ref":"definitions.json#/entities/distance"},"distanceEnd":{"$ref":"definitions.json#/entities/distance"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["distance"]},{"required":["distanceStart"]}],"dependencies":{"distanceStart":["distanceEnd"],"distanceEnd":["distanceStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Zoom"},"angle":{"$ref":"definitions.json#/entities/beamAngle"},"angleStart":{"$ref":"definitions.json#/entities/beamAngle"},"angleEnd":{"$ref":"definitions.json#/entities/beamAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Iris"},"openPercent":{"$ref":"definitions.json#/entities/irisPercent"},"openPercentStart":{"$ref":"definitions.json#/entities/irisPercent"},"openPercentEnd":{"$ref":"definitions.json#/entities/irisPercent"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["openPercent"]},{"required":["openPercentStart"]}],"dependencies":{"openPercentStart":["openPercentEnd"],"openPercentEnd":["openPercentStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"IrisEffect"},"effectName":{"$ref":"definitions.json#/nonEmptyString"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","effectName"],"not":{"required":["speed","speedStart"]},"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Frost"},"frostIntensity":{"$ref":"definitions.json#/entities/percent"},"frostIntensityStart":{"$ref":"definitions.json#/entities/percent"},"frostIntensityEnd":{"$ref":"definitions.json#/entities/percent"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["frostIntensity"]},{"required":["frostIntensityStart"]}],"dependencies":{"frostIntensityStart":["frostIntensityEnd"],"frostIntensityEnd":["frostIntensityStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"FrostEffect"},"effectName":{"$ref":"definitions.json#/nonEmptyString"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","effectName"],"not":{"required":["speed","speedStart"]},"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Prism"},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"not":{"anyOf":[{"required":["speed","speedStart"]},{"required":["angle","angleStart"]},{"required":["speed","angle"]},{"required":["speed","angleStart"]},{"required":["speedStart","angle"]},{"required":["speedStart","angleStart"]}]},"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"PrismRotation"},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]},{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"BladeInsertion"},"blade":{"oneOf":[{"enum":["Top","Right","Bottom","Left"]},{"$ref":"definitions.json#/units/positiveInteger"}]},"insertion":{"$ref":"definitions.json#/entities/insertion"},"insertionStart":{"$ref":"definitions.json#/entities/insertion"},"insertionEnd":{"$ref":"definitions.json#/entities/insertion"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","blade"],"oneOf":[{"required":["insertion"]},{"required":["insertionStart"]}],"dependencies":{"insertionStart":["insertionEnd"],"insertionEnd":["insertionStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"BladeRotation"},"blade":{"oneOf":[{"enum":["Top","Right","Bottom","Left"]},{"$ref":"definitions.json#/units/positiveInteger"}]},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","blade"],"oneOf":[{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"BladeSystemRotation"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Fog"},"fogType":{"enum":["Fog","Haze"]},"fogOutput":{"$ref":"definitions.json#/entities/fogOutput"},"fogOutputStart":{"$ref":"definitions.json#/entities/fogOutput"},"fogOutputEnd":{"$ref":"definitions.json#/entities/fogOutput"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"not":{"required":["fogOutput","fogOutputStart"]},"dependencies":{"fogOutputStart":["fogOutputEnd"],"fogOutputEnd":["fogOutputStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"FogOutput"},"fogOutput":{"$ref":"definitions.json#/entities/fogOutput"},"fogOutputStart":{"$ref":"definitions.json#/entities/fogOutput"},"fogOutputEnd":{"$ref":"definitions.json#/entities/fogOutput"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["fogOutput"]},{"required":["fogOutputStart"]}],"dependencies":{"fogOutputStart":["fogOutputEnd"],"fogOutputEnd":["fogOutputStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"FogType"},"fogType":{"enum":["Fog","Haze"]},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type","fogType"],"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Rotation"},"speed":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedStart":{"$ref":"definitions.json#/entities/rotationSpeed"},"speedEnd":{"$ref":"definitions.json#/entities/rotationSpeed"},"angle":{"$ref":"definitions.json#/entities/rotationAngle"},"angleStart":{"$ref":"definitions.json#/entities/rotationAngle"},"angleEnd":{"$ref":"definitions.json#/entities/rotationAngle"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]},{"required":["angle"]},{"required":["angleStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"],"angleStart":["angleEnd"],"angleEnd":["angleStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Speed"},"speed":{"$ref":"definitions.json#/entities/speed"},"speedStart":{"$ref":"definitions.json#/entities/speed"},"speedEnd":{"$ref":"definitions.json#/entities/speed"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["speed"]},{"required":["speedStart"]}],"dependencies":{"speedStart":["speedEnd"],"speedEnd":["speedStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Time"},"time":{"$ref":"definitions.json#/entities/time"},"timeStart":{"$ref":"definitions.json#/entities/time"},"timeEnd":{"$ref":"definitions.json#/entities/time"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"oneOf":[{"required":["time"]},{"required":["timeStart"]}],"dependencies":{"timeStart":["timeEnd"],"timeEnd":["timeStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Maintenance"},"parameter":{"$ref":"definitions.json#/entities/parameter"},"parameterStart":{"$ref":"definitions.json#/entities/parameter"},"parameterEnd":{"$ref":"definitions.json#/entities/parameter"},"hold":{"$ref":"definitions.json#/entities/time"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"not":{"required":["parameter","parameterStart"]},"dependencies":{"parameterStart":["parameterEnd"],"parameterEnd":["parameterStart"]},"additionalProperties":false},{"properties":{"dmxRange":{"$ref":"#/definitions/dmxRange"},"type":{"const":"Generic"},"comment":{"$ref":"definitions.json#/nonEmptyString"},"helpWanted":{"$ref":"definitions.json#/nonEmptyString"},"menuClick":{"$ref":"#/definitions/menuClick"},"switchChannels":{"$ref":"#/definitions/switchChannels"}},"required":["type"],"additionalProperties":false}]');
const require$$4 = {
  $schema: $schema$2,
  $id: $id$2,
  $comment: $comment$2,
  definitions,
  type: type$1,
  discriminator: discriminator$1,
  oneOf: oneOf$1
};
const $schema$1 = "http://json-schema.org/draft-07/schema#";
const $id$1 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/wheel-slot.json";
const $comment$1 = "This file is used by another schema file and should not be used directly as a JSON schema.";
const type = "object";
const discriminator = { "propertyName": "type" };
const oneOf = [{ "properties": { "type": { "const": "Open" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "Closed" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "Color" }, "name": { "$ref": "definitions.json#/nonEmptyString" }, "colors": { "type": "array", "minItems": 1, "items": { "$ref": "definitions.json#/colorString" } }, "colorTemperature": { "$ref": "definitions.json#/entities/colorTemperature" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "Gobo" }, "resource": { "$ref": "definitions.json#/goboResourceString" }, "name": { "$ref": "definitions.json#/nonEmptyString" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "Prism" }, "name": { "$ref": "definitions.json#/nonEmptyString" }, "facets": { "type": "integer", "minimum": 2 } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "Iris" }, "openPercent": { "$ref": "definitions.json#/entities/irisPercent" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "Frost" }, "frostIntensity": { "$ref": "definitions.json#/entities/percent" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "AnimationGoboStart" }, "name": { "$ref": "definitions.json#/nonEmptyString" } }, "required": ["type"], "additionalProperties": false }, { "properties": { "type": { "const": "AnimationGoboEnd" } }, "required": ["type"], "additionalProperties": false }];
const require$$5 = {
  $schema: $schema$1,
  $id: $id$1,
  $comment: $comment$1,
  type,
  discriminator,
  oneOf
};
const $schema = "http://json-schema.org/draft-07/schema#";
const $id = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/definitions.json";
const $comment = "This file is used by another schema file and should not be used directly as a JSON schema.";
const nonEmptyString = { "type": "string", "pattern": "^[^\n]+$" };
const noVariablesString = { "type": "string", "pattern": "^[^$\n]+$" };
const variablePixelKeyString = { "type": "string", "pattern": "\\$pixelKey" };
const nonEmptyMultilineString = { "type": "string", "minLength": 1 };
const modeNameString = { "allOf": [{ "$ref": "#/nonEmptyString" }, { "pattern": "^((?!mode)(?!Mode).)*$" }] };
const urlString = { "type": "string", "pattern": '^(ftp|http|https)://[^ "]+$', "format": "uri" };
const urlArray = { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "$ref": "#/urlString" } };
const isoDateString = { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$", "format": "date" };
const colorString = { "type": "string", "pattern": "^#[0-9a-f]{6}$", "format": "color-hex" };
const dimensionsXYZ = { "description": "width, height, depth (in mm)", "type": "array", "minItems": 3, "maxItems": 3, "items": { "type": "number", "minimum": 0 } };
const effectPreset = { "enum": ["ColorJump", "ColorFade"] };
const goboResourceString = { "type": "string", "pattern": "^gobos/[a-z0-9-]+$|^gobos/aliases/[a-z0-9_.-]+/" };
const powerConnectorType = { "enum": ["input only", "output only", "input and output"] };
const units = { "number": { "type": "number" }, "nonNegativeNumber": { "type": "number", "minimum": 0 }, "positiveInteger": { "type": "integer", "minimum": 0, "exclusiveMinimum": 0 }, "dmxValue": { "type": "integer", "minimum": 0, "$comment": "maximum depends on how many fine channels there are (255 if none, 65535 if one, etc.)" }, "dmxValuePercent": { "type": "string", "pattern": "^(([1-9][0-9]?|0)(\\.[0-9]+)?|100)%$" }, "percent": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?%$" }, "hertz": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?Hz$" }, "beatsPerMinute": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?bpm$" }, "roundsPerMinute": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?rpm$" }, "seconds": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?s$" }, "milliSeconds": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?ms$" }, "meters": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?m$" }, "lumens": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?lm$" }, "kelvin": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?K$" }, "volumePerMinute": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?m\\^3/min$" }, "degrees": { "type": "string", "pattern": "^-?[0-9]+(\\.[0-9]+)?deg$" } };
const entities = { "speed": { "oneOf": [{ "$ref": "#/units/hertz" }, { "$ref": "#/units/beatsPerMinute" }, { "$ref": "#/units/percent" }, { "enum": ["fast", "slow", "stop", "slow reverse", "fast reverse"] }] }, "rotationSpeed": { "oneOf": [{ "$ref": "#/units/hertz" }, { "$ref": "#/units/roundsPerMinute" }, { "$ref": "#/units/percent" }, { "enum": ["fast CW", "slow CW", "stop", "slow CCW", "fast CCW"] }] }, "time": { "oneOf": [{ "$ref": "#/units/seconds" }, { "$ref": "#/units/milliSeconds" }, { "$ref": "#/units/percent" }, { "enum": ["instant", "short", "long"] }] }, "distance": { "oneOf": [{ "$ref": "#/units/meters" }, { "$ref": "#/units/percent" }, { "enum": ["near", "far"] }] }, "brightness": { "oneOf": [{ "$ref": "#/units/lumens" }, { "$ref": "#/units/percent" }, { "enum": ["off", "dark", "bright"] }] }, "colorTemperature": { "oneOf": [{ "$ref": "#/units/kelvin" }, { "$ref": "#/units/percent" }, { "enum": ["warm", "CTO", "default", "cold", "CTB"] }] }, "fogOutput": { "oneOf": [{ "$ref": "#/units/volumePerMinute" }, { "$ref": "#/units/percent" }, { "enum": ["off", "weak", "strong"] }] }, "rotationAngle": { "oneOf": [{ "$ref": "#/units/degrees" }, { "$ref": "#/units/percent" }] }, "beamAngle": { "oneOf": [{ "$ref": "#/units/degrees" }, { "$ref": "#/units/percent" }, { "enum": ["closed", "narrow", "wide"] }] }, "horizontalAngle": { "oneOf": [{ "$ref": "#/units/degrees" }, { "$ref": "#/units/percent" }, { "enum": ["left", "center", "right"] }] }, "verticalAngle": { "oneOf": [{ "$ref": "#/units/degrees" }, { "$ref": "#/units/percent" }, { "enum": ["top", "center", "bottom"] }] }, "swingAngle": { "oneOf": [{ "$ref": "#/units/degrees" }, { "$ref": "#/units/percent" }, { "enum": ["closed", "narrow", "wide"] }] }, "parameter": { "oneOf": [{ "$ref": "#/units/number" }, { "$ref": "#/units/percent" }, { "enum": ["off", "low", "high", "slow", "fast", "small", "big", "instant", "short", "long"] }] }, "slotNumber": { "$ref": "#/units/nonNegativeNumber" }, "percent": { "oneOf": [{ "$ref": "#/units/percent" }, { "enum": ["off", "low", "high"] }] }, "insertion": { "oneOf": [{ "$ref": "#/units/percent" }, { "enum": ["out", "in"] }] }, "irisPercent": { "oneOf": [{ "$ref": "#/units/percent" }, { "enum": ["closed", "open"] }] } };
const require$$6 = {
  $schema,
  $id,
  $comment,
  nonEmptyString,
  noVariablesString,
  variablePixelKeyString,
  nonEmptyMultilineString,
  modeNameString,
  urlString,
  urlArray,
  isoDateString,
  colorString,
  dimensionsXYZ,
  effectPreset,
  goboResourceString,
  powerConnectorType,
  units,
  entities
};
var hasRequiredEsmShim;
function requireEsmShim() {
  if (hasRequiredEsmShim) return esmShim;
  hasRequiredEsmShim = 1;
  esmShim.manufacturersSchema = require$$0;
  esmShim.fixtureRedirectSchema = require$$1;
  esmShim.fixtureSchema = require$$2;
  esmShim.channelSchema = require$$3;
  esmShim.capabilitySchema = require$$4;
  esmShim.wheelSlotSchema = require$$5;
  esmShim.definitionsSchema = require$$6;
  return esmShim;
}
var esmShimExports = requireEsmShim();
const fixtureProperties = esmShimExports.fixtureSchema.properties;
const physicalProperties = fixtureProperties.physical.properties;
const capabilityTypes = Object.fromEntries(esmShimExports.capabilitySchema.oneOf.map(
  (schema) => [schema.properties.type.const, schema]
));
const wheelSlotTypes = Object.fromEntries(esmShimExports.wheelSlotSchema.oneOf.map(
  (schema) => [schema.properties.type.const, schema]
));
const manufacturerProperties = esmShimExports.manufacturersSchema.additionalProperties.properties;
esmShimExports.fixtureRedirectSchema.properties;
const linksProperties = fixtureProperties.links.properties;
const physicalBulbProperties = physicalProperties.bulb.properties;
const physicalLensProperties = physicalProperties.lens.properties;
const modeProperties = fixtureProperties.modes.items.properties;
const channelProperties = esmShimExports.channelSchema.properties;
const capabilityDmxRange = esmShimExports.capabilitySchema.definitions.dmxRange;
const schemaDefinitions = esmShimExports.definitionsSchema;
const unitsSchema = esmShimExports.definitionsSchema.units;
const entitiesSchema = esmShimExports.definitionsSchema.entities;
const _sfc_main$a = {
  props: {
    category: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    click: () => true,
    focus: () => true,
    blur: (event) => true
  },
  computed: {
    classes() {
      return {
        "category-badge": true,
        "selected": this.selected
      };
    }
  }
};
function _sfc_ssrRender$a(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_NuxtLink = __nuxt_component_0$2;
  if ($props.selectable) {
    _push(`<a${ssrRenderAttrs(mergeProps({
      class: $options.classes,
      href: `#${encodeURIComponent($props.category)}`
    }, _attrs))} data-v-7e7015e6>`);
    _push(ssrRenderComponent(_component_OflSvg, {
      type: "fixture",
      name: $props.category
    }, null, _parent));
    _push(` ${ssrInterpolate($props.category)}</a>`);
  } else {
    _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
      class: $options.classes,
      to: `/categories/${encodeURIComponent($props.category)}`
    }, _attrs), {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_OflSvg, {
            type: "fixture",
            name: $props.category
          }, null, _parent2, _scopeId));
          _push2(` ${ssrInterpolate($props.category)}`);
        } else {
          return [
            createVNode(_component_OflSvg, {
              type: "fixture",
              name: $props.category
            }, null, 8, ["name"]),
            createTextVNode(" " + toDisplayString($props.category), 1)
          ];
        }
      }),
      _: 1
    }, _parent));
  }
}
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CategoryBadge.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$a, [["ssrRender", _sfc_ssrRender$a], ["__scopeId", "data-v-7e7015e6"]]), { __name: "CategoryBadge" });
const fixtureLinkTypes = {
  linkTypeIconNames: {
    manual: "file-pdf",
    productPage: "web",
    video: "youtube",
    other: "link-variant"
  },
  linkTypeNames: {
    manual: "Manual",
    productPage: "Product page",
    video: "Video",
    other: "Other"
  }
};
const _sfc_main$9 = {
  props: {
    type: {
      type: String,
      required: true
    },
    videoId: {
      type: String,
      required: true
    },
    startAt: {
      type: Number,
      default: 0
    },
    serverUrl: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      playing: false
    };
  },
  computed: {
    posterUrl() {
      if (this.serverUrl) {
        return `${this.serverUrl}/${this.type}/${this.videoId}/poster-image`;
      }
      if (this.type === "youtube") {
        return `https://img.youtube.com/vi/${this.videoId}/hqdefault.jpg`;
      }
      return null;
    },
    embedUrl() {
      if (this.type === "youtube") {
        const params = new URLSearchParams({ autoplay: "1" });
        if (this.startAt) {
          params.set("start", String(this.startAt));
        }
        return `https://www.youtube-nocookie.com/embed/${this.videoId}?${params.toString()}`;
      }
      if (this.type === "vimeo") {
        const params = new URLSearchParams({ autoplay: "1" });
        if (this.startAt) {
          params.set("t", String(this.startAt));
        }
        return `https://player.vimeo.com/video/${this.videoId}?${params.toString()}`;
      }
      return "";
    }
  },
  methods: {
    play() {
      this.playing = true;
    }
  }
};
function _sfc_ssrRender$9(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "embetty-video" }, _attrs))} data-v-7df25cbd>`);
  if (!$data.playing) {
    _push(`<div class="poster-wrapper" data-v-7df25cbd>`);
    if ($options.posterUrl) {
      _push(`<img${ssrRenderAttr("src", $options.posterUrl)}${ssrRenderAttr("alt", `Video thumbnail for ${$props.type} video ${$props.videoId}`)} class="poster" data-v-7df25cbd>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="play-button" aria-label="Play video" data-v-7df25cbd>`);
    _push(ssrRenderComponent(_component_OflSvg, { name: "youtube" }, null, _parent));
    _push(`</div></div>`);
  } else {
    _push(`<iframe${ssrRenderAttr("src", $options.embedUrl)} allow="autoplay; encrypted-media" allowfullscreen class="video-frame" data-v-7df25cbd></iframe>`);
  }
  _push(`</div>`);
}
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmbettyVideo.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_2$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$9, [["ssrRender", _sfc_ssrRender$9], ["__scopeId", "data-v-7df25cbd"]]), { __name: "EmbettyVideo" });
class Physical {
  /**
   * Creates a new Physical instance.
   * @param {object} jsonObject A fixture's or mode's physical JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {object} The object from the JSON data that is represented by this Physical object.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {number[] | null} Width, height and depth of the fixture in millimeters. Defaults to null.
   */
  get dimensions() {
    return this._jsonObject.dimensions || null;
  }
  /**
   * @returns {number | null} Width of the fixture in millimeters. Defaults to null.
   */
  get width() {
    return this.dimensions === null ? null : this.dimensions[0];
  }
  /**
   * @returns {number | null} Height of the fixture in millimeters. Defaults to null.
   */
  get height() {
    return this.dimensions === null ? null : this.dimensions[1];
  }
  /**
   * @returns {number | null} Depth of the fixture in millimeters. Defaults to null.
   */
  get depth() {
    return this.dimensions === null ? null : this.dimensions[2];
  }
  /**
   * @returns {number | null} Weight of the fixture in kilograms. Defaults to null.
   */
  get weight() {
    return this._jsonObject.weight || null;
  }
  /**
   * @returns {number | null} Power consumption of the fixture in watts. Defaults to null.
   */
  get power() {
    return this._jsonObject.power || null;
  }
  /**
   * @returns {Record<string, string>} Power connector information.
   */
  get powerConnectors() {
    return this._jsonObject.powerConnectors || {};
  }
  /**
   * @returns {string | null} The DMX plug to be used to control the fixture, e.g. "3-pin" (XLR). Defaults to null.
   */
  get DMXconnector() {
    return this._jsonObject.DMXconnector || null;
  }
  /**
   * @returns {boolean} Whether physical data about the light source is available.
   */
  get hasBulb() {
    return "bulb" in this._jsonObject;
  }
  /**
   * @returns {string | null} The kind of lamp that is used in the fixture, e.g. "LED". Defaults to null.
   */
  get bulbType() {
    return this.hasBulb ? this._jsonObject.bulb.type || null : null;
  }
  /**
   * @returns {number | null} The color temperature of the bulb in kelvins. Defaults to null.
   */
  get bulbColorTemperature() {
    return this.hasBulb ? this._jsonObject.bulb.colorTemperature || null : null;
  }
  /**
   * @returns {number | null} The luminous flux of the bulb in lumens. Defaults to null.
   */
  get bulbLumens() {
    return this.hasBulb ? this._jsonObject.bulb.lumens || null : null;
  }
  /**
   * @returns {boolean} Whether physical data about the lens is available.
   */
  get hasLens() {
    return "lens" in this._jsonObject;
  }
  /**
   * @returns {string | null} The kind of lens that is used in the fixture, e.g. "Fresnel". Defaults to null.
   */
  get lensName() {
    return this.hasLens ? this._jsonObject.lens.name || null : null;
  }
  /**
   * @returns {number | null} The minimum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMin() {
    return this.hasLens && "degreesMinMax" in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[0] : null;
  }
  /**
   * @returns {number | null} The maximum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMax() {
    return this.hasLens && "degreesMinMax" in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[1] : null;
  }
  /**
   * @returns {boolean} Whether physical data about the matrix is available.
   */
  get hasMatrixPixels() {
    return "matrixPixels" in this._jsonObject;
  }
  /**
   * @returns {number[] | null} Width, height, depth of a matrix pixel in millimeters.
   */
  get matrixPixelsDimensions() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.dimensions : null;
  }
  /**
   * @returns {number[] | null} XYZ-Spacing between matrix pixels in millimeters.
   */
  get matrixPixelsSpacing() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.spacing : null;
  }
}
const _sfc_main$8 = {
  components: {
    LabeledValue: __nuxt_component_1$2
  },
  props: {
    physical: instanceOfProp(Physical).required
  },
  computed: {
    powerConnectors() {
      return Object.entries(this.physical.powerConnectors).map(([name, value]) => ({
        name,
        value
      }));
    }
  }
};
function _sfc_ssrRender$8(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledValue = __nuxt_component_1$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "physical" }, _attrs))} data-v-1b8b1fde><section data-v-1b8b1fde>`);
  if ($props.physical.dimensions !== null) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      name: "dimensions",
      label: "Dimensions"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate($props.physical.width)} × ${ssrInterpolate($props.physical.height)} × ${ssrInterpolate($props.physical.depth)}mm <span class="hint" data-v-1b8b1fde${_scopeId}>width × height × depth</span>`);
        } else {
          return [
            createTextVNode(toDisplayString($props.physical.width) + " × " + toDisplayString($props.physical.height) + " × " + toDisplayString($props.physical.depth) + "mm ", 1),
            createVNode("span", { class: "hint" }, "width × height × depth")
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($props.physical.weight !== null) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      key: "weight",
      name: "weight",
      label: "Weight"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate($props.physical.weight)}kg `);
        } else {
          return [
            createTextVNode(toDisplayString($props.physical.weight) + "kg ", 1)
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($props.physical.power !== null) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      key: "power",
      name: "power",
      label: "Power"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate($props.physical.power)}W `);
        } else {
          return [
            createTextVNode(toDisplayString($props.physical.power) + "W ", 1)
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($props.physical.DMXconnector !== null) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      key: "dmx-connector",
      name: "DMXconnector",
      label: "DMX connector"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate($props.physical.DMXconnector)}`);
        } else {
          return [
            createTextVNode(toDisplayString($props.physical.DMXconnector), 1)
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</section>`);
  if ($options.powerConnectors.length > 0) {
    _push(`<section class="power" data-v-1b8b1fde><h4 data-v-1b8b1fde>Power connectors</h4><!--[-->`);
    ssrRenderList($options.powerConnectors, (connector) => {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: connector.name,
        name: connector.name,
        label: connector.name
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(connector.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(connector.value), 1)
            ];
          }
        }),
        _: 2
      }, _parent));
    });
    _push(`<!--]--></section>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.physical.hasBulb) {
    _push(`<section class="bulb" data-v-1b8b1fde><h4 data-v-1b8b1fde>Bulb</h4>`);
    if ($props.physical.bulbType !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "bulb-type",
        name: "bulb-type",
        label: "Bulb type"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.bulbType)}`);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.bulbType), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    if ($props.physical.bulbColorTemperature !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "bulb-color-temperature",
        name: "bulb-colorTemperature",
        label: "Color temperature"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.bulbColorTemperature)}K `);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.bulbColorTemperature) + "K ", 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    if ($props.physical.bulbLumens !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "bulb-lumens",
        name: "bulb-lumens",
        label: "Lumens"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.bulbLumens)}lm `);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.bulbLumens) + "lm ", 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    _push(`</section>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.physical.hasLens) {
    _push(`<section class="lens" data-v-1b8b1fde><h4 data-v-1b8b1fde>Lens</h4>`);
    if ($props.physical.lensName !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "lens-name",
        name: "lens-name",
        label: "Name"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.lensName)}`);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.lensName), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    if ($props.physical.lensDegreesMin !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "lens-degrees",
        name: "lens-degreesMinMax",
        label: "Beam angle"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.lensDegreesMin === $props.physical.lensDegreesMax ? `${$props.physical.lensDegreesMin}°` : `${$props.physical.lensDegreesMin}…${$props.physical.lensDegreesMax}°`)}`);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.lensDegreesMin === $props.physical.lensDegreesMax ? `${$props.physical.lensDegreesMin}°` : `${$props.physical.lensDegreesMin}…${$props.physical.lensDegreesMax}°`), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    _push(`</section>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.physical.hasMatrixPixels) {
    _push(`<section class="matrixPixels" data-v-1b8b1fde><h4 data-v-1b8b1fde>Matrix Pixels</h4>`);
    if ($props.physical.matrixPixelsDimensions !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "pixel-dimensions",
        name: "dimensions",
        label: "Pixel dimensions"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.matrixPixelsDimensions[0])} × ${ssrInterpolate($props.physical.matrixPixelsDimensions[1])} × ${ssrInterpolate($props.physical.matrixPixelsDimensions[2])}mm <span class="hint" data-v-1b8b1fde${_scopeId}>width × height × depth</span>`);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.matrixPixelsDimensions[0]) + " × " + toDisplayString($props.physical.matrixPixelsDimensions[1]) + " × " + toDisplayString($props.physical.matrixPixelsDimensions[2]) + "mm ", 1),
              createVNode("span", { class: "hint" }, "width × height × depth")
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    if ($props.physical.matrixPixelsSpacing !== null) {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key: "pixel-spacing",
        name: "dimensions",
        label: "Pixel spacing"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate($props.physical.matrixPixelsSpacing[0])} × ${ssrInterpolate($props.physical.matrixPixelsSpacing[1])} × ${ssrInterpolate($props.physical.matrixPixelsSpacing[2])}mm <span class="hint" data-v-1b8b1fde${_scopeId}>left/right × top/bottom × ahead/aback</span>`);
          } else {
            return [
              createTextVNode(toDisplayString($props.physical.matrixPixelsSpacing[0]) + " × " + toDisplayString($props.physical.matrixPixelsSpacing[1]) + " × " + toDisplayString($props.physical.matrixPixelsSpacing[2]) + "mm ", 1),
              createVNode("span", { class: "hint" }, "left/right × top/bottom × ahead/aback")
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    _push(`</section>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePagePhysical.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_5$2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender$8], ["__scopeId", "data-v-1b8b1fde"]]), { __name: "FixturePagePhysical" });
function cacheResult(classInstance, propertyName, value) {
  Object.defineProperty(classInstance, propertyName, {
    value,
    writable: false,
    configurable: false,
    enumerable: false
  });
  return value;
}
class Matrix {
  /**
   * @param {object} jsonObject The fixture's JSON object containing the matrix information.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {object} The fixture's JSON object containing the matrix information.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {number[]} Amount of pixels in X, Y and Z direction. A horizontal bar with 4 LEDs would be `[4, 1, 1]`, a 5x5 pixel head would be `[5, 5, 1]`.
   * @throws {ReferenceError} If neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelCount() {
    if ("pixelCount" in this._jsonObject) {
      return cacheResult(this, "pixelCount", this._jsonObject.pixelCount);
    }
    if ("pixelKeys" in this._jsonObject) {
      const xyz = [1, 1, this.pixelKeyStructure.length];
      for (const yItems of this.pixelKeyStructure) {
        xyz[1] = Math.max(xyz[1], yItems.length);
        for (const xItems of yItems) {
          xyz[0] = Math.max(xyz[0], xItems.length);
        }
      }
      return cacheResult(this, "pixelCount", xyz);
    }
    throw new ReferenceError("Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.");
  }
  /**
   * @returns {number} Amount of pixels in X direction.
   */
  get pixelCountX() {
    return this.pixelCount[0];
  }
  /**
   * @returns {number} Amount of pixels in Y direction.
   */
  get pixelCountY() {
    return this.pixelCount[1];
  }
  /**
   * @returns {number} Amount of pixels in Z direction.
   */
  get pixelCountZ() {
    return this.pixelCount[2];
  }
  /**
   * @returns {string[]} Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its `pixelCount` is > 1).
   */
  get definedAxes() {
    const definedAxes = [];
    if (this.pixelCountX > 1) {
      definedAxes.push("X");
    }
    if (this.pixelCountY > 1) {
      definedAxes.push("Y");
    }
    if (this.pixelCountZ > 1) {
      definedAxes.push("Z");
    }
    return cacheResult(this, "definedAxes", definedAxes);
  }
  /**
   * @returns {string[][][]} Pixel keys by Z, Y and X position.
   * @throws {ReferenceError} if neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelKeyStructure() {
    if ("pixelKeys" in this._jsonObject) {
      return cacheResult(this, "pixelKeyStructure", this._jsonObject.pixelKeys);
    }
    if ("pixelCount" in this._jsonObject) {
      return cacheResult(this, "pixelKeyStructure", this._getPixelDefaultKeys());
    }
    throw new ReferenceError("Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.");
  }
  /**
   * Generate default keys for all pixels.
   * @private
   * @returns {string[][][]} Default pixel keys by Z, Y and X position.
   */
  _getPixelDefaultKeys() {
    const zItems = [];
    for (let z = 1; z <= this.pixelCountZ; z++) {
      const yItems = [];
      for (let y = 1; y <= this.pixelCountY; y++) {
        const xItems = [];
        for (let x = 1; x <= this.pixelCountX; x++) {
          xItems.push(this._getPixelDefaultKey(x, y, z));
        }
        yItems.push(xItems);
      }
      zItems.push(yItems);
    }
    return zItems;
  }
  /**
   * Generate default name based on defined axes and given position if no custom names are set via `pixelKeys`.
   *
   * | Dimension | Default pixelKey |
   * | --------- | ---------------- |
   * | 1D        | `"$number"`      |
   * | 2D        | `"($x, $y)"`     |
   * | 3D        | `"($x, $y, $z)"` |
   *
   * @private
   * @param {number} x Position of pixel in X direction.
   * @param {number} y Position of pixel in Y direction.
   * @param {number} z Position of pixel in Z direction.
   * @returns {string} The pixel's default key.
   * @throws {RangeError} If {@link Matrix#definedAxes}.length is not 1, 2 or 3.
   */
  _getPixelDefaultKey(x, y, z) {
    switch (this.definedAxes.length) {
      case 1: {
        return Math.max(x, y, z).toString();
      }
      case 2: {
        const first = this.definedAxes.includes("X") ? x : y;
        const last = this.definedAxes.includes("Y") ? y : z;
        return `(${first}, ${last})`;
      }
      case 3: {
        return `(${x}, ${y}, ${z})`;
      }
      default: {
        throw new RangeError("Only 1, 2 or 3 axes can be defined.");
      }
    }
  }
  /**
   * @returns {string[]} All pixelKeys, ordered alphanumerically (1 < 2 < 10 < alice < bob < carol)
   */
  get pixelKeys() {
    const pixelKeys = Object.keys(this.pixelKeyPositions).toSorted(
      (a, b) => a.toString().localeCompare(b, void 0, { numeric: true })
    );
    return cacheResult(this, "pixelKeys", pixelKeys);
  }
  /**
   * Sorts the pixelKeys by given X/Y/Z order. Order of the parameters equals the order in a `repeatFor`'s "eachPixelXYZ".
   * @param {'X' | 'Y' | 'Z'} firstAxis Axis with highest ordering.
   * @param {'X' | 'Y' | 'Z'} secondAxis Axis with middle ordering.
   * @param {'X' | 'Y' | 'Z'} thirdAxis Axis with lowest ordering.
   * @returns {string[]} All pixelKeys ordered by given axis order.
   */
  getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis) {
    const axisToPosIndex = { X: 0, Y: 1, Z: 2 };
    const firstPosIndex = axisToPosIndex[firstAxis];
    const secondPosIndex = axisToPosIndex[secondAxis];
    const thirdPosIndex = axisToPosIndex[thirdAxis];
    return this.pixelKeys.toSorted((keyA, keyB) => {
      const [posA, posB] = [this.pixelKeyPositions[keyA], this.pixelKeyPositions[keyB]];
      if (posA[thirdPosIndex] !== posB[thirdPosIndex]) {
        return posA[thirdPosIndex] - posB[thirdPosIndex];
      }
      if (posA[secondPosIndex] !== posB[secondPosIndex]) {
        return posA[secondPosIndex] - posB[secondPosIndex];
      }
      return posA[firstPosIndex] - posB[firstPosIndex];
    });
  }
  /**
   * @returns {Record<string, number[]>} Each pixelKey pointing to an array of its X/Y/Z position
   */
  get pixelKeyPositions() {
    const pixelKeyPositions = {};
    for (let z = 0; z < this.pixelCountZ; z++) {
      for (let y = 0; y < this.pixelCountY; y++) {
        for (let x = 0; x < this.pixelCountX; x++) {
          if (this.pixelKeyStructure[z][y][x] !== null) {
            pixelKeyPositions[this.pixelKeyStructure[z][y][x]] = [x + 1, y + 1, z + 1];
          }
        }
      }
    }
    return cacheResult(this, "pixelKeyPositions", pixelKeyPositions);
  }
  /**
   * @returns {string[]} All available pixel group keys, ordered by appearance.
   */
  get pixelGroupKeys() {
    return cacheResult(this, "pixelGroupKeys", Object.keys(this.pixelGroups));
  }
  /**
   * @returns {Record<string, string[]>} Key is the group key, value is an array of pixel keys.
   */
  get pixelGroups() {
    const pixelGroups = {};
    if ("pixelGroups" in this._jsonObject) {
      for (const [groupKey, group] of Object.entries(this._jsonObject.pixelGroups)) {
        if (Array.isArray(group)) {
          pixelGroups[groupKey] = group;
        } else if (group === "all") {
          pixelGroups[groupKey] = this.pixelKeys;
        } else {
          const constraints = convertConstraintsToFunctions(group);
          const pixelKeys = "name" in group ? this.pixelKeys : this.getPixelKeysByOrder("X", "Y", "Z");
          pixelGroups[groupKey] = pixelKeys.filter(
            (key) => this._pixelKeyFulfillsConstraints(key, constraints)
          );
        }
      }
    }
    return cacheResult(this, "pixelGroups", pixelGroups);
  }
  /**
   * @param {string} pixelKey The pixel key to check against the constraints.
   * @param {object} constraints The constraints to apply.
   * @returns {boolean} True if the pixel key fulfills all constraints, false otherwise.
   */
  _pixelKeyFulfillsConstraints(pixelKey, constraints) {
    const position = this.pixelKeyPositions[pixelKey];
    const numberConstraintsFulfilled = ["x", "y", "z"].every((axis, axisIndex) => {
      const axisPos = position[axisIndex];
      return constraints[axis].every((constraintFunction) => constraintFunction(axisPos));
    });
    const stringConstraintsFulfilled = constraints.name.every(
      (constraintFunction) => constraintFunction(pixelKey)
    );
    return numberConstraintsFulfilled && stringConstraintsFulfilled;
  }
}
function convertConstraintsToFunctions(constraints) {
  const constraintFunctions = {};
  for (const axis of ["x", "y", "z"]) {
    constraintFunctions[axis] = (constraints[axis] || []).map(
      (constraint) => convertNumberConstraintToFunction(constraint)
    );
  }
  constraintFunctions.name = (constraints.name || []).map(
    (pattern) => (name) => new RegExp(pattern).test(name)
  );
  return constraintFunctions;
}
function convertNumberConstraintToFunction(constraint) {
  if (constraint.startsWith("=")) {
    const eqPos = Number.parseInt(constraint.slice(1), 10);
    return (position) => position === eqPos;
  }
  if (constraint.startsWith(">=")) {
    const minPos = Number.parseInt(constraint.slice(2), 10);
    return (position) => position >= minPos;
  }
  if (constraint.startsWith("<=")) {
    const maxPos = Number.parseInt(constraint.slice(2), 10);
    return (position) => position <= maxPos;
  }
  constraint = constraint.replace(/^even$/, "2n");
  constraint = constraint.replace(/^odd$/, "2n+1");
  const match = constraint.match(/^(\d+)n(?:\+(\d+)|)$/);
  if (match !== null) {
    const divisor = Number.parseInt(match[1], 10);
    const remainder = Number.parseInt(match[2] || "0", 10);
    return (position) => position % divisor === remainder;
  }
  throw new Error(`Invalid pixel key constraint '${constraint}'.`);
}
const _sfc_main$7 = {
  components: {
    LabeledValue: __nuxt_component_1$2
  },
  props: {
    matrix: instanceOfProp(Matrix).required,
    physical: instanceOfProp(Physical).optional
  },
  data() {
    return {
      highlightedPixelKeys: [],
      baseHeight: 3.2
      // in em
    };
  },
  computed: {
    pixelSizing() {
      let sizing = `height: ${this.baseHeight}em; `;
      if (this.physical?.hasMatrixPixels) {
        const scale = this.baseHeight / this.physical.matrixPixelsDimensions[1];
        sizing += `width: ${this.physical.matrixPixelsDimensions[0] * scale}em; `;
        sizing += `margin-right: ${this.physical.matrixPixelsSpacing[0] * scale}em; `;
        sizing += `margin-bottom: ${this.physical.matrixPixelsSpacing[1] * scale}em; `;
      } else {
        sizing += `width: ${this.baseHeight}em; `;
      }
      return sizing;
    },
    pixelGroups() {
      return this.matrix.pixelGroupKeys.map((groupKey) => {
        const group = this.matrix.jsonObject.pixelGroups[groupKey];
        const resolvedPixelsKeys = this.matrix.pixelGroups[groupKey];
        if (group === "all") {
          return [groupKey, "All pixels"];
        }
        const constraintAxes = ["x", "y", "z"].filter((axis) => axis in group);
        const shouldShowPixelKeyArray = Array.isArray(group) || resolvedPixelsKeys.length <= 5 || constraintAxes.some(
          (axis) => group[axis].some((constraint) => /^\d+n/.test(constraint))
        ) || constraintAxes.length > 2 || "name" in group;
        if (shouldShowPixelKeyArray) {
          return [groupKey, resolvedPixelsKeys.join(", ")];
        }
        const constraintText = constraintAxes.map((axis) => {
          const axisConstraints = group[axis].map(
            (constraint) => constraint.replace(">=", "≥ ").replace("<=", "≤ ").replace("=", "")
          ).join(", ");
          return `${axis.toUpperCase()} coordinate is ${axisConstraints}`;
        }).join(" and ");
        return [groupKey, `Pixels where ${constraintText}`];
      });
    }
  }
};
function _sfc_ssrRender$7(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledValue = __nuxt_component_1$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "matrix" }, _attrs))} data-v-592250a7><section class="structure" data-v-592250a7><!--[-->`);
  ssrRenderList($props.matrix.pixelKeyStructure, (zLevel, zIndex) => {
    _push(`<div class="z-level" data-v-592250a7><!--[-->`);
    ssrRenderList(zLevel, (row, yIndex) => {
      _push(`<div class="row" data-v-592250a7><!--[-->`);
      ssrRenderList(row, (pixelKey, xIndex) => {
        _push(`<div style="${ssrRenderStyle($options.pixelSizing)}" class="${ssrRenderClass([{ highlight: $data.highlightedPixelKeys.includes(pixelKey) }, "pixel"])}" data-v-592250a7>${ssrInterpolate(pixelKey || "")}</div>`);
      });
      _push(`<!--]--></div>`);
    });
    _push(`<!--]--></div>`);
  });
  _push(`<!--]--><span class="hint" data-v-592250a7>Front view</span></section>`);
  if ($options.pixelGroups.length > 0) {
    _push(`<section class="pixel-groups" data-v-592250a7><h4 data-v-592250a7>Pixel groups</h4><span class="hint only-js" data-v-592250a7>Hover over the pixel groups to highlight the corresponding pixels.</span><div data-v-592250a7><!--[-->`);
    ssrRenderList($options.pixelGroups, ([key, value]) => {
      _push(ssrRenderComponent(_component_LabeledValue, {
        key,
        label: key,
        value,
        name: "pixel-group",
        tabindex: "0",
        onMouseover: ($event) => $data.highlightedPixelKeys = $props.matrix.pixelGroups[key],
        onFocusin: ($event) => $data.highlightedPixelKeys = $props.matrix.pixelGroups[key],
        onMouseout: ($event) => $data.highlightedPixelKeys = [],
        onFocusout: ($event) => $data.highlightedPixelKeys = []
      }, null, _parent));
    });
    _push(`<!--]--></div></section>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePageMatrix.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$7, [["ssrRender", _sfc_ssrRender$7], ["__scopeId", "data-v-592250a7"]]), { __name: "FixturePageMatrix" });
const KEYWORDS = {
  "fast reverse": -100,
  "slow reverse": -1,
  "stop": 0,
  "slow": 1,
  "fast": 100,
  "fast CCW": -100,
  "slow CCW": -1,
  "slow CW": 1,
  "fast CW": 100,
  "instant": 0,
  "short": 1,
  "long": 100,
  "near": 1,
  "far": 100,
  "off": 0,
  "dark": 1,
  "bright": 100,
  "warm": -100,
  "CTO": -100,
  "default": 0,
  "cold": 100,
  "CTB": 100,
  "weak": 1,
  "strong": 100,
  "left": -100,
  "top": -100,
  "center": 0,
  "right": 100,
  "bottom": 100,
  "closed": 0,
  "narrow": 1,
  "wide": 100,
  "low": 1,
  "high": 100,
  "out": 0,
  "in": 100,
  "open": 100,
  "small": 1,
  "big": 100
};
const unitConversions = {
  ms: {
    baseUnit: "s",
    factor: 1 / 1e3
  },
  bpm: {
    baseUnit: "Hz",
    factor: 1 / 60
  },
  rpm: {
    baseUnit: "Hz",
    factor: 1 / 60
  }
};
class Entity {
  /**
   * Creates a new Entity instance.
   * @param {number} number The numerical value.
   * @param {string} unit The unit symbol, e.g. 'Hz'. Must be the same as in the schema.
   * @param {string | null} keyword The keyword if defined using a keyword. Optional.
   */
  constructor(number, unit, keyword = null) {
    this._number = number;
    this._unit = unit;
    this._keyword = keyword;
  }
  /**
   * @returns {number} The numerical value of this entity.
   */
  get number() {
    return this._number;
  }
  /**
   * @returns {string} The unit symbol, like "Hz" or "%".
   */
  get unit() {
    return this._unit;
  }
  /**
   * @returns {string | null} The used keyword, or null if no keyword was used.
   */
  get keyword() {
    return this._keyword || null;
  }
  /**
   * @returns {Entity} An entity of the same value, but scaled to the base unit. Returns the entity itself if it is already in the base unit.
   */
  get baseUnitEntity() {
    if (Object.keys(unitConversions).includes(this.unit)) {
      const { baseUnit, factor } = unitConversions[this.unit];
      return cacheResult(this, "baseUnitEntity", new Entity(this.number * factor, baseUnit, this.keyword));
    }
    return cacheResult(this, "baseUnitEntity", this);
  }
  /**
   * Used to allow comparing like `entity1 < entity2`
   * @returns {number} The numerical value of this entity.
   */
  valueOf() {
    return this.number;
  }
  /**
   * @returns {string} The entity string that could be used in the fixture's JSON data.
   */
  toString() {
    return this.keyword || `${this.number}${this.unit}`;
  }
  /**
   * @param {Entity} anotherEntity Another Entity instance to compare with.
   * @returns {boolean} Whether this entity exactly equals the given one.
   */
  equals(anotherEntity) {
    return this.number === anotherEntity.number && this.unit === anotherEntity.unit && this.keyword === anotherEntity.keyword;
  }
  /**
   * @param {string} entityString The string for a single entity value from the JSON data. May also be a keyword.
   * @returns {Entity} A new entity from the given string.
   * @throws {Error} If the entity string is invalid.
   */
  static createFromEntityString(entityString) {
    if (entityString in KEYWORDS) {
      return new Entity(KEYWORDS[entityString], "%", entityString);
    }
    try {
      const [, numberString, unitString] = /^([\d.-]+)(.*)$/.exec(entityString);
      return new Entity(Number.parseFloat(numberString), unitString);
    } catch {
      throw new Error(`'${entityString}' is not a valid entity string.`);
    }
  }
}
class Resource {
  /**
   * Creates a new Resource instance.
   * @param {object} jsonObject An embedded resource object from the fixture's JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  // part of the resource JSON:
  /**
   * @returns {string} The resource's name.
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {string[]} An array of keywords belonging to this resource.
   */
  get keywords() {
    return (this._jsonObject.keywords || "").split(" ");
  }
  /**
   * @returns {string | null} The source this resource was taken from, or null if it's not specified.
   */
  get source() {
    return this._jsonObject.source || null;
  }
  // added by embedding into the fixture:
  /**
   * @returns {string} The resource key.
   */
  get key() {
    return this._jsonObject.key;
  }
  /**
   * @returns {string} The resource name, i.e. its directory.
   */
  get type() {
    return this._jsonObject.type;
  }
  /**
   * @returns {string | null} The resource alias, as specified in the fixture, or null if the resource was referenced directly.
   */
  get alias() {
    return this._jsonObject.alias || null;
  }
  /**
   * @returns {boolean} True if this resource has an associated image, false otherwise.
   */
  get hasImage() {
    return "image" in this._jsonObject;
  }
  /**
   * @returns {string | null} The resource image's file extension, or null if there is no image.
   */
  get imageExtension() {
    return this.hasImage ? this._jsonObject.image.extension : null;
  }
  /**
   * @returns {string | null} The resource image's MIME type, or null if there is no image.
   */
  get imageMimeType() {
    return this.hasImage ? this._jsonObject.image.mimeType : null;
  }
  /**
   * @returns {string | null} The resource image data (base64 or utf-8 encoded), or null if there is no image.
   */
  get imageData() {
    return this.hasImage ? this._jsonObject.image.data : null;
  }
  /**
   * @returns {'base64' | 'utf-8' | null} The resource image's data encoding, or null if there is no image.
   */
  get imageEncoding() {
    return this.hasImage ? this._jsonObject.image.encoding : null;
  }
  /**
   * @returns {string | null} A data URL containing the resource image, or null if there is no image.
   */
  get imageDataUrl() {
    if (!this.hasImage) {
      return cacheResult(this, "imageDataUrl", null);
    }
    let mimeType = this.imageMimeType;
    const imageData = encodeURIComponent(this.imageData).replaceAll("(", "%28").replaceAll(")", "%29");
    if (this.imageEncoding === "base64") {
      mimeType += ";base64";
    }
    return cacheResult(this, "imageDataUrl", `data:${mimeType},${imageData}`);
  }
}
const namePerType$1 = {
  Color: (slot, name) => {
    if (name !== null && slot.colorTemperature !== null) {
      return `${name} (${slot.colorTemperature.toString()})`;
    }
    if (slot.colorTemperature !== null) {
      return slot.colorTemperature.toString();
    }
    return name;
  },
  Gobo: (slot, name) => {
    if (name === null) {
      if (slot.resource !== null) {
        return `Gobo ${slot.resource.name}`;
      }
      return null;
    }
    if (name.startsWith("Gobo")) {
      return name;
    }
    return `Gobo ${name}`;
  },
  Prism: (slot, name) => {
    if (name !== null && slot.facets !== null) {
      return `${slot.facets}-facet ${name}`;
    }
    if (slot.facets !== null) {
      return `${slot.facets}-facet prism`;
    }
    return name;
  },
  Iris: (slot, name) => {
    if (slot.openPercent !== null) {
      return `Iris ${slot.openPercent.toString()}`;
    }
    return null;
  },
  Frost: (slot, name) => {
    if (slot.frostIntensity !== null) {
      return `Frost ${slot.frostIntensity.toString()}`;
    }
    return null;
  },
  Split: (slot, name) => {
    return `Split ${slot.floorSlot.name} / ${slot.ceilSlot.name}`;
  },
  AnimationGoboStart: (slot, name) => {
    return name === null ? null : `${name} Start`;
  },
  AnimationGoboEnd: (slot, name) => {
    const slotNumber = slot._wheel.slots.indexOf(slot) + 1;
    const previousSlot = slot._wheel.getSlot(slotNumber - 1);
    return previousSlot._jsonObject.name ? `${previousSlot._jsonObject.name} End` : null;
  },
  AnimationGobo: (slot, name) => {
    return slot.floorSlot.name.replace(" Start", "");
  },
  Default: (slot, name) => {
    return name;
  }
};
class WheelSlot {
  /**
   * Creates a new WheelSlot instance.
   * @param {object | null} jsonObject A wheel slot object from the fixture's JSON data. If null, this WheelSlot is a split slot.
   * @param {Wheel} wheel The wheel that this slot belongs to.
   * @param {WheelSlot | null} floorSlot For split slots, the WheelSlot instance at the start.
   * @param {WheelSlot | null} ceilSlot For split slots, the WheelSlot instance at the end.
   */
  constructor(jsonObject, wheel, floorSlot = null, ceilSlot = null) {
    this._jsonObject = jsonObject;
    this._wheel = wheel;
    this._floorSlot = floorSlot;
    this._ceilSlot = ceilSlot;
  }
  /**
   * @returns {boolean} True if this WheelSlot instance represents a split slot.
   */
  get isSplitSlot() {
    return this._jsonObject === null;
  }
  /**
   * @returns {string} The slot's type.
   */
  get type() {
    if (!this.isSplitSlot) {
      return cacheResult(this, "type", this._jsonObject.type);
    }
    if (this._floorSlot.type === "AnimationGoboStart") {
      return cacheResult(this, "type", "AnimationGobo");
    }
    return cacheResult(this, "type", "Split");
  }
  /**
   * @returns {number} The zero-based index of this slot amongst all slots with the same type in this wheel.
   */
  get nthOfType() {
    return cacheResult(this, "nthOfType", this._wheel.getSlotsOfType(this.type).indexOf(this));
  }
  /**
   * @returns {Resource | string | null} The gobo resource object if it was previously embedded, or the gobo resource reference string, or null if no resource is specified for the slot.
   */
  get resource() {
    if (this.isSplitSlot || !("resource" in this._jsonObject)) {
      return cacheResult(this, "resource", null);
    }
    if (typeof this._jsonObject.resource === "string") {
      return cacheResult(this, "resource", this._jsonObject.resource);
    }
    return cacheResult(this, "resource", new Resource(this._jsonObject.resource));
  }
  /**
   * @returns {string} The wheel slot's name.
   */
  get name() {
    const nameFunction = this.type in namePerType$1 ? namePerType$1[this.type] : namePerType$1.Default;
    let name = nameFunction(this, this.isSplitSlot ? null : this._jsonObject.name || null);
    if (name === null) {
      const typeName = this.type.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
      name = this._wheel.getSlotsOfType(this.type).length === 1 ? typeName : `${typeName} ${this.nthOfType + 1}`;
    }
    return cacheResult(this, "name", name);
  }
  /**
   * @returns {string[] | null} The colors of this wheel slot, or null if this slot has no colors.
   */
  get colors() {
    const fixedColors = {
      Open: ["#ffffff"],
      Closed: ["#000000"]
    };
    if (this.type in fixedColors) {
      return cacheResult(this, "colors", fixedColors[this.type]);
    }
    if (this.isSplitSlot) {
      if (this._floorSlot.colors && this._ceilSlot.colors) {
        return cacheResult(this, "colors", [...this._floorSlot.colors, ...this._ceilSlot.colors]);
      }
    } else if ("colors" in this._jsonObject) {
      return cacheResult(this, "colors", this._jsonObject.colors);
    }
    return cacheResult(this, "colors", null);
  }
  /**
   * @returns {Entity | null} For Color slots, the slot's color temperature. Null if this slot has no color temperature.
   */
  get colorTemperature() {
    if ("colorTemperature" in this._jsonObject) {
      return cacheResult(this, "colorTemperature", Entity.createFromEntityString(this._jsonObject.colorTemperature));
    }
    return cacheResult(this, "colorTemperature", null);
  }
  /**
   * @returns {number | null} For Prism slots, the number of prism facets. Null if number of facets is not defined.
   */
  get facets() {
    return this._jsonObject.facets || null;
  }
  /**
   * @returns {Entity | null} For Iris slots, the slot's openPercent value. Null if this slot has no openPercent value.
   */
  get openPercent() {
    if ("openPercent" in this._jsonObject) {
      return cacheResult(this, "openPercent", Entity.createFromEntityString(this._jsonObject.openPercent));
    }
    return cacheResult(this, "openPercent", null);
  }
  /**
   * @returns {Entity | null} For Frost slots, the slot's frost intensity. Null if this slot has no frost intensity.
   */
  get frostIntensity() {
    if ("frostIntensity" in this._jsonObject) {
      return cacheResult(this, "frostIntensity", Entity.createFromEntityString(this._jsonObject.frostIntensity));
    }
    return cacheResult(this, "frostIntensity", null);
  }
  /**
   * @returns {WheelSlot | null} For split slots, the floor (start) slot. Null for non-split slots.
   */
  get floorSlot() {
    return this._floorSlot || null;
  }
  /**
   * @returns {WheelSlot | null} For split slots, the ceil (end) slot. Null for non-split slots.
   */
  get ceilSlot() {
    return this._ceilSlot || null;
  }
}
class Wheel {
  /**
   * Creates a new Wheel instance.
   * @param {string} wheelName The wheel's name, like specified in the JSON.
   * @param {object} jsonObject A wheel object from the fixture's JSON data.
   */
  constructor(wheelName, jsonObject) {
    this._name = wheelName;
    this._jsonObject = jsonObject;
    this._splitSlots = {};
    this._slotsOfType = {};
  }
  /**
   * @returns {string} The wheel's name.
   */
  get name() {
    return this._name;
  }
  /**
   * @returns {'CW' | 'CCW'} The direction the wheel's slots are arranged in. Defaults to clockwise.
   */
  get direction() {
    return this._jsonObject.direction || "CW";
  }
  /**
   * @returns {string} The type of the Wheel, i.e. the most frequent slot type (except for animation gobo wheels; the wheel type is AnimationGobo there).
   */
  get type() {
    const slotTypes = this.slots.map((slot) => slot.type);
    slotTypes.sort((a, b) => {
      const occurrencesOfA = slotTypes.filter((type3) => type3 === a);
      const occurrencesOfB = slotTypes.filter((type3) => type3 === b);
      return occurrencesOfA.length - occurrencesOfB.length;
    });
    const type2 = slotTypes.pop();
    if (type2.startsWith("AnimationGobo")) {
      return "AnimationGobo";
    }
    return type2;
  }
  /**
   * @returns {WheelSlot[]} Array of wheel slots.
   */
  get slots() {
    return cacheResult(this, "slots", this._jsonObject.slots.map(
      (slotJson) => new WheelSlot(slotJson, this)
    ));
  }
  /**
   * @param {number} slotNumber The one-based slot number.
   * @returns {WheelSlot} The slot object. Can be a split slot object, if a non-integer index is specified.
   */
  getSlot(slotNumber) {
    if (slotNumber % 1 === 0) {
      return this.slots[this.getAbsoluteSlotIndex(slotNumber)];
    }
    const floorIndex = this.getAbsoluteSlotIndex(Math.floor(slotNumber));
    const ceilIndex = this.getAbsoluteSlotIndex(Math.ceil(slotNumber));
    const splitKey = `Split ${floorIndex}/${ceilIndex}`;
    if (!(splitKey in this._splitSlots)) {
      const floorSlot = this.slots[floorIndex];
      const ceilSlot = this.slots[ceilIndex];
      this._splitSlots[splitKey] = new WheelSlot(null, this, floorSlot, ceilSlot);
    }
    return this._splitSlots[splitKey];
  }
  /**
   * @param {number} slotNumber The one-based slot number, can be smaller than 1 and greater than the number of slots.
   * @returns {number} The zero-based slot index, bounded by the number of slots.
   */
  getAbsoluteSlotIndex(slotNumber) {
    return (slotNumber - 1) % this.slots.length + (slotNumber < 1 ? this.slots.length : 0);
  }
  /**
   * @param {string} type The wheel slot type to search for.
   * @returns {WheelSlot[]} All slots with the given type.
   */
  getSlotsOfType(type2) {
    if (!(type2 in this._slotsOfType)) {
      this._slotsOfType[type2] = this.slots.filter(
        (slot) => slot.type === type2
      );
    }
    return this._slotsOfType[type2];
  }
}
const _sfc_main$6 = {
  components: {
    ConditionalDetails: __nuxt_component_3
  },
  props: {
    wheel: instanceOfProp(Wheel).required
  },
  data() {
    return {
      highlightedSlot: null,
      wheelRadius: 50,
      wheelPadding: 3
    };
  },
  computed: {
    wheelDirectionFactor() {
      return this.wheel.direction === "CCW" ? -1 : 1;
    },
    slotRadius() {
      const usableRadius = this.wheelRadius - this.wheelPadding;
      const spacingFactor = 0.85;
      const anglePerSlot = 2 * Math.PI / this.wheel.slots.length * spacingFactor;
      const maximumRadius = usableRadius / 2 - 5;
      return Math.min(usableRadius / (1 + 1 / Math.sin(anglePerSlot / 2)), maximumRadius);
    },
    slotRotateRadius() {
      return -this.wheelRadius + this.slotRadius + this.wheelPadding;
    },
    slotRotateAngle() {
      return 360 / this.wheel.slots.length * this.wheelDirectionFactor;
    },
    slotCircumference() {
      return 2 * Math.PI * Math.abs(this.slotRotateRadius);
    },
    slotSvgFragments() {
      return this.wheel.slots.map((slot) => {
        if (slot.colors !== null) {
          return getColorCircleSvgFragment(slot.colors, this.slotRadius);
        }
        return null;
      });
    },
    animationGoboWidth() {
      if (this.wheel.slots.length === 2) {
        return this.slotCircumference;
      }
      return 2 * this.slotRadius + this.slotCircumference * Math.abs(this.slotRotateAngle) / 360;
    },
    slotTitles() {
      return this.wheel.slots.map((slot, index) => {
        if (slot.type === "AnimationGoboStart") {
          const splitSlot = this.wheel.getSlot(index + 1.5);
          return `Slots ${index + 1}…${index + 2}: ${splitSlot.name}`;
        }
        return `Slot ${index + 1}: ${slot.name}`;
      });
    }
  }
};
function _sfc_ssrRender$6(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ConditionalDetails = __nuxt_component_3;
  _push(`<figure${ssrRenderAttrs(mergeProps({ class: "wheel" }, _attrs))} data-v-f7e4c7cc><svg${ssrRenderAttr("width", 300)}${ssrRenderAttr("height", 300)}${ssrRenderAttr("viewBox", `${-$data.wheelRadius} ${-$data.wheelRadius} ${2 * $data.wheelRadius} ${2 * $data.wheelRadius}`)} data-v-f7e4c7cc><defs data-v-f7e4c7cc><radialGradient id="frostGradient" data-v-f7e4c7cc><stop offset="0" stop-color="#fff" data-v-f7e4c7cc></stop><stop offset="0.6" stop-color="#fff" data-v-f7e4c7cc></stop><stop offset="1" stop-color="#000" data-v-f7e4c7cc></stop></radialGradient></defs><circle cx="0" cy="0"${ssrRenderAttr("r", $data.wheelRadius)} fill="#444" class="wheel" data-v-f7e4c7cc></circle><circle cx="0" cy="0" r="3" fill="#fff" class="hole" data-v-f7e4c7cc></circle><g${ssrRenderAttr("transform", `scale(${$props.wheel.direction === `CCW` ? -1 : 1}, 1)`)} class="arrow" data-v-f7e4c7cc><g transform="rotate(-30)" data-v-f7e4c7cc><path d="M 0,-6 C 3,-6 6,-3 6,0" fill="none" stroke="#aaa" stroke-width="1" data-v-f7e4c7cc></path><path d="M 0,-8 -4,-6 0,-4 Z" fill="#aaa" data-v-f7e4c7cc></path></g></g><!--[-->`);
  ssrRenderList($props.wheel.slots, (slot, index) => {
    _push(`<g${ssrRenderAttr("transform", `rotate(${$options.slotRotateAngle * index}, 0, 0)`)} class="${ssrRenderClass([{ dim: $data.highlightedSlot !== null && $data.highlightedSlot !== index }, "slot"])}" data-v-f7e4c7cc><title data-v-f7e4c7cc>${ssrInterpolate($options.slotTitles[index])}</title>`);
    if (slot.colors !== null) {
      _push(`<g${ssrRenderAttr("transform", `translate(0, ${$options.slotRotateRadius})`)} data-v-f7e4c7cc>${$options.slotSvgFragments[index] ?? ""}</g>`);
    } else if (slot.type === `Iris`) {
      _push(`<!--[--><circle${ssrRenderAttr("cx", 0)}${ssrRenderAttr("cy", $options.slotRotateRadius)}${ssrRenderAttr("r", $options.slotRadius)} fill="#000" data-v-f7e4c7cc></circle><circle${ssrRenderAttr("cx", 0)}${ssrRenderAttr("cy", $options.slotRotateRadius)}${ssrRenderAttr("r", $options.slotRadius * (slot.openPercent ? slot.openPercent.number : 100) / 100)} fill="#fff" data-v-f7e4c7cc></circle><!--]-->`);
    } else if (slot.type === `Frost`) {
      _push(`<circle${ssrRenderAttr("cx", 0)}${ssrRenderAttr("cy", $options.slotRotateRadius)}${ssrRenderAttr("r", $options.slotRadius)} fill="url(#frostGradient)" data-v-f7e4c7cc></circle>`);
    } else if (slot.type === `AnimationGoboStart`) {
      _push(`<!--[--><circle${ssrRenderAttr("cx", 0)}${ssrRenderAttr("cy", 0)}${ssrRenderAttr("r", Math.abs($options.slotRotateRadius))}${ssrRenderAttr("stroke-width", 2 * $options.slotRadius)}${ssrRenderAttr("stroke-dasharray", $options.slotCircumference)}${ssrRenderAttr("stroke-dashoffset", $options.wheelDirectionFactor * ($options.slotCircumference - $options.animationGoboWidth))}${ssrRenderAttr("transform", `rotate(${ -90 - $options.wheelDirectionFactor * $options.slotRadius / $options.slotCircumference * 360}, 0, 0)`)} stroke="#fff" fill="none" data-v-f7e4c7cc></circle><text${ssrRenderAttr("x", 0)}${ssrRenderAttr("y", $options.slotRotateRadius + $options.slotRadius * 0.35)}${ssrRenderAttr("transform", `rotate(${-$options.slotRotateAngle * index}, 0, ${$options.slotRotateRadius})`)}${ssrRenderAttr("font-size", $options.slotRadius)} text-anchor="middle" fill="#000" data-v-f7e4c7cc> S </text><g${ssrRenderAttr("transform", `rotate(${$options.slotRotateAngle}, 0, 0)`)} data-v-f7e4c7cc><text${ssrRenderAttr("x", 0)}${ssrRenderAttr("y", $options.slotRotateRadius + $options.slotRadius * 0.35)}${ssrRenderAttr("transform", `rotate(${-$options.slotRotateAngle * (index + 1)}, 0, ${$options.slotRotateRadius})`)}${ssrRenderAttr("font-size", $options.slotRadius)} text-anchor="middle" fill="#000" data-v-f7e4c7cc> E </text></g><!--]-->`);
    } else if (slot.type !== `AnimationGoboEnd`) {
      _push(`<!--[--><circle${ssrRenderAttr("cx", 0)}${ssrRenderAttr("cy", $options.slotRotateRadius)}${ssrRenderAttr("r", $options.slotRadius)} fill="#fff" data-v-f7e4c7cc></circle>`);
      if (slot.resource && slot.resource.hasImage) {
        _push(`<image${ssrRenderAttr("x", -$options.slotRadius)}${ssrRenderAttr("y", $options.slotRotateRadius - $options.slotRadius)}${ssrRenderAttr("width", $options.slotRadius * 2)}${ssrRenderAttr("height", $options.slotRadius * 2)}${ssrRenderAttr("xlink:href", slot.resource.imageDataUrl)} data-v-f7e4c7cc></image>`);
      } else {
        _push(`<text${ssrRenderAttr("x", 0)}${ssrRenderAttr("y", $options.slotRotateRadius + $options.slotRadius * 0.35)}${ssrRenderAttr("transform", `rotate(${-$options.slotRotateAngle * index}, 0, ${$options.slotRotateRadius})`)}${ssrRenderAttr("font-size", $options.slotRadius)} text-anchor="middle" fill="#000" data-v-f7e4c7cc>${ssrInterpolate(slot.nthOfType + 1)}</text>`);
      }
      _push(`<!--]-->`);
    } else {
      _push(`<!---->`);
    }
    _push(`</g>`);
  });
  _push(`<!--]--></svg><figcaption data-v-f7e4c7cc>`);
  _push(ssrRenderComponent(_component_ConditionalDetails, null, {
    summary: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate($props.wheel.name)}`);
      } else {
        return [
          createTextVNode(toDisplayString($props.wheel.name), 1)
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<table data-v-f7e4c7cc${_scopeId}><tbody data-v-f7e4c7cc${_scopeId}><!--[-->`);
        ssrRenderList($props.wheel.slots, (slot, index) => {
          _push2(`<tr tabindex="0" data-v-f7e4c7cc${_scopeId}><th scope="row" data-v-f7e4c7cc${_scopeId}>Slot ${ssrInterpolate(index + 1)}</th><td data-v-f7e4c7cc${_scopeId}>${ssrInterpolate(slot.name)}</td></tr>`);
        });
        _push2(`<!--]--></tbody></table>`);
      } else {
        return [
          createVNode("table", null, [
            createVNode("tbody", null, [
              (openBlock(true), createBlock(Fragment, null, renderList($props.wheel.slots, (slot, index) => {
                return openBlock(), createBlock("tr", {
                  key: `slot-${index}`,
                  tabindex: "0",
                  onMouseover: ($event) => $data.highlightedSlot = slot.type === `AnimationGoboEnd` ? index - 1 : index,
                  onFocusin: ($event) => $data.highlightedSlot = slot.type === `AnimationGoboEnd` ? index - 1 : index,
                  onMouseout: ($event) => $data.highlightedSlot = null,
                  onFocusout: ($event) => $data.highlightedSlot = null
                }, [
                  createVNode("th", { scope: "row" }, "Slot " + toDisplayString(index + 1), 1),
                  createVNode("td", null, toDisplayString(slot.name), 1)
                ], 40, ["onMouseover", "onFocusin", "onMouseout", "onFocusout"]);
              }), 128))
            ])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</figcaption></figure>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePageWheel.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender$6], ["__scopeId", "data-v-f7e4c7cc"]]), { __name: "FixturePageWheel" });
class AbstractChannel {
  /**
   * Create a new AbstractChannel instance. Call this from child classes as `super(key)`.
   * @param {string} key The channel's identifier, must be unique in the fixture.
   * @throws {TypeError} If the AbstractChannel is instantiated directly.
   */
  constructor(key) {
    if (this.constructor === AbstractChannel) {
      throw new TypeError("Cannot instantiate AbstractChannel directly");
    }
    this._key = key;
    this._pixelKey = null;
  }
  /**
   * @abstract
   * @returns {Fixture} The fixture instance this channel is associated to.
   * @throws {TypeError} If this property is not overridden in child classes.
   */
  get fixture() {
    throw new TypeError(`Class ${this.constructor.name} must implement property fixture`);
  }
  /**
   * @returns {string} The channel key.
   */
  get key() {
    return this._key;
  }
  /**
   * Override this method for more sensible implementation.
   * @returns {string} The channel key (as name).
   */
  get name() {
    return this._key;
  }
  /**
   * @see {@link Fixture#uniqueChannelNames}
   * @returns {string} Unique version of this channel's name.
   */
  get uniqueName() {
    return this.fixture.uniqueChannelNames[this.key];
  }
  /**
   * @returns {string | null} The key of the pixel (group) that this channel is associated to. Defaults to null.
   */
  get pixelKey() {
    return this._pixelKey;
  }
  /**
   * @param {string | null} pixelKey The key of the pixel (group) that this channel is associated to. Set to null to dereference a channel from a pixel (group).
   */
  set pixelKey(pixelKey) {
    this._pixelKey = pixelKey;
  }
}
function scaleDmxValue(dmxValue, currentResolution, desiredResolution) {
  const bytes = getBytes(dmxValue, currentResolution);
  while (currentResolution < desiredResolution) {
    bytes.push(bytes[currentResolution - 1]);
    currentResolution++;
  }
  while (currentResolution > desiredResolution) {
    bytes.length--;
    currentResolution--;
  }
  return bytesToDmxValue(bytes);
}
function scaleDmxRange(dmxRangeStart, dmxRangeEnd, currentResolution, desiredResolution) {
  return scaleDmxRangeIndividually(dmxRangeStart, currentResolution, dmxRangeEnd, currentResolution, desiredResolution);
}
function scaleDmxRangeIndividually(dmxRangeStart, startResolution, dmxRangeEnd, endResolution, desiredResolution) {
  let startBytes = getBytes(dmxRangeStart, startResolution);
  const endBytes = getBytes(dmxRangeEnd, endResolution);
  while (endResolution < desiredResolution) {
    endBytes.push(255);
    endResolution++;
  }
  while (startResolution < desiredResolution) {
    startBytes.push(0);
    startResolution++;
  }
  while (endResolution > desiredResolution) {
    endBytes.length--;
    endResolution--;
  }
  while (startResolution > desiredResolution) {
    const deletedStartByte = startBytes[startResolution - 1];
    startBytes.length--;
    startResolution--;
    if (deletedStartByte > 0 && bytesToDmxValue(startBytes) < bytesToDmxValue(endBytes)) {
      startBytes = getBytes(bytesToDmxValue(startBytes) + 1, startResolution);
    }
  }
  return [bytesToDmxValue(startBytes), bytesToDmxValue(endBytes)];
}
function bytesToDmxValue(bytes) {
  let dmxValue = 0;
  for (const [index, byte] of bytes.entries()) {
    dmxValue += byte * Math.pow(256, bytes.length - index - 1);
  }
  return dmxValue;
}
function getBytes(dmxValue, resolution) {
  const bytes = [];
  while (resolution > 0) {
    const byte = dmxValue % 256;
    bytes.push(byte);
    dmxValue = (dmxValue - byte) / 256;
    resolution--;
  }
  if (dmxValue > 0) {
    throw new Error("Given DMX value was outside the given resolution");
  }
  bytes.reverse();
  return bytes;
}
class Range {
  /**
   * Creates a new Range instance.
   * @param {number[]} rangeArray Array of start and end value. Start value may not be greater than end value.
   */
  constructor(rangeArray) {
    this._rangeArray = rangeArray;
  }
  /**
   * @returns {number} The start number of the range. Lower or equal to end.
   */
  get start() {
    return this._rangeArray[0];
  }
  /**
   * @returns {number} The end number of the range. Higher or equal to start.
   */
  get end() {
    return this._rangeArray[1];
  }
  /**
   * @returns {number} The arithmetic mean of start and end value. Can be a fraction.
   */
  get center() {
    return Math.floor((this.start + this.end) / 2);
  }
  /**
   * @param {number} value The number to check whether it's in the range.
   * @returns {boolean} Whether the given number is inside this range, i.e. if it's not lower than the start value and not higher than the end value.
   */
  contains(value) {
    return this.start <= value && value <= this.end;
  }
  /**
   * @param {Range} range Another Range object.
   * @returns {boolean} Whether this range overlaps with the given one.
   */
  overlapsWith(range) {
    return range.end > this.start && range.start < this.end;
  }
  /**
   * @param {Range[]} ranges An array of Range objects.
   * @returns {boolean} Whether this range overlaps with any of the given ones.
   */
  overlapsWithOneOf(ranges) {
    return ranges.some((range) => this.overlapsWith(range));
  }
  /**
   * @param {Range} range Another Range object.
   * @returns {boolean} Whether this range is exactly next to the given one, i.e. the lower range's end value is by 1 lower than the higher range's start value.
   */
  isAdjacentTo(range) {
    return range.end + 1 === this.start || this.end + 1 === range.start;
  }
  /**
   * @param {Range} range Another range to merge with.
   * @returns {Range} A new range that covers both the initial and the other range.
   */
  getRangeMergedWith(range) {
    return new Range([Math.min(this.start, range.start), Math.max(this.end, range.end)]);
  }
  /**
   * @returns {string} Textual representation of this range.
   */
  toString() {
    return this.start === this.end ? this.start.toString() : `${this.start}…${this.end}`;
  }
  /**
   * Merge specified Range objects. Asserts that ranges don't overlap and that all ranges are valid (start<=end).
   * @param {Range[]} ranges Range objects to merge into as few ranges as possible.
   * @returns {Range[]} Merged ranges.
   */
  static getMergedRanges(ranges) {
    const mergedRanges = ranges.map((range) => new Range([range.start, range.end]));
    for (let index = 0; index < mergedRanges.length; index++) {
      const range = mergedRanges[index];
      const mergableRangeIndex = mergedRanges.findIndex((otherRange) => otherRange.isAdjacentTo(range));
      if (mergableRangeIndex !== -1) {
        mergedRanges[index] = mergedRanges[mergableRangeIndex].getRangeMergedWith(range);
        mergedRanges.splice(mergableRangeIndex, 1);
        index--;
      }
    }
    return mergedRanges;
  }
}
const START_END_ENTITIES = ["speed", "duration", "time", "brightness", "slotNumber", "angle", "horizontalAngle", "verticalAngle", "colorTemperature", "soundSensitivity", "shakeAngle", "shakeSpeed", "distance", "openPercent", "frostIntensity", "insertion", "fogOutput", "parameter"];
const namePerType = {
  NoFunction: (capability) => capability.comment || "No function",
  ShutterStrobe: (capability) => {
    let name = {
      Open: "Shutter open",
      Closed: "Shutter closed",
      Strobe: "Strobe",
      Pulse: "Pulse strobe",
      RampUp: "Ramp up strobe",
      RampDown: "Ramp down strobe",
      RampUpDown: "Ramp up and down strobe",
      Lightning: "Lightning strobe effect",
      Spikes: "Spikes strobe effect",
      Burst: "Burst strobe effect"
    }[capability.shutterEffect];
    if (capability.randomTiming) {
      name = `Random ${name.toLowerCase()}`;
    }
    if (capability.isSoundControlled) {
      name += " sound-controlled";
    }
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    if (capability.duration) {
      name += " ";
      name += startEndToString(capability.duration, "duration");
    }
    return appendInBrackets(name, capability.comment);
  },
  StrobeSpeed: (capability) => getSimpleCapabilityName(capability, "Strobe speed", "speed"),
  StrobeDuration: (capability) => getSimpleCapabilityName(capability, "Strobe duration", "duration"),
  Intensity: (capability) => getSimpleCapabilityName(capability, "Intensity", "brightness"),
  ColorIntensity: (capability) => getSimpleCapabilityName(capability, capability.color, "brightness"),
  ColorPreset: (capability) => {
    const name = capability.comment || "Color preset";
    if (capability.colorTemperature) {
      return appendInBrackets(name, colorTemperaturesToString(capability.colorTemperature));
    }
    return name;
  },
  ColorTemperature: (capability) => getSimpleCapabilityName(capability, "Color temperature", "colorTemperature"),
  Pan: (capability) => getSimpleCapabilityName(capability, "Pan", "angle", "angle", true),
  PanContinuous: (capability) => getSimpleCapabilityName(capability, "Pan", "speed", "speed", true),
  Tilt: (capability) => getSimpleCapabilityName(capability, "Tilt", "angle", "angle", true),
  TiltContinuous: (capability) => getSimpleCapabilityName(capability, "Tilt", "speed", "speed", true),
  PanTiltSpeed: (capability) => {
    const speedOrDuration = capability.speed === null ? "duration" : "speed";
    let name = "Pan/tilt movement ";
    if (capability[speedOrDuration][0].keyword === null && capability[speedOrDuration][0].unit === "%") {
      name += `${speedOrDuration} `;
    }
    name += startEndToString(capability[speedOrDuration]);
    return appendInBrackets(name, capability.comment);
  },
  WheelSlot: (capability) => appendInBrackets(getSlotCapabilityName(capability), capability.comment),
  WheelShake: (capability) => {
    let name = capability.slotNumber ? getSlotCapabilityName(capability) : capability.wheels.map((wheel) => wheel.name).join(", ");
    if (capability.isShaking === "slot") {
      name += " slot";
    }
    name += " shake";
    if (capability.shakeAngle) {
      name += " ";
      name += startEndToString(capability.shakeAngle, "angle", true);
    }
    if (capability.shakeSpeed) {
      name += " ";
      name += startEndToString(capability.shakeSpeed, "speed", true);
    }
    return appendInBrackets(name, capability.comment);
  },
  WheelSlotRotation: (capability) => {
    let wheelSlotName;
    if (capability.wheelSlot) {
      wheelSlotName = capability.wheelSlot[0].name;
    } else if (capability.wheels[0]) {
      wheelSlotName = capability.wheels[0].type.replace(/^Gobo$/, "Gobo stencil");
    } else {
      wheelSlotName = "Wheel slot";
    }
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, `${wheelSlotName} rotation`, speedOrAngle, speedOrAngle, true);
  },
  WheelRotation: (capability) => {
    const wheelName = capability.wheels[0] ? capability.wheels[0].name : "Wheel";
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, `${wheelName} rotation`, speedOrAngle, speedOrAngle, true);
  },
  Effect: (capability) => {
    let name = capability.effectName;
    if (capability.effectPreset !== null && capability.isSoundControlled) {
      name += " sound-controlled";
    }
    if (capability.parameter) {
      name += " ";
      name += startEndToString(capability.parameter);
    }
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    if (capability.duration) {
      name += " ";
      name += startEndToString(capability.duration, "duration");
    }
    let soundSensitivity = null;
    if (capability.soundSensitivity) {
      soundSensitivity = `sound sensitivity ${startEndToString(capability.soundSensitivity)}`;
    }
    return appendInBrackets(name, soundSensitivity, capability.comment);
  },
  EffectSpeed: (capability) => getSimpleCapabilityName(capability, "Effect speed", "speed"),
  EffectDuration: (capability) => getSimpleCapabilityName(capability, "Effect duration", "duration"),
  EffectParameter: (capability) => {
    const name = capability.comment || "Effect parameter";
    return `${name} ${startEndToString(capability.parameter)}`;
  },
  SoundSensitivity: (capability) => getSimpleCapabilityName(capability, "Sound sensitivity", "soundSensitivity"),
  BeamAngle: (capability) => getSimpleCapabilityName(capability, "Beam", "angle", "angle", true),
  BeamPosition: (capability) => {
    if (capability.horizontalAngle && capability.verticalAngle) {
      return appendInBrackets(`Beam position (${startEndToString(capability.horizontalAngle)}, ${startEndToString(capability.verticalAngle)})`, capability.comment);
    }
    const orientation = capability.horizontalAngle ? "Horizontal" : "Vertical";
    const angleStartEnd = capability[`${orientation.toLowerCase()}Angle`];
    const hasOrientationKeyword = angleStartEnd.some(
      (entity) => entity.keyword !== null && entity.keyword !== "center"
    );
    const prefix = hasOrientationKeyword ? "Beam position" : `${orientation} beam position`;
    return appendInBrackets(`${prefix} ${startEndToString(angleStartEnd)}`, capability.comment);
  },
  Focus: (capability) => getSimpleCapabilityName(capability, "Focus", "distance", "distance"),
  Zoom: (capability) => getSimpleCapabilityName(capability, "Zoom", "angle", "beam angle"),
  Iris: (capability) => getSimpleCapabilityName(capability, "Iris", "openPercent", "open"),
  IrisEffect: (capability) => {
    let name = `Iris ${capability.effectName}`;
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    return appendInBrackets(name, capability.comment);
  },
  Frost: (capability) => getSimpleCapabilityName(capability, "Frost", "frostIntensity"),
  FrostEffect: (capability) => {
    let name = `Frost ${capability.effectName}`;
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    return appendInBrackets(name, capability.comment);
  },
  Prism: (capability) => {
    let name = "Prism";
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    } else if (capability.angle) {
      name += " ";
      name += startEndToString(capability.angle, "angle");
    }
    return appendInBrackets(name, capability.comment);
  },
  PrismRotation: (capability) => {
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, "Prism rotation", speedOrAngle, speedOrAngle, true);
  },
  BladeInsertion: (capability) => getSimpleCapabilityName(capability, `Blade ${capability.blade} insertion`, "insertion"),
  BladeRotation: (capability) => getSimpleCapabilityName(capability, `Blade ${capability.blade} rotation`, "angle", "angle", true),
  BladeSystemRotation: (capability) => getSimpleCapabilityName(capability, "Blade system rotation", "angle", "angle", true),
  Fog: (capability) => {
    let name = capability.fogType || "Fog";
    if (capability.fogOutput) {
      name += ` ${startEndToString(capability.fogOutput)}`;
    }
    return appendInBrackets(name, capability.comment);
  },
  FogOutput: (capability) => getSimpleCapabilityName(capability, "Fog output", "fogOutput"),
  FogType: (capability) => appendInBrackets(`Fog type: ${capability.fogType}`, capability.comment),
  Rotation: (capability) => {
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, "Rotation", speedOrAngle, speedOrAngle, true);
  },
  Speed: (capability) => getSimpleCapabilityName(capability, "Speed", "speed"),
  Time: (capability) => getSimpleCapabilityName(capability, "Time", "time"),
  Maintenance: (capability) => {
    let name = capability.comment || "Maintenance";
    if (capability.parameter) {
      name += ` ${startEndToString(capability.parameter)}`;
    }
    let holdString = null;
    if (capability.hold) {
      holdString = `hold ${startEndToString([capability.hold, capability.hold])}`;
    }
    return appendInBrackets(name, holdString);
  },
  Generic: (capability) => capability.comment || "Generic"
};
function getSlotCapabilityName(capability) {
  if (capability.wheelSlot === null) {
    return "Unknown wheel slot";
  }
  return capability.slotNumber[0].number === capability.slotNumber[1].number ? capability.wheelSlot[0].name : capability.wheelSlot.map((slot) => slot.name).join(" … ");
}
class Capability {
  /**
   * @returns {string[]} Type-specific properties that may have a start and an end value.
   */
  static get START_END_ENTITIES() {
    return START_END_ENTITIES;
  }
  /**
   * Create a new Capability instance.
   * @param {object} jsonObject The capability data from the channel's JSON.
   * @param {Resolution} resolution How fine this capability is declared.
   * @param {CoarseChannel} channel The channel instance this channel is associated to.
   */
  constructor(jsonObject, resolution, channel) {
    this._jsonObject = jsonObject;
    this._resolution = resolution;
    this._channel = channel;
    this._dmxRangePerResolution = [];
  }
  /**
   * @returns {object} The capability data from the channel's JSON.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {Range} The capability's DMX bounds in the channel's highest resolution.
   */
  get dmxRange() {
    return this.getDmxRangeWithResolution(this._channel.maxResolution);
  }
  /**
   * @returns {Range} The capability's DMX bounds from the JSON data.
   */
  get rawDmxRange() {
    return this.getDmxRangeWithResolution(this._resolution);
  }
  /**
   * @param {number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {Range} The capability's DMX bounds scaled (down) to the given resolution.
   */
  getDmxRangeWithResolution(desiredResolution) {
    this._channel.ensureProperResolution(desiredResolution);
    if (!this._dmxRangePerResolution[desiredResolution]) {
      this._dmxRangePerResolution[desiredResolution] = new Range(scaleDmxRange(
        this._jsonObject.dmxRange[0],
        this._jsonObject.dmxRange[1],
        this._resolution,
        desiredResolution
      ));
    }
    return this._dmxRangePerResolution[desiredResolution];
  }
  /**
   * @returns {string} Describes which feature is controlled by this capability.
   */
  get type() {
    return this._jsonObject.type;
  }
  /**
   * @returns {string} Short one-line description of the capability, generated from the capability's type and type-specific properties.
   */
  get name() {
    if (this.type in namePerType) {
      return cacheResult(this, "name", namePerType[this.type](this));
    }
    return cacheResult(this, "name", `${this.type}: ${this.comment}`);
  }
  /**
   * @returns {boolean} Whether this capability has a comment set.
   */
  get hasComment() {
    return "comment" in this._jsonObject;
  }
  /**
   * @returns {string} Short additional information on this capability
   */
  get comment() {
    return this._jsonObject.comment || "";
  }
  /**
   * @returns {boolean} Whether this capability has the same effect from the start to the end.
   */
  get isStep() {
    const steppedStartEndProperties = this.usedStartEndEntities.every(
      (property) => this[property][0].number === this[property][1].number
    );
    const steppedColors = !this.colors || this.colors.isStep;
    return cacheResult(this, "isStep", steppedStartEndProperties && steppedColors);
  }
  /**
   * @returns {boolean} Whether this capability ranges from a high to a low value (e.g. speed fast…slow).
   */
  get isInverted() {
    if (this.isStep) {
      return cacheResult(this, "isInverted", false);
    }
    const proportionalProperties = this.usedStartEndEntities.filter(
      (property) => this[property][0].number !== this[property][1].number
    );
    const isInverted = proportionalProperties.length > 0 && proportionalProperties.every(
      (property) => Math.abs(this[property][0].number) > Math.abs(this[property][1].number)
    );
    return cacheResult(this, "isInverted", isInverted);
  }
  /**
   * @returns {string[]} Names of non-null properties with (maybe equal) start/end value.
   */
  get usedStartEndEntities() {
    return cacheResult(this, "usedStartEndEntities", Capability.START_END_ENTITIES.filter(
      (property) => this[property] !== null
    ));
  }
  /**
   * @param {Capability} nextCapability The next capability after this one.
   * @returns {boolean} Whether this capability's end value equals the given capability's start value, i. e. one can fade from this capability to the given one.
   */
  canCrossfadeTo(nextCapability) {
    if (this.type !== nextCapability.type) {
      return false;
    }
    if (this.usedStartEndEntities.length === 0 || this.usedStartEndEntities.length !== nextCapability.usedStartEndEntities.length) {
      return false;
    }
    const usesSameStartEndEntities = this.usedStartEndEntities.every(
      (property) => nextCapability.usedStartEndEntities.includes(property)
    );
    if (!usesSameStartEndEntities) {
      return false;
    }
    return this.usedStartEndEntities.every((property) => {
      const tolerance = property === "slotNumber" ? 0 : 1;
      const delta = nextCapability[property][0].number - this[property][1].number;
      return Math.abs(delta) <= tolerance;
    });
  }
  /**
   * @returns {string | null} A string describing the help that is needed for this capability, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }
  /**
   * @returns {'start' | 'center' | 'end' | 'hidden'} The method which DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClick() {
    return this._jsonObject.menuClick || "start";
  }
  /**
   * @returns {number} The DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClickDmxValue() {
    return this.getMenuClickDmxValueWithResolution(this._channel.maxResolution);
  }
  /**
   * @param {number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {number} The DMX value (scaled to the given resolution) to set when this capability is chosen in a lighting software's auto menu, or -1 if the capability should be hidden in the auto menu.
   */
  getMenuClickDmxValueWithResolution(desiredResolution) {
    const dmxRange = this.getDmxRangeWithResolution(desiredResolution);
    switch (this.menuClick) {
      case "start": {
        return dmxRange.start;
      }
      case "center": {
        return dmxRange.center;
      }
      case "end": {
        return dmxRange.end;
      }
      case "hidden": {
        return -1;
      }
      default: {
        throw new Error(`Unknown menuClick value '${this.menuClick}' in capability '${this.name}' (${this.rawDmxRange}).`);
      }
    }
  }
  /**
   * @returns {Record<string, string>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }
  /**
   * TYPE-SPECIFIC PROPERTIES (no start-end)
   */
  /**
   * @returns {string | null} Behavior for the shutter, for example 'Closed', 'Strobe' or 'Pulse'. Defaults to null.
   */
  get shutterEffect() {
    return this._jsonObject.shutterEffect || null;
  }
  /**
   * @returns {'Red' | 'Green' | 'Blue' | 'Cyan' | 'Magenta' | 'Yellow' | 'Amber' | 'White' | 'Warm White' | 'Cold White' | 'UV' | 'Lime' | 'Indigo' | null} The color of the lamp that is controlled by this ColorIntensity capability. Defaults to null.
   */
  get color() {
    return this._jsonObject.color || null;
  }
  /**
   * @returns {object | null} The color hex codes for each visually distinguishable light beam. Defaults to null.
   */
  get colors() {
    let startColors = this._jsonObject.colors;
    let endColors = this._jsonObject.colors;
    let isStep = true;
    const isColorWheelSlot = () => this.wheelSlot !== null && this.wheelSlot[0].colors !== null && this.wheelSlot[1].colors !== null;
    if (isColorWheelSlot()) {
      startColors = this.wheelSlot[0].colors;
      endColors = this.wheelSlot[1].colors;
      isStep = this.slotNumber[0].number === this.slotNumber[1].number;
    } else if ("colorsStart" in this._jsonObject) {
      startColors = this._jsonObject.colorsStart;
      endColors = this._jsonObject.colorsEnd;
      isStep = false;
    }
    if (!startColors) {
      return cacheResult(this, "colors", null);
    }
    return cacheResult(this, "colors", {
      startColors,
      endColors,
      allColors: isStep ? [...startColors] : [...startColors, ...endColors],
      isStep
    });
  }
  /**
   * @returns {Wheel[]} The wheels this capability refers to. The array has one or more elements in wheel-related capabilities, zero otherwise.
   */
  get wheels() {
    let wheelNames;
    if ("wheel" in this._jsonObject) {
      wheelNames = [this._jsonObject.wheel].flat();
    } else if (this.type.includes("Wheel")) {
      wheelNames = [this._channel.name];
    } else {
      wheelNames = [];
    }
    return cacheResult(this, "wheels", wheelNames.map(
      (wheelName) => this._channel.fixture.getWheelByName(wheelName)
    ));
  }
  /**
   * @param {string | RegExp} slotType The type of the slot to check. Can be a regular expression to be checked against the type.
   * @returns {boolean} True if the capability references a slot (or range of slots) of the given type, false otherwise.
   */
  isSlotType(slotType) {
    const slotTypeRegExp = slotType instanceof RegExp ? slotType : new RegExp(`^${slotType}$`);
    const isCorrectSlotType = (slot) => slotTypeRegExp.test(slot.type) || ["Open", "Closed"].includes(slot.type) && slotTypeRegExp.test(this.wheels[0].type);
    return this.slotNumber !== null && this.wheelSlot.every((slot) => {
      return isCorrectSlotType(slot) || slot.type === "Split" && isCorrectSlotType(slot.floorSlot) && isCorrectSlotType(slot.ceilSlot);
    });
  }
  /**
   * Use only in `WheelShake` capabilities!
   * @returns {'slot' | 'wheel'} The fixture component that is shaking.
   */
  get isShaking() {
    return this.jsonObject.isShaking || "wheel";
  }
  /**
   * @returns {string | null} Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.
   */
  get effectName() {
    if ("effectName" in this._jsonObject) {
      return cacheResult(this, "effectName", this._jsonObject.effectName);
    }
    if ("effectPreset" in this._jsonObject) {
      const effectName = {
        ColorFade: "Color fade",
        ColorJump: "Color jump"
      }[this._jsonObject.effectPreset];
      return cacheResult(this, "effectName", effectName);
    }
    return cacheResult(this, "effectName", null);
  }
  /**
   * @returns {string | null} Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.
   */
  get effectPreset() {
    return this._jsonObject.effectPreset || null;
  }
  /**
   * @returns {boolean} Whether this effect is controlled by sound perceived by a microphone. Defaults to false.
   */
  get isSoundControlled() {
    return this._jsonObject.soundControlled === true;
  }
  /**
   * @returns {boolean} Whether this capability's speed / duration varies by a random offset. Defaults to false.
   */
  get randomTiming() {
    return this._jsonObject.randomTiming === true;
  }
  /**
   * @returns {'Top' | 'Right' | 'Bottom' | 'Left' | number | null} At which position the blade is attached. Defaults to null.
   */
  get blade() {
    return this._jsonObject.blade || null;
  }
  /**
   * @returns {'Fog' | 'Haze' | null} The kind of fog that should be emitted. Defaults to null.
   */
  get fogType() {
    return this._jsonObject.fogType || null;
  }
  /**
   * @returns {Entity | null} How long this capability should be selected to take effect. Defaults to null.
   */
  get hold() {
    if ("hold" in this._jsonObject) {
      return cacheResult(this, "hold", Entity.createFromEntityString(this._jsonObject.hold));
    }
    return cacheResult(this, "hold", null);
  }
  /**
   * TYPE-SPECIFIC PROPERTIES (only start-end)
   */
  /**
   * @returns {Entity[] | null} Start and end speed values. Defaults to null.
   */
  get speed() {
    return cacheResult(this, "speed", this._getStartEndArray("speed"));
  }
  /**
   * @returns {Entity[] | null} Start and end duration values. Defaults to null.
   */
  get duration() {
    return cacheResult(this, "duration", this._getStartEndArray("duration"));
  }
  /**
   * @returns {Entity[] | null} Start and end time values. Defaults to null.
   */
  get time() {
    return cacheResult(this, "time", this._getStartEndArray("time"));
  }
  /**
   * @returns {Entity[] | null} Start and end brightness values. Defaults to null.
   */
  get brightness() {
    let brightness = this._getStartEndArray("brightness");
    if (brightness === null && ["Intensity", "ColorIntensity"].includes(this.type)) {
      brightness = [Entity.createFromEntityString("off"), Entity.createFromEntityString("bright")];
    }
    return cacheResult(this, "brightness", brightness);
  }
  /**
   * @returns {Entity[] | null} Start and end slot numbers. Defaults to null.
   */
  get slotNumber() {
    return cacheResult(this, "slotNumber", this._getStartEndArray("slotNumber"));
  }
  /**
   * @returns {WheelSlot[] | null} Start and end wheel slot objects this capability is referencing. Defaults to null.
   */
  get wheelSlot() {
    if (this.slotNumber === null) {
      return cacheResult(this, "wheelSlot", null);
    }
    if (this.wheels.length !== 1) {
      throw new RangeError("When accessing the current wheel slot, the referenced wheel must be unambiguous.");
    }
    if (this.wheels[0]) {
      return cacheResult(this, "wheelSlot", this.slotNumber.map(
        (slotNumber) => this.wheels[0].getSlot(slotNumber.number)
      ));
    }
    return cacheResult(this, "wheelSlot", null);
  }
  /**
   * @returns {Entity[] | null} Start and end angle values. Defaults to null.
   */
  get angle() {
    return cacheResult(this, "angle", this._getStartEndArray("angle"));
  }
  /**
   * @returns {Entity[] | null} Start and end horizontal angle values. Defaults to null.
   */
  get horizontalAngle() {
    return cacheResult(this, "horizontalAngle", this._getStartEndArray("horizontalAngle"));
  }
  /**
   * @returns {Entity[] | null} Start and end vertical angle values. Defaults to null.
   */
  get verticalAngle() {
    return cacheResult(this, "verticalAngle", this._getStartEndArray("verticalAngle"));
  }
  /**
   * @returns {Entity[] | null} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    return cacheResult(this, "colorTemperature", this._getStartEndArray("colorTemperature"));
  }
  /**
   * @returns {Entity[] | null} Start and end sound sensitivity values. Defaults to null.
   */
  get soundSensitivity() {
    return cacheResult(this, "soundSensitivity", this._getStartEndArray("soundSensitivity"));
  }
  /**
   * @returns {Entity[] | null} Start and end shake angle values. Defaults to null.
   */
  get shakeAngle() {
    return cacheResult(this, "shakeAngle", this._getStartEndArray("shakeAngle"));
  }
  /**
   * @returns {Entity[] | null} Start and end shake speed values. Defaults to null.
   */
  get shakeSpeed() {
    return cacheResult(this, "shakeSpeed", this._getStartEndArray("shakeSpeed"));
  }
  /**
   * @returns {Entity[] | null} Start and end distance values. Defaults to null.
   */
  get distance() {
    return cacheResult(this, "distance", this._getStartEndArray("distance"));
  }
  /**
   * @returns {Entity[] | null} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    return cacheResult(this, "openPercent", this._getStartEndArray("openPercent"));
  }
  /**
   * @returns {Entity[] | null} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    return cacheResult(this, "frostIntensity", this._getStartEndArray("frostIntensity"));
  }
  /**
   * @returns {Entity[] | null} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    return cacheResult(this, "insertion", this._getStartEndArray("insertion"));
  }
  /**
   * @returns {Entity[] | null} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    return cacheResult(this, "fogOutput", this._getStartEndArray("fogOutput"));
  }
  /**
   * @returns {Entity[] | null} Start and end parameter values. Defaults to null.
   */
  get parameter() {
    return cacheResult(this, "parameter", this._getStartEndArray("parameter"));
  }
  /**
   * Parses a property that has start and end variants by generating an array with start and end value.
   * @private
   * @param {string} property The base property name. 'Start' and 'End' will be appended to get the start/end variants.
   * @returns {Entity[] | null} Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.
   */
  _getStartEndArray(property) {
    if (property in this._jsonObject) {
      return [
        this._jsonObject[property],
        this._jsonObject[property]
      ].map((value) => Entity.createFromEntityString(value));
    }
    if (`${property}Start` in this._jsonObject) {
      return [
        this._jsonObject[`${property}Start`],
        this._jsonObject[`${property}End`]
      ].map((value) => Entity.createFromEntityString(value));
    }
    return null;
  }
}
function getSimpleCapabilityName(capability, name, property, propertyName = null, propertyNameBeforeValue = false) {
  const propertyString = startEndToString(capability[property], propertyName, propertyNameBeforeValue);
  return appendInBrackets(`${name} ${propertyString}`, capability.comment);
}
function appendInBrackets(string, ...inBrackets) {
  inBrackets = inBrackets.filter(
    (inBracket) => inBracket !== void 0 && inBracket !== null && inBracket !== ""
  );
  if (inBrackets.length === 0) {
    return string;
  }
  const inBracketsString = inBrackets.join(", ");
  return `${string} (${inBracketsString})`;
}
function colorTemperaturesToString([start, end]) {
  if (start.keyword || start.unit !== "%") {
    return startEndToString([start, end]);
  }
  if (start.equals(end)) {
    return colorTemperatureToString(start.number);
  }
  if (start <= 0) {
    if (end <= 0) {
      return `${-start}…${-end}% warm`;
    }
    return `${-start}% warm … ${end}% cold`;
  }
  if (end <= 0) {
    return `${start}% cold … ${-end}% warm`;
  }
  return `${start}…${end}% cold`;
  function colorTemperatureToString(temperature) {
    if (temperature < 0) {
      return `${-temperature}% warm`;
    }
    if (temperature > 0) {
      return `${temperature}% cold`;
    }
    return "default";
  }
}
function startEndToString([start, end], propertyName = null, propertyNameBeforeValue = false) {
  if (start.keyword) {
    return handleKeywords();
  }
  const unitAliases = {
    "deg": "°",
    "m^3/min": "m³/min"
  };
  const unit = unitAliases[start.unit] || start.unit;
  const words = [];
  if (start.equals(end)) {
    words.push(`${start.number}${unit}`);
  } else {
    words.push(`${start.number}…${end.number}${unit}`);
  }
  if (propertyName && unit === "%") {
    words.push(propertyName);
  }
  if (propertyNameBeforeValue) {
    words.reverse();
  }
  return words.join(" ");
  function handleKeywords() {
    if (start.equals(end)) {
      return start.keyword;
    }
    const hasSpecifier = / (?:CW|CCW|reverse)$/;
    if (hasSpecifier.test(start.keyword) && hasSpecifier.test(end.keyword)) {
      const [speedStart, specifierStart] = start.keyword.split(" ");
      const [speedEnd, specifierEnd] = end.keyword.split(" ");
      if (specifierStart === specifierEnd) {
        return `${specifierStart} ${speedStart}…${speedEnd}`;
      }
    }
    return `${start.keyword}…${end.keyword}`;
  }
}
class SwitchingChannel extends AbstractChannel {
  /**
   * Creates a new SwitchingChannel instance.
   * @param {string} alias The unique switching channel alias as defined in the trigger channel's `switchChannels` properties.
   * @param {AbstractChannel} triggerChannel The channel whose DMX value this channel depends on.
   */
  constructor(alias, triggerChannel) {
    super(alias);
    this._triggerChannel = triggerChannel;
  }
  /**
   * @returns {AbstractChannel} The channel whose DMX value this switching channel depends on.
   */
  get triggerChannel() {
    return this._triggerChannel;
  }
  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture in which this channel is used.
   */
  get fixture() {
    return this.triggerChannel.fixture;
  }
  /**
   * @typedef {object} TriggerCapability
   * @property {Range} dmxRange The DMX range that triggers the switching channel.
   * @property {string} switchTo The channel to switch to in the given DMX range.
   */
  /**
   * @returns {TriggerCapability[]} The trigger channel's capabilities in a compact form to only include the DMX range and which channel should be switched to. DMX values are given in the trigger channel's highest possible resolution.
   */
  get triggerCapabilities() {
    return cacheResult(this, "triggerCapabilities", this.triggerChannel.capabilities.map(
      (capability) => ({
        dmxRange: capability.dmxRange,
        switchTo: capability.switchChannels[this.key]
      })
    ));
  }
  /**
   * @returns {Record<string, Range[]>} Keys of channels that can be switched to pointing to an array of DMX values the trigger channel must be set to to active the channel. DMX values are given in the trigger channel's highest possible resolution.
   */
  get triggerRanges() {
    const triggerRanges = {};
    for (const capability of this.triggerCapabilities) {
      if (!(capability.switchTo in triggerRanges)) {
        triggerRanges[capability.switchTo] = [];
      }
      triggerRanges[capability.switchTo].push(capability.dmxRange);
    }
    for (const channel of Object.keys(triggerRanges)) {
      triggerRanges[channel] = Range.getMergedRanges(triggerRanges[channel]);
    }
    return cacheResult(this, "triggerRanges", triggerRanges);
  }
  /**
   * @returns {string} The key of the channel that is activated when the trigger channel is set to its default value.
   */
  get defaultChannelKey() {
    return cacheResult(this, "defaultChannelKey", this.triggerCapabilities.find(
      (capability) => capability.dmxRange.contains(this.triggerChannel.defaultValue)
    ).switchTo);
  }
  /**
   * @returns {AbstractChannel} The channel that is activated when the trigger channel is set to its default value.
   */
  get defaultChannel() {
    return cacheResult(this, "defaultChannel", this.fixture.getChannelByKey(this.defaultChannelKey));
  }
  /**
   * @returns {string[]} All channel keys this channel can be switched to.
   */
  get switchToChannelKeys() {
    const switchToChannelKeys = this.triggerCapabilities.map((capability) => capability.switchTo).filter((channelKey, index, array) => array.indexOf(channelKey) === index);
    return cacheResult(this, "switchToChannelKeys", switchToChannelKeys);
  }
  /**
   * @returns {AbstractChannel[]} All channels this channel can be switched to.
   */
  get switchToChannels() {
    return cacheResult(this, "switchToChannels", this.switchToChannelKeys.map(
      (channelKey) => this.fixture.getChannelByKey(channelKey)
    ));
  }
  /**
   * @typedef {'keyOnly' | 'defaultOnly' | 'switchedOnly' | 'all'} SwitchingChannelBehavior
   */
  /**
   * @param {string} channelKey The channel key to search for.
   * @param {SwitchingChannelBehavior} [switchingChannelBehavior='all'] Define which channels to include in the search.
   * @returns {boolean} Whether this SwitchingChannel contains the given channel key.
   */
  usesChannelKey(channelKey, switchingChannelBehavior = "all") {
    if (switchingChannelBehavior === "keyOnly") {
      return this.key === channelKey;
    }
    if (switchingChannelBehavior === "defaultOnly") {
      return this.defaultChannel.key === channelKey;
    }
    if (switchingChannelBehavior === "switchedOnly") {
      return this.switchToChannelKeys.includes(channelKey);
    }
    return this.switchToChannelKeys.includes(channelKey) || this.key === channelKey;
  }
  /**
   * @returns {boolean} True if help is needed in one of the switched channels, false otherwise.
   */
  get isHelpWanted() {
    return cacheResult(this, "isHelpWanted", this.switchToChannels.some(
      (channel) => channel.isHelpWanted
    ));
  }
}
const channelTypeConstraints = {
  "Single Color": ["ColorIntensity"],
  "Multi-Color": {
    required: ["ColorPreset", "WheelSlot"],
    predicate: (channel) => channel.capabilities.every(
      (capability) => capability.type !== "WheelSlot" || capability.wheels[0] && capability.wheels[0].type === "Color"
    )
  },
  "Pan": ["Pan", "PanContinuous"],
  "Tilt": ["Tilt", "TiltContinuous"],
  "Focus": ["Focus"],
  "Zoom": ["Zoom"],
  "Iris": ["Iris", "IrisEffect"],
  "Gobo": {
    required: ["WheelSlot", "WheelShake"],
    predicate: (channel) => channel.capabilities.every(
      (capability) => capability.wheels.every((wheel) => wheel && wheel.type === "Gobo")
    )
  },
  "Prism": ["Prism"],
  "Color Temperature": ["ColorTemperature"],
  "Effect": ["Effect", "EffectParameter", "Frost", "FrostEffect", "SoundSensitivity", "WheelSlot"],
  "Strobe": {
    required: ["ShutterStrobe"],
    predicate: (channel) => channel.capabilities.some(
      (capability) => capability.type === "ShutterStrobe" && !["Open", "Closed"].includes(capability.shutterEffect)
    )
  },
  "Shutter": ["ShutterStrobe", "BladeInsertion", "BladeRotation", "BladeSystemRotation"],
  "Fog": ["Fog", "FogOutput", "FogType"],
  "Speed": ["StrobeSpeed", "StrobeDuration", "PanTiltSpeed", "EffectSpeed", "EffectDuration", "BeamAngle", "BeamPosition", "PrismRotation", "Rotation", "Speed", "Time", "WheelSlotRotation", "WheelRotation", "WheelShake"],
  "Maintenance": ["Maintenance"],
  "Intensity": ["Intensity", "Generic"],
  "NoFunction": ["NoFunction"]
};
class CoarseChannel extends AbstractChannel {
  /**
   * 1 for 8bit, 2 for 16bit, ...
   * @typedef {number} Resolution
   */
  /**
   * @returns {Resolution} Resolution of an 8bit channel.
   */
  static get RESOLUTION_8BIT() {
    return 1;
  }
  /**
   * @returns {Resolution} Resolution of a 16bit channel.
   */
  static get RESOLUTION_16BIT() {
    return 2;
  }
  /**
   * @returns {Resolution} Resolution of a 24bit channel.
   */
  static get RESOLUTION_24BIT() {
    return 3;
  }
  /**
   * @returns {Resolution} Resolution of a 32bit channel.
   */
  static get RESOLUTION_32BIT() {
    return 4;
  }
  /**
   * Create a new CoarseChannel instance.
   * @param {string} key The channel's identifier, must be unique in the fixture.
   * @param {object} jsonObject The channel data from the fixture's JSON.
   * @param {Fixture} fixture The fixture instance this channel is associated to.
   */
  constructor(key, jsonObject, fixture) {
    super(key);
    this._jsonObject = jsonObject;
    this._fixture = fixture;
  }
  /**
   * @returns {object} The channel data from the fixture's JSON.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture instance this channel is associated to.
   */
  get fixture() {
    return this._fixture;
  }
  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} The channel name if present or else the channel key.
   */
  get name() {
    return this._jsonObject.name || this.key;
  }
  /**
   * @returns {string} The channel type, derived from the channel's capability types.
   */
  get type() {
    const type2 = Object.keys(channelTypeConstraints).find((potentialType) => {
      let constraints = channelTypeConstraints[potentialType];
      if (Array.isArray(constraints)) {
        constraints = {
          required: constraints
        };
      }
      const requiredCapabilityTypeUsed = this.capabilities.some(
        (capability) => constraints.required.includes(capability.type)
      );
      const predicateFulfilled = !("predicate" in constraints) || constraints.predicate(this);
      return requiredCapabilityTypeUsed && predicateFulfilled;
    }) || "Unknown";
    return cacheResult(this, "type", type2);
  }
  /**
   * @returns {string | null} The color of an included ColorIntensity capability, null if there's no such capability.
   */
  get color() {
    const color = this.capabilities.find((capability) => capability.type === "ColorIntensity")?.color;
    return cacheResult(this, "color", color ?? null);
  }
  /**
   * @returns {string[]} This channel's fine channel aliases, ordered by resolution (coarsest first).
   */
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }
  /**
   * @returns {FineChannel[]} This channel's fine channels, ordered by resolution (coarsest first).
   */
  get fineChannels() {
    return cacheResult(this, "fineChannels", this.fineChannelAliases.map(
      (alias) => new FineChannel(alias, this)
    ));
  }
  /**
   * @returns {Resolution} How fine this channel can be used at its maximum. Equals the amount of coarse and fine channels.
   */
  get maxResolution() {
    return 1 + this.fineChannelAliases.length;
  }
  /**
   * Checks the given resolution if it can safely be used in this channel.
   * @param {Resolution} uncheckedResolution The resolution to be checked.
   * @throws {RangeError} If the given resolution is invalid in this channel.
   */
  ensureProperResolution(uncheckedResolution) {
    if (uncheckedResolution > this.maxResolution || uncheckedResolution < CoarseChannel.RESOLUTION_8BIT || uncheckedResolution % 1 !== 0) {
      throw new RangeError("resolution must be a positive integer not greater than maxResolution");
    }
  }
  /**
   * @returns {Resolution} How fine this channel is declared in the JSON data. Defaults to {@link CoarseChannel#maxResolution}.
   */
  get dmxValueResolution() {
    if ("dmxValueResolution" in this._jsonObject) {
      const resolutionStringToResolution = {
        "8bit": CoarseChannel.RESOLUTION_8BIT,
        "16bit": CoarseChannel.RESOLUTION_16BIT,
        "24bit": CoarseChannel.RESOLUTION_24BIT
      };
      return cacheResult(this, "dmxValueResolution", resolutionStringToResolution[this._jsonObject.dmxValueResolution]);
    }
    return cacheResult(this, "dmxValueResolution", this.maxResolution);
  }
  /**
   * @param {Mode} mode The mode in which this channel is used.
   * @param {SwitchingChannelBehavior} switchingChannelBehavior How switching channels are treated, see {@link Mode#getChannelIndex}.
   * @returns {Resolution} How fine this channel is used in the given mode. 0 if the channel isn't used at all.
   */
  getResolutionInMode(mode, switchingChannelBehavior) {
    const channelKeys = [this.key, ...this.fineChannelAliases];
    const usedChannels = channelKeys.filter(
      (channelKey) => mode.getChannelIndex(channelKey, switchingChannelBehavior) !== -1
    );
    return usedChannels.length;
  }
  /**
   * @returns {number} The maximum DMX value in the highest possible resolution. E.g. 65535 for a 16bit channel.
   */
  get maxDmxBound() {
    return Math.pow(256, this.maxResolution) - 1;
  }
  /**
   * @returns {boolean} Whether this channel has a defaultValue.
   */
  get hasDefaultValue() {
    return "defaultValue" in this._jsonObject;
  }
  /**
   * @returns {number} The DMX value this channel initially should be set to. Specified in the finest possible resolution. Defaults to 0.
   */
  get defaultValue() {
    return this.getDefaultValueWithResolution(this.maxResolution);
  }
  /**
   * @private
   * @returns {Record<Resolution, number>} The default DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.
   */
  get _defaultValuePerResolution() {
    let rawDefaultValue = this._jsonObject.defaultValue || 0;
    if (!Number.isInteger(rawDefaultValue)) {
      const percentage = Entity.createFromEntityString(rawDefaultValue).number / 100;
      rawDefaultValue = Math.floor(percentage * (Math.pow(256, this.dmxValueResolution) - 1));
    }
    const defaultValuePerResolution = {};
    for (let index = 1; index <= this.maxResolution; index++) {
      defaultValuePerResolution[index] = scaleDmxValue(rawDefaultValue, this.dmxValueResolution, index);
    }
    return cacheResult(this, "_defaultValuePerResolution", defaultValuePerResolution);
  }
  /**
   * @param {Resolution} desiredResolution The grade of resolution the defaultValue should be scaled to.
   * @returns {number} The DMX value this channel initially should be set to, scaled to match the given resolution.
   */
  getDefaultValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);
    return this._defaultValuePerResolution[desiredResolution];
  }
  /**
   * @returns {boolean} Whether this channel has a highlightValue.
   */
  get hasHighlightValue() {
    return "highlightValue" in this._jsonObject;
  }
  /**
   * @returns {number} A DMX value that "highlights" the function of this channel. Specified in the finest possible resolution. Defaults to the highest possible DMX value.
   */
  get highlightValue() {
    return this.getHighlightValueWithResolution(this.maxResolution);
  }
  /**
   * @private
   * @returns {Record<Resolution, number>} The highlight DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.
   */
  get _highlightValuePerResolution() {
    let rawHighlightValue = this._jsonObject.highlightValue;
    if (!Number.isInteger(rawHighlightValue)) {
      const maxDmxBoundInResolution = Math.pow(256, this.dmxValueResolution) - 1;
      if (this.hasHighlightValue) {
        const percentage = Entity.createFromEntityString(rawHighlightValue).number / 100;
        rawHighlightValue = Math.floor(percentage * maxDmxBoundInResolution);
      } else {
        rawHighlightValue = maxDmxBoundInResolution;
      }
    }
    const highlightValuePerResolution = {};
    for (let index = 1; index <= this.maxResolution; index++) {
      highlightValuePerResolution[index] = scaleDmxValue(rawHighlightValue, this.dmxValueResolution, index);
    }
    return cacheResult(this, "_highlightValuePerResolution", highlightValuePerResolution);
  }
  /**
   * @param {Resolution} desiredResolution The grade of resolution the highlightValue should be scaled to.
   * @returns {number} A DMX value that "highlights" the function of this channel, scaled to match the given resolution.
   */
  getHighlightValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);
    return this._highlightValuePerResolution[desiredResolution];
  }
  /**
   * @returns {boolean} Whether a fader for this channel should be displayed upside down.
   */
  get isInverted() {
    const proportionalCapabilities = this.capabilities.filter((capability) => !capability.isStep);
    const isInverted = proportionalCapabilities.length > 0 && proportionalCapabilities.every((capability) => capability.isInverted);
    return cacheResult(this, "isInverted", isInverted);
  }
  /**
   * @returns {boolean} Whether this channel should constantly stay at the same value.
   */
  get isConstant() {
    return "constant" in this._jsonObject && this._jsonObject.constant;
  }
  /**
   * @returns {boolean} Whether switching from one DMX value to another in this channel can be faded smoothly.
   */
  get canCrossfade() {
    if (this.capabilities.length === 1) {
      return cacheResult(this, "canCrossfade", !this.isConstant && this.type !== "NoFunction");
    }
    const canCrossfade = this.capabilities.every(
      (capability, index, array) => index + 1 === array.length || capability.canCrossfadeTo(array[index + 1])
    ) && this.capabilities.some((capability) => !capability.isStep);
    return cacheResult(this, "canCrossfade", canCrossfade);
  }
  /**
   * @returns {'HTP' | 'LTP'} The channel's behavior when being affected by multiple faders: HTP (Highest Takes Precedent) or LTP (Latest Takes Precedent).
   */
  get precedence() {
    return "precedence" in this._jsonObject ? this._jsonObject.precedence : "LTP";
  }
  /**
   * @returns {string[]} Aliases of the switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannelAliases() {
    return cacheResult(this, "switchingChannelAliases", Object.keys(this.capabilities[0].switchChannels));
  }
  /**
   * @returns {SwitchingChannel[]} Switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannels() {
    return cacheResult(this, "switchingChannels", this.switchingChannelAliases.map(
      (alias) => new SwitchingChannel(alias, this)
    ));
  }
  /**
   * @returns {string[]} The keys of the channels to which the switching channels defined by this channel can be switched to.
   */
  get switchToChannelKeys() {
    return cacheResult(this, "switchToChannelKeys", this.switchingChannels.flatMap(
      (switchingChannel) => switchingChannel.switchToChannelKeys
    ));
  }
  /**
   * @returns {Capability[]} All capabilities of this channel, ordered by DMX range.
   */
  get capabilities() {
    if ("capability" in this._jsonObject) {
      const capabilityData = {
        dmxRange: [0, Math.pow(256, this.dmxValueResolution) - 1],
        ...this._jsonObject.capability
      };
      return cacheResult(this, "capabilities", [
        new Capability(capabilityData, this.dmxValueResolution, this)
      ]);
    }
    return cacheResult(this, "capabilities", this._jsonObject.capabilities.map(
      (capability) => new Capability(capability, this.dmxValueResolution, this)
    ));
  }
  /**
   * @returns {boolean} True if help is needed in a capability of this channel, false otherwise.
   */
  get isHelpWanted() {
    return cacheResult(this, "isHelpWanted", this.capabilities.some(
      (capability) => capability.helpWanted !== null
    ));
  }
}
class FineChannel extends AbstractChannel {
  /**
   * Creates a new FineChannel instance.
   * @param {string} key The fine channel alias as defined in the coarse channel.
   * @param {CoarseChannel} coarseChannel The coarse (MSB) channel.
   */
  constructor(key, coarseChannel) {
    super(key);
    this._coarseChannel = coarseChannel;
  }
  /**
   * @returns {CoarseChannel} The coarse (MSB) channel.
   */
  get coarseChannel() {
    return this._coarseChannel;
  }
  /**
   * @returns {CoarseChannel | FineChannel} The next coarser channel. May also be a fine channel, if this fine channel's resolution is 24bit or higher.
   */
  get coarserChannel() {
    return this.resolution === CoarseChannel.RESOLUTION_16BIT ? this.coarseChannel : this.coarseChannel.fineChannels[this.resolution - 3];
  }
  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} A generated channel name, based upon the coarse channel's name.
   */
  get name() {
    const suffix = this.resolution > CoarseChannel.RESOLUTION_16BIT ? `^${this.resolution - 1}` : "";
    return `${this.coarseChannel.name} fine${suffix}`;
  }
  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture this channel belongs to.
   */
  get fixture() {
    return this.coarseChannel.fixture;
  }
  /**
   * @returns {Resolution} The resolution of this fine channel. E.g. 2 (16bit) for the first fine channel, 3 (24bit) for the second fine channel, etc.
   */
  get resolution() {
    return this._coarseChannel.fineChannelAliases.indexOf(this.key) + 2;
  }
  /**
   * @returns {number} The DMX value (from 0 to 255) this channel should be set to by default.
   */
  get defaultValue() {
    return this._coarseChannel.getDefaultValueWithResolution(this.resolution) % 256;
  }
}
class NullChannel extends CoarseChannel {
  /**
   * Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
   * Uses a unique uuid as channel key.
   * @param {Fixture} fixture The fixture this channel is associated to.
   */
  constructor(fixture) {
    super(`null-${v4()}`, {
      name: "No Function",
      capability: {
        type: "NoFunction"
      }
    }, fixture);
  }
}
const _sfc_main$5 = {
  props: {
    channel: instanceOfProp(AbstractChannel).required
  },
  computed: {
    iconProperties() {
      return getIconProperties$1(this.channel);
    }
  }
};
const channelTypeIcons = {
  "Multi-Color": "color-changer",
  "Fog": "smoke",
  "Intensity": "dimmer"
};
function getIconProperties$1(channel) {
  if (channel instanceof NullChannel) {
    return {
      type: "fixture",
      name: "NoFunction",
      title: "Channel type: NoFunction"
    };
  }
  if (channel instanceof FineChannel) {
    return getIconProperties$1(channel.coarseChannel);
  }
  if (channel instanceof SwitchingChannel) {
    return {
      type: "fixture",
      name: "switching-channel",
      title: "Channel type: Switching Channel"
    };
  }
  if (channel.type === "Single Color") {
    return {
      type: "color-circle",
      name: channel.color,
      title: `Channel type: Single Color, ${channel.color}`
    };
  }
  return {
    type: "fixture",
    name: channelTypeIcons[channel.type] || channel.type,
    title: `Channel type: ${channel.type}`
  };
}
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1$1;
  _push(ssrRenderComponent(_component_OflSvg, mergeProps($options.iconProperties, _attrs), null, _parent));
}
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChannelTypeIcon.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["ssrRender", _sfc_ssrRender$5]]), { __name: "ChannelTypeIcon" });
const _sfc_main$4 = {
  props: {
    capability: {
      type: Capability,
      required: true
    }
  },
  computed: {
    useImage() {
      const cap = this.capability;
      const ws = cap.wheelSlot;
      if (cap.type !== "WheelShake" && ws !== null && ws[0] === ws[1]) {
        const resource = ws[0].resource;
        return Boolean(resource && resource.hasImage);
      }
      return false;
    },
    imageResource() {
      return this.capability.wheelSlot[0].resource;
    },
    imageTitle() {
      const cap = this.capability;
      return `Capability type: ${cap.type}, slot ${cap.slotNumber[0]} (${cap.wheelSlot[0].name})`;
    },
    iconProperties() {
      return getIconProperties(this.capability);
    }
  }
};
const isAnimationGoboSlot = (slot) => slot.type.startsWith("AnimationGobo");
const isAnimationGobo = (capability) => isAnimationGoboSlot(capability.wheelSlot[0]) && isAnimationGoboSlot(capability.wheelSlot[1]);
const specialIconFunctions = {
  ShutterStrobe(capability, iconProperties) {
    if (capability.shutterEffect === "Closed" || capability.shutterEffect === "Open") {
      iconProperties.type = "color-circle";
      iconProperties.colors = [capability.shutterEffect === "Closed" ? "#000000" : "#ffffff"];
      delete iconProperties.name;
    } else {
      iconProperties.name = "Strobe";
    }
  },
  Intensity(capability, iconProperties) {
    iconProperties.name = "dimmer";
  },
  ColorIntensity(capability, iconProperties) {
    iconProperties.name = "dimmer";
  },
  ColorPreset(capability, iconProperties) {
    iconProperties.name = "color-changer";
  },
  PanContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = "speed-stop";
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = "pan-continuous-cw";
    } else if (capability.speed[0].number < 0 || capability.speed[1].number < 0) {
      iconProperties.name = "pan-continuous-ccw";
    }
  },
  TiltContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = "speed-stop";
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = "tilt-continuous-cw";
    } else if (capability.speed[0].number < 0 || capability.speed[1].number < 0) {
      iconProperties.name = "tilt-continuous-ccw";
    }
  },
  WheelSlot(capability, iconProperties) {
    if (isAnimationGobo(capability)) {
      iconProperties.name = "animation-gobo";
    } else if (capability.wheelSlot[0] === capability.wheelSlot[1] && capability.wheelSlot[0].type !== "Split") {
      iconProperties.name = capability.wheelSlot[0].type === "Color" ? "color-changer" : capability.wheelSlot[0].type;
      iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
    } else {
      iconProperties.name = void 0;
    }
  },
  WheelShake(capability, iconProperties) {
    if (capability.wheelSlot && isAnimationGobo(capability)) {
      iconProperties.name = "animation-gobo";
    } else if (capability.wheelSlot && capability.wheelSlot[0] !== capability.wheelSlot[1]) {
      iconProperties.name = void 0;
    } else {
      iconProperties.name = capability.isShaking === "slot" ? "slot-shake" : "wheel-shake";
      if (capability.wheelSlot) {
        iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
      }
    }
  },
  IrisEffect(capability, iconProperties) {
    iconProperties.name = "Iris";
  },
  FrostEffect(capability, iconProperties) {
    iconProperties.name = "Frost";
  },
  Fog(capability, iconProperties) {
    specialIconFunctions.FogType(capability, iconProperties);
  },
  FogOutput(capability, iconProperties) {
    iconProperties.name = "smoke";
  },
  FogType(capability, iconProperties) {
    iconProperties.name = capability.fogType === "Haze" ? "hazer" : "smoke";
  },
  Speed(capability, iconProperties) {
    if (!capability.speed) {
      iconProperties.name = "speed";
    } else if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = "speed-stop";
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = "speed-forward";
    } else {
      iconProperties.name = "speed-reverse";
    }
  },
  Rotation(capability, iconProperties) {
    if (capability.speed) {
      specialIconFunctions.RotationSpeed(capability, iconProperties);
    } else {
      iconProperties.name = "rotation-angle";
    }
  },
  RotationSpeed(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = "speed-stop";
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = "rotation-cw";
    } else {
      iconProperties.name = "rotation-ccw";
    }
  },
  Generic(capability, iconProperties) {
    iconProperties.name = "other";
  }
};
function getIconProperties(capability) {
  if (capability.colors !== null) {
    return {
      type: "color-circle",
      colors: capability.colors.allColors,
      title: `Capability type: ${capability.type}, ${getColorDescription(capability)}`
    };
  }
  const iconProperties = {
    type: "fixture",
    name: capability.type,
    title: `Capability type: ${capability.type}`
  };
  if (capability.isSoundControlled) {
    iconProperties.name = "sound-controlled";
    iconProperties.title += " (sound-controlled)";
  } else if (capability.type in specialIconFunctions) {
    specialIconFunctions[capability.type](capability, iconProperties);
  } else if (/(?:Speed|Duration|Time)$/.test(capability.type)) {
    specialIconFunctions.Speed(capability, iconProperties);
  } else if (capability.type.endsWith("Rotation")) {
    specialIconFunctions.Rotation(capability, iconProperties);
  }
  return iconProperties;
}
function getColorDescription(capability) {
  if (capability.colors === null) {
    return null;
  }
  if (capability.colors.isStep) {
    const plural = capability.colors.allColors.length > 1 ? "colors" : "color";
    const allColors = capability.colors.allColors.join(", ");
    return `${plural}: ${allColors}`;
  }
  const startColors = capability.colors.startColors.join(", ");
  const endColors = capability.colors.endColors.join(", ");
  return `transition from ${startColors} to ${endColors}`;
}
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1$1;
  if ($options.useImage) {
    _push(`<img${ssrRenderAttrs(mergeProps({
      src: $options.imageResource.imageDataUrl,
      title: $options.imageTitle,
      class: "icon gobo-icon"
    }, _attrs))}>`);
  } else {
    _push(ssrRenderComponent(_component_OflSvg, mergeProps($options.iconProperties, _attrs), null, _parent));
  }
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CapabilityTypeIcon.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$4]]), { __name: "CapabilityTypeIcon" });
class TemplateChannel extends CoarseChannel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {string} key The templateChannel's key with the required variables.
   * @param {object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases must include variables.
   * @param {Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    super(key, jsonObject, fixture);
  }
  /**
   * @returns {string[]} Template keys and aliases introduced by this channel, i.e. the channel key itself and defined fine and switching channels.
   */
  get allTemplateKeys() {
    return cacheResult(this, "allTemplateKeys", [this.key, ...this.fineChannelAliases, ...this.switchingChannelAliases]);
  }
  /**
   * @returns {Map<string, string[]>} All template keys pointing to the key resolved with each pixel key to a matrix channel key.
   */
  get possibleMatrixChannelKeys() {
    const possibleMatrixChannelKeys = /* @__PURE__ */ new Map();
    for (const templateKey of this.allTemplateKeys) {
      const pixelKeys = [...this.fixture.matrix.pixelKeys, ...this.fixture.matrix.pixelGroupKeys];
      possibleMatrixChannelKeys.set(templateKey, pixelKeys.map(
        (pixelKey) => TemplateChannel.resolveTemplateString(templateKey, { pixelKey })
      ));
    }
    return cacheResult(this, "possibleMatrixChannelKeys", possibleMatrixChannelKeys);
  }
  /**
   * Creates matrix channels from this template channel (together with its fine and switching channels if defined) and all pixel keys.
   * @returns {AbstractChannel[]} The generated channels associated to the given pixel key and its fine and switching channels.
   */
  createMatrixChannels() {
    const matrixChannels = [];
    const pixelKeys = [...this.fixture.matrix.pixelKeys, ...this.fixture.matrix.pixelGroupKeys];
    for (const pixelKey of pixelKeys) {
      const templateVariables = { pixelKey };
      const jsonData = TemplateChannel.resolveTemplateObject(this._jsonObject, templateVariables);
      const channelKey = TemplateChannel.resolveTemplateString(this._key, templateVariables);
      const mainChannel = new CoarseChannel(channelKey, jsonData, this.fixture);
      const channels = [mainChannel, ...mainChannel.fineChannels, ...mainChannel.switchingChannels];
      for (const channel of channels) {
        channel.pixelKey = pixelKey;
      }
      matrixChannels.push(...channels);
    }
    return matrixChannels;
  }
  /**
   * Replaces the specified variables in the specified object by cloning the object.
   * @param {object} object The object which has to be modified.
   * @param {Record<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {object} A copy of the object with replaced variables.
   */
  static resolveTemplateObject(object, variables) {
    return JSON.parse(TemplateChannel.resolveTemplateString(JSON.stringify(object), variables));
  }
  /**
   * Replaces the specified variables in the specified string.
   * @param {string} string The string which has to be modified.
   * @param {Record<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {string} The modified string.
   */
  static resolveTemplateString(string, variables) {
    for (const variable of Object.keys(variables)) {
      string = stringReplaceAll(string, `$${variable}`, variables[variable]);
    }
    return string;
  }
}
function stringReplaceAll(string, search, replacement) {
  return string.split(search).join(replacement);
}
class Mode {
  /**
   * Creates a new Mode instance
   * @param {object} jsonObject The mode object from the fixture's JSON data.
   * @param {Fixture} fixture The fixture this mode is associated to.
   */
  constructor(jsonObject, fixture) {
    this._jsonObject = jsonObject;
    this._fixture = fixture;
  }
  /**
   * @returns {object} The JSON data representing this mode. It's a fragment of a fixture's JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {Fixture} The fixture this mode belongs to.
   */
  get fixture() {
    return this._fixture;
  }
  /**
   * @returns {string} The mode's name from the JSON data.
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {string} A shorter mode name from the JSON data. Defaults to the normal name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }
  /**
   * @returns {boolean} Whether this mode has a short name set in the JSON data.
   */
  get hasShortName() {
    return "shortName" in this._jsonObject;
  }
  /**
   * @returns {number | null} The index used in the RDM protocol to reference this mode. Defaults to null.
   */
  get rdmPersonalityIndex() {
    return this._jsonObject.rdmPersonalityIndex || null;
  }
  /**
   * @returns {Physical | null} Extend the fixture's physical data with this physical data object when this mode is activated. Defaults to null.
   */
  get physicalOverride() {
    if ("physical" in this._jsonObject) {
      return cacheResult(this, "physicalOverride", new Physical(this._jsonObject.physical));
    }
    return cacheResult(this, "physicalOverride", null);
  }
  /**
   * @returns {Physical | null} Fixture's physical with mode's physical override (if present) applied on. Null if neither fixture nor mode define physical data.
   */
  get physical() {
    if (this.fixture.physical === null) {
      return cacheResult(this, "physical", this.physicalOverride);
    }
    if (this.physicalOverride === null) {
      return cacheResult(this, "physical", this.fixture.physical);
    }
    const fixturePhysical = this.fixture.physical.jsonObject;
    const physicalOverride = this._jsonObject.physical;
    const physicalData = { ...fixturePhysical, ...physicalOverride };
    for (const property of ["bulb", "lens", "matrixPixels"]) {
      if (property in physicalData) {
        physicalData[property] = {
          ...fixturePhysical[property],
          ...physicalOverride[property]
        };
      }
    }
    return cacheResult(this, "physical", new Physical(physicalData));
  }
  /**
   * @returns {string[]} The mode's channel keys. The count and position equals to actual DMX channel count and position.
   */
  get channelKeys() {
    const channelKeys = this._jsonObject.channels.flatMap((rawReference) => {
      if (rawReference !== null && rawReference.insert === "matrixChannels") {
        return this._getMatrixChannelKeysFromInsertBlock(rawReference);
      }
      return rawReference;
    });
    return cacheResult(this, "channelKeys", channelKeys);
  }
  /**
   * @returns {number} The number of null channels used in this mode.
   */
  get nullChannelCount() {
    return this.channelKeys.filter((channelKey) => channelKey === null).length;
  }
  /**
   * Resolves the matrix channel insert block into a list of channel keys
   * @private
   * @param {object} channelInsert The JSON channel insert block
   * @returns {string[]} The resolved channel keys
   */
  _getMatrixChannelKeysFromInsertBlock(channelInsert) {
    const pixelKeys = this._getRepeatForPixelKeys(channelInsert.repeatFor);
    const channelKeys = [];
    if (channelInsert.channelOrder === "perPixel") {
      for (const pixelKey of pixelKeys) {
        for (const templateChannelKey of channelInsert.templateChannels) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey
          }));
        }
      }
    } else if (channelInsert.channelOrder === "perChannel") {
      for (const templateChannelKey of channelInsert.templateChannels) {
        for (const pixelKey of pixelKeys) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey
          }));
        }
      }
    }
    return channelKeys;
  }
  /**
   * Resolves `repeatFor` keywords into a list of pixel (group) keys or just returns the given pixel (group) key array.
   * @private
   * @param {string | string[]} repeatFor A matrix channel insert's repeatFor property.
   * @returns {string[]} The properly ordered list of pixel (group) keys.
   */
  _getRepeatForPixelKeys(repeatFor) {
    if (Array.isArray(repeatFor)) {
      return repeatFor;
    }
    const matrix = this.fixture.matrix;
    if (repeatFor === "eachPixelGroup") {
      return matrix.pixelGroupKeys;
    }
    if (repeatFor === "eachPixelABC") {
      return matrix.pixelKeys;
    }
    const orderByAxes = repeatFor.replace("eachPixel", "");
    return matrix.getPixelKeysByOrder(orderByAxes[0], orderByAxes[1], orderByAxes[2]);
  }
  /**
   * @returns {AbstractChannel[]} The mode's channels. The count and position equals to actual DMX channel count and position.
   */
  get channels() {
    let nullChannelsFound = 0;
    const channels = this.channelKeys.map((channelKey) => {
      if (channelKey === null) {
        nullChannelsFound++;
        return this.fixture.nullChannels[nullChannelsFound - 1];
      }
      return this.fixture.getChannelByKey(channelKey);
    });
    return cacheResult(this, "channels", channels);
  }
  /**
   * @param {string} channelKey The key of the channel to get the index for.
   * @param {SwitchingChannelBehavior} [switchingChannelBehavior='all'] Controls how switching channels are counted, see {@link SwitchingChannel#usesChannelKey} for possible values.
   * @returns {number} The index of the given channel in this mode or -1 if not found.
   */
  getChannelIndex(channelKey, switchingChannelBehavior = "all") {
    return this.channels.findIndex((channel) => {
      if (channel === null) {
        return false;
      }
      if (channel instanceof SwitchingChannel) {
        return channel.usesChannelKey(channelKey, switchingChannelBehavior);
      }
      return channel.key === channelKey;
    });
  }
}
const _sfc_main$3 = {
  components: {
    CapabilityTypeIcon: __nuxt_component_0,
    HelpWantedMessage: __nuxt_component_0$1
  },
  props: {
    channel: instanceOfProp(CoarseChannel).required,
    mode: instanceOfProp(Mode).required,
    resolutionInMode: numberProp().required
  },
  emits: {
    "help-wanted-clicked": (payload) => true
  },
  computed: {
    capabilities() {
      return this.channel.capabilities.map((capability) => {
        const dmxRange = capability.getDmxRangeWithResolution(this.resolutionInMode);
        const switchChannels = [];
        for (const switchingChannelKey of Object.keys(capability.switchChannels)) {
          const switchingChannelIndex = this.mode.getChannelIndex(switchingChannelKey);
          if (switchingChannelIndex > -1) {
            switchChannels.push({
              key: switchingChannelKey,
              index: switchingChannelIndex,
              to: capability.switchChannels[switchingChannelKey]
            });
          }
        }
        return {
          model: capability,
          dmxRangeStart: dmxRange.start,
          dmxRangeEnd: dmxRange.end,
          switchChannels: switchChannels.toSorted((a, b) => a.index - b.index)
          // ascending indices
        };
      });
    }
  }
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_CapabilityTypeIcon = __nuxt_component_0;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_HelpWantedMessage = __nuxt_component_0$1;
  _push(`<table${ssrRenderAttrs(mergeProps({ class: "capabilities-table" }, _attrs))} data-v-0659b867><colgroup data-v-0659b867><col style="${ssrRenderStyle({ "width": "5.8ex" })}" data-v-0659b867><col style="${ssrRenderStyle({ "width": "1ex" })}" data-v-0659b867><col style="${ssrRenderStyle({ "width": "5.8ex" })}" data-v-0659b867><col style="${ssrRenderStyle({ "width": "1.8em" })}" data-v-0659b867><col data-v-0659b867><col style="${ssrRenderStyle({ "width": "1.8em" })}" data-v-0659b867></colgroup><thead data-v-0659b867><tr data-v-0659b867><th colspan="3" style="${ssrRenderStyle({ "text-align": "center" })}" data-v-0659b867>DMX values</th><th data-v-0659b867></th><th data-v-0659b867>Capability</th><th data-v-0659b867></th></tr></thead><tbody data-v-0659b867><!--[-->`);
  ssrRenderList($options.capabilities, (cap, index) => {
    _push(`<!--[--><tr class="capability"${ssrRenderAttr("data-capability-type", cap.model.type)} data-v-0659b867><td class="capability-range0" data-v-0659b867><code data-v-0659b867>${ssrInterpolate(cap.dmxRangeStart)}</code></td><td class="capability-range-separator" data-v-0659b867><code data-v-0659b867>…</code></td><td class="capability-range1" data-v-0659b867><code data-v-0659b867>${ssrInterpolate(cap.dmxRangeEnd)}</code></td><td class="capability-icon" data-v-0659b867>`);
    _push(ssrRenderComponent(_component_CapabilityTypeIcon, {
      capability: cap.model
    }, null, _parent));
    _push(`</td><td class="capability-name" data-v-0659b867>${ssrInterpolate(cap.model.name)}</td><td${ssrRenderAttr("title", cap.model.menuClick === `hidden` ? `this capability is hidden in quick menus` : `choosing this capability in a quick menu snaps to ${cap.model.menuClick} of capability`)} class="capability-menu-click" data-v-0659b867>`);
    _push(ssrRenderComponent(_component_OflSvg, {
      name: `capability-${cap.model.menuClick}`
    }, null, _parent));
    _push(`</td></tr><!--[-->`);
    ssrRenderList(cap.switchChannels, (switchChannel) => {
      _push(`<tr class="switch-to-channel" data-v-0659b867><td colspan="4" data-v-0659b867></td><td colspan="2" data-v-0659b867><span class="switching-channel-key" data-v-0659b867>Channel ${ssrInterpolate(switchChannel.index + 1)} →</span> ${ssrInterpolate(switchChannel.to)}</td></tr>`);
    });
    _push(`<!--]-->`);
    if (cap.model.helpWanted !== null) {
      _push(`<tr data-v-0659b867><td colspan="4" data-v-0659b867></td><td colspan="2" data-v-0659b867>`);
      _push(ssrRenderComponent(_component_HelpWantedMessage, {
        type: "capability",
        context: cap.model,
        onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
      }, null, _parent));
      _push(`</td></tr>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--]-->`);
  });
  _push(`<!--]--></tbody></table>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePageCapabilityTable.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_5$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-0659b867"]]), { __name: "FixturePageCapabilityTable" });
const _sfc_main$2 = {
  name: "FixturePageChannel",
  components: {
    ConditionalDetails: __nuxt_component_3,
    ChannelTypeIcon: __nuxt_component_1,
    FixturePageCapabilityTable: __nuxt_component_5$1,
    LabeledValue: __nuxt_component_1$2
  },
  props: {
    channel: instanceOfProp(AbstractChannel).required,
    mode: instanceOfProp(Mode).required,
    appendToHeading: stringProp().optional
  },
  emits: {
    "help-wanted-clicked": (payload) => true
  },
  data() {
    return {
      CoarseChannel,
      FineChannel,
      SwitchingChannel,
      fixture: this.mode.fixture
    };
  },
  computed: {
    channelKey() {
      if (this.channel instanceof NullChannel) {
        return "null";
      }
      if (this.channel.key !== this.channel.name) {
        return this.channel.key;
      }
      return "";
    },
    resolutionInMode() {
      return this.channel.getResolutionInMode(this.mode);
    }
  }
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ConditionalDetails = __nuxt_component_3;
  const _component_ChannelTypeIcon = __nuxt_component_1;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_LabeledValue = __nuxt_component_1$2;
  const _component_FixturePageChannel = __nuxt_component_2;
  const _component_FixturePageCapabilityTable = __nuxt_component_5$1;
  _push(`<li${ssrRenderAttrs(_attrs)} data-v-6544d596>`);
  _push(ssrRenderComponent(_component_ConditionalDetails, { class: "channel" }, {
    summary: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_ChannelTypeIcon, {
          class: "channel-type-icon",
          channel: $props.channel
        }, null, _parent2, _scopeId));
        _push2(`${ssrInterpolate($props.channel.name)}`);
        if ($options.channelKey) {
          _push2(`<code class="channel-key" data-v-6544d596${_scopeId}>${ssrInterpolate($options.channelKey)}</code>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`${ssrInterpolate($props.appendToHeading ? ` ${$props.appendToHeading}` : ``)} `);
        if ($props.channel.isHelpWanted) {
          _push2(ssrRenderComponent(_component_OflSvg, {
            class: "help-wanted-icon",
            name: "comment-question-outline",
            title: "Help wanted!"
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          createVNode(_component_ChannelTypeIcon, {
            class: "channel-type-icon",
            channel: $props.channel
          }, null, 8, ["channel"]),
          createTextVNode(toDisplayString($props.channel.name), 1),
          $options.channelKey ? (openBlock(), createBlock("code", {
            key: 0,
            class: "channel-key"
          }, toDisplayString($options.channelKey), 1)) : createCommentVNode("", true),
          createTextVNode(toDisplayString($props.appendToHeading ? ` ${$props.appendToHeading}` : ``) + " ", 1),
          $props.channel.isHelpWanted ? (openBlock(), createBlock(_component_OflSvg, {
            key: 1,
            class: "help-wanted-icon",
            name: "comment-question-outline",
            title: "Help wanted!"
          })) : createCommentVNode("", true)
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
        if ($props.channel instanceof $data.FineChannel) {
          _push2(`<div data-v-6544d596${_scopeId}> Fine channel of ${ssrInterpolate($props.channel.coarseChannel.name)} (channel ${ssrInterpolate($props.mode.getChannelIndex($props.channel.coarseChannel.key) + 1)}) </div>`);
        } else if ($props.channel instanceof $data.SwitchingChannel) {
          _push2(`<!--[--><span data-v-6544d596${_scopeId}>Switches depending on trigger channel&#39;s value.</span>`);
          _push2(ssrRenderComponent(_component_LabeledValue, {
            name: "switchingChannel-triggerChannel",
            label: "Trigger channel"
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(`${ssrInterpolate($props.channel.triggerChannel.name)} (channel ${ssrInterpolate($props.mode.getChannelIndex($props.channel.triggerChannel.key) + 1)}) `);
              } else {
                return [
                  createTextVNode(toDisplayString($props.channel.triggerChannel.name) + " (channel " + toDisplayString($props.mode.getChannelIndex($props.channel.triggerChannel.key) + 1) + ") ", 1)
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
          _push2(`<ol data-v-6544d596${_scopeId}><!--[-->`);
          ssrRenderList($props.channel.triggerRanges, (ranges, switchToChannelKey) => {
            _push2(ssrRenderComponent(_component_FixturePageChannel, {
              key: switchToChannelKey,
              channel: $data.fixture.getChannelByKey(switchToChannelKey),
              mode: $props.mode,
              "append-to-heading": $props.channel.defaultChannel.key === switchToChannelKey ? `(default)` : null,
              onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_LabeledValue, {
                    name: "switchingChannel-triggerRanges",
                    label: "Activated when"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Trigger channel is set to <!--[-->`);
                        ssrRenderList(ranges, (range, index) => {
                          _push4(`<!--[-->${ssrInterpolate(index > 0 ? ` or ` : ``)} <span style="${ssrRenderStyle({ "white-space": "nowrap" })}" data-v-6544d596${_scopeId3}>${ssrInterpolate(range.toString())}</span><!--]-->`);
                        });
                        _push4(`<!--]-->`);
                      } else {
                        return [
                          createTextVNode(" Trigger channel is set to "),
                          (openBlock(true), createBlock(Fragment, null, renderList(ranges, (range, index) => {
                            return openBlock(), createBlock(Fragment, {
                              key: range.toString()
                            }, [
                              createTextVNode(toDisplayString(index > 0 ? ` or ` : ``) + " ", 1),
                              createVNode("span", { style: { "white-space": "nowrap" } }, toDisplayString(range.toString()), 1)
                            ], 64);
                          }), 128))
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_LabeledValue, {
                      name: "switchingChannel-triggerRanges",
                      label: "Activated when"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Trigger channel is set to "),
                        (openBlock(true), createBlock(Fragment, null, renderList(ranges, (range, index) => {
                          return openBlock(), createBlock(Fragment, {
                            key: range.toString()
                          }, [
                            createTextVNode(toDisplayString(index > 0 ? ` or ` : ``) + " ", 1),
                            createVNode("span", { style: { "white-space": "nowrap" } }, toDisplayString(range.toString()), 1)
                          ], 64);
                        }), 128))
                      ]),
                      _: 2
                    }, 1024)
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          });
          _push2(`<!--]--></ol><!--]-->`);
        } else {
          _push2(`<!---->`);
        }
        if ($props.channel.pixelKey !== null && !($props.channel instanceof $data.SwitchingChannel)) {
          _push2(`<!--[-->`);
          if ($data.fixture.matrix.pixelGroupKeys.includes($props.channel.pixelKey)) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "pixel-group",
              value: `${$props.channel.pixelKey}`,
              name: "channel-pixel-group",
              label: "Pixel group"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!--[-->`);
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "pixel",
              value: `${$props.channel.pixelKey}`,
              name: "channel-pixel-key",
              label: "Pixel"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "pixel-position",
              name: "channel-pixel-position",
              label: "Pixel position"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` (${ssrInterpolate($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][0])}, ${ssrInterpolate($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][1])}, ${ssrInterpolate($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][2])}) <span class="hint" data-v-6544d596${_scopeId2}>(X, Y, Z)</span>`);
                } else {
                  return [
                    createTextVNode(" (" + toDisplayString($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][0]) + ", " + toDisplayString($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][1]) + ", " + toDisplayString($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][2]) + ") ", 1),
                    createVNode("span", { class: "hint" }, "(X, Y, Z)")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<!--]-->`);
          }
          _push2(`<!--]-->`);
        } else {
          _push2(`<!---->`);
        }
        if ($props.channel instanceof $data.CoarseChannel) {
          _push2(`<!--[-->`);
          if ($options.resolutionInMode > $data.CoarseChannel.RESOLUTION_8BIT) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "fine-channels",
              name: "channel-fineChannelAliases",
              label: "Fine channels"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate($props.channel.fineChannels.slice(0, $options.resolutionInMode - 1).map(
                    (fineChannel) => `${fineChannel.name} (channel ${$props.mode.getChannelIndex(fineChannel.key) + 1})`
                  ).join(`, `))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString($props.channel.fineChannels.slice(0, $options.resolutionInMode - 1).map(
                      (fineChannel) => `${fineChannel.name} (channel ${$props.mode.getChannelIndex(fineChannel.key) + 1})`
                    ).join(`, `)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.channel.hasDefaultValue) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "default-value",
              value: `${$props.channel.getDefaultValueWithResolution($options.resolutionInMode)}`,
              name: "channel-defaultValue",
              label: "Default DMX value"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.channel.hasHighlightValue) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "highlight-value",
              value: `${$props.channel.getHighlightValueWithResolution($options.resolutionInMode)}`,
              name: "channel-highlightValue",
              label: "Highlight DMX value"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.channel.isInverted) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "is-inverted",
              name: "channel-isInverted",
              label: "Is inverted?",
              value: "Yes"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.channel.isConstant) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "is-constant",
              name: "channel-isConstant",
              label: "Is constant?",
              value: "Yes"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.channel.canCrossfade) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "can-crossfade",
              name: "channel-canCrossfade",
              label: "Can crossfade?",
              value: "Yes"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.channel.precedence !== `LTP`) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "precedence",
              value: $props.channel.precedence,
              name: "channel-precedence",
              label: "Precedence"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          _push2(ssrRenderComponent(_component_FixturePageCapabilityTable, {
            channel: $props.channel,
            mode: $props.mode,
            "resolution-in-mode": $options.resolutionInMode,
            onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
          }, null, _parent2, _scopeId));
          _push2(`<!--]-->`);
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          renderSlot(_ctx.$slots, "default", {}, void 0, true),
          $props.channel instanceof $data.FineChannel ? (openBlock(), createBlock("div", { key: 0 }, " Fine channel of " + toDisplayString($props.channel.coarseChannel.name) + " (channel " + toDisplayString($props.mode.getChannelIndex($props.channel.coarseChannel.key) + 1) + ") ", 1)) : $props.channel instanceof $data.SwitchingChannel ? (openBlock(), createBlock(Fragment, { key: 1 }, [
            createVNode("span", null, "Switches depending on trigger channel's value."),
            createVNode(_component_LabeledValue, {
              name: "switchingChannel-triggerChannel",
              label: "Trigger channel"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString($props.channel.triggerChannel.name) + " (channel " + toDisplayString($props.mode.getChannelIndex($props.channel.triggerChannel.key) + 1) + ") ", 1)
              ]),
              _: 1
            }),
            createVNode("ol", null, [
              (openBlock(true), createBlock(Fragment, null, renderList($props.channel.triggerRanges, (ranges, switchToChannelKey) => {
                return openBlock(), createBlock(_component_FixturePageChannel, {
                  key: switchToChannelKey,
                  channel: $data.fixture.getChannelByKey(switchToChannelKey),
                  mode: $props.mode,
                  "append-to-heading": $props.channel.defaultChannel.key === switchToChannelKey ? `(default)` : null,
                  onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
                }, {
                  default: withCtx(() => [
                    createVNode(_component_LabeledValue, {
                      name: "switchingChannel-triggerRanges",
                      label: "Activated when"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Trigger channel is set to "),
                        (openBlock(true), createBlock(Fragment, null, renderList(ranges, (range, index) => {
                          return openBlock(), createBlock(Fragment, {
                            key: range.toString()
                          }, [
                            createTextVNode(toDisplayString(index > 0 ? ` or ` : ``) + " ", 1),
                            createVNode("span", { style: { "white-space": "nowrap" } }, toDisplayString(range.toString()), 1)
                          ], 64);
                        }), 128))
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  _: 2
                }, 1032, ["channel", "mode", "append-to-heading", "onHelpWantedClicked"]);
              }), 128))
            ])
          ], 64)) : createCommentVNode("", true),
          $props.channel.pixelKey !== null && !($props.channel instanceof $data.SwitchingChannel) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
            $data.fixture.matrix.pixelGroupKeys.includes($props.channel.pixelKey) ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "pixel-group",
              value: `${$props.channel.pixelKey}`,
              name: "channel-pixel-group",
              label: "Pixel group"
            }, null, 8, ["value"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
              createVNode(_component_LabeledValue, {
                key: "pixel",
                value: `${$props.channel.pixelKey}`,
                name: "channel-pixel-key",
                label: "Pixel"
              }, null, 8, ["value"]),
              createVNode(_component_LabeledValue, {
                key: "pixel-position",
                name: "channel-pixel-position",
                label: "Pixel position"
              }, {
                default: withCtx(() => [
                  createTextVNode(" (" + toDisplayString($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][0]) + ", " + toDisplayString($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][1]) + ", " + toDisplayString($data.fixture.matrix.pixelKeyPositions[$props.channel.pixelKey][2]) + ") ", 1),
                  createVNode("span", { class: "hint" }, "(X, Y, Z)")
                ]),
                _: 1
              })
            ], 64))
          ], 64)) : createCommentVNode("", true),
          $props.channel instanceof $data.CoarseChannel ? (openBlock(), createBlock(Fragment, { key: 3 }, [
            $options.resolutionInMode > $data.CoarseChannel.RESOLUTION_8BIT ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "fine-channels",
              name: "channel-fineChannelAliases",
              label: "Fine channels"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString($props.channel.fineChannels.slice(0, $options.resolutionInMode - 1).map(
                  (fineChannel) => `${fineChannel.name} (channel ${$props.mode.getChannelIndex(fineChannel.key) + 1})`
                ).join(`, `)), 1)
              ]),
              _: 1
            })) : createCommentVNode("", true),
            $props.channel.hasDefaultValue ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "default-value",
              value: `${$props.channel.getDefaultValueWithResolution($options.resolutionInMode)}`,
              name: "channel-defaultValue",
              label: "Default DMX value"
            }, null, 8, ["value"])) : createCommentVNode("", true),
            $props.channel.hasHighlightValue ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "highlight-value",
              value: `${$props.channel.getHighlightValueWithResolution($options.resolutionInMode)}`,
              name: "channel-highlightValue",
              label: "Highlight DMX value"
            }, null, 8, ["value"])) : createCommentVNode("", true),
            $props.channel.isInverted ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "is-inverted",
              name: "channel-isInverted",
              label: "Is inverted?",
              value: "Yes"
            })) : createCommentVNode("", true),
            $props.channel.isConstant ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "is-constant",
              name: "channel-isConstant",
              label: "Is constant?",
              value: "Yes"
            })) : createCommentVNode("", true),
            $props.channel.canCrossfade ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "can-crossfade",
              name: "channel-canCrossfade",
              label: "Can crossfade?",
              value: "Yes"
            })) : createCommentVNode("", true),
            $props.channel.precedence !== `LTP` ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "precedence",
              value: $props.channel.precedence,
              name: "channel-precedence",
              label: "Precedence"
            }, null, 8, ["value"])) : createCommentVNode("", true),
            createVNode(_component_FixturePageCapabilityTable, {
              channel: $props.channel,
              mode: $props.mode,
              "resolution-in-mode": $options.resolutionInMode,
              onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
            }, null, 8, ["channel", "mode", "resolution-in-mode", "onHelpWantedClicked"])
          ], 64)) : createCommentVNode("", true)
        ];
      }
    }),
    _: 3
  }, _parent));
  _push(`</li>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePageChannel.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-6544d596"]]), { __name: "FixturePageChannel" });
const _sfc_main$1 = {
  components: {
    FixturePageChannel: __nuxt_component_2,
    FixturePagePhysical: __nuxt_component_5$2
  },
  props: {
    mode: instanceOfProp(Mode).required
  },
  emits: {
    "help-wanted-clicked": (payload) => true
  },
  data() {
    return {
      hasDetails: true
    };
  },
  computed: {
    showCollapseExpandButtons() {
      return this.mode.channels.length > 1 && this.hasDetails;
    }
  },
  async mounted() {
    await this.$nextTick();
    if (!this.$el.querySelector("details")) {
      this.hasDetails = false;
    }
  },
  methods: {
    openDetails() {
      for (const details of this.$el.querySelectorAll("details")) {
        details.open = true;
      }
    },
    closeDetails() {
      for (const details of this.$el.querySelectorAll("details")) {
        details.open = false;
      }
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_FixturePagePhysical = __nuxt_component_5$2;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_FixturePageChannel = __nuxt_component_2;
  _push(`<section${ssrRenderAttrs(mergeProps({
    id: $props.mode.rdmPersonalityIndex === null ? null : `rdm-personality-${$props.mode.rdmPersonalityIndex}`,
    class: "fixture-mode card"
  }, _attrs))} data-v-dd93704e><h2 data-v-dd93704e>${ssrInterpolate($props.mode.name)} mode `);
  if ($props.mode.hasShortName) {
    _push(`<code data-v-dd93704e>${ssrInterpolate($props.mode.shortName)}</code>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</h2>`);
  if ($props.mode.rdmPersonalityIndex !== null) {
    _push(`<span class="hint" data-v-dd93704e>RDM personality index: ${ssrInterpolate($props.mode.rdmPersonalityIndex)}</span>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.mode.physicalOverride !== null) {
    _push(`<!--[--><h3 data-v-dd93704e>Physical overrides</h3><section class="physical physical-override" data-v-dd93704e>`);
    _push(ssrRenderComponent(_component_FixturePagePhysical, {
      physical: $props.mode.physicalOverride
    }, null, _parent));
    _push(`</section><!--]-->`);
  } else {
    _push(`<!---->`);
  }
  _push(`<h3 data-v-dd93704e>DMX channels`);
  if ($options.showCollapseExpandButtons) {
    _push(`<!--[--><button type="button" class="icon-button expand-all only-js" title="Expand all channels" data-v-dd93704e>`);
    _push(ssrRenderComponent(_component_OflSvg, { name: "chevron-double-down" }, null, _parent));
    _push(`</button><button type="button" class="icon-button collapse-all only-js" title="Collapse all channels" data-v-dd93704e>`);
    _push(ssrRenderComponent(_component_OflSvg, { name: "chevron-double-up" }, null, _parent));
    _push(`</button><!--]-->`);
  } else {
    _push(`<!---->`);
  }
  _push(`</h3><ol class="mode-channels" data-v-dd93704e><!--[-->`);
  ssrRenderList($props.mode.channels, (channel) => {
    _push(ssrRenderComponent(_component_FixturePageChannel, {
      key: channel.key,
      channel,
      mode: $props.mode,
      onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
    }, null, _parent));
  });
  _push(`<!--]--></ol></section>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePageMode.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_8 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-dd93704e"]]), { __name: "FixturePageMode" });
class Meta {
  /**
   * Creates a new Meta instance.
   * @param {object} jsonObject A meta object from the fixture's JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {string[]} Names of people who contributed to this fixture.
   */
  get authors() {
    return this._jsonObject.authors;
  }
  /**
   * @returns {Date} When this fixture was created. Might not refer to the creation in OFL, but in the lighting software from which this fixture was imported.
   */
  get createDate() {
    return new Date(this._jsonObject.createDate);
  }
  /**
   * @returns {Date} When this fixture was changed the last time. Might not refer to a modification in OFL, but in the lighting software from which this fixture was imported.
   */
  get lastModifyDate() {
    return new Date(this._jsonObject.lastModifyDate);
  }
  /**
   * @returns {string | null} The key of the plugin with which this fixture was imported. Null if it's not imported.
   */
  get importPlugin() {
    return "importPlugin" in this._jsonObject ? this._jsonObject.importPlugin.plugin : null;
  }
  /**
   * @returns {Date | null} When this fixture was imported. Null if it's not imported.
   */
  get importDate() {
    return "importPlugin" in this._jsonObject ? new Date(this._jsonObject.importPlugin.date) : null;
  }
  /**
   * @returns {string | null} A comment further describing the import process. Null if it's not imported.
   */
  get importComment() {
    return "importPlugin" in this._jsonObject ? this._jsonObject.importPlugin.comment || "" : null;
  }
  /**
   * @returns {boolean} Whether there is an import comment. Always false if it's not imported.
   */
  get hasImportComment() {
    return this.importPlugin !== null && "comment" in this._jsonObject.importPlugin;
  }
}
class Fixture {
  /**
   * Create a new Fixture instance.
   * @param {Manufacturer} manufacturer A Manufacturer instance.
   * @param {string} key The fixture's unique key. Equals to filename without '.json'.
   * @param {object} jsonObject The fixture's parsed JSON data.
   */
  constructor(manufacturer, key, jsonObject) {
    this._manufacturer = manufacturer;
    this._key = key;
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {Manufacturer} The fixture's manufacturer.
   */
  get manufacturer() {
    return this._manufacturer;
  }
  /**
   * @returns {string} The fixture's unique key. Equals to filename without '.json'.
   */
  get key() {
    return this._key;
  }
  /**
   * @returns {object} The fixture's parsed JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {string} An URL pointing to the fixture's page on the Open Fixture Library website.
   */
  get url() {
    const websiteUrl = process.env.WEBSITE_URL || "https://open-fixture-library.org/";
    return `${websiteUrl}${this.manufacturer.key}/${this.key}`;
  }
  /**
   * @returns {string} The fixture's product name.
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {boolean} Whether a short name is defined for this fixture.
   */
  get hasShortName() {
    return "shortName" in this._jsonObject;
  }
  /**
   * @returns {string} A globally unique and as short as possible product name, defaults to name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }
  /**
   * @returns {string[]} The fixture's categories with the most applicable one first.
   */
  get categories() {
    return this._jsonObject.categories;
  }
  /**
   * @returns {string} The fixture's most applicable category. Equals to first item of categories.
   */
  get mainCategory() {
    return this.categories[0];
  }
  /**
   * @returns {Meta} A Meta instance providing information like author or create date.
   */
  get meta() {
    return cacheResult(this, "meta", new Meta(this._jsonObject.meta));
  }
  /**
   * @returns {boolean} Whether a comment is defined for this fixture.
   */
  get hasComment() {
    return "comment" in this._jsonObject;
  }
  /**
   * @returns {string} A comment about the fixture (often a note about an incorrectness in the manual). Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || "";
  }
  /**
   * @returns {string | null} A string describing the help that is needed for this fixture, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }
  /**
   * @returns {boolean} True if help is needed in this fixture (maybe in a capability), false otherwise.
   */
  get isHelpWanted() {
    return this.helpWanted !== null || this.isCapabilityHelpWanted;
  }
  /**
   * @returns {boolean} True if help is needed in a capability, false otherwise.
   */
  get isCapabilityHelpWanted() {
    return cacheResult(this, "isCapabilityHelpWanted", this.allChannels.some(
      (channel) => channel.isHelpWanted
    ));
  }
  /**
   * @returns {Record<string, string[]> | null} An object with URL arrays, organized by link type, or null if no links are available for this fixture.
   */
  get links() {
    return this._jsonObject.links || null;
  }
  /**
   * @param {string} type The type of the links that should be returned.
   * @returns {string[]} An array of URLs of the specified type (may be empty).
   */
  getLinksOfType(type2) {
    if (this.links === null) {
      return [];
    }
    return this.links[type2] || [];
  }
  /**
   * @returns {object | null} Information about the RDM functionality of this fixture. Defaults to null.
   * @property {number} modelId The RDM model/product id of the fixture, given in decimal format.
   * @property {string | null} softwareVersion The software version used as reference in this fixture definition.
   */
  get rdm() {
    return this._jsonObject.rdm || null;
  }
  /**
   * @returns {Physical | null} The general physical information for the fixture, may be overridden by modes.
   */
  get physical() {
    if ("physical" in this._jsonObject) {
      return cacheResult(this, "physical", new Physical(this._jsonObject.physical));
    }
    return cacheResult(this, "physical", null);
  }
  /**
   * @returns {Matrix | null} The matrix information for this fixture.
   */
  get matrix() {
    if ("matrix" in this._jsonObject) {
      return cacheResult(this, "matrix", new Matrix(this._jsonObject.matrix));
    }
    return cacheResult(this, "matrix", null);
  }
  /**
   * @returns {Wheel[]} The fixture's wheels as {@link Wheel} instances.
   */
  get wheels() {
    const wheels = Object.entries(this._jsonObject.wheels || {}).map(
      ([wheelName, wheelJson]) => new Wheel(wheelName, wheelJson)
    );
    return cacheResult(this, "wheels", wheels);
  }
  /**
   * @private
   * @returns {Record<string, Wheel>} This fixture's wheel names pointing to the respective Wheel instance.
   */
  get _wheelByName() {
    return cacheResult(this, "_wheelByName", Object.fromEntries(
      this.wheels.map((wheel) => [wheel.name, wheel])
    ));
  }
  /**
   * @param {string} wheelName The name of the wheel.
   * @returns {Wheel | null} The wheel with the given name, or null if no wheel with the given name exists.
   */
  getWheelByName(wheelName) {
    return this._wheelByName[wheelName] || null;
  }
  /**
   * @returns {Record<string, string>} Channel keys from {@link Fixture#allChannelKeys} pointing to unique versions of their channel names.
   */
  get uniqueChannelNames() {
    const uniqueChannelNames = {};
    const names = this.allChannels.map((channel) => channel.name);
    for (let index = 0; index < names.length; index++) {
      const originalName = names[index];
      let duplicates = 1;
      while (names.indexOf(names[index]) !== index) {
        duplicates++;
        names[index] = `${originalName} ${duplicates}`;
      }
      uniqueChannelNames[this.allChannelKeys[index]] = names[index];
    }
    return cacheResult(this, "uniqueChannelNames", uniqueChannelNames);
  }
  /**
   * @returns {string[]} Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.
   */
  get availableChannelKeys() {
    return cacheResult(this, "availableChannelKeys", Object.keys(this._jsonObject.availableChannels || {}));
  }
  /**
   * @returns {CoarseChannel[]} Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.
   */
  get availableChannels() {
    return cacheResult(this, "availableChannels", this.availableChannelKeys.map(
      (channelKey) => new CoarseChannel(channelKey, this._jsonObject.availableChannels[channelKey], this)
    ));
  }
  /**
   * @returns {string[]} Coarse channels' keys, including matrix channels' keys. If possible, ordered by appearance.
   */
  get coarseChannelKeys() {
    return cacheResult(this, "coarseChannelKeys", this.coarseChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {CoarseChannel[]} Coarse channels, including matrix channels. If possible, ordered by appearance.
   */
  get coarseChannels() {
    return cacheResult(this, "coarseChannels", this.allChannels.filter(
      (channel) => channel instanceof CoarseChannel
    ));
  }
  /**
   * @returns {string[]} All fine channels' aliases, including matrix fine channels' aliases. If possible, ordered by appearance.
   */
  get fineChannelAliases() {
    return cacheResult(this, "fineChannelAliases", this.fineChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {FineChannel[]} All fine channels, including matrix fine channels. If possible, ordered by appearance.
   */
  get fineChannels() {
    return cacheResult(this, "fineChannels", this.allChannels.filter(
      (channel) => channel instanceof FineChannel
    ));
  }
  /**
   * @returns {string[]} All switching channels' aliases, including matrix switching channels' aliases. If possible, ordered by appearance.
   */
  get switchingChannelAliases() {
    return cacheResult(this, "switchingChannelAliases", this.switchingChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {SwitchingChannel[]} All switching channels, including matrix switching channels. If possible, ordered by appearance.
   */
  get switchingChannels() {
    return cacheResult(this, "switchingChannels", this.allChannels.filter(
      (channel) => channel instanceof SwitchingChannel
    ));
  }
  /**
   * Template channels are used to automatically generate channels.
   * @returns {string[]} All template channel keys from the fixture definition's `templateChannels` section. Ordered by appearance.
   */
  get templateChannelKeys() {
    return Object.keys(this._jsonObject.templateChannels || {});
  }
  /**
   * Template channels are used to automatically generate channels.
   * @returns {TemplateChannel[]} TemplateChannel instances for all template channels from the fixture definition's `templateChannels` section. Ordered by appearance.
   */
  get templateChannels() {
    return cacheResult(this, "templateChannels", this.templateChannelKeys.map(
      (key) => new TemplateChannel(key, this._jsonObject.templateChannels[key], this)
    ));
  }
  /**
   * @private
   * @returns {Record<string, TemplateChannel>} This fixture's template channel keys pointing to the respective template channel.
   */
  get _templateChannelByKey() {
    return cacheResult(this, "_templateChannelByKey", Object.fromEntries(
      this.templateChannels.map((channel) => [channel.key, channel])
    ));
  }
  /**
   * Searches the template channel with the given key. Fine and switching template channel aliases *can't* be found.
   * @param {string} channelKey The template channel's key
   * @returns {TemplateChannel | null} The corresponding template channel.
   */
  getTemplateChannelByKey(channelKey) {
    return this._templateChannelByKey[channelKey] || null;
  }
  /**
   * @returns {string[]} Keys of all resolved matrix channels.
   */
  get matrixChannelKeys() {
    return cacheResult(this, "matrixChannelKeys", this.matrixChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {AbstractChannel[]} All (resolved) channels with `pixelKey` information (including fine and switching channels).
   */
  get matrixChannels() {
    if (this.matrix === null) {
      return cacheResult(this, "matrixChannels", []);
    }
    return cacheResult(this, "matrixChannels", this.allChannels.filter(
      (channel) => channel.pixelKey !== null
    ));
  }
  /**
   * @returns {string[]} All null channels' keys.
   */
  get nullChannelKeys() {
    return this.nullChannels.map((channel) => channel.key);
  }
  /**
   * @returns {NullChannel[]} Automatically generated null channels.
   */
  get nullChannels() {
    const maxNullPerMode = Math.max(...this.modes.map((mode) => mode.nullChannelCount));
    const nullChannels = Array.from({ length: maxNullPerMode }, () => new NullChannel(this));
    return cacheResult(this, "nullChannels", nullChannels);
  }
  /**
   * @returns {string[]} All channel keys used in this fixture, including resolved matrix channels' keys. If possible, ordered by appearance.
   */
  get allChannelKeys() {
    return cacheResult(this, "allChannelKeys", Object.keys(this.allChannelsByKey));
  }
  /**
   * @returns {AbstractChannel[]} All channels used in this fixture, including resolved matrix channels. If possible, ordered by appearance.
   */
  get allChannels() {
    return cacheResult(this, "allChannels", Object.values(this.allChannelsByKey));
  }
  /**
   * @returns {Record<string, AbstractChannel>} All channel keys used in this fixture pointing to the respective channel, including matrix channels. If possible, ordered by appearance.
   */
  get allChannelsByKey() {
    const allChannels = [
      ...this.availableChannels.flatMap((mainChannel) => [
        mainChannel,
        ...mainChannel.fineChannels,
        ...mainChannel.switchingChannels
      ]),
      ...this.nullChannels
    ];
    const allChannelsByKey = Object.fromEntries(
      allChannels.map((channel) => [channel.key, channel])
    );
    const allMatrixChannelsByKey = Object.fromEntries(
      this.templateChannels.flatMap((templateChannel) => templateChannel.createMatrixChannels()).map((matrixChannel) => [matrixChannel.key, matrixChannel])
    );
    for (let matrixChannel of Object.values(allMatrixChannelsByKey)) {
      if (matrixChannel.key in allChannelsByKey) {
        const overrideChannel = allChannelsByKey[matrixChannel.key];
        overrideChannel.pixelKey = matrixChannel.pixelKey;
        delete allChannelsByKey[matrixChannel.key];
        matrixChannel = overrideChannel;
      }
      const matrixChannelUsed = this.modes.some(
        (mode) => mode.channelKeys.some((channelKey) => {
          if (matrixChannel.key === channelKey) {
            return true;
          }
          const otherChannel = allChannelsByKey[channelKey] || allMatrixChannelsByKey[channelKey];
          return otherChannel instanceof SwitchingChannel && otherChannel.switchToChannelKeys.includes(matrixChannel.key);
        })
      );
      if (matrixChannelUsed) {
        allChannelsByKey[matrixChannel.key] = matrixChannel;
      }
    }
    return cacheResult(this, "allChannelsByKey", allChannelsByKey);
  }
  /**
   * @param {string} key The channel's key.
   * @returns {AbstractChannel | null} The found channel, null if not found.
   */
  getChannelByKey(key) {
    return this.allChannelsByKey[key] || null;
  }
  /**
   * @returns {Capability[]} All available channels' and template channels' capabilities.
   */
  get capabilities() {
    const channels = [...this.availableChannels, ...this.templateChannels];
    const capabilities = channels.flatMap((channel) => channel.capabilities);
    return cacheResult(this, "capabilities", capabilities);
  }
  /**
   * @returns {Mode[]} The fixture's modes.
   */
  get modes() {
    return cacheResult(this, "modes", this._jsonObject.modes.map(
      (jsonMode) => new Mode(jsonMode, this)
    ));
  }
}
const VIDEOS_TO_EMBED = 2;
const _sfc_main = {
  components: {
    CategoryBadge: __nuxt_component_1$1,
    EmbettyVideo: __nuxt_component_2$1,
    FixturePageMatrix: __nuxt_component_6,
    FixturePageMode: __nuxt_component_8,
    FixturePagePhysical: __nuxt_component_5$2,
    FixturePageWheel: __nuxt_component_7,
    HelpWantedMessage: __nuxt_component_0$1,
    LabeledValue: __nuxt_component_1$2
  },
  props: {
    fixture: instanceOfProp(Fixture).required,
    loadAllModes: booleanProp().withDefault(false)
  },
  emits: {
    "help-wanted-clicked": (payload) => true
  },
  data() {
    const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;
    return {
      manufacturerColor: register.colors[this.fixture.manufacturer.key] || null,
      isBrowser: false,
      modeNumberLoadLimit: this.loadAllModes ? void 0 : 5,
      // initially displayed modes, if limited
      modeNumberLoadThreshold: 15,
      // fixtures with more modes will be limited
      modeNumberLoadIncrement: 10,
      // how many modes a button click will load
      linkTypeIconNames,
      linkTypeNames
    };
  },
  computed: {
    modesLimited() {
      return this.fixture.modes.length > this.modeNumberLoadThreshold;
    },
    modes() {
      const modes = this.fixture.modes;
      if (!this.modesLimited) {
        return modes;
      }
      return modes.slice(0, this.modeNumberLoadLimit);
    },
    /**
     * @returns {object[]} Array of videos that can be embetted.
     */
    videos() {
      const videoUrls = this.fixture.getLinksOfType("video");
      const embettableVideoData = [];
      for (const url of videoUrls) {
        if (embettableVideoData.length === VIDEOS_TO_EMBED) {
          break;
        }
        const videoData = getEmbettableVideoData(url);
        if (videoData !== null) {
          embettableVideoData.push(videoData);
        }
      }
      return embettableVideoData;
    },
    links() {
      const links = [];
      for (const linkType of Object.keys(linksProperties)) {
        let linkDisplayNumber = 1;
        let linksOfType = this.fixture.getLinksOfType(linkType);
        if (linkType === "video") {
          linksOfType = linksOfType.filter(
            (url) => !this.videos.some((video) => video.url === url)
          );
          linkDisplayNumber += this.videos.length;
        }
        for (const url of linksOfType) {
          let name = this.linkTypeNames[linkType];
          const title = `${name} at ${url}`;
          if (linkType === "other") {
            name = url;
          } else if (linkDisplayNumber > 1) {
            name += ` ${linkDisplayNumber}`;
          }
          links.push({
            url,
            name,
            title,
            type: linkType,
            iconName: this.linkTypeIconNames[linkType],
            hostname: getHostname(url)
          });
          linkDisplayNumber++;
        }
      }
      return links;
    }
  },
  mounted() {
    this.isBrowser = true;
  }
};
const supportedVideoFormats = {
  native: {
    regex: /\.(?:mp4|avi)$/,
    displayType: (url) => getHostname(url),
    videoId: (url, match) => url,
    startAt: (url, match) => 0
  },
  youtube: {
    /**
     * YouTube videos can be in the following format:
     * - https://www.youtube.com/watch?v={videoId}&otherParameters
     */
    regex: /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]+)(?:&t=([\dhms]+)|)/,
    displayType: (url) => "YouTube",
    videoId: (url, match) => match[1],
    startAt: (url, match) => match[2] || 0
  },
  vimeo: {
    /**
     * Vimeo videos can be in one of the following formats:
     * - https://vimeo.com/{videoId}
     * - https://vimeo.com/channels/{channelName}/{videoId}
     * - https://vimeo.com/groups/{groupId}/videos/{videoId}
     */
    regex: /^https:\/\/vimeo.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:#t=([\dhms]+))?/,
    displayType: (url) => "Vimeo",
    videoId: (url, match) => match[1],
    startAt: (url, match) => match[2] || 0
  },
  facebook: {
    /**
     * Facebook videos can be in the following format:
     * - https://www.facebook.com/{pageName}/videos/{videoTitle}/{videoId}/
     */
    regex: /^https:\/\/www\.facebook\.com\/[^/]+\/videos\/[^/]+\/(\d+)\/$/,
    displayType: (url) => "Facebook",
    videoId: (url, match) => match[1],
    startAt: (url, match) => 0
  }
};
function getEmbettableVideoData(url) {
  const videoTypes = Object.keys(supportedVideoFormats);
  for (const type2 of videoTypes) {
    const format = supportedVideoFormats[type2];
    const match = url.match(format.regex);
    if (match) {
      return {
        url,
        type: type2,
        displayType: format.displayType(url),
        videoId: format.videoId(url, match),
        startAt: format.startAt(url, match)
      };
    }
  }
  return null;
}
function getHostname(url) {
  const match = url.match(/^.*?\/\/([^#/:?]*)(?::(\d+)|)/);
  return match ? match[1] : url;
}
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledValue = __nuxt_component_1$2;
  const _component_CategoryBadge = __nuxt_component_1$1;
  const _component_EmbettyVideo = __nuxt_component_2$1;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_HelpWantedMessage = __nuxt_component_0$1;
  const _component_FixturePagePhysical = __nuxt_component_5$2;
  const _component_FixturePageMatrix = __nuxt_component_6;
  const _component_FixturePageWheel = __nuxt_component_7;
  const _component_FixturePageMode = __nuxt_component_8;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-7908d273><section style="${ssrRenderStyle({ borderTopColor: $data.manufacturerColor })}" class="fixture-info card" data-v-7908d273>`);
  _push(ssrRenderComponent(_component_LabeledValue, {
    name: "categories",
    label: "Categories"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<!--[-->`);
        ssrRenderList($props.fixture.categories, (cat) => {
          _push2(ssrRenderComponent(_component_CategoryBadge, {
            key: cat,
            category: cat
          }, null, _parent2, _scopeId));
        });
        _push2(`<!--]-->`);
      } else {
        return [
          (openBlock(true), createBlock(Fragment, null, renderList($props.fixture.categories, (cat) => {
            return openBlock(), createBlock(_component_CategoryBadge, {
              key: cat,
              category: cat
            }, null, 8, ["category"]);
          }), 128))
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.fixture.hasComment) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      key: "comment",
      value: $props.fixture.comment,
      name: "comment",
      label: "Comment"
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($options.videos) {
    _push(`<section class="fixture-videos" data-v-7908d273><!--[-->`);
    ssrRenderList($options.videos, (video) => {
      _push(`<div class="fixture-video" data-v-7908d273>`);
      _push(ssrRenderComponent(_component_EmbettyVideo, {
        type: video.type,
        "video-id": video.videoId,
        "start-at": video.startAt,
        "server-url": "https://embetty.open-fixture-library.org"
      }, null, _parent));
      _push(`<a${ssrRenderAttr("href", video.url)} target="_blank" rel="nofollow noopener" data-v-7908d273>`);
      _push(ssrRenderComponent(_component_OflSvg, { name: "youtube" }, null, _parent));
      _push(` Watch video at ${ssrInterpolate(video.displayType)}</a></div>`);
    });
    _push(`<!--]--></section>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.links.length > 0) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      key: "links",
      name: "links",
      label: "Relevant links"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<ul class="fixture-links" data-v-7908d273${_scopeId}><!--[-->`);
          ssrRenderList($options.links, (link) => {
            _push2(`<li class="${ssrRenderClass(`link-${link.type}`)}" data-v-7908d273${_scopeId}><a${ssrRenderAttr("href", link.url)}${ssrRenderAttr("title", link.title)} target="_blank" rel="nofollow noopener" data-v-7908d273${_scopeId}>`);
            _push2(ssrRenderComponent(_component_OflSvg, {
              name: link.iconName
            }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate(link.name)} `);
            if (link.type !== `other`) {
              _push2(`<span class="hostname" data-v-7908d273${_scopeId}>(${ssrInterpolate(link.hostname)})</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</a></li>`);
          });
          _push2(`<!--]--></ul>`);
        } else {
          return [
            createVNode("ul", { class: "fixture-links" }, [
              (openBlock(true), createBlock(Fragment, null, renderList($options.links, (link) => {
                return openBlock(), createBlock("li", {
                  key: `${link.type}-${link.url}`,
                  class: `link-${link.type}`
                }, [
                  createVNode("a", {
                    href: link.url,
                    title: link.title,
                    target: "_blank",
                    rel: "nofollow noopener"
                  }, [
                    createVNode(_component_OflSvg, {
                      name: link.iconName
                    }, null, 8, ["name"]),
                    createTextVNode(" " + toDisplayString(link.name) + " ", 1),
                    link.type !== `other` ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "hostname"
                    }, "(" + toDisplayString(link.hostname) + ")", 1)) : createCommentVNode("", true)
                  ], 8, ["href", "title"])
                ], 2);
              }), 128))
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($props.fixture.isHelpWanted) {
    _push(ssrRenderComponent(_component_HelpWantedMessage, {
      type: "fixture",
      context: $props.fixture,
      onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($props.fixture.rdm !== null) {
    _push(ssrRenderComponent(_component_LabeledValue, {
      key: "rdm",
      name: "rdm"
    }, {
      label: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<abbr title="Remote Device Management" data-v-7908d273${_scopeId}>RDM</abbr> data `);
        } else {
          return [
            createVNode("abbr", { title: "Remote Device Management" }, "RDM"),
            createTextVNode(" data ")
          ];
        }
      }),
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(` ${ssrInterpolate($props.fixture.manufacturer.rdmId)} (0x${ssrInterpolate($props.fixture.manufacturer.rdmId.toString(16))}) / ${ssrInterpolate($props.fixture.rdm.modelId)} (0x${ssrInterpolate($props.fixture.rdm.modelId.toString(16))}) / ${ssrInterpolate(`softwareVersion` in $props.fixture.rdm ? $props.fixture.rdm.softwareVersion : `?`)} – <a${ssrRenderAttr("href", `http://rdm.openlighting.org/model/display?manufacturer=${$props.fixture.manufacturer.rdmId}&model=${$props.fixture.rdm.modelId}`)} rel="nofollow" data-v-7908d273${_scopeId}>`);
          _push2(ssrRenderComponent(_component_OflSvg, { name: "ola" }, null, _parent2, _scopeId));
          _push2(` View in Open Lighting RDM database </a><span class="hint" data-v-7908d273${_scopeId}>manufacturer ID / model ID / software version</span>`);
        } else {
          return [
            createTextVNode(" " + toDisplayString($props.fixture.manufacturer.rdmId) + " (0x" + toDisplayString($props.fixture.manufacturer.rdmId.toString(16)) + ") / " + toDisplayString($props.fixture.rdm.modelId) + " (0x" + toDisplayString($props.fixture.rdm.modelId.toString(16)) + ") / " + toDisplayString(`softwareVersion` in $props.fixture.rdm ? $props.fixture.rdm.softwareVersion : `?`) + " – ", 1),
            createVNode("a", {
              href: `http://rdm.openlighting.org/model/display?manufacturer=${$props.fixture.manufacturer.rdmId}&model=${$props.fixture.rdm.modelId}`,
              rel: "nofollow"
            }, [
              createVNode(_component_OflSvg, { name: "ola" }),
              createTextVNode(" View in Open Lighting RDM database ")
            ], 8, ["href"]),
            createVNode("span", { class: "hint" }, "manufacturer ID / model ID / software version")
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($props.fixture.physical !== null) {
    _push(`<!--[--><h3 class="physical" data-v-7908d273>Physical data</h3><section class="physical" data-v-7908d273>`);
    _push(ssrRenderComponent(_component_FixturePagePhysical, {
      physical: $props.fixture.physical
    }, null, _parent));
    _push(`</section><!--]-->`);
  } else {
    _push(`<!---->`);
  }
  if ($props.fixture.matrix !== null) {
    _push(`<!--[--><h3 class="matrix" data-v-7908d273>Matrix</h3><section class="matrix" data-v-7908d273>`);
    _push(ssrRenderComponent(_component_FixturePageMatrix, {
      matrix: $props.fixture.matrix,
      physical: $props.fixture.physical
    }, null, _parent));
    _push(`</section><!--]-->`);
  } else {
    _push(`<!---->`);
  }
  if ($props.fixture.wheels.length > 0) {
    _push(`<!--[--><h3 class="wheels" data-v-7908d273>Wheels</h3><section class="wheels" data-v-7908d273><!--[-->`);
    ssrRenderList($props.fixture.wheels, (wheel) => {
      _push(ssrRenderComponent(_component_FixturePageWheel, {
        key: wheel.name,
        wheel
      }, null, _parent));
    });
    _push(`<!--]--></section><!--]-->`);
  } else {
    _push(`<!---->`);
  }
  _push(`</section><section class="fixture-modes" data-v-7908d273><!--[-->`);
  ssrRenderList($options.modes, (mode) => {
    _push(ssrRenderComponent(_component_FixturePageMode, {
      key: mode.name,
      mode,
      onHelpWantedClicked: ($event) => _ctx.$emit(`help-wanted-clicked`, $event)
    }, null, _parent));
  });
  _push(`<!--]--><div class="clearfix" data-v-7908d273></div></section>`);
  if ($options.modesLimited && $data.modeNumberLoadLimit < $props.fixture.modes.length) {
    _push(`<section class="card orange dark" data-v-7908d273><h2 data-v-7908d273>`);
    _push(ssrRenderComponent(_component_OflSvg, { name: "alert" }, null, _parent));
    _push(` This fixture is big!</h2><div data-v-7908d273>Only the first ${ssrInterpolate($data.modeNumberLoadLimit)} of ${ssrInterpolate($props.fixture.modes.length)} modes are displayed. Loading more modes might take a while.</div><div class="button-bar" data-v-7908d273>`);
    if ($data.isBrowser) {
      _push(`<a href="#load-modes" class="button primary" data-v-7908d273> Load ${ssrInterpolate(Math.min($data.modeNumberLoadIncrement, $props.fixture.modes.length - $data.modeNumberLoadLimit))} more modes </a>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<a href="?loadAllModes" class="${ssrRenderClass([$data.isBrowser ? `secondary` : `primary`, "button"])}" rel="nofollow noindex" data-v-7908d273> Load all ${ssrInterpolate($props.fixture.modes.length)} modes </a></div></section>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/fixture-page/FixturePage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-7908d273"]]), { __name: "FixturePage" });
class Manufacturer {
  /**
   * Creates a new Manufacturer instance.
   * @param {string} key The manufacturer key. Equals to directory name in the fixtures directory.
   * @param {object} jsonObject The manufacturer's JSON object.
   */
  constructor(key, jsonObject) {
    this.key = key;
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {string} The manufacturer's display name. Often used as prefix of fixture names, e.g. "cameo" + "Hydrabeam 100".
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {string} An additional description or explanation, if the name doesn't give enough information. Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || "";
  }
  /**
   * @returns {boolean} Whether this manufacturer has a comment.
   */
  get hasComment() {
    return "comment" in this._jsonObject;
  }
  /**
   * @returns {string | null} An URL pointing to the manufacturer's website (with fixture product pages).
   */
  get website() {
    return this._jsonObject.website || null;
  }
  /**
   * @returns {number | null} The id associated to this manufacturer in the RDM protocol.
   */
  get rdmId() {
    return this._jsonObject.rdmId || null;
  }
}

export { Fixture as F, Manufacturer as M, __nuxt_component_1$1 as _, physicalBulbProperties as a, physicalProperties as b, manufacturerProperties as c, capabilityTypes as d, channelProperties as e, fixtureProperties as f, capabilityDmxRange as g, fixtureLinkTypes as h, entitiesSchema as i, __nuxt_component_5 as j, linksProperties as l, modeProperties as m, numberProp as n, physicalLensProperties as p, schemaDefinitions as s, unitsSchema as u, wheelSlotTypes as w };
//# sourceMappingURL=Manufacturer-D4NeCXtn.mjs.map
