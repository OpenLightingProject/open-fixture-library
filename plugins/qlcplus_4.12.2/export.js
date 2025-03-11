import sanitize from 'sanitize-filename';
import xmlbuilder from 'xmlbuilder';

/** @typedef {import('../../lib/model/AbstractChannel.js').default} AbstractChannel */
import Capability from '../../lib/model/Capability.js';
import CoarseChannel from '../../lib/model/CoarseChannel.js';
/** @typedef {import('../../lib/model/FineChannel.js').default} FineChannel */
/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */
import Physical from '../../lib/model/Physical.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

import {
  exportHelpers,
  getCapabilityPreset,
  getChannelPreset,
  getFineChannelPreset,
} from './presets.js';

export const version = `1.3.1`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const customGobos = {};

  const outFiles = await Promise.all(fixtures.map(async fixture => {
    try {
      return await getFixtureFile(fixture, options, customGobos);
    }
    catch (error) {
      throw new Error(`Exporting fixture ${fixture.manufacturer.key}/${fixture.key} failed: ${error}`, {
        cause: error,
      });
    }
  }));

  // add gobo images not included in QLC+ to exported files
  for (const [qlcplusResourceName, oflResource] of Object.entries(customGobos)) {
    const fileContent = (oflResource.imageEncoding === `base64`)
      ? Buffer.from(oflResource.imageData, `base64`)
      : oflResource.imageData;

    outFiles.push({
      name: `gobos/${qlcplusResourceName}`,
      content: fileContent,
      mimeType: oflResource.imageMimeType,
    });
  }

  return outFiles;
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @param {object} customGobos An object where gobo resources not included in QLC+ can be added to.
 * @returns {Promise<object>} The generated fixture file.
 */
async function getFixtureFile(fixture, options, customGobos) {
  const xml = xmlbuilder.begin()
    .declaration(`1.0`, `UTF-8`)
    .element({
      FixtureDefinition: {
        '@xmlns': `http://www.qlcplus.org/FixtureDefinition`,
        Creator: {
          Name: `OFL – ${fixture.url}`,
          Version: options.displayedPluginVersion || version,
          Author: fixture.meta.authors.join(`, `),
        },
        Manufacturer: fixture.manufacturer.name,
        Model: fixture.name,
        Type: getFixtureType(fixture),
      },
    });

  for (const channel of fixture.coarseChannels) {
    await addChannel(xml, channel, customGobos);
  }

  const panMax = getPanTiltMax(`Pan`, fixture.coarseChannels);
  const tiltMax = getPanTiltMax(`Tilt`, fixture.coarseChannels);
  const useGlobalPhysical = fixture.modes.every(mode => {
    if (mode.physicalOverride !== null) {
      return false;
    }

    const modePanMax = getPanTiltMax(`Pan`, mode.channels);
    const modeTiltMax = getPanTiltMax(`Tilt`, mode.channels);
    return (modePanMax === 0 || panMax === modePanMax) && (modeTiltMax === 0 || tiltMax === modeTiltMax);
  });

  for (const mode of fixture.modes) {
    addMode(xml, mode, !useGlobalPhysical);
  }

  if (useGlobalPhysical) {
    addPhysical(xml, fixture.physical || new Physical({}), fixture);
  }

  xml.dtd(``);

  const sanitizedFileName = sanitize(`${fixture.manufacturer.name}-${fixture.name}.qxf`).replaceAll(/\s+/g, `-`);

  return {
    name: `fixtures/${sanitizedFileName}`,
    content: xml.end({
      pretty: true,
      indent: ` `,
    }),
    mimetype: `application/x-qlc-fixture`,
  };
}

