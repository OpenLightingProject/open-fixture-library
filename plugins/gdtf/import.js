const xml2js = require(`xml2js`);
const JSZip = require(`jszip`);
const promisify = require(`util`).promisify;

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const manufacturers = require(`../../fixtures/manufacturers.json`);
const { CoarseChannel } = require(`../../lib/model.js`);
const { scaleDmxValue, scaleDmxRangeIndividually } = require(`../../lib/scale-dmx-values.js`);
const { gdtfAttributes, gdtfUnits } = require(`./gdtf-attributes.js`);
const { getRgbColorFromGdtfColor, followXmlNodeReference } = require(`./gdtf-helpers.js`);

module.exports.version = `0.2.0`;

/**
 * @param {Buffer} buffer The imported file.
 * @param {String} filename The imported file's name.
 * @param {String} authorName The importer's name.
 * @returns {Promise.<Object, Error>} A Promise resolving to an out object
 */
module.exports.import = async function importGdtf(buffer, filename, authorName) {
  const parser = new xml2js.Parser();

  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
  };

  const warnings = [];

  let xmlStr = buffer.toString();

  if (filename.endsWith(`.gdtf`)) {
    // unzip the .gdtf (zip) file and check its description.xml file
    const zip = await JSZip.loadAsync(buffer);

    const descriptionFile = zip.file(`description.xml`);
    if (descriptionFile === null) {
      throw new Error(`The provided .gdtf (zip) file does not contain a 'description.xml' file in the root directory.`);
    }

    xmlStr = descriptionFile.async(`string`);
  }

  const xml = await promisify(parser.parseString)(xmlStr);

  const gdtfFixture = xml.GDTF.FixtureType[0];
  fixture.name = gdtfFixture.$.Name;
  fixture.shortName = gdtfFixture.$.ShortName;

  const manKey = slugify(gdtfFixture.$.Manufacturer);
  const fixKey = `${manKey}/${slugify(fixture.name)}`;

  let manufacturer;
  if (manKey in manufacturers) {
    manufacturer = manufacturers[manKey];
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

  if (`availableChannels` in fixture) {
    Object.keys(fixture.availableChannels).forEach(chKey => {
      const channel = fixture.availableChannels[chKey];
      if (channel.defaultValue === null) {
        delete channel.defaultValue;
      }
    });
  }

  if (`templateChannels` in fixture) {
    warnings.push(`Please fix the visual representation of the matrix.`);

    Object.keys(fixture.templateChannels).forEach(chKey => {
      const channel = fixture.templateChannels[chKey];
      if (channel.defaultValue === null) {
        delete channel.defaultValue;
      }
    });
  }
  else {
    delete fixture.matrix;
  }

  return {
    manufacturers: {
      [manKey]: manufacturer,
    },
    fixtures: {
      [fixKey]: fixture,
    },
    warnings: {
      [fixKey]: warnings,
    },
  };

  /**
   * @returns {[String|undefined, String|undefined]} An array with the earliest and latest revision dates of the GDTF fixture, if they are defined in <Revision> tag.
   */
  function getRevisionDates() {
    if (!(`Revisions` in gdtfFixture) || !(`Revision` in gdtfFixture.Revisions[0])) {
      return [undefined, undefined];
    }

    const revisions = gdtfFixture.Revisions[0].Revision;
    const earliestRevision = revisions[0];
    const latestRevision = revisions[revisions.length - 1];

    return [earliestRevision.$.Date, latestRevision.$.Date];
  }

  /**
   * @returns {String|undefined} The comment to add to the fixture.
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
    if (!(`Protocols` in gdtfFixture) || !(`FTRDM` in gdtfFixture.Protocols[0] || `RDM` in gdtfFixture.Protocols[0])) {
      return;
    }

    const rdmData = (gdtfFixture.Protocols[0].FTRDM || gdtfFixture.Protocols[0].RDM)[0];
    const softwareVersion = getLatestSoftwareVersion();

    manufacturer.rdmId = Number.parseInt(rdmData.$.ManufacturerID, 16);
    fixture.rdm = {
      modelId: Number.parseInt(rdmData.$.DeviceModelID, 16),
      softwareVersion: softwareVersion.name,
    };

    softwareVersion.personalities.forEach(personality => {
      const index = Number.parseInt(personality.$.Value.replace(`0x`, ``), 16);
      const mode = followXmlNodeReference(gdtfFixture.DMXModes[0].DMXMode, personality.$.DMXMode);
      mode._oflRdmPersonalityIndex = index;
    });


    /**
     * @returns {Object} Name and DMX personalities of the latest RDM software version(both may be undefined).
     */
    function getLatestSoftwareVersion() {
      const maxSoftwareVersion = (rdmData.SoftwareVersionID || []).reduce(
        (maxVersion, currVersion) => ((maxVersion && maxVersion.$.Value > currVersion.$.Value) ? maxVersion : currVersion),
      );

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

    gdtfWheels.forEach(gdtfWheel => {
      fixture.wheels[gdtfWheel.$.Name] = {
        slots: gdtfWheel.Slot.map(gdtfSlot => {
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
    });
  }


  /**
   * Autmatically generates `Name` attributes for GDTF's `<DMXChannel>`,
   * `<LogicalChannel>` and `<ChannelFunction>` elements if they are not
   * already defined.
   */
  function autoGenerateGdtfNameAttributes() {
    gdtfFixture.DMXModes[0].DMXMode.forEach((gdtfMode, modeIndex) => {
      // add default Name attributes, so that the references work later
      gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfChannel => {
        // auto-generate <DMXChannel> Name attribute
        const geometry = gdtfChannel.$.Geometry.split(`.`).pop();
        gdtfChannel.$.Name = `${geometry}_${gdtfChannel.LogicalChannel[0].$.Attribute}`;

        gdtfChannel.LogicalChannel.forEach(gdtfLogicalChannel => {
          // auto-generate <LogicalChannel> Name attribute
          gdtfLogicalChannel.$.Name = gdtfLogicalChannel.$.Attribute;

          gdtfLogicalChannel.ChannelFunction.forEach((gdtfChannelFunction, channelFunctionIndex) => {
            // auto-generate <ChannelFunction> Name attribute if not already defined
            if (!(`Name` in gdtfChannelFunction.$)) {
              gdtfChannelFunction.$.Name = `${gdtfChannelFunction.$.Attribute} ${channelFunctionIndex + 1}`;
            }
          });
        });
      });
    });
  }

  /**
   * @typedef {Object} Relation
   * @property {Number} modeIndex The zero-based index of the mode this relation applies to.
   * @property {Object} masterGdtfChannel The GDTF channel that triggers switching.
   * @property {String} switchingChannelName The name of the switching channel (containing multiple default channels).
   * @property {Object} followerGdtfChannel The GDTF channel that is switched by the master.
   * @property {Number} dmxFrom The start of the DMX range triggering this relation.
   * @property {Number} dmxTo The end of the DMX range triggering this relation.
   */

  /**
   * @returns {Array.<Relation>} An array of relations.
   */
  function splitSwitchingChannels() {
    const relations = [];

    addModeMasterRelations();

    if (relations.length === 0) {
      addLegacyRelations();
    }

    relations.forEach(relation => {
      const followerChannel = relation.followerGdtfChannel;

      // if channel was already split, skip splitting it again, else
      // split channel such that followerChannelFunction is the only child
      if (followerChannel.LogicalChannel[0].ChannelFunction.length > 1) {
        const channelCopy = JSON.parse(JSON.stringify(followerChannel));
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
    });

    return relations;


    /**
     * Adds <ChannelFunction ModeMaster="…">'s relation data to the array.
     * This way of specifying relations was added in GDTF v0.88.
     */
    function addModeMasterRelations() {
      gdtfFixture.DMXModes[0].DMXMode.forEach((gdtfMode, modeIndex) => {
        gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfDmxChannel => {
          gdtfDmxChannel.LogicalChannel.forEach(gdtfLogicalChannel => {
            gdtfLogicalChannel.ChannelFunction.forEach(gdtfChannelFunction => {
              if (!(`ModeMaster` in gdtfChannelFunction.$)) {
                return;
              }

              const masterChannel = followXmlNodeReference(gdtfMode.DMXChannels[0], gdtfChannelFunction.$.ModeMaster.split(`.`)[0]);

              const dmxFrom = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannelFunction.$.ModeFrom || `0/1`);
              const maxDmxValue = Math.pow(256, dmxFrom[1]) - 1;
              const dmxTo = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannelFunction.$.ModeTo || `${maxDmxValue}/${dmxFrom[1]}`);

              const relation = {
                modeIndex,
                masterGdtfChannel: masterChannel,
                switchingChannelName: gdtfDmxChannel.$.Name,
                followerGdtfChannel: gdtfDmxChannel,
                followerChannelFunction: gdtfChannelFunction,
                dmxFrom,
                dmxTo,
              };

              relations.push(relation);
            });
          });
        });
      });
    }

    /**
     * Adds <Relation Type="Mode">'s relation data to the array.
     * This behavior is deprecated since GDTF v0.88, but still supported as a fallback.
     */
    function addLegacyRelations() {
      gdtfFixture.DMXModes[0].DMXMode.forEach((gdtfMode, modeIndex) => {
        if (!(`Relations` in gdtfMode) || typeof gdtfMode.Relations[0] !== `object`) {
          return;
        }

        gdtfMode.Relations[0].Relation.forEach(gdtfRelation => {
          if (gdtfRelation.$.Type !== `Mode`) {
            return;
          }

          const masterChannel = followXmlNodeReference(gdtfMode.DMXChannels[0], gdtfRelation.$.Master);

          // Slave was renamed to Follower in GDTF v0.88
          const followerChannelReference = gdtfRelation.$.Follower || gdtfRelation.$.Slave;
          const followerChannel = followXmlNodeReference(gdtfMode.DMXChannels[0], followerChannelReference.split(`.`)[0]);
          const followerChannelFunction = followXmlNodeReference(gdtfMode.DMXChannels[0], followerChannelReference);

          const dmxFrom = getDmxValueWithResolutionFromGdtfDmxValue(gdtfRelation.$.DMXFrom || `0/1`);
          const maxDmxValue = Math.pow(256, dmxFrom[1]) - 1;
          const dmxTo = getDmxValueWithResolutionFromGdtfDmxValue(gdtfRelation.$.DMXTo || `${maxDmxValue}/${dmxFrom[1]}`);

          const relation = {
            modeIndex,
            masterGdtfChannel: masterChannel,
            switchingChannelName: followerChannel.$.Name,
            followerGdtfChannel: followerChannel,
            followerChannelFunction,
            dmxFrom,
            dmxTo,
          };

          relations.push(relation);
        });
      });
    }
  }

  /**
   * @typedef {Object} ChannelWrapper
   * @property {String} key The channel key.
   * @property {Object} channel The OFL channel object.
   * @property {Number} maxResolution The highest used resolution of this channel.
   * @property {Array.<Number>} modeIndices The indices of the modes that this channel is used in.
   */

  /**
   * Add availableChannels and templateChannels to the fixture.
   */
  function addChannels() {
    const availableChannels = [];
    const templateChannels = [];

    gdtfFixture.DMXModes[0].DMXMode.forEach(gdtfMode => {
      gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfChannel => {
        if (gdtfChannel.$.DMXBreak === `Overwrite`) {
          addChannel(templateChannels, gdtfChannel);
        }
        else {
          addChannel(availableChannels, gdtfChannel);
        }
      });
    });

    // append $pixelKey to templateChannels' keys and names
    templateChannels.forEach(channelWrapper => {
      channelWrapper.key += ` $pixelKey`;
      channelWrapper.channel.name += ` $pixelKey`;
    });

    // remove unnecessary name and dmxValueResolution properties
    // and fill/remove fineChannelAliases
    availableChannels.concat(templateChannels).forEach(channelWrapper => {
      const { key: chKey, channel, maxResolution } = channelWrapper;

      if (chKey === channel.name) {
        delete channel.name;
      }

      if (maxResolution === CoarseChannel.RESOLUTION_8BIT) {
        delete channel.fineChannelAliases;
      }
      else {
        // CoarseChannel.RESOLUTION_16BIT
        channel.fineChannelAliases.push(`${chKey} fine`);

        for (let i = CoarseChannel.RESOLUTION_24BIT; i <= maxResolution; i++) {
          channel.fineChannelAliases.push(`${chKey} fine^${i - 1}`);
        }
      }

      if (channel.dmxValueResolution === `${maxResolution * 8}bit` || channel.dmxValueResolution === ``) {
        delete channel.dmxValueResolution;
      }
    });

    // convert availableChannels array to object and add it to fixture
    if (availableChannels.length > 0) {
      fixture.availableChannels = {};
      availableChannels.forEach(channelWrapper => {
        fixture.availableChannels[channelWrapper.key] = channelWrapper.channel;
      });
    }

    // convert templateChannels array to object and add it to fixture
    if (templateChannels.length > 0) {
      fixture.templateChannels = {};
      templateChannels.forEach(channelWrapper => {
        fixture.templateChannels[channelWrapper.key] = channelWrapper.channel;
      });
    }
  }

  /**
   * @param {Array.<ChannelWrapper>} channelWrappers The OFL availableChannels or templateChannels object.
   * @param {Object} gdtfChannel The GDTF <DMXChannel> XML object.
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
      ch => JSON.stringify(ch.channel) === JSON.stringify(channel) && !ch.modeIndices.includes(modeIndex),
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
     * @returns {String} The channel name.
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
     * @returns {Array.<Object>} Array of OFL capability objects (but with GDTF DMX values).
     */
    function getCapabilities() {
      // save all <ChannelSet> XML nodes in a flat list
      const gdtfCapabilities = [];

      let minPhysicalValue = Number.POSITIVE_INFINITY;
      let maxPhysicalValue = Number.NEGATIVE_INFINITY;

      gdtfChannel.LogicalChannel.forEach(gdtfLogicalChannel => {
        if (!gdtfLogicalChannel.ChannelFunction) {
          throw new Error(`LogicalChannel does not contain any ChannelFunction children in DMXChannel ${JSON.stringify(gdtfChannel, null, 2)}`);
        }

        gdtfLogicalChannel.ChannelFunction.forEach(gdtfChannelFunction => {
          if (!gdtfChannelFunction.ChannelSet) {
            // add an empty <ChannelSet />
            gdtfChannelFunction.ChannelSet = [
              {
                $: {},
              },
            ];
          }

          // save GDTF attribute for later
          gdtfChannelFunction._attribute = followXmlNodeReference(
            gdtfFixture.AttributeDefinitions[0].Attributes[0],
            gdtfChannelFunction.$.Attribute,
          );

          if (!gdtfChannelFunction._attribute) {
            gdtfChannelFunction._attribute = {
              $: {
                Name: `NoFeature`,
              },
            };
          }

          gdtfChannelFunction.ChannelSet.forEach(gdtfChannelSet => {
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

            gdtfChannelSet._dmxFrom = getDmxValueWithResolutionFromGdtfDmxValue(gdtfChannelSet.$.DMXFrom || `0/1`);

            let physicalFrom = Number.parseFloat(gdtfChannelSet.$.PhysicalFrom);
            if (Number.isNaN(physicalFrom)) {
              physicalFrom = 0;
            }
            let physicalTo = Number.parseFloat(gdtfChannelSet.$.PhysicalTo);
            if (Number.isNaN(physicalTo)) {
              physicalTo = 1;
            }

            gdtfChannelSet._physicalFrom = physicalFrom;
            gdtfChannelSet._physicalTo = physicalTo;

            minPhysicalValue = Math.min(minPhysicalValue, physicalFrom, physicalTo);
            maxPhysicalValue = Math.max(maxPhysicalValue, physicalFrom, physicalTo);

            gdtfCapabilities.push(gdtfChannelSet);
          });
        });
      });

      return gdtfCapabilities.map((gdtfCapability, index) => {
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
       * @param {Number} index The index of the capability.
       * @returns {Array.<Number>} The GDTF DMX value for this capability's range end.
       */
      function getDmxRangeEnd(index) {
        const dmxFrom = gdtfCapabilities[index]._dmxFrom;

        if (index === gdtfCapabilities.length - 1) {
          // last capability
          const resolution = dmxFrom[1];
          return [Math.pow(256, resolution) - 1, resolution];
        }

        const [nextDmxFromValue, resolution] = gdtfCapabilities[index + 1]._dmxFrom;
        return [nextDmxFromValue - 1, resolution];
      }

      /**
       * @param {String} attrName The GDTF attribute name.
       * @returns {Object} The capability type data from @file gdtf-attributes.js
       */
      function getCapabilityTypeData(attrName) {
        let capabilityTypeData = gdtfAttributes[attrName];

        if (!capabilityTypeData) {
          const enumeratedAttributeName = attrName.replace(/\d+/, `(n)`).replace(/\d+/, `(m)`);
          capabilityTypeData = gdtfAttributes[enumeratedAttributeName];
        }

        if (!capabilityTypeData) {
          return {
            oflType: `Unknown (${attrName})`, // will trigger an error in the validation
            oflProperty: `physical`, // will also trigger an error, but the information could be useful
          };
        }

        if (!capabilityTypeData.inheritFrom) {
          return capabilityTypeData;
        }

        // save the inherited result for later access
        gdtfAttributes[attrName] = Object.assign(
          {},
          getCapabilityTypeData(capabilityTypeData.inheritFrom),
          capabilityTypeData,
        );
        delete gdtfAttributes[attrName].inheritFrom;

        return gdtfAttributes[attrName];
      }

      /**
       * @param {Function|null} hook The hook function, or a falsy value.
       * @param  {...*} args The arguments to pass to the hook.
       * @returns {*} The return value of the hook, or null if no hook was called.
       */
      function callHook(hook, ...args) {
        if (hook) {
          return hook(...args);
        }

        return null;
      }

      /**
       * @param {Object} capabilityTypeData The capability type data from @file gdtf-attributes.js
       * @param {Object} gdtfCapability The enhanced <ChannelSet> XML object.
       * @returns {String|null} The OFL property name, or null.
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
       * @param {Object} gdtfCapability The enhanced <ChannelSet> XML object.
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
    }

    /**
     * @returns {Number} The resolution of this channel.
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
     * @returns {String} The channel key, derived from the name and made unique.
     */
    function getChannelKey() {
      let key = name;

      // make unique by appending ' 2', ' 3', ... if necessary
      let duplicates = 1;
      const keyExists = () => channelWrappers.some(ch => ch.key === key);
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
        channel.capabilities.forEach(capability => {
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
        });
      }

      if (maxDmxValueResolution !== 0) {
        channel.dmxValueResolution = `${maxDmxValueResolution * 8}bit`;
      }


      /**
       * @returns {Number} The highest DMX value resolution used in this channel, or 0 if no DMX value is used at all.
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
          channel.capabilities.forEach(capability => {
            dmxValues.push(capability.dmxRange[0]);
            dmxValues.push(capability.dmxRange[1]);
          });
        }

        return Math.max(0, ...dmxValues.map(
          ([value, resolution]) => resolution,
        ));
      }
    }
  }

  /**
   * @typedef {Object} DmxBreakWrapper Holds a list of OFL channel keys belonging to consecutive GDTF channels with the same DMXBreak attribute.
   * @property {String|undefined} dmxBreak The DMXBreak attribute of consecutive DMXChannel nodes.
   * @property {String} geometry The Geometry attribute of consecutive DMXChannel nodes.
   * @property {Array.<String>} channels The OFL channel keys in this DMX break.
   */

  /**
   * Add modes and matrix pixel keys (if needed) to the fixture.
   */
  function addModes() {
    // save all matrix pixels that are used in some mode
    const matrixPixels = new Set();

    fixture.modes = gdtfFixture.DMXModes[0].DMXMode.map(gdtfMode => {
      /** @type {Array.<DmxBreakWrapper>} */
      const dmxBreakWrappers = [];

      gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfChannel => {
        if (dmxBreakWrappers.length === 0 || dmxBreakWrappers[dmxBreakWrappers.length - 1].dmxBreak !== gdtfChannel.$.DMXBreak) {
          dmxBreakWrappers.push({
            dmxBreak: gdtfChannel.$.DMXBreak,
            geometry: gdtfChannel.$.Geometry,
            channels: [],
          });
        }

        addChannelKeyToDmxBreakWrapper(gdtfChannel, dmxBreakWrappers);
      });

      const channels = [];

      dmxBreakWrappers.forEach(channelWrapper => {
        if (channelWrapper.dmxBreak !== `Overwrite`) {
          // just append the channels
          channels.push(...channelWrapper.channels);
          return;
        }

        // append a matrix channel insert block

        const geometryReferences = findGeometryReferences(channelWrapper.geometry);
        const usedMatrixPixels = geometryReferences.map(
          (gdtfGeoRef, index) => gdtfGeoRef.$.Name || `${channelWrapper.geometry} ${index + 1}`,
        );

        usedMatrixPixels.forEach(pixelKey => matrixPixels.add(pixelKey));

        channels.push({
          insert: `matrixChannels`,
          repeatFor: usedMatrixPixels,
          channelOrder: `perPixel`,
          templateChannels: channelWrapper.channels.map(
            chKey => `${chKey} $pixelKey`,
          ),
        });
      });

      return {
        name: gdtfMode.$.Name,
        rdmPersonalityIndex: gdtfMode._oflRdmPersonalityIndex,
        channels,
      };
    });

    const matrixPixelList = Array.from(matrixPixels);

    fixture.matrix = {
      pixelKeys: [
        [
          matrixPixelList,
        ],
      ],
    };

    // try to simplify matrix channel insert blocks
    fixture.modes.forEach(mode => {
      mode.channels.forEach(channel => {
        if (typeof channel === `object` && channel.insert === `matrixChannels`
          && JSON.stringify(matrixPixelList) === JSON.stringify(channel.repeatFor)) {
          channel.repeatFor = `eachPixelXYZ`;
        }
      });
    });


    /**
     * Adds the OFL channel key (and fine channel keys) to dmxBreakWrappers'
     * last entry's channels array.
     * @param {Object} gdtfChannel The GDTF channel object.
     * @param {Array.<DmxBreakWrapper>} dmxBreakWrappers The DMXBreak wrapper array.
     */
    function addChannelKeyToDmxBreakWrapper(gdtfChannel, dmxBreakWrappers) {
      const chKey = gdtfChannel._oflChannelKey;
      const oflChannel = fixture.availableChannels[chKey];

      const channels = dmxBreakWrappers[dmxBreakWrappers.length - 1].channels;

      const channelKeys = [chKey].concat(oflChannel.fineChannelAliases);

      // The Offset attribute replaced the Coarse/Fine/Ultra/Uber attributes in GDTF v1.0
      const channelOffsets = xmlNodeHasNotNoneAttribute(gdtfChannel, `Offset`)
        ? gdtfChannel.$.Offset.split(`,`)
        : [
          gdtfChannel.$.Coarse,
          gdtfChannel.$.Fine,
          gdtfChannel.$.Ultra,
          gdtfChannel.$.Uber,
        ];

      channelOffsets.forEach((channelOffset, index) => {
        const dmxChannelNumber = Number.parseInt(channelOffset, 10);

        if (!Number.isNaN(dmxChannelNumber)) {
          channels[dmxChannelNumber - 1] = channelKeys[index];
        }
      });
    }

    /**
     * Find all <GeometryReference> XML nodes with a given Geometry attribute.
     * @param {String} geometryName The name of the geometry reference.
     * @returns {Array.<Object>} An array of all geometry reference XML objects.
     */
    function findGeometryReferences(geometryName) {
      const geometryReferences = [];

      traverseGeometries(gdtfFixture.Geometries[0]);

      return geometryReferences;


      /**
       * Recursively go through the child nodes of a given XML node and add
       * <GeometryReference> nodes with the correct Geometry attribute to the
       * geometryReferences array.
       * @param {Object} xmlNode The XML node object to start traversing at.
       */
      function traverseGeometries(xmlNode) {
        // add all suitable GeometryReference child nodes
        (xmlNode.GeometryReference || []).forEach(gdtfGeoRef => {
          if (gdtfGeoRef.$.Geometry === geometryName) {
            geometryReferences.push(gdtfGeoRef);
          }
        });

        // traverse all other child nodes
        Object.keys(xmlNode).forEach(tagName => {
          if (tagName !== `$` && tagName !== `GeometryReference`) {
            xmlNode[tagName].forEach(childNode => traverseGeometries(childNode));
          }
        });
      }
    }
  }

  /**
   * Adds switchChannels property to all master channels' capabilities and use
   * the switching channel key in modes' channel lists.
   */
  function linkSwitchingChannels() {
    const relationsPerMaster = {};
    const modeChannelReplacements = [];

    // bring relations into a structure we can work with
    switchingChannelRelations.forEach(relation => {
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

      const switchToChannel = fixture.availableChannels[switchToChannelKey];

      if (switchToChannel && `fineChannelAliases` in switchToChannel) {
        switchToChannel.fineChannelAliases.forEach((fineChannelAlias, fineness) => {
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
        });
      }
    });

    // switch channels in trigger channels' capabilities
    Object.keys(relationsPerMaster).forEach(triggerChannelKey => {
      const triggerChannelRelations = simplifySwitchingChannelRelations(triggerChannelKey);

      let triggerChannel;
      if (fixture.availableChannels && triggerChannelKey in fixture.availableChannels) {
        triggerChannel = fixture.availableChannels[triggerChannelKey];
      }
      else if (fixture.templateChannels && `${triggerChannelKey} $pixelKey` in fixture.templateChannels) {
        triggerChannel = fixture.templateChannels[`${triggerChannelKey} $pixelKey`];
      }

      if (triggerChannel.defaultValue === null) {
        triggerChannel.defaultValue = 0;
      }

      const channelResolution = getChannelResolution(triggerChannel);

      triggerChannel.capabilities.forEach(capability => {
        capability.switchChannels = {};

        Object.keys(triggerChannelRelations).forEach(switchingChannelKey => {
          triggerChannelRelations[switchingChannelKey].forEach(relation => {
            const [dmxFrom, dmxTo] = scaleDmxRangeIndividually(...relation.dmxFrom, ...relation.dmxTo, channelResolution);

            if (capability.dmxRange[0] >= dmxFrom && capability.dmxRange[1] <= dmxTo) {
              capability.switchChannels[switchingChannelKey] = relation.switchToChannelKey;
            }
          });
        });
      });
    });

    // replace normal channels with switching channels in modes
    fixture.modes.forEach((mode, modeIndex) => {
      if (!(modeIndex in modeChannelReplacements)) {
        return;
      }

      Object.keys(modeChannelReplacements[modeIndex]).forEach(switchToChannelKey => {
        const channelIndex = mode.channels.indexOf(switchToChannelKey);

        if (channelIndex !== -1) {
          mode.channels[channelIndex] = modeChannelReplacements[modeIndex][switchToChannelKey];
        }
      });
    });


    /**
     * @param {String} triggerChannelKey Key of the trigger channel, whose relations should be simplified.
     * @returns {Object} Simplified switching channel's relations.
     */
    function simplifySwitchingChannelRelations(triggerChannelKey) {
      const simplifiedRelations = {};

      Object.keys(relationsPerMaster[triggerChannelKey]).forEach(switchingChannelKey => {
        const relations = relationsPerMaster[triggerChannelKey][switchingChannelKey];

        // were this switching channel's relations already added?
        const addedSwitchingChannelKey = Object.keys(simplifiedRelations).find(
          otherKey => JSON.stringify(relationsPerMaster[triggerChannelKey][otherKey]) === JSON.stringify(relations),
        );

        if (addedSwitchingChannelKey) {
          // already added switching channel has the same relations, so we don't need to add it
          // but we need to update modeChannelReplacements
          modeChannelReplacements.forEach(mode => {
            Object.keys(mode).forEach(channelKey => {
              if (mode[channelKey] === switchingChannelKey) {
                mode[channelKey] = addedSwitchingChannelKey;
              }
            });
          });
        }
        else {
          // add the new switching channel
          simplifiedRelations[switchingChannelKey] = relations;
        }
      });

      return simplifiedRelations;
    }

    /**
     * @param {CoarseChannel} channel The OFL channel object.
     * @returns {Number} The fineness of the channel.
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
};


/**
 * @param {Object} xmlNode An XML node object.
 * @param {String} attribute The attribute name to check.
 * @returns {Boolean} True if the node has the attribute and its value is not "None", false otherwise.
 */
function xmlNodeHasNotNoneAttribute(xmlNode, attribute) {
  return attribute in xmlNode.$ && xmlNode.$[attribute] !== `None`;
}

/**
 * GDTF date strings are already in ISO format. Before GDTF v1.0, date strings had
 * the form "dd.MM.yyyy HH:mm:ss", so those have to be converted to the ISO format.
 *
 * @see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-date
 * @param {String|undefined} dateStr An ISO date string or a date in the form "dd.MM.yyyy HH:mm:ss"
 * @param {String} fallbackDateStr A fallback date string to return if the parsed date is not valid.
 * @returns {String} A date string in the form "YYYY-MM-DD" (may be the provided fallback date string).
 */
function getIsoDateFromGdtfDate(dateStr, fallbackDateStr) {
  if (!dateStr) {
    return fallbackDateStr;
  }

  const isoDateRegex = /^(\d{4}-\d{2}-\d{2})T/;
  if (dateStr.match(isoDateRegex)) {
    return RegExp.$1;
  }

  const germanDateTimeRegex = /^([0-3]?\d)\.([01]?\d)\.(\d{4})\s+\d?\d:\d?\d:\d?\d$/;
  const match = dateStr.match(germanDateTimeRegex);

  try {
    const [, day, month, year] = match;
    const date = new Date(Date.UTC(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, day));

    return date.toISOString().replace(/T.*/, ``);
  }
  catch {
    return fallbackDateStr;
  }
}

/**
 * @param {String} dmxValueStr GDTF DMX value in the form "128/2", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-DMXValue
 * @returns {[Number, Resolution]} Array containing DMX value and DMX resolution.
 */
function getDmxValueWithResolutionFromGdtfDmxValue(dmxValueStr) {
  try {
    const [, value, resolution] = dmxValueStr.match(/^(\d+)\/(\d)$/);
    return [Number.parseInt(value, 10), Number.parseInt(resolution, 10)];
  }
  catch {
    return [Number.parseInt(dmxValueStr, 10) || 0, 1];
  }
}

/**
 * @param {String} str The string to slugify.
 * @returns {String} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^\da-z-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
