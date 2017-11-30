const util = require('util');

const schema = require('../fixtures/schema.js');

const Fixture = require('../lib/model/Fixture.js');
const Channel = require('../lib/model/Channel.js');
const FineChannel = require('../lib/model/FineChannel.js');
const SwitchingChannel = require('../lib/model/SwitchingChannel.js');
const MatrixChannel = require('../lib/model/MatrixChannel.js');

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
let possibleMatrixChKeys; // and aliases
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
 * @returns {ResultData} The result object containing errors and warnings, if any.
 */
module.exports = function checkFixture(manKey, fixKey, fixtureJson, uniqueValues = null) {
  result = {
    errors: [],
    warnings: []
  };
  definedChannelKeys = new Set();
  usedChannelKeys = new Set();
  possibleMatrixChKeys = new Set();
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
    checkMatrix(fixture.matrix);
    checkTemplateChannels(fixtureJson);
    checkChannels(fixtureJson);

    for (const mode of fixture.modes) {
      checkMode(mode);
    }

    checkUnusedChannels();
    checkCategories();
    checkRdm(manKey, uniqueValues);
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
    result,
    `Fixture key '${fixture.key}' is not unique in manufacturer ${manKey} (test is not case-sensitive).`
  );

  // fixture.name
  if (!(manKey in uniqueValues.fixNamesInMan)) {
    uniqueValues.fixNamesInMan[manKey] = new Set();
  }
  module.exports.checkUniqueness(
    uniqueValues.fixNamesInMan[manKey],
    fixture.name,
    result,
    `Fixture name '${fixture.name}' is not unique in manufacturer ${manKey} (test is not case-sensitive).`
  );

  // fixture.shortName
  module.exports.checkUniqueness(
    uniqueValues.fixShortNames,
    fixture.shortName,
    result,
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
 * Checks if the given Matrix object is valid.
 * @param {?Matrix} matrix A fixture's matrix data.
 */
function checkMatrix(matrix) {
  if (matrix === null) {
    return;
  }

  const matrixJson = matrix.jsonObject;
  const hasPixelCount = 'pixelCount' in matrixJson;
  const hasPixelKeys = 'pixelKeys' in matrixJson;

  if (!hasPixelCount && !hasPixelKeys) {
    result.errors.push('Matrix must either define \'pixelCount\' or \'pixelKeys\'.');
    return;
  }
  if (hasPixelCount && hasPixelKeys) {
    result.errors.push('Matrix can\'t define both \'pixelCount\' and \'pixelKeys\'.');
    return;
  }

  if (matrix.definedAxes.length === 0) {
    result.errors.push('Matrix may not consist of only a single pixel.');
    return;
  }

  const variesInAxisLength = matrix.pixelKeys.some(
    rows => rows.length !== matrix.pixelCountY || rows.some(
      columns => columns.length !== matrix.pixelCountX
    )
  );
  if (variesInAxisLength) {
    result.errors.push('Matrix must not vary in axis length.');
  }

  checkPixelGroups(matrix);
}

/**
 * Check if the referenced pixelKeys from the pixelGroups exist and are not referenced more than once.
 * @param {Matrix} matrix The Matrix instance
 */
function checkPixelGroups(matrix) {
  for (const pixelGroupKey of matrix.pixelGroupKeys) {
    const usedPixelKeys = new Set();

    if (pixelGroupKey in matrix.pixelKeyPositions) {
      result.errors.push(`pixelGroupKey '${pixelGroupKey}' is already used as pixelKey. Please choose a different name.`);
    }

    for (const pixelKey of matrix.pixelGroups[pixelGroupKey]) {
      if (!(pixelKey in matrix.pixelKeyPositions)) {
        result.errors.push(`pixelGroup '${pixelGroupKey}' references unknown pixelKey '${pixelKey}'.`);
      }
      if (usedPixelKeys.has(pixelKey)) {
        result.errors.push(`pixelGroup '${pixelGroupKey}' can't reference pixelKey '${pixelKey}' more than once.`);
      }
      usedPixelKeys.add(pixelKey);
    }
  }
}

/**
 * Check if templateChannels are defined correctly. Does not check the channel data itself.
 * @param {!object} fixtureJson The fixture's JSON data
 */
function checkTemplateChannels(fixtureJson) {
  if (isNotEmpty(fixtureJson.templateChannels, 'templateChannels are empty. Add a channel or remove it.')) {
    if (fixture.matrix === null) {
      result.errors.push('templateChannels are defined but matrix data is missing.');
      return;
    }

    for (const templateChannel of fixture.templateChannels) {
      checkTemplateChannel(templateChannel);
    }
  }
  else if (fixture.matrix !== null) {
    result.errors.push('Matrix is defined but templateChannels are missing.');
  }
}

/**
 * Check if the templateChannel is defined correctly. Does not check the channel data itself.
 * @param {!TemplateChannel} templateChannel The templateChannel to examine.
 */
function checkTemplateChannel(templateChannel) {
  checkTemplateVariables(templateChannel.name, ['$pixelKey']);

  for (const key of templateChannel.allTemplateKeys) {
    checkTemplateVariables(key, ['$pixelKey']);
    if (!(key in fixture.usedPixelKeys)) {
      result.warnings.push(`Template channel '${key}' is never used.`);
    }
  }

  for (const key of templateChannel.matrixChannelKeys.keys()) {
    module.exports.checkUniqueness(
      possibleMatrixChKeys,
      key,
      result,
      `Generated channel key ${key} can be produced by multiple template channels (test is not case-sensitive).`
    );
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

  for (const channel of fixture.matrixChannels) {
    if (channel.wrappedChannel instanceof Channel) {
      checkChannel(channel.wrappedChannel);
    }
  }
}

/**
 * Check that an available or template channel is valid.
 * @param {!Channel} channel The channel to test.
 */
function checkChannel(channel) {
  checkTemplateVariables(channel.key);
  module.exports.checkUniqueness(
    definedChannelKeys,
    channel.key,
    result,
    `Channel key '${channel.key}' is already defined in another letter case.`
  );

  if (/\bfine\b|\d+(?:\s|-|_)*bit/i.test(channel.name)) {
    // channel name contains the word "fine" or "16bit" / "8 bit" / "32-bit" / "24_bit"
    result.errors.push(`Channel '${channel.key}' should rather be a fine channel alias of its corresponding coarse channel.`);
  }
  checkTemplateVariables(channel.name);

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
    checkTemplateVariables(alias);
    module.exports.checkUniqueness(
      definedChannelKeys,
      alias,
      result,
      `Fine channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
    );
  }
  const minUsedFineness = Math.min(...fixture.modes.map(
    mode => channel.getFinenessInMode(mode)
  ));

  // Switching channels
  for (const alias of channel.switchingChannelAliases) {
    checkTemplateVariables(alias);
    module.exports.checkUniqueness(
      definedChannelKeys,
      alias,
      result,
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
 * Checks whether the specified string contains only allowed and all required variables
 * and pushes an error on wrong variable usage.
 * @param {!string} str The string to be checked.
 * @param {!string[]} [requiredVariables=[]] Variables that must be included in the string. Specify them with leading dollar sign ($var).
 * @param {!string[]} [allowedVariables=[]] Variables that may be included in the string; requiredVariables are automatically included. Specify them with leading dollar sign ($var).
 */
function checkTemplateVariables(str, requiredVariables = [], allowedVariables = []) {
  allowedVariables = allowedVariables.concat(requiredVariables);

  const variables = str.match(/\$\w+/g) || [];
  for (const variable of variables) {
    if (!allowedVariables.includes(variable)) {
      result.errors.push(`Variable ${variable} not allowed in '${str}'`);
    }
  }
  for (const variable of requiredVariables) {
    if (!variables.includes(variable)) {
      result.errors.push(`Variable ${variable} missing in '${str}'`);
    }
  }
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
      result.errors.push(`color or image present in capability '${cap.name}' (#${i + 1}) but improper channel type '${channel.type}' in channel '${channel.key}'.`);
    }

    if (cap.color2 && !cap.color) {
      result.errors.push(`color2 present but color missing in capability '${cap.name}' (#${i + 1}) in channel '${channel.key}'.`);
    }

    if (cap.color && cap.image) {
      result.errors.push(`color and image cannot be present at the same time in capability '${cap.name}' (#${i + 1}) in channel '${channel.key}'.`);
    }

    const switchingChannelAliases = Object.keys(cap.switchChannels);
    if (!arraysEqual(switchingChannelAliases, channel.switchingChannelAliases)) {
      result.errors.push(`Capability '${cap.name}' (#${i + 1}) must define the same switching channel aliases as all other capabilities in channel '${channel.key}'.`);
    }
    else {
      for (const alias of switchingChannelAliases) {
        const chKey = cap.switchChannels[alias];
        usedChannelKeys.add(chKey.toLowerCase());

        if (channel.fixture.getChannelByKey(chKey) === null) {
          result.errors.push(`Channel '${chKey}' is referenced from capability '${cap.name}' (#${i + 1}) in channel '${channel.key}' but is not defined.`);
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
 * @returns {boolean} true if the range is valid, false otherwise. The global `result` object is updated then.
 */
function checkRange(channel, capNumber, minUsedFineness) {
  const cap = channel.capabilities[capNumber];

  // first capability
  if (capNumber === 0 && cap.range.start !== 0) {
    result.errors.push(`The first range has to start at 0 in capability '${cap.name}' (#${capNumber + 1}) in channel '${channel.key}'.`);
    return false;
  }

  // all capabilities
  if (cap.range.start > cap.range.end) {
    result.errors.push(`range invalid in capability '${cap.name}' (#${capNumber + 1}) in channel '${channel.key}'.`);
    return false;
  }

  // not first capability
  const prevCap = capNumber > 0 ? channel.capabilities[capNumber - 1] : null;
  if (capNumber > 0 && cap.range.start !== prevCap.range.end + 1) {
    result.errors.push(`ranges must be adjacent in capabilities '${prevCap.name}' (#${capNumber}) and '${cap.name}' (#${capNumber + 1}) in channel '${channel.key}'.`);
    return false;
  }

  // last capability
  if (capNumber === channel.capabilities.length - 1) {
    const rawRangeEnd = channel.jsonObject.capabilities[capNumber].range[1];
    const possibleEndValues = getPossibleEndValues(minUsedFineness);

    if (!possibleEndValues.includes(rawRangeEnd)) {
      result.errors.push(`The last range has to end at ${possibleEndValues.join(' or ')} in capability '${cap.name}' (#${capNumber + 1}) in channel '${channel.key}'`);
      return false;
    }
  }

  return true;
}

/**
 * Get the highest possible DMX value for each fineness up to the specified one.
 * E.g. fineness=2 -> [255, 65535, 16777215]
 * @param {!number} fineness The least used fineness in a mode of a channel.
 * @returns {!Array.<number>} Possible end values, sorted ascending.
 */
function getPossibleEndValues(fineness) {
  const values = [];
  for (let i = 0; i <= fineness; i++) {
    values.push(Math.pow(256, i + 1) - 1);
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
    result,
    `Mode name '${mode.name}' is not unique (test is not case-sensitive).`
  );
  module.exports.checkUniqueness(
    modeShortNames,
    mode.shortName,
    result,
    `Mode shortName '${mode.shortName}' is not unique (test is not case-sensitive).`
  );

  if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
    result.errors.push(`Mode name and shortName must not contain the word 'mode' in mode '${mode.shortName}'.`);
  }

  if (mode.name.match(/^(\d+)(?:\s+|\-)?(?:ch|channels?)$/)) {
    const intendedLength = parseInt(RegExp.$1);

    if (mode.channels.length !== intendedLength) {
      result.warnings.push(`Mode '${mode.name}' should probably have ${RegExp.$1} channels but does only have ${mode.channels.length}.`);
    }
    if (mode.shortName !== `${intendedLength}ch`) {
      result.warnings.push(`Mode '${mode.name}' should have shortName '${intendedLength}ch' instead of '${mode.shortName}'.`);
    }
  }

  checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

  const usedChannelKeysInMode = new Set();

  for (const rawReference of mode.jsonObject.channels) {
    if (rawReference !== null && typeof rawReference !== 'string') {
      checkChannelInsertBlock(rawReference, mode);
    }
  }

  for (let i = 0; i < mode.channelKeys.length; i++) {
    checkModeChannelKeys(i, mode, usedChannelKeysInMode);
  }
}

/**
 * Checks if the given complex channel insert block is valid.
 * @param {!Object} complexData The raw JSON data of the insert block.
 * @param {!Mode} mode The mode in which this insert block is used.
 */
function checkChannelInsertBlock(complexData, mode) {
  switch (complexData.insert) {
    case 'matrixChannels':
      checkMatrixInsert(complexData, mode);
      return;

    // we need no default as other values are prohibited by the schema
  }
}

/**
 * Checks the given matrix channel insert.
 * @param {!object} matrixInsert The matrix channel reference specified in the mode's json channel list.
 * @param {'matrixChannels'} matrixInsert.insert Indicates that this is a matrix insert.
 * @param {'eachPixel'|'eachPixelGroup'|string[]} matrixInsert.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
 * @param {'perPixel'|'perChannel'} matrixInsert.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
 * @param {!Array.<string, null>} matrixInsert.templateChannels The template channel keys (and aliases) or null channels to be repeated.
 * @param {!Mode} mode The mode in which this insert block is used.
 */
function checkMatrixInsert(matrixInsert, mode) {
  // custom repeat list
  if (!['eachPixel', 'eachPixelGroup'].includes(matrixInsert.repeatFor)) {
    const usedPixelKeys = new Set();

    for (const pixelKey of matrixInsert.repeatFor) {
      if (pixelKey in fixture.matrix.pixelKeyPositions) {
        module.exports.checkUniqueness(
          usedPixelKeys,
          pixelKey,
          `PixelKey '${pixelKey}' is used more than once in repeatFor in mode '${mode.shortName}'.`
        );
      }
      else if (pixelKey in fixture.matrix.pixelGroups) {
        for (const singlePixelKey of fixture.matrix.pixelGroups[pixelKey]) {
          module.exports.checkUniqueness(
            usedPixelKeys,
            singlePixelKey,
            `PixelKey '${singlePixelKey}' in group '${pixelKey}' is used more than once in repeatFor in mode '${mode.shortName}'.`
          );
        }
      }
      else {
        result.errors.push(`Unknown pixelKey or pixelGroupKey '${pixelKey}'`);
      }
    }
  }

  for (const templateKey of matrixInsert.templateChannels) {
    const templateChannelExists = fixture.templateChannels.some(ch => ch.allTemplateKeys.includes(templateKey));
    if (!templateChannelExists) {
      result.errors.push(`Template channel '${templateKey}' doesn\'t exist.`);
    }
  }
}

/**
 * Check that a channel reference in a mode is valid.
 * @param {!number} chIndex The mode's channel index.
 * @param {!Mode} mode The mode to check.
 * @param {!Set<string>} usedChannelKeysInMode Which channels are already used in this mode.
 */
function checkModeChannelKeys(chIndex, mode, usedChannelKeysInMode) {
  const chKey = mode.channelKeys[chIndex];

  let channel = mode.fixture.getChannelByKey(chKey);
  if (channel === null) {
    result.errors.push(`Channel '${chKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
    return;
  }

  if (channel instanceof MatrixChannel) {
    channel = channel.wrappedChannel;
  }

  usedChannelKeys.add(channel.key.toLowerCase());
  checkChannelUniquenessInMode(chKey, mode, usedChannelKeysInMode);

  if (channel instanceof SwitchingChannel) {
    checkSwitchingChannelReference(channel, mode, usedChannelKeysInMode);
    return;
  }

  // if earliest occurence (including switching channels) is not this one
  if (mode.getChannelIndex(channel, 'all') < chIndex) {
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
 * @param {!Mode} mode The mode in which the channel is used.
 * @param {!Set<string>} usedChannelKeysInMode Which channels are already used in this mode.
 */
function checkSwitchingChannelReference(channel, mode, usedChannelKeysInMode) {
  // the mode must also contain the trigger channel
  if (mode.getChannelIndex(channel.triggerChannel) === -1) {
    result.errors.push(`mode '${mode.shortName}' uses switching channel '${channel.key}' but is missing its trigger channel '${channel.triggerChannel.key}'`);
  }

  for (const switchToChannel of channel.switchToChannels) {
    if (switchToChannel === null) {
      // channel doesn't exist, but we already added an error when the switching channel was defined
      continue;
    }

    // if the channel can be switched to a fine channel, the mode must also contain coarser channels
    if (switchToChannel instanceof FineChannel) {
      checkCoarserChannelsInMode(switchToChannel, mode);
      continue;
    }

    checkPanTiltMaxInPhysical(switchToChannel, mode);
  }

  for (let j = 0; j < mode.getChannelIndex(channel); j++) {
    const otherChannel = mode.channels[j];
    checkSwitchingChannelReferenceDuplicate(channel, otherChannel, mode);
  }
}

/**
 * Check all switched channels in the switching channels against another channel
 * for duplicate channel usage (either directly or in another switching channel).
 * @param {!SwitchingChannel} channel The channel that should be checked.
 * @param {!AbstractChannel} otherChannel The channel that should be checked against.
 * @param {!Mode} mode The mode in which to check.
 */
function checkSwitchingChannelReferenceDuplicate(channel, otherChannel, mode) {
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

/**
 * A mode must not use the same channel (key) more than once.
 * @param {!string} channelKey The channel to test if it was already used in the mode.
 * @param {!Mode} mode The respective Mode object.
 * @param {!Set<string>} usedChannelKeysInMode Which channels are already used in this mode. Also counts switched to channels.
 */
function checkChannelUniquenessInMode(channelKey, mode, usedChannelKeysInMode) {
  module.exports.checkUniqueness(usedChannelKeysInMode, channelKey, result, `Channel '${channelKey}' is used more than once in ${mode.shortName}`);
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
    result.warnings.push(`Unused channel(s): ${unused.join(', ')}`);
  }
}

/**
 * Checks if the used channels fits to the fixture's categories and raise warnings suggesting to add/remove a category.
 */
function checkCategories() {
  const fixtureChannels = fixture.availableChannels.concat(fixture.matrixChannels.map(matrixCh => matrixCh.wrappedChannel));

  const hasMultiColorChannel = fixtureChannels.some(channel => channel.type === 'Multi-Color');
  const hasMultipleSingleColorChannels = fixtureChannels.filter(channel => channel.type === 'Single Color').length > 1;
  const hasColorChangerCategory = fixture.categories.includes('Color Changer');
  if (!hasColorChangerCategory && hasMultiColorChannel) {
    result.warnings.push('Category \'Color Changer\' suggested since there is a \'Multi-Color\' channel.');
  }
  else if (!hasColorChangerCategory && hasMultipleSingleColorChannels) {
    result.warnings.push('Category \'Color Changer\' suggested since there are multiple \'Single Color\' channels.');
  }
  else if (hasColorChangerCategory && !hasMultiColorChannel && !hasMultipleSingleColorChannels) {
    result.warnings.push('Category \'Color Changer\' invalid since there is no \'Multi-Color\' and less than 2 \'Single Color\' channels.');
  }

  const hasFocusTypeHead = fixture.physical !== null && fixture.physical.focusType === 'Head';
  const hasMovingHeadCategory = fixture.categories.includes('Moving Head');
  if (!hasMovingHeadCategory && hasFocusTypeHead) {
    result.warnings.push('Category \'Moving Head\' suggested since focus.type is \'Head\'.');
  }
  else if (hasMovingHeadCategory && !hasFocusTypeHead) {
    result.warnings.push('Category \'Moving Head\' invalid since focus.type is not \'Head\'.');
  }

  const hasFogChannel = fixtureChannels.some(channel => channel.type === 'Fog');
  const hasSmokeCategory = fixture.categories.includes('Smoke');
  const hasHazerCategory = fixture.categories.includes('Hazer');
  if (!(hasSmokeCategory || hasHazerCategory) && hasFogChannel) {
    result.warnings.push('Categories \'Smoke\' and/or \'Hazer\' suggested since there is a \'Fog\' channel.');
  }
  else if (hasSmokeCategory && !hasFogChannel) {
    result.warnings.push('Category \'Smoke\' invalid since there is no \'Fog\' channel.');
  }
  else if (hasHazerCategory && !hasFogChannel) {
    result.warnings.push('Category \'Hazer\' invalid since there is no \'Fog\' channel.');
  }
}

/**
 * Checks if everything regarding this fixture's RDM data is correct.
 * @param {!string} manKey The manufacturer key.
 * @param {?UniqueValues} [uniqueValues=null] Values that have to be unique are checked and all new occurences are appended.
 */
function checkRdm(manKey, uniqueValues) {
  if (fixture.rdm === null) {
    // modes may not have a rdmPersonalityIndex property
    for (const mode of fixture.modes) {
      if (mode.rdmPersonalityIndex !== null) {
        result.errors.push(`Mode '${mode.shortName}' has RDM data, but fixture has not.`);
      }
    }
    return;
  }

  // fixture.rdm.modelId must be unique per manufacturer
  if (!(manKey in uniqueValues.fixRdmIdsInMan)) {
    uniqueValues.fixRdmIdsInMan[manKey] = new Set();
  }
  module.exports.checkUniqueness(
    uniqueValues.fixRdmIdsInMan[manKey],
    `${fixture.rdm.modelId}`,
    result,
    `Fixture RDM model ID '${fixture.rdm.modelId}' is not unique in manufacturer ${manKey}.`
  );

  if (fixture.manufacturer.rdmId === null) {
    result.errors.push(`Fixture has RDM data, but manufacturer '${fixture.manufacturer.shortName}' has not.`);
  }

  const rdmPersonalityIndices = new Set();
  for (const mode of fixture.modes) {
    if (mode.rdmPersonalityIndex !== null) {
      module.exports.checkUniqueness(
        rdmPersonalityIndices,
        `${mode.rdmPersonalityIndex}`,
        result,
        `RDM personality index '${mode.rdmPersonalityIndex}' in mode '${mode.shortName}' is not unique in the fixture.`
      );
    }
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
 * @param {!ResultData} result The object to add the error message to (if any).
 * @param {!string} messageIfNotUnique If the value is not unique, add this message to errors.
 */
module.exports.checkUniqueness = function checkUniqueness(set, value, result, messageIfNotUnique) {
  if (set.has(value.toLowerCase())) {
    result.errors.push(messageIfNotUnique);
  }
  set.add(value.toLowerCase());
};


module.exports.getErrorString = function getErrorString(description, error) {
  return `${description} ${util.inspect(error, false, null)}`;
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
