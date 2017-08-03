const schema = require('js-schema');

module.exports.VERSION = '2.0.0';

/**
 * see https://github.com/molnarg/js-schema
 *
 * in short:
 *   'property' is required
 *   '?property' is optional
 *   '*' has to match all properties that have no own rule
 *
 * we use `'*': Function` to disallow additional properties
 * since JSON has no function type.
 * 
 * The best is to read this from bottom to top, as the bottom
 * is more general.
 * 
 * See README.md for a high-level overview.
 */

const NonEmptyString = String.of(1, null, null);

const URL = schema(/^(ftp|http|https):\/\/[^ "]+$/);

const ISODate = schema(/^\d{4}-\d{2}-\d{2}$/);

const Color = schema(/^#[0-9a-f]{6}$/);

const DimensionsXYZ = Array.of(3, Number.min(0));

const Category = schema(['Blinder', 'Color Changer', 'Dimmer', 'Effect', 'Fan', 'Flower', 'Hazer', 'Laser', 'Moving Head', 'Scanner', 'Smoke', 'Strobe', 'Other']);

const Physical = schema({
  '?dimensions': DimensionsXYZ, // width, height, depth (in mm)
  '?weight': Number.above(0), // in kg
  '?power': Number.above(0), // in W
  '?DMXconnector': ['3-pin', '5-pin', '3-pin (swapped +/-)', '3-pin and 5-pin', '3.5mm stereo jack'], // additions are welcome
  '?bulb': {
    '?type': NonEmptyString, // e.g. 'LED'
    '?colorTemperature': Number.above(0), // in K
    '?lumens': Number.above(0),
    '*': Function
  },
  '?lens': {
    '?name': NonEmptyString, // e.g. 'PC', 'Fresnel'
    '?degreesMinMax': Array.of(2, Number.min(0).max(360)),
    '*': Function
  },
  '?focus': {
    '?type': ['Fixed', 'Head', 'Mirror', 'Barrel'], // additions are welcome
    '?panMax': Number.min(0), // in degrees
    '?tiltMax': Number.min(0), // in degrees
    '*': Function
  },
  '?matrix': {
    'pixelDimensions': DimensionsXYZ, // width, height, depth (in mm)
    'spacing': DimensionsXYZ // in mm
  },
  '*': Function
});

const DMXValue = Number.min(0).step(1);  // max value depends on how many fine channels there are (255 if none, 65535 if one, etc.)

const ChannelKey = NonEmptyString;  // channels in availableChannels
const ChannelAliasKey = NonEmptyString;  // channel keys that are only defined inside other channels

const Capability = schema({
  'range': Array.of(2, DMXValue),
  'name': NonEmptyString,
  '?menuClick': ['start', 'center', 'end', 'hidden'],
  '?color': Color,
  '?color2': Color,
  '?image': NonEmptyString,
  '?switchChannels': {
    '*': [ChannelKey, ChannelAliasKey] // switch switching channel '*' to an already defined channel or fine channel
  },
  '*': Function
});

const Channel = schema({
  '?name': NonEmptyString, // if not set: use channel key
  'type': ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'],
  '?color': ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime', 'Indigo'], // required and only allowed for SingleColor
  '?fineChannelAliases': Array.of(1, Infinity, ChannelAliasKey),
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precedence': ['LTP', 'HTP'],
  '?capabilities': Array.of(1, Infinity, Capability),
  '*': Function
});

const TemplateChannelKey = schema(/\$pixelKey/);
const TemplateChannelAliasKey = schema(/\$pixelKey/);

const TemplateChannel = Channel;

const PixelKey = NonEmptyString;
const PixelGroupKey = NonEmptyString;

const PixelKeyArray1D = Array.of(1, Infinity, [PixelKey, null]); // null to allow spacing
const PixelKeyArray2D = Array.of(1, Infinity, PixelKeyArray1D);
const PixelKeyArray3D = Array.of(1, Infinity, PixelKeyArray2D);

const Matrix = schema({
  'layout': ['line', 'rect', 'cube', 'custom2D', 'custom3D'],

  // one of the two must be defined
  '?pixelCount': Array.of(3, Number.min(0).step(1)),
  '?pixelKeys': [PixelKeyArray1D, PixelKeyArray2D, PixelKeyArray3D],

  '?pixelGroups': {
    '*': Array.of(1, Infinity, PixelKey) // '*' is the PixelGroupKey
  },

  '*': Function
});

const TemplateChannelReference = [
  null, // for unused channels
  TemplateChannelKey,
  TemplateChannelAliasKey
];

const ChannelReference = [
  null, // for unused channels
  ChannelKey, // normal channel keys and resolved template channel keys
  ChannelAliasKey, // fine or switching channel keys
  {
    'repeatFor': ['eachPixel', 'eachPixelGroup', Array.of(1, Infinity, [PixelKey, PixelGroupKey])],
    'channelOrder': ['perPixel', 'perChannel'],
    'templateChannels': Array.of(1, Infinity, TemplateChannelReference),
    '*': Function
  }
];

const Mode = schema({
  'name': NonEmptyString,
  '?shortName': NonEmptyString, // if not set: use name
  '?physical': Physical, // overrides fixture's Physical
  'channels': Array.of(1, Infinity, ChannelReference),
  '*': Function
});

const Fixture = schema({
  'name': NonEmptyString, // unique in manufacturer
  '?shortName': NonEmptyString, // unique globally; if not set: use name
  'categories': Array.of(1, Infinity, Category), // most important category first
  'meta': {
    'authors': Array.of(1, Infinity, NonEmptyString),
    'createDate': ISODate,
    'lastModifyDate': ISODate,
    '?importPlugin': {
      'plugin': NonEmptyString,
      'date': ISODate,
      '?comment': NonEmptyString,
      '*': Function
    },
    '*': Function
  },
  '?comment': NonEmptyString,
  '?manualURL': URL,
  '?physical': Physical,
  '?availableChannels': {
    '*': Channel // '*' is the ChannelKey
  },
  '?templateChannels': {
    '*': TemplateChannel // '*' is the TemplateChannelKey, must include $pixelKey
  },
  '?matrix': Matrix,
  'modes': Array.of(1, Infinity, Mode),
  '*': Function
});

const Manufacturers = schema({
  '*': { // '*' is the manufacturer key
    'name': NonEmptyString,
    '?comment': NonEmptyString,
    '?website': URL,
    '*': Function
  }
});


module.exports.Fixture = Fixture;
module.exports.Manufacturers = Manufacturers;

let properties = {
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
