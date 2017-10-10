const util = require('util');

const schema = require('../fixtures/schema.js');

const Fixture = require('../lib/model/Fixture.js');
const FineChannel = require('../lib/model/FineChannel.js');
const SwitchingChannel = require('../lib/model/SwitchingChannel.js');

/**
 * @typedef ResultData
 * @type {object}
 * @property {string[]} errors
 * @property {string[]} warnings
 */
let result;
/** @type {Fixture} */
let fixture;
/** @type {Set<string>} */
let definedChannelKeys; // and aliases
/** @type {Set<string>} */
let usedChannelKeys; // and aliases
/** @type {Set<string>} */
let modeNames;
/** @type {Set<string>} */
let modeShortNames;

/**
 * Checks that a given fixture JSON object is valid.
 * @param {!string} manKey The manufacturer key.
 * @param {!string} fixKey The fixture key.
 * @param {?object} fixtureJson The fixture JSON object.
 * @param {?UniqueValues} [uniqueValues=null] Values that have to be unique are checked and all new occurences are appended.
 * @return {ResultData} The result object containing errors and warnings, if any.
 */
module.exports = function checkFixture(manKey, fixKey, fixtureJson, uniqueValues=null) {
  result = {
    errors: [],
    warnings: []
  };
  definedChannelKeys = new Set();
  usedChannelKeys = new Set();
  modeNames = new Set();
  modeShortNames = new Set();

  const schemaErrors = schema.Fixture.errors(fixtureJson);
  if (schemaErrors !== false) {
    result.errors.push(module.exports.getErrorString('File does not match schema.', schemaErrors));
    return result;
  }

  try {
    fixture = new Fixture(manKey, fixKey, fixtureJson);
    
    checkFixIdentifierUniqueness(uniqueValues);
    checkMeta(fixture.meta);
    checkPhysical(fixture.physical);
    checkChannels(fixtureJson);

    for (const mode of fixture.modes) {
      checkMode(mode);
    }
  
    checkUnusedChannels();
  }
  catch (error) {
    result.errors.push(module.exports.getErrorString('File could not be imported into model.', error));
  }

  return result;
};

/**
 * Checks that fixture key, name and shortName are unique.
 * @param {?UniqueValues} [uniqueValues=null] Values that have to be unique are checked and all new occurences are appended.
 */
function checkFixIdentifierUniqueness(uniqueValues) {
  // test is called for a single fixture, e.g. when importing
  if (uniqueValues === null) {
    return;
  }

  const manKey = fixture.manufacturer.key;

  // fixture.key
  if (!(manKey in uniqueValues.fixKeysInMan)) {
    uniqueValues.fixKeysInMan[manKey] = new Set();
  }
  module.exports.checkUniqueness(
    uniqueValues.fixKeysInMan[manKey],
    fixture.key,
    `Fixture key '${fixture.key}' is not unique in manufacturer ${manKey} (test is not case-sensitive).`
  );

  // fixture.name
  if (!(manKey in uniqueValues.fixNamesInMan)) {
    uniqueValues.fixNamesInMan[manKey] = new Set();
  }
  module.exports.checkUniqueness(
    uniqueValues.fixNamesInMan[manKey],
    fixture.name,
    `Fixture name '${fixture.name}' is not unique in manufacturer ${manKey} (test is not case-sensitive).`
  );
  
  // fixture.shortName
  module.exports.checkUniqueness(
    uniqueValues.fixShortNames,
    fixture.shortName,
    `Fixture shortName '${fixture.shortName}' is not unique (test is not case-sensitive).`
  );
}

/**
 * Check that a fixture's meta block is valid.
 * @param {!Meta} meta The fixture's Meta object.
 */
function checkMeta(meta) {
  if (meta.lastModifyDate < meta.createDate) {
    result.errors.push('meta.lastModifyDate is earlier than meta.createDate.');
  }
}

/**
 * Checks if the given Physical object is valid.
 * @param {?Physical} physical A fixture's or a mode's physical data.
 * @param {!string} [modeDescription=''] Optional information in error messages about current mode.
 */
