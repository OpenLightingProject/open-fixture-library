const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  CoarseChannel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannel,
  MatrixChannelReference,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../../lib/model.js`);
/* eslint-enable no-unused-vars */

module.exports.name = `DMXControl 3 (DDF3)`;
module.exports.version = `0.1.0`;

/**
 * @param {array.<Fixture>} fixtures The fixtures to convert into DMXControl device definitions
 * @param {options} options Some global options
 * @returns {Promise.<array.<object>, Error>} The generated files
 */
module.exports.export = async function exportDMXControl3(fixtures, options) {
  const deviceDefinitions = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      const xml = xmlbuilder.begin()
        .declaration(`1.0`, `utf-8`)
        .element({
          device: {
            '@type': `DMXDevice`,
            '@dmxaddresscount': mode.channelKeys.length,
            '@dmxcversion': 3,
            '@ddfversion': fixture.meta.lastModifyDate.toISOString().split(`T`)[0]
          }
        });

      addInformation(xml, mode);
      addFunctions(xml, mode);
      addProcedures(xml, mode);

      deviceDefinitions.push({
        name: sanitize(`${fixture.manufacturer.key}-${fixture.key}-${(mode.shortName)}.xml`).replace(/\s+/g, `-`),
        content: xml.end({
          pretty: true,
          indent: `  `
        }),
        mimetype: `application/xml`,
        fixtures: [fixture],
        mode: mode.shortName
      });
    }
  }

  return deviceDefinitions;
};

/**
 * Adds the information block to the specified XML file.
 * @param {XMLDocument} xml The device definition to add the information to
 * @param {Mode} mode The definition's mode
 */
function addInformation(xml, mode) {
  const xmlInfo = xml.element(`information`);
  xmlInfo.element(`model`).text(mode.fixture.name);
  xmlInfo.element(`vendor`).text(mode.fixture.manufacturer.name);
  xmlInfo.element(`author`).text(mode.fixture.meta.authors.join(`, `));
  xmlInfo.element(`mode`).text(mode.name);

  if (mode.fixture.hasComment) {
    xmlInfo.element(`comment`).text(mode.fixture.comment);
  }
}

/**
 * @typedef {Map.<(string|null), Array.<CoarseChannel>>} ChannelsPerPixel
 */

/**
 * Adds the DMX channels as functions to the specified XML file.
 * @param {XMLDocument} xml The device definition to add the functions to.
 * @param {Mode} mode The definition's mode.
 */
function addFunctions(xml, mode) {
  const channelsPerPixel = getChannelsPerPixel();

  for (const [pixelKey, pixelChannels] of channelsPerPixel) {
    if (pixelKey !== null && pixelChannels.length === 0) {
      continue;
    }

    const xmlFunctionsContainer = xml.element(`functions`);

    if (pixelKey === null && mode.fixture.categories.includes(`Matrix`)) {
      addMatrix(xmlFunctionsContainer, mode, channelsPerPixel);
    }

    if (pixelKey !== null) {
      xmlFunctionsContainer.comment(pixelKey);
    }

    let xmlFunctions = [];
    pixelChannels.forEach(ch => (xmlFunctions = xmlFunctions.concat(getXmlFunctionsFromChannel(ch))));

    // TODO: group xmlFunctions (e.g. rgb, position, goboindex into gobowheel, etc.)

    xmlFunctions.forEach(xmlFunction => xmlFunctionsContainer.importDocument(xmlFunction));
  }

  /**
   * @returns {ChannelsPerPixel} Each pixel key pointing to its unwrapped matrix channels. null points to all non-matrix channels.
   */
  function getChannelsPerPixel() {
    const channelsPerPixel = new Map();

    channelsPerPixel.set(null, []);

    const matrix = mode.fixture.matrix;
    if (matrix !== null) {
      const pixelKeys = matrix.pixelGroupKeys.concat(matrix.getPixelKeysByOrder(`X`, `Y`, `Z`));
      pixelKeys.forEach(key => channelsPerPixel.set(key, []));
    }

    const channels = mode.channels.map(
      ch => (ch instanceof SwitchingChannel ? ch.defaultChannel : ch)
    ).filter(
      ch => !(ch instanceof FineChannel || ch instanceof NullChannel)
    );
    for (const channel of channels) {
      channelsPerPixel.get(channel.pixelKey).push(channel);
    }

    return channelsPerPixel;
  }

  /**
   * @param {CoarseChannel} channel The channel that should be represented as one or more DMXControl functions.
   * @returns {array.<XMLElement>} Functions created by this channel. They are not automatically grouped together.
   */
  function getXmlFunctionsFromChannel(channel) {
    const functionToCapabilities = {};

    for (const cap of channel.capabilities) {
      const properFunction = Object.keys(functions).find(
        key => functions[key].isCapSuitable(cap)
      );

      if (properFunction) {
        if (!Object.keys(functionToCapabilities).includes(properFunction)) {
          functionToCapabilities[properFunction] = [];
        }
        functionToCapabilities[properFunction].push(cap);
      }
    }

    let xmlFunctions = [];
    Object.keys(functionToCapabilities).forEach(functionKey => {
      const caps = functionToCapabilities[functionKey];
      xmlFunctions = xmlFunctions.concat(functions[functionKey].create(channel, caps));
    });
    xmlFunctions.forEach(xmlFunc => addChannelAttributes(xmlFunc, mode, channel));

    return xmlFunctions;
  }
}

/**
 * Adds the Maintenance capabilities as procedures to the specified XML file.
 * @param {XMLDocument} xml The device definition to add the functions to.
 * @param {Mode} mode The definition's mode.
 */
function addProcedures(xml, mode) {
  const maintenanceChannels = mode.channels.filter(
    channel => channel.type === `Maintenance`
  );

  if (maintenanceChannels.length === 0) {
    return;
  }

  const xmlProcedures = xml.element(`procedures`);

  maintenanceChannels.forEach(channel => {
    const channelIndex = mode.getChannelIndex(channel);

    channel.capabilities.filter(
      capability => capability.type === `Maintenance` && capability.isStep
    ).forEach(capability => {
      const xmlProcedure = xmlProcedures.element(`procedure`, {
        name: capability.comment
      });

      xmlProcedure.element(`set`, {
        dmxchannel: channelIndex,
        value: capability.dmxRange.start
      });

      if (capability.hold) {
        xmlProcedure.element(`hold`, {
          value: capability.hold.getBaseUnitEntity().number * 1000
        });

        xmlProcedure.element(`restore`, {
          dmxchannel: channelIndex
        });
      }
    });
  });
}

const functions = {
  dimmer: {
    isCapSuitable: cap => cap.type === `Intensity`,
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`dimmer`);

      if (channel.capabilities.length > 1 || caps[0].brightness[0].number !== 0) {
        const normalizedCaps = getNormalizedCapabilities(caps, `brightness`, 100, `%`);
        normalizedCaps.forEach(cap => {
          const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
          xmlCap.attribute(`type`, `linear`);
          xmlDimmer.importDocument(xmlCap);
        });
      }

      return xmlDimmer;
    }
  },
  shutter: {
    isCapSuitable: cap => cap.type === `ShutterStrobe` && [`Open`, `Closed`].includes(cap.shutterEffect),
    create: (channel, caps) => {
      const xmlShutter = xmlbuilder.create(`shutter`);

      caps.forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap);
        xmlCap.attribute(`type`, cap.shutterEffect.toLowerCase());
        xmlShutter.importDocument(xmlCap);
      });

      return xmlShutter;
    }
  },
  strobe: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  strobeDuration: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  pan: {
    isCapSuitable: cap => cap.type === `Pan`,
    create: (channel, caps) => {
      const xmlPan = xmlbuilder.create(`pan`);

      caps.forEach(cap => {
        xmlPan.element(`range`, {
          range: cap.angle[1].number - cap.angle[0].number
        });
      });

      return xmlPan;
    }
  },
  tilt: {
    isCapSuitable: cap => [`Pan`, `Tilt`].includes(cap.type),
    create: (channel, caps) => {
      const xmlTilt = xmlbuilder.create(`tilt`);

      caps.forEach(cap => {
        xmlTilt.element(`range`, {
          range: cap.angle[1].number - cap.angle[0].number
        });
      });

      return xmlTilt;
    }
  },
  panTiltSpeed: {
    isCapSuitable: cap => cap.type === `PanTiltSpeed`,
    create: (channel, caps) => {
      const xmlPanTiltSpeed = xmlbuilder.create(`ptspeed`);

      const speedCaps = getNormalizedCapabilities(
        caps.filter(cap => cap.speed !== null), `speed`, 100, `%`
      );
      const durationCaps = getNormalizedCapabilities(
        caps.filter(cap => cap.duration !== null), `duration`, 100, `%`
      );

      speedCaps.forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
        xmlCap.attribute(`type`, `linear`);
        xmlPanTiltSpeed.importDocument(xmlCap);
      });

      durationCaps.forEach(cap => {
        // 100% duration means low speed, so we need to invert this
        const xmlCap = getBaseXmlCapability(cap.capObject, 100 - cap.startValue, 100 - cap.endValue);
        xmlCap.attribute(`type`, `linear`);
        xmlPanTiltSpeed.importDocument(xmlCap);
      });

      return xmlPanTiltSpeed;
    }
  },
  color: {
    isCapSuitable: cap => cap.type === `ColorIntensity`,
    create: (channel, caps) => {
      const capsPerColor = {};

      for (const cap of caps) {
        if (!(cap.color in capsPerColor)) {
          capsPerColor[cap.color] = [];
        }
        capsPerColor[cap.color].push(cap);
      }

      return Object.keys(capsPerColor).map(color => {
        const colorCaps = capsPerColor[color];
        const xmlColor = xmlbuilder.create(color.toLowerCase());

        if (channel.capabilities.length > 1 || colorCaps[0].brightness[0].number !== 0) {
          const normalizedCaps = getNormalizedCapabilities(colorCaps, `brightness`, 100, `%`);
          normalizedCaps.forEach(cap => {
            const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
            xmlCap.attribute(`type`, `linear`);
            xmlColor.importDocument(xmlCap);
          });
        }

        return xmlColor;
      });
    }
  },
  colorWheel: {
    isCapSuitable: cap => cap.type === `ColorWheelIndex` || cap.type === `ColorPreset` || (cap.type === `ColorWheelRotation` && cap.speed),
    create: (channel, caps) => {
      const xmlColorWheel = xmlbuilder.create(`colorwheel`);

      // RGB value for dummy colors. Will be decreased by 1 every time a dummy color is created.
      let greyValue = 0x99;

      const presetCaps = caps.filter(cap => cap.type === `ColorWheelIndex` || cap.type === `ColorPreset`);

      // split proportional caps so we only have stepped caps
      for (let i = 0; i < presetCaps.length; i++) {
        const cap = presetCaps[i];

        if (!cap.isStep) {
          const [startCap, endCap] = getSplittedCapabilities(cap);

          presetCaps[i] = startCap;
          presetCaps.splice(i + 1, 0, endCap); // insert at index i + 1
        }
      }

      // merge adjacent stepped caps
      for (let i = 0; i < presetCaps.length; i++) {
        const cap = presetCaps[i];

        if (i + 1 < presetCaps.length) {
          const nextCap = presetCaps[i + 1];
          const mergedCapability = getMergedCapability(cap, nextCap);

          if (mergedCapability) {
            presetCaps.splice(i, 2, mergedCapability);
            i--; // maybe the merged capability can be merged another time
          }
        }
      }

      presetCaps.forEach(cap => {
        xmlColorWheel.element(`step`, {
          type: `color`,
          val: getColor(cap),
          mindmx: cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT).start,
          maxdmx: cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT).end,
          caption: cap.name
        });
      });


      const rotationCaps = getNormalizedCapabilities(
        caps.filter(cap => cap.type === `ColorWheelRotation`), `speed`, 15, `Hz`
      );
      if (rotationCaps.length > 0) {
        const xmlWheelRotation = xmlColorWheel.element(`wheelrotation`);

        rotationCaps.forEach(cap => {
          if (cap.startValue === 0 && cap.endValue === 0) {
            const xmlCap = getBaseXmlCapability(cap.capObject);
            xmlCap.attribute(`type`, `stop`);
            xmlWheelRotation.importDocument(xmlCap);
          }
          else if (cap.startValue > 0) {
            const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
            xmlCap.attribute(`type`, `cw`);
            xmlWheelRotation.importDocument(xmlCap);
          }
          else {
            const xmlCap = getBaseXmlCapability(cap.capObject, Math.abs(cap.startValue), Math.abs(cap.endValue));
            xmlCap.attribute(`type`, `ccw`);
            xmlWheelRotation.importDocument(xmlCap);
          }
        });
      }

      return xmlColorWheel;

      /**
       * @param {Capability} cap A capability with different start/end values.
       * @returns {array.<Capability>} One capability representing the start value and one representing the end value.
       */
      function getSplittedCapabilities(cap) {
        const startCapJson = {
          dmxRange: [cap.rawDmxRange.start, cap.rawDmxRange.start],
          type: cap.type,
          _splitted: true
        };
        const endCapJson = {
          dmxRange: [cap.rawDmxRange.end, cap.rawDmxRange.end],
          type: cap.type,
          _splitted: true
        };

        if (cap.index) {
          startCapJson.index = cap.index[0].number;
          endCapJson.index = cap.index[1].number;
        }
        if (cap.comment) {
          startCapJson.comment = cap.comment;
          endCapJson.comment = cap.comment;
        }
        if (cap.colors) {
          startCapJson.colors = cap.colors.startColors;
          endCapJson.colors = cap.colors.endColors;
        }
        if (cap.colorTemperature) {
          startCapJson.colorTemperature = cap.colorTemperature[0].toString();
          endCapJson.colorTemperature = cap.colorTemperature[1].toString();
        }

        return [
          new Capability(startCapJson, cap._resolution, cap._channel),
          new Capability(endCapJson, cap._resolution, cap._channel)
        ];
      }

      /**
       * @param {Capability} cap1 A capability.
       * @param {Capability} cap2 Another capability.
       * @returns {Capability|null} A capability that combines the values of both given capabilities. Null if merging was not possible.
       */
      function getMergedCapability(cap1, cap2) {
        if (!cap1.rawDmxRange.isAdjacentTo(cap2.rawDmxRange)) {
          return null;
        }

        const dmxRange = cap1.rawDmxRange.getRangeMergedWith(cap2.rawDmxRange);
        const capJson = {
          dmxRange: [dmxRange.start, dmxRange.end],
          type: cap1.type
        };

        const differentIndex = cap1.jsonObject.index !== cap2.jsonObject.index && !(cap1.jsonObject._splitted && cap2.jsonObject.index === 0);
        const differentColors = !arraysEqual(cap1.jsonObject.colors, cap2.jsonObject.colors);
        const differentColorTemperatures = cap1.jsonObject.colorTemperature !== cap2.jsonObject.colorTemperature;
        const isGenericColor = !cap1.index && !cap1.colors && !cap1.colorTemperature;
        if (differentIndex || differentColors || differentColorTemperatures || isGenericColor) {
          return null;
        }

        if (cap1.index) {
          capJson.index = cap1.jsonObject.index;
        }

        if (cap1.hasComment && !cap1.jsonObject._splitted) {
          capJson.comment = cap1.comment;
        }
        else if (cap2.hasComment) {
          capJson.comment = cap2.comment;
        }

        if (cap1.colors) {
          capJson.colors = cap1.jsonObject.colors;
        }

        if (cap1.jsonObject.colorTemperature) {
          capJson.colorTemperature = cap1.jsonObject.colorTemperature;
        }

        return new Capability(capJson, cap1._resolution, cap1._channel);
      }

      /**
       * @param {Capability} cap A capability.
       * @returns {string} A color from the given capability's color data if there's only one color. A generic (and probably unique) grey color instead.
       */
      function getColor(cap) {
        if (cap.colors && cap.colors.allColors.length === 1) {
          return cap.colors.allColors[0];
        }

        const hex = (greyValue--).toString(16);
        return `#${hex}${hex}${hex}`;
      }
    }
  },
  colorTemperature: {
    isCapSuitable: cap => cap.type === `ColorTemperature`,
    create: (channel, caps) => {
      const xmlColorTemp = xmlbuilder.create(`colortemp`);

      const kelvinCaps = getNormalizedCapabilities(caps.filter(
        cap => cap.colorTemperature[0].unit === `K`
      ), `colorTemperature`, 8000, `K`);

      // map -100…100% (warm…cold) to 2500…8000K
      const percentCaps = getNormalizedCapabilities(caps.filter(
        cap => cap.colorTemperature[0].unit === `%`
      ), `colorTemperature`, (8000 - 2500) / 2, `K`);
      percentCaps.forEach(cap => {
        cap.startValue += ((8000 - 2500) / 2) + 2500;
        cap.endValue += ((8000 - 2500) / 2) + 2500;
      });

      kelvinCaps.concat(percentCaps).forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
        xmlCap.attribute(`type`, `linear`);
        xmlColorTemp.importDocument(xmlCap);
      });

      return xmlColorTemp;
    }
  },
  goboWheel: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboIndex: { // stencil rotation angle
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboRotation: { // stencil rotation speed
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  goboShake: {
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  focus: {
    isCapSuitable: cap => cap.type === `Focus`,
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`focus`);

      const normalizedCaps = getNormalizedCapabilities(caps, `distance`, 100, `%`);
      normalizedCaps.forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
        xmlCap.attribute(`type`, `linear`);
        xmlDimmer.importDocument(xmlCap);
      });

      return xmlDimmer;
    }
  },
  frost: {
    isCapSuitable: cap => cap.type === `Frost`,
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`frost`);

      const normalizedCaps = getNormalizedCapabilities(caps, `frostIntensity`, 100, `%`);
      normalizedCaps.forEach(cap => {
        if (cap.startValue === 0 && cap.endValue === 0) {
          const xmlCap = getBaseXmlCapability(cap.capObject);
          xmlCap.attribute(`type`, `open`);
          xmlDimmer.importDocument(xmlCap);
        }
        else {
          const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
          xmlCap.attribute(`type`, `linear`);
          xmlDimmer.importDocument(xmlCap);
        }
      });

      return xmlDimmer;
    }
  },
  iris: {
    isCapSuitable: cap => cap.type === `Iris`,
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`iris`);

      const normalizedCaps = getNormalizedCapabilities(caps, `openPercent`, 100, `%`);
      normalizedCaps.forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
        xmlCap.attribute(`type`, `linear`);
        xmlDimmer.importDocument(xmlCap);
      });

      return xmlDimmer;
    }
  },
  zoom: {
    isCapSuitable: cap => cap.type === `Zoom`,
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`zoom`);

      const normalizedCaps = getNormalizedCapabilities(caps, `angle`, 90, `deg`);
      normalizedCaps.forEach(cap => {
        const xmlCap = getBaseXmlCapability(cap.capObject, cap.startValue, cap.endValue);
        xmlCap.attribute(`type`, `linear`);
        xmlDimmer.importDocument(xmlCap);
      });

      return xmlDimmer;
    }
  },
  prism: {
    isCapSuitable: cap => cap.type === `Prism` || (cap.type === `NoFunction` && cap._channel.type === `Prism`),
    create: (channel, caps) => {
      const xmlDimmer = xmlbuilder.create(`prism`);

      const hasRotationAngleCaps = caps.some(cap => cap.angle !== null);
      const hasRotationSpeedCaps = caps.some(cap => cap.speed !== null);

      if (hasRotationAngleCaps) {
        xmlDimmer.element(`prismindex`);
      }

      if (hasRotationSpeedCaps) {
        xmlDimmer.element(`prismrotation`);
      }


      // group capabilities by comment
      const capsGroupedByComment = [];
      caps.forEach(cap => {
        const length = capsGroupedByComment.length;
        const lastGroup = length === 0 ? null : capsGroupedByComment[length - 1];

        if (length === 0 || lastGroup[0].comment !== cap.comment) {
          // push new group
          capsGroupedByComment.push([cap]);
        }
        else {
          // push to last group
          lastGroup.push(cap);
        }
      });

      capsGroupedByComment.forEach(commentGroup => {
        const firstCap = commentGroup[0];
        const lastCap = commentGroup[commentGroup.length - 1];

        const xmlStep = xmlDimmer.element(`step`, {
          type: firstCap.type === `NoFunction` ? `open` : `prism`,
          mindmx: firstCap.dmxRange.start,
          maxdmx: lastCap.dmxRange.end,
          caption: firstCap.name
        });

        // add ranges for capabilities without rotation speed
        commentGroup.filter(cap => cap.angle !== null).forEach(cap => {
          const xmlRange = getBaseXmlCapability(cap, cap.angle[0].number, cap.angle[1].number);
          xmlRange.attribute(`range`, cap.angle[1].number - cap.angle[0].number);
          xmlRange.attribute(`handler`, `prismindex`);
          xmlStep.importDocument(xmlRange);
        });

        // add ranges/steps for normalized rotation speed capabilities
        const rotationSpeedCaps = commentGroup.filter(cap => cap.speed !== null);
        getNormalizedCapabilities(rotationSpeedCaps, `speed`, 5, `Hz`).forEach(cap => {
          if (cap.startValue === 0 && cap.endValue === 0) {
            xmlStep.element(`step`, {
              mindmx: cap.capObject.dmxRange.start,
              maxdmx: cap.capObject.dmxRange.end,
              type: `stop`,
              handler: `prismrotation`
            });
          }
          else {
            const xmlRange = getBaseXmlCapability(cap.capObject, Math.abs(cap.startValue), Math.abs(cap.endValue));
            xmlRange.attribute(`type`, cap.startValue > 0 ? `cw` : `ccw`);
            xmlRange.attribute(`handler`, `prismrotation`);
            xmlStep.importDocument(xmlRange);
          }
        });
      });


      return xmlDimmer;
    }
  },
  prismIndex: { // rotation angle
    isCapSuitable: cap => cap.type === `PrismRotation` && cap.angle !== null,
    create: (channel, caps) => {
      const xmlPrismIndex = xmlbuilder.create(`prismindex`);

      const rangeMin = Math.min(...caps.map(cap => Math.min(cap.angle[0].number, cap.angle[1].number)));
      const rangeMax = Math.max(...caps.map(cap => Math.max(cap.angle[0].number, cap.angle[1].number)));

      const firstCap = caps[0];
      const lastCap = caps[caps.length - 1];

      if (firstCap.angle[0].number < lastCap.angle[1].number) {
        xmlPrismIndex.element(`range`, {
          range: rangeMax - rangeMin,
          mindmx: firstCap.dmxRange.start,
          maxdmx: lastCap.dmxRange.end,
          minval: firstCap.angle[0].number,
          maxval: lastCap.angle[1].number
        });
      }
      else {
        xmlPrismIndex.element(`range`, {
          range: rangeMax - rangeMin,
          mindmx: lastCap.dmxRange.end,
          maxdmx: firstCap.dmxRange.start,
          minval: lastCap.angle[1].number,
          maxval: firstCap.angle[0].number
        });
      }

      return xmlPrismIndex;
    }
  },
  prismRotation: { // rotation speed
    isCapSuitable: cap => cap.type === `PrismRotation` && cap.speed !== null,
    create: (channel, caps) => {
      const xmlPrismRotation = xmlbuilder.create(`prismrotation`);

      getNormalizedCapabilities(caps, `speed`, 5, `Hz`).forEach(cap => {
        if (cap.startValue === 0 && cap.endValue === 0) {
          xmlPrismRotation.element(`step`, {
            mindmx: cap.capObject.dmxRange.start,
            maxdmx: cap.capObject.dmxRange.end,
            type: `stop`
          });
        }
        else {
          const xmlRange = getBaseXmlCapability(cap.capObject, Math.abs(cap.startValue), Math.abs(cap.endValue));
          xmlRange.attribute(`type`, cap.startValue > 0 ? `cw` : `ccw`);
          xmlPrismRotation.importDocument(xmlRange);
        }
      });

      return xmlPrismRotation;
    }
  },
  fog: {
    isCapSuitable: cap => cap.type === `Fog` || (cap.type === `NoFunction` && cap._channel.type === `Fog`),
    create: (channel, caps) => {
      const xmlFog = xmlbuilder.create(`fog`);

      if (caps.length > 1) {
        // generate <step>s with value="true" or value="false"
        // this is not documented, but used in other fixtures

        caps.forEach(cap => {
          const isFogOn = cap.type !== `NoFunction` && (cap.fogOutput === null || cap.fogOutput[0].number > 0 || cap.fogOutput[1].number > 0);

          xmlFog.element(`step`, {
            mindmx: cap.dmxRange.start,
            maxdmx: cap.dmxRange.end,
            value: `${isFogOn}`
          });
        });
      }

      return xmlFog;
    }
  },
  fan: {
    isCapSuitable: cap => (cap.speed !== null || cap.type === `NoFunction`) && /\bfan\b/i.test(cap._channel.name),
    create: (channel, caps) => {
      const xmlFan = xmlbuilder.create(`fan`);

      if (caps.length > 1) {
        // generate <step>s with value="true" or value="false"
        // this is not documented, but used in other fixtures

        caps.forEach(cap => {
          const isFogOn = cap.type !== `NoFunction` && (cap.speed[0].number > 0 || cap.speed[1].number > 0);

          xmlFan.element(`step`, {
            mindmx: cap.dmxRange.start,
            maxdmx: cap.dmxRange.end,
            value: `${isFogOn}`
          });
        });
      }

      return xmlFan;
    }
  },
  index: { // rotation angle
    isCapSuitable: cap => (cap.type === `ColorWheelRotation` || cap.type === `Rotation`) && cap.angle,
    create: (channel, caps) => {
      const xmlIndex = xmlbuilder.create(`index`);

      const rangeMin = Math.min(...caps.map(cap => Math.min(cap.angle[0].number, cap.angle[1].number)));
      const rangeMax = Math.max(...caps.map(cap => Math.max(cap.angle[0].number, cap.angle[1].number)));

      const firstCap = caps[0];
      const lastCap = caps[caps.length - 1];

      if (firstCap.angle[0].number < lastCap.angle[1].number) {
        xmlIndex.element(`range`, {
          range: rangeMax - rangeMin,
          mindmx: firstCap.dmxRange.start,
          maxdmx: lastCap.dmxRange.end,
          minval: firstCap.angle[0].number,
          maxval: lastCap.angle[1].number
        });
      }
      else {
        xmlIndex.element(`range`, {
          range: rangeMax - rangeMin,
          mindmx: lastCap.dmxRange.end,
          maxdmx: firstCap.dmxRange.start,
          minval: lastCap.angle[1].number,
          maxval: firstCap.angle[0].number
        });
      }

      return xmlIndex;
    }
  },
  rotation: { // rotation speed
    isCapSuitable: cap => (cap.type === `Rotation` && cap.speed !== null) || cap.type === `PanContinuous` || cap.type === `TiltContinuous`,
    create: (channel, caps) => {
      const xmlRotation = xmlbuilder.create(`rotation`);

      getNormalizedCapabilities(caps, `speed`, 5, `Hz`).forEach(cap => {
        if (cap.startValue === 0 && cap.endValue === 0) {
          xmlRotation.element(`step`, {
            mindmx: cap.capObject.dmxRange.start,
            maxdmx: cap.capObject.dmxRange.end,
            type: `stop`
          });
        }
        else {
          const xmlRange = getBaseXmlCapability(cap.capObject, Math.abs(cap.startValue), Math.abs(cap.endValue));
          xmlRange.attribute(`type`, cap.startValue > 0 ? `cw` : `ccw`);
          xmlRotation.importDocument(xmlRange);
        }
      });

      return xmlRotation;
    }
  },
  rawStep: { // only steps
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  },
  raw: { // steps and ranges
    isCapSuitable: cap => false,
    create: (channel, caps) => {
      return;
    }
  }
};

