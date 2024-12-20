import xmlbuilder from 'xmlbuilder';

import Capability from '../../lib/model/Capability.js';
import CoarseChannel from '../../lib/model/CoarseChannel.js';

export default {
  const: {
    isCapSuitable: capability => capability._channel.isConstant,
    create: (channel, capabilities) => {
      const xmlConst = xmlbuilder.create(`const`);
      xmlConst.attribute(`val`, channel.getDefaultValueWithResolution(CoarseChannel.RESOLUTION_8BIT));
      return xmlConst;
    },
  },
  dimmer: {
    isCapSuitable: capability => capability.type === `Intensity`,
    create: (channel, capabilities) => {
      const xmlDimmer = xmlbuilder.create(`dimmer`);

      if (channel.capabilities.length > 1 || capabilities[0].brightness[0].number !== 0) {
        const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `brightness`, `%`);
        for (const capability of dmxControlCapabilities) {
          const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
          xmlCapability.attribute(`type`, `linear`);
          xmlDimmer.importDocument(xmlCapability);
        }
      }

      return xmlDimmer;
    },
  },
  shutter: {
    isCapSuitable: capability => {
      const isShutterCapability = capability.type === `ShutterStrobe` && [`Open`, `Closed`].includes(capability.shutterEffect);
      const channelHasOpen = capability._channel.capabilities.some(otherCapability => otherCapability.shutterEffect === `Open`);
      const channelHasClosed = capability._channel.capabilities.some(otherCapability => otherCapability.shutterEffect === `Closed`);
      return isShutterCapability && channelHasOpen && channelHasClosed;
    },
    create: (channel, capabilities) => {
      const xmlShutter = xmlbuilder.create(`shutter`);

      for (const capability of capabilities) {
        const xmlCapability = getBaseXmlCapability(capability);
        xmlCapability.attribute(`type`, capability.shutterEffect.toLowerCase());
        xmlShutter.importDocument(xmlCapability);
      }

      return xmlShutter;
    },
  },
  strobe: {
    isCapSuitable: capability =>
      (capability.type === `ShutterStrobe` && ![`Open`, `Closed`].includes(capability.shutterEffect)) ||
      (capability.type === `NoFunction` && capability._channel.type === `Strobe`),
    create: (channel, capabilities) => {
      const xmlStrobe = xmlbuilder.create(`strobe`);

      for (const capability of capabilities) {
        let xmlCapability;

        if (capability.speed) {
          const [dmxControlCapability] = getSingleUnitCapabilities([capability], `speed`, `Hz`, 0, 50);
          xmlCapability = getBaseXmlCapability(capability, dmxControlCapability.startValue, dmxControlCapability.endValue);
        }
        else {
          xmlCapability = getBaseXmlCapability(capability);
        }

        xmlCapability.attribute(`type`, getStrobeType(capability));
        xmlStrobe.importDocument(xmlCapability);
      }

      return xmlStrobe;

      /**
       * @param {Capability} capability A ShutterStrobe capability, excluding Open and Closed or a NoFunction capability
       * @returns {string} The strobe type that should be used in the DMXControl capability.
       */
      function getStrobeType(capability) {
        if (capability.type === `NoFunction`) {
          return `open`;
        }

        const typePerShutterEffect = {
          Strobe: capability.randomTiming ? `random` : `linear`,
          RampUp: `ramp up`,
          RampDown: `ramp down`,
          RampUpDown: `ramp up/down`,
        };
        return typePerShutterEffect[capability.shutterEffect] ?? capability.shutterEffect.toLowerCase();
      }
    },
  },
  strobeSpeed: {
    isCapSuitable: capability => capability.type === `StrobeSpeed`,
    create: (channel, capabilities) => {
      const xmlSpeed = xmlbuilder.create(`strobespeed`);

      const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `speed`, `Hz`, 0, 50);
      for (const capability of dmxControlCapabilities) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlSpeed.importDocument(xmlCapability);
      }

      return xmlSpeed;
    },
  },
  strobeDuration: {
    isCapSuitable: capability => capability.type === `StrobeDuration`,
    create: (channel, capabilities) => {
      const xmlDuration = xmlbuilder.create(`duration`);

      for (const capability of getSingleUnitCapabilities(capabilities, `duration`, `s`, 0, 2)) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue * 1000, capability.endValue * 1000);
        xmlCapability.attribute(`type`, `linear`);
        xmlDuration.importDocument(xmlCapability);
      }

      return xmlDuration;
    },
  },
  pan: {
    isCapSuitable: capability => capability.type === `Pan`,
    create: (channel, capabilities) => {
      const xmlPan = xmlbuilder.create(`pan`);

      for (const capability of capabilities) {
        xmlPan.element(`range`, {
          range: capability.angle[1].number - capability.angle[0].number,
        });
      }

      return xmlPan;
    },
  },
  tilt: {
    isCapSuitable: capability => [`Pan`, `Tilt`].includes(capability.type),
    create: (channel, capabilities) => {
      const xmlTilt = xmlbuilder.create(`tilt`);

      for (const capability of capabilities) {
        xmlTilt.element(`range`, {
          range: capability.angle[1].number - capability.angle[0].number,
        });
      }

      return xmlTilt;
    },
  },
  panTiltSpeed: {
    isCapSuitable: capability => capability.type === `PanTiltSpeed`,
    create: (channel, capabilities) => {
      const xmlPanTiltSpeed = xmlbuilder.create(`ptspeed`);

      const speedCapabilities = getSingleUnitCapabilities(
        capabilities.filter(capability => capability.speed !== null), `speed`, `%`,
      );
      const durationCapabilities = getSingleUnitCapabilities(
        capabilities.filter(capability => capability.duration !== null), `duration`, `%`,
      );

      for (const capability of speedCapabilities) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`type`, `linear`);
        xmlPanTiltSpeed.importDocument(xmlCapability);
      }

      for (const capability of durationCapabilities) {
        // 100% duration means low speed, so we need to invert this
        const xmlCapability = getBaseXmlCapability(capability.capObject, 100 - capability.startValue, 100 - capability.endValue);
        xmlCapability.attribute(`type`, `linear`);
        xmlPanTiltSpeed.importDocument(xmlCapability);
      }

      return xmlPanTiltSpeed;
    },
  },
  color: {
    isCapSuitable: capability => capability.type === `ColorIntensity` || (capability.type === `NoFunction` && capability._channel.type === `Single Color`),
    create: (channel, capabilities) => {
      const capabilitiesPerColor = {};

      for (const capability of capabilities) {
        let color = capability.color;
        if (color === `Warm White` || color === `Cold White`) {
          color = `White`;
        }

        if (!(color in capabilitiesPerColor)) {
          capabilitiesPerColor[color] = [];
        }
        capabilitiesPerColor[color].push(capability);
      }

      delete capabilitiesPerColor.null; // NoFunction caps will be ignored

      return Object.keys(capabilitiesPerColor).map((color, index) => {
        const colorCapabilities = capabilitiesPerColor[color];
        const xmlColor = xmlbuilder.create(color.toLowerCase());

        if (Object.keys(capabilitiesPerColor).length > 1) {
          const dmxControlCapabilities = getSingleUnitCapabilities(colorCapabilities, `brightness`, `%`);
          for (const capability of dmxControlCapabilities) {
            const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
            xmlCapability.attribute(`type`, `linear`);
            xmlColor.importDocument(xmlCapability);
          }
        }

        return xmlColor;
      });
    },
  },
  colorWheel: {
    isCapSuitable: capability => capability.isSlotType(`Color`) || capability.type === `ColorPreset` || (capability.type === `WheelRotation` && capability.speed && capability.wheels.some(wheel => wheel.type === `Color`)),
    create: (channel, capabilities) => {
      const xmlColorWheel = xmlbuilder.create(`colorwheel`);

      // RGB value for dummy colors. Will be decremented by 1 every time a dummy color is created.
      let greyValue = 0x99;

      const presetCapabilities = capabilities.filter(capability => capability.isSlotType(`Color`) || capability.type === `ColorPreset`);

      // split proportional caps so we only have stepped caps
      for (let index = 0; index < presetCapabilities.length; index++) {
        const capability = presetCapabilities[index];

        if (!capability.isStep) {
          const splittedCapabilities = getSplittedCapabilities(capability);
          presetCapabilities.splice(index, 1, ...splittedCapabilities);
        }
      }

      // merge adjacent stepped caps
      for (let index = 0; index < presetCapabilities.length; index++) {
        const capability = presetCapabilities[index];

        if (index + 1 < presetCapabilities.length) {
          const nextCapability = presetCapabilities[index + 1];
          const mergedCapability = getMergedCapability(capability, nextCapability);

          if (mergedCapability) {
            presetCapabilities.splice(index, 2, mergedCapability);
            index--; // maybe the merged capability can be merged another time
          }
        }
      }

      for (const capability of presetCapabilities) {
        xmlColorWheel.element(`step`, {
          type: `color`,
          val: getColor(capability),
          mindmx: capability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT).start,
          maxdmx: capability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT).end,
          caption: capability.name,
        });
      }


      const rotationCapabilities = getSingleUnitCapabilities(
        capabilities.filter(capability => capability.type === `WheelRotation`), `speed`, `Hz`, 0, 15,
      );
      if (rotationCapabilities.length > 0) {
        const xmlWheelRotation = xmlColorWheel.element(`wheelrotation`);
        for (const capability of rotationCapabilities) {
          xmlWheelRotation.importDocument(getRotationSpeedXmlCapability(capability));
        }
      }

      return xmlColorWheel;

      /**
       * @param {Capability} capability A capability with different start/end values.
       * @returns {Capability[]} One capability representing the start value and one representing the end value.
       */
      function getSplittedCapabilities(capability) {
        const startCapabilityJson = {
          dmxRange: [capability.rawDmxRange.start, capability.rawDmxRange.start],
          _splitted: true,
        };
        const centerCapabilityJson = {
          dmxRange: [capability.rawDmxRange.center, capability.rawDmxRange.center],
          _splitted: true,
        };
        const endCapabilityJson = {
          dmxRange: [capability.rawDmxRange.end, capability.rawDmxRange.end],
          _splitted: true,
        };

        for (let [key, value] of Object.entries(capability.jsonObject)) {
          if (key === `dmxRange`) {
            continue;
          }

          if (key.includes(`Start`)) {
            key = key.replace(`Start`, ``);
            startCapabilityJson[key] = value;
          }
          else if (key.includes(`End`)) {
            key = key.replace(`End`, ``);
            endCapabilityJson[key] = value;
          }
          else {
            startCapabilityJson[key] = value;
            centerCapabilityJson[key] = value;
            endCapabilityJson[key] = value;
          }
        }

        if (capability.hasComment) {
          const startEndRegex = /^([\d a-z]+?) *(?:…|->?|\bto\b) *([\d a-z]+?)$/i; // Red…Blue, Red to Blue, Red -> Blue, Red-Blue, ...
          const match = startEndRegex.exec(capability.comment);

          if (match) {
            const [, startColorName, endColorName] = match;
            startCapabilityJson.comment = startColorName.replace(/^[a-z]/, firstLetter => firstLetter.toUpperCase());
            endCapabilityJson.comment = endColorName.replace(/^[a-z]/, firstLetter => firstLetter.toUpperCase());
          }
        }

        if (`slotNumber` in startCapabilityJson) {
          centerCapabilityJson.slotNumber = (capability.slotNumber[0].number + capability.slotNumber[1].number) / 2;
        }
        if (`colors` in startCapabilityJson) {
          centerCapabilityJson.colors = capability.colors.allColors;
        }

        const [startCapability, centerCapability, endCapability] = [startCapabilityJson, centerCapabilityJson, endCapabilityJson].map(
          capabilityJson => new Capability(capabilityJson, capability._resolution, capability._channel),
        );

        if (capability.slotNumber) {
          return [startCapability, centerCapability, endCapability];
        }
        return [startCapability, endCapability];
      }

      /**
       * @param {Capability} capability1 A capability.
       * @param {Capability} capability2 Another capability.
       * @returns {Capability|null} A capability that combines the values of both given capabilities. Null if merging was not possible.
       */
      function getMergedCapability(capability1, capability2) {
        if (!capability1.rawDmxRange.isAdjacentTo(capability2.rawDmxRange)) {
          return null;
        }

        const filterDistinguishableKeys = key => ![`dmxRange`, `_splitted`, `menuClick`].includes(key);
        const distinguishableKeys1 = Object.keys(capability1.jsonObject).filter(key => filterDistinguishableKeys(key));
        const distinguishableKeys2 = Object.keys(capability2.jsonObject).filter(key => filterDistinguishableKeys(key));
        const hasDifferentKeys = !arraysEqual(distinguishableKeys1, distinguishableKeys2);
        const hasDifferentValues = distinguishableKeys1.some(key => {
          const value1 = capability1.jsonObject[key];
          const value2 = capability2.jsonObject[key];

          if (key === `slotNumber`) {
            // slotNumber 8 and slotNumber 1 are the same slots if the wheel only has 7 slots
            return !arraysEqual(capability1.wheelSlot, capability2.wheelSlot);
          }

          return value1 !== value2 && !arraysEqual(value1, value2);
        });
        if (hasDifferentKeys || hasDifferentValues) {
          return null;
        }

        const capabilityJson = {};
        const preferredJsonObject = capability1.jsonObject._splitted ? capability2.jsonObject : capability1.jsonObject; // we prefer unsplitted capability
        for (const [key, value] of Object.entries(preferredJsonObject)) {
          capabilityJson[key] = value;
        }

        const dmxRange = capability1.rawDmxRange.getRangeMergedWith(capability2.rawDmxRange);
        capabilityJson.dmxRange = [dmxRange.start, dmxRange.end];

        return new Capability(capabilityJson, capability1._resolution, capability1._channel);
      }

      /**
       * @param {Capability} capability A capability.
       * @returns {string} A color from the given capability's color data if there's only one color. A generic (and probably unique) grey color instead.
       */
      function getColor(capability) {
        if (capability.colors && capability.colors.allColors.length === 1) {
          return capability.colors.allColors[0];
        }

        const hex = (greyValue--).toString(16);
        return `#${hex}${hex}${hex}`;
      }
    },
  },
  colorTemperature: {
    isCapSuitable: capability => capability.type === `ColorTemperature`,
    create: (channel, capabilities) => {
      const xmlColorTemporary = xmlbuilder.create(`colortemp`);

      const zeroPercentValue = 8000 - ((8000 - 2500) / 2);
      const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `colorTemperature`, `K`, zeroPercentValue, 8000);
      for (const capability of dmxControlCapabilities) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`type`, `linear`);
        xmlColorTemporary.importDocument(xmlCapability);
      }

      return xmlColorTemporary;
    },
  },
  goboWheel: {
    isCapSuitable: capability => capability.isSlotType(`Gobo`) || (capability.type === `WheelRotation` && capability.speed && capability.wheels.some(wheel => wheel.type === `Gobo`)),
    create: (channel, capabilities) => {
      const xmlGoboWheel = xmlbuilder.create(`gobowheel`);

      const capabilitiesPerSlot = {};

      // search for first normal cap and first shaking cap per index
      // further caps of the same index will be ignored (for now)
      const slotCapabilities = capabilities.filter(capability => capability.isSlotType(`Gobo`));
      for (const capability of slotCapabilities) {
        const slotNumber = `${capability.slotNumber[0]}…${capability.slotNumber[1]}`;

        if (!(slotNumber in capabilitiesPerSlot)) {
          capabilitiesPerSlot[slotNumber] = {
            normalCap: null,
            shakingCap: null,
          };
        }

        if (capability.type !== `WheelShake` && !capabilitiesPerSlot[slotNumber].normalCap) {
          capabilitiesPerSlot[slotNumber].normalCap = capability;
        }
        else if (capability.type === `WheelShake` && !capabilitiesPerSlot[slotNumber].shakingCap) {
          capabilitiesPerSlot[slotNumber].shakingCap = capability;
        }
      }

      const usesShake = Object.values(capabilitiesPerSlot).some(({ shakingCap }) => shakingCap !== null);
      if (usesShake) {
        xmlGoboWheel.element(`goboshake`);
      }

      for (const { normalCap, shakingCap } of Object.values(capabilitiesPerSlot)) {
        if (normalCap) {
          const xmlCapability = getBaseXmlCapability(normalCap);
          xmlCapability.attribute(`type`, normalCap.isSlotType(`Open`) ? `open` : `gobo`);
          xmlCapability.attribute(`caption`, normalCap.name);

          if (shakingCap) {
            let xmlShakeCapability;

            if (shakingCap.shakeSpeed) {
              const [dmxControlCapability] = getSingleUnitCapabilities([shakingCap], `shakeSpeed`, `Hz`, 0, 20);
              xmlShakeCapability = getBaseXmlCapability(shakingCap, dmxControlCapability.startValue, dmxControlCapability.endValue);
            }
            else {
              xmlShakeCapability = getBaseXmlCapability(shakingCap);
            }

            xmlShakeCapability.attribute(`handler`, `goboshake`);
            xmlCapability.importDocument(xmlShakeCapability);
          }

          xmlGoboWheel.importDocument(xmlCapability);
        }
      }

      const rotationCapabilities = getSingleUnitCapabilities(
        capabilities.filter(capability => capability.type === `WheelRotation`), `speed`, `Hz`, 0, 15,
      );
      if (rotationCapabilities.length > 0) {
        const xmlWheelRotation = xmlGoboWheel.element(`wheelrotation`);
        for (const capability of rotationCapabilities) {
          xmlWheelRotation.importDocument(getRotationSpeedXmlCapability(capability));
        }
      }

      return xmlGoboWheel;
    },
  },
  goboIndex: { // gobo stencil rotation angle
    isCapSuitable: capability => capability.type === `WheelSlotRotation` && capability.wheels.some(wheel => wheel.type === `Gobo`) && capability.angle !== null,
    create: (channel, capabilities) => {
      const xmlGoboIndex = xmlbuilder.create(`goboindex`);

      for (const capability of getSingleUnitCapabilities(capabilities, `angle`, `deg`, 0, 360)) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`range`, Math.abs(capability.endValue - capability.startValue));
        xmlGoboIndex.importDocument(xmlCapability);
      }

      return xmlGoboIndex;
    },
  },
  goboRotation: { // gobo stencil rotation speed
    isCapSuitable: capability => capability.type === `WheelSlotRotation` && capability.wheels.some(wheel => wheel.type === `Gobo`) && capability.speed !== null,
    create: (channel, capabilities) => {
      const xmlGoboRotation = xmlbuilder.create(`goborotation`);

      for (const capability of getSingleUnitCapabilities(capabilities, `speed`, `Hz`, 0, 5)) {
        const xmlCapability = getRotationSpeedXmlCapability(capability);
        xmlGoboRotation.importDocument(xmlCapability);
      }

      return xmlGoboRotation;
    },
  },
  goboShake: { // gobo shake speed
    isCapSuitable: capability => capability.type === `WheelShake` && capability.wheels.some(wheel => wheel.type === `Gobo`) && capability.wheelSlot === null && capability.shakeSpeed !== null,
    create: (channel, capabilities) => {
      const xmlGoboShake = xmlbuilder.create(`goboshake`);

      for (const capability of getSingleUnitCapabilities(capabilities, `shakeSpeed`, `Hz`, 0, 20)) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlGoboShake.importDocument(xmlCapability);
      }

      return xmlGoboShake;
    },
  },
  focus: {
    isCapSuitable: capability => capability.type === `Focus`,
    create: (channel, capabilities) => {
      const xmlFocus = xmlbuilder.create(`focus`);

      const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `distance`, `%`);
      for (const capability of dmxControlCapabilities) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`type`, `linear`);
        xmlFocus.importDocument(xmlCapability);
      }

      return xmlFocus;
    },
  },
  frost: {
    isCapSuitable: capability => capability.type === `Frost`,
    create: (channel, capabilities) => {
      const xmlFrost = xmlbuilder.create(`frost`);

      if (capabilities.length > 1) {
        for (const capability of capabilities) {
          let xmlCapability;

          if (capability.frostIntensity[0].number === capability.frostIntensity[1].number) {
            // generate <step>s with value="true" or value="false"
            // this is not documented, but used in other fixtures
            const isFrostOn = capability.frostIntensity[0].number > 0;
            xmlCapability = getBaseXmlCapability(capability);
            xmlCapability.attribute(`value`, `${isFrostOn}`);
          }
          else {
            xmlCapability = getBaseXmlCapability(capability, capability.frostIntensity[0].number, capability.frostIntensity[1].number);
            xmlCapability.attribute(`type`, `frost`);
          }

          xmlFrost.importDocument(xmlCapability);
        }
      }

      return xmlFrost;
    },
  },
  iris: {
    isCapSuitable: capability => capability.type === `Iris`,
    create: (channel, capabilities) => {
      const xmlIris = xmlbuilder.create(`iris`);

      const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `openPercent`, `%`);
      for (const capability of dmxControlCapabilities) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`type`, `linear`);
        xmlIris.importDocument(xmlCapability);
      }

      return xmlIris;
    },
  },
  zoom: {
    isCapSuitable: capability => capability.type === `Zoom`,
    create: (channel, capabilities) => {
      const xmlZoom = xmlbuilder.create(`zoom`);

      const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `angle`, `deg`, 0, 90);
      for (const capability of dmxControlCapabilities) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`type`, `linear`);
        xmlZoom.importDocument(xmlCapability);
      }

      return xmlZoom;
    },
  },
  prism: {
    isCapSuitable: capability => capability.type === `Prism` || (capability.type === `NoFunction` && capability._channel.type === `Prism`),
    create: (channel, capabilities) => {
      const xmlPrism = xmlbuilder.create(`prism`);

      const hasRotationAngleCapabilities = capabilities.some(capability => capability.angle !== null);
      const hasRotationSpeedCapabilities = capabilities.some(capability => capability.speed !== null);

      if (hasRotationAngleCapabilities) {
        xmlPrism.element(`prismindex`);
      }

      if (hasRotationSpeedCapabilities) {
        xmlPrism.element(`prismrotation`);
      }


      // group adjacent capabilities by comment
      const capabilitiesGroupedByComment = [];
      for (const capability of capabilities) {
        const lastGroup = capabilitiesGroupedByComment.at(-1);

        if (lastGroup && lastGroup[0].type === capability.type && lastGroup[0].comment === capability.comment) {
          // push to last group
          lastGroup.push(capability);
        }
        else {
          // push new group
          capabilitiesGroupedByComment.push([capability]);
        }
      }

      for (const commentGroup of capabilitiesGroupedByComment) {
        const firstCapability = commentGroup[0];
        const lastCapability = commentGroup.at(-1);

        const xmlStep = xmlPrism.element(`step`, {
          type: firstCapability.type === `NoFunction` ? `open` : `prism`,
          mindmx: firstCapability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT).start,
          maxdmx: lastCapability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT).end,
          caption: firstCapability.name,
        });

        // add ranges for capabilities without rotation speed
        const rotationAngleCapabilities = commentGroup.filter(capability => capability.angle !== null);
        for (const capability of rotationAngleCapabilities) {
          const xmlRange = getBaseXmlCapability(capability, capability.angle[0].number, capability.angle[1].number);
          xmlRange.attribute(`range`, capability.angle[1].number - capability.angle[0].number);
          xmlRange.attribute(`handler`, `prismindex`);
          xmlStep.importDocument(xmlRange);
        }

        // add ranges/steps for rotation speed dmx control capabilities
        const rotationSpeedCapabilities = commentGroup.filter(capability => capability.speed !== null);
        for (const capability of getSingleUnitCapabilities(rotationSpeedCapabilities, `speed`, `Hz`, 0, 5)) {
          const xmlCapability = getRotationSpeedXmlCapability(capability);
          xmlCapability.attribute(`handler`, `prismrotation`);
          xmlStep.importDocument(xmlCapability);
        }
      }


      return xmlPrism;
    },
  },
  prismIndex: { // rotation angle
    isCapSuitable: capability => capability.type === `PrismRotation` && capability.angle !== null,
    create: (channel, capabilities) => {
      const xmlPrismIndex = xmlbuilder.create(`prismindex`);

      for (const capability of getSingleUnitCapabilities(capabilities, `angle`, `deg`, 0, 360)) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`range`, Math.abs(capability.endValue - capability.startValue));
        xmlPrismIndex.importDocument(xmlCapability);
      }

      return xmlPrismIndex;
    },
  },
  prismRotation: { // rotation speed
    isCapSuitable: capability => capability.type === `PrismRotation` && capability.speed !== null,
    create: (channel, capabilities) => {
      const xmlPrismRotation = xmlbuilder.create(`prismrotation`);

      for (const capability of getSingleUnitCapabilities(capabilities, `speed`, `Hz`, 0, 5)) {
        const xmlCapability = getRotationSpeedXmlCapability(capability);
        xmlPrismRotation.importDocument(xmlCapability);
      }

      return xmlPrismRotation;
    },
  },
  fog: {
    isCapSuitable: capability => capability.type === `Fog` || (capability.type === `NoFunction` && capability._channel.type === `Fog`),
    create: (channel, capabilities) => {
      const xmlFog = xmlbuilder.create(`fog`);

      if (capabilities.length > 1) {

        for (const capability of capabilities) {
          let xmlCapability;

          if (capability.fogOutput !== null && capability.fogOutput[0].number !== capability.fogOutput[1].number) {
            xmlCapability = getBaseXmlCapability(capability, capability.fogOutput[0].number, capability.fogOutput[1].number);
            xmlCapability.attribute(`type`, `fog`);
          }
          else {
            // generate <step>s with value="true" or value="false"
            // this is not documented, but used in other fixtures
            const isFogOn = capability.type !== `NoFunction` && (capability.fogOutput === null || capability.fogOutput[0].number > 0);
            xmlCapability = getBaseXmlCapability(capability);
            xmlCapability.attribute(`value`, `${isFogOn}`);
          }

          xmlFog.importDocument(xmlCapability);
        }
      }

      return xmlFog;
    },
  },
  fan: {
    isCapSuitable: capability => (capability.speed !== null || capability.type === `NoFunction`) && /\bfan\b/i.test(capability._channel.name),
    create: (channel, capabilities) => {
      const xmlFan = xmlbuilder.create(`fan`);

      if (capabilities.length > 1) {

        for (const capability of capabilities) {
          let xmlCapability;

          if (capability.speed !== null && capability.speed[0].number !== capability.speed[1].number) {
            xmlCapability = getBaseXmlCapability(capability, Math.abs(capability.speed[0].number), Math.abs(capability.speed[1].number));
            xmlCapability.attribute(`type`, `fan`);
          }
          else {
            // generate <step>s with value="true" or value="false"
            // this is not documented, but used in other fixtures
            const isFanOn = capability.type !== `NoFunction` && (capability.speed[0].number > 0);
            xmlCapability = getBaseXmlCapability(capability);
            xmlCapability.attribute(`value`, `${isFanOn}`);
          }

          xmlFan.importDocument(xmlCapability);
        }
      }

      return xmlFan;
    },
  },
  index: { // rotation angle
    isCapSuitable: capability => capability.angle && capability.type.includes(`Rotation`),
    create: (channel, capabilities) => {
      const xmlIndex = xmlbuilder.create(`index`);

      for (const capability of getSingleUnitCapabilities(capabilities, `angle`, `deg`, 0, 360)) {
        const xmlCapability = getBaseXmlCapability(capability.capObject, capability.startValue, capability.endValue);
        xmlCapability.attribute(`range`, Math.abs(capability.endValue - capability.startValue));
        xmlIndex.importDocument(xmlCapability);
      }

      return xmlIndex;
    },
  },
  rotation: { // rotation speed
    isCapSuitable: capability => capability.speed !== null && capability.type.match(/(Rotation|Continuous)/),
    create: (channel, capabilities) => {
      const xmlRotation = xmlbuilder.create(`rotation`);

      const dmxControlCapabilities = getSingleUnitCapabilities(capabilities, `speed`, `Hz`, 0, 5);
      for (const capability of dmxControlCapabilities) {
        xmlRotation.importDocument(getRotationSpeedXmlCapability(capability));
      }

      return xmlRotation;
    },
  },
  rawStep: { // only steps
    isCapSuitable: capability => capability._channel.type !== `NoFunction` && (capability._channel.capabilities.every(capability_ => capability_.isStep) || capability.usedStartEndEntities.length === 0),
    create: (channel, capabilities) => {
      const xmlRawStep = xmlbuilder.create(`rawstep`);

      for (const capability of capabilities) {
        const xmlCapability = getBaseXmlCapability(capability);
        xmlCapability.attribute(`caption`, capability.name);
        xmlRawStep.importDocument(xmlCapability);
      }

      return xmlRawStep;
    },
  },
  raw: { // steps and ranges
    isCapSuitable: capability => capability._channel.type !== `NoFunction` && capability.usedStartEndEntities.length > 0,
    create: (channel, capabilities) => {
      const xmlRaw = xmlbuilder.create(`raw`);

      for (const capability of capabilities) {
        const [startEntity, endEntity] = capability[capability.usedStartEndEntities[0]];
        const xmlCapability = getBaseXmlCapability(capability, startEntity.number, endEntity.number);
        xmlCapability.attribute(`caption`, capability.name);
        xmlCapability.attribute(`type`, capability.usedStartEndEntities[0] === `speed` && startEntity.number === endEntity.number ? `stop` : `linear`);
        xmlRaw.importDocument(xmlCapability);
      }

      return xmlRaw;
    },
  },
};