function checkPhysical(physical, modeDescription = '') {
  if (physical === null) {
    return;
  }

  const physicalJson = physical.jsonObject;
  if (isNotEmpty(physicalJson, `physical${modeDescription} is empty. Please remove it or add data.`)) {
    for (const property of ['bulb', 'lens', 'focus']) {
      isNotEmpty(physicalJson[property], `physical.${property}${modeDescription} is empty. Please remove it or add data.`);
    }
  
    if (physical.lensDegreesMin > physical.lensDegreesMax) {
      result.errors.push(`physical.lens.degreesMinMax${modeDescription} is an invalid range.`);
    }

    if (physical.hasMatrixPixels && fixture.matrix === null) {
      result.errors.push('physical.matrixPixels is set but fixture.matrix is missing.');
    }
  }
}

/**
 * Check if availableChannels and generated matrixChannels are defined correctly.
 * @param {!object} fixtureJson The fixture's JSON data
 */
function checkChannels(fixtureJson) {
  if (isNotEmpty(fixtureJson.availableChannels, 'availableChannels are empty. Add a channel or remove it.')) {
    for (const channel of fixture.availableChannels) {
      checkChannel(channel);
    }
  }
}

/**
 * Check that an available or template channel is valid.
 * @param {!Channel} channel The channel to test.
 */
function checkChannel(channel) {
  module.exports.checkUniqueness(
    definedChannelKeys,
    channel.key,
    `Channel key '${channel.key}' is already defined in another letter case.`
  );

  if (/\bfine\b|\d+(?:\s|-|_)*bit/i.test(channel.name)) {
    // channel name contains the word "fine" or "16bit" / "8 bit" / "32-bit" / "24_bit"
    result.errors.push(`Channel '${channel.key}' should rather be a fine channel alias of its corresponding coarse channel.`);
  }

  // Nothing channels
  if (channel.type === 'Nothing') {
    const isNotEmpty = Object.keys(channel.jsonObject).some(
      prop => prop !== 'type' && prop !== 'name'
    );
    if (isNotEmpty) {
      result.errors.push(`Channel '${channel.name}' with type 'Nothing' can only set 'name' as additional property.`);
      return;
    }
  }

  // Fine channels
  for (const alias of channel.fineChannelAliases) {
    module.exports.checkUniqueness(
      definedChannelKeys,
      alias,
      `Fine channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
    );
  }
  const minUsedFineness = Math.min(...fixture.modes.map(
    mode => channel.getFinenessInMode(mode)
  ));

  // Switching channels
  for (const alias of channel.switchingChannelAliases) {
    module.exports.checkUniqueness(
      definedChannelKeys,
      alias,
      `Switching channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
    );
  }
  if (!channel.hasDefaultValue && channel.switchingChannelAliases.length > 0) {
    result.errors.push(`defaultValue is missing in channel '${channel.key}' although it defines switching channels.`);
  }
  
  if (channel.color !== null && channel.type !== 'Single Color') {
    result.warnings.push(`color in channel '${channel.key}' defined but channel type is not 'Single Color'.`);
  }
  else if (channel.color === null && channel.type === 'Single Color') {
    result.errors.push(`color in channel '${channel.key}' undefined but channel type is 'Single Color'.`);
  }

  if (channel.hasDefaultValue && channel.defaultValue > channel.maxDmxBound) {
    result.errors.push(`defaultValue must be less or equal to ${channel.maxDmxBound} in channel '${channel.key}'.`);
  }

  if (channel.hasHighlightValue && channel.highlightValue > channel.maxDmxBound) {
    result.errors.push(`highlightValue must be less or equal to ${channel.maxDmxBound} in channel '${channel.key}'.`);
  }

  checkCapabilities(channel, minUsedFineness);
}

/**
 * Check that a channel's capabilities are valid.
 * @param {!Channel} channel The channel to test.
 * @param {number} minUsedFineness The smallest fineness that the channel is used in a mode. This controls how the capability ranges have to look like.
 */