/**
 * @typedef {object} NormalizedCapability
 * @property {Capability} capObject
 * @property {string} unit
 * @property {number} startValue
 * @property {number} endValue
 */

/**
 * Converts all property values to the proper unit and scales them to fit into the maximum value.
 * @param {array.<Capability>} caps Array of capabilities that use the given property.
 * @param {string} property Name of the property whose values should be normalized.
 * @param {number} maximumValue The highest possible value in DMXControl, in the given unit.
 * @param {string} properUnit The unit of the maximum value. Must be a base unit (i. e. no `ms` but `s`) or `%`.
 * @returns {array.<NormalizedCapability>} Array of objects wrapping the original capabilities.
 */
function getNormalizedCapabilities(caps, property, maximumValue, properUnit) {
  const normalizedCaps = caps.map(cap => {
    const startEntity = cap[property][0].getBaseUnitEntity();
    const endEntity = cap[property][1].getBaseUnitEntity();

    return {
      capObject: cap,
      unit: startEntity.unit,
      startValue: Math.abs(startEntity.number),
      endValue: Math.abs(endEntity.number),
      startSign: Math.sign(startEntity.number),
      endSign: Math.sign(endEntity.number)
    };
  });

  const capsWithProperUnit = normalizedCaps.filter(cap => cap.unit === properUnit);
  const maxValueWithProperUnit = Math.max(...(capsWithProperUnit.map(cap => Math.max(cap.startValue, cap.endValue))));
  if (maxValueWithProperUnit > maximumValue) {
    capsWithProperUnit.forEach(cap => {
      cap.startValue = cap.startValue * maximumValue / maxValueWithProperUnit;
      cap.endValue = cap.endValue * maximumValue / maxValueWithProperUnit;
    });
  }


  // they should all be of the same (wrong) unit, as we converted to the base unit above
  const capsWithWrongUnit = normalizedCaps.filter(cap => cap.unit !== properUnit);
  const maxValueWithWrongUnit = Math.max(...(capsWithWrongUnit.map(cap => Math.max(cap.startValue, cap.endValue))));
  if (maxValueWithWrongUnit !== 0) {
    capsWithWrongUnit.forEach(cap => {
      cap.unit = properUnit;
      cap.startValue = cap.startValue * maximumValue / maxValueWithWrongUnit;
      cap.endValue = cap.endValue * maximumValue / maxValueWithWrongUnit;
    });
  }

  // reapply signs (+ or –)
  normalizedCaps.forEach(cap => {
    cap.startValue *= cap.startSign;
    cap.endValue *= cap.endSign;
    delete cap.startSign;
    delete cap.endSign;
  });

  return normalizedCaps;
}

