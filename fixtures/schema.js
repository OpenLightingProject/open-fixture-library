// we use `var` instead of `let` and `const` here since this file will also be required from the client side

var schema = require('js-schema');

/**
 * see https://github.com/molnarg/js-schema
 *
 * in short:
 *   'property' is required
 *   '?property' is optional
 *   '*' has to match all properties that have no own rule
 *
 * we use `'*': Function` to disallow additional properties
 * since JSON has no function type
 */

var NonEmptyString = String.of(1, null, null);

var URL = schema(/^(ftp|http|https):\/\/[^ "]+$/);

var ISODate = schema(/^\d{4}-\d{2}-\d{2}$/);

var Color = schema(/^#[0-9a-f]{6}$/);

var Category = schema(['Blinder', 'Color Changer', 'Dimmer', 'Effect', 'Fan', 'Flower', 'Hazer', 'Laser', 'Moving Head', 'Scanner', 'Smoke', 'Strobe', 'Other']);

var Physical = schema({
  '?dimensions': Array.of(3, Number.above(0)), // width, height, depth (in mm)
  '?weight': Number.above(0), // in kg
  '?power': Number.above(0), // in W
  '?DMXconnector': ['3-pin', '5-pin', '3-pin (swapped +/-)', '3-pin and 5-pin', '3.5mm stereo jack'], // additions are welcome
  '?bulb': schema({
    '?type': NonEmptyString, // e.g. 'LED'
    '?colorTemperature': Number.above(0), // in K
    '?lumens': Number.above(0),
    '*': Function
  }),
  '?lens': schema({
    '?name': NonEmptyString, // e.g. 'PC', 'Fresnel'
    '?degreesMinMax': Array.of(2, Number.min(0).max(360)),
    '*': Function
  }),
  '?focus': schema({
    '?type': ['Fixed', 'Head', 'Mirror', 'Barrel'], // additions are welcome
    '?panMax': Number.min(0), // in degrees
    '?tiltMax': Number.min(0), // in degrees
    '*': Function
  }),
  '*': Function
});

var DMXValue = Number.min(0).step(1);  // max value depends on how many fine channels there are (255 if none, 65535 if one, etc.)

var ChannelKey = String;  // channels in availableChannels
var ChannelAliasKey = String;  // channel keys that are only defined inside other channels

var Capability = schema({
  'range': Array.of(2, DMXValue),
  'name': NonEmptyString,
  '?menuClick': ['start', 'center', 'end', 'hidden'],
  '?color': Color,
  '?color2': Color,
  '?image': NonEmptyString,
  '?switchToChannels': Array.of(1, Infinity, ChannelKey), // same array length as Channel.switchesChannels
  '*': Function
});

var Channel = schema({
  '?name': String, // if not set: use channel key
  'type': ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'],
  '?color': ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime', 'Indigo'],
  '?fineChannelAliases': Array.of(1, Infinity, ChannelAliasKey),
  '?switchesChannels': Array.of(1, Infinity, ChannelAliasKey), // e.g. =["Strobe/Pan"] and switchToChannels="Strobe" or "Pan" in this channel's capabilities: Use "Strobe/Pan" in a mode, it's behavior switches between "Strobe" and "Pan", depending on this channel's value
  '?capabilities': Array.of(1, Infinity, Capability),
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precedence': ['LTP', 'HTP'],
  '?capabilities': Array.of(Capability),
  '*': Function
});

var Mode = schema({
  'name': NonEmptyString,
  '?shortName': NonEmptyString, // if not set: use name
  '?physical': Physical, // overrides fixture's Physical
  'channels': Array.of([null, ChannelKey, ChannelAliasKey]), // null for unused channels
  '*': Function
});

var Fixture = schema({
  'name': NonEmptyString,
  '?shortName': NonEmptyString, // if not set: use name
  'categories': Array.of(1, Infinity, Category), // most important category first
  'meta': schema({
    'authors': Array.of(NonEmptyString),
    'createDate': ISODate,
    'lastModifyDate': ISODate,
    '?importPlugin': schema({
      'plugin': NonEmptyString,
      'date': ISODate,
      '?comment': NonEmptyString,
      '*': Function
    }),
    '*': Function
  }),
  '?comment': NonEmptyString,
  '?manualURL': URL,
  '?physical': Physical,
  'availableChannels': schema({
    '*': Channel // '*' is the channel key
  }),
  '?heads': schema({
    '*': Array.of([ChannelKey, ChannelAliasKey]) // '*' is the head name
  }),
  'modes': Array.of(1, Infinity, Mode),
  '*': Function
});

var Manufacturers = schema({
  '*': schema({ // '*' is the manufacturer key
    'name': NonEmptyString,
    '?comment': NonEmptyString,
    '?website': URL,
    '*': Function
  })
});


module.exports.Fixture = Fixture;
module.exports.Manufacturers = Manufacturers;

var properties = {
  manufacturer:     Manufacturers.toJSON().additionalProperties.properties,
  fixture:          Fixture.toJSON().properties,
  mode:             Mode.toJSON().properties,
  channelKey:       ChannelKey.schema.toJSON(),
  channelAliasKey:  ChannelAliasKey.schema.toJSON(),
  channel:          Channel.toJSON().properties,
  capability:       Capability.toJSON().properties,
  physical:         Physical.toJSON().properties,
  category:         Category.toJSON(),
  color:            Color.toJSON(),
  ISODate:          ISODate.toJSON(),
  URL:              URL.toJSON(),
  DMXValue:         DMXValue.toJSON()
};
properties.meta  = properties.fixture.meta.properties;
properties.bulb  = properties.physical.bulb.properties;
properties.lens  = properties.physical.lens.properties;
properties.focus = properties.physical.focus.properties;

module.exports.properties = properties;