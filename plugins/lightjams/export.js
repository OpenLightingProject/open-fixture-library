import { v4 as uuidv4 } from 'uuid';
import xmlbuilder from 'xmlbuilder';

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */
/** @typedef {import('../../lib/model/Mode.js').default} Mode */

export const version = `0.1.0`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  const outFiles = [];

  for (const fixture of fixtures) {
    // Lightjams exports one file per fixture
    const xml = xmlbuilder.create(
      { fixture: {} },
      {
        version: `1.0`,
        encoding: `UTF-8`,
        standalone: true,
      },
    );

    const xmlFixture = xml.root();
    // Add fixture metadata
    xmlFixture.element(`Id`, uuidv4());
    xmlFixture.element(`Name`, fixture.name);
    xmlFixture.element(`Manufacturer`, fixture.manufacturer.name);
    xmlFixture.element(`CanOpenInEditor`, `True`);
    xmlFixture.element(`version`, `1.00`);
    xmlFixture.element(`revision`, `1`);

    // Add modes
    const xmlModes = xmlFixture.element(`Modes`);

    for (const mode of fixture.modes) {
      addMode(xmlModes, mode, fixture);
    }

    const fixtureFilename = `${fixture.manufacturer.key}_${fixture.key}.xml`;

    outFiles.push({
      name: fixtureFilename,
      content: xml.end({
        pretty: true,
        indent: `  `,
      }),
      mimetype: `application/xml`,
      fixtures: [fixture],
    });
  }

  return outFiles;
}

/**
 * Add a mode to the Lightjams XML
 * @param {object} xmlModes The xmlbuilder Modes element
 * @param {Mode} mode The OFL mode object
 * @param {Fixture} fixture The OFL fixture object
 */
function addMode(xmlModes, mode, fixture) {
  const xmlMode = xmlModes.element(`mode`, {
    id: uuidv4(),
    name: mode.shortName || mode.name,
    description: mode.name === mode.shortName ? `` : mode.name,
  });

  const xmlCapabilities = xmlMode.element(`capabilities`);
  const xmlActions = xmlMode.element(`actions`);

  // Group channels by capability type
  const channelGroups = groupChannelsByCapability(mode, fixture);

  // Add capabilities
  for (const group of channelGroups) {
    addCapability(xmlCapabilities, group);
  }

  // Add standard actions
  addActions(xmlActions, mode.channels.length);
}

/**
 * Group channels by their capability type for Lightjams format
 * @param {Mode} mode The OFL mode object
 * @param {Fixture} fixture The OFL fixture object
 * @returns {object[]} Array of channel groups
 */
