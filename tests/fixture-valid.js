import { inspect } from 'util';

import getAjvValidator from '../lib/ajv-validator.js';
import getAjvErrorMessages from '../lib/get-ajv-error-messages.js';
import importJson from '../lib/import-json.js';
/** @typedef {import('../lib/model/AbstractChannel.js').default} AbstractChannel */
/** @typedef {import('../lib/model/Capability.js').default} Capability */
/** @typedef {import('../lib/model/CoarseChannel.js').default} CoarseChannel */
import FineChannel from '../lib/model/FineChannel.js';
import Fixture from '../lib/model/Fixture.js';
/** @typedef {import('../lib/model/Matrix.js').default} Matrix */
/** @typedef {import('../lib/model/Meta.js').default} Meta */
import NullChannel from '../lib/model/NullChannel.js';
/** @typedef {import('../lib/model/Physical.js').default} Physical */
/** @typedef {import('../lib/model/TemplateChannel.js').default} TemplateChannel */
import SwitchingChannel from '../lib/model/SwitchingChannel.js';
import { getResourceFromString, manufacturerFromRepository } from '../lib/model.js';
/** @typedef {import('../lib/model/Wheel.js').default} Wheel */
import { schemaDefinitions } from '../lib/schema-properties.js';

let initialized = false;
let register;
let plugins;

/**
 * Checks that a given fixture JSON object is valid.
 * @param {string} manufacturerKey The manufacturer key.
 * @param {string} fixtureKey The fixture key.
 * @param {object | null} fixtureJson The fixture JSON object.
 * @param {UniqueValues | null} [uniqueValues=null] Values that have to be unique are checked and all new occurrences are appended.
 * @returns {Promise<ResultData>} A Promise that resolves to the result object containing errors and warnings, if any.
 */
