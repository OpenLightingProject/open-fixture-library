import JSON5 from 'json5';
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

  // some example files ship with a trailing NUL byte, and all of them use JSON5 syntax (trailing commas)
  const maizeFixture = JSON5.parse(buffer.toString('utf-8').replaceAll('\0', ''));

  if (!Array.isArray(maizeFixture.parameters)) {
    throw new TypeError(`Could not parse '${fileName}' as a MaizeDMX fixture profile.`);
  }

  const manufacturerKey = slugify(maizeFixture.brand || 'Unknown');
  const fixtureKey = `${manufacturerKey}/${slugify(maizeFixture.model)}`;

  const oflManufacturers = await importJson('../../fixtures/manufacturers.json', import.meta.url);

  const manufacturers = {};
  if (!(manufacturerKey in oflManufacturers)) {
    manufacturers[manufacturerKey] = {
      name: maizeFixture.brand || 'Unknown',
    };
    warnings.push('Please check if manufacturer is correct and add manufacturer URL.');
  }

  const authors = maizeFixture.author ? [maizeFixture.author] : [];
  if (!authors.includes(authorName)) {
    authors.push(authorName);
  }

  const fixture = {
    $schema: 'https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json',
    name: maizeFixture.model,
    categories: guessCategories(maizeFixture, warnings),
    meta: {
      authors,
      createDate: timestamp,
      lastModifyDate: timestamp,
      importPlugin: {
        plugin: 'maizedmx',
        date: timestamp,
        comment: `created by MaizeDMX fixture profile v${maizeFixture.version}`,
      },
    },
  };

  addChannelsAndMode(fixture, maizeFixture, warnings);

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
 * MaizeDMX doesn't encode fixture categories at all, so we have to guess them from the used parameter types.
 * @param {Readonly<object>} maizeFixture - The parsed MaizeDMX fixture profile.
 * @param {string[]} warnings - This fixture's warnings array; a warning is added to always double-check the guess.
 * @returns {string[]} The guessed OFL fixture categories.
 */
function guessCategories(maizeFixture, warnings) {
  const types = new Set(maizeFixture.parameters.map((parameter) => parameter.type));
  const hasAnyType = (...typesToCheck) => typesToCheck.some((type) => types.has(type));
  const hasPan = hasAnyType('pos.pan', 'pos.pancontinuous');
  const hasTilt = hasAnyType('pos.tilt', 'pos.tiltcontinuous');
  const hasColorWheel = hasAnyType('color.color1', 'color.color2', 'color.color3');

  // matches OFL's own category-guessing logic in tests/fixture-valid.js: white-ish/UV colors don't
  // count towards "is this a color changer", since they don't let you actually change the color
  const colorableColorCount = Object.keys(SINGLE_COLORS_BY_TYPE)
    .filter((type) => !['color.uv', 'color.warmwhite', 'color.coolwhite'].includes(type))
    .filter((type) => types.has(type)).length;

  warnings.push('MaizeDMX profiles don\'t contain category information, so it was guessed from the used parameters. Please check if it is correct.');

  if (hasPan && hasTilt) {
    return ['Moving Head'];
  }

  if (hasPan || hasTilt) {
    return ['Scanner'];
  }

  if (hasColorWheel || colorableColorCount >= 2) {
    return ['Color Changer'];
  }

  if (maizeFixture.parameters.length === 1 && hasAnyType('dimmer.dimmer')) {
    return ['Dimmer'];
  }

  return ['Other'];
}

/**
 * @param {string} label - The free-text label of a DMX range, e.g. "strobe slow - fast".
 * @returns {{speedStart: string, speedEnd: string}} A speed range, guessed from the direction words in the label.
 */
function getSpeedFromLabel(label) {
  if (/fast\s*(?:-|to|<-*>)\s*slow/i.test(label)) {
    return { speedStart: 'fast', speedEnd: 'slow' };
  }

  return { speedStart: 'slow', speedEnd: 'fast' };
}