/**
 * This function already handles swapping DMX start/end if the given start/end value is inverted (i.e. decreasing).
 * @param {Capability} cap The capability to use as data source.
 * @param {number|null} startValue The start value of an start/end entity, e.g. speedStart. Unit can be freely chosen. Omit if minval/maxval should not be added.
 * @param {*|null} endValue The end value of an start/end entity, e.g. speedEnd. Unit can be freely chosen. Omit if minval/maxval should not be added.
 * @returns {XMLElement} A <step> or <range> with mindmx, maxdmx and, optionally, minval and maxval attributes.
 */
function getBaseXmlCapability(cap, startValue = null, endValue = null) {
  const dmxRange = cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);
  let [dmxStart, dmxEnd] = [dmxRange.start, dmxRange.end];

  if (startValue !== null && startValue > endValue) {
    [startValue, endValue] = [endValue, startValue];
    [dmxStart, dmxEnd] = [dmxEnd, dmxStart];
  }

  const xmlCap = xmlbuilder.create(cap.isStep ? `step` : `range`);
  xmlCap.attribute(`mindmx`, dmxStart);
  xmlCap.attribute(`maxdmx`, dmxEnd);

  if (startValue !== null) {
    xmlCap.attribute(`minval`, +startValue.toFixed(3));
    xmlCap.attribute(`maxval`, +endValue.toFixed(3));
  }

  return xmlCap;
}


