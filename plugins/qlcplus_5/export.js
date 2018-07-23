const xmlbuilder = require(`xmlbuilder`);
const sanitize = require(`sanitize-filename`);

/* eslint-disable no-unused-vars */
const {
  AbstractChannel,
  Capability,
  Channel,
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

module.exports.name = `QLC+ 5`;
module.exports.version = `0.1.0`;

module.exports.export = function exportQLCplus(fixtures, options) {
  return fixtures.map(fixture => {
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

    for (const channel of fixture.normalizedChannels) {
      addChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      addMode(xml, mode);
    }

    if (fixture.physical !== null) {
      addPhysical(xml, fixture.physical);
    }

    xml.doctype(``);
    return {
      name: sanitize(`${fixture.manufacturer.name}-${fixture.name}.qxf`).replace(/\s+/g, `-`),
      content: xml.end({
        pretty: true,
        indent: ` `
      }),
      mimetype: `application/x-qlc-fixture`
    };
  });
};

function addChannel(xml, channel) {
  const chType = getChannelType(channel.type);

  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName,
      Group: {
        '@Byte': 0,
        '#text': chType
      }
    }
  });

  if (channel.defaultValue !== 0) {
    xmlChannel.attribute(`Default`, channel.getDefaultValueWithFineness(0));
  }

  if (chType === `Intensity`) {
    xmlChannel.element({
      Colour: channel.color !== null ? channel.color : `Generic`
    });
  }

  for (const cap of channel.capabilities) {
    addCapability(xmlChannel, cap);
  }

  channel.fineChannels.forEach(fineChannel => addFineChannel(xml, fineChannel));
}

function addFineChannel(xml, fineChannel) {
  const chType = getChannelType(fineChannel.coarseChannel.type);

  const xmlFineChannel = xml.element({
    Channel: {
      '@Name': fineChannel.uniqueName
    }
  });

  if (fineChannel.defaultValue !== 0) {
    xmlFineChannel.attribute(`Default`, fineChannel.defaultValue);
  }

  const xmlGroup = xmlFineChannel.element({
    Group: {
      '#text': chType
    }
  });

  let capabilityName;
  if (fineChannel.fineness > 1) {
    xmlGroup.attribute(`Byte`, 0); // not a QLC+ fine channel
    capabilityName = `Fine^${fineChannel.fineness} adjustment for ${fineChannel.coarseChannel.uniqueName}`;
  }
  else {
    xmlGroup.attribute(`Byte`, 1);
    capabilityName = `Fine adjustment for ${fineChannel.coarseChannel.uniqueName}`;
  }

  if (chType === `Intensity`) {
    xmlFineChannel.element({
      Colour: fineChannel.coarseChannel.color !== null ? fineChannel.coarseChannel.color : `Generic`
    });
  }

  addCapability(xmlFineChannel, new Capability({
    dmxRange: [0, 255],
    type: `Generic`,
    comment: capabilityName
  }, 0, fineChannel.coarseChannel));
}

