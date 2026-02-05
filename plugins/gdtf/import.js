import JSZip from 'jszip';
import xml2js from 'xml2js';

import importJson from '../../lib/import-json.js';
import CoarseChannel from '../../lib/model/CoarseChannel.js';
import { scaleDmxRangeIndividually, scaleDmxValue } from '../../lib/scale-dmx-values.js';
import gdtfAttributes, { gdtfUnits } from './gdtf-attributes.js';
import { followXmlNodeReference, getRgbColorFromGdtfColor } from './gdtf-helpers.js';

export const version = `0.2.0`;

/**
 * @typedef {object} Relation
 * @property {number} modeIndex The zero-based index of the mode this relation applies to.
 * @property {object} masterGdtfChannel The GDTF channel that triggers switching.
 * @property {string} switchingChannelName The name of the switching channel (containing multiple default channels).
 * @property {object} followerGdtfChannel The GDTF channel that is switched by the master.
 * @property {[number, Resolution]} dmxFrom The DMX value and DMX resolution of the start of the DMX range triggering this relation.
 * @property {[number, Resolution]} dmxTo The DMX value and DMX resolution of the end of the DMX range triggering this relation.
 */

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise<object, Error>} A Promise resolving to an out object
 */
export async function importFixtures(buffer, filename, authorName) {
  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
  };

  const warnings = [];

  const xml = await getGdtfXml(buffer, filename);

  const gdtfFixture = xml.GDTF.FixtureType[0];
  fixture.name = gdtfFixture.$.Name;
  fixture.shortName = gdtfFixture.$.ShortName;

  const manufacturerKey = slugify(gdtfFixture.$.Manufacturer);
  const fixtureKey = `${manufacturerKey}/${slugify(fixture.name)}`;

  const manufacturers = await importJson(`../../fixtures/manufacturers.json`, import.meta.url);

  let manufacturer;
  if (manufacturerKey in manufacturers) {
    manufacturer = manufacturers[manufacturerKey];
  }
  else {
    manufacturer = {
      name: gdtfFixture.$.Manufacturer,
    };
    warnings.push(`Please add manufacturer URL.`);
  }

  fixture.categories = [`Other`]; // TODO: can we find out categories?
  warnings.push(`Please add fixture categories.`);

  const timestamp = new Date().toISOString().replace(/T.*/, ``);
  const [createDate, lastModifyDate] = getRevisionDates();

  fixture.meta = {
    authors: [authorName],
    createDate: getIsoDateFromGdtfDate(createDate, timestamp),
    lastModifyDate: getIsoDateFromGdtfDate(lastModifyDate, timestamp),
    importPlugin: {
      plugin: `gdtf`,
      date: timestamp,
      comment: `GDTF v${xml.GDTF.$.DataVersion} fixture type ID: ${gdtfFixture.$.FixtureTypeID}`,
    },
  };

  fixture.comment = getFixtureComment();

  warnings.push(`Please add relevant links to the fixture.`);

  addRdmInfo();

  warnings.push(`Please add physical data to the fixture.`);

  fixture.matrix = {};

  addWheels();

  autoGenerateGdtfNameAttributes();
  const switchingChannelRelations = splitSwitchingChannels();

  addChannels();
  addModes();

  linkSwitchingChannels();

  cleanUpFixture(fixture, warnings);

  return {
    manufacturers: {
      [manufacturerKey]: manufacturer,
    },
    fixtures: {
      [fixtureKey]: fixture,
    },
    warnings: {
      [fixtureKey]: warnings,
    },
  };

  /**
   * @returns {[string | undefined, string | undefined]} An array with the earliest and latest revision dates of the GDTF fixture, if they are defined in <Revision> tag.
   */
  function getRevisionDates() {
    if (!gdtfFixture.Revisions?.[0]?.Revision) {
      return [undefined, undefined];
    }

    const revisions = gdtfFixture.Revisions[0].Revision;
    const earliestRevision = revisions[0];
    const latestRevision = revisions.at(-1);

    return [earliestRevision.$.Date, latestRevision.$.Date];
  }

  /**
   * @returns {string | undefined} The comment to add to the fixture.
   */
  function getFixtureComment() {
    const { Name, LongName, Manufacturer, Description } = gdtfFixture.$;

    const includeLongName = (LongName && LongName !== Name);
    const includeDescription = (Description && Description !== `${Manufacturer} ${Name}`);

    if (includeLongName && includeDescription) {
      return `${LongName}: ${Description}`;
    }

    if (includeLongName) {
      return LongName;
    }

    if (includeDescription) {
      return Description;
    }

    return undefined;
  }


  /**
   * Adds an RDM section to the OFL fixture and manufacturer if applicable.
   */
  function addRdmInfo() {
    if (!(`Protocols` in gdtfFixture) || gdtfFixture.Protocols[0] === `` || !(`FTRDM` in gdtfFixture.Protocols[0] || `RDM` in gdtfFixture.Protocols[0])) {
      return;
    }

    const rdmData = (gdtfFixture.Protocols[0].FTRDM || gdtfFixture.Protocols[0].RDM)[0];
    const softwareVersion = getLatestSoftwareVersion();

    manufacturer.rdmId = Number.parseInt(rdmData.$.ManufacturerID, 16);
    fixture.rdm = {
      modelId: Number.parseInt(rdmData.$.DeviceModelID, 16),
      softwareVersion: softwareVersion.name,
    };

    for (const personality of softwareVersion.personalities) {
      const index = Number.parseInt(personality.$.Value.replace(`0x`, ``), 16);
      const mode = followXmlNodeReference(gdtfFixture.DMXModes[0].DMXMode, personality.$.DMXMode);
      mode._oflRdmPersonalityIndex = index;
    }


    /**
     * @returns {object} Name and DMX personalities of the latest RDM software version (both may be undefined).
     */
    function getLatestSoftwareVersion() {
      let maxSoftwareVersion = undefined;

      for (const rdmVersion of rdmData.SoftwareVersionID || []) {
        if (!maxSoftwareVersion || rdmVersion.$.Value > maxSoftwareVersion.$.Value) {
          maxSoftwareVersion = rdmVersion;
        }
      }

      if (maxSoftwareVersion) {
        return {
          name: maxSoftwareVersion.$.Value,
          personalities: maxSoftwareVersion.DMXPersonality,
        };
      }

      return {
        name: rdmData.$.SoftwareVersionID,
        personalities: [],
      };
    }
  }


  /**
   * Adds wheels to the OFL fixture (if there are any).
   */
  function addWheels() {
    if (!(`Wheels` in gdtfFixture)) {
      return;
    }

    const gdtfWheels = (gdtfFixture.Wheels[0].Wheel || []).filter(
      wheel => wheel.$.Name !== `ColorMacro`,
    );

    if (gdtfWheels.length === 0) {
      return;
    }

    fixture.wheels = {};

    for (const gdtfWheel of gdtfWheels) {
      fixture.wheels[gdtfWheel.$.Name] = {
        slots: (gdtfWheel.Slot || []).map(gdtfSlot => {
          const name = gdtfSlot.$.Name;

          const slot = {
            type: `Unknown`,
          };

          if (name === `Open`) {
            slot.type = `Open`;
          }
          else if (name === `Closed`) {
            slot.type = `Closed`;
          }
          else if (`Color` in gdtfSlot.$) {
            slot.type = `Color`;
            slot.name = name;
            slot.colors = [getRgbColorFromGdtfColor(gdtfSlot.$.Color)];
          }
          else if (`Facet` in gdtfSlot) {
            slot.type = `Prism`;
            slot.name = name;
            slot.facets = gdtfSlot.Facet.length;
          }
          else if (name.startsWith(`Gobo`) || gdtfWheel.$.Name.startsWith(`Gobo`)) {
            slot.type = `Gobo`;
            slot.name = name;
          }
          else {
            slot.name = name;
          }

          return slot;
        }),
      };
    }
  }


  /**
   * Autmatically generates `Name` attributes for GDTF's `<DMXChannel>`,
   * `<LogicalChannel>` and `<ChannelFunction>` elements if they are not
   * already defined.
   */
  function autoGenerateGdtfNameAttributes() {
    for (const gdtfMode of gdtfFixture.DMXModes[0].DMXMode) {
      // add default Name attributes, so that the references work later
      for (const gdtfChannel of gdtfMode.DMXChannels[0].DMXChannel) {
        // auto-generate <DMXChannel> Name attribute
        const geometry = gdtfChannel.$.Geometry.split(`.`).pop();
        gdtfChannel.$.Name = `${geometry}_${gdtfChannel.LogicalChannel[0].$.Attribute}`;

        for (const gdtfLogicalChannel of gdtfChannel.LogicalChannel) {
          // auto-generate <LogicalChannel> Name attribute
          gdtfLogicalChannel.$.Name = gdtfLogicalChannel.$.Attribute;

          for (const [channelFunctionIndex, gdtfChannelFunction] of gdtfLogicalChannel.ChannelFunction.entries()) {
            // auto-generate <ChannelFunction> Name attribute if not already defined
            if (!(`Name` in gdtfChannelFunction.$)) {
              gdtfChannelFunction.$.Name = `${gdtfChannelFunction.$.Attribute} ${channelFunctionIndex + 1}`;
            }
          }
        }
      }
    }
  }

  /**
   * @returns {Relation[]} An array of relations.
   */
  function splitSwitchingChannels() {
    let relations = getModeMasterRelations();

    if (relations.length === 0) {
      relations = getLegacyRelations();
    }

    for (const relation of relations) {
      const followerChannel = relation.followerGdtfChannel;

      // if channel was already split, skip splitting it again, else
      // split channel such that followerChannelFunction is the only child
      if (followerChannel.LogicalChannel[0].ChannelFunction.length > 1) {
        const channelCopy = structuredClone(followerChannel);
        channelCopy.$.Name += `_OflSplit`;
        relation.followerGdtfChannel = channelCopy;

        // remove followerChannelFunction from followerChannel and all others from the copy
        const channelFunctionIndex = followerChannel.LogicalChannel[0].ChannelFunction.indexOf(relation.followerChannelFunction);
        followerChannel.LogicalChannel[0].ChannelFunction.splice(channelFunctionIndex, 1);
        channelCopy.LogicalChannel[0].ChannelFunction = [
          channelCopy.LogicalChannel[0].ChannelFunction[channelFunctionIndex],
        ];

        // insert channelCopy before the followerChannel
        const gdtfMode = gdtfFixture.DMXModes[0].DMXMode[relation.modeIndex];
        const channelIndex = gdtfMode.DMXChannels[0].DMXChannel.indexOf(followerChannel);
        gdtfMode.DMXChannels[0].DMXChannel.splice(channelIndex, 0, channelCopy);
      }

      delete relation.followerChannelFunction;
    }

    return relations;


    /**
     * Parses <ChannelFunction ModeMaster="…">'s relation data.
     * This way of specifying relations was added in GDTF v0.88.
     * @returns {Relation[]} An array of relations, may be empty.
     */
    function getModeMasterRelations() {
      return gdtfFixture.DMXModes[0].DMXMode.flatMap((gdtfMode, modeIndex) => {
        return gdtfMode.DMXChannels[0].DMXChannel.flatMap(gdtfDmxChannel => {
          return gdtfDmxChannel.LogicalChannel.flatMap(gdtfLogicalChannel => {
            return gdtfLogicalChannel.ChannelFunction.flatMap(gdtfChannelFunction => {
              if (!(`ModeMaster` in gdtfChannelFunction.$)) {
                return [];
              }

              const masterChannel = followXmlNodeReference(gdtfMode.DMXChannels[0], gdtfChannelFunction.$.ModeMaster.split(`.`)[0]);

              const dmxFrom = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannelFunction.$.ModeFrom, 0);
              const maxDmxValue = Math.pow(256, dmxFrom[1]) - 1;
              const dmxTo = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannelFunction.$.ModeTo, maxDmxValue, dmxFrom[1]);

              return [{
                modeIndex,
                masterGdtfChannel: masterChannel,
                switchingChannelName: gdtfDmxChannel.$.Name,
                followerGdtfChannel: gdtfDmxChannel,
                followerChannelFunction: gdtfChannelFunction,
                dmxFrom,
                dmxTo,
              }];
            });
          });
        });
      });
    }

    /**
     * Parses <Relation Type="Mode">'s relation data.
     * This behavior is deprecated since GDTF v0.88, but still supported as a fallback.
     * @returns {Relation[]} An array of relations, may be empty.
     */
    function getLegacyRelations() {
      return gdtfFixture.DMXModes[0].DMXMode.flatMap((gdtfMode, modeIndex) => {
        if (!(`Relations` in gdtfMode) || typeof gdtfMode.Relations[0] !== `object`) {
          return [];
        }

        return gdtfMode.Relations[0].Relation.flatMap(gdtfRelation => {
          if (gdtfRelation.$.Type !== `Mode`) {
            return [];
          }

          const masterChannel = followXmlNodeReference(gdtfMode.DMXChannels[0], gdtfRelation.$.Master);

          // Slave was renamed to Follower in GDTF v0.88
          const followerChannelReference = gdtfRelation.$.Follower || gdtfRelation.$.Slave;
          const followerChannel = followXmlNodeReference(gdtfMode.DMXChannels[0], followerChannelReference.split(`.`)[0]);
          const followerChannelFunction = followXmlNodeReference(gdtfMode.DMXChannels[0], followerChannelReference);

          const dmxFrom = getDmxValueWithResolutionFromGdtfDmxValue(gdtfRelation.$.DMXFrom, 0);
          const maxDmxValue = Math.pow(256, dmxFrom[1]) - 1;
          const dmxTo = getDmxValueWithResolutionFromGdtfDmxValue(gdtfRelation.$.DMXTo, maxDmxValue, dmxFrom[1]);

          return [{
            modeIndex,
            masterGdtfChannel: masterChannel,
            switchingChannelName: followerChannel.$.Name,
            followerGdtfChannel: followerChannel,
            followerChannelFunction,
            dmxFrom,
            dmxTo,
          }];
        });
      });
    }
  }

  /**
   * @typedef {object} ChannelWrapper
   * @property {string} key The channel key.
   * @property {object} channel The OFL channel object.
   * @property {number} maxResolution The highest used resolution of this channel.
   * @property {number[]} modeIndices The indices of the modes that this channel is used in.
   */

  /**
   * Add availableChannels and templateChannels to the fixture.
   */
  function addChannels() {
    const availableChannels = [];
    const templateChannels = [];

    for (const gdtfMode of gdtfFixture.DMXModes[0].DMXMode) {
      for (const gdtfChannel of gdtfMode.DMXChannels[0].DMXChannel) {
        if (gdtfChannel.$.DMXBreak === `Overwrite`) {
          addChannel(templateChannels, gdtfChannel);
        }
        else {
          addChannel(availableChannels, gdtfChannel);
        }
      }
    }

    // append $pixelKey to templateChannels' keys and names
    for (const channelWrapper of templateChannels) {
      channelWrapper.key += ` $pixelKey`;
      channelWrapper.channel.name += ` $pixelKey`;
    }

    cleanUpChannelWrappers([...availableChannels, ...templateChannels]);

    // convert availableChannels array to object and add it to fixture
    if (availableChannels.length > 0) {
      fixture.availableChannels = Object.fromEntries(
        availableChannels.map(channelWrapper => [channelWrapper.key, channelWrapper.channel]),
      );
    }

    // convert templateChannels array to object and add it to fixture
    if (templateChannels.length > 0) {
      fixture.templateChannels = Object.fromEntries(
        templateChannels.map(channelWrapper => [channelWrapper.key, channelWrapper.channel]),
      );
    }
  }

  /**
   * @param {ChannelWrapper[]} channelWrappers The OFL availableChannels or templateChannels object.
   * @param {object} gdtfChannel The GDTF <DMXChannel> XML object.
   */
  function addChannel(channelWrappers, gdtfChannel) {
    const name = getChannelName();

    if (gdtfChannel.LogicalChannel.length > 1) {
      warnings.push(`DMXChannel '${name}' has more than one LogicalChannel. This is not supported yet and could lead to undesired results.`);
    }

    const modeIndex = gdtfFixture.DMXModes[0].DMXMode.findIndex(
      gdtfMode => gdtfMode.DMXChannels[0].DMXChannel.includes(gdtfChannel),
    );

    const channel = {
      name,
      fineChannelAliases: [],
      dmxValueResolution: ``,
      defaultValue: null,
    };

    if (`Default` in gdtfChannel.$) {
      channel.defaultValue = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannel.$.Default);
    }

    if (`Highlight` in gdtfChannel.$ && gdtfChannel.$.Highlight !== `None`) {
      channel.highlightValue = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannel.$.Highlight);
    }

    const capabilities = getCapabilities();

    if (capabilities.length === 1) {
      channel.capability = capabilities[0];
      delete channel.capability.dmxRange;
    }
    else {
      channel.capabilities = capabilities;
    }

    replaceGdtfDmxValuesWithNumbers();

    // check if we already added the same channel in another mode
    const sameChannel = channelWrappers.find(
      channelWrapper => JSON.stringify(channelWrapper.channel) === JSON.stringify(channel) && !channelWrapper.modeIndices.includes(modeIndex),
    );
    if (sameChannel) {
      gdtfChannel._oflChannelKey = sameChannel.key;

      sameChannel.maxResolution = Math.max(sameChannel.maxResolution, getChannelResolution());
      sameChannel.modeIndices.push(modeIndex);
      return;
    }

    const channelKey = getChannelKey();

    gdtfChannel._oflChannelKey = channelKey;
    channelWrappers.push({
      key: channelKey,
      channel,
      maxResolution: getChannelResolution(),
      modeIndices: [modeIndex],
    });


    /**
     * @returns {string} The channel name.
     */
    function getChannelName() {
      const channelAttribute = gdtfChannel.LogicalChannel[0].$.Attribute;

      try {
        return gdtfFixture.AttributeDefinitions[0].Attributes[0].Attribute.find(
          attribute => attribute.$.Name === channelAttribute,
        ).$.Pretty || channelAttribute;
      }
      catch {
        return channelAttribute;
      }
    }

    /**
     * @returns {object[]} Array of OFL capability objects (but with GDTF DMX values).
     */
    function getCapabilities() {
      let minPhysicalValue = Number.POSITIVE_INFINITY;
      let maxPhysicalValue = Number.NEGATIVE_INFINITY;

      // save all <ChannelSet> XML nodes in a flat list
      const gdtfCapabilities = gdtfChannel.LogicalChannel.flatMap(gdtfLogicalChannel => {
        if (!gdtfLogicalChannel.ChannelFunction) {
          throw new Error(`LogicalChannel does not contain any ChannelFunction children in DMXChannel ${JSON.stringify(gdtfChannel, null, 2)}`);
        }

        return gdtfLogicalChannel.ChannelFunction.flatMap(gdtfChannelFunction => {
          if (!gdtfChannelFunction.ChannelSet) {
            // add an empty <ChannelSet />
            gdtfChannelFunction.ChannelSet = [{ $: {} }];
          }

          // save GDTF attribute for later
          gdtfChannelFunction._attribute = followXmlNodeReference(
            gdtfFixture.AttributeDefinitions[0].Attributes[0],
            gdtfChannelFunction.$.Attribute,
          ) || { $: { Name: `NoFeature` } };

          return gdtfChannelFunction.ChannelSet.map(gdtfChannelSet => {
            // save parent nodes for future use
            gdtfChannelSet._logicalChannel = gdtfLogicalChannel;
            gdtfChannelSet._channelFunction = gdtfChannelFunction;
            gdtfChannelSet._fixture = gdtfFixture;

            // do some preprocessing

            if (!(`$` in gdtfChannelSet)) {
              gdtfChannelSet.$ = {};
            }

            if (!(`Name` in gdtfChannelSet.$)) {
              gdtfChannelSet.$.Name = ``;
            }

            gdtfChannelSet._dmxFrom = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannelSet.$.DMXFrom, 0);

            const physicalFrom = parseFloatWithFallback(gdtfChannelSet.$.PhysicalFrom, 0);
            const physicalTo = parseFloatWithFallback(gdtfChannelSet.$.PhysicalTo, 1);

            gdtfChannelSet._physicalFrom = physicalFrom;
            gdtfChannelSet._physicalTo = physicalTo;

            minPhysicalValue = Math.min(minPhysicalValue, physicalFrom, physicalTo);
            maxPhysicalValue = Math.max(maxPhysicalValue, physicalFrom, physicalTo);

            return gdtfChannelSet;
          });
        });
      });

      // Simplify Intensity/ColorIntensity capabilities at the GDTF level
      // before mapping to OFL capabilities
      const simplifiedGdtfCapabilities = simplifyGdtfIntensityCapabilities(gdtfCapabilities);

      return simplifiedGdtfCapabilities.map((gdtfCapability, index) => {
        const capability = {
          dmxRange: [gdtfCapability._dmxFrom, getDmxRangeEnd(index)],
        };

        const gdtfAttribute = gdtfCapability._channelFunction._attribute;
        const attributeName = gdtfAttribute.$.Name;
        const capabilityTypeData = getCapabilityTypeData(attributeName);

        capability.type = capabilityTypeData.oflType;

        callHook(capabilityTypeData.beforePhysicalPropertyHook, capability, gdtfCapability, attributeName);

        const oflProperty = getOflProperty(capabilityTypeData, gdtfCapability);

        if (oflProperty !== null) {
          const physicalUnit = getPhysicalUnit(gdtfCapability);

          const physicalFrom = gdtfCapability._physicalFrom;
          const physicalTo = gdtfCapability._physicalTo;

          if (physicalFrom === physicalTo) {
            capability[oflProperty] = physicalUnit(physicalFrom, null);
          }
          else {
            capability[`${oflProperty}Start`] = physicalUnit(physicalFrom, physicalTo);
            capability[`${oflProperty}End`] = physicalUnit(physicalTo, physicalFrom);

            if (capability.brightnessStart === `0%` && capability.brightnessEnd === `100%`) {
              delete capability.brightnessStart;
              delete capability.brightnessEnd;
            }
          }
        }

        callHook(capabilityTypeData.afterPhysicalPropertyHook, capability, gdtfCapability, attributeName);

        if (gdtfCapability.$.Name) {
          capability.comment = gdtfCapability.$.Name;
        }

        return capability;
      });


      /**
       * @param {number} index The index of the capability.
       * @returns {[number, Resolution]} The GDTF DMX value for this capability's range end.
       */
      function getDmxRangeEnd(index) {
        const dmxFrom = simplifiedGdtfCapabilities[index]._dmxFrom;

        if (index === simplifiedGdtfCapabilities.length - 1) {
          // last capability
          const resolution = dmxFrom[1];
          return [Math.pow(256, resolution) - 1, resolution];
        }

        const [nextDmxFromValue, resolution] = simplifiedGdtfCapabilities[index + 1]._dmxFrom;
        return [nextDmxFromValue - 1, resolution];
      }

      /**
       * @param {string} attributeName The GDTF attribute name.
       * @returns {object} The capability type data from @file gdtf-attributes.js
       */
      function getCapabilityTypeData(attributeName) {
        let capabilityTypeData = gdtfAttributes[attributeName];

        if (!capabilityTypeData) {
          const enumeratedAttributeName = attributeName.replace(/\d+/, `(n)`).replace(/\d+/, `(m)`);
          capabilityTypeData = gdtfAttributes[enumeratedAttributeName];
        }

        if (!capabilityTypeData) {
          return {
            oflType: `Unknown (${attributeName})`, // will trigger an error in the validation
            oflProperty: `physical`, // will also trigger an error, but the information could be useful
          };
        }

        if (!capabilityTypeData.inheritFrom) {
          return capabilityTypeData;
        }

        // save the inherited result for later access
        gdtfAttributes[attributeName] = {

          ...getCapabilityTypeData(capabilityTypeData.inheritFrom),
          ...capabilityTypeData,
        };
        delete gdtfAttributes[attributeName].inheritFrom;

        return gdtfAttributes[attributeName];
      }

      /**
       * @param {Function | null} hook The hook function, or a falsy value.
       * @param {any[]} parameters The arguments to pass to the hook.
       * @returns {any} The return value of the hook, or null if no hook was called.
       */
      function callHook(hook, ...parameters) {
        if (hook) {
          return hook(...parameters);
        }

        return null;
      }

      /**
       * @param {object} capabilityTypeData The capability type data from @file gdtf-attributes.js
       * @param {object} gdtfCapability The enhanced <ChannelSet> XML object.
       * @returns {string | null} The OFL property name, or null.
       */
      function getOflProperty(capabilityTypeData, gdtfCapability) {
        if (!(`oflProperty` in capabilityTypeData)) {
          return null;
        }

        if (typeof capabilityTypeData.oflProperty === `function`) {
          return capabilityTypeData.oflProperty(gdtfCapability);
        }

        return capabilityTypeData.oflProperty;
      }

      /**
       * @param {object} gdtfCapability The enhanced <ChannelSet> XML object.
       * @returns {Function} The function to turn a physical value into an entity string with the correct unit.
       */
      function getPhysicalUnit(gdtfCapability) {
        const gdtfAttribute = gdtfCapability._channelFunction._attribute;
        const capabilityTypeData = getCapabilityTypeData(gdtfAttribute.$.Name);

        if (capabilityTypeData.oflProperty === `index`) {
          return gdtfUnits.None;
        }

        let physicalEntity = gdtfAttribute.$.PhysicalUnit;

        if (!physicalEntity) {
          physicalEntity = `None`;

          if (minPhysicalValue === 0 && maxPhysicalValue === 1) {
            physicalEntity = `Percent`;
          }
          else if (capabilityTypeData.defaultPhysicalEntity) {
            physicalEntity = capabilityTypeData.defaultPhysicalEntity;
          }
        }
        else if (!(physicalEntity in gdtfUnits)) {
          // ignore case of PhysicalUnit attribute
          physicalEntity = Object.keys(gdtfUnits).find(
            entity => entity.toLowerCase() === physicalEntity.toLowerCase(),
          );
        }

        return gdtfUnits[physicalEntity];
      }

      /**
       * Simplifies GDTF ChannelSet arrays where all sets represent Intensity/ColorIntensity
       * with identical physical brightness ranges (0 to 1). If all ChannelSets meet the criteria,
       * they are merged into a single ChannelSet spanning the full DMX range.
       * Comments are intentionally not preserved during simplification.
       * @param {object[]} gdtfCapabilitiesParameter Array of GDTF ChannelSet objects.
       * @returns {object[]} Simplified array of GDTF ChannelSets.
       */
      function simplifyGdtfIntensityCapabilities(gdtfCapabilitiesParameter) {
        // Check if this is a candidate for simplification:
        // 1. Multiple capabilities exist
        // 2. All capabilities have the same GDTF attribute (Dimmer or ColorAdd_*)
        // 3. All capabilities have PhysicalFrom: 0 and PhysicalTo: 1
        
        if (gdtfCapabilitiesParameter.length <= 1) {
          return gdtfCapabilitiesParameter;
        }

        const firstAttribute = gdtfCapabilitiesParameter[0]._channelFunction._attribute.$.Name;

        // Check if all capabilities have the same GDTF attribute
        const allSameAttribute = gdtfCapabilitiesParameter.every(
          gdtfCapability => gdtfCapability._channelFunction._attribute.$.Name === firstAttribute,
        );

        if (!allSameAttribute) {
          return gdtfCapabilitiesParameter;
        }

        // Check if the attribute is Dimmer (Intensity) or ColorAdd_* (ColorIntensity)
        const isDimmer = firstAttribute === `Dimmer`;
        const isColorAdd = firstAttribute.startsWith(`ColorAdd_`);

        if (!isDimmer && !isColorAdd) {
          return gdtfCapabilitiesParameter;
        }

        // Check if all capabilities have PhysicalFrom: 0 and PhysicalTo: 1
        const allHaveSameBrightness = gdtfCapabilitiesParameter.every(gdtfCapability => {
          return gdtfCapability._physicalFrom === 0 && gdtfCapability._physicalTo === 1;
        });

        if (!allHaveSameBrightness) {
          return gdtfCapabilitiesParameter;
        }

        // All checks passed - simplify to a single GDTF ChannelSet
        // Create a merged ChannelSet that spans the entire range
        const firstCapability = gdtfCapabilitiesParameter[0];
        const simplifiedGdtfCapability = {
          $: {
            DMXFrom: firstCapability.$.DMXFrom,
            PhysicalFrom: 0,
            PhysicalTo: 1,
            Name: ``, // Remove comment
          },
          _logicalChannel: firstCapability._logicalChannel,
          _channelFunction: firstCapability._channelFunction,
          _fixture: firstCapability._fixture,
          _dmxFrom: firstCapability._dmxFrom,
          _physicalFrom: 0,
          _physicalTo: 1,
        };

        return [simplifiedGdtfCapability];
      }
    }

    /**
     * @returns {number} The resolution of this channel.
     */
    function getChannelResolution() {
      // The Offset attribute replaced the Coarse/Fine/Ultra/Uber attributes in GDTF v1.0
      if (`Offset` in gdtfChannel.$) {
        return gdtfChannel.$.Offset.split(`,`).length;
      }

      if (xmlNodeHasNotNoneAttribute(gdtfChannel, `Uber`)) {
        return 4;
      }

      if (xmlNodeHasNotNoneAttribute(gdtfChannel, `Ultra`)) {
        return 3;
      }

      if (xmlNodeHasNotNoneAttribute(gdtfChannel, `Fine`)) {
        return 2;
      }

      return 1;
    }

    /**
     * @returns {string} The channel key, derived from the name and made unique.
     */
    function getChannelKey() {
      let key = name;

      // make unique by appending ' 2', ' 3', ... if necessary
      let duplicates = 1;
      const keyExists = () => channelWrappers.some(channelWrapper => channelWrapper.key === key);
      while (keyExists()) {
        duplicates++;
        key = `${name} ${duplicates}`;
      }

      return key;
    }

    /**
     * Look through all GDTF DMX values in this channel (consisting of DMX value
     * and the resolution in which it is specified), make their resolution equal and
     * replace them with a number. Then set the channel's dmxValueResolution to
     * this resolution.
     */
    function replaceGdtfDmxValuesWithNumbers() {
      const maxDmxValueResolution = getMaxDmxValueResolution();
      const scaleToResolution = Math.max(CoarseChannel.RESOLUTION_8BIT, maxDmxValueResolution);

      if (channel.defaultValue) {
        channel.defaultValue = scaleDmxValue(...channel.defaultValue, scaleToResolution);
      }

      if (channel.highlightValue) {
        channel.highlightValue = scaleDmxValue(...channel.highlightValue, scaleToResolution);
      }

      if (channel.capabilities) {
        for (const capability of channel.capabilities) {
          const startValue = capability.dmxRange[0][0];
          const startResolution = capability.dmxRange[0][1];
          const endValue = capability.dmxRange[1][0];
          const endResolution = capability.dmxRange[1][1];

          try {
            capability.dmxRange = scaleDmxRangeIndividually(startValue, startResolution, endValue, endResolution, scaleToResolution);
          }
          catch {
            // will be caught by validation
            capability.dmxRange = [startValue, endValue];
          }
        }
      }

      if (maxDmxValueResolution !== 0) {
        channel.dmxValueResolution = `${maxDmxValueResolution * 8}bit`;
      }


      /**
       * @returns {number} The highest DMX value resolution used in this channel, or 0 if no DMX value is used at all.
       */
      function getMaxDmxValueResolution() {
        const dmxValues = [];

        if (channel.defaultValue && channel.defaultValue[0] !== 0) {
          dmxValues.push(channel.defaultValue);
        }

        if (channel.highlightValue && channel.highlightValue[0] !== 0) {
          dmxValues.push(channel.highlightValue);
        }

        if (channel.capabilities) {
          for (const capability of channel.capabilities) {
            dmxValues.push(capability.dmxRange[0], capability.dmxRange[1]);
          }
        }

        return Math.max(0, ...dmxValues.map(
          ([value, resolution]) => resolution,
        ));
      }
    }
  }

  /**
   * @typedef {object} DmxBreakWrapper Holds a list of OFL channel keys belonging to consecutive GDTF channels with the same DMXBreak attribute.
   * @property {string | undefined} dmxBreak The DMXBreak attribute of consecutive DMXChannel nodes.
   * @property {string} geometry The Geometry attribute of consecutive DMXChannel nodes.
   * @property {string[]} channels The OFL channel keys in this DMX break.
   */

  /**
   * Add modes and matrix pixel keys (if needed) to the fixture.
   */
  function addModes() {
    // save all matrix pixels that are used in some mode
    const matrixPixels = new Set();

    fixture.modes = gdtfFixture.DMXModes[0].DMXMode.map(gdtfMode => {
      /** @type {DmxBreakWrapper[]} */
      const dmxBreakWrappers = [];

      for (const gdtfChannel of gdtfMode.DMXChannels[0].DMXChannel) {
        if (dmxBreakWrappers.length === 0 || dmxBreakWrappers.at(-1).dmxBreak !== gdtfChannel.$.DMXBreak) {
          dmxBreakWrappers.push({
            dmxBreak: gdtfChannel.$.DMXBreak,
            geometry: gdtfChannel.$.Geometry,
            channels: [],
          });
        }

        addChannelKeyToDmxBreakWrapper(gdtfChannel, dmxBreakWrappers);
      }

      const channels = [];

      for (const channelWrapper of dmxBreakWrappers) {
        if (channelWrapper.dmxBreak !== `Overwrite`) {
          // just append the channels
          channels.push(...channelWrapper.channels);
          continue;
        }

        // append a matrix channel insert block

        const geometryReferences = findGeometryReferences(channelWrapper.geometry);
        const usedMatrixPixels = geometryReferences.map(
          (gdtfGeoRef, index) => gdtfGeoRef.$.Name || `${channelWrapper.geometry} ${index + 1}`,
        );

        for (const pixelKey of usedMatrixPixels) {
          matrixPixels.add(pixelKey);
        }

        channels.push({
          insert: `matrixChannels`,
          repeatFor: usedMatrixPixels,
          channelOrder: `perPixel`,
          templateChannels: channelWrapper.channels.map(
            channelKey => `${channelKey} $pixelKey`,
          ),
        });
      }

      return {
        name: gdtfMode.$.Name,
        rdmPersonalityIndex: gdtfMode._oflRdmPersonalityIndex,
        channels,
      };
    });

    const matrixPixelList = [...matrixPixels];

    fixture.matrix = {
      pixelKeys: [
        [
          matrixPixelList,
        ],
      ],
    };

    // try to simplify matrix channel insert blocks
    for (const mode of fixture.modes) {
      for (const channel of mode.channels) {
        if (typeof channel === `object` && channel.insert === `matrixChannels`
          && JSON.stringify(matrixPixelList) === JSON.stringify(channel.repeatFor)) {
          channel.repeatFor = `eachPixelXYZ`;
        }
      }
    }


    /**
     * Adds the OFL channel key (and fine channel keys) to dmxBreakWrappers'
     * last entry's channels array.
     * @param {object} gdtfChannel The GDTF channel object.
     * @param {DmxBreakWrapper[]} dmxBreakWrappers The DMXBreak wrapper array.
     */
    function addChannelKeyToDmxBreakWrapper(gdtfChannel, dmxBreakWrappers) {
      const channelKey = gdtfChannel._oflChannelKey;
      const oflChannel = fixture.availableChannels[channelKey];

      const channels = dmxBreakWrappers.at(-1).channels;

      const channelKeys = [channelKey, ...(oflChannel.fineChannelAliases ?? [])];

      // The Offset attribute replaced the Coarse/Fine/Ultra/Uber attributes in GDTF v1.0
      const channelOffsets = xmlNodeHasNotNoneAttribute(gdtfChannel, `Offset`)
        ? gdtfChannel.$.Offset.split(`,`)
        : [
          gdtfChannel.$.Coarse,
          gdtfChannel.$.Fine,
          gdtfChannel.$.Ultra,
          gdtfChannel.$.Uber,
        ];

      for (const [index, channelOffset] of channelOffsets.entries()) {
        const dmxChannelNumber = Number.parseInt(channelOffset, 10);

        if (!Number.isNaN(dmxChannelNumber)) {
          channels[dmxChannelNumber - 1] = channelKeys[index];
        }
      }
    }

    /**
     * Find all <GeometryReference> XML nodes with a given Geometry attribute.
     * @param {string} geometryName The name of the geometry reference.
     * @returns {object[]} An array of all geometry reference XML objects.
     */
    function findGeometryReferences(geometryName) {
      const geometryReferences = [];

      traverseGeometries(gdtfFixture.Geometries[0]);

      return geometryReferences;


      /**
       * Recursively go through the child nodes of a given XML node and add
       * <GeometryReference> nodes with the correct Geometry attribute to the
       * geometryReferences array.
       * @param {object} xmlNode The XML node object to start traversing at.
       */
      function traverseGeometries(xmlNode) {
        // add all suitable GeometryReference child nodes
        geometryReferences.push(
          ...(xmlNode.GeometryReference || []).filter(gdtfGeoRef => gdtfGeoRef.$.Geometry === geometryName),
        );

        // traverse all other child nodes
        for (const [tagName, childNodes] of Object.entries(xmlNode)) {
          if (tagName !== `$` && tagName !== `GeometryReference`) {
            for (const childNode of childNodes) {
              traverseGeometries(childNode);
            }
          }
        }
      }
    }
  }

  /**
   * Adds switchChannels property to all master channels' capabilities and use
   * the switching channel key in modes' channel lists.
   */
  function linkSwitchingChannels() {
    const { relationsPerMaster, modeChannelReplacements } = transformRelations(fixture, switchingChannelRelations);

    // switch channels in trigger channels' capabilities
    for (const triggerChannelKey of Object.keys(relationsPerMaster)) {
      const triggerChannelRelations = simplifySwitchingChannelRelations(triggerChannelKey);

      const triggerChannel = fixture.availableChannels?.[triggerChannelKey] ?? fixture.templateChannels[`${triggerChannelKey} $pixelKey`];

      if (triggerChannel.defaultValue === null) {
        triggerChannel.defaultValue = 0;
      }

      const channelResolution = getChannelResolution(triggerChannel);

      for (const capability of triggerChannel.capabilities) {
        capability.switchChannels = Object.fromEntries(Object.entries(triggerChannelRelations).flatMap(
          ([switchingChannelKey, relations]) => relations
            .filter(relation => {
              const [dmxFrom, dmxTo] = scaleDmxRangeIndividually(...relation.dmxFrom, ...relation.dmxTo, channelResolution);
              return capability.dmxRange[0] >= dmxFrom && capability.dmxRange[1] <= dmxTo;
            })
            .map(relation => [switchingChannelKey, relation.switchToChannelKey]),
        ));
      }
    }

    replaceSwitchingChannelsInModes(fixture, modeChannelReplacements);


    /**
     * @param {string} triggerChannelKey Key of the trigger channel, whose relations should be simplified.
     * @returns {object} Simplified switching channel's relations.
     */
    function simplifySwitchingChannelRelations(triggerChannelKey) {
      const simplifiedRelations = {};

      for (const [switchingChannelKey, relations] of Object.entries(relationsPerMaster[triggerChannelKey])) {
        // were this switching channel's relations already added?
        const addedSwitchingChannelKey = Object.keys(simplifiedRelations).find(
          otherKey => JSON.stringify(relationsPerMaster[triggerChannelKey][otherKey]) === JSON.stringify(relations),
        );

        if (addedSwitchingChannelKey) {
          // already added switching channel has the same relations, so we don't need to add it
          // but we need to update modeChannelReplacements
          for (const mode of modeChannelReplacements) {
            for (const channelKey of Object.keys(mode)) {
              if (mode[channelKey] === switchingChannelKey) {
                mode[channelKey] = addedSwitchingChannelKey;
              }
            }
          }
        }
        else {
          // add the new switching channel
          simplifiedRelations[switchingChannelKey] = relations;
        }
      }

      return simplifiedRelations;
    }

    /**
     * @param {CoarseChannel} channel The OFL channel object.
     * @returns {number} The fineness of the channel.
     */
    function getChannelResolution(channel) {
      if (`dmxValueResolution` in channel) {
        return Number.parseInt(channel.dmxValueResolution, 10) * 8;
      }

      if (`fineChannelAliases` in channel) {
        return channel.fineChannelAliases.length + 1;
      }

      return CoarseChannel.RESOLUTION_8BIT;
    }
  }
}


