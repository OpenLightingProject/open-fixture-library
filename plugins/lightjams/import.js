import xml2js from 'xml2js';

export const version = `0.1.0`;

// Supported color mixing types in Lightjams
const KNOWN_COLOR_MIXING_TYPES = [`RGB`, `RGBA`, `RGBW`, `RGBAW`, `CMY`, `CYM`, `GRBW`, `GRB`, `GBR`, `RBG`, `BRG`, `BGR`];

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise<object>} A Promise resolving to an out object
 */
export async function importFixtures(buffer, filename, authorName) {
  const timestamp = new Date().toISOString().replace(/T.*/, ``);

  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
  };

  // Parse XML with preserveChildrenOrder to maintain element order
  const parser = new xml2js.Parser({
    preserveChildrenOrder: true,
    explicitChildren: true,
  });

  const xml = await parser.parseStringPromise(buffer.toString());

  if (!xml.fixture) {
    throw new Error(`Not a valid Lightjams fixture file.`);
  }

  const lightjamsFixture = xml.fixture;
  // Extract manufacturer
  const manufacturerName = getString(lightjamsFixture.Manufacturer);
  const manufacturerKey = slugify(manufacturerName);

  out.manufacturers[manufacturerKey] = {
    name: manufacturerName,
  };

  // Extract fixture info
  const fixtureName = getString(lightjamsFixture.Name);
  const fixtureKey = `${manufacturerKey}/${slugify(fixtureName)}`;

  out.warnings[fixtureKey] = [];

  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
    name: fixtureName,
  };

  // Add categories - we'll need to guess based on capabilities
  fixture.categories = [`Other`];
  out.warnings[fixtureKey].push(`Please specify categories.`);

  // Add metadata
  fixture.meta = {
    authors: [authorName],
    createDate: timestamp,
    lastModifyDate: timestamp,
    importPlugin: {
      plugin: `lightjams`,
      date: timestamp,
      comment: `Lightjams fixture version ${getString(lightjamsFixture.version) || `1.00`}, revision ${getString(lightjamsFixture.revision) || `1`}, imported by Lightjams plugin version ${version}`,
    },
  };

  // Process modes
  const modes = lightjamsFixture.Modes?.[0]?.mode || [];
  if (modes.length === 0) {
    throw new Error(`No modes found in fixture.`);
  }

  fixture.availableChannels = {};
  fixture.modes = [];

  for (const lightjamsMode of modes) {
    const mode = {
      name: lightjamsMode.$.name || `Mode`,
    };

    if (lightjamsMode.$.description) {
      mode.shortName = lightjamsMode.$.description;
    }

    // Process capabilities in the order they appear in the XML
    // Using the $$ array which preserves child element order
    const capabilities = lightjamsMode.capabilities?.[0];
    const channelList = [];
    let channelOffset = 0;

    if (capabilities?.$$) {
      for (const capabilityElement of capabilities.$$) {
        const capabilityType = capabilityElement['#name'];
        const element = capabilityElement;

        const channels = processCapability(
          capabilityType,
          element,
          channelOffset,
          fixture.availableChannels,
          out.warnings[fixtureKey],
        );

        channelList.push(...channels);
        channelOffset += channels.length;
      }
    }

    mode.channels = channelList;
    fixture.modes.push(mode);
  }

  // Clean up empty fineChannelAliases arrays
  for (const channelKey of Object.keys(fixture.availableChannels)) {
    const channel = fixture.availableChannels[channelKey];
    if (channel.fineChannelAliases && channel.fineChannelAliases.length === 0) {
      delete channel.fineChannelAliases;
    }
  }

  out.fixtures[fixtureKey] = fixture;

  return out;
}

/**
 * Process a Lightjams capability element and create OFL channel(s)
 * @param {string} capabilityType The type of capability (RGB, Pan, Tilt, etc.)
 * @param {object} element The capability XML element
 * @param {number} startOffset Starting channel offset
 * @param {object} availableChannels The fixture's availableChannels object
 * @param {object[]} warnings Array to add warnings to
 * @returns {string[]} Array of channel keys added
 */