/**
 * @typedef {object} DmxControlCapability
 * @property {Capability} capObject
 * @property {number} startValue
 * @property {number} endValue
 */

/**
 * Converts all property values to the allowed unit.
 * @param {Capability[]} capabilities Array of capabilities that use the given property.
 * @param {string} property Name of the property whose values should be normalized.
 * @param {string} allowedUnit The unit all capabilities should be converted to. Must be a base unit (i. e. no `ms` but `s`) or `%`.
 * @param {number} zeroPercentValue The equivalent of 0% in the allowed unit. Must be used if allowedUnit is not percent.
 * @param {number} hundredPercentValue The equivalent of 100% in the allowed unit. Must be used if allowedUnit is not percent.
 * @returns {DmxControlCapability[]} Array of objects wrapping the original capabilities.
 */
function getSingleUnitCapabilities(capabilities, property, allowedUnit, zeroPercentValue, hundredPercentValue) {
  const dmxControlCapabilities = capabilities.map(capability => {
    const startEntity = capability[property][0].baseUnitEntity;
    const endEntity = capability[property][1].baseUnitEntity;

    return {
      capObject: capability,
      unit: startEntity.unit,
      startValue: startEntity.number,
      endValue: endEntity.number,
    };
  });

  // they should all be of the same (wrong) unit, as we converted to the base unit above
  const capabilitiesWithWrongUnit = dmxControlCapabilities.filter(capability => capability.unit !== allowedUnit);
  const maxValueWithWrongUnit = Math.max(...(capabilitiesWithWrongUnit.map(capability => Math.max(Math.abs(capability.startValue), Math.abs(capability.endValue)))));
  if (allowedUnit !== `%`) {
    // we take the conversion from percent to unit as a linear function f(x) = (m*x + t)
    // where x is the percentage value and f(x) or y is the value in the allowed unit
    const m = (hundredPercentValue - zeroPercentValue) / 100; // delta y / delta x
    const t = zeroPercentValue; // f(0) = m * 0 + t = t
    const percentToUnit = (x => (m * x) + t);

    for (const capability of capabilitiesWithWrongUnit) {
      capability.unit = allowedUnit;
      capability.startValue = percentToUnit(capability.startValue);
      capability.endValue = percentToUnit(capability.endValue);
    }
  }
  else if (maxValueWithWrongUnit !== 0) {
    for (const capability of capabilitiesWithWrongUnit) {
      capability.unit = allowedUnit;
      capability.startValue = capability.startValue / maxValueWithWrongUnit * 100;
      capability.endValue = capability.endValue / maxValueWithWrongUnit * 100;
    }
  }

  for (const capability of dmxControlCapabilities) {
    delete capability.unit;
  }

  return dmxControlCapabilities;
}