export async function checkFixture(manufacturerKey, fixtureKey, fixtureJson, uniqueValues = null) {
  if (!initialized) {
    register = await importJson(`../fixtures/register.json`, import.meta.url);
    plugins = await importJson(`../plugins/plugins.json`, import.meta.url);

    initialized = true;
  }

  /**
   * @typedef {object} ResultData
   * @property {string[]} errors All errors of this fixture.
   * @property {string[]} warnings All warnings of this fixture.
   */

  /** @type {ResultData} */
  const result = {
    errors: [],
    warnings: [],
  };

  /** @type {Fixture} */
  let fixture;

  /** @type {Set<string>} */
  const definedChannelKeys = new Set(); // and aliases
  /** @type {Set<string>} */
  const usedChannelKeys = new Set(); // and aliases
  /** @type {Set<string>} */
  const allPossibleMatrixChannelKeys = new Set(); // and aliases
  /** @type {Set<string>} */
  const usedWheels = new Set();
  /** @type {Set<string>} */
  const usedWheelSlots = new Set();

  /** @type {Set<string>} */
  const modeNames = new Set();
  /** @type {Set<string>} */
  const modeShortNames = new Set();

  if (!(`$schema` in fixtureJson)) {
    result.errors.push(getErrorString(`File does not contain '$schema' property.`));
    return result;
  }

  if (fixtureJson.$schema.endsWith(`/fixture-redirect.json`)) {
    await checkFixtureRedirect();
    return result;
  }


  const schemaValidate = await getAjvValidator(`fixture`);
  const schemaValid = schemaValidate(fixtureJson);
  if (!schemaValid) {
    const errorMessages = getAjvErrorMessages(schemaValidate.errors, `fixture`);
    result.errors.push(...errorMessages.map(message => getErrorString(`File does not match schema:`, message)));
    return result;
  }

  try {
    const manufacturer = await manufacturerFromRepository(manufacturerKey);
    fixture = new Fixture(manufacturer, fixtureKey, fixtureJson);

    checkFixtureIdentifierUniqueness();
    checkMeta(fixture.meta);
    checkPhysical(fixture.physical);
    checkMatrix(fixture.matrix);
    await checkWheels(fixture.wheels);
    checkTemplateChannels();
    checkChannels();

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
  async function checkFixtureRedirect() {
    const redirectSchemaValidate = await getAjvValidator(`fixture-redirect`);
    const redirectSchemaValid = redirectSchemaValidate(fixtureJson);

    if (!redirectSchemaValid) {
      result.errors.push(getErrorString(`File does not match schema.`, redirectSchemaValidate.errors));
    }

    if (!(fixtureJson.redirectTo in register.filesystem) || `redirectTo` in register.filesystem[fixtureJson.redirectTo]) {
      result.errors.push(`'redirectTo' is not a valid fixture.`);
    }

    result.name = `${manufacturerKey}/${fixtureKey}.json (redirect)`;
  }

  /**
   * Checks that fixture key, name and shortName are unique.
   */
  function checkFixtureIdentifierUniqueness() {
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
   * @param {Physical | null} physical A fixture's or a mode's physical data.
   * @param {string} [modeDescription=''] Optional information in error messages about current mode.
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
    else if (physical.matrixPixelsSpacing !== null) {
      checkPhysicalMatrixPixelsSpacing(physical.matrixPixelsSpacing);
    }
  }

  /**
   * Checks if the given physical.matrixPixels.spacing array is valid.
   * @param {number[]} matrixPixelsSpacing The physical.matrixPixels.spacing array to check.
   */
  function checkPhysicalMatrixPixelsSpacing(matrixPixelsSpacing) {
    for (const [index, axis] of [`X`, `Y`, `Z`].entries()) {
      if (matrixPixelsSpacing[index] !== 0 && !fixture.matrix.definedAxes.includes(axis)) {
        result.errors.push(`physical.matrixPixels.spacing is nonzero for ${axis} axis, but no pixels are defined in that axis.`);
      }
    }
  }

  /**
   * Checks if the given Matrix object is valid.
   * @param {Matrix | null} matrix A fixture's matrix data.
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

      for (const pixelGroupKey of pixelGroupKeys) {
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
      }
    }
  }

  /**
   * Checks if the fixture's wheels are correct.
   * @param {Wheel[]} wheels The fixture's Wheel instances.
   */
  async function checkWheels(wheels) {
    for (const wheel of wheels) {
      if (!/\b(?:wheel|disk)\b/i.test(wheel.name)) {
        result.warnings.push(`Name of wheel '${wheel.name}' does not contain the word 'wheel' or 'disk', which could lead to confusing capability names.`);
      }

      const expectedAnimationGoboEndSlots = [];
      const foundAnimationGoboEndSlots = [];

      await Promise.all(wheel.slots.map(async (slot, index) => {
        if (slot.type === `AnimationGoboStart`) {
          expectedAnimationGoboEndSlots.push(index + 1);
        }
        else if (slot.type === `AnimationGoboEnd`) {
          foundAnimationGoboEndSlots.push(index);
        }

        if (typeof slot.resource === `string`) {
          try {
            await getResourceFromString(slot.resource);
          }
          catch (error) {
            result.errors.push(error.message);
          }
        }
      }));

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
        channelKey => possibleMatrixChannelKeys.includes(channelKey),
      );
      if (!templateChannelUsed) {
        result.warnings.push(`Template channel '${templateKey}' is never used.`);
      }

      for (const channelKey of possibleMatrixChannelKeys) {
        checkUniqueness(
          allPossibleMatrixChannelKeys,
          channelKey,
          result,
          `Generated channel key ${channelKey} can be produced by multiple template channels (test is not case-sensitive).`,
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
    for (const alias of channel.fineChannelAliases) {
      checkTemplateVariables(alias, []);
      checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Fine channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`,
      );
    }

    // Switching channels
    for (const alias of channel.switchingChannelAliases) {
      checkTemplateVariables(alias, []);
      checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Switching channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`,
      );
    }

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
        const capability = channel.capabilities[index];

        // if one of the previous capabilities had an invalid range,
        // it doesn't make sense to check later ranges
        if (!dmxRangesInvalid) {
          dmxRangesInvalid = !checkDmxRange(index);
        }

        // Use JSON dmxRange rather than rawDmxRange, because that one might throw unhelpful errors
        const rangeString = `${capability.jsonObject.dmxRange[0]}…${capability.jsonObject.dmxRange[1]}`;

        checkCapability(capability, `Capability '${capability.name}' (${rangeString}) in channel '${channel.key}'`);
      }

      /**
       * Check that a capability's range is valid.
       * @param {number} capabilityNumber The number of the capability in the channel, starting with 0.
       * @returns {boolean} True if the range is valid, false otherwise. The global `result` object is updated then.
       */
      function checkDmxRange(capabilityNumber) {
        const capability = channel.capabilities[capabilityNumber];
        const [rawDmxStart, rawDmxEnd] = capability.jsonObject.dmxRange;
        const errorLocationString = `capability '${capability.name}' (${rawDmxStart}…${rawDmxEnd}) in channel '${channel.key}'`;

        return checkDmxRangeWithinBounds()
          && checkFirstCapabilityRangeStart()
          && checkRangeValid()
          && checkRangesAdjacent()
          && checkLastCapabilityRangeEnd();


        /**
         * Checks that the capability's DMX range values don't exceed the maximum value for the channel's resolution.
         * @returns {boolean} True if the DMX range is within bounds, false otherwise.
         */
        function checkDmxRangeWithinBounds() {
          if (rawDmxStart > maxDmxValue || rawDmxEnd > maxDmxValue) {
            result.errors.push(`dmxRange is out of bounds (maximum ${maxDmxValue} for ${channel.dmxValueResolution * 8}bit resolution) in ${errorLocationString}.`);
            return false;
          }

          return true;
        }


        /**
         * Checks that the first capability's DMX range starts with 0.
         * @returns {boolean} True if this is not the first capability or it starts with 0, false otherwise.
         */
        function checkFirstCapabilityRangeStart() {
          if (capabilityNumber === 0 && capability.rawDmxRange.start !== 0) {
            result.errors.push(`The first dmxRange has to start at 0 in ${errorLocationString}.`);
            return false;
          }

          return true;
        }

        /**
         * @returns {boolean} True if this capability's DMX range is valid, i.e. the end is greater than or equal to the start, false otherwise.
         */
        function checkRangeValid() {
          if (capability.rawDmxRange.start > capability.rawDmxRange.end) {
            result.errors.push(`dmxRange invalid in ${errorLocationString}.`);
            return false;
          }

          return true;
        }

        /**
         * @returns {boolean} True if this capability's DMX range start is adjacent to the previous capability's DMX range end, false otherwise.
         */
        function checkRangesAdjacent() {
          if (capabilityNumber > 0) {
            const previousCapability = channel.capabilities[capabilityNumber - 1];

            if (capability.rawDmxRange.start !== previousCapability.rawDmxRange.end + 1) {
              result.errors.push(`dmxRanges must be adjacent in capabilities '${previousCapability.name}' (${previousCapability.rawDmxRange}) and '${capability.name}' (${capability.rawDmxRange}) in channel '${channel.key}'.`);
              return false;
            }
          }

          return true;
        }

        /**
         * Checks that the last capability's DMX range is one of the allowed values, e.g. 255 or 65535 for 16bit channels.
         * @returns {boolean} True if this is not the last capability or it ends with an allowed value, false otherwise.
         */
        function checkLastCapabilityRangeEnd() {
          if (capabilityNumber === channel.capabilities.length - 1 && channel.capabilities[capabilityNumber].rawDmxRange.end !== maxDmxValue) {
            result.errors.push(`The last dmxRange has to end at ${maxDmxValue} (or another channel.dmxValueResolution must be chosen) in ${errorLocationString}.`);
            return false;
          }

          return true;
        }
      }

      /**
       * Check that a capability is valid (except its DMX range).
       * @param {Capability} capability The capability to check.
       * @param {string} errorPrefix An identifier for the capability to use in errors and warnings.
       */
      function checkCapability(capability, errorPrefix) {
        const switchingChannelAliases = Object.keys(capability.switchChannels);
        if (arraysEqual(switchingChannelAliases, channel.switchingChannelAliases)) {
          for (const alias of switchingChannelAliases) {
            const channelKey = capability.switchChannels[alias];
            usedChannelKeys.add(channelKey.toLowerCase());

            if (channel.fixture.getChannelByKey(channelKey) === null) {
              result.errors.push(`${errorPrefix} references unknown channel '${channelKey}'.`);
            }
          }
        }
        else {
          result.errors.push(`${errorPrefix} must define the same switching channel aliases as all other capabilities.`);
        }

        checkStartEndEntities();

        const capabilityTypeChecks = {
          ShutterStrobe: checkShutterStrobeCapability,
          StrobeSpeed: checkStrobeSpeedCapability,
          Pan: checkPanTiltCapability,
          Tilt: checkPanTiltCapability,
          WheelSlot: checkWheelCapability,
          WheelShake: checkWheelCapability,
          WheelSlotRotation: checkWheelCapability,
          WheelRotation: checkWheelCapability,
          Effect: checkEffectCapability,
        };

        if (Object.keys(capabilityTypeChecks).includes(capability.type)) {
          capabilityTypeChecks[capability.type]();
        }


        /**
         * Check all used start/end entities in the capability.
         */
        function checkStartEndEntities() {
          for (const property of capability.usedStartEndEntities) {
            const [startEntity, endEntity] = capability[property];

            if ((startEntity.keyword === null) !== (endEntity.keyword === null)) {
              result.errors.push(`${errorPrefix} must use keywords for both start and end value or for neither in ${property}.`);
            }
            else if (startEntity.unit !== endEntity.unit) {
              result.errors.push(`${errorPrefix} uses different units for ${property}.`);
            }

            if (property === `speed` && startEntity.number * endEntity.number < 0) {
              result.errors.push(`${errorPrefix} uses different signs (+ or –) in ${property} (maybe behind a keyword). Split it into several capabilities instead.`);
            }

            if (`${property}Start` in capability.jsonObject && startEntity.equals(endEntity)) {
              result.errors.push(`${errorPrefix} uses ${property}Start and ${property}End with equal values. Use the single property '${property}: "${startEntity}"' instead.`);
            }
          }
        }

        /**
         * Type-specific checks for ShutterStrobe capabilities.
         */
        function checkShutterStrobeCapability() {
          if ([`Closed`, `Open`].includes(capability.shutterEffect)) {
            if (capability.isSoundControlled) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't be sound-controlled.`);
            }

            if (capability.speed !== null || capability.duration !== null) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't define speed or duration.`);
            }

            if (capability.randomTiming) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't have random timing.`);
            }
          }
        }

        /**
         * Type-specific checks for StrobeSpeed capabilities.
         */
        function checkStrobeSpeedCapability() {
          const otherCapabilityHasShutterStrobe = channel.capabilities.some(otherCapability => otherCapability.type === `ShutterStrobe`);
          const hasOtherStrobeChannel = fixture.coarseChannels.some(otherChannel => otherChannel !== channel && otherChannel.type === `Strobe`);
          if (otherCapabilityHasShutterStrobe && !hasOtherStrobeChannel) {
            result.errors.push(`${errorPrefix}: StrobeSpeed can't be used in the same channel as ShutterStrobe. Should this rather be a ShutterStrobe capability with shutterEffect "Strobe"?`);
          }
        }

        /**
         * Check that references to wheels are valid.
         */
        function checkWheelCapability() {
          let shouldCheckSlotNumbers = true;

          checkReferencedWheels();

          if (capability.slotNumber !== null && shouldCheckSlotNumbers) {
            checkSlotNumbers();
          }

          /**
           * Check that referenced wheels exist in the fixture.
           */
          function checkReferencedWheels() {
            if (`wheel` in capability.jsonObject) {
              const wheelNames = [capability.jsonObject.wheel].flat();

              for (const wheelName of wheelNames) {
                const wheel = fixture.getWheelByName(wheelName);
                if (wheel) {
                  usedWheels.add(wheelName);
                }
                else {
                  result.errors.push(`${errorPrefix} references wheel '${wheelName}' which is not defined in the fixture.`);
                  shouldCheckSlotNumbers = false;
                }
              }

              if (wheelNames.length === 1 && wheelNames[0] === capability._channel.name) {
                result.warnings.push(`${errorPrefix} explicitly references wheel '${wheelNames[0]}', which is the default anyway (through the channel name). Please remove the 'wheel' property.`);
              }
            }
            else if (capability.wheels.includes(null)) {
              result.errors.push(`${errorPrefix} does not explicitly reference any wheel, but the default wheel '${capability._channel.name}' (through the channel name) does not exist.`);
              shouldCheckSlotNumbers = false;
            }
            else {
              usedWheels.add(capability._channel.name);
            }
          }

          /**
           * Check that slot indices are used correctly for the specific wheel.
           */
          function checkSlotNumbers() {
            const min = Math.min(capability.slotNumber[0], capability.slotNumber[1]);
            const max = Math.max(capability.slotNumber[0], capability.slotNumber[1]);
            for (let index = Math.floor(min); index <= Math.ceil(max); index++) {
              usedWheelSlots.add(`${capability.wheels[0].name} (slot ${index})`);
            }

            if (max - min > 1) {
              result.warnings.push(`${errorPrefix} references a wheel slot range (${min}…${max}) which is greater than 1.`);
            }

            const minSlotNumber = 1;
            const maxSlotNumber = capability.wheels[0].slots.length;

            const isInRangeExclusive = (number, start, end) => number > start && number < end;
            const isInRangeInclusive = (number, start, end) => number >= start && number <= end;

            if (capability.slotNumber[0].equals(capability.slotNumber[1])) {
              if (!isInRangeExclusive(capability.slotNumber[0].number, minSlotNumber - 1, maxSlotNumber + 1)) {
                result.errors.push(`${errorPrefix} references wheel slot ${capability.slotNumber[0].number} which is outside the allowed range ${minSlotNumber - 1}…${maxSlotNumber + 1} (exclusive).`);
              }
              return;
            }

            if (!isInRangeInclusive(capability.slotNumber[0].number, minSlotNumber - 1, maxSlotNumber)) {
              result.errors.push(`${errorPrefix} starts at wheel slot ${capability.slotNumber[0].number} which is outside the allowed range ${minSlotNumber - 1}…${maxSlotNumber} (inclusive).`);
            }
            else if (!isInRangeInclusive(capability.slotNumber[1].number, minSlotNumber, maxSlotNumber + 1)) {
              result.errors.push(`${errorPrefix} ends at wheel slot ${capability.slotNumber[1].number} which is outside the allowed range ${minSlotNumber}…${maxSlotNumber + 1} (inclusive).`);
            }
          }
        }

        /**
         * Type-specific checks for Pan and Tilt capabilities.
         */
        function checkPanTiltCapability() {
          const usesPercentageAngle = capability.angle[0].unit === `%`;
          if (usesPercentageAngle) {
            result.warnings.push(`${errorPrefix} defines an imprecise percentaged angle. Please to try find the value in degrees.`);
          }
        }

        /**
         * Type-specific checks for Effect capabilities.
         */
        function checkEffectCapability() {
          if (capability.effectPreset === null && schemaDefinitions.effectPreset.enum.includes(capability.effectName)) {
            result.errors.push(`${errorPrefix} must use effectPreset instead of effectName with '${capability.effectName}'.`);
          }

          if (!capability.isSoundControlled && capability.soundSensitivity !== null) {
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

    checkModeName();

    checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);

    for (const rawReference of mode.jsonObject.channels) {
      if (rawReference !== null && typeof rawReference !== `string`) {
        checkChannelInsertBlock(rawReference);
      }
    }

    for (let channelIndex = 0; channelIndex < mode.channelKeys.length; channelIndex++) {
      checkModeChannelKey(channelIndex);
    }


    /**
     * Check that mode names comply with the channel count.
     */
    function checkModeName() {
      // "6ch" / "8-Channel" / "9 channels" mode names
      for (const nameProperty of [`name`, `shortName`]) {
        const match = mode[nameProperty].match(/(\d+)(?:\s+|-|)(?:channels?|ch)/i);
        if (match !== null) {
          const intendedLength = Number.parseInt(match[1], 10);

          if (mode.channels.length !== intendedLength) {
            result.errors.push(`Mode '${mode.name}' should have ${intendedLength} channels according to its ${nameProperty} but actually has ${mode.channels.length}.`);
          }

          const allowedShortNames = [`${intendedLength}ch`, `Ch${intendedLength}`, `Ch0${intendedLength}`];
          if (mode[nameProperty].length === match[0].length && !allowedShortNames.includes(mode.shortName)) {
            result.warnings.push(`Mode '${mode.name}' should have shortName '${intendedLength}ch' instead of '${mode.shortName}'.`);
          }
        }
      }
    }

    /**
     * Checks if the given complex channel insert block is valid.
     * @param {object} insertBlock The raw JSON data of the insert block.
     */
    function checkChannelInsertBlock(insertBlock) {
      if (insertBlock.insert === `matrixChannels`) {
        checkMatrixInsertBlock(insertBlock);
      }
      // open for future extensions (invalid values are prohibited by the schema)

      /**
       * Checks the given matrix channel insert.
       * @param {object} matrixInsertBlock The matrix channel reference specified in the mode's json channel list.
       * @param {'matrixChannels'} matrixInsertBlock.insert Indicates that this is a matrix insert.
       * @param {'eachPixel' | 'eachPixelGroup' | string[]} matrixInsertBlock.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
       * @param {'perPixel' | 'perChannel'} matrixInsertBlock.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
       * @param {(string | null)[]} matrixInsertBlock.templateChannels The template channel keys (and aliases) or null channels to be repeated.
       */
      function checkMatrixInsertBlock(matrixInsertBlock) {
        checkMatrixInsertBlockRepeatFor();

        for (const templateKey of matrixInsertBlock.templateChannels) {
          const templateChannelExists = fixture.templateChannels.some(channel => channel.allTemplateKeys.includes(templateKey));
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
     * @param {number} channelIndex The mode's channel index.
     */
    function checkModeChannelKey(channelIndex) {
      const channelKey = mode.channelKeys[channelIndex];

      if (channelKey === null) {
        return;
      }

      usedChannelKeys.add(channelKey.toLowerCase());

      const channel = mode.fixture.getChannelByKey(channelKey);
      if (channel === null) {
        result.errors.push(`Channel '${channelKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
        return;
      }

      // if earliest occurrence (including switching channels) is not this one
      if (mode.getChannelIndex(channel.key, `all`) < channelIndex) {
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
        if (mode.getChannelIndex(channel.triggerChannel.key) === -1) {
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
          }
        }

        for (let index = 0; index < mode.getChannelIndex(channel.key); index++) {
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
            for (const switchToChannelKey of channel.switchToChannelKeys) {
              const overlap = channel.triggerRanges[switchToChannelKey].some(
                // `?? []` because otherChannel.switchToChannelKeys may not include switchToChannelKey
                range => range.overlapsWithOneOf(otherChannel.triggerRanges[switchToChannelKey] ?? []),
              );
              if (overlap) {
                result.errors.push(`Channel '${switchToChannelKey}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
              }
            }
          }
          else {
            // fail if one of this channel's switchToChannels appears anywhere
            const firstDuplicate = channel.switchToChannels.find(
              switchToChannel => otherChannel.usesChannelKey(switchToChannel.key, `all`),
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
        const coarserChannelKeys = [...coarseChannel.fineChannelAliases.filter(
          (alias, index) => index < fineChannel.resolution - 2,
        ), coarseChannel.key];

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
    const unused = [...definedChannelKeys].filter(
      channelKey => !usedChannelKeys.has(channelKey),
    ).join(`, `);

    if (unused.length > 0) {
      result.warnings.push(`Unused channel(s): ${unused}`);
    }
  }

  /**
   * Add a warning if there are unused wheels.
   */
  function checkUnusedWheels() {
    const unusedWheels = fixture.wheels.filter(
      wheel => !usedWheels.has(wheel.name),
    ).map(wheel => wheel.name).join(`, `);

    if (unusedWheels.length > 0) {
      result.warnings.push(`Unused wheel(s): ${unusedWheels}`);
    }
  }

  /**
   * Add a warning if there are unused wheel slots.
   */
  function checkUnusedWheelSlots() {
    const slotsOfUsedWheels = [];
    for (const wheelName of usedWheels) {
      const wheel = fixture.getWheelByName(wheelName);

      if (wheel.type !== `AnimationGobo`) {
        slotsOfUsedWheels.push(...(wheel.slots.map(
          (slot, slotIndex) => `${wheelName} (slot ${slotIndex + 1})`,
        )));
      }
    }

    const unusedWheelSlots = slotsOfUsedWheels.filter(
      slot => !usedWheelSlots.has(slot),
    ).join(`, `);

    if (unusedWheelSlots.length > 0) {
      result.warnings.push(`Unused wheel slot(s): ${unusedWheelSlots}`);
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

    const fixtureIsColorChanger = isColorChanger();
    const fixtureHasBothPanTiltChannels = hasPanTiltChannels(true);
    const fixtureHasPanOrTiltChannels = hasPanTiltChannels(false);
    const isFogTypeFog = isFogType(`Fog`);
    const isFogTypeHaze = isFogType(`Haze`);
    const fixtureIsNotMatrix = isNotMatrix();
    const fixtureIsPixelBar = isPixelBar();
    const fixtureIsNotPixelBar = isNotPixelBar();

    const categories = {
      'Color Changer': {
        isSuggested: fixtureIsColorChanger,
        isInvalid: !fixtureIsColorChanger,
        suggestedPhrase: `there are ColorPreset or ColorIntensity capabilities or Color wheel slots`,
        invalidPhrase: `there are no ColorPreset and less than two ColorIntensity capabilities and no Color wheel slots`,
      },
      'Moving Head': {
        isSuggested: fixtureHasBothPanTiltChannels,
        isInvalid: !fixtureHasBothPanTiltChannels,
        suggestedPhrase: `there are pan and tilt channels`,
        invalidPhrase: `there are not both pan and tilt channels`,
      },
      'Scanner': {
        isSuggested: fixtureHasBothPanTiltChannels,
        isInvalid: !fixtureHasPanOrTiltChannels,
        suggestedPhrase: `there are pan and tilt channels`,
        invalidPhrase: `there are no pan or tilt channels`,
      },
      'Barrel Scanner': {
        isSuggested: fixtureHasBothPanTiltChannels,
        isInvalid: !fixtureHasPanOrTiltChannels,
        suggestedPhrase: `there are pan and tilt channels`,
        invalidPhrase: `there are no pan or tilt channels`,
      },
      'Smoke': {
        isSuggested: isFogTypeFog,
        isInvalid: !isFogTypeFog,
        suggestedPhrase: `there are Fog/FogType capabilities with no fogType or fogType 'Fog'`,
        invalidPhrase: `there are no Fog/FogType capabilities or none has fogType 'Fog'`,
      },
      'Hazer': {
        isSuggested: isFogTypeHaze,
        isInvalid: !isFogTypeHaze,
        suggestedPhrase: `there are Fog/FogType capabilities with no fogType or fogType 'Haze'`,
        invalidPhrase: `there are no Fog/FogType capabilities or none has fogType 'Haze'`,
      },
      'Matrix': {
        isInvalid: fixtureIsNotMatrix,
        invalidPhrase: `fixture does not define a matrix`,
      },
      'Pixel Bar': {
        isSuggested: fixtureIsPixelBar,
        isInvalid: fixtureIsNotPixelBar,
        suggestedPhrase: `matrix pixels are horizontally aligned`,
        invalidPhrase: `no horizontally aligned matrix is defined`,
      },
    };

    for (const [categoryName, categoryProperties] of Object.entries(categories)) {
      const isCategoryUsed = fixture.categories.includes(categoryName);

      // don't suggest this category if another mutually exclusive category is used
      const exclusiveGroups = mutuallyExclusiveGroups.filter(
        group => group.includes(categoryName) && group.some(
          category => category !== categoryName && fixture.categories.includes(category),
        ),
      );

      if (!isCategoryUsed) {
        if (categoryProperties.isSuggested && exclusiveGroups.length === 0) {
          result.warnings.push(`Category '${categoryName}' suggested since ${categoryProperties.suggestedPhrase}.`);
        }
      }
      else if (categoryProperties.isInvalid) {
        result.errors.push(`Category '${categoryName}' invalid since ${categoryProperties.invalidPhrase}.`);
      }
      else if (exclusiveGroups.length > 0) {
        result.errors.push(...exclusiveGroups.map(group => {
          const usedCategories = group
            .filter(category => fixture.categories.includes(category))
            .map(category => `'${category}'`)
            .join(`, `);
          return `Categories ${usedCategories} can't be used together.`;
        }));
      }
    }

    /**
     * @returns {boolean} Whether the 'Color Changer' category is suggested.
     */
    function isColorChanger() {
      return hasCapabilityOfType(`ColorPreset`) || hasCapabilityOfType(`ColorIntensity`, 2) || fixture.wheels.some(
        wheel => wheel.slots.some(slot => slot.type === `Color`),
      );
    }

    /**
     * @param {boolean} [both=false] Whether there need to be both Pan and Tilt channels.
     * @returns {boolean} Whether the fixture has a Pan(Continuous) and/or (depending on 'both') a Tilt(Continuous) channel.
     */
    function hasPanTiltChannels(both = false) {
      const hasPan = hasCapabilityOfType(`Pan`) || hasCapabilityOfType(`PanContinuous`);
      const hasTilt = hasCapabilityOfType(`Tilt`) || hasCapabilityOfType(`TiltContinuous`);
      return both ? (hasPan && hasTilt) : (hasPan || hasTilt);
    }

    /**
     * @param {string} type What capability type to search for.
     * @param {number} [minimum=1] How many occurrences are needed to succeed.
     * @returns {boolean} Whether the given capability type occurs at least at the given minimum times in the fixture.
     */
    function hasCapabilityOfType(type, minimum = 1) {
      return fixture.capabilities.filter(
        capability => capability.type === type,
      ).length >= minimum;
    }

    /**
     * @param {string} fogType The fog type to search for.
     * @returns {boolean} Whether the fixture has the given fog type.
     */
    function isFogType(fogType) {
      const fogCapabilities = fixture.capabilities.filter(
        capability => capability.type.startsWith(`Fog`),
      );

      if (fogCapabilities.length === 0) {
        return false;
      }

      return fogCapabilities.some(capability => capability.fogType === fogType) || fogCapabilities.every(capability => capability.fogType === null);
    }

    /**
     * @returns {boolean} True if it can't be a matrix.
     */
    function isNotMatrix() {
      return fixture.matrix === null || fixture.matrix.definedAxes.length < 2;
    }

    /**
     * @returns {boolean} True if a matrix with only one axis, which has more than 4 pixels, is defined.
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
     * @returns {boolean} True if it can't be a pixel bar.
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
   * @param {string} string The string to be checked.
   * @param {string[]} allowedVariables Variables that must be included in the string; all other variables are forbidden. Specify them with leading dollar sign ($var).
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
 * @param {Set<string>} set The Set in which all unique values are stored.
 * @param {string} value The string value to examine.
 * @param {ResultData} result The object to add the error message to (if any).
 * @param {string} messageIfNotUnique If the value is not unique, add this message to errors.
 */
export function checkUniqueness(set, value, result, messageIfNotUnique) {
  if (set.has(value.toLowerCase())) {
    result.errors.push(messageIfNotUnique);
  }
  set.add(value.toLowerCase());
}


/**
 * @param {string} description The error message.
 * @param {any} error An error object to append to the message.
 * @returns {string} A string containing the message and a deep inspection of the given error object.
 */
function getErrorString(description, error) {
  if (typeof error === `string`) {
    return `${description} ${error}`;
  }

  return `${description} ${inspect(error, false, null)}`;
}

/**
 * @param {Array | null} a An array.
 * @param {Array | null} b Another array.
 * @returns {boolean} True if both arrays are equal, false if they are null or not equal.
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
