const colorNames = require(`color-names`);
const xml2js = require(`xml2js`);

module.exports.name = `e:cue`;
module.exports.version = `0.3.1`;

const colors = {};
for (const hex of Object.keys(colorNames)) {
  colors[colorNames[hex].toLowerCase().replace(/\s/g, ``)] = hex;
}

module.exports.import = function importEcue(str, filename, resolve, reject) {
  const parser = new xml2js.Parser();
  const timestamp = new Date().toISOString().replace(/T.*/, ``);

  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {}
  };

  new Promise((res, rej) => {
    parser.parseString(str, (parseError, xml) => {
      if (parseError) {
        rej(parseError);
      }
      else {
        res(xml);
      }
    });
  })
    .then(xml => {
      if (!(`Library` in xml.Document) || !(`Fixtures` in xml.Document.Library[0]) || !(`Manufacturer` in xml.Document.Library[0].Fixtures[0])) {
        throw new Error(`Nothing to import.`);
      }

      return xml.Document.Library[0].Fixtures[0].Manufacturer || [];
    })
    .then(ecueManufacturers => {
      for (const manufacturer of ecueManufacturers) {
        const manName = manufacturer.$.Name;
        const manKey = slugify(manName);

        out.manufacturers[manKey] = {
          name: manName
        };

        if (manufacturer.$.Comment !== ``) {
          out.manufacturers[manKey].comment = manufacturer.$.Comment;
        }
        if (manufacturer.$.Web !== ``) {
          out.manufacturers[manKey].website = manufacturer.$.Web;
        }

        for (const fixture of (manufacturer.Fixture || [])) {
          addFixture(fixture, manKey);
        }
      }

      resolve(out);
    })
    .catch(parseError => {
      reject(`Error parsing '${filename}'.\n${parseError.toString()}`);
    });


  /**
   * Parses the e:cue fixture and add it to out.fixtures.
   * @param {!object} ecueFixture The e:cue fixture object.
   * @param {!string} manKey The manufacturer key of the fixture.
   */
  function addFixture(ecueFixture, manKey) {
    const fixture = {
      $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
      name: ecueFixture.$.Name
    };

    let fixKey = `${manKey}/${slugify(fixture.name)}`;
    if (fixKey in out.fixtures) {
      fixKey += `-${Math.random().toString(36).substr(2, 5)}`;
      out.warnings[fixKey] = [`Fixture key '${fixKey}' is not unique, appended random characters.`];
    }
    else {
      out.warnings[fixKey] = [];
    }

    if (ecueFixture.$.NameShort !== ``) {
      fixture.shortName = ecueFixture.$.NameShort;
    }

    fixture.categories = [`Other`];
    out.warnings[fixKey].push(`Please specify categories.`);

    fixture.meta = {
      authors: [`TODO: REMOVE ME AGAIN`],
      createDate: ecueFixture.$._CreationDate.replace(/#.*/, ``),
      lastModifyDate: ecueFixture.$._ModifiedDate.replace(/#.*/, ``),
      importPlugin: {
        plugin: `ecue`,
        date: timestamp
      }
    };
    out.warnings[fixKey].push(`Please specify your name in meta.authors.`);

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
      channels: []
    }];

    for (const ecueChannel of getCombinedEcueChannels(ecueFixture)) {
      addChannelToFixture(ecueChannel, fixture, out.warnings[fixKey]);
    }

    out.fixtures[fixKey] = fixture;
  }
};

/**
 * @param {!object} ecueFixture The e:cue fixture object.
 * @returns {!object} The OFL fixture's physical object.
 */
function getPhysical(ecueFixture) {
  const physical = {};

  if (ecueFixture.$.DimWidth !== `10` && ecueFixture.$.DimHeight !== `10` && ecueFixture.$.DimDepth !== `10`) {
    physical.dimensions = [parseFloat(ecueFixture.$.DimWidth), parseFloat(ecueFixture.$.DimHeight), parseFloat(ecueFixture.$.DimDepth)];
  }

  if (ecueFixture.$.Weight !== `0`) {
    physical.weight = parseFloat(ecueFixture.$.Weight);
  }

  if (ecueFixture.$.Power !== `0`) {
    physical.power = parseFloat(ecueFixture.$.Power);
  }

  return physical;
}

/**
 * @param {!object} ecueFixture The e:cue fixture object.
 * @returns {!Array.<!object>} An array of all ecue channel objects.
 */
function getCombinedEcueChannels(ecueFixture) {
  let channels = [];

  const channelTypes = [`ChannelIntensity`, `ChannelColor`, `ChannelBeam`, `ChannelFocus`];
  for (const channelType of channelTypes) {
    if (ecueFixture[channelType]) {
      channels = channels.concat(ecueFixture[channelType].map(ch => {
        // save the channel type in the channel object
        ch._ecueChannelType = channelType;
        return ch;
      }));
    }
  }

  // sort channels by (coarse) DMX channel
  channels = channels.sort((a, b) => {
    if (parseInt(a.$.DmxByte0) < parseInt(b.$.DmxByte0)) {
      return -1;
    }

    return (parseInt(a.$.DmxByte0) > parseInt(b.$.DmxByte0)) ? 1 : 0;
  });

  return channels;
}