/**
 * This function already handles swapping DMX start/end if the given start/end value is inverted (i.e. decreasing).
 * @param {Capability} capability The capability to use as data source.
 * @param {number|null} startValue The start value of an start/end entity, e.g. speedStart. Unit can be freely chosen. Omit if minval/maxval should not be added.
 * @param {*|null} endValue The end value of an start/end entity, e.g. speedEnd. Unit can be freely chosen. Omit if minval/maxval should not be added.
 * @returns {XMLElement} A <step> or <range> with mindmx, maxdmx and, optionally, minval and maxval attributes.
 */
function getBaseXmlCapability(capability, startValue = null, endValue = null) {
  const dmxRange = capability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);
  let [dmxStart, dmxEnd] = [dmxRange.start, dmxRange.end];

  if (startValue !== null && startValue > endValue) {
    [startValue, endValue] = [endValue, startValue];
    [dmxStart, dmxEnd] = [dmxEnd, dmxStart];
  }

  const xmlCapability = xmlbuilder.create(capability.isStep ? `step` : `range`);
  xmlCapability.attribute(`mindmx`, dmxStart);
  xmlCapability.attribute(`maxdmx`, dmxEnd);

  if (startValue !== null) {
    if (startValue === endValue) {
      xmlCapability.attribute(`val`, Number.parseFloat(startValue.toFixed(3)));
    }
    else {
      xmlCapability.attribute(`minval`, Number.parseFloat(startValue.toFixed(3)));
      xmlCapability.attribute(`maxval`, Number.parseFloat(endValue.toFixed(3)));
    }
  }

  return xmlCapability;
}

/**
 * @param {DmxControlCapability} capability The DMX control capability; i.e. speed is in Hz.
 * @returns {XMLElement} A capability xml element with the proper stop/cw/ccw type
 */
function getRotationSpeedXmlCapability(capability) {
  if (capability.startValue === 0 && capability.endValue === 0) {
    const xmlStep = getBaseXmlCapability(capability.capObject);
    xmlStep.attribute(`type`, `stop`);
    return xmlStep;
  }

  const xmlRange = getBaseXmlCapability(capability.capObject, Math.abs(capability.startValue), Math.abs(capability.endValue));
  xmlRange.attribute(`type`, (capability.startValue >= 0 && capability.endValue >= 0) ? `cw` : `ccw`);
  return xmlRange;
}

/**
 * @param {Array} array1 First array to compare.
 * @param {Array} array2 Second array to compare.
 * @returns {boolean} Whether both arrays have equal size and their items do strictly equal.
 */
function arraysEqual(array1, array2) {
  if (array1 === array2) {
    return true;
  }

  if (!Array.isArray(array1) || !Array.isArray(array2)) {
    return false;
  }

  return array1.length === array2.length && array1.every(
    (item, index) => item === array2[index],
  );
}