/**
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {CoarseChannel} channel The OFL channel object.
 * @param {object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
async function addChannel(xml, channel, customGobos) {
  const channelType = getChannelType(channel.type);

  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName,
    },
  });

  if (channel.defaultValue !== 0) {
    xmlChannel.attribute(`Default`, channel.getDefaultValueWithResolution(CoarseChannel.RESOLUTION_8BIT));
  }

  const channelPreset = getChannelPreset(channel);
  if (channelPreset === null) {
    xmlChannel.element({
      Group: {
        '@Byte': 0,
        '#text': channelType,
      },
    });

    if (channelType === `Intensity`) {
      xmlChannel.element({
        Colour: channel.color === null ? `Generic` : channel.color.replace(/^(?:Warm|Cold) /, ``),
      });
    }

    for (const capability of channel.capabilities) {
      await addCapability(xmlChannel, capability, customGobos);
    }
  }
  else {
    xmlChannel.attribute(`Preset`, channelPreset);
  }

  for (const fineChannel of channel.fineChannels) {
    await addFineChannel(xml, fineChannel, customGobos);
  }
}

/**
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {FineChannel} fineChannel The OFL fine channel object.
 * @param {object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
async function addFineChannel(xml, fineChannel, customGobos) {
  if (!fineChannel.fixture.allChannels.includes(fineChannel)) {
    return;
  }

  const xmlFineChannel = xml.element({
    Channel: {
      '@Name': fineChannel.uniqueName,
    },
  });

  if (fineChannel.defaultValue !== 0) {
    xmlFineChannel.attribute(`Default`, fineChannel.defaultValue);
  }

  if (fineChannel.resolution > CoarseChannel.RESOLUTION_16BIT) {
    // QLC+ does not support 24+ bit channels, so let's fake one
    xmlFineChannel.element({
      Group: {
        '@Byte': 0, // not a QLC+ fine channel
        '#text': `Maintenance`,
      },
    });

    await addCapability(xmlFineChannel, new Capability({
      dmxRange: [0, 255],
      type: `Generic`,
      comment: `Fine^${fineChannel.resolution - 1} adjustment for ${fineChannel.coarseChannel.uniqueName}`,
    }, CoarseChannel.RESOLUTION_8BIT, fineChannel.coarseChannel), customGobos);

    return;
  }

  const fineChannelPreset = getFineChannelPreset(fineChannel);
  if (fineChannelPreset !== null) {
    xmlFineChannel.attribute(`Preset`, fineChannelPreset);

    return;
  }

  const channelType = getChannelType(fineChannel.coarseChannel.type);

  xmlFineChannel.element({
    Group: {
      '@Byte': 1,
      '#text': channelType,
    },
  });

  if (channelType === `Intensity`) {
    xmlFineChannel.element({
      Colour: fineChannel.coarseChannel.color === null ? `Generic` : fineChannel.coarseChannel.color.replace(/^(?:Warm|Cold) /, ``),
    });
  }

  await addCapability(xmlFineChannel, new Capability({
    dmxRange: [0, 255],
    type: `Generic`,
    comment: `Fine adjustment for ${fineChannel.coarseChannel.uniqueName}`,
  }, CoarseChannel.RESOLUTION_8BIT, fineChannel.coarseChannel));
}

/**
 * @param {object} xmlChannel The xmlbuilder <Channel> object.
 * @param {Capability} capability The OFL capability object.
 * @param {object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
async function addCapability(xmlChannel, capability, customGobos) {
  const dmxRange = capability.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);

  const xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': dmxRange.start,
      '@Max': dmxRange.end,
      '#text': capability.name,
    },
  });

  const preset = addCapabilityAliases(xmlCapability, capability) ? {
    presetName: `Alias`,
    res1: null,
    res2: null,
  } : await getCapabilityPreset(capability);

  if (preset === null) {
    await addCapabilityLegacyAttributes(xmlCapability, capability, customGobos);
  }
  else {
    xmlCapability.attribute(`Preset`, preset.presetName);

    if (preset.res1 !== null) {
      xmlCapability.attribute(`Res1`, preset.res1);

      if (`${preset.res1}`.startsWith(`ofl/`)) {
        customGobos[preset.res1] = capability.wheelSlot[0].resource;
      }
    }

    if (preset.res2 !== null) {
      xmlCapability.attribute(`Res2`, preset.res2);
    }
  }
}

/**
 * @param {object} xmlCapability The xmlbuilder <Capability> object.
 * @param {Capability} capability The OFL capability object.
 * @param {object} customGobos An object where gobo resources not included in QLC+ can be added to.
 */