/**
 * Unlike the generic `Speed` entity, `RotationSpeed` (used e.g. by `WheelRotation` / `PrismRotation`)
 * requires a `CW` / `CCW` direction suffix instead of plain `slow` / `fast` keywords.
 * @param {string} label - The free-text label of a DMX range, e.g. "reverse rotation slow - fast".
 * @returns {{speedStart: string, speedEnd: string}} A rotation speed range, guessed from the label.
 */
function getRotationSpeedFromLabel(label) {
  const direction = /revers/i.test(label) ? 'CCW' : 'CW';
  const { speedStart, speedEnd } = getSpeedFromLabel(label);
  return { speedStart: `${speedStart} ${direction}`, speedEnd: `${speedEnd} ${direction}` };
}

const SHUTTER_EFFECTS_BY_KEYWORD = [
  [/^(?:blackout|closed?)$/i, 'Closed'],
  [/^open$/i, 'Open'],
  [/puls/i, 'Pulse'],
  [/ramp\s*up/i, 'RampUp'],
  [/ramp\s*down/i, 'RampDown'],
];

/**
 * @param {string} label - The free-text label of a `dimmer.shutter` / `dimmer.strobe` DMX range.
 * @returns {object} An OFL `ShutterStrobe` capability (without `dmxRange`).
 */
function getShutterStrobeCapability(label) {
  const matchedEffect = SHUTTER_EFFECTS_BY_KEYWORD.find(([regex]) => regex.test(label));
  if (matchedEffect) {
    return { type: 'ShutterStrobe', shutterEffect: matchedEffect[1] };
  }

  const capability = { type: 'ShutterStrobe', shutterEffect: 'Strobe' };
  if (/random/i.test(label)) {
    capability.randomTiming = true;
  }
  Object.assign(capability, getSpeedFromLabel(label));
  capability.comment = label;
  return capability;
}

/**
 * @param {string} label - The free-text label of a `beam.prism1` / `beam.prism2` DMX range.
 * @returns {object} An OFL `Prism`, `PrismRotation` or `NoFunction` capability (without `dmxRange`).
 */
function getPrismCapability(label) {
  if (/no function/i.test(label)) {
    return { type: 'NoFunction' };
  }

  if (/rotat/i.test(label)) {
    return { type: 'PrismRotation', ...getRotationSpeedFromLabel(label) };
  }

  return { type: 'Prism', comment: label };
}

/**
 * @param {string} label - The free-text label of a `gobo.goboNrotation` DMX range.
 * @param {string} wheelName - The name of the sibling `gobo.goboN` channel this rotation channel controls.
 * @returns {object} An OFL `WheelRotation` or `NoFunction` capability (without `dmxRange`).
 */
function getWheelRotationCapability(label, wheelName) {
  if (/no function/i.test(label)) {
    return { type: 'NoFunction' };
  }

  if (/^stop$/i.test(label)) {
    return { type: 'WheelRotation', wheel: wheelName, speed: 'stop' };
  }

  return { type: 'WheelRotation', wheel: wheelName, ...getRotationSpeedFromLabel(label), comment: label };
}

/**
 * @param {string} label - The free-text label of a `control.*` / `focus.autofocus` DMX range.
 * @returns {object} An OFL capability (without `dmxRange`), usually `Effect`.
 */
function getControlCapability(label) {
  if (/no function/i.test(label)) {
    return { type: 'NoFunction' };
  }

  if (/^reset|^lamp (?:on|off)/i.test(label)) {
    return { type: 'Maintenance', comment: label };
  }

  if (/color jump/i.test(label)) {
    return { type: 'Effect', effectPreset: 'ColorJump', ...getSpeedFromLabel(label) };
  }

  if (/color fade/i.test(label)) {
    return { type: 'Effect', effectPreset: 'ColorFade', ...getSpeedFromLabel(label) };
  }

  const capability = { type: 'Effect', effectName: label };
  if (/sound/i.test(label)) {
    capability.soundControlled = true;
  }
  return capability;
}