/**
 * Parses the e:cue channel and adds it to OFL fixture's availableChannels and the first mode.
 * @param {!object} ecueChannel The e:cue channel object.
 * @param {!object} fixture The OFL fixture object.
 * @param {!Array.<!string>} warningsArray This fixture's warnings array in the `out` object.
 */
function addChannelToFixture(ecueChannel, fixture, warningsArray) {
  const channel = {};

  const channelName = ecueChannel.$.Name.trim();

  let channelKey = channelName;
  if (channelKey in fixture.availableChannels) {
    warningsArray.push(`Channel key '${channelKey}' is not unique, appended random characters.`);
    channelKey += `-${Math.random().toString(36).substr(2, 5)}`;
    channel.name = channelName;
  }

  let maxDmxValue = 255;
  if (ecueChannel.$.DmxByte1 !== `0`) {
    const shortNameFine = `${channelKey} fine`;
    channel.fineChannelAliases = [shortNameFine];
    maxDmxValue = (256 * 256) - 1;
    fixture.modes[0].channels[parseInt(ecueChannel.$.DmxByte1) - 1] = shortNameFine;
  }

  addDmxValues();

  if (!(`Range` in ecueChannel)) {
    ecueChannel.Range = [{
      $: {
        Start: 0,
        End: maxDmxValue,
        Name: `0-100%`,
        AutoMenu: `1`,
        Centre: `0`
      }
    }];
  }

  channel.capabilities = ecueChannel.Range.map(getCapability);

  if (channel.capabilities.length === 1) {
    channel.capability = channel.capabilities[0];
    delete channel.capabilities;
    delete channel.capability.dmxRange;
  }

  fixture.availableChannels[channelKey] = channel;
  fixture.modes[0].channels[parseInt(ecueChannel.$.DmxByte0) - 1] = channelKey;


  /**
   * Adds DMX value related properties to channel.
   */
  function addDmxValues() {
    if (ecueChannel.$.DefaultValue !== `0`) {
      channel.defaultValue = parseInt(ecueChannel.$.DefaultValue);
    }

    if (ecueChannel.$.Highlight !== `0`) {
      channel.highlightValue = parseInt(ecueChannel.$.Highlight);
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
   * @param {*} ecueRange The e:cue range object.
   * @param {*} index The index of the capability / range.
   * @returns {!object} The OFL capability object.
   */
  function getCapability(ecueRange, index) {
    const cap = {
      dmxRange: getDmxRange()
    };

    const capabilityName = ecueRange.$.Name.trim();

    cap.type = getCapabilityType();

    // capability parsers can rely on the channel type as a first distinctive feature
    const capabilityTypeParsers = {
      ColorIntensity() {
        cap.color = [`Red`, `Green`, `Blue`, `Cyan`, `Magenta`, `Yellow`, `Amber`, `White`, `UV`, `Lime`].find(
          color => channelName.toLowerCase().includes(color.toLowerCase())
        );

        cap.comment = capabilityName;
      },
      ColorWheelIndex() {
        const color = capabilityName.toLowerCase().replace(/\s/g, ``);
        if (color in colors) {
          cap.color = colors[color];
        }

        cap.comment = getSpeedGuessedComment();

        if (`speedStart` in cap) {
          cap.type = `ColorWheelRotation`;
        }
      },
      ColorPreset() {
        const color = capabilityName.toLowerCase().replace(/\s/g, ``);
        if (color in colors) {
          cap.color = colors[color];
        }

        cap.comment = capabilityName;
      },
      ShutterStrobe() {
        if (capabilityName.match(/^(?:Blackout|(?:Shutter )?Closed?)$/i)) {
          cap.shutterEffect = `Closed`;
          return;
        }

        if (capabilityName.match(/^(?:(?:Shutter )?Open|Full?)$/i)) {
          cap.shutterEffect = `Open`;
          return;
        }

        if (capabilityName.match(/puls/i)) {
          cap.shutterEffect = `Pulse`;
        }
        else if (capabilityName.match(/ramp\s*up/i)) {
          cap.shutterEffect = `RampUp`;
        }
        else if (capabilityName.match(/ramp\s*down/i)) {
          cap.shutterEffect = `RampDown`;
        }
        else {
          cap.shutterEffect = `Strobe`;
        }

        if (capabilityName.match(/random/i)) {
          cap.shutterEffect += `Random`;
        }

        cap.comment = getSpeedGuessedComment();
      },
      Pan() {
        cap.angleStart = `0%`;
        cap.angleEnd = `100%`;
        cap.comment = capabilityName;
      },
      Tilt() {
        cap.angleStart = `0%`;
        cap.angleEnd = `100%`;
        cap.comment = capabilityName;
      },
      Effect() {
        cap.effectName = ``; // set it first here so effectName is before speedStart/speedEnd
        cap.effectName = getSpeedGuessedComment();
      },
      NoFunction() {
        // don't even add a comment
      }
    };

    if (cap.type in capabilityTypeParsers) {
      capabilityTypeParsers[cap.type]();
    }
    else {
      cap.comment = getSpeedGuessedComment();
    }

    // delete unnecessary comments
    if (`comment` in cap && (cap.comment === channelName || cap.comment.match(/^$|^0%?\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*100%$/))) {
      delete cap.comment;
    }

    if (ecueRange.$.AutoMenu !== `1`) {
      cap.menuClick = `hidden`;
    }
    else if (ecueRange.$.Centre !== `0`) {
      cap.menuClick = `center`;
    }

    return cap;


    /**
     * @returns {!Array.<!number>} The DMX range of this capability.
     */
    function getDmxRange() {
      const dmxRangeStart = parseInt(ecueRange.$.Start);
      let dmxRangeEnd = parseInt(ecueRange.$.End);

      if (dmxRangeEnd === -1) {
        dmxRangeEnd = (index + 1 < ecueChannel.Range.length) ? parseInt(ecueChannel.Range[index + 1].$.Start) - 1 : maxDmxValue;
      }

      return [dmxRangeStart, dmxRangeEnd];
    }

    /**
     * @returns {!string} The parsed capability type.
     */
    function getCapabilityType() {
      // capability parsers can rely on the channel type as a first distinctive feature
      const capabilityTypePerChannelType = {
        ChannelColor() {
          if (channelName.match(/\bCTO\b|\bCTB\b|temperature\b/i)) {
            return `ColorTemperature`;
          }

          if (ecueChannel.Range.length === 1 && !channelName.match(/macro|wheel\b/i)) {
            return `ColorIntensity`;
          }

          if (channelName.match(/wheel\b/i)) {
            return `ColorWheelIndex`;
          }

          return `ColorPreset`;
        },
        ChannelIntensity() {
          // fall back to default
          return capabilityTypePerChannelType.ChannelBeam();
        },
        ChannelFocus() {
          if (channelName.match(/speed/i)) {
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

          if (channelName.match(/continuous/i)) {
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
            PanTiltSpeed: /\b(?:pan[/ -]?tilt speed|p[/ -]?t speed)\b/,
            PanContinuous: /\bpan continuous\b/,
            TiltContinuous: /\btilt continuous\b/,
            EffectParameter: /\beffect param(?:eter)?\b/,
            EffectSpeed: /\beffect speed\b/,
            EffectDuration: /\beffect duration\b/,
            Effect: /\beffect\b/,
            SoundSensitivity: /\b(?:sound|mic|microphone) sensitivity\b/,
            GoboShake: /\bgobo shake\b/,
            GoboStencilRotation: /\bgobo rot(?:ation)?\b/,
            GoboWheelRotation: /\bgobo wheel rot(?:ation)?\b/,
            GoboIndex: /\bgobo\b/,
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
            BeamAngle: /\bbeam angle\b/,
            Rotation: /\brotation\b/,
            Speed: /\bspeed\b/,
            Time: /\btime\b/,
            Maintenance: /\b(?:reset|maintenance)\b/
          };

          return Object.keys(capabilityTypeRegexps).find(
            channelType => capabilityName.toLowerCase().match(capabilityTypeRegexps[channelType]) ||
              channelName.toLowerCase().match(capabilityTypeRegexps[channelType])
          ) || `Generic`;
        }
      };

      return capabilityTypePerChannelType[ecueChannel._ecueChannelType]();
    }

    /**
     * Try to guess speedStart / speedEnd from the capabilityName. May set cap.type to Rotation.
     * @returns {!string} The rest of the capabilityName.
     */
    function getSpeedGuessedComment() {
      return capabilityName.replace(/(?:^|,\s*|\s+)\(?((?:(?:counter-?)?clockwise|C?CW)(?:,\s*|\s+))?\(?(slow|fast|\d+|\d+\s*Hz)\s*(?:-|to|–|…|\.{2,}|->|<->|→)\s*(fast|slow|\d+\s*Hz)\)?$/i, (match, direction, start, end) => {
        const directionStr = direction ? (direction.match(/^(?:clockwise|CW),?\s+$/i) ? ` CW` : ` CCW`) : ``;

        if (directionStr !== ``) {
          cap.type = `Rotation`;
        }

        start = start.toLowerCase();
        end = end.toLowerCase();

        const startNumber = parseFloat(start);
        const endNumber = parseFloat(end);
        if (!isNaN(startNumber) && !isNaN(endNumber)) {
          start = `${startNumber}Hz`;
          end = `${endNumber}Hz`;
        }

        cap.speedStart = start + directionStr;
        cap.speedEnd = end + directionStr;

        // delete the parsed part
        return ``;
      });
    }
  }
}

/**
 * @param {!string} str The string to slugify.
 * @returns {!string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