async function addCapabilityLegacyAttributes(xmlCapability, capability, customGobos) {
  if (capability.colors !== null && capability.colors.allColors.length <= 2) {
    xmlCapability.attribute(`Color`, capability.colors.allColors[0]);

    if (capability.colors.allColors.length > 1) {
      xmlCapability.attribute(`Color2`, capability.colors.allColors[1]);
    }
  }

  const goboResource = await exportHelpers.getGoboResource(capability);
  if (goboResource) {
    xmlCapability.attribute(`Res`, goboResource);

    if (goboResource.startsWith(`ofl/`)) {
      customGobos[goboResource] = capability.wheelSlot[0].resource;
    }
  }
}

/**
 * @param {object} xmlCapability The xmlbuilder <Capability> object.
 * @param {Capability} capability The OFL capability object.
 * @returns {boolean} True when one or more <Alias> elements were added to the capability, false otherwise.
 */
function addCapabilityAliases(xmlCapability, capability) {
  const fixture = capability._channel.fixture;

  let aliasAdded = false;
  for (const alias of Object.keys(capability.switchChannels)) {
    const switchingChannel = fixture.getChannelByKey(alias);
    const defaultChannel = switchingChannel.defaultChannel;
    const switchedChannel = fixture.getChannelByKey(capability.switchChannels[alias]);

    if (defaultChannel === switchedChannel) {
      continue;
    }

    const modesContainingSwitchingChannel = fixture.modes.filter(
      mode => mode.getChannelIndex(switchingChannel.key) !== -1,
    );

    for (const mode of modesContainingSwitchingChannel) {
      aliasAdded = true;
      xmlCapability.element({
        Alias: {
          '@Mode': mode.name,
          '@Channel': defaultChannel.uniqueName,
          '@With': switchedChannel.uniqueName,
        },
      });
    }
  }

  return aliasAdded;
}

/**
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {Mode} mode The OFL mode object.
 * @param {boolean} createPhysical Whether to add a Physical XML element to the mode.
 */
function addMode(xml, mode, createPhysical) {
  const xmlMode = xml.element({
    Mode: {
      '@Name': mode.name,
    },
  });

  if (createPhysical) {
    addPhysical(xmlMode, mode.physical || new Physical({}), mode.fixture, mode);
  }

  for (const [index, channel] of mode.channels.entries()) {
    const uniqueName = channel instanceof SwitchingChannel
      ? channel.defaultChannel.uniqueName
      : channel.uniqueName;

    xmlMode.element({
      Channel: {
        '@Number': index,
        '#text': uniqueName,
      },
    });
  }

  if (mode.fixture.matrix !== null) {
    addHeads(xmlMode, mode);
  }
}

/**
 * @param {object} xmlParentNode The xmlbuilder object where <Physical> should be added (<FixtureDefinition> or <Mode>).
 * @param {Physical} physical The OFL physical object.
 * @param {Fixture} fixture The OFL fixture object.
 * @param {Mode | null} mode The OFL mode object this physical data section belongs to. Only provide this if panMax and tiltMax should be read from this mode's Pan / Tilt channels, otherwise they are read from all channels.
 */