function groupChannelsByCapability(mode, fixture) {
  const groups = [];
  let channelIndex = 0;

  while (channelIndex < mode.channels.length) {
    const channel = mode.channels[channelIndex];

    if (!channel) {
      channelIndex++;
      continue;
    }

    // Get the main capability type
    const capability = channel.capabilities?.[0];

    if (!capability) {
      // No capability, treat as Fixed
      groups.push({
        type: `Fixed`,
        precision: 1,
        value: 0,
        name: channel.name,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    const capabilityType = capability.type;

    // Handle color mixing
    if (capabilityType === `ColorIntensity`) {
      const colorGroup = detectColorMixingGroup(mode, fixture, channelIndex);
      if (colorGroup) {
        groups.push(colorGroup);
        channelIndex += colorGroup.channelCount;
        continue;
      }
    }

    // Handle Pan/Tilt with precision
    if (capabilityType === `Pan` || capabilityType === `Tilt`) {
      const precision = getPrecision(mode, channelIndex);
      groups.push({
        type: capabilityType,
        precision,
        byteOrder: `msb`,
        max: capability.angleEnd?.number || 360,
        default: capability.angleEnd?.number ? capability.angleEnd.number / 2 : 180,
        channelCount: precision,
      });
      channelIndex += precision;
      continue;
    }

    // Handle Intensity (Dimmer)
    if (capabilityType === `Intensity`) {
      const precision = getPrecision(mode, channelIndex);
      groups.push({
        type: `Dimmer`,
        precision,
        name: channel.name === `Dimmer` ? undefined : channel.name,
        channelCount: precision,
      });
      channelIndex += precision;
      continue;
    }

    // Handle ShutterStrobe
    if (capabilityType === `ShutterStrobe`) {
      groups.push({
        type: `Shutter`,
        precision: 1,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle color wheel
    if (capabilityType === `ColorPreset` || capabilityType === `WheelSlot`) {
      const wheelName = capability.wheel?.name || channel.name;
      if (wheelName?.toLowerCase().includes(`gobo`)) {
        groups.push({
          type: `Gobo`,
          precision: 1,
          channelCount: 1,
        });
      }
      else {
        groups.push({
          type: `Color`,
          precision: 1,
          name: channel.name === `Color` ? undefined : channel.name,
          channelCount: 1,
        });
      }
      channelIndex++;
      continue;
    }

    // Handle gobo rotation
    if (capabilityType === `WheelSlotRotation` || capabilityType === `WheelRotation`) {
      groups.push({
        type: `GoboRot`,
        precision: 1,
        name: channel.name,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle Zoom
    if (capabilityType === `Zoom`) {
      groups.push({
        type: `Zoom`,
        precision: 1,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle Focus
    if (capabilityType === `Focus`) {
      groups.push({
        type: `Focus`,
        precision: 1,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle Prism
    if (capabilityType === `Prism`) {
      groups.push({
        type: `Prism`,
        precision: 1,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle Iris
    if (capabilityType === `Iris`) {
      groups.push({
        type: `Iris`,
        precision: 1,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle Frost
    if (capabilityType === `Frost`) {
      groups.push({
        type: `Frost`,
        precision: 1,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Handle Effect
    if (capabilityType === `Effect`) {
      groups.push({
        type: `Effect`,
        precision: 1,
        name: capability.effectName || channel.name,
        channelCount: 1,
      });
      channelIndex++;
      continue;
    }

    // Default: treat as Fixed
    groups.push({
      type: `Fixed`,
      precision: 1,
      value: channel.defaultValue || 0,
      name: channel.name,
      channelCount: 1,
    });
    channelIndex++;
  }

  return groups;
}

/**
 * Detect color mixing group (RGB, RGBW, etc.)
 * @param {Mode} mode The OFL mode object
 * @param {Fixture} fixture The OFL fixture object
 * @param {number} startIndex Starting channel index
 * @returns {object | null} Color group or null if not detected
 */
function detectColorMixingGroup(mode, fixture, startIndex) {
  const colors = [];
  let channelIndex = startIndex;

  // Try to detect consecutive color channels
  while (channelIndex < mode.channels.length && colors.length < 6) {
    const channel = mode.channels[channelIndex];

    if (!channel || !channel.capabilities?.[0]) {
      break;
    }

    const capability = channel.capabilities[0];
    if (capability.type !== `ColorIntensity`) {
      break;
    }

    const color = capability.color;
    if (!color) {
      break;
    }

    // Map color names to letters
    const colorLetter = getColorLetter(color);
    if (!colorLetter) {
      break;
    }

    colors.push(colorLetter);
    channelIndex++;
  }

  // Check if we have a valid color mixing group
  if (colors.length >= 3) {
    const colorType = colors.join(``);

    // Check if it's a known color mixing type
    const knownTypes = [`RGB`, `RGBA`, `RGBW`, `RGBAW`, `CMY`, `CYM`, `GRBW`, `GRB`, `GBR`, `RBG`, `BRG`, `BGR`];

    if (knownTypes.includes(colorType)) {
      return {
        type: colorType,
        precision: 1,
        channelCount: colors.length,
      };
    }

    // Default to RGB-like naming
    return {
      type: `RGB${colors.slice(3).join(``)}`,
      precision: 1,
      channelCount: colors.length,
    };
  }

  return null;
}

/**
 * Get color letter from color name
 * @param {string} colorName Color name
 * @returns {string | null} Color letter or null
 */
function getColorLetter(colorName) {
  const colorMap = {
    Red: `R`,
    Green: `G`,
    Blue: `B`,
    White: `W`,
    Amber: `A`,
    Cyan: `C`,
    Magenta: `M`,
    Yellow: `Y`,
  };
  return colorMap[colorName] || null;
}

/**
 * Get precision (number of bytes) for a channel
 * @param {Mode} mode The OFL mode object
 * @param {number} channelIndex Starting channel index
 * @returns {number} Precision (1 or 2)
 */
function getPrecision(mode, channelIndex) {
  // Check if next channel is a fine channel
  if (channelIndex + 1 < mode.channels.length) {
    const currentChannel = mode.channels[channelIndex];
    const nextChannel = mode.channels[channelIndex + 1];
    
    const currentKey = currentChannel.key;
    const nextKey = nextChannel.key;

    if (nextKey === `${currentKey} fine` || nextKey.startsWith(`${currentKey} fine`)) {
      return 2;
    }
  }

  return 1;
}

/**
 * Add a capability element to the XML
 * @param {object} xmlCapabilities The xmlbuilder capabilities element
 * @param {object} group Channel group object
 */
function addCapability(xmlCapabilities, group) {
  const attributes = {
    precision: String(group.precision),
  };

  // Add type-specific attributes
  if (group.byteOrder) {
    attributes.byteOrder = group.byteOrder;
  }

  if (group.max !== undefined) {
    attributes.max = String(group.max);
  }

  if (group.default !== undefined) {
    attributes.default = String(group.default);
  }

  if (group.value !== undefined) {
    attributes.value = String(Math.round((group.value / 255) * 100));
  }

  if (group.name) {
    attributes.name = group.name;
  }

  xmlCapabilities.element(group.type, attributes);
}

/**
 * Add standard actions to the mode
 * @param {object} xmlActions The xmlbuilder actions element
 * @param {number} channelCount Total number of channels in mode
 */
function addActions(xmlActions, channelCount) {
  // Add Locate action
  const xmlLocate = xmlActions.element(`action`, {
    name: `Locate`,
    duration: `-1`,
  });
  const xmlLocateChannels = xmlLocate.element(`channels`, {
    nbChannels: String(channelCount),
  });

  // Set all channels to 100% for locate (simplified)
  for (let index = 0; index < Math.min(channelCount, 20); index++) {
    xmlLocateChannels.element(`channel`, {
      offset: String(index),
      percent: `100`,
    });
  }

  // Add Lamp on action
  const xmlLampOn = xmlActions.element(`action`, {
    name: `Lamp on`,
    duration: `2`,
  });
  xmlLampOn.element(`channels`, {
    nbChannels: String(channelCount),
  });

  // Add Lamp off action
  const xmlLampOff = xmlActions.element(`action`, {
    name: `Lamp off`,
    duration: `6`,
  });
  xmlLampOff.element(`channels`, {
    nbChannels: String(channelCount),
  });

  // Add Reset action
  const xmlReset = xmlActions.element(`action`, {
    name: `Reset`,
    duration: `6`,
  });
  xmlReset.element(`channels`, {
    nbChannels: String(channelCount),
  });
}