/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @returns {Promise<object>} A Promise that resolves to the parsed XML object.
 */
async function getGdtfXml(buffer, filename) {
  let xmlString = buffer.toString();

  if (filename.endsWith(`.gdtf`)) {
    // unzip the .gdtf (zip) file and check its description.xml file
    const zip = await JSZip.loadAsync(buffer);

    const descriptionFile = zip.file(`description.xml`);
    if (descriptionFile === null) {
      throw new Error(`The provided .gdtf (zip) file does not contain a 'description.xml' file in the root directory.`);
    }

    xmlString = await descriptionFile.async(`string`);
  }

  return xml2js.parseStringPromise(xmlString);
}

/**
 * Remove unnecessary `name` and `dmxValueResolution` properties and fill/remove
 * `fineChannelAliases`.
 * @param {ChannelWrapper[]} channelWrappers The OFL availableChannels or templateChannels objects.
 */
function cleanUpChannelWrappers(channelWrappers) {
  for (const channelWrapper of channelWrappers) {
    const { key: channelKey, channel, maxResolution } = channelWrapper;

    if (channelKey === channel.name) {
      delete channel.name;
    }

    if (maxResolution === CoarseChannel.RESOLUTION_8BIT) {
      delete channel.fineChannelAliases;
    }
    else {
      // CoarseChannel.RESOLUTION_16BIT
      channel.fineChannelAliases.push(`${channelKey} fine`);

      for (let index = CoarseChannel.RESOLUTION_24BIT; index <= maxResolution; index++) {
        channel.fineChannelAliases.push(`${channelKey} fine^${index - 1}`);
      }
    }

    if (channel.dmxValueResolution === `${maxResolution * 8}bit` || channel.dmxValueResolution === ``) {
      delete channel.dmxValueResolution;
    }
  }
}