function addCapability(xmlChannel, cap) {
  const dmxRange = cap.getDmxRangeWithFineness(0);

  const xmlCapability = xmlChannel.element({
    Capability: {
      '@Min': dmxRange.start,
      '@Max': dmxRange.end,
      '#text': cap.name
    }
  });

  const fixture = cap._channel.fixture;

  let aliasAdded = false;
  for (const alias of Object.keys(cap.switchChannels)) {
    const switchingChannel = fixture.getSwitchingChannelByKey(alias);
    const defaultChannel = switchingChannel.defaultChannel;
    const switchedChannel = fixture.getChannelByKey(cap.switchChannels[alias]);

    if (defaultChannel !== switchedChannel) {
      aliasAdded = true;

      for (const mode of fixture.modes) {
        if (mode.getChannelIndex(switchingChannel) !== -1) {
          xmlCapability.element({
            Alias: {
              '@Mode': mode.name,
              '@Channel': defaultChannel.uniqueName || defaultChannel.wrappedChannel.uniqueName,
              '@With': switchedChannel.uniqueName || switchedChannel.wrappedChannel.uniqueName
            }
          });
        }
      }
    }
  }

  if (aliasAdded) {
    xmlCapability.attribute(`Preset`, `Alias`);
  }

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

function addMode(xml, mode) {
  const xmlMode = xml.element({
    Mode: {
      '@Name': mode.name
    }
  });

  if (mode.physicalOverride !== null) {
    addPhysical(xmlMode, mode.physical);
  }

  mode.channels.forEach((channel, index) => {
    if (channel instanceof MatrixChannel) {
      channel = channel.wrappedChannel;
    }

    if (channel instanceof SwitchingChannel) {
      channel = channel.defaultChannel;

      if (channel instanceof MatrixChannel) {
        channel = channel.wrappedChannel;
      }
    }

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

function addPhysical(xmlParentNode, physical) {
  const xmlPhysical = xmlParentNode.element({
    Physical: {
      Bulb: {
        '@Type': physical.bulbType || `Other`,
        '@Lumens': physical.bulbLumens || 0,
        '@ColourTemperature': physical.bulbColorTemperature || 0
      },
      Dimensions: {
        '@Weight': physical.weight || 0,
        '@Width': Math.round(physical.width) || 0,
        '@Height': Math.round(physical.height) || 0,
        '@Depth': Math.round(physical.depth) || 0
      },
      Lens: {
        '@Name': physical.lensName || `Other`,
        '@DegreesMin': physical.lensDegreesMin || 0,
        '@DegreesMax': physical.lensDegreesMax || 0
      },
      Focus: {
        '@Type': physical.focusType || `Fixed`,
        '@PanMax': getPanTiltMax(physical.focusPanMax) || 0,
        '@TiltMax': getPanTiltMax(physical.focusTiltMax) || 0
      }
    }
  });

  if (physical.DMXconnector !== null || physical.power !== null) {
    xmlPhysical.element({
      Technical: {
        '@DmxConnector': physical.DMXconnector || `Other`,
        '@PowerConsumption': Math.round(physical.power) || 0
      }
    });
  }

  /**
   * @param {?number} panTiltMax A physical's panMax or tiltMax
   * @returns {!number} The rounded maximum; 9999 for infinite and 0 as default.
   */
  function getPanTiltMax(panTiltMax) {
    if (panTiltMax === Number.POSITIVE_INFINITY) {
      return 9999;
    }

    if (panTiltMax !== null) {
      return Math.round(panTiltMax);
    }

    return 0;
  }
}

/**
 * Adds Head tags for all used pixels in the given mode, ordered by XYZ direction (pixel groups by appearence in JSON).
 * @param {!XMLElement} xmlMode The Mode tag to which the Head tags should be added
 * @param {!Mode} mode The fixture's mode whose pixels should be determined.
 */
function addHeads(xmlMode, mode) {
  const hasMatrixChannels = mode.channels.some(
    ch => ch instanceof MatrixChannel || (ch instanceof SwitchingChannel && ch.defaultChannel instanceof MatrixChannel)
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
   * @param {AbstractChannel|MatrixChannel} channel A channel from a mode's channel list.
   * @param {!string} pixelKey The pixel to check for.
   * @returns {boolean} Whether the given channel controls the given pixel key, either directly or as part of a pixel group.
   */
  function controlsPixelKey(channel, pixelKey) {
    if (channel instanceof SwitchingChannel) {
      return controlsPixelKey(channel.defaultChannel, pixelKey);
    }

    if (channel instanceof MatrixChannel) {
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
 * @param {!Fixture} fixture The Fixture instance whose QLC+ type has to be determined.
 * @returns {!string} The first of the fixture's categories that is supported by QLC+, defaults to 'Other'.
 */
function getFixtureType(fixture) {
  const ignoredCats = [`Blinder`, `Matrix`];

  for (const category of fixture.categories) {
    if (ignoredCats.includes(category)) {
      continue;
    }
    return category;
  }

  return `Other`;
}

/**
 * Converts a channel's type into a valid QLC+ channel type.
 * @param {!string} type Our own OFL channel type.
 * @returns {!string} The corresponding QLC+ channel type.
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
