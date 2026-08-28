import xml2js from 'xml2js';
import importJson from '../../lib/import-json.js';

export const version = '0.1.0';

/**
 * @param {Readonly<Buffer>} buffer - The imported file.
 * @param {string} fileName - The imported file's name.
 * @param {string} authorName - The importer's name.
 * @returns {Promise<object, Error>} A Promise that resolves to an out object or rejects with an error.
 */
export async function importFixtures(buffer, fileName, authorName) {
  const timestamp = new Date().toISOString().replace(/T.*/, '');
  const warnings = [];

  const xml = await xml2js.parseStringPromise(buffer.toString());

  if (!xml.DeviceDescription) {
    throw new TypeError(`Could not parse '${fileName}' as a Luminex device description XML file. Note: import the mode's channel definition file (e.g. "mac600_m4.xml"), not "main.xml".`);
  }

  const luminexDevice = xml.DeviceDescription;
  const manufacturerInfo = getAttributes(luminexDevice.ManufacturerInfo[0]);
  const physicalProperties = luminexDevice.PhysicalProperties[0];

  const manufacturerKey = slugify(manufacturerInfo.Manufacturer);
  const fixtureKey = `${manufacturerKey}/${slugify(manufacturerInfo.Model)}`;

  const oflManufacturers = await importJson('../../fixtures/manufacturers.json', import.meta.url);

  const manufacturers = {};
  if (!(manufacturerKey in oflManufacturers)) {
    manufacturers[manufacturerKey] = {
      name: manufacturerInfo.Manufacturer,
    };
    warnings.push('Please check if manufacturer is correct and add manufacturer URL.');
  }

  const authors = [authorName];

  const fixture = {
    $schema: 'https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json',
    name: manufacturerInfo.Model,
    categories: getCategories(getAttributes(physicalProperties).Type, warnings),
    meta: {
      authors,
      createDate: timestamp,
      lastModifyDate: timestamp,
      importPlugin: {
        plugin: 'luminex',
        date: timestamp,
        comment: manufacturerInfo.Firmware ? `Firmware ${manufacturerInfo.Firmware}` : undefined,
      },
    },
  };

  const physical = getPhysical(physicalProperties);
  if (physical) {
    fixture.physical = physical;
  }

  addChannelsAndMode(fixture, luminexDevice, warnings);
  fixture.categories = verifyCategories(fixture.categories, fixture, warnings);

  return {
    manufacturers,
    fixtures: {
      [fixtureKey]: fixture,
    },
    warnings: {
      [fixtureKey]: warnings,
    },
  };
}

/**
 * xml2js wraps every attribute-bearing element's attributes in a `$` object; this unwraps it.
 * @param {Readonly<object>} element - An xml2js-parsed XML element.
 * @returns {Record<string, string>} The element's attributes.
 */
function getAttributes(element) {
  return element.$ || {};
}

/**
 * xml2js wraps every child element in an array (even when there's only one); this unwraps a text-only child.
 * @param {Readonly<object>} element - An xml2js-parsed XML element.
 * @param {string} childName - The name of the (text-only) child element.
 * @returns {string | undefined} The child element's text content.
 */
function getChildText(element, childName) {
  return element[childName]?.[0];
}

const CATEGORY_BY_DEVICE_TYPE = {
  Yoke: 'Moving Head',
  YokeWash: 'Moving Head',
  YokeSpot: 'Moving Head',
  Mirror: 'Scanner',
  XYMirror: 'Scanner',
  Effect: 'Effect',
  Scroller: 'Color Changer',
  Dimmer: 'Dimmer',
  RGB: 'Color Changer',
  CMY: 'Color Changer',
  Graphics: 'Effect',
  Video: 'Effect',
  Control: 'Other',
};

/**
 * @param {string} deviceType - The `PhysicalProperties[@Type]` value (a `KindOfDeviceType` enum member).
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {string[]} The OFL fixture categories.
 */
function getCategories(deviceType, warnings) {
  if (deviceType in CATEGORY_BY_DEVICE_TYPE) {
    return [CATEGORY_BY_DEVICE_TYPE[deviceType]];
  }

  warnings.push(`Unknown device type "${deviceType}", please check the category.`);
  return ['Other'];
}

/**
 * `PhysicalProperties[@Type]` describes the whole device, but Luminex describes one DMX footprint / mode per
 * file, and some modes (e.g. a secondary "control"-only mode) don't include all the channels the device type
 * would suggest (a Yoke*-type device without this particular mode's pan/tilt channels, or an RGB/CMY/Scroller
 * device whose wheel-slot-selector channels have no `FuncDiscr` range data to build real wheel slots from).
 * This mirrors the corresponding category checks in `tests/fixture-valid.js` and falls back to 'Other' when a
 * guessed category doesn't actually hold, instead of emitting a fixture that fails validation.
 * @param {readonly string[]} categories - The guessed categories.
 * @param {Readonly<object>} fixture - The (mostly complete) OFL fixture object; must already have `availableChannels` and (if any) `wheels` set.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {string[]} The verified categories.
 */