function checkCapabilities(channel, minUsedFineness) {
  if (!channel.hasCapabilities) {
    return;
  }

  let rangesInvalid = false;

  for (let i = 0; i < channel.capabilities.length; i++) {
    const cap = channel.capabilities[i];
    
    // if one of the previous capabilities had an invalid range,
    // it doesn't make sense to check later ranges
    if (!rangesInvalid) {
      rangesInvalid = !checkRange(channel, i, minUsedFineness);
    }

    if ((cap.color || cap.image) && !['Multi-Color', 'Effect', 'Gobo'].includes(channel.type)) {
      result.errors.push(`color or image present in capability '${cap.name}' (#${i+1}) but improper channel type '${channel.type}' in channel '${channel.key}'.`);
    }

    if (cap.color2 && !cap.color) {
      result.errors.push(`color2 present but color missing in capability '${cap.name}' (#${i+1}) in channel '${channel.key}'.`);
    }

    if (cap.color && cap.image) {
      result.errors.push(`color and image cannot be present at the same time in capability '${cap.name}' (#${i+1}) in channel '${channel.key}'.`);
    }

    const switchingChannelAliases = Object.keys(cap.switchChannels);
    if (!arraysEqual(switchingChannelAliases, channel.switchingChannelAliases)) {
      result.errors.push(`Capability '${cap.name}' (#${i+1}) must define the same switching channel aliases as all other capabilities in channel '${channel.key}'.`);
    }
    else {
      for (const alias of switchingChannelAliases) {
        const chKey = cap.switchChannels[alias];
        usedChannelKeys.add(chKey.toLowerCase());

        if (channel.fixture.getChannelByKey(chKey) === null) {
          result.errors.push(`Channel '${chKey}' is referenced from capability '${cap.name}' (#${i+1}) in channel '${channel.key}' but is not defined.`);
        }
      }
    }
  }
}

/**
 * Check that a capability's range is valid.
 * @param {!Channel} channel The channel the capability belongs to.
 * @param {!number} capNumber The number of the capability in the channel, starting with 0.
 * @param {number} minUsedFineness The smallest fineness that the channel is used in a mode.This controls if this range can be from 0 up to channel.maxDmxBound or less.
 */
function checkRange(channel, capNumber, minUsedFineness) {
  const cap = channel.capabilities[capNumber];
  
  // first capability
  if (capNumber === 0 && cap.range.start !== 0) {
    result.errors.push(`The first range has to start at 0 in capability '${cap.name}' in channel '${channel.key}'.`);
    return false;
  }
  
  // all capabilities
  if (cap.range.start > cap.range.end) {
    result.errors.push(`range ${cap.range.start}-${cap.range.end} invalid in capability '${cap.name}' in channel '${channel.key}'.`);
    return false;
  }
  
  // not first capability
  const prevCap = capNumber > 0 ? channel.capabilities[capNumber-1] : null;
  if (capNumber > 0 && cap.range.start !== prevCap.range.end + 1) {
    result.errors.push(`ranges must be adjacent in capabilities '${prevCap.name}' (#${capNumber}) and '${cap.name}' (#${capNumber+1}) in channel '${channel.key}'.`);
    return false;
  }

  // last capability
  if (capNumber === channel.capabilities.length - 1) {
    const rawRangeEnd = channel.jsonObject.capabilities[capNumber].range[1];
    const possibleEndValues = getPossibleEndValues(minUsedFineness);
    
    if (!possibleEndValues.includes(rawRangeEnd)) {
      result.errors.push(`The last range has to end at ${possibleEndValues.join(' or ')} in capability '${cap.name}' (#${capNumber+1}) in channel '${channel.key}'`);
      return false;
    }
  }

  return true;
}

/**
 * Get the highest possible DMX value for each fineness up to the specified one.
 * E.g. fineness=2 -> [255, 65535, 16777215]
 * @param {!number} fineness The least used fineness in a mode of a channel.
 * @return {!number[]} Possible end values, sorted ascending.
 */
