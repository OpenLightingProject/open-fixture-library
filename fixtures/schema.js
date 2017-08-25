const schema = require('js-schema');

/**
 * Everytime we update the schema, this version needs to be incremented using semantic versionsing.
 * 
 * Given a version number MAJOR.MINOR.PATCH, increment the:
 * 1. MAJOR version when you make incompatible schema changes,
 * 2. MINOR version when you add functionality in a backwards-compatible manner, and
 * 3. PATCH version when you make backwards-compatible bug fixes.
 * 
 * See http://semver.org
 * 
 * @type {string}
 */
module.exports.VERSION = '3.0.0';

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
const NoVariablesString = schema(/^[^$]+$/);
const NonEmptyMultiLineString = schema(/.+/m);

const URL = schema(/^(ftp|http|https):\/\/[^ "]+$/);

const ISODate = schema(/^\d{4}-\d{2}-\d{2}$/);

const Color = schema(/^#[0-9a-f]{6}$/);

const DimensionsXYZ = Array.of(3, Number.min(0));

const Category = schema(['Blinder', 'Color Changer', 'Dimmer', 'Effect', 'Fan', 'Flower', 'Hazer', 'Laser', 'Matrix', 'Moving Head', 'Scanner', 'Smoke', 'Strobe', 'Other']);

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
  '?matrixPixels': {
    'dimensions': DimensionsXYZ, // width, height, depth (in mm)
    'spacing': DimensionsXYZ // in mm
  },
  '*': Function
});

const PixelKey = NoVariablesString;
const PixelGroupKey = NoVariablesString;

const Matrix = schema({
  // one of the two must be defined
  '?pixelCount': Array.of(3, Number.min(1).step(1)),
  '?pixelKeys': Array.of(1, Infinity, // Z items
    Array.of(1, Infinity, // Y items
      Array.of(1, Infinity, [PixelKey, null]) // X items
    )
  ),

  '?pixelGroups': {
    '*': Array.of(1, Infinity, PixelKey) // '*' is the PixelGroupKey
  },

  '*': Function
});

const DMXValue = Number.min(0).step(1);  // max value depends on how many fine channels there are (255 if none, 65535 if one, etc.)

const ChannelKey = NoVariablesString;  // channels in availableChannels
const ChannelAliasKey = NoVariablesString;  // channel keys that are only defined inside other channels

const TemplateChannelKey = schema(/\$pixelKey/);
const TemplateChannelAliasKey = schema(/\$pixelKey/);

const Capability = schema({
  'range': Array.of(2, DMXValue),
  'name': NonEmptyString,
  '?menuClick': ['start', 'center', 'end', 'hidden'],
  '?color': Color,
  '?color2': Color,
  '?image': NonEmptyString,
  '?switchChannels': {
    '*': [ // switch switching channel '*' to an already defined channel or fine channel
      ChannelKey,
      ChannelAliasKey,
      TemplateChannelKey, // only in template channels
      TemplateChannelAliasKey // only in template channels
    ]
  },
  '*': Function
});

const ChannelType = [
  'Intensity',
  'Single Color',
  'Multi-Color',
  'Pan',
  'Tilt',
  'Focus',
  'Zoom',
  'Iris',
  'Gobo',
  'Prism',
  'Shutter',
  'Strobe',
  'Speed',
  'Color Temperature',
  'Effect',
  'Fog',
  'Maintenance',
  'Nothing'
];

const Channel = schema({
  '?name': NonEmptyString, // if not set: use channel key
  'type': ChannelType,
  '?color': ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime', 'Indigo'], // required and only allowed for Single Color
  '?fineChannelAliases': Array.of(1, Infinity, [
    ChannelAliasKey,
    TemplateChannelAliasKey // only in template channels
  ]),
  '?defaultValue': DMXValue,
  '?highlightValue': DMXValue,
  '?invert': Boolean,
  '?constant': Boolean,
  '?crossfade': Boolean,
  '?precedence': ['LTP', 'HTP'],
  '?capabilities': Array.of(1, Infinity, Capability),
  '*': Function
});

const TemplateChannel = Channel;

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
    'insert': 'matrixChannels',
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
      '?comment': NonEmptyMultiLineString,
      '*': Function
    },
    '*': Function
  },
  '?comment': NonEmptyMultiLineString,
  '?manualURL': URL,
  '?physical': Physical,
  '?matrix': Matrix,
  '?availableChannels': {
    '*': Channel // '*' is the ChannelKey
  },
  '?templateChannels': {
    '*': TemplateChannel // '*' is the TemplateChannelKey, must include $pixelKey
  },
  'modes': Array.of(1, Infinity, Mode),
  '*': Function
});

const Manufacturers = schema({
  '*': { // '*' is the manufacturer key
    'name': NonEmptyString,
    '?comment': NonEmptyMultiLineString,
    '?website': URL,
    '*': Function
  }
});


module.exports.Fixture = Fixture;
module.exports.Manufacturers = Manufacturers;

let properties = {
  manufacturer:             Manufacturers.toJSON().additionalProperties.properties,
  fixture:                  Fixture.toJSON().properties,
  mode:                     Mode.toJSON().properties,
  channelKey:               ChannelKey.toJSON(),
  channelAliasKey:          ChannelAliasKey.toJSON(),
  templateChannelKey:       TemplateChannelKey.toJSON(),
  templateChannelAliasKey:  TemplateChannelAliasKey.toJSON(),
  channel:                  Channel.toJSON().properties,
  capability:               Capability.toJSON().properties,
  physical:                 Physical.toJSON().properties,
  category:                 Category.toJSON(),
  color:                    Color.toJSON(),
  ISODate:                  ISODate.toJSON(),
  URL:                      URL.toJSON(),
  DMXValue:                 DMXValue.toJSON()
};
properties.meta  = properties.fixture.meta.properties;
properties.bulb  = properties.physical.bulb.properties;
properties.lens  = properties.physical.lens.properties;
properties.focus = properties.physical.focus.properties;

module.exports.properties = properties;
