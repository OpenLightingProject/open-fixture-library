const schema = require('js-schema');

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

const DMXValue = Number.min(0).max(255).step(1);

const URL = schema(/^(ftp|http|https):\/\/[^ "]+$/);

const ISODate = schema(/^\d{4}-\d{2}-\d{2}$/);

const Color = schema(/^#[0-9a-f]{6}$/);

const Category = schema(['Other', 'Color Changer', 'Dimmer', 'Effect', 'Fan', 'Flower', 'Hazer', 'Laser', 'Moving Head', 'Scanner', 'Smoke', 'Strobe', 'Blinder']);

const Physical = schema({
  '?dimensions': Array.of(3, Number.min(0)), // width, height, depth (in mm)
  '?weight': Number.min(0), // in kg
  '?power': Number.min(0), // in W
  '?DMXconnector': ['3-pin', '5-pin', '3-pin and 5-pin', '3.5mm stereo jack'], // additions are welcome
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

const Capability = schema({
  'range': Array.of(2, DMXValue),
  'name': String,
  '?hideInMenu': Boolean,
  '?center': Boolean,
  '?color': [Color, ''],
  '?color2': [Color, ''],
  '?image': String,
  '*': Function
});

const Channel = schema({
  '?name': [String, null], // null: use channel key
  'type': ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'],
  '?color': ['Generic', 'Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime'],
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precendence': ['LTP', 'HTP'],
  '?capabilities': Array.of(Capability),
  '*': Function
});

const ChannelKey = String;

const Mode = schema({
  'name': String,
  '?shortName': [String, null], // null: use name
  '?physical': Physical, // overrides fixture's Physical
  'channels': Array.of([null, ChannelKey]), // null for unused channels
  '*': Function
});

const Fixture = schema({
  'name': String,
  '?shortName': [String, null], // null: use name
  'categories': Array.of(1, Infinity, Category),
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
  '?manualURL': [URL, ''],
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

const Manufacturers = schema({
  '*': schema({ // '*' is the manufacturer key
    'name': String,
    '?comment': String,
    '?website': URL,
    '*': Function
  })
});


module.exports.Fixture = Fixture;
module.exports.Manufacturers = Manufacturers;
