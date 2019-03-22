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
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel
} = require(`../../lib/model.js`);
/* eslint-enable no-unused-vars */

module.exports.version = `0.5.1`;

/**
 * @param {array.<Fixture>} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDir Absolute path to OFL's root directory.
 * @param {Date|null} options.date The current time.
 * @returns {Promise.<array.<object>, Error>} The generated files.
*/
module.exports.export = function exportQlcPlus(fixtures, options) {
  const outFiles = fixtures.map(fixture => {
    const xml = xmlbuilder.begin()
      .declaration(`1.0`, `UTF-8`)
      .element({
        FixtureDefinition: {
          '@xmlns': `http://www.qlcplus.org/FixtureDefinition`,
          Creator: {
            Name: `OFL – ${fixture.url}`,
            Version: module.exports.version,
            Author: fixture.meta.authors.join(`, `)
          },
          Manufacturer: fixture.manufacturer.name,
          Model: fixture.name,
          Type: getFixtureType(fixture)
        }
      });

    for (const channel of fixture.allChannels) {
      addChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      addMode(xml, mode);
    }

    xml.dtd(``);
    return {
      name: sanitize(`${fixture.manufacturer.name}-${fixture.name}.qxf`).replace(/\s+/g, `-`),
      content: xml.end({
        pretty: true,
        indent: ` `
      }),
      mimetype: `application/x-qlc-fixture`,
      fixtures: [fixture]
    };
  });

  return Promise.resolve(outFiles);
};

/**
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {CoarseChannel} channel The OFL channel object.
 */
function addChannel(xml, channel) {
  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  // use default channel's data
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;
  }

  const xmlGroup = xmlChannel.element({
    Group: {}
  });

  let capabilities;
  if (channel instanceof FineChannel) {
    let capabilityName;
    if (channel.resolution > CoarseChannel.RESOLUTION_16BIT) {
      xmlGroup.attribute(`Byte`, 0); // not a QLC+ fine channel
      capabilityName = `Fine^${channel.resolution - 1} adjustment for ${channel.coarseChannel.uniqueName}`;
    }
    else {
      xmlGroup.attribute(`Byte`, 1);
      capabilityName = `Fine adjustment for ${channel.coarseChannel.uniqueName}`;
    }

    channel = channel.coarseChannel; // use coarse channel's data from here on
    capabilities = [
      new Capability({
        dmxRange: [0, 255],
        type: `Generic`,
        comment: capabilityName
      }, CoarseChannel.RESOLUTION_8BIT, channel)
    ];
  }
  else {
    xmlGroup.attribute(`Byte`, 0);
    capabilities = channel.capabilities;
  }

  const chType = getChannelType(channel.type);
  xmlGroup.text(chType);

  if (chType === `Intensity`) {
    xmlChannel.element({
      Colour: channel.color !== null ? channel.color.replace(/^(?:Warm|Cold) /, ``) : `Generic`
    });
  }

  for (const cap of capabilities) {
    addCapability(xmlChannel, cap);
  }
}

/**
 * @param {object} xmlChannel The xmlbuilder <Channel> object.
 * @param {Capability} cap The OFL capability object.
 */
function addCapability(xmlChannel, cap) {
  const dmxRange = cap.getDmxRangeWithResolution(CoarseChannel.RESOLUTION_8BIT);

  const xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': dmxRange.start,
      '@Max': dmxRange.end,
      '#text': cap.name
    }
  });

  if (cap.colors !== null && cap.colors.allColors.length <= 2) {
    xmlCapability.attribute(`Color`, cap.colors.allColors[0]);

    if (cap.colors.allColors.length > 1) {
      xmlCapability.attribute(`Color2`, cap.colors.allColors[1]);
    }
  }

  const isStopped = cap.speed !== null && cap.speed[0].number === 0 && cap.speed[1].number === 0;
  if (cap.effectPreset === `ColorFade` && !isStopped) {
    xmlCapability.attribute(`Res`, `Others/rainbow.png`);
  }
}

/**
 * @param {object} xml The xmlbuilder <FixtureDefinition> object.
 * @param {Mode} mode The OFL mode object.
 */
function addMode(xml, mode) {
  const xmlMode = xml.element({
    Mode: {
      '@Name': mode.name
    }
  });

  const hasPanTiltInfinite = mode.physical !== null && (
    mode.physical.focusPanMax === Number.POSITIVE_INFINITY ||
    mode.physical.focusTiltMax === Number.POSITIVE_INFINITY
  );
  addPhysical(xmlMode, mode.physical || new Physical({}), hasPanTiltInfinite ? mode : null);

  mode.channels.forEach((channel, index) => {
    xmlMode.element({
      Channel: {
        '@Number': index,
        '#text': channel.uniqueName
      }
    });
  });

  if (mode.fixture.matrix !== null) {
    addHeads(xmlMode, mode);
  }
}