/**
 * Adds the matrix function to the XML and inserts suitable color mixings from matrix channels.
 * @param {XMLElement} xmlParent The XML element in which the <matrix> tag should be inserted.
 * @param {Mode} mode The definition's mode.
 * @param {ChannelsPerPixel} channelsPerPixel Pixel keys pointing to its channels.
 */
function addMatrix(xmlParent, mode, channelsPerPixel) {
  const matrix = mode.fixture.matrix;
  if (matrix === null) {
    // no matrix data in this fixture
    return;
  }

  const usedPixelKeys = matrix.getPixelKeysByOrder(`X`, `Y`, `Z`).filter(
    pixelKey => channelsPerPixel.get(pixelKey).length > 0
  );
  if (usedPixelKeys.length === 0) {
    // no matrix channels used in mode
    return;
  }

  const xmlMatrix = xmlParent.element(`matrix`);
  xmlMatrix.attribute(`rows`, matrix.pixelCountX);
  xmlMatrix.attribute(`column`, matrix.pixelCountY);

  let allChannels = [];
  let referenceColors = null;
  let sameColors = true;
  let isMonochrome = true;

  for (const pixelKey of usedPixelKeys) {
    const channels = channelsPerPixel.get(pixelKey);
    allChannels = allChannels.concat(channels[0]);

    if (referenceColors === null) {
      referenceColors = getColors(channels);
    }

    sameColors = sameColors && setsEqual(referenceColors, getColors(channels));
    isMonochrome = isMonochrome && channels.length === 1 && channels[0].type === `Intensity`;
  }


  const colorMixing = isRGB(referenceColors) ? `rgb` : (isCMY(referenceColors) ? `cmy` : null);
  if (sameColors && colorMixing !== null) {
    for (const pixelKey of usedPixelKeys) {
      const pixelChannels = channelsPerPixel.get(pixelKey);
      const colorChannels = pixelChannels.filter(ch => ch.type === `Single Color`);
      colorChannels.forEach(ch => removeFromArray(pixelChannels, ch));
      addColorMixing(xmlMatrix, mode, colorChannels, colorMixing);
    }
  }
  else if (isMonochrome) {
    // cameo Flash Matrix 250 is a good reference fixture for this case

    allChannels.sort((a, b) => {
      const indexA = mode.getChannelIndex(a);
      const indexB = mode.getChannelIndex(b);
      return indexA - indexB;
    });

    xmlMatrix.attribute(`monochrome`, `true`);
    addChannelAttributes(xmlMatrix, mode, allChannels[0]);

    // clear pixelKeys' channel lists
    usedPixelKeys.forEach(pixelKey => (channelsPerPixel.get(pixelKey).length = 0));
  }
}

