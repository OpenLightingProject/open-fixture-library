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

var DMXValue = Number.min(0).max(255).step(1);

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

var Capability = schema({
  'range': Array.of(2, DMXValue),
  'name': NonEmptyString,
  '?menuClick': ['start', 'center', 'end', 'hidden'],
  '?color': Color,
  '?color2': Color,
  '?image': NonEmptyString,
  '*': Function
});

var Channel = schema({
  '?name': String, // if not set: use channel key
  'type': ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'],
  '?color': ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime', 'Indigo'],
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precedence': ['LTP', 'HTP'],
  '?capabilities': Array.of(Capability),
  '*': Function
});

var ChannelKey = NonEmptyString;

var Mode = schema({
  'name': NonEmptyString,
  '?shortName': NonEmptyString, // if not set: use name
  '?physical': Physical, // overrides fixture's Physical
  'channels': Array.of([null, ChannelKey]), // null for unused channels
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
  '?multiByteChannels': Array.of(Array.of(ChannelKey)), // most significant channel first, e.g. [["ch1-coarse", "ch1-fine"], ["ch2-coarse", "ch2-fine"]]
  '?heads': schema({
    '*': Array.of(ChannelKey) // '*' is the head name
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
  manufacturer: Manufacturers.toJSON().additionalProperties.properties,
  fixture:      Fixture.toJSON().properties,
  mode:         Mode.toJSON().properties,
  channelKey:   ChannelKey.schema.toJSON(),
  channel:      Channel.toJSON().properties,
  capability:   Capability.toJSON().properties,
  physical:     Physical.toJSON().properties,
  category:     Category.toJSON(),
  color:        Color.toJSON(),
  ISODate:      ISODate.toJSON(),
  URL:          URL.toJSON(),
  DMXValue:     DMXValue.toJSON()
};
properties.meta  = properties.fixture.meta.properties;
properties.bulb  = properties.physical.bulb.properties;
properties.lens  = properties.physical.lens.properties;
properties.focus = properties.physical.focus.properties;

module.exports.properties = properties;