function verifyCategories(categories, fixture, warnings) {
  const allCapabilities = Object.values(fixture.availableChannels).flatMap(
    (channel) => channel.capabilities || [channel.capability],
  );

  if (categories.includes('Color Changer') && !isColorChanger(allCapabilities, fixture)) {
    warnings.push('Category "Color Changer" was guessed from the device type, but the imported channels don\'t have multiple ColorIntensity capabilities, a ColorPreset capability or Color wheel slots. Falling back to "Other"; please review the channels and set the category manually.');
    return ['Other'];
  }

  const hasPan = allCapabilities.some((capability) => ['Pan', 'PanContinuous'].includes(capability.type));
  const hasTilt = allCapabilities.some((capability) => ['Tilt', 'TiltContinuous'].includes(capability.type));

  if (categories.includes('Moving Head') && !(hasPan && hasTilt)) {
    warnings.push('Category "Moving Head" was guessed from the device type, but this mode\'s imported channels don\'t have both a pan and a tilt channel (maybe this is a secondary mode that doesn\'t include them). Falling back to "Other"; please review the channels and set the category manually.');
    return ['Other'];
  }
  if (categories.includes('Scanner') && !(hasPan || hasTilt)) {
    warnings.push('Category "Scanner" was guessed from the device type, but this mode\'s imported channels don\'t have a pan or tilt channel (maybe this is a secondary mode that doesn\'t include them). Falling back to "Other"; please review the channels and set the category manually.');
    return ['Other'];
  }

  return categories;
}

/**
 * @param {readonly object[]} allCapabilities - All of the fixture's capabilities.
 * @param {Readonly<object>} fixture - The (mostly complete) OFL fixture object; must already have (if any) `wheels` set.
 * @returns {boolean} Whether the fixture actually qualifies for the 'Color Changer' category, mirroring `isColorChanger` in `tests/fixture-valid.js`.
 */
function isColorChanger(allCapabilities, fixture) {
  const hasColorPreset = allCapabilities.some((capability) => capability.type === 'ColorPreset');
  const colorIntensityCount = allCapabilities.filter(
    (capability) => capability.type === 'ColorIntensity' && !['UV', 'Cold White', 'Warm White'].includes(capability.color),
  ).length;
  const hasColorWheelSlot = Object.values(fixture.wheels || {}).some(
    (wheel) => wheel.slots.some((slot) => slot.type === 'Color'),
  );

  return hasColorPreset || colorIntensityCount >= 2 || hasColorWheelSlot;
}

const LENGTH_FACTORS_TO_MM = {
  mm: 1, cm: 10, m: 1000, inch: 25.4, inches: 25.4, foot: 304.8,
};
const WEIGHT_FACTORS_TO_KG = { kg: 1, pound: 0.45359237 };

/**
 * Luminex device files use `0` and empty strings interchangeably as "value not specified" placeholders, so both
 * are treated as absent here rather than being emitted as literal (schema-violating or nonsensical) values.
 * @param {Readonly<{Unit: string[], Value: string[]}>} physValueElement - A `PhysValType` element (`Weight`, `Width`, ...).
 * @param {Record<string, number>} factorsToBaseUnit - Conversion factors from the element's possible units to the desired base unit.
 * @returns {number | null} The value, converted to the base unit, or null if no meaningful value was specified.
 */
function getConvertedPhysValue(physValueElement, factorsToBaseUnit) {
  const unit = getChildText(physValueElement, 'Unit');
  const value = Number.parseFloat(getChildText(physValueElement, 'Value'));
  if (value > 0) {
    return value * (factorsToBaseUnit[unit] ?? 1);
  }
  return null;
}

/**
 * @param {Readonly<object>} physicalProperties - The `PhysicalProperties` element.
 * @returns {object | null} An OFL `physical` object, or null if no physical data is present at all.
 */
function getPhysical(physicalProperties) {
  const physical = {};

  if (physicalProperties.Weight) {
    const weight = getConvertedPhysValue(physicalProperties.Weight[0], WEIGHT_FACTORS_TO_KG);
    if (weight !== null) {
      physical.weight = Math.round(weight * 100) / 100;
    }
  }

  const geometry = physicalProperties.Geometry?.[0];
  if (geometry && geometry.Width && geometry.Depth && geometry.Height) {
    const dimensions = [geometry.Width, geometry.Depth, geometry.Height].map(
      ([element]) => getConvertedPhysValue(element, LENGTH_FACTORS_TO_MM),
    );
    if (dimensions.every((dimension) => dimension !== null)) {
      physical.dimensions = dimensions.map((dimension) => Math.round(dimension));
    }
  }

  const lamp = physicalProperties.Lamp?.[0];
  if (lamp) {
    const lampType = (getChildText(lamp, 'Type') || '').replaceAll(/\s+/g, ' ').trim();
    const lampModel = (getChildText(lamp, 'Model') || '').replaceAll(/\s+/g, ' ').trim();
    const lampPower = Number.parseFloat(getChildText(lamp, 'Power'));

    physical.bulb = {
      type: lampModel || lampType || 'Unknown lamp',
    };
    if (lampPower > 0) {
      physical.power = lampPower;
    }
  }

  return Object.keys(physical).length > 0 ? physical : null;
}

/**
 * @param {Readonly<object>} luminexDevice - The parsed `DeviceDescription` element.
 * @returns {Map<string, object[]>} Maps a channel `Name` to the `Range` attribute objects describing it, gathered from both `ParameterDefinition/FuncDiscr` and `DependencyDeclaration/Dependency` (which use the same range structure).
 */