/**
 * Finds color channels in the given channel list, adds them to XML (as RGB/CMY function, if possible)
 * and removes them from the given channel list.
 * @param {XMLElement} xmlParent The XML element in which the <rgb>/<blue>/<amber>/... tags should be inserted.
 * @param {Mode} mode The definition's mode.
 * @param {array.<CoarseChannel>} remainingChannels All channels that haven't been processed already.
 */
function addColors(xmlParent, mode, remainingChannels) {
  // search color channels and remove them from color list as we'll handle all of them
  const colorChannels = remainingChannels.filter(ch => ch.type === `Single Color`);
  colorChannels.forEach(ch => removeFromArray(remainingChannels, ch));
  const colors = getColors(colorChannels);

  if (isCMY(colors) && isRGB(colors)) {
    const cmyColors = [`Cyan`, `Magenta`, `Yellow`];
    const cmyColorChannels = colorChannels.filter(ch => cmyColors.includes(ch.color)); // cmy
    const rgbColorChannels = colorChannels.filter(ch => !cmyColors.includes(ch.color)); // rgb + w + a + uv + ...

    addColorMixing(xmlParent, mode, cmyColorChannels, `rgb`);
    addColorMixing(xmlParent, mode, rgbColorChannels, `cmy`);
  }
  else if (isCMY(colors) || isRGB(colors)) {
    addColorMixing(xmlParent, mode, colorChannels, isRGB(colors) ? `rgb` : `cmy`);
  }
  else {
    colorChannels.forEach(channel => addColor(xmlParent, mode, channel));
  }
}

