const util = require('util');

const schemas = require('../fixtures/schema.js');

const Fixture = require('../lib/model/Fixture.js');
const NullChannel = require('../lib/model/NullChannel.js');
const FineChannel = require('../lib/model/FineChannel.js');
const SwitchingChannel = require('../lib/model/SwitchingChannel.js');

let result;
let fixture;
let definedChannelKeys; // and aliases
let usedChannelKeys; // and aliases
let modeShortNames;

module.exports = function checkFixture(manKey, fixKey, fixtureJson, uniqueValues=null) {
  result = {
    errors: [],
    warnings: []
  };
  definedChannelKeys = [];
  usedChannelKeys = [];
  modeShortNames = [];

  const schemaErrors = schemas.Fixture.errors(fixtureJson);
  if (schemaErrors !== false) {
    result.errors.push(getErrorString('File does not match schema.', schemaErrors));
    return result;
  }

  try {
    fixture = new Fixture(manKey, fixKey, fixtureJson);
  }
  catch (error) {
    result.errors.push(getErrorString('File could not be imported into model.', error));
    return result;
  }

  checkFixIdentifierUniqueness(uniqueValues);
  checkMeta(fixture.meta);
  checkPhysical(fixture.physical);

  if (assumeNotEmpty(fixtureJson.availableChannels, 'availableChannels is empty. Add a channel or remove it.')) {
    for (const channel of fixture.availableChannels) {
      checkChannel(channel);
    }
  }

  for (const mode of fixture.modes) {
    checkMode(mode);
  }

  checkUnusedChannels();

  return result;
};

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
  else if (uniqueValues.fixKeysInMan[manKey].has(fixture.key.toLowerCase())) {
    result.errors.push(`key '${fixture.key}' is not unique in manufacturer ${manKey} (test is not case-sensitive).`);
  }
  uniqueValues.fixKeysInMan[manKey].add(fixture.key.toLowerCase());

  // fixture.name
  if (!(manKey in uniqueValues.fixNamesInMan)) {
    uniqueValues.fixNamesInMan[manKey] = new Set();
  }
  else if (uniqueValues.fixNamesInMan[manKey].has(fixture.name.toLowerCase())) {
    result.errors.push(`name '${fixture.name}' is not unique in manufacturer ${manKey} (test is not case-sensitive).`);
  }
  uniqueValues.fixNamesInMan[manKey].add(fixture.name.toLowerCase());
  
  // fixture.shortName
  if (uniqueValues.fixShortNames.has(fixture.shortName.toLowerCase())) {
    result.errors.push(`shortName '${fixture.shortName}' is not unique (test is not case-sensitive).`);
  }
  uniqueValues.fixShortNames.add(fixture.shortName.toLowerCase());
}

function checkMeta(meta) {
  if (meta.lastModifyDate < meta.createDate) {
    result.errors.push('meta.lastModifyDate is earlier than meta.createDate.');
  }
}

function checkPhysical(physical, modeDescription = '') {
  if (physical === null) {
    return;
  }

  const physicalJson = physical.jsonObject;
  if (assumeNotEmpty(physicalJson, `physical${modeDescription} is empty. Please remove it or add data.`)) {
    for (const property of ['bulb', 'lens', 'focus']) {
      assumeNotEmpty(physicalJson[property], `physical.${property}${modeDescription} is empty. Please remove it or add data.`);
    }
  
    if (physical.lensDegreesMin > physical.lensDegreesMax) {
      result.errors.push(`physical.lens.degreesMinMax${modeDescription} is an invalid range.`);
    }
  }
}

function checkChannel(channel) {
  definedChannelKeys.push(channel.key);

  if (/\bfine\b|\d+(?:\s|-|_)+bit/i.test(channel.name)) {
    result.errors.push(`Channel '${channel.key}' should rather be a fine channel alias of its corresponding coarse channel.`);
  }

  if (channel.type === 'Nothing') {
    const isNotEmpty = Object.keys(channel.jsonObject).some(
      prop => prop !== 'type' && prop !== 'name'
    );
    if (isNotEmpty) {
      result.errors.push(`Channel '${channel.name}' with type 'Nothing' can only set 'name' as additional property.`);
      return;
    }
  }

  let usedAsCoarseOnlyChannel = true;
  if (channel.fineChannelAliases.length > 0) {
    for (const alias of channel.fineChannelAliases) {
      if (definedChannelKeys.includes(alias)) {
        result.errors.push(`Fine channel alias '${alias}' in channel '${channel.key}' is already defined.`);
      }
      definedChannelKeys.push(alias);
    }

    usedAsCoarseOnlyChannel = fixture.modes.some(
      mode => channel.getFinenessInMode(mode) < channel.maxFineness
    );
  }

  if (channel.switchingChannelAliases.length > 0) {
    for (const alias of channel.switchingChannelAliases) {
      if (alias in definedChannelKeys) {
        result.errors.push(`Switching channel alias '${alias}' in channel '${channel.key}' is already defined.`);
      }
      definedChannelKeys.push(alias);
    }

    if (!channel.hasDefaultValue) {
      result.errors.push(`defaultValue is missing in channel '${channel.key}' although it defines switching channels.`);
    }
  }
  
  if (channel.color !== null && channel.type !== 'SingleColor') {
    result.warnings.push(`color in channel '${channel.key}' defined but channel type is not 'SingleColor'.`);
  }
  else if (channel.color === null && channel.type === 'SingleColor') {
    result.errors.push(`color in channel '${channel.key}' undefined but channel type is 'SingleColor'.`);
  }

  if (channel.hasDefaultValue && channel.defaultValue > channel.maxDmxBound) {
    result.errors.push(`defaultValue must be less or equal to ${channel.maxDmxBound} in channel '${channel.key}'.`);
  }

  if (channel.hasHighlightValue && channel.highlightValue > channel.maxDmxBound) {
    result.errors.push(`highlightValue must be less or equal to ${channel.maxDmxBound} in channel '${channel.key}'.`);
  }

  checkCapabilities(channel, usedAsCoarseOnlyChannel);
}