function processCapability(capabilityType, element, startOffset, availableChannels, warnings) {
  const precision = Number.parseInt(element.$.precision || `1`, 10);
  const channels = [];

  // Handle color mixing capabilities
  if (KNOWN_COLOR_MIXING_TYPES.includes(capabilityType)) {
    for (const color of capabilityType.split(``)) {
      const channelKey = getColorName(color);

      if (!(channelKey in availableChannels)) {
        availableChannels[channelKey] = {
          fineChannelAliases: [],
          capability: {
            type: `ColorIntensity`,
            color: channelKey,
          },
        };
      }

      for (let byte = 0; byte < precision; byte++) {
        if (byte === 0) {
          channels.push(channelKey);
        }
        else {
          const fineSuffix = byte > 1 ? `^${byte}` : ``;
          const fineChannelKey = `${channelKey} fine${fineSuffix}`;
          channels.push(fineChannelKey);
          // Add fine channel alias to the coarse channel
          availableChannels[channelKey].fineChannelAliases.push(fineChannelKey);
        }
      }
    }
    return channels;
  }

  // Handle Pan/Tilt
  if (capabilityType === `Pan` || capabilityType === `Tilt`) {
    const channelKey = capabilityType;
    const max = Number.parseFloat(element.$.max) || 360;
    const defaultValue = Number.parseFloat(element.$.default) || (max / 2);

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        fineChannelAliases: [],
        defaultValue: Math.round((defaultValue / max) * 255),
        capability: {
          type: capabilityType,
          angleStart: `0deg`,
          angleEnd: `${max}deg`,
        },
      };
    }

    // Add channels - in OFL format, we always list coarse first, then fine
    // The byte order information is preserved in the fixture model's handling
    for (let byte = 0; byte < precision; byte++) {
      if (byte === 0) {
        channels.push(channelKey);
      }
      else {
        const fineSuffix = byte > 1 ? `^${byte}` : ``;
        const fineChannelKey = `${channelKey} fine${fineSuffix}`;
        channels.push(fineChannelKey);
        // Add fine channel alias to the coarse channel
        availableChannels[channelKey].fineChannelAliases.push(fineChannelKey);
      }
    }
    return channels;
  }

  // Handle Dimmer
  if (capabilityType === `Dimmer`) {
    const name = element.$.name || `Dimmer`;
    const channelKey = name;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        fineChannelAliases: [],
        capability: {
          type: `Intensity`,
        },
      };
    }

    for (let byte = 0; byte < precision; byte++) {
      if (byte === 0) {
        channels.push(channelKey);
      }
      else {
        const fineSuffix = byte > 1 ? `^${byte}` : ``;
        const fineChannelKey = `${channelKey} fine${fineSuffix}`;
        channels.push(fineChannelKey);
        // Add fine channel alias to the coarse channel
        availableChannels[channelKey].fineChannelAliases.push(fineChannelKey);
      }
    }
    return channels;
  }

  // Handle Shutter
  if (capabilityType === `Shutter`) {
    const channelKey = `Shutter`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `ShutterStrobe`,
          shutterEffect: `Strobe`,
          helpWanted: `At which DMX values is strobe disabled? When is the lamp constantly on/off?`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Color wheel
  if (capabilityType === `Color`) {
    const name = element.$.name || `Color`;
    const channelKey = name;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        fineChannelAliases: [],
        capability: {
          type: `ColorPreset`,
          comment: `Color wheel`,
        },
      };
    }

    for (let byte = 0; byte < precision; byte++) {
      if (byte === 0) {
        channels.push(channelKey);
      }
      else {
        const fineSuffix = byte > 1 ? `^${byte}` : ``;
        const fineChannelKey = `${channelKey} fine${fineSuffix}`;
        channels.push(fineChannelKey);
        // Add fine channel alias to the coarse channel
        availableChannels[channelKey].fineChannelAliases.push(fineChannelKey);
      }
    }
    return channels;
  }

  // Handle Gobo
  if (capabilityType === `Gobo`) {
    const channelKey = `Gobo`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `WheelSlot`,
          wheel: `Gobo`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle GoboRot
  if (capabilityType === `GoboRot`) {
    const name = element.$.name || `Gobo Rotation`;
    const channelKey = name;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `WheelSlotRotation`,
          wheel: `Gobo`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Zoom
  if (capabilityType === `Zoom`) {
    const channelKey = `Zoom`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Zoom`,
          angleStart: `narrow`,
          angleEnd: `wide`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Focus
  if (capabilityType === `Focus`) {
    const channelKey = `Focus`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Focus`,
          distanceStart: `near`,
          distanceEnd: `far`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Prism
  if (capabilityType === `Prism`) {
    const channelKey = `Prism`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Prism`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Iris
  if (capabilityType === `Iris`) {
    const channelKey = `Iris`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Iris`,
          openPercentStart: `0%`,
          openPercentEnd: `100%`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Frost
  if (capabilityType === `Frost`) {
    const channelKey = `Frost`;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Frost`,
          frostIntensityStart: `0%`,
          frostIntensityEnd: `100%`,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Effect
  if (capabilityType === `Effect`) {
    const name = element.$.name || `Effect`;
    const channelKey = name;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Effect`,
          effectName: name,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle EffectDimmable
  if (capabilityType === `EffectDimmable`) {
    const name = element.$.name || `Effect`;
    const channelKey = name;

    if (!(channelKey in availableChannels)) {
      availableChannels[channelKey] = {
        capability: {
          type: `Effect`,
          effectName: name,
        },
      };
    }

    channels.push(channelKey);
    return channels;
  }

  // Handle Fixed (unmapped channel)
  if (capabilityType === `Fixed`) {
    const value = Number.parseInt(element.$.value || `0`, 10);
    const name = element.$.name || `Fixed`;

    // Generate a unique channel key for this fixed channel
    const baseKey = name === `Fixed` ? `Fixed ${startOffset}` : name;
    let channelKey = baseKey;
    let counter = 1;

    while (channelKey in availableChannels) {
      channelKey = `${baseKey} ${counter}`;
      counter++;
    }

    availableChannels[channelKey] = {
      defaultValue: Math.round((value / 100) * 255),
      constant: true,
      capability: {
        type: `Generic`,
      },
    };

    channels.push(channelKey);
    return channels;
  }

  // Unknown capability type - add as generic
  warnings.push(`Unknown capability type: ${capabilityType}`);
  const channelKey = `${capabilityType} ${startOffset}`;

  if (!(channelKey in availableChannels)) {
    availableChannels[channelKey] = {
      capability: {
        type: `Generic`,
      },
    };
  }

  channels.push(channelKey);
  return channels;
}

/**
 * Get full color name from letter
 * @param {string} letter Single letter color code
 * @returns {string} Full color name
 */
function getColorName(letter) {
  const colorNames = {
    R: `Red`,
    G: `Green`,
    B: `Blue`,
    W: `White`,
    A: `Amber`,
    C: `Cyan`,
    M: `Magenta`,
    Y: `Yellow`,
  };
  return colorNames[letter] || letter;
}

/**
 * Get string value from XML element
 * @param {any} element XML element or array
 * @returns {string} String value
 */
function getString(element) {
  if (Array.isArray(element)) {
    return element[0] || ``;
  }
  return element || ``;
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