function getPossibleEndValues(fineness) {
  let values = [];
  for (let i = 0; i <= fineness; i++) {
    values.push(Math.pow(256, i+1)-1);
  }
  return values;
}

/**
 * Check that a mode is valid.
 * @param {!Mode} mode The mode to check.
 */
function checkMode(mode) {
  module.exports.checkUniqueness(
    modeNames,
    mode.name,
    `Mode name '${mode.name}' is not unique (test is not case-sensitive).`
  );
  module.exports.checkUniqueness(
    modeShortNames,
    mode.shortName,
    `Mode shortName '${mode.shortName}' is not unique (test is not case-sensitive).`
  );

  if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
    result.errors.push(`Mode name and shortName must not contain the word 'mode' in mode '${mode.shortName}'.`);
  }

  checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

  let usedNonNullChannel = false;

  for (let i = 0; i < mode.jsonObject.channels.length; i++) {
    usedNonNullChannel = usedNonNullChannel || mode.jsonObject.channels[i] !== null;
    checkModeChannelReference(i, mode);
  }

  if (!usedNonNullChannel) {
    result.errors.push(`Mode '${mode.shortName}' must not use only null channels.`);
  }
}

/**
 * Check that a channel reference in a mode is valid.
 * @param {!number} chNumber The channel index to be checked.
 * @param {!Mode} mode The mode in which to check.
 */
function checkModeChannelReference(chNumber, mode) {
  const chReference = mode.jsonObject.channels[chNumber];

  // this is a null channel 
  if (chReference === null) {
    return;
  }

  const channel = mode.fixture.getChannelByKey(chReference);
  if (channel === null) {
    result.errors.push(`Channel '${chReference}' is referenced from mode '${mode.shortName}' but is not defined.`);
    return;
  }

  usedChannelKeys.add(channel.key.toLowerCase());

  if (channel instanceof SwitchingChannel) {
    checkSwitchingChannelReference(channel, chNumber, mode);
    return;
  }

  // if earliest occurence (including switching channels) is not this one
  if (mode.getChannelIndex(channel, 'all') < chNumber) {
    result.errors.push(`Channel '${chReference}' is referenced more than once from mode '${mode.shortName}'.`);
  }

  if (channel instanceof FineChannel) {
    checkCoarserChannelsInMode(channel, mode);
    return;
  }

  checkPanTiltMaxInPhysical(channel, mode);
}

/**
 * Check that a switching channel reference in a mode is valid.
 * @param {!SwitchingChannel} channel The channel that should be checked.
 * @param {!number} chNumber The mode's channel index.
 * @param {!Mode} mode The mode in which to check.
 */
function checkSwitchingChannelReference(channel, chNumber, mode) {
  // the mode must also contain the trigger channel
  if (mode.getChannelIndex(channel.triggerChannel) === -1) {
    result.errors.push(`mode '${mode.shortName}' uses switching channel '${channel.key}' but is missing its trigger channel '${channel.triggerChannel.key}'`);
  }

  // if the channel can be switched to a fine channel, the mode must also contain coarser channels
  for (const switchToChannel of channel.switchToChannels) {
    if (switchToChannel === null) {
      // already raised an issue when switching channel was defined
      continue;
    }

    if (switchToChannel instanceof FineChannel) {
      checkCoarserChannelsInMode(switchToChannel, mode);
      continue;
    }

    checkPanTiltMaxInPhysical(switchToChannel, mode);
  }

  for (let j = 0; j < chNumber; j++) {
    const otherChannel = mode.channels[j];
    checkSwitchingChannelReferenceDuplicates(channel, otherChannel, mode);
  }
}

/**
 * Check that all switched channels in the switching channels are not appearing
 * ealier in the same mode (either directly or in another switching channel).
 * @param {!SwitchingChannel} channel The channel that should be checked.
 * @param {!AbstractChannel} otherChannel The channel that should be checked against.
 * @param {!Mode} mode The mode in which to check.
 */