/**
 * @typedef {object} SwitchToChannelInfo
 * @property {[number, Resolution]} dmxFrom The DMX value and DMX resolution of the start of the DMX range triggering this relation.
 * @property {[number, Resolution]} dmxTo The DMX value and DMX resolution of the end of the DMX range triggering this relation.
 * @property {string} switchToChannelKey The key of the channel to switch to.
 */

/**
 * @typedef {object} TransformedRelations
 * @property {Record<string, Record<string, SwitchToChannelInfo>>} relationsPerMaster An object mapping a master channel key and a switching channel key to the switch to channel information.
 * @property {ModeChannelReplacements} modeChannelReplacements An object mapping a mode index and a switch to channel key to the switching channel key.
 */

/**
 * @typedef {Record<number, Record<string, string>>} ModeChannelReplacements
 * An object mapping a mode index and a switch to channel key to the switching channel key.
 */

/**
 * Bring relations into a structure we can work with.
 * @param {object} fixture The OFL fixture object.
 * @param {Relation[]} switchingChannelRelations An array of relations.
 * @returns {TransformedRelations} The transformed relations.
 */
function transformRelations(fixture, switchingChannelRelations) {
  const relationsPerMaster = {};
  const modeChannelReplacements = {};

  // bring relations into a structure we can work with
  for (const relation of switchingChannelRelations) {
    const masterKey = relation.masterGdtfChannel._oflChannelKey;

    if (!(masterKey in relationsPerMaster)) {
      relationsPerMaster[masterKey] = {};
    }

    const modeIndex = relation.modeIndex;
    const switchingChannelKey = `${modeIndex}_${relation.switchingChannelName}`;
    const switchToChannelKey = relation.followerGdtfChannel._oflChannelKey;

    if (!(switchingChannelKey in relationsPerMaster[masterKey])) {
      relationsPerMaster[masterKey][switchingChannelKey] = [];
    }

    relationsPerMaster[masterKey][switchingChannelKey].push({
      dmxFrom: relation.dmxFrom,
      dmxTo: relation.dmxTo,
      switchToChannelKey,
    });

    if (!modeChannelReplacements[modeIndex]) {
      modeChannelReplacements[modeIndex] = {};
    }

    modeChannelReplacements[modeIndex][switchToChannelKey] = switchingChannelKey;

    transformRelationFineChannels(relation, switchingChannelKey, switchToChannelKey);
  }

  return { relationsPerMaster, modeChannelReplacements };


  /**
   * Adds all implicit fine channel relations for a given relation.
   * @param {Relation} relation The relation for the coarse channel.
   * @param {string} switchingChannelKey The switching channel key of the coarse channel.
   * @param {string} switchToChannelKey The switch to channel key of the coarse channel.
   */
  function transformRelationFineChannels(relation, switchingChannelKey, switchToChannelKey) {
    const masterKey = relation.masterGdtfChannel._oflChannelKey;
    const modeIndex = relation.modeIndex;

    const switchToChannel = fixture.availableChannels[switchToChannelKey];
    if (switchToChannel && `fineChannelAliases` in switchToChannel) {
      for (const [fineness, fineChannelAlias] of switchToChannel.fineChannelAliases.entries()) {
        let switchingFineChannelKey = `${switchingChannelKey} fine`;
        if (fineness > 0) {
          switchingFineChannelKey += `^${fineness + 1}`;
        }

        if (!(switchingFineChannelKey in relationsPerMaster[masterKey])) {
          relationsPerMaster[masterKey][switchingFineChannelKey] = [];
        }

        relationsPerMaster[masterKey][switchingFineChannelKey].push({
          dmxFrom: relation.dmxFrom,
          dmxTo: relation.dmxTo,
          switchToChannelKey: fineChannelAlias,
        });
        modeChannelReplacements[modeIndex][fineChannelAlias] = switchingFineChannelKey;
      }
    }
  }
}