function addPhysical(xmlParentNode, physical, fixture, mode) {
  const panMax = getPanTiltMax(`Pan`, mode?.channels ?? fixture.coarseChannels);
  const tiltMax = getPanTiltMax(`Tilt`, mode?.channels ?? fixture.coarseChannels);

  if (Object.keys(physical.jsonObject).length === 0 && panMax === 0 && tiltMax === 0) {
    // empty physical data
    return;
  }

  const physicalSections = {
    Bulb: () => ({
      Type: physical.bulbType || `Other`,
      Lumens: Math.round(physical.bulbLumens) || 0,
      ColourTemperature: Math.round(physical.bulbColorTemperature) || 0,
    }),
    Dimensions: () => ({
      Weight: physical.weight || 0,
      Width: Math.round(physical.width) || 0,
      Height: Math.round(physical.height) || 0,
      Depth: Math.round(physical.depth) || 0,
    }),
    Lens: () => ({
      Name: physical.lensName || `Other`,
      DegreesMin: physical.lensDegreesMin || 0,
      DegreesMax: physical.lensDegreesMax || 0,
    }),
    Focus: () => {
      const focusTypeConditions = {
        Mirror: fixture.categories.includes(`Scanner`),
        Barrel: fixture.categories.includes(`Barrel Scanner`),
        Head: fixture.categories.includes(`Moving Head`) || panMax > 0 || tiltMax > 0,
        Fixed: true,
      };
      const focusType = Object.keys(focusTypeConditions).find(type => focusTypeConditions[type] === true);

      return {
        Type: focusType,
        PanMax: panMax,
        TiltMax: tiltMax,
      };
    },
    Layout: () => {
      if (fixture.matrix === null) {
        return undefined;
      }

      return {
        Width: fixture.matrix.pixelCountX,
        Height: fixture.matrix.pixelCountY * fixture.matrix.pixelCountZ,
      };
    },
    Technical: () => {
      if (physical.DMXconnector === null && physical.power === null) {
        return undefined;
      }

      // add whitespace
      let connector = physical.DMXconnector;

      switch (connector) {
        case `3.5mm stereo jack`: {
          connector = `3.5 mm stereo jack`;
          break;
        }
        case `3-pin XLR IP65`: {
          connector = `3-pin IP65`;
          break;
        }
        case `5-pin XLR IP65`: {
          connector = `5-pin IP65`;
          break;
        }
        case `RJ45`: {
          connector = `Other`;
          break;
        }
      }

      return {
        DmxConnector: connector || `Other`,
        PowerConsumption: Math.round(physical.power) || 0,
      };
    },
  };

  const physicalSectionProperties = Object.entries(physicalSections)
    .map(([name, getProperties]) => [name, getProperties()])
    .filter(([name, properties]) => properties !== undefined);

  const xmlPhysical = xmlParentNode.element(`Physical`);
  for (const [name, properties] of physicalSectionProperties) {
    xmlPhysical.element(name, properties);
  }
}

/**
 * @param {'Pan' | 'Tilt'} panOrTilt Whether to return pan max or tilt max.
 * @param {CoarseChannel[]} channels The channels in which to look for pan/tilt angles, e.g. all mode channels.
 * @returns {number} The maximum pan/tilt range in the given channels, i.e. highest angle - lowest angle. If only continous pan/tilt is used, the return value is 9999. Defaults to 0.
 */
function getPanTiltMax(panOrTilt, channels) {
  const capabilities = channels.flatMap(channel => channel.capabilities || []);

  const panTiltCapabilities = capabilities.filter(capability => capability.type === panOrTilt && capability.angle[0].unit === `deg`);
  const minAngle = Math.min(...panTiltCapabilities.map(capability => Math.min(capability.angle[0].number, capability.angle[1].number)));
  const maxAngle = Math.max(...panTiltCapabilities.map(capability => Math.max(capability.angle[0].number, capability.angle[1].number)));
  const panTiltMax = maxAngle - minAngle;

  if (panTiltMax === Number.NEGATIVE_INFINITY) {
    const hasContinuousCapability = capabilities.some(capability => capability.type === `${panOrTilt}Continuous`);
    if (hasContinuousCapability) {
      return 9999;
    }

    return 0;
  }

  return Math.round(panTiltMax);
}

