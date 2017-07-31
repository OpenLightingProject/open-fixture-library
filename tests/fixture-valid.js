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

module.exports = function checkFixture(manKey, fixKey, fixtureJson, usedShortNames=[]) {
  result = {
    errors: [],
    warnings: [],
    usedShortNames: usedShortNames
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

  if (result.usedShortNames.includes(fixture.shortName)) {
    result.errors.push(`shortName '${fixture.shortName}' is not unique.`);
  }
  result.usedShortNames.push(fixture.shortName);

  checkMeta(fixture.meta);
  checkPhysical(fixture.physical);

  const availableChannels = fixture.availableChannels;
  if (availableChannels.length === 0) {
    result.errors.push('availableChannels is empty. Please add a channel.');
  }
  else {
    for (const channel of availableChannels) {
      checkChannel(channel);
    }
  }

  for (const mode of fixture.modes) {
    checkMode(mode);
  }

  checkUnusedChannels();

  return result;
};

function checkMeta(meta) {
  if (meta.lastModifyDate < meta.createDate) {
    result.errors.push('meta.lastModifyDate is earlier than meta.createDate.');
  }
}

function checkPhysical(physical, modeDescription = '') {
  if (physical == null) {
    return;
  }

  const physicalJson = physical.jsonObject;

  if (Object.keys(physicalJson).length === 0) {
    result.errors.push(`physical${modeDescription} is empty. Please remove it or add data.`);
    return;
  }

  for (const property of ['bulb', 'lens', 'focus']) {
    if (property in physicalJson && Object.keys(physicalJson[property]).length === 0) {
      result.errors.push(`physical.${property}${modeDescription} is empty. Please remove it or add data.`);
    }
  }

  if (physical.lensDegreesMin > physical.lensDegreesMax) {
    result.errors.push(`physical.lens.degreesMinMax${modeDescription} is an invalid range.`);
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
    const prevCap = i > 0 ? channel.capabilities[i-1] : null;

    // if one of the previous capabilities had an invalid range,
    // it doesn't make sense to check later ranges
    if (!rangesInvalid) {
      if (i === 0 && cap.range.start !== 0) {
        result.errors.push(`The first range has to start at 0 in capability '${cap.name}' (#${i+1}) in channel '${channel.key}'.`);
        rangesInvalid = true;
      }
      else if (cap.range.start > cap.range.end) {
        result.errors.push(`range invalid in capability '${cap.name}' (#${i+1}) in channel '${channel.key}'.`);
        rangesInvalid = true;
      }
      else if (i > 0 && cap.range.start !== prevCap.range.end + 1) {
        result.errors.push(`ranges must be adjacent in capabilities '${prevCap.name}' (#${i}) and '${cap.name}' (#${i+1}) in channel '${channel.key}'.`);
        rangesInvalid = true;
      }
      else if (i === channel.capabilities.length - 1) {
        const rawRangeEnd = channel.jsonObject.capabilities[i].range[1];
        
        if (rawRangeEnd !== 255 && mustBe8Bit) {
          result.errors.push(`The last range has to end at 255 in capability '${cap.name}' (#${i+1}), because channel '${channel.key}' is used in coarse only mode.`);
        }
        else if (rawRangeEnd !== 255 && rawRangeEnd !== channel.maxDmxBound) {
          result.errors.push(`The last range has to end at either 255 or ${channel.maxDmxBound} in capability '${cap.name}' (#${i+1}) in channel '${channel.key}'.`);
        }
      }
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

function checkMode(mode) {
  if (modeShortNames.includes(mode.shortName)) {
    result.errors.push(`Mode shortName '${mode.shortName}' not unique.`);
  }
  modeShortNames.push(mode.shortName);

  if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
    result.errors.push(`Mode name and shortName must not contain the word 'mode' in mode '${mode.shortName}'.`);
  }

  checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

  for (const chKey of mode.channelKeys) {
    const channel = mode.fixture.getChannelByKey(chKey);

    if (channel === null) {
      result.errors.push(`Channel '${chKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
      continue;
    }

    if (channel instanceof NullChannel) {
      continue;
    }

    usedChannelKeys.push(channel.key);

    if (channel instanceof FineChannel) {
      checkCoarserChannelsInMode(channel, mode);
      continue;
    }

    if (channel instanceof SwitchingChannel) {
      // the mode must also contain the trigger channel
      if (mode.getChannelIndex(channel.triggerChannel) === -1) {
        result.errors.push(`mode '${mode.shortName}' uses switching channel '${channel.key}' but is missing its trigger channel '${channel.triggerChannel.key}'`);
      }

      // if the channel can be switched to a fine channel, the mode must also contain coarser channels
      for (const switchToChannel of channel.switchToChannels) {
        if (switchToChannel instanceof FineChannel) {
          checkCoarserChannelsInMode(switchToChannel, mode);
        }
      }

      continue;
    }

    if (channel.type === 'Pan' || channel.type === 'Tilt') {
      checkPanTiltMaxInPhysical(channel, mode);
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
