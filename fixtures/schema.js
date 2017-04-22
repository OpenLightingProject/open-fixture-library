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

var DMXValue = Number.min(0).max(255).step(1);

var URL = schema(/^(ftp|http|https):\/\/[^ "]+$/);

var ISODate = schema(/^\d{4}-\d{2}-\d{2}$/);

var Color = schema(/^#[0-9a-f]{6}$/);

var Category = schema(['Blinder', 'Color Changer', 'Dimmer', 'Effect', 'Fan', 'Flower', 'Hazer', 'Laser', 'Moving Head', 'Scanner', 'Smoke', 'Strobe', 'Other']);

var Physical = schema({
  '?dimensions': Array.of(3, Number.min(0)), // width, height, depth (in mm)
  '?weight': Number.min(0), // in kg
  '?power': Number.min(0), // in W
  '?DMXconnector': ['3-pin', '5-pin', '3-pin (swapped +/-)', '3-pin and 5-pin', '3.5mm stereo jack'], // additions are welcome
  '?bulb': schema({
    '?type': String, // e.g. 'LED'
    '?colorTemperature': Number.min(0), // in K
    '?lumens': Number.min(0),
    '*': Function
  }),
  '?lens': schema({
    '?name': String, // e.g. 'PC', 'Fresnel'
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
  'name': String,
  '?menuClick': ['start', 'center', 'end', 'hidden'],
  '?color': Color,
  '?color2': Color,
  '?image': String,
  '*': Function
});

var Channel = schema({
  '?name': [String, null], // null: use channel key
  'type': ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'],
  '?color': ['Amber', 'Blue', 'Cyan', 'Green', 'Indigo', 'Lime', 'Magenta', 'Red', 'UV', 'White', 'Yellow'],
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precedence': ['LTP', 'HTP'],
  '?capabilities': Array.of(Capability),
  '*': Function
});

var ChannelKey = String;

var Mode = schema({
  'name': String,
  '?shortName': [String, null], // null: use name
  '?physical': Physical, // overrides fixture's Physical
  'channels': Array.of([null, ChannelKey]), // null for unused channels
  '*': Function
});

var Fixture = schema({
  'name': String,
  '?shortName': [String, null], // null: use name
  'categories': Array.of(1, Infinity, Category), // most important category first
  'meta': schema({
    'authors': Array.of(String),
    'createDate': ISODate,
    'lastModifyDate': ISODate,
    '?importPlugin': schema({
      'plugin': String,
      'date': ISODate,
      '?comment': String,
      '*': Function
    }),
    '*': Function
  }),
  '?comment': String,
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
    'name': String,
    '?comment': String,
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
