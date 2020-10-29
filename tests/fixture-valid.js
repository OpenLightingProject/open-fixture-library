const { inspect } = require(`util`);
const Ajv = require(`ajv`);

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const register = require(`../fixtures/register.json`);
const plugins = require(`../plugins/plugins.json`);
const fixtureSchema = require(`../schemas/dereferenced/fixture.json`);
const fixtureRedirectSchema = require(`../schemas/dereferenced/fixture-redirect.json`);
const schemaProperties = require(`../lib/schema-properties.js`).default;
const { getResourceFromString } = require(`../lib/model.js`);
const getAjvErrorMessages = require(`../lib/get-ajv-error-messages.js`);

/** @typedef {import('../lib/model/AbstractChannel.js').default} AbstractChannel */
/** @typedef {import('../lib/model/Capability.js').default} Capability */
/** @typedef {import('../lib/model/CoarseChannel.js').default} CoarseChannel */
const { FineChannel } = require(`../lib/model.js`);
const { Fixture } = require(`../lib/model.js`);
/** @typedef {import('../lib/model/Matrix.js').default} Matrix */
/** @typedef {import('../lib/model/Meta.js').default} Meta */
const { NullChannel } = require(`../lib/model.js`);
/** @typedef {import('../lib/model/Physical.js').default} Physical */
/** @typedef {import('../lib/model/TemplateChannel.js').default} TemplateChannel */
const { SwitchingChannel } = require(`../lib/model.js`);
/** @typedef {import('../lib/model/Wheel.js').default} Wheel */

const ajv = new Ajv({
  format: `full`,
  formats: {
    'color-hex': ``,
  },
  verbose: true,
});
const schemaValidate = ajv.compile(fixtureSchema);
const redirectSchemaValidate = ajv.compile(fixtureRedirectSchema);

/**
 * Checks that a given fixture JSON object is valid.
 * @param {String} manufacturerKey The manufacturer key.
 * @param {String} fixKey The fixture key.
 * @param {Object|null} fixtureJson The fixture JSON object.
 * @param {UniqueValues|null} [uniqueValues=null] Values that have to be unique are checked and all new occurrences are appended.
 * @returns {ResultData} The result object containing errors and warnings, if any.
 */
