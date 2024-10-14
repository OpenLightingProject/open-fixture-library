import colorNameList from 'color-name-list/dist/colornames.esm.mjs';
import xml2js from 'xml2js';

export const version = `0.3.1`;

const colors = {};
for (const color of colorNameList) {
  colors[color.name.toLowerCase().replaceAll(/\s/g, ``)] = color.hex;
}

/**
 * @param {Buffer} buffer The imported file.
 * @param {string} filename The imported file's name.
 * @param {string} authorName The importer's name.
 * @returns {Promise<object, Error>} A Promise resolving to an out object
 */
export async function importFixtures(buffer, filename, authorName) {
  const timestamp = new Date().toISOString().replace(/T.*/, ``);

  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
  };

  const xml = await xml2js.parseStringPromise(buffer.toString());

  if (!(`Library` in xml.Document) || !(`Fixtures` in xml.Document.Library[0]) || !(`Manufacturer` in xml.Document.Library[0].Fixtures[0])) {
    throw new Error(`Nothing to import.`);
  }

  const ecueManufacturers = xml.Document.Library[0].Fixtures[0].Manufacturer || [];
  for (const manufacturer of ecueManufacturers) {
    addManufacturer(manufacturer);
  }

  return out;


  /**
   * Parses the e:cue manufacturer and adds it to `out.manufacturers`.
   * Calls {@link addFixture} for all contained fixtures.
   * @param {object} ecueManufacturer The e:cue manufacturer object.
   */
  function addManufacturer(ecueManufacturer) {
    const manufacturerName = ecueManufacturer.$.Name;
    const manufacturerKey = slugify(manufacturerName);

    out.manufacturers[manufacturerKey] = {
      name: manufacturerName,
    };

    if (ecueManufacturer.$.Comment !== ``) {
      out.manufacturers[manufacturerKey].comment = ecueManufacturer.$.Comment;
    }
    if (ecueManufacturer.$.Web !== ``) {
      out.manufacturers[manufacturerKey].website = ecueManufacturer.$.Web;
    }

    for (const fixture of (ecueManufacturer.Fixture || [])) {
      addFixture(fixture, manufacturerKey);
    }
  }


  /**
   * Parses the e:cue fixture and add it to out.fixtures.
   * @param {object} ecueFixture The e:cue fixture object.
   * @param {string} manufacturerKey The manufacturer key of the fixture.
   */
  function addFixture(ecueFixture, manufacturerKey) {
    const fixture = {
      $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
      name: ecueFixture.$.Name,
    };

    let fixtureKey = `${manufacturerKey}/${slugify(fixture.name)}`;
    if (fixtureKey in out.fixtures) {
      fixtureKey += `-${Math.random().toString(36).slice(2, 7)}`;
      out.warnings[fixtureKey] = [`Fixture key '${fixtureKey}' is not unique, appended random characters.`];
    }
    else {
      out.warnings[fixtureKey] = [];
    }

    if (ecueFixture.$.NameShort !== ``) {
      fixture.shortName = ecueFixture.$.NameShort;
    }

    fixture.categories = [`Other`];
    out.warnings[fixtureKey].push(`Please specify categories.`);

    fixture.meta = {
      authors: [authorName],
      createDate: ecueFixture.$._CreationDate.replace(/#.*/, ``),
      lastModifyDate: ecueFixture.$._ModifiedDate.replace(/#.*/, ``),
      importPlugin: {
        plugin: `ecue`,
        date: timestamp,
      },
    };

    if (ecueFixture.$.Comment !== ``) {
      fixture.comment = ecueFixture.$.Comment;
    }

    const physical = getPhysical(ecueFixture);
    if (JSON.stringify(physical) !== `{}`) {
      fixture.physical = physical;
    }

    fixture.availableChannels = {};

    // ecue does not support modes, so we generate only one
    fixture.modes = [{
      name: `${ecueFixture.$.AllocateDmxChannels}-channel`,
      shortName: `${ecueFixture.$.AllocateDmxChannels}ch`,
      channels: [],
    }];

    for (const ecueChannel of getCombinedEcueChannels(ecueFixture)) {
      addChannelToFixture(ecueChannel, fixture, out.warnings[fixtureKey]);
    }

    out.fixtures[fixtureKey] = fixture;
  }
}

/**
 * @param {object} ecueFixture The e:cue fixture object.
 * @returns {object} The OFL fixture's physical object.
 */
function getPhysical(ecueFixture) {
  const physical = {};

  if (ecueFixture.$.DimWidth !== `10` && ecueFixture.$.DimHeight !== `10` && ecueFixture.$.DimDepth !== `10`) {
    physical.dimensions = [
      Number.parseFloat(ecueFixture.$.DimWidth),
      Number.parseFloat(ecueFixture.$.DimHeight),
      Number.parseFloat(ecueFixture.$.DimDepth),
    ];
  }

  if (ecueFixture.$.Weight !== `0`) {
    physical.weight = Number.parseFloat(ecueFixture.$.Weight);
  }

  if (ecueFixture.$.Power !== `0`) {
    physical.power = Number.parseFloat(ecueFixture.$.Power);
  }

  return physical;
}

/**
 * @param {object} ecueFixture The e:cue fixture object.
 * @returns {object[]} An array of all ecue channel objects.
 */
function getCombinedEcueChannels(ecueFixture) {
  const channels = [];

  const channelTypes = [`ChannelIntensity`, `ChannelColor`, `ChannelBeam`, `ChannelFocus`];
  for (const channelType of channelTypes) {
    if (ecueFixture[channelType]) {
      channels.push(...ecueFixture[channelType].map(channel => {
        // save the channel type in the channel object
        channel._ecueChannelType = channelType;
        return channel;
      }));
    }
  }

  // sort channels by (coarse) DMX channel
  channels.sort((a, b) => Number.parseInt(a.$.DmxByte0, 10) - Number.parseInt(b.$.DmxByte0, 10));

  return channels;
}

/**
 * @param {string | undefined} direction A string containing something like "CW", "CCW", "clockwise", "counter-clockwise".
 * @returns {string} The normalized direction suffix.
 */
function getDirectionSuffix(direction) {
  if (!direction) {
    return ``;
  }

  return /^(?:clockwise|cw),?\s+$/i.test(direction) ? ` CW` : ` CCW`;
}

/**
 * Parses the e:cue channel and adds it to OFL fixture's availableChannels and the first mode.
 * @param {object} ecueChannel The e:cue channel object.
 * @param {object} fixture The OFL fixture object.
 * @param {string[]} warningsArray This fixture's warnings array in the `out` object.
 */
function addChannelToFixture(ecueChannel, fixture, warningsArray) {
  const channel = {};

  const channelName = ecueChannel.$.Name.trim();

  let channelKey = channelName;
  if (channelKey in fixture.availableChannels) {
    warningsArray.push(`Channel key '${channelKey}' is not unique, appended random characters.`);
    channelKey += `-${Math.random().toString(36).slice(2, 7)}`;
    channel.name = channelName;
  }

  let maxDmxValue = 255;
  if (ecueChannel.$.DmxByte1 !== `0`) {
    const shortNameFine = `${channelKey} fine`;
    channel.fineChannelAliases = [shortNameFine];
    maxDmxValue = (256 * 256) - 1;
    fixture.modes[0].channels[Number.parseInt(ecueChannel.$.DmxByte1, 10) - 1] = shortNameFine;
  }

  addDmxValues();

  if (!(`Range` in ecueChannel)) {
    ecueChannel.Range = [{
      $: {
        Start: 0,
        End: maxDmxValue,
        Name: `0-100%`,
        AutoMenu: `1`,
        Centre: `0`,
      },
    }];
  }

  channel.capabilities = ecueChannel.Range.map(
    (ecueRange, index) => getCapability(ecueRange, index),
  );

  if (channel.capabilities.length === 1) {
    channel.capability = channel.capabilities[0];
    delete channel.capabilities;
    delete channel.capability.dmxRange;
  }

  fixture.availableChannels[channelKey] = channel;
  fixture.modes[0].channels[Number.parseInt(ecueChannel.$.DmxByte0, 10) - 1] = channelKey;


  /**
   * Adds DMX value related properties to channel.
   */
  function addDmxValues() {
    if (ecueChannel.$.DefaultValue !== `0`) {
      channel.defaultValue = Number.parseInt(ecueChannel.$.DefaultValue, 10);
    }

    if (ecueChannel.$.Highlight !== `0`) {
      channel.highlightValue = Number.parseInt(ecueChannel.$.Highlight, 10);
    }

    if (ecueChannel.$.Constant === `1`) {
      channel.constant = true;
    }

    if (ecueChannel.$.Precedence === `HTP`) {
      channel.precedence = `HTP`;
    }
  }

  /**
   *
   * @param {any} ecueRange The e:cue range object.
   * @param {any} index The index of the capability / range.
   * @returns {object} The OFL capability object.
   */
  function getCapability(ecueRange, index) {
    const capability = {
      dmxRange: getDmxRange(),
    };

    const capabilityName = ecueRange.$.Name.trim();

    capability.type = getCapabilityType();

    const setPanTiltAngles = () => {
      capability.angleStart = `0%`;
      capability.angleEnd = `100%`;
      capability.comment = capabilityName;
    };

    // capability parsers can rely on the channel type as a first distinctive feature
    const capabilityTypeParsers = {
      ColorIntensity() {
        capability.color = [`Red`, `Green`, `Blue`, `Cyan`, `Magenta`, `Yellow`, `Amber`, `Warm White`, `Cold White`, `White`, `UV`, `Lime`].find(
          color => channelName.toLowerCase().includes(color.toLowerCase()),
        );

        capability.comment = capabilityName;
      },
      WheelSlot() {
        if (ecueChannel._ecueChannelType === `ChannelColor`) {
          const color = capabilityName.toLowerCase().replace(/\bgray\b/, `grey`).replaceAll(/\s/g, ``);
          if (color in colors) {
            capability.colors = [colors[color]];
          }
        }

        capability.comment = getSpeedGuessedComment();

        if (`speedStart` in capability) {
          capability.type = ecueChannel._ecueChannelType === `ChannelColor` ? `WheelRotation` : `WheelSlotRotation`;
        }
      },
      ColorPreset() {
        const color = capabilityName.toLowerCase().replace(/\bgray\b/, `grey`).replaceAll(/\s/g, ``);
        if (color in colors) {
          capability.color = colors[color];
        }

        capability.comment = capabilityName;
      },
      ShutterStrobe() {
        if (/^(?:blackout|(?:shutter )?closed?)$/i.test(capabilityName)) {
          capability.shutterEffect = `Closed`;
          return;
        }

        if (/^(?:(?:shutter )?open|full?)$/i.test(capabilityName)) {
          capability.shutterEffect = `Open`;
          return;
        }

        if (/puls/i.test(capabilityName)) {
          capability.shutterEffect = `Pulse`;
        }
        else if (/ramp\s*up/i.test(capabilityName)) {
          capability.shutterEffect = `RampUp`;
        }
        else if (/ramp\s*down/i.test(capabilityName)) {
          capability.shutterEffect = `RampDown`;
        }
        else {
          capability.shutterEffect = `Strobe`;
        }

        if (/random/i.test(capabilityName)) {
          capability.shutterEffect += `Random`;
        }

        capability.comment = getSpeedGuessedComment();
      },
      Pan: setPanTiltAngles,
      Tilt: setPanTiltAngles,
      Effect() {
        capability.effectName = ``; // set it first here so effectName is before speedStart/speedEnd
        capability.effectName = getSpeedGuessedComment();
      },
      NoFunction() {
        // don't even add a comment
      },
    };

    if (capability.type in capabilityTypeParsers) {
      capabilityTypeParsers[capability.type]();
    }
    else {
      capability.comment = getSpeedGuessedComment();
    }

    // delete unnecessary comments
    if (`comment` in capability && (capability.comment === channelName || /^$|^0%?\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*100%$/.test(capability.comment))) {
      delete capability.comment;
    }

    if (ecueRange.$.AutoMenu !== `1`) {
      capability.menuClick = `hidden`;
    }
    else if (ecueRange.$.Centre !== `0`) {
      capability.menuClick = `center`;
    }

    return capability;


    /**
     * @returns {number[]} The DMX range of this capability.
     */
    function getDmxRange() {
      const dmxRangeStart = Number.parseInt(ecueRange.$.Start, 10);
      let dmxRangeEnd = Number.parseInt(ecueRange.$.End, 10);

      if (dmxRangeEnd === -1) {
        dmxRangeEnd = (index + 1 < ecueChannel.Range.length) ? Number.parseInt(ecueChannel.Range[index + 1].$.Start, 10) - 1 : maxDmxValue;
      }

      return [dmxRangeStart, dmxRangeEnd];
    }

    /**
     * @returns {string} The parsed capability type.
     */
    function getCapabilityType() {
      // capability parsers can rely on the channel type as a first distinctive feature
      const capabilityTypePerChannelType = {
        ChannelColor() {
          if (/\bcto\b|\bctb\b|temperature\b/i.test(channelName)) {
            return `ColorTemperature`;
          }

          if (ecueChannel.Range.length === 1 && !/macro|wheel\b/i.test(channelName)) {
            return `ColorIntensity`;
          }

          if (/wheel\b/i.test(channelName)) {
            return `WheelSlot`;
          }

          return `ColorPreset`;
        },
        ChannelIntensity() {
          // fall back to default
          return capabilityTypePerChannelType.ChannelBeam();
        },
        ChannelFocus() {
          if (/speed/i.test(channelName)) {
            return `PanTiltSpeed`;
          }

          const isPan = channelName.match(/pan/i);
          const isTilt = channelName.match(/tilt/i);

          let panOrTilt = null;
          if (isPan && !isTilt) {
            panOrTilt = `Pan`;
          }
          else if (isTilt && !isPan) {
            panOrTilt = `Tilt`;
          }
          else {
            // fall back to default
            return capabilityTypePerChannelType.ChannelBeam();
          }

          if (/continuous/i.test(channelName)) {
            return `${panOrTilt}Continuous`;
          }

          return panOrTilt;
        },
        ChannelBeam() {
          const capabilityTypeRegexps = {
            NoFunction: /^(?:nothing|no func(?:tion)?|unused|not used|empty|no strobe|no prism|no frost)$/,
            StrobeSpeed: /\bstrobe speed\b/,
            StrobeDuration: /\bstrobe duration\b/,
            ShutterStrobe: /\b(?:shutter|strobe|strb|strob|strobing)\b/,
            Intensity: /\b(?:intensity|dimmer)\b/,
            PanTiltSpeed: /\b(?:pan[ /-]?tilt speed|p[ /-]?t speed)\b/,
            PanContinuous: /\bpan continuous\b/,
            TiltContinuous: /\btilt continuous\b/,
            EffectParameter: /\beffect param(?:eter)?\b/,
            EffectSpeed: /\beffect speed\b/,
            EffectDuration: /\beffect duration\b/,
            Effect: /\beffect\b/,
            SoundSensitivity: /\b(?:sound|mic|microphone) sensitivity\b/,
            WheelShake: /\bgobo shake\b/,
            WheelSlotRotation: /\bgobo rot(?:ation)?\b/,
            WheelRotation: /wheel rot(?:ation)?\b/,
            WheelSlot: /\bgobo\b/,
            BeamAngle: /\bbeam angle\b/,
            BeamPosition: /\b(beam|horizontal|vertical) position\b/,
            Focus: /\bfocus\b/,
            Zoom: /\bzoom\b/,
            IrisEffect: /\biris effect\b/,
            Iris: /\biris\b/,
            FrostEffect: /\bfrost effect\b/,
            Frost: /\bfrost\b/,
            PrismRotation: /\bprisma? rot(?:ation)?\b/,
            Prism: /\bprisma?\b/,
            BladeInsertion: /\bblade insertion\b/,
            BladeRotation: /\bblade rot(?:ation)?\b/,
            BladeSystemRotation: /\bblade system rot(?:ation)?\b/,
            FogOutput: /\bfog output\b/,
            FogType: /\bfog type\b/,
            Fog: /\bfog\b/,
            Rotation: /\brotation\b/,
            Speed: /\bspeed\b/,
            Time: /\btime\b/,
            Maintenance: /\b(?:reset|maintenance)\b/,
          };

          return Object.keys(capabilityTypeRegexps).find(
            channelType => capabilityName.toLowerCase().match(capabilityTypeRegexps[channelType]) ||
              channelName.toLowerCase().match(capabilityTypeRegexps[channelType]),
          ) || `Generic`;
        },
      };

      return capabilityTypePerChannelType[ecueChannel._ecueChannelType]();
    }

    /**
     * Try to guess speedStart / speedEnd from the capabilityName. May set cap.type to Rotation.
     * @returns {string} The rest of the capabilityName.
     */
    function getSpeedGuessedComment() {
      return capabilityName.replace(/(?:^|,\s*|\s+)\(?((?:(?:counter-?)?clockwise|c?cw)(?:,\s*|\s+))?\(?(slow|fast|\d+|\d+\s*hz)\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*(fast|slow|\d+\s*hz)\)?$/i, (match, direction, start, end) => {
        const directionSuffix = getDirectionSuffix(direction);
        if (directionSuffix !== ``) {
          capability.type = `Rotation`;
        }

        start = start.toLowerCase();
        end = end.toLowerCase();

        const startNumber = Number.parseFloat(start);
        const endNumber = Number.parseFloat(end);
        if (!Number.isNaN(startNumber) && !Number.isNaN(endNumber)) {
          start = `${startNumber}Hz`;
          end = `${endNumber}Hz`;
        }

        capability.speedStart = start + directionSuffix;
        capability.speedEnd = end + directionSuffix;

        // delete the parsed part
        return ``;
      });
    }
  }
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