/**
 * The fallback for parameter types without a good OFL equivalent (e.g. `color.hue`, `dimmer.curve`,
 * `gobo.animation`): keeps the fixture schema-valid and documents the original label as a comment,
 * but always adds a warning so the range gets a human look before the fixture is merged.
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object[]} OFL capabilities (with `dmxRange`) covering the whole channel.
 */
function getGenericCapabilities(parameter, warnings) {
  warnings.push(`Parameter type "${parameter.type}" (channel "${parameter.name}") has no good equivalent in OFL and was imported as Generic. Please review and improve it manually.`);

  const ranges = parseOptionRanges(parameter.options, getMaxDmxValue(parameter), warnings);
  if (ranges.length === 0) {
    return [{ dmxRange: [0, 255], type: 'Generic', comment: parameter.name }];
  }

  return ranges.map(({ dmxRange, label }) => ({ dmxRange, type: 'Generic', comment: label }));
}

/**
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @returns {number} The highest DMX value this parameter's channel can hold: `65_535` for a 16bit (`"coarse,fine"`) channel, `255` otherwise.
 */
function getMaxDmxValue(parameter) {
  return getChannelPositions(parameter.channel).length > 1 ? 65_535 : 255;
}

/**
 * @param {Readonly<object> | undefined} options - A MaizeDMX parameter's `options` object, mapping `"start-end"` DMX range strings to a free-text label.
 * @param {number} maxDmxValue - The highest DMX value the channel can hold, see {@link getMaxDmxValue}.
 * @param {string[]} warnings - This fixture's warnings array; a warning is added if malformed ranges had to be dropped.
 * @returns {{dmxRange: [number, number], label: string}[]} The parsed ranges, ordered by their start value, normalized to gaplessly cover the full `0` to `maxDmxValue` range as OFL requires.
 */
function parseOptionRanges(options, maxDmxValue, warnings) {
  if (!options) {
    return [];
  }

  const parsedRanges = Object.entries(options).map(([range, label]) => {
    // a range key without a dash (e.g. "128") is a single DMX value, i.e. a range of length 1
    const [start, end] = range.includes('-')
      ? range.split('-').map((value) => Number.parseInt(value, 10))
      : [Number.parseInt(range, 10), Number.parseInt(range, 10)];
    return {
      dmxRange: /** @type {[number, number]} */ ([start, end]),
      label: label.trim(),
    };
  });

  // some example files have a malformed range (start after end, likely a copy-paste typo); drop those
  const malformedRangeCount = parsedRanges.filter(({ dmxRange }) => dmxRange[0] > dmxRange[1]).length;
  if (malformedRangeCount > 0) {
    warnings.push(`Skipped ${malformedRangeCount} malformed DMX range(s) (end before start) while importing.`);
  }

  const sortedRanges = parsedRanges
    .filter(({ dmxRange }) => dmxRange[0] <= dmxRange[1])
    .toSorted((a, b) => a.dmxRange[0] - b.dmxRange[0]);

  if (sortedRanges.length === 0) {
    return sortedRanges;
  }

  // some example files also have incomplete or overlapping ranges (e.g. because of a duplicate
  // options key, or genuinely contradictory overlapping ranges); stretch/shrink the ranges to
  // gaplessly and non-overlappingly cover 0 to maxDmxValue, as OFL requires. Ranges that end up
  // being fully swallowed by an earlier (by start value) range are dropped entirely.
  let adjustedRangeCount = 0;
  let nextStart = 0;
  const ranges = [];
  for (const parsedRange of sortedRanges) {
    if (parsedRange.dmxRange[1] < nextStart) {
      // fully overlapped by an earlier range, drop it
      adjustedRangeCount++;
      continue;
    }

    if (parsedRange.dmxRange[0] !== nextStart) {
      adjustedRangeCount++;
    }
    parsedRange.dmxRange[0] = nextStart;
    ranges.push(parsedRange);
    nextStart = parsedRange.dmxRange[1] + 1;
  }
  ranges.at(-1).dmxRange[1] = maxDmxValue;

  if (adjustedRangeCount > 0) {
    warnings.push(`Adjusted ${adjustedRangeCount} DMX range(s) with gaps or overlaps while importing.`);
  }

  return ranges;
}