/**
 * @param {object} xmlParentNode The xmlbuilder object where <Physical> should be added.
 * @param {Physical} physical The OFL physical object.
 * @param {Mode|null} mode The OFL mode object this physical data section belongs to. Only provide this if panMax and tiltMax should be read from this mode's Pan / Tilt channels.
 */
function addPhysical(xmlParentNode, physical, mode) {
  const physicalSections = {
    Bulb: {
      required: true,
      getAttributes() {
        return {
          Type: physical.bulbType || `Other`,
          Lumens: Math.round(physical.bulbLumens) || 0,
          ColourTemperature: Math.round(physical.bulbColorTemperature) || 0
        };
      }
    },
    Dimensions: {
      required: true,
      getAttributes() {
        return {
          Weight: physical.weight || 0,
          Width: Math.round(physical.width) || 0,
          Height: Math.round(physical.height) || 0,
          Depth: Math.round(physical.depth) || 0
        };
      }
    },
    Lens: {
      required: true,
      getAttributes() {
        return {
          Name: physical.lensName || `Other`,
          DegreesMin: physical.lensDegreesMin || 0,
          DegreesMax: physical.lensDegreesMax || 0
        };
      }
    },
    Focus: {
      required: true,
      getAttributes() {
        const [PanMax, TiltMax] = [`Pan`, `Tilt`].map(panOrTilt => {
          const panTiltMax = physical[`focus${panOrTilt}Max`];

          if (panTiltMax === Number.POSITIVE_INFINITY) {
            try {
              const panTiltChannel = mode.channels.find(
                ch => `capabilities` in ch && ch.capabilities.length === 1 &&
                  ch.capabilities[0].type === panOrTilt && ch.capabilities[0].angle[0].unit === `deg`
              );

              return Math.max(
                panTiltChannel.capabilities[0].angle[0].number,
                panTiltChannel.capabilities[0].angle[1].number
              );
            }
            catch (err) {
              return 9999;
            }
          }

          if (panTiltMax !== null) {
            return Math.round(panTiltMax);
          }

          return 0;
        });

        return {
          Type: physical.focusType || `Fixed`,
          PanMax,
          TiltMax
        };
      }
    },
    Technical: {
      required: physical.DMXconnector !== null || physical.power !== null,
      getAttributes() {
        // add whitespace
        const connector = physical.DMXconnector === `3.5mm stereo jack` ? `3.5 mm stereo jack` : physical.DMXconnector;

        return {
          DmxConnector: connector || `Other`,
          PowerConsumption: Math.round(physical.power) || 0
        };
      }
    }
  };

  const xmlPhysical = xmlParentNode.element(`Physical`);
  Object.entries(physicalSections).forEach(([name, section]) => {
    if (section.required) {
      xmlPhysical.element(name, section.getAttributes());
    }
  });
}

/**
 * Adds Head tags for all used pixels in the given mode, ordered by XYZ direction (pixel groups by appearence in JSON).
 * @param {XMLElement} xmlMode The Mode tag to which the Head tags should be added
 * @param {Mode} mode The fixture's mode whose pixels should be determined.
 */
function addHeads(xmlMode, mode) {
  const hasMatrixChannels = mode.channels.some(
    ch => ch.pixelKey !== null || (ch instanceof SwitchingChannel && ch.defaultChannel.pixelKey !== null)
  );

  if (hasMatrixChannels) {
    const pixelKeys = mode.fixture.matrix.getPixelKeysByOrder(`X`, `Y`, `Z`);
    for (const pixelKey of pixelKeys) {
      const channels = mode.channels.filter(channel => controlsPixelKey(channel, pixelKey));
      const xmlHead = xmlMode.element(`Head`);

      for (const ch of channels) {
        xmlHead.element({
          Channel: mode.getChannelIndex(ch.key)
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
  const ignoredCats = [`Blinder`, `Matrix`, `Pixel Bar`, `Stand`];

  return fixture.categories.find(cat => !ignoredCats.includes(cat)) || `Other`;
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
    Nothing: [`NoFunction`]
  };

  for (const qlcplusType of Object.keys(qlcplusChannelTypes)) {
    if (qlcplusChannelTypes[qlcplusType].includes(type)) {
      return qlcplusType;
    }
  }
  return `Effect`; // default if new types are added to OFL
}