/**
 * Adds a color mixing function for the given channels
 * @param {XMLElement} xmlParent The XML element in which the color mixing (<rgb> or <cmy>) should be inserted.
 * @param {Mode} mode The definition's mode.
 * @param {array.<CoarseChannel>} colorChannels The Single Color channels to be added.
 * @param {('rgb'|'cmy')} colorMixing Which kind of color mixing this is.
 */
function addColorMixing(xmlParent, mode, colorChannels, colorMixing) {
  const xmlColorMixing = xmlParent.element(colorMixing);

  for (const colorChannel of colorChannels) {
    addColor(xmlColorMixing, mode, colorChannel);
  }
}

/**
 * Adds a color function for the given channel.
 * @param {XMLElement} xmlParent The XML element in which the color tag should be inserted, probably <rgb> or <cmy>.
 * @param {Mode} mode The definition's mode.
 * @param {CoarseChannel} colorChannel The Single Color channel which should be added.
 */
function addColor(xmlParent, mode, colorChannel) {
  const xmlColor = xmlParent.element(colorChannel.color.toLowerCase());
  addChannelAttributes(xmlColor, mode, colorChannel);
}

/**
 * @param {array.<CoarseChannel>} channels List of channels to search for color channels.
 * @returns {Set.<string>} Each used color.
 */