const SINGLE_COLORS_BY_TYPE = {
  'color.red': 'Red',
  'color.green': 'Green',
  'color.blue': 'Blue',
  'color.cyan': 'Cyan',
  'color.magenta': 'Magenta',
  'color.yellow': 'Yellow',
  'color.amber': 'Amber',
  'color.white': 'White',
  'color.warmwhite': 'Warm White',
  'color.coolwhite': 'Cold White',
  'color.uv': 'UV',
  'color.lime': 'Lime',
  'color.indigo': 'Indigo',
};

/**
 * Parameter types that map to a single OFL capability covering the whole channel, independent of any
 * `options` the MaizeDMX parameter might (unusually) define.
 * @type {Record<string, () => object>}
 */
const SIMPLE_CAPABILITY_GETTERS = {
  'dimmer.dimmer': () => ({ type: 'Intensity', brightnessStart: '0%', brightnessEnd: '100%' }),
  'pos.pan': () => ({ type: 'Pan', angleStart: '0deg', angleEnd: '540deg', helpWanted: 'What is the actual pan range in degrees?' }),
  'pos.tilt': () => ({ type: 'Tilt', angleStart: '0deg', angleEnd: '540deg', helpWanted: 'What is the actual tilt range in degrees?' }),
  'pos.pancontinuous': () => ({ type: 'PanContinuous', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  'pos.tiltcontinuous': () => ({ type: 'TiltContinuous', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  'pos.speed': () => ({ type: 'PanTiltSpeed', speedStart: 'slow', speedEnd: 'fast' }),
  'color.cto': () => ({ type: 'ColorTemperature', colorTemperatureStart: 'warm', colorTemperatureEnd: 'cold' }),
  'focus.zoom': () => ({ type: 'Zoom', angleStart: 'narrow', angleEnd: 'wide' }),
  'focus.focus': () => ({ type: 'Focus', distanceStart: 'near', distanceEnd: 'far' }),
  'beam.frost': () => ({ type: 'Frost', frostIntensityStart: 'off', frostIntensityEnd: 'high' }),
  'beam.iris': () => ({ type: 'Iris', openPercentStart: 'closed', openPercentEnd: 'open' }),
  'beam.prism1rotation': () => ({ type: 'PrismRotation', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  'beam.prism2rotation': () => ({ type: 'PrismRotation', speedStart: 'slow CW', speedEnd: 'fast CW' }),
  'control.programspeed': () => ({ type: 'EffectSpeed', speedStart: 'slow', speedEnd: 'fast' }),
  'control.programfade': () => ({ type: 'EffectDuration', durationStart: 'short', durationEnd: 'long' }),
  'control.reset': () => ({ type: 'Maintenance', comment: 'Reset' }),
  'shape.frameangle': () => ({ type: 'BladeSystemRotation', angleStart: '0deg', angleEnd: '360deg', helpWanted: 'What is the actual rotation angle in degrees?' }),
};

/**
 * Parameter types whose `options` ranges are parsed into several capabilities of the same OFL type family.
 * @type {Record<string, (label: string) => object>}
 */
const RANGE_CAPABILITY_GETTERS = {
  'dimmer.shutter': getShutterStrobeCapability,
  'dimmer.strobe': getShutterStrobeCapability,
  'beam.prism1': getPrismCapability,
  'beam.prism2': getPrismCapability,
  'control.control': getControlCapability,
  'control.program': getControlCapability,
  'focus.autofocus': getControlCapability,
};

/**
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @param {ReadonlyMap<number, string>} wheelNamesByIndex - Maps a `gobo.goboN` wheel's index to its channel name, so that `gobo.goboNrotation` channels can reference it.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object[]} OFL capabilities (with `dmxRange`) covering the whole channel.
 */
function getCapabilities(parameter, wheelNamesByIndex, warnings) {
  const bladeMatch = /^shape\.blade([1-4])$/.exec(parameter.type);
  if (bladeMatch) {
    return [{ dmxRange: [0, 255], type: 'BladeInsertion', blade: Number(bladeMatch[1]), insertionStart: 'out', insertionEnd: 'in' }];
  }

  const bladeAngleMatch = /^shape\.blade([1-4])angle$/.exec(parameter.type);
  if (bladeAngleMatch) {
    return [{
      dmxRange: [0, 255], type: 'BladeRotation', blade: Number(bladeAngleMatch[1]), angleStart: '0deg', angleEnd: '360deg', helpWanted: 'What is the actual rotation angle in degrees?',
    }];
  }

  const goboRotationMatch = /^gobo\.gobo([1-3])rotation$/.exec(parameter.type);
  if (goboRotationMatch && wheelNamesByIndex.has(Number(goboRotationMatch[1]))) {
    const wheelName = wheelNamesByIndex.get(Number(goboRotationMatch[1]));
    const ranges = parseOptionRanges(parameter.options, getMaxDmxValue(parameter), warnings);
    if (ranges.length > 0) {
      return ranges.map(({ dmxRange, label }) => ({ dmxRange, ...getWheelRotationCapability(label, wheelName) }));
    }
    return [{ dmxRange: [0, 255], type: 'WheelRotation', wheel: wheelName, speedStart: 'slow CW', speedEnd: 'fast CW' }];
  }

  if (parameter.type in SINGLE_COLORS_BY_TYPE) {
    return [{ dmxRange: [0, 255], type: 'ColorIntensity', color: SINGLE_COLORS_BY_TYPE[parameter.type], brightnessStart: '0%', brightnessEnd: '100%' }];
  }

  if (parameter.type in SIMPLE_CAPABILITY_GETTERS) {
    return [{ dmxRange: [0, 255], ...SIMPLE_CAPABILITY_GETTERS[parameter.type]() }];
  }

  if (parameter.type in RANGE_CAPABILITY_GETTERS) {
    const ranges = parseOptionRanges(parameter.options, getMaxDmxValue(parameter), warnings);
    if (ranges.length > 0) {
      return ranges.map(({ dmxRange, label }) => ({ dmxRange, ...RANGE_CAPABILITY_GETTERS[parameter.type](label) }));
    }

    // no `options` given at all, so we don't know the range labels this channel would need
  }

  return getGenericCapabilities(parameter, warnings);
}

const WHEEL_ROTATION_KEYWORDS = /rotat|cycl|bounce|indexing/i;
const WHEEL_SHAKE_KEYWORDS = /shake/i;
const WHEEL_SLOT_SKIP_KEYWORDS = /^(?:no function|open)$/i;

/**
 * A wheel needs at least 2 slots to be valid. This predicts how many slots a `color.colorN` /
 * `gobo.goboN` parameter's `options` would produce, without actually building the wheel yet
 * (every range except rotation/shake ranges becomes exactly one slot, see {@link getWheelCapabilities}).
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @returns {number} The number of wheel slots this parameter's `options` would produce.
 */
function countPotentialWheelSlots(parameter) {
  if (!parameter.options) {
    return 0;
  }

  return Object.values(parameter.options).filter(
    (label) => !WHEEL_ROTATION_KEYWORDS.test(label) && !WHEEL_SHAKE_KEYWORDS.test(label),
  ).length;
}

/**
 * Parses the `options` of a `color.colorN` / `gobo.goboN` wheel channel into OFL `WheelSlot` (and, where
 * the label indicates rotation/shaking rather than a discrete slot, `WheelRotation` / `Generic`) capabilities,
 * and fills the corresponding `wheel.slots` array as a side effect.
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @param {'Color' | 'Gobo'} slotType - The type of wheel slots to create.
 * @param {object} wheel - The (so far empty) OFL wheel object to fill with slots.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {object[]} OFL capabilities (with `dmxRange`) covering the whole channel.
 */
function getWheelCapabilities(parameter, slotType, wheel, warnings) {
  const ranges = parseOptionRanges(parameter.options, getMaxDmxValue(parameter), warnings);
  const shakeRangeCount = ranges.filter(({ label }) => WHEEL_SHAKE_KEYWORDS.test(label)).length;
  if (shakeRangeCount > 0) {
    warnings.push(`Channel "${parameter.name}" has ${shakeRangeCount} wheel shake range(s) that were imported as generic capabilities. Please review and improve them manually.`);
  }

  // no explicit `wheel` property needed: it defaults to the channel name, which is what we use here
  return ranges.map(({ dmxRange, label }) => {
    if (WHEEL_ROTATION_KEYWORDS.test(label)) {
      return /^stop$/i.test(label)
        ? { dmxRange, type: 'WheelRotation', speed: 'stop' }
        : { dmxRange, type: 'WheelRotation', ...getRotationSpeedFromLabel(label), comment: label };
    }

    if (WHEEL_SHAKE_KEYWORDS.test(label)) {
      return { dmxRange, type: 'Generic', comment: label };
    }

    if (WHEEL_SLOT_SKIP_KEYWORDS.test(label)) {
      wheel.slots.push({ type: 'Open' });
    }
    else {
      wheel.slots.push({ type: slotType, name: label.charAt(0).toUpperCase() + label.slice(1) });
    }

    return { dmxRange, type: 'WheelSlot', slotNumber: wheel.slots.length };
  });
}

/**
 * @param {string} maizeChannel - A MaizeDMX parameter's `channel` property, either a plain DMX channel number or a `"coarse,fine"` string for 16bit channels.
 * @returns {number[]} The one or two (1-based) DMX channel positions this parameter occupies.
 */
function getChannelPositions(maizeChannel) {
  return String(maizeChannel).split(',').map((value) => Number.parseInt(value, 10));
}

/**
 * @param {number} fraction - A MaizeDMX `default` / `highlight` value, a fraction from 0 to 1.
 * @param {number} resolution - The channel's resolution, `255` for 8bit or `65_535` for 16bit (coarse + fine) channels.
 * @returns {number} The corresponding DMX value in the channel's full resolution.
 */
function fractionToDmxValue(fraction, resolution) {
  return Math.round(fraction * resolution);
}

/**
 * Sets a channel's (or template channel's) `capability` (singular, without `dmxRange`) or `capabilities`
 * (array, at least 2 items) property, as required by the fixture schema.
 * @param {object} channel - An OFL (template) channel object.
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
 * Adds `availableChannels`, an optional `matrix` / `templateChannels`, and a single `modes` entry (MaizeDMX
 * profiles only ever describe one DMX footprint / mode) to the OFL fixture object.
 * @param {object} fixture - The OFL fixture object.
 * @param {Readonly<object>} maizeFixture - The parsed MaizeDMX fixture profile.
 * @param {string[]} warnings - This fixture's warnings array.
 */
function addChannelsAndMode(fixture, maizeFixture, warnings) {
  fixture.availableChannels = {};
  fixture.wheels = {};

  const footprint = maizeFixture.footprint || Math.max(
    0, ...maizeFixture.parameters.flatMap((parameter) => getChannelPositions(parameter.channel)),
  );

  const sharedParameters = maizeFixture.parameters.filter((parameter) => !('cell' in parameter));
  const cellParameters = maizeFixture.parameters.filter((parameter) => 'cell' in parameter);

  const wheelNamesByIndex = new Map(
    sharedParameters
      .map((parameter) => [/^gobo\.gobo([1-3])$/.exec(parameter.type), parameter])
      .filter(([match, parameter]) => match && countPotentialWheelSlots(parameter) >= 2)
      .map(([match, parameter]) => [Number(match[1]), parameter.name]),
  );

  const channelKeyByPosition = new Map();
  for (const parameter of sharedParameters) {
    addAvailableChannel(fixture, parameter, wheelNamesByIndex, warnings);

    const positions = getChannelPositions(parameter.channel);
    channelKeyByPosition.set(positions[0], parameter.name);
    if (positions.length > 1) {
      channelKeyByPosition.set(positions[1], `${parameter.name} fine`);
    }
  }

  const matrix = cellParameters.length > 0
    ? addMatrixChannels(fixture, maizeFixture, cellParameters, warnings)
    : { insertBlock: null, positions: new Set() };

  if (Object.keys(fixture.wheels).length === 0) {
    delete fixture.wheels;
  }

  fixture.modes = [{
    name: maizeFixture.mode || `${footprint}-channel`,
    shortName: `${footprint}ch`,
    channels: buildModeChannels(footprint, channelKeyByPosition, matrix, warnings),
  }];
}

/**
 * Builds a mode's `channels` list by walking through all DMX positions in order, inserting the matrix
 * channels' insert block at its start position (and skipping the positions it covers), and using `null`
 * for any position that couldn't be matched to a parameter.
 * @param {number} footprint - The fixture's total DMX channel count.
 * @param {ReadonlyMap<number, string>} channelKeyByPosition - Maps each (non-matrix) DMX position to its channel key.
 * @param {{insertBlock: object | null, positions: ReadonlySet<number>}} matrix - The matrix channel insert block and the DMX positions it covers, see {@link addMatrixChannels}.
 * @param {string[]} warnings - This fixture's warnings array; a warning is added if any DMX position couldn't be matched.
 * @returns {(string | object | null)[]} The mode's `channels` list.
 */
function buildModeChannels(footprint, channelKeyByPosition, matrix, warnings) {
  const matrixStartPosition = matrix.positions.size > 0 ? Math.min(...matrix.positions) : null;
  const channels = [];
  let hasGaps = false;

  for (let position = 1; position <= footprint; position++) {
    if (position === matrixStartPosition) {
      channels.push(matrix.insertBlock);
    }
    else if (matrix.positions.has(position)) {
      // already represented by the insert block pushed above
    }
    else if (channelKeyByPosition.has(position)) {
      channels.push(channelKeyByPosition.get(position));
    }
    else {
      channels.push(null);
      hasGaps = true;
    }
  }

  if (hasGaps) {
    warnings.push('Some DMX channels could not be determined and were left undefined. Please check the fixture for gaps.');
  }

  return channels;
}

/**
 * Adds a single MaizeDMX parameter (that is not part of a pixel matrix) as an OFL available channel.
 * @param {object} fixture - The OFL fixture object.
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @param {ReadonlyMap<number, string>} wheelNamesByIndex - Maps a `gobo.goboN` wheel's index to its channel name.
 * @param {string[]} warnings - This fixture's warnings array.
 */
function addAvailableChannel(fixture, parameter, wheelNamesByIndex, warnings) {
  const isFineChannel = getChannelPositions(parameter.channel).length > 1;

  const channel = {};

  if (isFineChannel) {
    channel.fineChannelAliases = [`${parameter.name} fine`];
  }

  addDefaultAndHighlightValue(channel, parameter, isFineChannel);

  const hasOptions = Boolean(parameter.options && Object.keys(parameter.options).length > 0);
  const isColorWheel = parameter.type.startsWith('color.color') && hasOptions;
  const isGoboWheel = parameter.type.startsWith('gobo.gobo') && !parameter.type.includes('rotation') && hasOptions;

  if (isColorWheel || isGoboWheel) {
    addWheelChannel(fixture, channel, parameter, isColorWheel ? 'Color' : 'Gobo', warnings);
  }
  else {
    assignCapabilities(channel, getCapabilities(parameter, wheelNamesByIndex, warnings));
  }

  fixture.availableChannels[parameter.name] = channel;
}

/**
 * @param {object} channel - An OFL channel object; mutated in place.
 * @param {Readonly<object>} parameter - The MaizeDMX parameter.
 * @param {boolean} isFineChannel - Whether the channel is a 16bit (fine) channel.
 */
function addDefaultAndHighlightValue(channel, parameter, isFineChannel) {
  // 16bit (fine) channels give `default` / `highlight` as a fraction from 0 to 1, while 8bit channels
  // give it as a raw DMX byte value directly (regardless of whether the channel has discrete `options`)
  const toDmxValue = isFineChannel
    ? (value) => fractionToDmxValue(value, 65_535)
    : (value) => Math.round(value);

  if ('default' in parameter) {
    const defaultValue = toDmxValue(parameter.default);
    if (defaultValue > 0) {
      channel.defaultValue = defaultValue;
    }
  }

  if ('highlight' in parameter) {
    channel.highlightValue = toDmxValue(parameter.highlight);
  }
}

/**
 * @param {object} fixture - The OFL fixture object.
 * @param {object} channel - An OFL channel object; mutated in place.
 * @param {Readonly<object>} parameter - The MaizeDMX `color.colorN` / `gobo.goboN` parameter.
 * @param {'Color' | 'Gobo'} slotType - The type of wheel slots to create.
 * @param {string[]} warnings - This fixture's warnings array.
 */
function addWheelChannel(fixture, channel, parameter, slotType, warnings) {
  const wheel = { slots: [] };
  const capabilities = getWheelCapabilities(parameter, slotType, wheel, warnings);

  // a wheel needs at least 2 slots; this can happen if all ranges turned out to be
  // rotation/shake ranges instead of discrete slots (e.g. a wheel with just one image and a shake range)
  if (wheel.slots.length >= 2) {
    assignCapabilities(channel, capabilities);
    fixture.wheels[parameter.name] = wheel;
  }
  else {
    warnings.push(`Channel "${parameter.name}" looked like a wheel but had fewer than 2 slots, so it was imported as a generic channel instead. Please review it manually.`);
    assignCapabilities(channel, getGenericCapabilities(parameter, warnings));
  }
}

/**
 * Adds pixel-matrix template channels, built from the first cell's parameters (assuming that every
 * cell repeats the same parameters in the same order, which holds for all known MaizeDMX profiles).
 * @param {object} fixture - The OFL fixture object.
 * @param {Readonly<object>} maizeFixture - The parsed MaizeDMX fixture profile.
 * @param {Readonly<object>[]} cellParameters - All parameters that belong to a matrix cell.
 * @param {string[]} warnings - This fixture's warnings array.
 * @returns {{insertBlock: object, positions: Set<number>}} The mode's matrix channel insert block and the DMX positions it covers.
 */
function addMatrixChannels(fixture, maizeFixture, cellParameters, warnings) {
  const cellCount = maizeFixture.cells || Math.max(...cellParameters.map((parameter) => parameter.cell));
  fixture.matrix = { pixelCount: [cellCount, 1, 1] };
  fixture.templateChannels = {};

  const firstCellParameters = cellParameters.filter((parameter) => parameter.cell === 1)
    .toSorted((a, b) => getChannelPositions(a.channel)[0] - getChannelPositions(b.channel)[0]);

  const templateChannelKeys = firstCellParameters.map((parameter) => {
    const templateKey = `${parameter.name} $pixelKey`;
    const templateChannel = {};
    assignCapabilities(templateChannel, getCapabilities(parameter, new Map(), warnings));
    fixture.templateChannels[templateKey] = templateChannel;
    return templateKey;
  });

  const positions = new Set(cellParameters.flatMap((parameter) => getChannelPositions(parameter.channel)));
  const sortedPositions = [...positions].toSorted((a, b) => a - b);
  const isContiguous = sortedPositions.every(
    (position, index) => index === 0 || position === sortedPositions[index - 1] + 1,
  );

  if (!isContiguous) {
    warnings.push('The matrix (pixel) channels don\'t form a single contiguous DMX range; please check the generated mode carefully.');
  }

  return {
    insertBlock: {
      insert: 'matrixChannels',
      repeatFor: 'eachPixelABC',
      channelOrder: 'perPixel',
      templateChannels: templateChannelKeys,
    },
    positions,
  };
}

/**
 * @param {string} string - The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ' ').trim().replaceAll(/\s+/g, '-');
}