/**
 * Adds Head tags for all used pixels in the given mode, ordered by XYZ direction (pixel groups by appearance in JSON).
 * @param {XMLElement} xmlMode The Mode tag to which the Head tags should be added
 * @param {Mode} mode The fixture's mode whose pixels should be determined.
 */
function addHeads(xmlMode, mode) {
  const hasMatrixChannels = mode.channels.some(
    channel => channel.pixelKey !== null || (channel instanceof SwitchingChannel && channel.defaultChannel.pixelKey !== null),
  );

  if (hasMatrixChannels) {
    const pixelKeys = mode.fixture.matrix.getPixelKeysByOrder(`X`, `Y`, `Z`);
    for (const pixelKey of pixelKeys) {
      const channels = mode.channels.filter(channel => controlsPixelKey(channel, pixelKey));
      const xmlHead = xmlMode.element(`Head`);

      for (const channel of channels) {
        xmlHead.element({
          Channel: mode.getChannelIndex(channel.key),
        });
      }
    }
  }

  /**
   * @param {AbstractChannel} channel A channel from a mode's channel list.
   * @param {string} pixelKey The pixel to check for.
   * @returns {boolean} Whether the given channel controls the given pixel key, either directly or as part of a pixel group.
   */
  function controlsPixelKey(channel, pixelKey) {
    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;
    }

    if (channel.pixelKey !== null) {
      if (mode.fixture.matrix.pixelGroupKeys.includes(channel.pixelKey)) {
        return mode.fixture.matrix.pixelGroups[channel.pixelKey].includes(pixelKey);
      }

      return channel.pixelKey === pixelKey;
    }

    return false;
  }
}

/**
 * Determines the QLC+ fixture type out of the fixture's categories.
 * @param {Fixture} fixture The Fixture instance whose QLC+ type has to be determined.
 * @returns {string} The first of the fixture's categories that is supported by QLC+, defaults to 'Other'.
 */
function getFixtureType(fixture) {
  const replaceCategories = {
    'Barrel Scanner': `Scanner`,

    // see https://github.com/OpenLightingProject/open-fixture-library/issues/581
    'Pixel Bar': isBeamBar() ? `LED Bar (Beams)` : `LED Bar (Pixels)`,
  };
  const ignoredCategories = new Set([`Blinder`, `Matrix`, `Stand`]);

  return fixture.categories.map(
    category => replaceCategories[category] ?? category,
  ).find(
    category => !ignoredCategories.has(category),
  ) || `Other`;


  /**
   * @returns {boolean} True if there are individual beams (or it can not be determined), false if the pixels' colors blend into each other.
   */
  function isBeamBar() {
    if (!fixture.physical || !fixture.physical.matrixPixelsSpacing) {
      return true;
    }

    return fixture.physical.matrixPixelsSpacing.some(spacing => spacing !== 0);
  }
}

/**
 * Converts a channel's type into a valid QLC+ channel type.
 * @param {string} type Our own OFL channel type.
 * @returns {string} The corresponding QLC+ channel type.
 */
function getChannelType(type) {
  const qlcplusChannelTypes = {
    Intensity: [`Intensity`, `Single Color`],
    Colour: [`Multi-Color`],
    Pan: [`Pan`],
    Tilt: [`Tilt`],
    Beam: [`Focus`, `Zoom`, `Iris`, `Color Temperature`],
    Gobo: [`Gobo`],
    Prism: [`Prism`],
    Shutter: [`Shutter`, `Strobe`],
    Speed: [`Speed`],
    Effect: [`Effect`, `Fog`],
    Maintenance: [`Maintenance`],
    Nothing: [`NoFunction`],
  };

  for (const qlcplusType of Object.keys(qlcplusChannelTypes)) {
    if (qlcplusChannelTypes[qlcplusType].includes(type)) {
      return qlcplusType;
    }
  }
  return `Effect`; // default if new types are added to OFL
}
