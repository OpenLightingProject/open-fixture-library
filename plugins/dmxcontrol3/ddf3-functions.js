const xmlbuilder = require(`xmlbuilder`);

const { Capability, CoarseChannel } = require(`../../lib/model.js`);

module.exports = {
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