function getRangesByChannelName(luminexDevice) {
  const rangesByChannelName = new Map();

  const rangeGroups = [
    ...(luminexDevice.ParameterDefinition?.[0]?.FuncDiscr || []),
    ...(luminexDevice.DependencyDeclaration?.[0]?.Dependency || []),
  ];

  for (const rangeGroup of rangeGroups) {
    const channelName = getAttributes(rangeGroup).ChannelName;
    const ranges = (rangeGroup.Range || []).map((range) => getAttributes(range));
    const existingRanges = rangesByChannelName.get(channelName) || [];
    rangesByChannelName.set(channelName, [...existingRanges, ...ranges]);
  }

  return rangesByChannelName;
}

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes.
 * @returns {[number, number]} The DMX range.
 */
function getDmxRange(range) {
  return [Number.parseInt(range.DmxBottom, 10), Number.parseInt(range.DmxTop, 10)];
}

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes.
 * @param {string} channelName - The channel's `Name`, used as a last-resort label if the range has neither `Semantic` nor `SubName`.
 * @returns {string} A human-readable, always non-empty label for this range, preferring the free-text `Semantic` over the enum `SubName`.
 */
function getRangeLabel(range, channelName) {
  return range.Semantic || range.SubName || channelName;
}

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes.
 * @returns {{hold: string} | Record<string, never>} A `Maintenance` capability's `hold` property, if the range specifies a `Time` (in milliseconds).
 */
function getHold(range) {
  return range.Time ? { hold: `${Number.parseInt(range.Time, 10) / 1000}s` } : {};
}

/**
 * Luminex's `Gobo1`-`Gobo4` and `Colour1`-`Colour2` channel families follow the same naming
 * pattern for their wheel-slot-selector channel (e.g. `Gobo1`) and its rotation channel (e.g. `Gobo1Rot`).
 * @param {string} channelName - The channel's `Name`.
 * @returns {{family: 'Gobo' | 'Colour', wheelChannelName: string, isWheel: boolean, isRotation: boolean} | null} The wheel context, or null if this isn't a `Gobo`/`Colour` wheel-family channel.
 */
function getWheelContext(channelName) {
  const wheelMatch = /^(Gobo|Colour)([1-4])$/.exec(channelName);
  if (wheelMatch) {
    return {
      family: wheelMatch[1], wheelChannelName: channelName, isWheel: true, isRotation: false,
    };
  }

  const rotationMatch = /^(Gobo|Colour)([1-4])Rot$/.exec(channelName);
  if (rotationMatch) {
    return {
      family: rotationMatch[1], wheelChannelName: `${rotationMatch[1]}${rotationMatch[2]}`, isWheel: false, isRotation: true,
    };
  }

  return null;
}

const SHUTTER_EFFECT_BY_SUB_NAME = {
  Closed: 'Closed',
  Open: 'Open',
  Strobe: 'Strobe',
  StrobeSlow: 'Strobe',
  StrobeMedium: 'Strobe',
  StrobeFast: 'Strobe',
  StrobePulse: 'Pulse',
  RampOpenSnapShut: 'RampUp',
  SnapOpenRampShut: 'RampDown',
  RampOpenRampShut: 'Strobe',
};

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes on a `Shutter`(-like) channel.
 * @returns {object} An OFL capability (without `dmxRange`).
 */
function getShutterRangeCapability(range) {
  const subName = range.SubName || '';
  const label = getRangeLabel(range, 'Shutter');

  if (subName in SHUTTER_EFFECT_BY_SUB_NAME) {
    const capability = { type: 'ShutterStrobe', shutterEffect: SHUTTER_EFFECT_BY_SUB_NAME[subName] };
    if (!['Open', 'Closed'].includes(capability.shutterEffect)) {
      capability.speedStart = 'slow';
      capability.speedEnd = 'fast';
      capability.comment = label;
    }
    return capability;
  }

  if (subName.startsWith('Random')) {
    return {
      type: 'ShutterStrobe', shutterEffect: 'Strobe', randomTiming: true, speedStart: 'slow', speedEnd: 'fast', comment: label,
    };
  }

  return { type: 'Generic', comment: label };
}

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes on an `Iris` channel.
 * @returns {object} An OFL `Iris` capability (without `dmxRange`).
 */
function getIrisRangeCapability(range) {
  const subName = range.SubName || '';

  if (subName === 'IrisMin' || subName === 'Closed') {
    return { type: 'Iris', openPercent: 'closed' };
  }
  if (subName === 'IrisMax' || subName === 'Open') {
    return { type: 'Iris', openPercent: 'open' };
  }
  if (subName === 'IrisPulse') {
    return { type: 'IrisEffect', effectName: 'Pulse', speedStart: 'slow', speedEnd: 'fast' };
  }

  return { type: 'Iris', openPercentStart: 'closed', openPercentEnd: 'open' };
}

/**
 * @param {string} direction - `'CW'` or `'CCW'`.
 * @param {Readonly<object>} range - Parsed `Range` attributes for a rotation sub-range.
 * @returns {{speedStart: string, speedEnd: string}} A `RotationSpeed` range, using the real RPM values if given, degrees/second keywords otherwise.
 */
function getRotationSpeed(direction, range) {
  if (range.Unit === 'RPM' && range.PhysBottom !== undefined && range.PhysTop !== undefined) {
    const sign = direction === 'CCW' ? -1 : 1;
    const speedStart = sign * Number.parseFloat(range.PhysBottom);
    const speedEnd = sign * Number.parseFloat(range.PhysTop);
    return { speedStart: `${speedStart}rpm`, speedEnd: `${speedEnd}rpm` };
  }

  return { speedStart: `slow ${direction}`, speedEnd: `fast ${direction}` };
}