function getColors(channels) {
  const colors = new Set();
  for (const channel of channels.filter(ch => ch.type === `Single Color`)) {
    colors.add(channel.color);
  }
  return colors;
}

/**
 * @param {Set.<string>} colors Used colors in channels.
 * @returns {boolean} Whether the given colors contain all needed RGB colors.
 */
function isRGB(colors) {
  const hasRed = colors.has(`Red`);
  const hasGreen = colors.has(`Green`);
  const hasBlue = colors.has(`Blue`);
  return hasRed && hasGreen && hasBlue;
}

/**
 * @param {Set.<string>} colors Used colors in channels.
 * @returns {boolean} Whether the given colors contain all needed CMY colors.
 */
function isCMY(colors) {
  const hasCyan = colors.has(`Cyan`);
  const hasMagenta = colors.has(`Magenta`);
  const hasYellow = colors.has(`Yellow`);
  return hasCyan && hasMagenta && hasYellow;
}

/**
 * Finds dimmer channels in the given channel list, adds them to XML
 * and removes them from the given channel list.
 * @param {XMLElement} xmlParent The XML element in which the <dimmer> tags should be inserted.
 * @param {Mode} mode The definition's mode.
 * @param {array.<CoarseChannel>} remainingChannels All channels that haven't been processed already.
 */