/**
 * Replaces normal channels with switching channels in fixture's modes.
 * @param {object} fixture The OFL fixture object.
 * @param {ModeChannelReplacements} modeChannelReplacements An object mapping a mode index and a switch to channel key to the switching channel key.
 */
function replaceSwitchingChannelsInModes(fixture, modeChannelReplacements) {
  for (const [modeIndex, mode] of fixture.modes.entries()) {
    if (!(modeIndex in modeChannelReplacements)) {
      continue;
    }

    for (const switchToChannelKey of Object.keys(modeChannelReplacements[modeIndex])) {
      const channelIndex = mode.channels.indexOf(switchToChannelKey);

      if (channelIndex !== -1) {
        mode.channels[channelIndex] = modeChannelReplacements[modeIndex][switchToChannelKey];
      }
    }
  }
}

/**
 * Removes `defaultValue`s and fixture matrix if they're unneeded.
 * @param {object} fixture The OFL fixture object.
 * @param {string[]} warnings An array to add warnings to.
 */
function cleanUpFixture(fixture, warnings) {
  if (`availableChannels` in fixture) {
    for (const channelKey of Object.keys(fixture.availableChannels)) {
      const channel = fixture.availableChannels[channelKey];
      if (channel.defaultValue === null) {
        delete channel.defaultValue;
      }
    }
  }

  if (`templateChannels` in fixture) {
    warnings.push(`Please fix the visual representation of the matrix.`);

    for (const channelKey of Object.keys(fixture.templateChannels)) {
      const channel = fixture.templateChannels[channelKey];
      if (channel.defaultValue === null) {
        delete channel.defaultValue;
      }
    }
  }
  else {
    delete fixture.matrix;
  }
}

