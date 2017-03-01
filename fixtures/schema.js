const schema = require('js-schema');


const DMXValue = Number.min(0).max(255).step(1);

const URL = schema(/^(ftp|http|https):\/\/[^ "]+$/);

const ISODate = schema(/^\d{4}-\d{2}-\d{2}$/);

const Color = schema(/^#[0-9a-f]{6}$/);

const Category = schema(['Other', 'Color Changer', 'Dimmer', 'Effect', 'Fan', 'Flower', 'Hazer', 'Laser', 'Moving Head', 'Scanner', 'Smoke', 'Strobe', 'Blinder']);

const Physical = schema({
  '?dimensions': Array.of(3, Number.min(0)),
  '?weight': Number.min(0), // in kg
  '?power': Number.min(0), // in W
  '?DMXconnector': ['3-pin', '5-pin', '3-pin and 5-pin', '3.5mm stereo jack'], // free text also allowed
  '?bulb': schema({
    '?type': String,
    '?colorTemperature': Number.min(0),
    '?lumens': Number.min(0),
    '*': Function // no additional properties allowed
  }),
  '?lens': schema({
    '?name': ['PC', 'Fresnel', String],
    '?degreesMinMax': Array.of(2, Number.min(0).max(360)), // Range
    '*': Function // no additional properties allowed
  }),
  '?focus': schema({
    '?type': ['Fixed', 'Head', 'Mirror', 'Barrel'], // free text also allowed
    '?panMax': Number.min(0), // in degrees
    '?tiltMax': Number.min(0), // in degrees
    '*': Function // no additional properties allowed
  }),
  '*': Function // no additional properties allowed
});

const Capability = schema({
  'range': Array.of(2, DMXValue), // Range
  'name': String,
  '?hideInMenu': Boolean,
  '?center': Boolean,
  '?color': Color,
  '?color2': Color,
  '?image': String,
  '*': Function // no additional properties allowed
});

const Channel = schema({
  '?name': String, // if unset, channel key will be used
  'type': ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'],
  '?color': ['Generic', 'Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime'],
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precendence': ['LTP', 'HTP'],
  '?capabilities': Array.of(Capability),
  '*': Function // no additional properties allowed
});

const ChannelKey = String;

const Mode = schema({
  'name': String,
  '?shortName': String,
  '?physical': Physical, // overrides fixture's Physical
  'channels': Array.of([null, ChannelKey]), // null for unused channels
  '*': Function // no additional properties allowed
});

const Fixture = schema({
  'name': String,
  '?shortName': String,
  'categories': Array.of(Category),
  'meta': schema({
    'authors': Array.of(String),
    'createDate': ISODate,
    'lastModifyDate': ISODate,
    '*': Function // no additional properties allowed
  }),
  '?comment': String,
  '?manualURL': URL,
  '?physical': Physical,
  'availableChannels': schema({
    '*': Channel
  }),
  '?multiByteChannels': Array.of(Array.of(ChannelKey)), // most significant channel first, e.g. [["ch1-coarse", "ch1-fine"], ["ch2-coarse", "ch2-fine"]]
  '?heads': schema({
    '*': Array.of(ChannelKey)
  }),
  'modes': Array.of(1, Infinity, Mode),
  '*': Function // no additional properties allowed
});


module.exports.Fixture = Fixture;