function addDimmer(xmlParent, mode, remainingChannels) {
  const dimmerChannels = remainingChannels.filter(ch => {
    if (ch.type === `Intensity`) {
      const name = ch.name.toLowerCase();
      const keyWords = [`dimmer`, `intensity`, `brightness`];
      return keyWords.some(keyword => name.includes(keyword));
    }
    return false;
  });

  for (const dimmerChannel of dimmerChannels) {
    const xmlDimmer = xmlParent.element(`dimmer`);
    addChannelAttributes(xmlDimmer, mode, dimmerChannel);
    removeFromArray(remainingChannels, dimmerChannel);
  }
}

/**
 * Finds Pan/Tilt channels in the given channel list, adds them to XML (as Position function, if possible)
 * and removes them from the given channel list.
 * @param {XMLElement} xmlParent The XML element in which the <position> tag should be inserted.
 * @param {Mode} mode The definition's mode.
 * @param {array.<CoarseChannel>} remainingChannels All channels that haven't been processed already.
 */
function addPosition(xmlParent, mode, remainingChannels) {
  const panChannel = remainingChannels.find(ch => ch.type === `Pan`);
  const tiltChannel = remainingChannels.find(ch => ch.type === `Tilt`);

  if (panChannel !== undefined && tiltChannel !== undefined) {
    const xmlPosition = xmlParent.element(`position`);

    addPanTilt(xmlPosition, mode, panChannel);
    addPanTilt(xmlPosition, mode, tiltChannel);
  }
  else if ((panChannel || tiltChannel) !== undefined) {
    // at least only Pan or only Tilt is specified
    addPanTilt(xmlParent, mode, (panChannel || tiltChannel));
  }

  removeFromArray(remainingChannels, panChannel);
  removeFromArray(remainingChannels, tiltChannel);
}

/**
 * Adds a pan or tilt function for the given Pan or Tilt channel.
 * @param {XMLElement} xmlParent The XML element in which the <pan>/<tilt> tag should be inserted, probably <position>.
 * @param {Mode} mode The definition's mode.
 * @param {Channel} channel The channel of type Pan or Tilt to use.
 */
function addPanTilt(xmlParent, mode, channel) {
  const isPan = channel.type === `Pan`;

  const xmlFunc = xmlParent.element(isPan ? `pan` : `tilt`);
  addChannelAttributes(xmlFunc, mode, channel);

  const focusMax = isPan ? `focusPanMax` : `focusTiltMax`;
  if (mode.physical !== null && mode.physical[focusMax] !== null) {
    xmlFunc.element(`range`).attribute(`range`, mode.physical[focusMax]);
  }
}

/**
 * Adds name attribute, dmxchannel attribute and attributes for fine channels (if used in mode) to the given channel function.
 * @param {XMLElement} xmlElement The XML element to which the attributes should be added.
 * @param {Mode} mode The definition's mode.
 * @param {CoarseChannel} channel The channel whose data is used.
 */
function addChannelAttributes(xmlElement, mode, channel) {
  xmlElement.attribute(`name`, channel.name);

  const index = mode.getChannelIndex(channel);
  xmlElement.attribute(`dmxchannel`, index);

  const fineIndices = channel.fineChannels.map(
    fineCh => mode.getChannelIndex(fineCh)
  );

  if (fineIndices.length > 0 && fineIndices[0] !== -1) {
    xmlElement.attribute(`finedmxchannel`, fineIndices[0]);

    if (fineIndices.length > 1 && fineIndices[1] !== -1) {
      xmlElement.attribute(`ultradmxchannel`, fineIndices[1]);

      if (fineIndices.length > 2 && fineIndices[2] !== -1) {
        xmlElement.attribute(`ultrafinedmxchannel`, fineIndices[2]);
      }
    }
  }
}

/**
 * Removes the given item from array using splice and indexOf. Attention: If item is duplicated in array, first occurrence is removed!
 * @param {array} arr The array from which to remove the item.
 * @param {*} item The item to remove from the array.
 */
function removeFromArray(arr, item) {
  arr.splice(arr.indexOf(item), 1);
}

/**
 * @param {Set} set1 First Set to compare.
 * @param {Set} set2 Second Set to compare.
 * @returns {boolean} Whether both Sets have equal size and their items do strictly equal.
 */
function setsEqual(set1, set2) {
  let equalItems = true;
  for (const value of set1) {
    equalItems = equalItems && set2.has(value);
  }

  return set1.size === set2.size && equalItems;
}

/**
 * @param {array} arr1 First array to compare.
 * @param {array} arr2 Second array to compare.
 * @returns {boolean} Whether both arrays have equal size and their items do strictly equal.
 */
function arraysEqual(arr1, arr2) {
  if (arr1 === arr2) {
    return true;
  }

  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }

  return arr1.length === arr2.length && arr1.every(
    (item, index) => item === arr2[index]
  );
}