/**
 * @param {Readonly<{family: string, wheelChannelName: string}>} wheel - The wheel context, see {@link getWheelContext}.
 * @param {Readonly<object>} range - Parsed `Range` attributes on a wheel rotation channel (e.g. `Gobo1Rot`).
 * @returns {object} An OFL `WheelRotation` or `WheelSlotRotation` capability (without `dmxRange`).
 */
function getWheelRotationRangeCapability(wheel, range) {
  const subName = range.SubName || '';

  if (subName === 'RotStop') {
    return { type: 'WheelRotation', wheel: wheel.wheelChannelName, speed: 'stop' };
  }
  if (subName === 'RotCW' || subName === 'RotCCW') {
    const direction = subName === 'RotCW' ? 'CW' : 'CCW';
    return { type: 'WheelRotation', wheel: wheel.wheelChannelName, ...getRotationSpeed(direction, range) };
  }
  if (subName === 'Index' && range.Unit === 'degrees' && range.PhysBottom !== undefined && range.PhysTop !== undefined) {
    return {
      type: 'WheelSlotRotation', wheel: wheel.wheelChannelName, angleStart: `${range.PhysBottom}deg`, angleEnd: `${range.PhysTop}deg`,
    };
  }
  if (subName === 'Open' || subName === 'NoFunction') {
    return { type: 'NoFunction' };
  }

  return { type: 'Generic', comment: getRangeLabel(range, wheel.wheelChannelName) };
}

/**
 * Parses a single range on a `Gobo1`-`Gobo4` / `Colour1`-`Colour2` wheel-slot-selector channel;
 * discrete slots are added to `wheelObject.slots` as a side effect.
 * @param {Readonly<{family: string}>} wheel - The wheel context, see {@link getWheelContext}.
 * @param {Readonly<object>} range - Parsed `Range` attributes.
 * @param {object} wheelObject - The (so far possibly empty) OFL wheel object to fill with slots.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object} An OFL `WheelSlot`, `WheelRotation` or `Generic` capability (without `dmxRange`).
 */
function getWheelSlotRangeCapability(wheel, range, wheelObject, warnings) {
  const subName = range.SubName || '';

  if (subName === 'RotStop') {
    return { type: 'WheelRotation', speed: 'stop' };
  }
  if (subName === 'RotCW' || subName === 'RotCCW') {
    return { type: 'WheelRotation', ...getRotationSpeed(subName === 'RotCW' ? 'CW' : 'CCW', range) };
  }

  if (subName.endsWith('_shake')) {
    const label = getRangeLabel(range, wheel.wheelChannelName);
    warnings.push(`Please check the wheel shake capability "${label}" on channel "${wheel.wheelChannelName}", it was imported as a generic capability.`);
    return { type: 'Generic', comment: label };
  }

  if (subName === 'NoFunction' || subName === 'Open') {
    wheelObject.slots.push({ type: 'Open' });
  }
  else {
    const slotType = wheel.family === 'Gobo' ? 'Gobo' : 'Color';
    wheelObject.slots.push({ type: slotType, name: getRangeLabel(range, `Slot ${wheelObject.slots.length + 1}`) });
  }

  return { type: 'WheelSlot', slotNumber: wheelObject.slots.length };
}

/**
 * @param {readonly object[]} ranges - Parsed `Range` attribute objects for one channel.
 * @param {string} channelName - The channel's `Name`, only used in the warning message.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object[]} The ranges, ordered by DMX start value and normalized to gaplessly cover 0-255, as OFL requires. Malformed (end before start) ranges are dropped, and fully-overlapped ranges are dropped as well.
 */
function normalizeRanges(ranges, channelName, warnings) {
  const parsedRanges = ranges.map((range) => ({ dmxRange: getDmxRange(range), range }));

  const malformedCount = parsedRanges.filter(({ dmxRange }) => dmxRange[0] > dmxRange[1]).length;
  if (malformedCount > 0) {
    warnings.push(`Skipped ${malformedCount} malformed DMX range(s) (end before start) on channel "${channelName}".`);
  }

  const sortedRanges = parsedRanges
    .filter(({ dmxRange }) => dmxRange[0] <= dmxRange[1])
    .toSorted((a, b) => a.dmxRange[0] - b.dmxRange[0]);

  if (sortedRanges.length === 0) {
    return sortedRanges;
  }

  let adjustedCount = 0;
  let nextStart = 0;
  const normalizedRanges = [];
  for (const sortedRange of sortedRanges) {
    if (sortedRange.dmxRange[1] < nextStart) {
      adjustedCount++;
      continue;
    }

    if (sortedRange.dmxRange[0] !== nextStart) {
      adjustedCount++;
    }
    sortedRange.dmxRange[0] = nextStart;
    normalizedRanges.push(sortedRange);
    nextStart = sortedRange.dmxRange[1] + 1;
  }
  normalizedRanges.at(-1).dmxRange[1] = 255;

  if (adjustedCount > 0) {
    warnings.push(`Adjusted ${adjustedCount} DMX range(s) with gaps or overlaps on channel "${channelName}".`);
  }

  return normalizedRanges;
}

const SINGLE_COLORS_BY_CHANNEL_NAME = {
  Red: 'Red', Green: 'Green', Blue: 'Blue', White: 'White', Cyan: 'Cyan', Magenta: 'Magenta', Yellow: 'Yellow',
};