function checkFixture(manufacturerKey, fixKey, fixtureJson, uniqueValues = null) {
  /**
   * @typedef {Object} ResultData
   * @property {Array.<String>} errors All errors of this fixture.
   * @property {Array.<String>} warnings All warnings of this fixture.
   */

  /** @type {ResultData} */
  const result = {
    errors: [],
    warnings: [],
  };

  /** @type {Fixture} */
  let fixture;

  /** @type {Set.<String>} */
  const definedChannelKeys = new Set(); // and aliases
  /** @type {Set.<String>} */
  const usedChannelKeys = new Set(); // and aliases
  /** @type {Set.<String>} */
  const possibleMatrixChKeys = new Set(); // and aliases
  /** @type {Set.<String>} */
  const usedWheels = new Set();
  /** @type {Set.<String>} */
  const usedWheelSlots = new Set();

  /** @type {Set.<String>} */
  const modeNames = new Set();
  /** @type {Set.<String>} */
  const modeShortNames = new Set();

  if (!(`$schema` in fixtureJson)) {
    result.errors.push(getErrorString(`File does not contain '$schema' property.`));
    return result;
  }

  if (fixtureJson.$schema.endsWith(`/fixture-redirect.json`)) {
    checkFixtureRedirect();
    return result;
  }


  const schemaValid = schemaValidate(fixtureJson);
  if (!schemaValid) {
    const errorMessages = getAjvErrorMessages(schemaValidate.errors, `fixture`);
    result.errors.push(...errorMessages.map(message => getErrorString(`File does not match schema:`, message)));
    return result;
  }

  try {
    fixture = new Fixture(manufacturerKey, fixKey, fixtureJson);

    checkFixIdentifierUniqueness();
    checkMeta(fixture.meta);
    checkPhysical(fixture.physical);
    checkMatrix(fixture.matrix);
    checkWheels(fixture.wheels);
    checkTemplateChannels();
    checkChannels(fixtureJson);

    for (const mode of fixture.modes) {
      checkMode(mode);
    }

    checkUnusedChannels();
    checkUnusedWheels();
    checkUnusedWheelSlots();
    checkCategories();
    checkRdm();
  }
  catch (error) {
    result.errors.push(getErrorString(`File could not be imported into model.`, error));
  }

  return result;



  /**
   * Checks that a fixture redirect file is valid and redirecting to a fixture correctly.
   */
  function checkFixtureRedirect() {
    const redirectSchemaValid = redirectSchemaValidate(fixtureJson);

    if (!redirectSchemaValid) {
      result.errors.push(getErrorString(`File does not match schema.`, redirectSchemaValidate.errors));
    }

    if (!(fixtureJson.redirectTo in register.filesystem) || `redirectTo` in register.filesystem[fixtureJson.redirectTo]) {
      result.errors.push(`'redirectTo' is not a valid fixture.`);
    }

    result.name = `${manufacturerKey}/${fixKey}.json (redirect)`;
  }

  /**
   * Checks that fixture key, name and shortName are unique.
   */
  function checkFixIdentifierUniqueness() {
    // test is called for a single fixture, e.g. when importing
    if (uniqueValues === null) {
      return;
    }

    // fixture.key
    if (!(manufacturerKey in uniqueValues.fixKeysInMan)) {
      uniqueValues.fixKeysInMan[manufacturerKey] = new Set();
    }
    checkUniqueness(
      uniqueValues.fixKeysInMan[manufacturerKey],
      fixture.key,
      result,
      `Fixture key '${fixture.key}' is not unique in manufacturer ${manufacturerKey} (test is not case-sensitive).`,
    );

    // fixture.name
    if (!(manufacturerKey in uniqueValues.fixNamesInMan)) {
      uniqueValues.fixNamesInMan[manufacturerKey] = new Set();
    }
    checkUniqueness(
      uniqueValues.fixNamesInMan[manufacturerKey],
      fixture.name,
      result,
      `Fixture name '${fixture.name}' is not unique in manufacturer ${manufacturerKey} (test is not case-sensitive).`,
    );

    // fixture.shortName
    checkUniqueness(
      uniqueValues.fixShortNames,
      fixture.shortName,
      result,
      `Fixture shortName '${fixture.shortName}' is not unique (test is not case-sensitive).`,
    );
  }

  /**
   * Check that a fixture's meta block is valid.
   * @param {Meta} meta The fixture's Meta object.
   */
  function checkMeta(meta) {
    if (meta.lastModifyDate < meta.createDate) {
      result.errors.push(`meta.lastModifyDate is earlier than meta.createDate.`);
    }

    if (meta.importPlugin) {
      const pluginData = plugins.data[meta.importPlugin];
      const isImportPlugin = plugins.importPlugins.includes(meta.importPlugin);
      const isOutdatedImportPlugin = pluginData && plugins.importPlugins.includes(pluginData.newPlugin);

      if (!(isImportPlugin || isOutdatedImportPlugin)) {
        result.errors.push(`Unknown import plugin ${meta.importPlugin}`);
      }
    }
  }

  /**
   * Checks if the given Physical object is valid.
   * @param {Physical|null} physical A fixture's or a mode's physical data.
   * @param {String} [modeDescription=''] Optional information in error messages about current mode.
   */
  function checkPhysical(physical, modeDescription = ``) {
    if (physical === null) {
      return;
    }

    if (physical.lensDegreesMin > physical.lensDegreesMax) {
      result.errors.push(`physical.lens.degreesMinMax${modeDescription} is an invalid range.`);
    }

    if (physical.hasMatrixPixels) {
      if (fixture.matrix === null) {
        result.errors.push(`physical.matrixPixels is set but fixture.matrix is missing.`);
      }
      else if (physical.matrixPixelsSpacing !== null) {
        [`X`, `Y`, `Z`].forEach((axis, index) => {
          if (physical.matrixPixelsSpacing[index] !== 0 && !fixture.matrix.definedAxes.includes(axis)) {
            result.errors.push(`physical.matrixPixels.spacing is nonzero for ${axis} axis, but no pixels are defined in that axis.`);
          }
        });
      }
    }
  }

  /**
   * Checks if the given Matrix object is valid.
   * @param {Matrix|null} matrix A fixture's matrix data.
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
        columns => columns.length !== matrix.pixelCountX,
      ),
    );
    if (variesInAxisLength) {
      result.errors.push(`Matrix must not vary in axis length.`);
    }

    if (`pixelGroups` in matrix.jsonObject) {
      checkPixelGroups();
    }

    /**
     * Check if the referenced pixelKeys from the pixelGroups exist and are not referenced more than once.
     */
    function checkPixelGroups() {
      const pixelGroupKeys = Object.keys(matrix.jsonObject.pixelGroups);

      pixelGroupKeys.forEach(pixelGroupKey => {
        const usedMatrixChannels = new Set();

        if (matrix.pixelKeys.includes(pixelGroupKey)) {
          result.errors.push(`pixelGroupKey '${pixelGroupKey}' is already used as pixelKey. Please choose a different name.`);
        }

        if (matrix.pixelGroups[pixelGroupKey].length === 0) {
          // this can only happen through invalid constraints, empty arrays are caught by the schema
          result.errors.push(`pixelGroup '${pixelGroupKey}' does not contain any pixelKeys. Please relax the pixel key constraints.`);
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
      });
    }
  }

  /**
   * Checks if the fixture's wheels are correct.
   * @param {Array.<Wheel>} wheels The fixture's Wheel instances.
   */
  function checkWheels(wheels) {
    for (const wheel of wheels) {
      if (!/\b(?:wheel|disk)\b/i.test(wheel.name)) {
        result.warnings.push(`Name of wheel '${wheel.name}' does not contain the word 'wheel' or 'disk', which could lead to confusing capability names.`);
      }

      const expectedAnimationGoboEndSlots = [];
      const foundAnimationGoboEndSlots = [];

      wheel.slots.forEach((slot, index) => {
        if (slot.type === `AnimationGoboStart`) {
          expectedAnimationGoboEndSlots.push(index + 1);
        }
        else if (slot.type === `AnimationGoboEnd`) {
          foundAnimationGoboEndSlots.push(index);
        }

        if (typeof slot.resource === `string`) {
          try {
            getResourceFromString(slot.resource);
          }
          catch (error) {
            result.errors.push(error.message);
          }
        }
      });

      if (!arraysEqual(expectedAnimationGoboEndSlots, foundAnimationGoboEndSlots)) {
        result.errors.push(`An 'AnimationGoboEnd' slot must be used after an 'AnimationGoboStart' slot in wheel ${wheel.name}. (${expectedAnimationGoboEndSlots}; ${foundAnimationGoboEndSlots})`);
      }
    }
  }

  /**
   * Check if templateChannels are defined correctly. Does not check the channel data itself.
   */
  function checkTemplateChannels() {
    if (fixtureJson.templateChannels) {
      for (const templateChannel of fixture.templateChannels) {
        checkTemplateChannel(templateChannel);
      }
    }
  }

  /**
   * Check if the templateChannel is defined correctly. Does not check the channel data itself.
   * @param {TemplateChannel} templateChannel The templateChannel to examine.
   */
  function checkTemplateChannel(templateChannel) {
    checkTemplateVariables(templateChannel.name, [`$pixelKey`]);

    for (const templateKey of templateChannel.allTemplateKeys) {
      checkTemplateVariables(templateKey, [`$pixelKey`]);

      const possibleMatrixChannelKeys = templateChannel.possibleMatrixChannelKeys.get(templateKey);

      const templateChannelUsed = fixture.allChannelKeys.some(
        chKey => possibleMatrixChannelKeys.includes(chKey),
      );
      if (!templateChannelUsed) {
        result.warnings.push(`Template channel '${templateKey}' is never used.`);
      }

      for (const chKey of possibleMatrixChannelKeys) {
        checkUniqueness(
          possibleMatrixChKeys,
          chKey,
          result,
          `Generated channel key ${chKey} can be produced by multiple template channels (test is not case-sensitive).`,
        );
      }
    }
  }

  /**
   * Check if all channels are defined correctly.
   */
  function checkChannels() {
    for (const channel of fixture.coarseChannels) {
      if (!(channel instanceof NullChannel)) {
        // forbid coexistence of channels 'Red' and 'red'
        checkUniqueness(
          definedChannelKeys,
          channel.key,
          result,
          `Channel key '${channel.key}' is already defined (maybe in another letter case).`,
        );
        checkChannel(channel);
      }
    }
  }

  /**
   * Check that an available or template channel is valid.
   * @param {CoarseChannel} channel The channel to test.
   */
  function checkChannel(channel) {
    checkTemplateVariables(channel.key, []);

    if (/\bfine\b|\d+[\s_-]*bit/i.test(channel.name)) {
      // channel name contains the word "fine" or "16bit" / "8 bit" / "32-bit" / "24_bit"
      result.errors.push(`Channel '${channel.key}' should rather be a fine channel alias of its corresponding coarse channel.`);
    }
    checkTemplateVariables(channel.name, []);

    if (channel.type === `Unknown`) {
      result.errors.push(`Channel '${channel.key}' has an unknown type.`);
    }

    // Fine channels
    channel.fineChannelAliases.forEach(alias => {
      checkTemplateVariables(alias, []);
      checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Fine channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`,
      );
    });

    // Switching channels
    channel.switchingChannelAliases.forEach(alias => {
      checkTemplateVariables(alias, []);
      checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Switching channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`,
      );
    });

    const maxDmxValue = Math.pow(256, channel.dmxValueResolution) - 1;

    checkChannelDmxValues();
    checkCapabilities();


    /**
     * Check that DMX values used in the channel are correct.
     */
    function checkChannelDmxValues() {
      if (channel.dmxValueResolution > channel.maxResolution) {
        result.errors.push(`dmxValueResolution must be less or equal to ${channel.maxResolution * 8}bit in channel '${channel.key}'.`);
      }

      if (channel.hasDefaultValue && channel.getDefaultValueWithResolution(channel.dmxValueResolution) > maxDmxValue) {
        result.errors.push(`defaultValue must be less or equal to ${maxDmxValue} in channel '${channel.key}'.`);
      }

      if (channel.hasHighlightValue && channel.getHighlightValueWithResolution(channel.dmxValueResolution) > maxDmxValue) {
        result.errors.push(`highlightValue must be less or equal to ${maxDmxValue} in channel '${channel.key}'.`);
      }
    }

    /**
     * Check that the channel's capabilities are valid.
     */
    function checkCapabilities() {
      let dmxRangesInvalid = false;

      for (let index = 0; index < channel.capabilities.length; index++) {
        const cap = channel.capabilities[index];

        // if one of the previous capabilities had an invalid range,
        // it doesn't make sense to check later ranges
        if (!dmxRangesInvalid) {
          dmxRangesInvalid = !checkDmxRange(index);
        }

        checkCapability(cap, `Capability '${cap.name}' (${cap.rawDmxRange}) in channel '${channel.key}'`);
      }

      /**
       * Check that a capability's range is valid.
       * @param {Number} capNumber The number of the capability in the channel, starting with 0.
       * @returns {Boolean} True if the range is valid, false otherwise. The global `result` object is updated then.
       */
      function checkDmxRange(capNumber) {
        const cap = channel.capabilities[capNumber];

        return checkFirstCapabilityRangeStart()
          && checkRangeValid()
          && checkRangesAdjacent()
          && checkLastCapabilityRangeEnd();


        /**
         * Checks that the first capability's DMX range starts with 0.
         * @returns {Boolean} True if this is not the first capability or it starts with 0, false otherwise.
         */
        function checkFirstCapabilityRangeStart() {
          if (capNumber === 0 && cap.rawDmxRange.start !== 0) {
            result.errors.push(`The first dmxRange has to start at 0 in capability '${cap.name}' (${cap.rawDmxRange}) in channel '${channel.key}'.`);
            return false;
          }

          return true;
        }

        /**
         * @returns {Boolean} True if this capability's DMX range is valid, i.e. the end is greater than or equal to the start, false otherwise.
         */
        function checkRangeValid() {
          if (cap.rawDmxRange.start > cap.rawDmxRange.end) {
            result.errors.push(`dmxRange invalid in capability '${cap.name}' (${cap.rawDmxRange}) in channel '${channel.key}'.`);
            return false;
          }

          return true;
        }

        /**
         * @returns {Boolean} True if this capability's DMX range start is adjacent to the previous capability's DMX range end, false otherwise.
         */
        function checkRangesAdjacent() {
          if (capNumber > 0) {
            const previousCap = channel.capabilities[capNumber - 1];

            if (cap.rawDmxRange.start !== previousCap.rawDmxRange.end + 1) {
              result.errors.push(`dmxRanges must be adjacent in capabilities '${previousCap.name}' (${previousCap.rawDmxRange}) and '${cap.name}' (${cap.rawDmxRange}) in channel '${channel.key}'.`);
              return false;
            }
          }

          return true;
        }

        /**
         * Checks that the last capability's DMX range is one of the allowed values, e.g. 255 or 65535 for 16bit channels.
         * @returns {Boolean} True if this is not the last capability or it ends with an allowed value, false otherwise.
         */
        function checkLastCapabilityRangeEnd() {
          if (capNumber === channel.capabilities.length - 1) {
            if (channel.capabilities[capNumber].rawDmxRange.end !== maxDmxValue) {
              result.errors.push(`The last dmxRange has to end at ${maxDmxValue} (or another channel.dmxValueResolution must be chosen) in capability '${cap.name}' (${cap.rawDmxRange}) in channel '${channel.key}'`);
              return false;
            }
          }

          return true;
        }
      }

      /**
       * Check that a capability is valid (except its DMX range).
       * @param {Capability} cap The capability to check.
       * @param {String} errorPrefix An identifier for the capability to use in errors and warnings.
       */
      function checkCapability(cap, errorPrefix) {
        const switchingChannelAliases = Object.keys(cap.switchChannels);
        if (!arraysEqual(switchingChannelAliases, channel.switchingChannelAliases)) {
          result.errors.push(`${errorPrefix} must define the same switching channel aliases as all other capabilities.`);
        }
        else {
          switchingChannelAliases.forEach(alias => {
            const chKey = cap.switchChannels[alias];
            usedChannelKeys.add(chKey.toLowerCase());

            if (channel.fixture.getChannelByKey(chKey) === null) {
              result.errors.push(`${errorPrefix} references unknown channel '${chKey}'.`);
            }
          });
        }

        cap.usedStartEndEntities.forEach(property => {
          const [startEntity, endEntity] = cap[property];

          if ((startEntity.keyword === null) !== (endEntity.keyword === null)) {
            result.errors.push(`${errorPrefix} must use keywords for start and end value or for none of them in ${property}.`);
          }
          else if (startEntity.unit !== endEntity.unit) {
            result.errors.push(`${errorPrefix} uses different units for ${property}.`);
          }

          if (property === `speed` && startEntity.number * endEntity.number < 0) {
            result.errors.push(`${errorPrefix} uses different signs (+ or –) in ${property} (maybe behind a keyword). Consider splitting it into several capabilities.`);
          }
        });

        const capabilityTypeChecks = {
          ShutterStrobe: checkShutterStrobeCapability,
          Pan: checkPanTiltCapability,
          Tilt: checkPanTiltCapability,
          WheelSlot: checkWheelCapability,
          WheelShake: checkWheelCapability,
          WheelSlotRotation: checkWheelCapability,
          WheelRotation: checkWheelCapability,
          Effect: checkEffectCapability,
        };

        if (Object.keys(capabilityTypeChecks).includes(cap.type)) {
          capabilityTypeChecks[cap.type]();
        }


        /**
         * Type-specific checks for ShutterStrobe capabilities.
         */
        function checkShutterStrobeCapability() {
          if ([`Closed`, `Open`].includes(cap.shutterEffect)) {
            if (cap.isSoundControlled) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't be sound-controlled.`);
            }

            if (cap.speed !== null || cap.duration !== null) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't define speed or duration.`);
            }

            if (cap.randomTiming) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't have random timing.`);
            }
          }
        }

        /**
         * Check that referenced wheels exist in the fixture.
         */
        function checkWheelCapability() {
          let shouldCheckSlotNumbers = true;

          if (`wheel` in cap.jsonObject) {
            const wheelNames = [].concat(cap.jsonObject.wheel);

            wheelNames.forEach(wheelName => {
              const wheel = fixture.getWheelByName(wheelName);
              if (wheel) {
                usedWheels.add(wheelName);
              }
              else {
                result.errors.push(`${errorPrefix} references wheel '${wheelName}' which is not defined in the fixture.`);
                shouldCheckSlotNumbers = false;
              }
            });

            if (wheelNames.length === 1 && wheelNames[0] === cap._channel.name) {
              result.warnings.push(`${errorPrefix} explicitly references wheel '${wheelNames[0]}', which is the default anyway (through the channel name). Please remove the 'wheel' property.`);
            }
          }
          else if (cap.wheels.includes(null)) {
            result.errors.push(`${errorPrefix} does not explicitly reference any wheel, but the default wheel '${cap._channel.name}' (through the channel name) does not exist.`);
            shouldCheckSlotNumbers = false;
          }
          else {
            usedWheels.add(cap._channel.name);
          }

          if (cap.slotNumber !== null && shouldCheckSlotNumbers) {
            checkSlotNumbers();
          }


          /**
           * Check that slot indices are used correctly for the specific wheel.
           */
          function checkSlotNumbers() {
            const min = Math.min(cap.slotNumber[0], cap.slotNumber[1]);
            const max = Math.max(cap.slotNumber[0], cap.slotNumber[1]);
            for (let index = Math.floor(min); index <= Math.ceil(max); index++) {
              usedWheelSlots.add(`${cap.wheels[0].name} (slot ${index})`);
            }

            if (max - min > 1) {
              result.warnings.push(`${errorPrefix} references a wheel slot range (${min}…${max}) which is greater than 1.`);
            }

            const minSlotNumber = 1;
            const maxSlotNumber = cap.wheels[0].slots.length;

            const isInRangeExclusive = (number, start, end) => number > start && number < end;
            const isInRangeInclusive = (number, start, end) => number >= start && number <= end;

            if (cap.slotNumber[0].equals(cap.slotNumber[1])) {
              if (!isInRangeExclusive(cap.slotNumber[0].number, minSlotNumber - 1, maxSlotNumber + 1)) {
                result.errors.push(`${errorPrefix} references wheel slot ${cap.slotNumber[0].number} which is outside the allowed range ${minSlotNumber - 1}…${maxSlotNumber + 1} (exclusive).`);
              }
              return;
            }

            if (!isInRangeInclusive(cap.slotNumber[0].number, minSlotNumber - 1, maxSlotNumber)) {
              result.errors.push(`${errorPrefix} starts at wheel slot ${cap.slotNumber[0].number} which is outside the allowed range ${minSlotNumber - 1}…${maxSlotNumber} (inclusive).`);
            }
            else if (!isInRangeInclusive(cap.slotNumber[1].number, minSlotNumber, maxSlotNumber + 1)) {
              result.errors.push(`${errorPrefix} ends at wheel slot ${cap.slotNumber[1].number} which is outside the allowed range ${minSlotNumber}…${maxSlotNumber + 1} (inclusive).`);
            }
          }
        }

        /**
         * Type-specific checks for Pan and Tilt capabilities.
         */
        function checkPanTiltCapability() {
          const usesPercentageAngle = cap.angle[0].unit === `%`;
          if (usesPercentageAngle) {
            result.warnings.push(`${errorPrefix} defines an imprecise percentaged angle. Please to try find the value in degrees.`);
          }
        }

        /**
         * Type-specific checks for Effect capabilities.
         */
        function checkEffectCapability() {
          if (cap.effectPreset === null && schemaProperties.definitions.effectPreset.enum.includes(cap.effectName)) {
            result.errors.push(`${errorPrefix} must use effectPreset instead of effectName with '${cap.effectName}'.`);
          }

          if (!cap.isSoundControlled && cap.soundSensitivity !== null) {
            result.errors.push(`${errorPrefix} can't set soundSensitivity if soundControlled is not true.`);
          }
        }
      }
    }
  }

  /**
   * Check that a mode is valid.
   * @param {Mode} mode The mode to check.
   */
  function checkMode(mode) {
    checkUniqueness(
      modeNames,
      mode.name,
      result,
      `Mode name '${mode.name}' is not unique (test is not case-sensitive).`,
    );
    checkUniqueness(
      modeShortNames,
      mode.shortName,
      result,
      `Mode shortName '${mode.shortName}' is not unique (test is not case-sensitive).`,
    );

    // "6ch" / "8-Channel" / "9 channels" mode names
    [`name`, `shortName`].forEach(nameProperty => {
      if (mode[nameProperty].match(/(\d+)(?:\s+|-|)(?:channels?|ch)/i)) {
        const intendedLength = Number.parseInt(RegExp.$1, 10);

        if (mode.channels.length !== intendedLength) {
          result.errors.push(`Mode '${mode.name}' should have ${RegExp.$1} channels according to its ${nameProperty} but actually has ${mode.channels.length}.`);
        }

        const allowedShortNames = [`${intendedLength}ch`, `Ch${intendedLength}`, `Ch0${intendedLength}`];
        if (mode[nameProperty].length === RegExp.lastMatch.length && !allowedShortNames.includes(mode.shortName)) {
          result.warnings.push(`Mode '${mode.name}' should have shortName '${intendedLength}ch' instead of '${mode.shortName}'.`);
        }
      }
    });

    checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

    for (const rawReference of mode.jsonObject.channels) {
      if (rawReference !== null && typeof rawReference !== `string`) {
        checkChannelInsertBlock(rawReference, mode);
      }
    }

    mode.channelKeys.forEach((chKey, index) => checkModeChannelKey(index));

    /**
     * Checks if the given complex channel insert block is valid.
     * @param {Object} insertBlock The raw JSON data of the insert block.
     */
    function checkChannelInsertBlock(insertBlock) {
      if (insertBlock.insert === `matrixChannels`) {
        checkMatrixInsertBlock(insertBlock);
      }
      // open for future extensions (invalid values are prohibited by the schema)

      /**
       * Checks the given matrix channel insert.
       * @param {Object} matrixInsertBlock The matrix channel reference specified in the mode's json channel list.
       * @param {'matrixChannels'} matrixInsertBlock.insert Indicates that this is a matrix insert.
       * @param {'eachPixel'|'eachPixelGroup'|Array.<String>} matrixInsertBlock.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
       * @param {'perPixel'|'perChannel'} matrixInsertBlock.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
       * @param {Array.<String|null>} matrixInsertBlock.templateChannels The template channel keys (and aliases) or null channels to be repeated.
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
         * Checks the used pixel (group) keys for existence and duplicates. Also respects pixel keys included in a pixel group.
         */
        function checkMatrixInsertBlockRepeatFor() {
          if (typeof matrixInsertBlock.repeatFor === `string`) {
            // no custom pixel key list, keywords are already tested by schema
            return;
          }

          for (const pixelKey of matrixInsertBlock.repeatFor) {
            if (!fixture.matrix.pixelKeys.includes(pixelKey) && !(pixelKey in fixture.matrix.pixelGroups)) {
              result.errors.push(`Unknown pixelKey or pixelGroupKey '${pixelKey}'`);
            }
          }
        }
      }
    }

    /**
     * Check that a channel reference in a mode is valid.
     * @param {Number} chIndex The mode's channel index.
     */
    function checkModeChannelKey(chIndex) {
      const chKey = mode.channelKeys[chIndex];

      if (chKey === null) {
        return;
      }

      usedChannelKeys.add(chKey.toLowerCase());

      const channel = mode.fixture.getChannelByKey(chKey);
      if (channel === null) {
        result.errors.push(`Channel '${chKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
        return;
      }

      // if earliest occurrence (including switching channels) is not this one
      if (mode.getChannelIndex(channel, `all`) < chIndex) {
        result.errors.push(`Channel '${channel.key}' is referenced more than once from mode '${mode.shortName}' (maybe through switching channels).`);
      }

      if (channel instanceof SwitchingChannel) {
        checkSwitchingChannelReference();
      }
      else if (channel instanceof FineChannel) {
        checkCoarserChannelsInMode(channel);
      }

      /**
       * Check that a switching channel reference in a mode is valid.
       */
      function checkSwitchingChannelReference() {
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
            checkCoarserChannelsInMode(switchToChannel);
            continue;
          }
        }

        for (let index = 0; index < mode.getChannelIndex(channel); index++) {
          const otherChannel = mode.channels[index];
          checkSwitchingChannelReferenceDuplicate(otherChannel);
        }

        /**
         * Check all switched channels in the switching channels against another channel
         * for duplicate channel usage (either directly or in another switching channel).
         * @param {AbstractChannel} otherChannel The channel that should be checked against.
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
            channel.switchToChannelKeys.forEach(switchToChannelKey => {
              if (!otherChannel.switchToChannelKeys.includes(switchToChannelKey)) {
                return;
              }

              const overlap = channel.triggerRanges[switchToChannelKey].some(
                range => range.overlapsWithOneOf(otherChannel.triggerRanges[switchToChannelKey]),
              );
              if (overlap) {
                result.errors.push(`Channel '${switchToChannelKey}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
              }
            });
          }
          else {
            // fail if one of this channel's switchToChannels appears anywhere
            const firstDuplicate = channel.switchToChannels.find(
              ch => otherChannel.usesChannelKey(ch.key, `all`),
            );
            if (firstDuplicate !== undefined) {
              result.errors.push(`Channel '${firstDuplicate.key}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
            }
          }
        }
      }

      /**
       * Check that all coarser channels of the given fine channel are present in the current mode.
       * @param {FineChannel} fineChannel The fine channel to check.
       */
      function checkCoarserChannelsInMode(fineChannel) {
        const coarseChannel = fineChannel.coarseChannel;
        const coarserChannelKeys = coarseChannel.fineChannelAliases.filter(
          (alias, index) => index < fineChannel.resolution - 2,
        ).concat(coarseChannel.key);

        const notInMode = coarserChannelKeys.filter(
          coarseChannelKey => mode.getChannelIndex(coarseChannelKey) === -1,
        );

        if (notInMode.length > 0) {
          result.errors.push(`Mode '${mode.shortName}' contains the fine channel '${fineChannel.key}' but is missing its coarser channels ${notInMode}.`);
        }
      }
    }
  }

  /**
   * Add a warning if there are unused channels.
   */
  function checkUnusedChannels() {
    const unused = Array.from(definedChannelKeys).filter(
      chKey => !usedChannelKeys.has(chKey),
    );

    if (unused.length > 0) {
      result.warnings.push(`Unused channel(s): ${unused.join(`, `)}`);
    }
  }

  /**
   * Add a warning if there are unused wheels.
   */
  function checkUnusedWheels() {
    const unusedWheels = fixture.wheels.filter(
      wheel => !usedWheels.has(wheel.name),
    ).map(wheel => wheel.name);

    if (unusedWheels.length > 0) {
      result.warnings.push(`Unused wheel(s): ${unusedWheels.join(`, `)}`);
    }
  }

  /**
   * Add a warning if there are unused wheel slots.
   */
  function checkUnusedWheelSlots() {
    const slotsOfUsedWheels = [];
    Array.from(usedWheels).forEach(wheelName => {
      const wheel = fixture.getWheelByName(wheelName);

      if (wheel.type !== `AnimationGobo`) {
        slotsOfUsedWheels.push(...(wheel.slots.map(
          (slot, slotIndex) => `${wheelName} (slot ${slotIndex + 1})`,
        )));
      }
    });

    const unusedWheelSlots = slotsOfUsedWheels.filter(
      slot => !usedWheelSlots.has(slot),
    );

    if (unusedWheelSlots.length > 0) {
      result.warnings.push(`Unused wheel slot(s): ${unusedWheelSlots.join(`, `)}`);
    }
  }

  /**
   * Checks if the used channels fits to the fixture's categories and raise warnings suggesting to add/remove a category.
   */
  function checkCategories() {
    const mutuallyExclusiveGroups = [
      [`Moving Head`, `Scanner`, `Barrel Scanner`],
      [`Pixel Bar`, `Flower`],
      [`Pixel Bar`, `Stand`],
    ];

    const categories = {
      'Color Changer': {
        isSuggested: isColorChanger(),
        suggestedPhrase: `there are ColorPreset or ColorIntensity capabilities or Color wheel slots`,
        invalidPhrase: `there are no ColorPreset and less than two ColorIntensity capabilities and no Color wheel slots`,
      },
      'Moving Head': {
        isSuggested: hasPanTiltChannels(true),
        isInvalid: !hasPanTiltChannels(true),
        suggestedPhrase: `there are pan and tilt channels`,
        invalidPhrase: `there are not both pan and tilt channels`,
      },
      'Scanner': {
        isSuggested: hasPanTiltChannels(true),
        isInvalid: !hasPanTiltChannels(false),
        suggestedPhrase: `there are pan and tilt channels`,
        invalidPhrase: `there are no pan or tilt channels`,
      },
      'Barrel Scanner': {
        isSuggested: hasPanTiltChannels(true),
        isInvalid: !hasPanTiltChannels(false),
        suggestedPhrase: `there are pan and tilt channels`,
        invalidPhrase: `there are no pan or tilt channels`,
      },
      'Smoke': {
        isSuggested: isFogType(`Fog`),
        suggestedPhrase: `there are Fog/FogType capabilities with no fogType or fogType 'Fog'`,
        invalidPhrase: `there are no Fog/FogType capabilities or none has fogType 'Fog'`,
      },
      'Hazer': {
        isSuggested: isFogType(`Haze`),
        suggestedPhrase: `there are Fog/FogType capabilities with no fogType or fogType 'Haze'`,
        invalidPhrase: `there are no Fog/FogType capabilities or none has fogType 'Haze'`,
      },
      'Matrix': {
        isInvalid: isNotMatrix(),
        invalidPhrase: `fixture does not define a matrix`,
      },
      'Pixel Bar': {
        isSuggested: isPixelBar(),
        isInvalid: isNotPixelBar(),
        suggestedPhrase: `matrix pixels are horizontally aligned`,
        invalidPhrase: `no horizontally aligned matrix is defined`,
      },
    };

    Object.entries(categories).forEach(([categoryName, category]) => {
      const isCategoryUsed = fixture.categories.includes(categoryName);

      if (!(`isInvalid` in category)) {
        category.isInvalid = !category.isSuggested;
      }

      if (!isCategoryUsed && category.isSuggested) {
        // don't suggest this category if another mutually exclusive category is used
        const exclusiveGroups = mutuallyExclusiveGroups.filter(
          group => group.includes(categoryName),
        );
        const isForbiddenByGroup = exclusiveGroups.some(
          group => group.some(
            cat => fixture.categories.includes(cat),
          ),
        );

        if (!isForbiddenByGroup) {
          result.warnings.push(`Category '${categoryName}' suggested since ${category.suggestedPhrase}.`);
        }
      }
      else if (isCategoryUsed && category.isInvalid) {
        result.errors.push(`Category '${categoryName}' invalid since ${category.invalidPhrase}.`);
      }
    });

    mutuallyExclusiveGroups.forEach(group => {
      const usedCategories = group.filter(cat => fixture.categories.includes(cat));

      if (usedCategories.length >= 2) {
        result.errors.push(`Categories '${usedCategories.join(`', '`)}' can't be used together.`);
      }
    });

    /**
     * @returns {Boolean} Whether the 'Color Changer' category is suggested.
     */
    function isColorChanger() {
      return hasCapabilityOfType(`ColorPreset`) || hasCapabilityOfType(`ColorIntensity`, 2) || fixture.wheels.some(
        wheel => wheel.slots.some(slot => slot.type === `Color`),
      );
    }

    /**
     * @param {Boolean} [both=false] Whether there need to be both Pan and Tilt channels.
     * @returns {Boolean} Whether the fixture has a Pan(Continuous) and/or (depending on 'both') a Tilt(Continuous) channel.
     */
    function hasPanTiltChannels(both = false) {
      const hasPan = hasCapabilityOfType(`Pan`) || hasCapabilityOfType(`PanContinuous`);
      const hasTilt = hasCapabilityOfType(`Tilt`) || hasCapabilityOfType(`TiltContinuous`);
      return both ? (hasPan && hasTilt) : (hasPan || hasTilt);
    }

    /**
     * @param {String} type What capability type to search for.
     * @param {Number} [minimum=1] How many occurrences are needed to succeed.
     * @returns {Boolean} Whether the given capability type occurs at least at the given minimum times in the fixture.
     */
    function hasCapabilityOfType(type, minimum = 1) {
      return fixture.capabilities.filter(
        cap => cap.type === type,
      ).length >= minimum;
    }

    /**
     * @param {String} fogType The fog type to search for.
     * @returns {Boolean} Whether the fixture has the given fog type.
     */
    function isFogType(fogType) {
      const fogCaps = fixture.capabilities.filter(
        cap => cap.type.startsWith(`Fog`),
      );

      if (fogCaps.length === 0) {
        return false;
      }

      return fogCaps.some(cap => cap.fogType === fogType) || fogCaps.every(cap => cap.fogType === null);
    }

    /**
     * @returns {Boolean} True if it can't be a matrix.
     */
    function isNotMatrix() {
      return fixture.matrix === null || fixture.matrix.definedAxes.length < 2;
    }

    /**
     * @returns {Boolean} True if a matrix with only one axis, which has more than 4 pixels, is defined.
     */
    function isPixelBar() {
      if (fixture.matrix === null) {
        return false;
      }

      const definedAxes = fixture.matrix.definedAxes;
      const definedAxis = definedAxes[0];

      return definedAxes.length === 1 && fixture.matrix[`pixelCount${definedAxis}`] > 4;
    }

    /**
     * @returns {Boolean} True if it can't be a pixel bar.
     */
    function isNotPixelBar() {
      return fixture.matrix === null || fixture.matrix.definedAxes.length > 1;
    }
  }

  /**
   * Checks if everything regarding this fixture's RDM data is correct.
   */
  function checkRdm() {
    if (fixture.rdm === null || uniqueValues === null) {
      return;
    }

    // fixture.rdm.modelId must be unique per manufacturer
    if (!(manufacturerKey in uniqueValues.fixRdmIdsInMan)) {
      uniqueValues.fixRdmIdsInMan[manufacturerKey] = new Set();
    }
    checkUniqueness(
      uniqueValues.fixRdmIdsInMan[manufacturerKey],
      `${fixture.rdm.modelId}`,
      result,
      `Fixture RDM model ID '${fixture.rdm.modelId}' is not unique in manufacturer ${manufacturerKey}.`,
    );

    if (fixture.manufacturer.rdmId === null) {
      result.errors.push(`Fixture has RDM data, but manufacturer '${fixture.manufacturer.name}' has not.`);
    }

    const rdmPersonalityIndices = new Set();
    for (const mode of fixture.modes) {
      if (mode.rdmPersonalityIndex !== null) {
        checkUniqueness(
          rdmPersonalityIndices,
          `${mode.rdmPersonalityIndex}`,
          result,
          `RDM personality index '${mode.rdmPersonalityIndex}' in mode '${mode.shortName}' is not unique in the fixture.`,
        );
      }
    }
  }

  /**
   * Checks whether the specified string contains all allowed and no disallowed variables and pushes an error on wrong variable usage.
   * @param {String} string The string to be checked.
   * @param {Array.<String>} allowedVariables Variables that must be included in the string; all other variables are forbidden. Specify them with leading dollar sign ($var).
   */
  function checkTemplateVariables(string, allowedVariables) {
    const usedVariables = string.match(/\$\w+/g) || [];
    for (const usedVariable of usedVariables) {
      if (!allowedVariables.includes(usedVariable)) {
        result.errors.push(`Variable ${usedVariable} not allowed in '${string}'`);
      }
    }
    for (const allowedVariable of allowedVariables) {
      if (!usedVariables.includes(allowedVariable)) {
        result.errors.push(`Variable ${allowedVariable} missing in '${string}'`);
      }
    }
  }
}

/**
 * If the Set already contains the given value, add an error. Test is not case-sensitive.
 * @param {Set.<String>} set The Set in which all unique values are stored.
 * @param {String} value The string value to examine.
 * @param {ResultData} result The object to add the error message to (if any).
 * @param {String} messageIfNotUnique If the value is not unique, add this message to errors.
 */
function checkUniqueness(set, value, result, messageIfNotUnique) {
  if (set.has(value.toLowerCase())) {
    result.errors.push(messageIfNotUnique);
  }
  set.add(value.toLowerCase());
}


/**
 * @param {String} description The error message.
 * @param {*} error An error object to append to the message.
 * @returns {String} A string containing the message and a deep inspection of the given error object.
 */
function getErrorString(description, error) {
  if (typeof error === `string`) {
    return `${description} ${error}`;
  }

  return `${description} ${inspect(error, false, null)}`;
}

/**
 * @param {Array|null} a An array.
 * @param {Array|null} b Another array.
 * @returns {Boolean} True if both arrays are equal, false if they are null or not equal.
 */
function arraysEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a == null || b == null || a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}


module.exports = {
  checkFixture,
  checkUniqueness,
  getErrorString,
};
