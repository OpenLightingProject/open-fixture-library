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

    for (const channel of fixture.allChannels) {
      addChannel(xml, channel, fixture);
    }

    for (const mode of fixture.modes) {
      addMode(xml, mode);
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
  if (channel instanceof MatrixChannel) {
    channel = channel.wrappedChannel;
  }

  const xmlChannel = xml.element({
    Channel: {
      '@Name': channel.uniqueName
    }
  });

  // use default channel's data
  if (channel instanceof SwitchingChannel) {
    channel = channel.defaultChannel;

    if (channel instanceof MatrixChannel) {
      channel = channel.wrappedChannel;
    }
  }

  const xmlGroup = xmlChannel.element({
    Group: {}
  });

  let capabilities;
  if (channel instanceof FineChannel) {
    let capabilityName;
    if (channel.fineness > 1) {
      xmlGroup.attribute(`Byte`, 0); // not a QLC+ fine channel
      capabilityName = `Fine^${channel.fineness} adjustment for ${channel.coarseChannel.uniqueName}`;
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
      }, 0, channel)
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
      Colour: channel.color !== null ? channel.color : `Generic`
    });
  }

  for (const cap of capabilities) {
    addCapability(xmlChannel, cap);
  }
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

  addPhysical(xmlMode, mode.physical || new Physical({}));

  mode.channels.forEach((channel, index) => {
    xmlMode.element({
      Channel: {
        '@Number': index,
        '#text': channel.uniqueName || channel.wrappedChannel.uniqueName
      }
    });
  });

  if (mode.fixture.matrix !== null) {
    addHeads(xmlMode, mode);
  }
}

function addPhysical(xmlMode, physical) {
  const xmlPhysical = xmlMode.element({
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