/**
 * Channel names that map to a single OFL capability covering the whole channel, used when the channel
 * has no `ParameterDefinition` / `DependencyDeclaration` range data (the common case, see the plugin's
 * `import.js` module doc). Everything not listed here (mostly niche/video-fixture-specific channel
 * names) falls back to a `Generic` capability plus a warning.
 * @type {Record<string, () => object>}
 */
const SIMPLE_CAPABILITY_GETTERS = {
  Pan: () => ({ type: 'Pan', angleStart: '0deg', angleEnd: '540deg', helpWanted: 'What is the actual pan range in degrees?' }),
  Tilt: () => ({ type: 'Tilt', angleStart: '0deg', angleEnd: '270deg', helpWanted: 'What is the actual tilt range in degrees?' }),
  Mirror1: () => ({ type: 'Pan', angleStart: '0deg', angleEnd: '540deg', helpWanted: 'What is the actual pan range in degrees?' }),
  Mirror2: () => ({ type: 'Tilt', angleStart: '0deg', angleEnd: '270deg', helpWanted: 'What is the actual tilt range in degrees?' }),
  PanRot: () => ({ type: 'PanContinuous', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  TiltRot: () => ({ type: 'TiltContinuous', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  PanTiltSpeed: () => ({ type: 'PanTiltSpeed', speedStart: 'slow', speedEnd: 'fast' }),
  Zoom: () => ({ type: 'Zoom', angleStart: 'narrow', angleEnd: 'wide' }),
  ZoomFine: () => ({ type: 'Zoom', angleStart: 'narrow', angleEnd: 'wide' }),
  ZoomSpeed: () => ({ type: 'EffectSpeed', speedStart: 'slow', speedEnd: 'fast' }),
  Focus: () => ({ type: 'Focus', distanceStart: 'near', distanceEnd: 'far' }),
  FocusFine: () => ({ type: 'Focus', distanceStart: 'near', distanceEnd: 'far' }),
  FocusSpeed: () => ({ type: 'EffectSpeed', speedStart: 'slow', speedEnd: 'fast' }),
  Iris: () => ({ type: 'Iris', openPercentStart: 'closed', openPercentEnd: 'open' }),
  IrisFine: () => ({ type: 'Iris', openPercentStart: 'closed', openPercentEnd: 'open' }),
  IrisSpeed: () => ({ type: 'EffectSpeed', speedStart: 'slow', speedEnd: 'fast' }),
  BeamAngle: () => ({ type: 'Zoom', angleStart: 'narrow', angleEnd: 'wide' }),
  CTO: () => ({ type: 'ColorTemperature', colorTemperatureStart: 'default', colorTemperatureEnd: 'warm' }),
  CTB: () => ({ type: 'ColorTemperature', colorTemperatureStart: 'default', colorTemperatureEnd: 'cold' }),
  // a lone ShutterStrobe capability isn't allowed (it would never be "off"); StrobeSpeed is the
  // established fallback for "we don't know the open/closed/strobe DMX ranges" (see e.g. the
  // committed chauvet-professional/vesuvio-rgba fixture)
  Shutter: () => ({
    type: 'StrobeSpeed', speedStart: 'slow', speedEnd: 'fast', helpWanted: 'At which DMX values is strobe disabled? When is the light constantly on or off?',
  }),
  Strobe: () => ({
    type: 'StrobeSpeed', speedStart: 'slow', speedEnd: 'fast', helpWanted: 'At which DMX values is strobe disabled? When is the light constantly on or off?',
  }),
  Prism1: () => ({ type: 'Prism' }),
  Prism1Rot: () => ({ type: 'PrismRotation', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  FramingRot: () => ({ type: 'BladeSystemRotation', angleStart: '0deg', angleEnd: '360deg', helpWanted: 'What is the actual rotation angle in degrees?' }),
  LampCTRL: () => ({ type: 'Maintenance', comment: 'Lamp control' }),
  MSpeed: () => ({ type: 'EffectSpeed', speedStart: 'slow', speedEnd: 'fast' }),
};

/**
 * @param {string} channelName - The channel's `Name`.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object} An OFL capability (without `dmxRange`) covering the whole channel.
 */
function getSimpleCapability(channelName, warnings) {
  if (channelName in SINGLE_COLORS_BY_CHANNEL_NAME) {
    return {
      type: 'ColorIntensity', color: SINGLE_COLORS_BY_CHANNEL_NAME[channelName], brightnessStart: '0%', brightnessEnd: '100%',
    };
  }

  if (channelName in SIMPLE_CAPABILITY_GETTERS) {
    return SIMPLE_CAPABILITY_GETTERS[channelName]();
  }

  const intensityMatch = /^Intensity([1-3])$/.exec(channelName);
  if (intensityMatch) {
    return {
      type: 'Intensity', brightnessStart: '0%', brightnessEnd: '100%', comment: intensityMatch[1] === '1' ? undefined : `Intensity ${intensityMatch[1]}`,
    };
  }

  const shutterMatch = /^Shutter([1-8])$/.exec(channelName);
  if (shutterMatch) {
    return {
      type: 'StrobeSpeed', speedStart: 'slow', speedEnd: 'fast', comment: `Shutter ${shutterMatch[1]}`, helpWanted: 'At which DMX values is strobe disabled? When is the light constantly on or off?',
    };
  }

  const frostMatch = /^Frost([1-4])$/.exec(channelName);
  if (frostMatch) {
    return {
      type: 'Frost', frostIntensityStart: 'off', frostIntensityEnd: 'high', comment: frostMatch[1] === '1' ? undefined : `Frost ${frostMatch[1]}`,
    };
  }

  const framingMatch = /^Framing([1-4])([ab])$/.exec(channelName);
  if (framingMatch) {
    const [, blade, part] = framingMatch;
    return part === 'a'
      ? { type: 'BladeInsertion', blade: Number(blade), insertionStart: 'out', insertionEnd: 'in' }
      : { type: 'BladeRotation', blade: Number(blade), angleStart: '0deg', angleEnd: '360deg', helpWanted: 'What is the actual rotation angle in degrees?' };
  }

  const framingRotMatch = /^Framing([1-4])Rot$/.exec(channelName);
  if (framingRotMatch) {
    return {
      type: 'BladeRotation', blade: Number(framingRotMatch[1]), angleStart: '0deg', angleEnd: '360deg', helpWanted: 'What is the actual rotation angle in degrees?',
    };
  }

  const macroMatch = /^Macro_?(\d+)$/.exec(channelName);
  if (macroMatch) {
    return { type: 'Effect', effectName: `Macro ${Number.parseInt(macroMatch[1], 10)}` };
  }

  warnings.push(`Channel name "${channelName}" has no good equivalent in OFL and was imported as Generic. Please review and improve it manually.`);
  return { type: 'Generic', comment: channelName };
}

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes on a `Prism1Rot` channel.
 * @returns {object} An OFL `PrismRotation` (or `Generic`) capability (without `dmxRange`).
 */
function getPrismRotationRangeCapability(range) {
  const subName = range.SubName || '';
  if (subName === 'RotStop') {
    return { type: 'PrismRotation', speed: 'stop' };
  }
  if (subName === 'RotCW' || subName === 'RotCCW') {
    return { type: 'PrismRotation', ...getRotationSpeed(subName === 'RotCW' ? 'CW' : 'CCW', range) };
  }
  return { type: 'Generic', comment: getRangeLabel(range, 'Prism1Rot') };
}

/**
 * @param {Readonly<object>} range - Parsed `Range` attributes on a `Prism1` channel.
 * @returns {object} An OFL `Prism` (or `NoFunction`) capability (without `dmxRange`).
 */
function getPrismRangeCapability(range) {
  const subName = range.SubName || '';
  if (subName === 'NoFunction' || subName === 'Open') {
    return { type: 'NoFunction' };
  }
  return { type: 'Prism', comment: getRangeLabel(range, 'Prism1') };
}

/**
 * Handles channel/`SubName` combinations that aren't specific to one particular channel name.
 * @param {Readonly<object>} range - Parsed `Range` attributes.
 * @param {string} channelName - The channel's `Name`.
 * @returns {object} An OFL capability (without `dmxRange`).
 */
function getFallbackRangeCapability(range, channelName) {
  const subName = range.SubName || '';
  if (subName === 'NoFunction' || subName === 'NoMap') {
    return { type: 'NoFunction' };
  }
  if (subName === 'LampOn' || subName === 'LampOnReset' || subName === 'LampOff' || subName === 'LampOn/Half' || subName === 'DisplayOn' || subName.startsWith('Reset')) {
    return { type: 'Maintenance', comment: getRangeLabel(range, channelName), ...getHold(range) };
  }

  // no specific handling for this channel/SubName combination: reuse the channel's simple
  // (whole-channel) capability shape when we have one (e.g. to get a real Pan/Tilt angle
  // capability instead of a bare Generic one), silently (this isn't the "no range data at all"
  // case, so it shouldn't add a "no good equivalent" warning)
  if (channelName in SIMPLE_CAPABILITY_GETTERS || channelName in SINGLE_COLORS_BY_CHANNEL_NAME) {
    return applyAngleOverride(getSimpleCapability(channelName, []), range);
  }

  return { type: 'Generic', comment: getRangeLabel(range, channelName) };
}

/**
 * @param {string} channelName - The channel's `Name`.
 * @param {Map<string, object[]>} rangesByChannelName - See {@link getRangesByChannelName}.
 * @param {Map<string, object>} wheelsByChannelName - Maps a wheel-slot-selector channel's `Name` (e.g. `Gobo1`) to its (so far possibly empty) OFL wheel object.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object[]} OFL capabilities (with `dmxRange`) covering the whole channel.
 */
function getChannelCapabilities(channelName, rangesByChannelName, wheelsByChannelName, warnings) {
  const ranges = rangesByChannelName.get(channelName) || [];
  if (ranges.length === 0) {
    return [{ dmxRange: [0, 255], ...getSimpleCapability(channelName, warnings) }];
  }

  const normalizedRanges = normalizeRanges(ranges, channelName, warnings);
  const wheel = getWheelContext(channelName);

  return normalizedRanges.map((normalizedRange) => {
    const { dmxRange, range } = normalizedRange;

    if (channelName === 'Strobe' || channelName === 'StrobeDuration' || channelName === 'StrobeFx' || /^Shutter\d*(?:Fine)?$/.test(channelName)) {
      return { dmxRange, ...getShutterRangeCapability(range) };
    }
    if (channelName === 'Iris' || channelName === 'IrisFine') {
      return { dmxRange, ...getIrisRangeCapability(range) };
    }
    if (channelName === 'Prism1Rot') {
      return { dmxRange, ...getPrismRotationRangeCapability(range) };
    }
    if (channelName === 'Prism1') {
      return { dmxRange, ...getPrismRangeCapability(range) };
    }
    if (channelName === 'LampCTRL') {
      return { dmxRange, type: 'Maintenance', comment: getRangeLabel(range, channelName), ...getHold(range) };
    }
    if (wheel?.isRotation) {
      return { dmxRange, ...getWheelRotationRangeCapability(wheel, range) };
    }
    if (wheel?.isWheel) {
      const wheelObject = wheelsByChannelName.get(channelName);
      return { dmxRange, ...getWheelSlotRangeCapability(wheel, range, wheelObject, warnings) };
    }

    return { dmxRange, ...getFallbackRangeCapability(range, channelName) };
  });
}

/**
 * If the given range specifies a real physical angle (`Unit="degrees"` with both `PhysBottom` and
 * `PhysTop`), use it instead of the given capability's placeholder `angleStart`/`angleEnd`.
 * @param {object} capability - An OFL capability that may have `angleStart`/`angleEnd` (e.g. `Pan`, `Tilt`); mutated in place.
 * @param {Readonly<object>} range - Parsed `Range` attributes.
 * @returns {object} The same capability object, for convenience.
 */
function applyAngleOverride(capability, range) {
  if ('angleStart' in capability && range.Unit === 'degrees' && range.PhysBottom !== undefined && range.PhysTop !== undefined) {
    capability.angleStart = `${range.PhysBottom}deg`;
    capability.angleEnd = `${range.PhysTop}deg`;
    delete capability.helpWanted;
  }
  return capability;
}

/**
 * Sets a channel's `capability` (singular, without `dmxRange`) or `capabilities` (array, at least
 * 2 items) property, as required by the fixture schema.
 * @param {object} channel - An OFL channel object.
 * @param {readonly object[]} capabilities - The capabilities to assign; each one has a `dmxRange`.
 */
function assignCapabilities(channel, capabilities) {
  if (capabilities.length === 1) {
    const capability = { ...capabilities[0] };
    delete capability.dmxRange;
    channel.capability = capability;
  }
  else {
    channel.capabilities = capabilities;
  }
}

/**
 * @param {Readonly<object>} luminexDevice - The parsed `DeviceDescription` element.
 * @returns {{ChannelNo: number, Name: string, Category: string, HighlightValue: number | null, BitRes: number, ByteNo: number, DefaultValue: number, MasterChannelNo: number | null}[]} All channels, ordered by `ChannelNo`.
 */
function getSortedChannels(luminexDevice) {
  return (luminexDevice.ChannelDefinition[0].Channel || [])
    .map((channel) => getAttributes(channel))
    .map((channel) => ({
      ChannelNo: Number.parseInt(channel.ChannelNo, 10),
      Name: channel.Name,
      Category: channel.Category,
      HighlightValue: channel.HighlightValue === undefined ? null : Number.parseInt(channel.HighlightValue, 10),
      BitRes: Number.parseInt(channel.BitRes || '8', 10),
      ByteNo: Number.parseInt(channel.ByteNo || '0', 10),
      DefaultValue: Number.parseInt(channel.DefaultValue || '0', 10),
      MasterChannelNo: channel.MasterChannelNo === undefined ? null : Number.parseInt(channel.MasterChannelNo, 10),
    }))
    .toSorted((a, b) => a.ChannelNo - b.ChannelNo);
}

/**
 * Adds `availableChannels`, `wheels` and a single `modes` entry (Luminex describes one DMX footprint /
 * mode per file) to the OFL fixture object.
 * @param {object} fixture - The OFL fixture object.
 * @param {Readonly<object>} luminexDevice - The parsed `DeviceDescription` element.
 * @param {string[]} warnings - This fixture's warnings array.
 */
function addChannelsAndMode(fixture, luminexDevice, warnings) {
  fixture.availableChannels = {};
  fixture.wheels = {};

  const channels = getSortedChannels(luminexDevice);
  const rangesByChannelName = getRangesByChannelName(luminexDevice);

  const fineChannelsByMasterChannelNo = new Map();
  const allFineChannels = channels.filter((someChannel) => someChannel.MasterChannelNo !== null);
  for (const channel of allFineChannels) {
    const fineChannels = fineChannelsByMasterChannelNo.get(channel.MasterChannelNo) || [];
    fineChannels.push(channel);
    fineChannelsByMasterChannelNo.set(channel.MasterChannelNo, fineChannels.toSorted((a, b) => b.ByteNo - a.ByteNo));
  }

  const wheelsByChannelName = new Map();
  for (const channel of channels) {
    if (getWheelContext(channel.Name)?.isWheel) {
      wheelsByChannelName.set(channel.Name, { slots: [] });
    }
  }

  const masterChannels = channels.filter((channel) => channel.MasterChannelNo === null);

  // computed in a first pass (populating `wheelsByChannelName`'s slots as a side effect), keyed by
  // ChannelNo (not Name, since some real files reuse the same Name at different ChannelNo positions)
  // so that, by the time capabilities are assigned to channels below, it's known which wheel channels
  // end up with the >= 2 slots OFL requires for a wheel to be worth registering at all
  const capabilitiesByChannelNo = new Map(masterChannels.map(
    (masterChannel) => [masterChannel.ChannelNo, getChannelCapabilities(masterChannel.Name, rangesByChannelName, wheelsByChannelName, warnings)],
  ));

  const usableWheelNames = new Set([...wheelsByChannelName]
    .filter(([, wheel]) => wheel.slots.length >= 2)
    .map(([wheelChannelName]) => wheelChannelName));
  for (const wheelChannelName of usableWheelNames) {
    fixture.wheels[wheelChannelName] = wheelsByChannelName.get(wheelChannelName);
  }
  if (Object.keys(fixture.wheels).length === 0) {
    delete fixture.wheels;
  }

  const usedChannelKeys = new Set();
  const channelKeyByChannelNo = new Map();
  for (const masterChannel of masterChannels) {
    const channelKey = getUniqueChannelKey(masterChannel.Name, usedChannelKeys, warnings);
    const capabilities = capabilitiesByChannelNo.get(masterChannel.ChannelNo)
      .map((capability) => downgradeUnusableWheelCapability(capability, usableWheelNames, masterChannel.Name));
    const fineChannels = fineChannelsByMasterChannelNo.get(masterChannel.ChannelNo) || [];
    addAvailableChannel(fixture, masterChannel, channelKey, fineChannels, capabilities);

    channelKeyByChannelNo.set(masterChannel.ChannelNo, channelKey);
    for (const fineChannel of fineChannels) {
      channelKeyByChannelNo.set(fineChannel.ChannelNo, `${channelKey} ${fineChannel.ByteNo === 0 ? 'fine' : 'finer'}`);
    }
  }

  const footprint = Number.parseInt(getAttributes(luminexDevice.ChannelDefinition[0]).Align, 10) || channels.length;
  const modeChannels = [];
  for (let channelNo = 1; channelNo <= footprint; channelNo++) {
    modeChannels.push(channelKeyByChannelNo.get(channelNo) || null);
  }

  fixture.modes = [{
    name: `${footprint}-channel`,
    shortName: `${footprint}ch`,
    channels: modeChannels,
  }];
}

/**
 * A `WheelSlot`/`WheelRotation`/`WheelSlotRotation` capability that references a wheel channel which ended up
 * with fewer than the 2 slots OFL requires for a wheel to be registered (e.g. because the source XML had no
 * `FuncDiscr` range data to derive real slots from) would otherwise dangle-reference a nonexistent wheel;
 * downgrade it to a `Generic` capability instead.
 * @param {object} capability - An OFL capability (with `dmxRange`).
 * @param {Set<string>} usableWheelNames - Wheel channel names that ended up with >= 2 slots.
 * @param {string} channelName - The channel this capability belongs to (the implicit wheel name for `WheelSlot`, which doesn't set `wheel` explicitly).
 * @returns {object} The capability, downgraded if necessary.
 */
function downgradeUnusableWheelCapability(capability, usableWheelNames, channelName) {
  if (capability.type === 'WheelSlot' && !usableWheelNames.has(capability.wheel || channelName)) {
    return { dmxRange: capability.dmxRange, type: 'Generic', comment: channelName };
  }
  if (['WheelRotation', 'WheelSlotRotation'].includes(capability.type) && !usableWheelNames.has(capability.wheel || channelName)) {
    return { dmxRange: capability.dmxRange, type: 'Generic', comment: `${channelName} rotation` };
  }
  return capability;
}

/**
 * Some real-world Luminex files reuse the same channel `Name` at different `ChannelNo` positions (e.g.
 * several `Reserved`-semantic placeholder channels all named "Trail", or unrelated channels that both
 * happen to be named "Function1"). OFL requires unique channel keys within a fixture, so later
 * duplicates get a numeric suffix.
 * @param {string} name - The channel's `Name`.
 * @param {Set<string>} usedKeys - Channel keys already used in this fixture; mutated in place.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {string} A unique channel key.
 */
function getUniqueChannelKey(name, usedKeys, warnings) {
  if (!usedKeys.has(name)) {
    usedKeys.add(name);
    return name;
  }

  let index = 2;
  while (usedKeys.has(`${name} ${index}`)) {
    index++;
  }
  const key = `${name} ${index}`;
  usedKeys.add(key);
  warnings.push(`Channel name "${name}" is used more than once; renamed the duplicate to "${key}". Please check if they should really be separate channels.`);
  return key;
}

/**
 * Adds a single Luminex master (i.e. non-fine) channel as an OFL available channel.
 * @param {object} fixture - The OFL fixture object.
 * @param {Readonly<object>} masterChannel - The master channel, see {@link getSortedChannels}.
 * @param {string} channelKey - The (possibly disambiguated, see {@link getUniqueChannelKey}) key to store this channel under.
 * @param {readonly object[]} fineChannels - This channel's fine channels (if any), ordered coarsest-first.
 * @param {readonly object[]} capabilities - This channel's capabilities (with `dmxRange`), already downgraded if necessary.
 */
function addAvailableChannel(fixture, masterChannel, channelKey, fineChannels, capabilities) {
  const channel = {};

  if (fineChannels.length > 0) {
    channel.fineChannelAliases = fineChannels.map((fineChannel) => `${channelKey} ${fineChannel.ByteNo === 0 ? 'fine' : 'finer'}`);
    // Luminex only ever gives an 8bit DefaultValue/HighlightValue, even for a fine channel's master
    channel.dmxValueResolution = '8bit';
  }

  if (masterChannel.DefaultValue > 0) {
    channel.defaultValue = masterChannel.DefaultValue;
  }
  if (masterChannel.HighlightValue !== null) {
    channel.highlightValue = masterChannel.HighlightValue;
  }

  assignCapabilities(channel, capabilities);

  fixture.availableChannels[channelKey] = channel;
}

/**
 * @param {string} string - The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ' ').trim().replaceAll(/\s+/g, '-');
}