/**
 * @param {object} xmlNode An XML node object.
 * @param {string} attribute The attribute name to check.
 * @returns {boolean} True if the node has the attribute and its value is not "None", false otherwise.
 */
function xmlNodeHasNotNoneAttribute(xmlNode, attribute) {
  return attribute in xmlNode.$ && xmlNode.$[attribute] !== `None`;
}

/**
 * GDTF date strings are already in ISO format. Before GDTF v1.0, date strings had
 * the form "dd.MM.yyyy HH:mm:ss", so those have to be converted to the ISO format.
 *
 * @see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-date
 * @param {string | undefined} dateString An ISO date string or a date in the form "dd.MM.yyyy HH:mm:ss"
 * @param {string} fallbackDateString A fallback date string to return if the parsed date is not valid.
 * @returns {string} A date string in the form "YYYY-MM-DD" (may be the provided fallback date string).
 */
function getIsoDateFromGdtfDate(dateString, fallbackDateString) {
  if (!dateString) {
    return fallbackDateString;
  }

  const isoDateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoDateMatch !== null) {
    return isoDateMatch[1];
  }

  const germanDateTimeRegex = /^([0-3]?\d)\.([01]?\d)\.(\d{4})\s+\d?\d:\d?\d:\d?\d$/;
  const match = dateString.match(germanDateTimeRegex);

  try {
    const [, day, month, year] = match;
    const date = new Date(Date.UTC(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, day));

    return date.toISOString().replace(/T.*/, ``);
  }
  catch {
    return fallbackDateString;
  }
}

/**
 * @param {string | undefined} dmxValueString GDTF DMX value in the form "128/2", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-DMXValue
 * @param {number | undefined} fallbackValue DMX value that is used if `dmxValueString` is falsy.
 * @param {number} [fallbackResolution=1] DMX value resolution that is used if `dmxValueString` is falsy.
 * @returns {[number, Resolution]} Array containing DMX value and DMX resolution.
 */
function getDmxValueWithResolutionFromGdtfDmxValue(dmxValueString, fallbackValue, fallbackResolution = 1) {
  if (!dmxValueString && fallbackValue !== undefined) {
    return [fallbackValue, fallbackResolution];
  }

  try {
    const [, value, resolution] = dmxValueString.match(/^(\d+)\/(\d)$/);
    return [Number.parseInt(value, 10), Number.parseInt(resolution, 10)];
  }
  catch {
    return [Number.parseInt(dmxValueString, 10) || 0, 1];
  }
}

/**
 * @param {string} value The string to parse.
 * @param {number} fallback The number to use if the string can't be parsed.
 * @returns {number} The parsed number.
 */
function parseFloatWithFallback(value, fallback) {
  const number = Number.parseFloat(value);
  return Number.isNaN(number) ? fallback : number;
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
