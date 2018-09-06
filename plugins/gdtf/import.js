const xml2js = require(`xml2js`);
const JSZip = require(`jszip`);
const promisify = require(`util`).promisify;

const manufacturers = require(`../../fixtures/manufacturers.json`);
const { Channel } = require(`../../lib/model.js`);
const { scaleDmxValue, scaleDmxRangeIndividually } = require(`../../lib/scale-dmx-values.js`);
const { gdtfAttributes, gdtfUnits } = require(`./gdtf-attributes.js`);
const { followXmlNodeReference } = require(`./gdtf-helpers.js`);

module.exports.name = `GDTF 0.87`;
module.exports.version = `0.1.0`;

/**
 * @param {!Buffer} buffer The imported file.
 * @param {!string} filename The imported file's name.
 * @returns {!Promise.<!object, !Error>} A Promise resolving to an out object
**/
module.exports.import = function importGdtf(buffer, filename) {
  const parser = new xml2js.Parser();

  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`
  };

  const warnings = [];

  let xmlPromise = Promise.resolve(buffer.toString());

  if (filename.endsWith(`.gdtf`)) {
    // unzip the .gdtf (zip) file and check its description.xml file
    xmlPromise = JSZip.loadAsync(buffer).then(zip => {
      const descriptionFile = zip.file(`description.xml`);

      if (descriptionFile === null) {
        throw new Error(`The provided .gdtf (zip) file does not contain a 'description.xml' file in the root directory.`);
      }

      return descriptionFile.async(`string`);
    });
  }

  return xmlPromise
    .then(xmlStr => promisify(parser.parseString)(xmlStr))
    .then(xml => {
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
          name: gdtfFixture.$.Manufacturer
        };
        warnings.push(`Please add manufacturer URL.`);
      }

      fixture.categories = [`Other`]; // TODO: can we find out categories?
      warnings.push(`Please add fixture categories.`);

      const timestamp = new Date().toISOString().replace(/T.*/, ``);
      const revisions = gdtfFixture.Revisions[0].Revision;

      fixture.meta = {
        authors: [`Anonymous`],
        createDate: getIsoDateFromGdtfDate(revisions[0].$.Date) || timestamp,
        lastModifyDate: getIsoDateFromGdtfDate(revisions[revisions.length - 1].$.Date) || timestamp,
        importPlugin: {
          plugin: `gdtf`,
          date: timestamp,
          comment: `GDTF fixture type ID: ${gdtfFixture.$.FixtureTypeID}`
        }
      };
      warnings.push(`Please add yourself as a fixture author.`);

      fixture.comment = gdtfFixture.$.Description;

      warnings.push(`Please add relevant links to the fixture.`);

      addRdmInfo(fixture, manufacturer, gdtfFixture);

      // TODO: import physical data
      fixture.matrix = {};

      addChannels(fixture, gdtfFixture);
      addModes(fixture, gdtfFixture);

      if (`templateChannels` in fixture) {
        warnings.push(`Please fix the visual representation of the matrix.`);
      }
      else {
        delete fixture.matrix;
      }

      return {
        manufacturers: {
          [manKey]: manufacturer
        },
        fixtures: {
          [fixKey]: fixture
        },
        warnings: {
          [fixKey]: warnings
        }
      };
    });


  /**
   * Adds an RDM section to the OFL fixture and manufacturer if applicable.
   * @param {!object} fixture The OFL fixture object.
   * @param {!object} manufacturer The OFL manufacturer object.
   * @param {!object} gdtfFixture The GDTF fixture object.
   */
  function addRdmInfo(fixture, manufacturer, gdtfFixture) {
    if (!(`Protocols` in gdtfFixture) || !(`RDM` in gdtfFixture.Protocols[0])) {
      return;
    }

    const rdmData = gdtfFixture.Protocols[0].RDM[0];

    manufacturer.rdmId = parseInt(rdmData.$.ManufacturerID, 16);
    fixture.rdm = {
      modelId: parseInt(rdmData.$.DeviceModelID, 16),
      softwareVersion: rdmData.$.SoftwareVersionID
    };
  }

  /**
   * @typedef ChannelWrapper
   * @type object
   * @property {!string} key The channel key.
   * @property {!object} channel The OFL channel object.
   * @property {!number} maxResolution The highest used resolution of this channel.
   */

  /**
   * Add availableChannels and templateChannels to the fixture.
   * @param {!object} fixture The OFL fixture object.
   * @param {!object} gdtfFixture The GDTF fixture object.
   */
  function addChannels(fixture, gdtfFixture) {
    const availableChannels = [];
    const templateChannels = [];

    gdtfFixture.DMXModes[0].DMXMode.forEach(gdtfMode => {
      gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfChannel => {
        if (gdtfChannel.$.DMXBreak === `Overwrite`) {
          addChannel(templateChannels, gdtfChannel, gdtfFixture);
        }
        else {
          addChannel(availableChannels, gdtfChannel, gdtfFixture);
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

      if (maxResolution === 1) {
        delete channel.fineChannelAliases;
      }
      else {
        channel.fineChannelAliases.push(`${chKey} fine`);

        for (let i = 2; i < maxResolution; i++) {
          channel.fineChannelAliases.push(`${chKey} fine^${i}`);
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
   * @param {!array.<!ChannelWrapper>} channelWrappers The OFL availableChannels or templateChannels object.
   * @param {!object} gdtfChannel The GDTF channel object.
   * @param {!object} gdtfFixture The GDTF fixture object.
   */
  function addChannel(channelWrappers, gdtfChannel, gdtfFixture) {
    const name = getChannelName();

    if (gdtfChannel.LogicalChannel.length > 1) {
      warnings.push(`DMXChannel '${name}' has more than one LogicalChannel. This is not supported yet and could lead to undesired results.`);
    }

    const channel = {
      name: name,
      fineChannelAliases: [],
      dmxValueResolution: ``
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

    // check if we already added the same channel
    const sameChannel = channelWrappers.find(
      ch => JSON.stringify(ch.channel) === JSON.stringify(channel)
    );
    if (sameChannel) {
      gdtfChannel._oflChannelKey = sameChannel.key;

      sameChannel.maxResolution = Math.max(sameChannel.maxResolution, getChannelResolution());
      return;
    }

    const channelKey = getChannelKey();

    gdtfChannel._oflChannelKey = channelKey;
    channelWrappers.push({
      key: channelKey,
      channel: channel,
      maxResolution: getChannelResolution()
    });


    /**
     * @returns {!string} The channel name.
     */
    function getChannelName() {
      const channelAttribute = gdtfChannel.LogicalChannel[0].$.Attribute;

      try {
        return gdtfFixture.AttributeDefinitions[0].Attributes[0].Attribute.find(
          attribute => attribute.$.Name === channelAttribute
        ).$.Pretty || channelAttribute;
      }
      catch (error) {
        return channelAttribute;
      }
    }

    /**
     * @returns {!array.<!object>} Array of OFL capability objects (but with GDTF DMX values).
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
                $: {
                }
              }
            ];
          }

          // save GDTF attribute for later
          gdtfChannelFunction._attribute = followXmlNodeReference(
            gdtfFixture.AttributeDefinitions[0].Attributes[0],
            gdtfChannelFunction.$.Attribute
          );

          if (!gdtfChannelFunction._attribute) {
            gdtfChannelFunction._attribute = {
              $: {
                Name: `NoFeature`
              }
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

            let physicalFrom = parseFloat(gdtfChannelSet.$.PhysicalFrom);
            if (isNaN(physicalFrom)) {
              physicalFrom = 0;
            }
            let physicalTo = parseFloat(gdtfChannelSet.$.PhysicalTo);
            if (isNaN(physicalTo)) {
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
          dmxRange: [gdtfCapability._dmxFrom, getDmxRangeEnd(index)]
        };

        const capabilityTypeData = getCapabilityTypeData(gdtfCapability);

        capability.type = capabilityTypeData.oflType;

        callHook(capabilityTypeData.beforePhysicalPropertyHook, capability, gdtfCapability);

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

        callHook(capabilityTypeData.afterPhysicalPropertyHook, capability, gdtfCapability);

        if (gdtfCapability.$.Name) {
          capability.comment = gdtfCapability.$.Name;
        }

        return capability;
      });


      /**
       * @param {!number} index The index of the capability.
       * @returns {!array.<!number>} The GDTF DMX value for this capability's range end.
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
       * @param {!object} gdtfCapability The enhanced <ChannelSet> XML object.
       * @returns {!object} The capability type data from @file gdtf-attributes.js
       */
      function getCapabilityTypeData(gdtfCapability) {
        const gdtfAttribute = gdtfCapability._channelFunction._attribute;
        const attrName = gdtfAttribute.$.Name;

        const capabilityTypeData = gdtfAttributes[attrName];

        if (!capabilityTypeData) {
          return {
            oflType: `Unknown`, // will trigger an error in the validation
            oflProperty: null
          };
        }

        if (!capabilityTypeData.inheritFrom) {
          return capabilityTypeData;
        }

        // save the inherited result for later access
        gdtfAttributes[attrName] = Object.assign(
          {},
          gdtfAttributes[capabilityTypeData.inheritFrom],
          capabilityTypeData
        );
        delete gdtfAttributes[attrName].inheritFrom;

        return gdtfAttributes[attrName];
      }

      /**
       * @param {?function} hook The hook function, or a falsy value.
       * @param  {...any} args The arguments to pass to the hook.
       * @returns {any} The return value of the hook, or null no hook was called.
       */
      function callHook(hook, ...args) {
        if (hook) {
          return hook(...args);
        }

        return null;
      }

      /**
       * @param {!object} capabilityTypeData The capability type data from @file gdtf-attributes.js
       * @param {!object} gdtfCapability The enhanced <ChannelSet> XML object.
       * @returns {?string} The OFL property name, or null.
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
       * @param {!object} gdtfCapability The enhanced <ChannelSet> XML object.
       * @returns {!function} The function to turn a physical value into an entity string with the correct unit.
       */
      function getPhysicalUnit(gdtfCapability) {
        const gdtfAttribute = gdtfCapability._channelFunction._attribute;
        const capabilityTypeData = getCapabilityTypeData(gdtfCapability);

        let physicalEntity = gdtfAttribute.$.PhysicalUnit;

        if (!physicalEntity) {
          if (minPhysicalValue === 0 && maxPhysicalValue === 1) {
            physicalEntity = `Percent`;
          }
          else if (capabilityTypeData) {
            physicalEntity = capabilityTypeData.defaultPhysicalEntity || `None`;
          }
          else {
            physicalEntity = `None`;
          }
        }

        return gdtfUnits[physicalEntity];
      }
    }

    /**
     * @returns {!number} The resolution of this channel.
     */
    function getChannelResolution() {
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
     * @returns {!string} The channel key, derived from the name and made unique.
     */
    function getChannelKey() {
      let key = name;

      // make unique by appending ' 2', ' 3', ... if necessary
      let duplicates = 1;
      const hasChannelKey = ch => ch.key === key;
      while (channelWrappers.some(hasChannelKey)) {
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
      const scaleToResolution = Math.max(Channel.RESOLUTION_8BIT, maxDmxValueResolution);

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

          capability.dmxRange = scaleDmxRangeIndividually(startValue, startResolution, endValue, endResolution, scaleToResolution);
        });
      }

      if (maxDmxValueResolution !== 0) {
        channel.dmxValueResolution = `${maxDmxValueResolution * 8}bit`;
      }


      /**
       * @returns {!number} The highest DMX value resolution used in this channel, or 0 if no DMX value is used at all.
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
          ([value, resolution]) => resolution
        ));
      }
    }
  }

  /**
   * @typedef DmxBreakWrapper
   * @description Holds a list of OFL channel keys belonging to consecutive GDTF channels with the same DMXBreak attribute.
   * @type object
   * @property {!string|undefined} dmxBreak The DMXBreak attribute of consecutive DMXChannel nodes.
   * @property {!string} geometry The Geometry attribute of consecutive DMXChannel nodes.
   * @property {!array.<!string>} channels The OFL channel keys in this DMX break.
   */

  /**
   * Add modes and matrix pixel keys (if needed) to the fixture.
   * @param {!object} fixture The OFL fixture object.
   * @param {!object} gdtfFixture The GDTF fixture object.
   */
  function addModes(fixture, gdtfFixture) {
    // save all matrix pixels that are used in some mode
    const matrixPixels = new Set();

    fixture.modes = gdtfFixture.DMXModes[0].DMXMode.map(gdtfMode => {
      /** @type array.<!DmxBreakWrapper> */
      const dmxBreakWrappers = [];

      gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfChannel => {
        if (dmxBreakWrappers.length === 0 || dmxBreakWrappers[dmxBreakWrappers.length - 1].dmxBreak !== gdtfChannel.$.DMXBreak) {
          dmxBreakWrappers.push({
            dmxBreak: gdtfChannel.$.DMXBreak,
            geometry: gdtfChannel.$.Geometry,
            channels: []
          });
        }

        addChannelKeyToDmxBreakWrapper(gdtfChannel, dmxBreakWrappers);
      });

      // TODO: also look through gdtfMode's Relations to find switching channels
      // see https://gdtf-share.com/wiki/Relations#Mode_Dependency

      return {
        name: gdtfMode.$.Name,
        channels: [].concat(...dmxBreakWrappers.map(channelWrapper => {
          if (channelWrapper.dmxBreak !== `Overwrite`) {
            // just append the channels
            return channelWrapper.channels;
          }

          // append a matrix channel insert block

          const geometryReferences = findGeometryReferences(channelWrapper.geometry);
          const usedMatrixPixels = geometryReferences.map(
            (gdtfGeoRef, index) => gdtfGeoRef.$.Name || `${channelWrapper.geometry} ${index + 1}`
          );

          usedMatrixPixels.forEach(pixelKey => matrixPixels.add(pixelKey));

          return {
            insert: `matrixChannels`,
            repeatFor: usedMatrixPixels,
            channelOrder: `perPixel`,
            templateChannels: channelWrapper.channels.map(
              chKey => `${chKey} $pixelKey`
            )
          };
        }))
      };
    });

    const matrixPixelList = [...matrixPixels];

    fixture.matrix = {
      pixelKeys: [
        [
          matrixPixelList
        ]
      ]
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
     * Adds the OFL channel key to dmxBreakWrappers' last entry's channels array.
     * @param {!object} gdtfChannel The GDTF channel object.
     * @param {!array.<!DmxBreakWrapper>} dmxBreakWrappers The DMXBreak wrapper array.
     */
    function addChannelKeyToDmxBreakWrapper(gdtfChannel, dmxBreakWrappers) {
      const chKey = gdtfChannel._oflChannelKey;
      const oflChannel = fixture.availableChannels[chKey];

      const channels = dmxBreakWrappers[dmxBreakWrappers.length - 1].channels;

      channels[parseInt(gdtfChannel.$.Coarse) - 1] = chKey;

      if (xmlNodeHasNotNoneAttribute(gdtfChannel, `Fine`)) {
        channels[parseInt(gdtfChannel.$.Fine) - 1] = oflChannel.fineChannelAliases[0];
      }

      if (xmlNodeHasNotNoneAttribute(gdtfChannel, `Ultra`)) {
        channels[parseInt(gdtfChannel.$.Ultra) - 1] = oflChannel.fineChannelAliases[1];
      }

      if (xmlNodeHasNotNoneAttribute(gdtfChannel, `Uber`)) {
        channels[parseInt(gdtfChannel.$.Uber) - 1] = oflChannel.fineChannelAliases[2];
      }
    }

    /**
     * Find all <GeometryReference> XML nodes with a given Geometry attribute.
     * @param {!string} geometryName The name of the geometry reference.
     * @returns {!array.<!object>} An array of all geometry reference XML objects.
     */
    function findGeometryReferences(geometryName) {
      const geometryReferences = [];

      traverseGeometries(gdtfFixture.Geometries[0]);

      return geometryReferences;


      /**
       * Recursively go through the child nodes of a given XML node and add
       * <GeometryReference> nodes with the correct Geometry attribute to the
       * geometryReferences array.
       * @param {!object} xmlNode The XML node object to start traversing at.
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
};


/**
 * @param {!object} xmlNode An XML node object.
 * @param {!string} attribute The attribute name to check.
 * @returns {!boolean} True if the node has the attribute and its value is not "None", false otherwise.
 */
function xmlNodeHasNotNoneAttribute(xmlNode, attribute) {
  return attribute in xmlNode.$ && xmlNode.$[attribute] !== `None`;
}

/**
 * @param {!string} dateStr A date string in the form "dd.MM.yyyy HH:mm:ss", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-date
 * @returns {?string} A date string in the form "YYYY-MM-DD", or null if the string could not be parsed.
 */
function getIsoDateFromGdtfDate(dateStr) {
  const timeRegex = /^([0-3]?\d)\.([01]?\d)\.(\d{4})\s+\d?\d:\d?\d:\d?\d$/;
  const match = dateStr.match(timeRegex);

  try {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, day);

    return date.toISOString().replace(/T.*/, ``);
  }
  catch (error) {
    return null;
  }
}

/**
 * @param {!string} dmxValueStr GDTF DMX value in the form "128/2", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-DMXValue
 * @returns {!array.<!number>} Array containing DMX value and DMX resolution.
 */
function getDmxValueWithResolutionFromGdtfDmxValue(dmxValueStr) {
  try {
    const [, value, resolution] = dmxValueStr.match(/^(\d+)\/(\d)$/);
    return [parseInt(value), parseInt(resolution)];
  }
  catch (error) {
    return [parseInt(dmxValueStr), 1];
  }
}

/**
 * @param {!string} str The string to slugify.
 * @returns {!string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