function checkSwitchingChannelReferenceDuplicates(channel, otherChannel, mode) {
  if (channel.switchToChannels.includes(otherChannel)) {
    result.errors.push(`Channel '${otherChannel.key}' is referenced more than once from mode '${mode.shortName}' through switching channel '${channel.key}'.`);
    return;
  }

  if (!(otherChannel instanceof SwitchingChannel)) {
    return;
  }

  if (otherChannel.triggerChannel === channel.triggerChannel) {
    // compare ranges
    for (const switchToChannelKey of channel.switchToChannelKeys) {
      if (!otherChannel.switchToChannelKeys.includes(switchToChannelKey)) {
        return;
      }

      const overlap = channel.triggerRanges[switchToChannelKey].some(
        range => range.overlapsWithOneOf(otherChannel.triggerRanges[switchToChannelKey])
      );
      if (overlap) {
        result.errors.push(`Channel '${switchToChannelKey}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
      }
    }
  }
  else {
    // fail if one of this channel's switchToChannels appears anywhere
    const firstDuplicate = channel.switchToChannels.find(
      ch => otherChannel.usesChannelKey(ch.key, 'all')
    );
    if (firstDuplicate !== undefined) {
      result.errors.push(`Channel '${firstDuplicate.key}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
    }
  }
}

function checkCoarserChannelsInMode(channel, mode) {
  const coarseChannel = channel.coarseChannel;
  const coarserChannelKeys = coarseChannel.fineChannelAliases.filter(
    (alias, index) => index < channel.fineness - 1
  ).concat(coarseChannel.key);

  const notInMode = coarserChannelKeys.filter(
    chKey => mode.getChannelIndex(chKey) === -1
  );

  if (notInMode.length > 0) {
    result.errors.push(`Mode '${mode.shortName}' contains the fine channel '${channel.key}' but is missing its coarser channels ${notInMode}.`);
  }
}

function checkPanTiltMaxInPhysical(channel, mode) {
  if (channel.type !== 'Pan' && channel.type !== 'Tilt') {
    return;
  }

  const maxProp = channel.type === 'Pan' ? 'focusPanMax' : 'focusTiltMax';
  const maxPropDisplay = channel.type === 'Pan' ? 'panMax' : 'tiltMax';

  if (mode.physical[maxProp] === null) {
    result.warnings.push(`physical.${maxPropDisplay} is not defined although there's a ${channel.type} channel '${channel.key}' in mode '${mode.shortName}'.`);
  }
  else if (mode.physical[maxProp] === 0) {
    result.warnings.push(`physical.${maxPropDisplay} is 0 although there's a ${channel.type} channel '${channel.key}' in mode '${mode.shortName}'.`);
  }
}

function checkUnusedChannels() {
  const unused = [...definedChannelKeys].filter(
    chKey => !usedChannelKeys.has(chKey)
  );

  if (unused.length > 0) {
    result.warnings.push('Unused channel(s): ' + unused.join(', '));
  }
}

// returns whether the object contains data
function isNotEmpty(obj, messageIfEmpty) {
  if (obj !== undefined) {
    if (Object.keys(obj).length === 0) {
      result.errors.push(messageIfEmpty);
    }
    else {
      return true;
    }
  }
  return false;
}

/**
 * If the Set already contains the given value, add an error. Test is not case-sensitive.
 * @param {!Set<string>} set The Set in which all unique values are stored.
 * @param {!string} value The string value to examine.
 * @param {!string} messageIfNotUnique If the value is not unique, add this message to errors.
 */
module.exports.checkUniqueness = function checkUniqueness(set, value, messageIfNotUnique) {
  if (set.has(value.toLowerCase())) {
    result.errors.push(messageIfNotUnique);
  }
  set.add(value.toLowerCase());
};


module.exports.getErrorString = function getErrorString(description, error) {
  return description + ' ' + util.inspect(error, false, null);
};

function arraysEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a == null || b == null || a.length !== b.length) {
    return false;
  }

  return a.every((val, index) => val === b[index]);
}
