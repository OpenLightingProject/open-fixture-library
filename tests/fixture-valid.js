const util = require(`util`);
const Ajv = require(`ajv`);

const fixtureSchema = require(`../schemas/dereferenced/fixture.json`);

const {
  Channel,
  FineChannel,
  Fixture,
  MatrixChannel,
  SwitchingChannel
} = require(`../lib/model.js`);

/**
 * Checks that a given fixture JSON object is valid.
 * @param {!string} manKey The manufacturer key.
 * @param {!string} fixKey The fixture key.
 * @param {?object} fixtureJson The fixture JSON object.
 * @param {?UniqueValues} [uniqueValues=null] Values that have to be unique are checked and all new occurences are appended.
 * @returns {ResultData} The result object containing errors and warnings, if any.
 */
module.exports = function checkFixture(manKey, fixKey, fixtureJson, uniqueValues = null) {
  /**
   * @typedef ResultData
   * @type {object}
   * @property {string[]} errors
   * @property {string[]} warnings
   */
  const result = {
    errors: [],
    warnings: []
  };

  /** @type {Fixture} */
  let fixture;

  /** @type {Set<string>} */
  const definedChannelKeys = new Set(); // and aliases
  /** @type {Set<string>} */
  const usedChannelKeys = new Set(); // and aliases
  /** @type {Set<string>} */
  const possibleMatrixChKeys = new Set(); // and aliases
  /** @type {Set<string>} */
  const modeNames = new Set();
  /** @type {Set<string>} */
  const modeShortNames = new Set();


  const validate = (new Ajv()).compile(fixtureSchema);
  const valid = validate(fixtureJson);
  if (!valid) {
    result.errors.push(module.exports.getErrorString(`File does not match schema.`, validate.errors));
    return result;
  }

  try {
    /** @type {Fixture} */
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
    result.errors.push(module.exports.getErrorString(`File could not be imported into model.`, error));
  }

  return result;

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
      result.errors.push(`meta.lastModifyDate is earlier than meta.createDate.`);
    }
  }

  /**
   * Checks if the given Physical object is valid.
   * @param {?Physical} physical A fixture's or a mode's physical data.
   * @param {!string} [modeDescription=''] Optional information in error messages about current mode.
   */
  function checkPhysical(physical, modeDescription = ``) {
    if (physical === null) {
      return;
    }

    if (physical.lensDegreesMin > physical.lensDegreesMax) {
      result.errors.push(`physical.lens.degreesMinMax${modeDescription} is an invalid range.`);
    }

    if (physical.hasMatrixPixels && fixture.matrix === null) {
      result.errors.push(`physical.matrixPixels is set but fixture.matrix is missing.`);
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

    if (matrix.definedAxes.length === 0) {
      result.errors.push(`Matrix may not consist of only a single pixel.`);
      return;
    }

    const variesInAxisLength = matrix.pixelKeyStructure.some(
      rows => rows.length !== matrix.pixelCountY || rows.some(
        columns => columns.length !== matrix.pixelCountX
      )
    );
    if (variesInAxisLength) {
      result.errors.push(`Matrix must not vary in axis length.`);
    }

    checkPixelGroups();

    /**
     * Check if the referenced pixelKeys from the pixelGroups exist and are not referenced more than once.
     */
    function checkPixelGroups() {
      for (const pixelGroupKey of matrix.pixelGroupKeys) {
        const usedMatrixChannels = new Set();

        if (matrix.pixelKeys.includes(pixelGroupKey)) {
          result.errors.push(`pixelGroupKey '${pixelGroupKey}' is already used as pixelKey. Please choose a different name.`);
        }

        for (const pixelKey of matrix.pixelGroups[pixelGroupKey]) {
          if (!matrix.pixelKeys.includes(pixelKey)) {
            result.errors.push(`pixelGroup '${pixelGroupKey}' references unknown pixelKey '${pixelKey}'.`);
          }
          if (usedMatrixChannels.has(pixelKey)) {
            result.errors.push(`pixelGroup '${pixelGroupKey}' can't reference pixelKey '${pixelKey}' more than once.`);
          }
          usedMatrixChannels.add(pixelKey);
        }
      }
    }
  }

  /**
   * Check if templateChannels are defined correctly. Does not check the channel data itself.
   * @param {!object} fixtureJson The fixture's JSON data
   */
  function checkTemplateChannels(fixtureJson) {
    if (fixtureJson.templateChannels) {
      for (const templateChannel of fixture.templateChannels) {
        checkTemplateChannel(templateChannel);
      }
    }
  }

  /**
   * Check if the templateChannel is defined correctly. Does not check the channel data itself.
   * @param {!TemplateChannel} templateChannel The templateChannel to examine.
   */
  function checkTemplateChannel(templateChannel) {
    checkTemplateVariables(templateChannel.name, [`$pixelKey`]);

    for (const key of templateChannel.allTemplateKeys) {
      checkTemplateVariables(key, [`$pixelKey`]);

      const templateChannelUsed = fixture.matrixChannelReferences.some(
        ref => ref.templateKey === key
      );
      if (!templateChannelUsed) {
        result.warnings.push(`Template channel '${key}' is never used.`);
      }
    }

    for (const key of templateChannel.possibleResolvedChannelKeys.keys()) {
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
    for (const channel of fixture.availableChannels) {
      // forbid coexistance of channels 'Red' and 'red'
      // for template channels, this is checked by possibleMatrixChKeys
      module.exports.checkUniqueness(
        definedChannelKeys,
        channel.key,
        result,
        `Channel key '${channel.key}' is already defined (maybe in another letter case).`
      );
      checkChannel(channel);
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
    checkTemplateVariables(channel.key, []);

    if (/\bfine\b|\d+(?:\s|-|_)*bit/i.test(channel.name)) {
      // channel name contains the word "fine" or "16bit" / "8 bit" / "32-bit" / "24_bit"
      result.errors.push(`Channel '${channel.key}' should rather be a fine channel alias of its corresponding coarse channel.`);
    }
    checkTemplateVariables(channel.name, []);

    // Fine channels
    for (const alias of channel.fineChannelAliases) {
      checkTemplateVariables(alias, []);
      module.exports.checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Fine channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
      );
    }

    // Switching channels
    for (const alias of channel.switchingChannelAliases) {
      checkTemplateVariables(alias, []);
      module.exports.checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Switching channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
      );
    }

    if (channel.hasDefaultValue && channel.defaultValue > channel.maxDmxBound) {
      result.errors.push(`defaultValue must be less or equal to ${channel.maxDmxBound} in channel '${channel.key}'.`);
    }

    if (channel.hasHighlightValue && channel.highlightValue > channel.maxDmxBound) {
      result.errors.push(`highlightValue must be less or equal to ${channel.maxDmxBound} in channel '${channel.key}'.`);
    }

    if (channel.hasCapabilities) {
      checkCapabilities(channel);
    }

    /**
     * Check that the channel's capabilities are valid.
     */
    function checkCapabilities() {
      let rangesInvalid = false;

      for (let i = 0; i < channel.capabilities.length; i++) {
        const cap = channel.capabilities[i];

        // if one of the previous capabilities had an invalid range,
        // it doesn't make sense to check later ranges
        if (!rangesInvalid) {
          rangesInvalid = !checkRange(i);
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
     * @param {!number} capNumber The number of the capability in the channel, starting with 0.
     * @returns {boolean} true if the range is valid, false otherwise. The global `result` object is updated then.
     */
    function checkRange(capNumber) {
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
        const possibleEndValues = getPossibleEndValues();

        if (!possibleEndValues.includes(rawRangeEnd)) {
          result.errors.push(`The last range has to end at ${possibleEndValues.join(` or `)} in capability '${cap.name}' (#${capNumber + 1}) in channel '${channel.key}'`);
          return false;
        }
      }

      return true;

      /**
       * @returns {!Array.<number>} All DMX values that would be valid maximum DMX bounds, sorted ascending.
       * Depends on the lowest fineness with which the channel is used in any mode.
       */
      function getPossibleEndValues() {
        const minUsedFineness = Math.min(...fixture.modes.map(
          mode => channel.getFinenessInMode(mode)
        ));

        const values = [];
        for (let i = 0; i <= minUsedFineness; i++) {
          values.push(Math.pow(256, i + 1) - 1);
        }
        
        return values;
      }
    }
  }

  /**
   * Checks whether the specified string contains all allowed and no disallowed variables and pushes an error on wrong variable usage.
   * @param {!string} str The string to be checked.
   * @param {!Array.<string>} allowedVariables Variables that must be included in the string; all other variables are forbidden. Specify them with leading dollar sign ($var).
   */
  function checkTemplateVariables(str, allowedVariables) {
    const usedVariables = str.match(/\$\w+/g) || [];
    for (const usedVariable of usedVariables) {
      if (!allowedVariables.includes(usedVariable)) {
        result.errors.push(`Variable ${usedVariable} not allowed in '${str}'`);
      }
    }
    for (const allowedVariable of allowedVariables) {
      if (!usedVariables.includes(allowedVariable)) {
        result.errors.push(`Variable ${allowedVariable} missing in '${str}'`);
      }
    }
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

    // "6ch" / "8-Channel" / "9 channels" mode names
    if (mode.name.toLowerCase().match(/^(\d+)(?:\s+|-)?(?:ch|channels?)$/)) {
      const intendedLength = parseInt(RegExp.$1);

      if (mode.channels.length !== intendedLength) {
        result.warnings.push(`Mode '${mode.name}' should probably have ${RegExp.$1} channels but actually has ${mode.channels.length}.`);
      }
      if (mode.shortName !== `${intendedLength}ch`) {
        result.warnings.push(`Mode '${mode.name}' should have shortName '${intendedLength}ch'.`);
      }
    }

    checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

    for (const rawReference of mode.jsonObject.channels) {
      if (rawReference !== null && typeof rawReference !== `string`) {
        checkChannelInsertBlock(rawReference, mode);
      }
    }

    const usedChannelKeysInMode = new Set();
    for (let i = 0; i < mode.channelKeys.length; i++) {
      checkModeChannelKey(i);
    }

    /**
     * Checks if the given complex channel insert block is valid.
     * @param {!object} insertBlock The raw JSON data of the insert block.
     */
    function checkChannelInsertBlock(insertBlock) {
      if (insertBlock.insert === `matrixChannels`) {
        checkMatrixInsertBlock(insertBlock);
      }
      // open for future extensions (invalid values are prohibited by the schema)

      /**
       * Checks the given matrix channel insert.
       * @param {!object} matrixInsertBlock The matrix channel reference specified in the mode's json channel list.
       * @param {'matrixChannels'} matrixInsertBlock.insert Indicates that this is a matrix insert.
       * @param {'eachPixel'|'eachPixelGroup'|string[]} matrixInsertBlock.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
       * @param {'perPixel'|'perChannel'} matrixInsertBlock.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
       * @param {!Array.<string, null>} matrixInsertBlock.templateChannels The template channel keys (and aliases) or null channels to be repeated.
       */
      function checkMatrixInsertBlock(matrixInsertBlock) {
        checkMatrixInsertBlockRepeatFor();

        for (const templateKey of matrixInsertBlock.templateChannels) {
          const templateChannelExists = fixture.templateChannels.some(ch => ch.allTemplateKeys.includes(templateKey));
          if (!templateChannelExists) {
            result.errors.push(`Template channel '${templateKey}' doesn't exist.`);
          }
        }

        /**
         * Checks the used pixel (group) keys for existance and duplicates. Also respects pixel keys included in a pixel group.
         */
        function checkMatrixInsertBlockRepeatFor() {
          if (typeof matrixInsertBlock.repeatFor === `string`) {
            // no custom pixel key list, keywords are already tested by schema
            return;
          }

          const usedPixelKeys = new Set();

          // simple uniqueness is already checked by schema, but this test also checks for pixelKeys in pixelGroups
          for (const pixelKey of matrixInsertBlock.repeatFor) {
            if (fixture.matrix.pixelKeys.includes(pixelKey)) {
              module.exports.checkUniqueness(
                usedPixelKeys,
                pixelKey,
                `PixelKey '${pixelKey}' is used more than once in repeatFor in mode '${mode.shortName}'.`
              );
            }
            else if (pixelKey in fixture.matrix.pixelGroups) {
              module.exports.checkUniqueness(
                usedPixelKeys,
                pixelKey,
                `PixelGroupKey '${pixelKey}' is used more than once in repeatFor in mode '${mode.shortName}'.`
              );

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
      }
    }

    /**
     * Check that a channel reference in a mode is valid.
     * @param {!number} chIndex The mode's channel index.
     */
    function checkModeChannelKey(chIndex) {
      const chKey = mode.channelKeys[chIndex];

      if (chKey === null) {
        return;
      }

      usedChannelKeys.add(chKey.toLowerCase());

      let channel = mode.fixture.getChannelByKey(chKey);
      if (channel === null) {
        result.errors.push(`Channel '${chKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
        return;
      }

      // if earliest occurence (including switching channels) is not this one
      if (mode.getChannelIndex(channel, `all`) < chIndex) {
        result.errors.push(`Channel '${channel.key}' is referenced more than once from mode '${mode.shortName}' (maybe through switching channels).`);
      }

      if (channel instanceof MatrixChannel) {
        channel = channel.wrappedChannel;
      }

      if (channel instanceof SwitchingChannel) {
        checkSwitchingChannelReference(channel, mode, usedChannelKeysInMode);
      }
      else if (channel instanceof FineChannel) {
        checkCoarserChannelsInMode(channel, mode);
      }
      else {
        // that's already checked for switched channels and we don't need to check it for fine channels
        checkPanTiltMaxInPhysical(channel, mode);
      }
    }
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
      checkSwitchingChannelReferenceDuplicate(otherChannel);
    }

    /**
     * Check all switched channels in the switching channels against another channel
     * for duplicate channel usage (either directly or in another switching channel).
     * @param {!AbstractChannel} otherChannel The channel that should be checked against.
     */
    function checkSwitchingChannelReferenceDuplicate(otherChannel) {
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
          ch => otherChannel.usesChannelKey(ch.key, `all`)
        );
        if (firstDuplicate !== undefined) {
          result.errors.push(`Channel '${firstDuplicate.key}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
        }
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
    if (channel.type !== `Pan` && channel.type !== `Tilt`) {
      return;
    }

    const maxProp = channel.type === `Pan` ? `focusPanMax` : `focusTiltMax`;
    const maxPropDisplay = channel.type === `Pan` ? `panMax` : `tiltMax`;

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
      result.warnings.push(`Unused channel(s): ${unused.join(`, `)}`);
    }
  }

  /**
   * Checks if the used channels fits to the fixture's categories and raise warnings suggesting to add/remove a category.
   */
  function checkCategories() {
    const fixtureChannels = fixture.availableChannels.concat(fixture.matrixChannels.map(matrixCh => matrixCh.wrappedChannel));

    const hasMultiColorChannel = fixtureChannels.some(channel => channel.type === `Multi-Color`);
    const hasMultipleSingleColorChannels = fixtureChannels.filter(channel => channel.type === `Single Color`).length > 1;
    const hasColorChangerCategory = fixture.categories.includes(`Color Changer`);
    if (!hasColorChangerCategory && hasMultiColorChannel) {
      result.warnings.push(`Category 'Color Changer' suggested since there is a 'Multi-Color' channel.`);
    }
    else if (!hasColorChangerCategory && hasMultipleSingleColorChannels) {
      result.warnings.push(`Category 'Color Changer' suggested since there are multiple 'Single Color' channels.`);
    }
    else if (hasColorChangerCategory && !hasMultiColorChannel && !hasMultipleSingleColorChannels) {
      result.warnings.push(`Category 'Color Changer' invalid since there is no 'Multi-Color' and less than 2 'Single Color' channels.`);
    }

    const hasFocusTypeHead = fixture.physical !== null && fixture.physical.focusType === `Head`;
    const hasMovingHeadCategory = fixture.categories.includes(`Moving Head`);
    if (!hasMovingHeadCategory && hasFocusTypeHead) {
      result.warnings.push(`Category 'Moving Head' suggested since focus.type is 'Head'.`);
    }
    else if (hasMovingHeadCategory && !hasFocusTypeHead) {
      result.warnings.push(`Category 'Moving Head' invalid since focus.type is not 'Head'.`);
    }

    const hasFogChannel = fixtureChannels.some(channel => channel.type === `Fog`);
    const hasSmokeCategory = fixture.categories.includes(`Smoke`);
    const hasHazerCategory = fixture.categories.includes(`Hazer`);
    if (!(hasSmokeCategory || hasHazerCategory) && hasFogChannel) {
      result.warnings.push(`Categories 'Smoke' and/or 'Hazer' suggested since there is a 'Fog' channel.`);
    }
    else if (hasSmokeCategory && !hasFogChannel) {
      result.warnings.push(`Category 'Smoke' invalid since there is no 'Fog' channel.`);
    }
    else if (hasHazerCategory && !hasFogChannel) {
      result.warnings.push(`Category 'Hazer' invalid since there is no 'Fog' channel.`);
    }
  }

  /**
   * Checks if everything regarding this fixture's RDM data is correct.
   * @param {!string} manKey The manufacturer key.
   * @param {?UniqueValues} [uniqueValues=null] Values that have to be unique are checked and all new occurences are appended.
   */
  function checkRdm(manKey, uniqueValues) {
    if (fixture.rdm === null) {
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
};

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