function checkCapabilities(channel, mustBe8Bit) {
  if (!channel.hasCapabilities) {
    return;
  }

  let rangesInvalid = false;

  for (let i = 0; i < channel.capabilities.length; i++) {
    const cap = channel.capabilities[i];
    
    // if one of the previous capabilities had an invalid range,
    // it doesn't make sense to check later ranges
    if (!rangesInvalid) {
      rangesInvalid = !checkRange(channel, i, mustBe8Bit);
    }

    if ((cap.color || cap.image) && !['MultiColor', 'Effect', 'Gobo'].includes(channel.type)) {
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
        usedChannelKeys.push(chKey);

        if (channel.fixture.getChannelByKey(chKey) === null) {
          result.errors.push(`Channel '${chKey}' is referenced from capability '${cap.name}' (#${i+1}) in channel '${channel.key}' but is not defined.`);
        }
      }
    }
  }
}

function checkRange(channel, capNumber, mustBe8Bit) {
  const cap = channel.capabilities[capNumber];
  const prevCap = capNumber > 0 ? channel.capabilities[capNumber-1] : null;

  if (capNumber === 0 && cap.range.start !== 0) {
    result.errors.push(`The first range has to start at 0 in capability '${cap.name}' (#${capNumber+1}) in channel '${channel.key}'.`);
    return false;
  }

  if (cap.range.start > cap.range.end) {
    result.errors.push(`range invalid in capability '${cap.name}' (#${capNumber+1}) in channel '${channel.key}'.`);
    return false;
  }

  if (capNumber > 0 && cap.range.start !== prevCap.range.end + 1) {
    result.errors.push(`ranges must be adjacent in capabilities '${prevCap.name}' (#${capNumber}) and '${cap.name}' (#${capNumber+1}) in channel '${channel.key}'.`);
    return false;
  }

  if (capNumber === channel.capabilities.length - 1) {
    const rawRangeEnd = channel.jsonObject.capabilities[capNumber].range[1];
    
    if (rawRangeEnd !== 255 && mustBe8Bit) {
      result.errors.push(`The last range has to end at 255 in capability '${cap.name}' (#${capNumber+1}), because channel '${channel.key}' is used in coarse only mode.`);
      return false;
    }

    if (rawRangeEnd !== 255 && rawRangeEnd !== channel.maxDmxBound) {
      result.errors.push(`The last range has to end at either 255 or ${channel.maxDmxBound} in capability '${cap.name}' (#${capNumber+1}) in channel '${channel.key}'.`);
      return false;
    }
  }

  return true;
}

function checkMode(mode) {
  if (modeShortNames.includes(mode.shortName)) {
    result.errors.push(`Mode shortName '${mode.shortName}' not unique.`);
  }
  modeShortNames.push(mode.shortName);

  if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
    result.errors.push(`Mode name and shortName must not contain the word 'mode' in mode '${mode.shortName}'.`);
  }

  checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

  let modeChannelKeyCount = {};

  for (let i = 0; i < mode.jsonObject.channels.length; i++) {
    checkModeChannelReference(i, mode, modeChannelKeyCount);
  }

  const duplicateChannelReferences = Object.keys(modeChannelKeyCount).filter(
    chKey => modeChannelKeyCount[chKey] > 1
  );
  if (duplicateChannelReferences.length > 0) {
    result.errors.push(`Channels ${duplicateChannelReferences} are used more than once in mode '${mode.shortName}'.`);
  }
}

function checkModeChannelReference(chNumber, mode, modeChKeyCount) {
  const chKey = mode.jsonObject.channels[chNumber];

  if (typeof chKey !== 'string') {
    checkMatrixReference(chKey, modeChKeyCount);
    return;
  }

  const channel = mode.fixture.getChannelByKey(chKey);
  if (channel === null) {
    result.errors.push(`Channel '${chKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
    return;
  }

  if (channel instanceof NullChannel) {
    return;
  }

  usedChannelKeys.push(channel.key);
  modeChKeyCount[channel.key] = (modeChKeyCount[channel.key] || 0) + 1;

  if (channel instanceof SwitchingChannel) {
    checkSwitchingChannelReference(channel, mode, modeChKeyCount);
    return;
  }

  if (channel instanceof FineChannel) {
    checkCoarserChannelsInMode(channel, mode);
    return;
  }

  if (channel.type === 'Pan' || channel.type === 'Tilt') {
    checkPanTiltMaxInPhysical(channel, mode);
  }
}

function checkMatrixReference(reference, modeChKeyCount) {
  // TODO
}

function checkSwitchingChannelReference(channel, mode, modeChKeyCount) {
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

    modeChKeyCount[switchToChannel.key] = (modeChKeyCount[switchToChannel.key] || 0) + 1;

    if (switchToChannel instanceof FineChannel) {
      checkCoarserChannelsInMode(switchToChannel, mode);
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
  const unused = definedChannelKeys.filter(
    chKey => !usedChannelKeys.includes(chKey)
  );

  if (unused.length > 0) {
    result.warnings.push(`Channels ${unused} defined but never used.`);
  }
}

// returns whether the object contains data
function assumeNotEmpty(obj, messageIfEmpty) {
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


function getErrorString(description, error) {
  return description + ' ' + util.inspect(error, false, null);
}

function arraysEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a == null || b == null || a.length !== b.length) {
    return false;
  }

  return a.every((val, index) => val === b[index]);
}
