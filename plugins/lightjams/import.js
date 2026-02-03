import xml2js from 'xml2js';

export const version = `1.0.0`;

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

  if (!xml.Fixtures || !xml.Fixtures.Fixture) {
    throw new Error(`No fixtures found in the XML file.`);
  }

  const lightjamsFixtures = Array.isArray(xml.Fixtures.Fixture) 
    ? xml.Fixtures.Fixture 
    : [xml.Fixtures.Fixture];

  for (const lightjamsFixture of lightjamsFixtures) {
    addFixture(lightjamsFixture);
  }

  return out;

  /**
   * Parses the Lightjams fixture and adds it to out.fixtures.
   * @param {object} lightjamsFixture The Lightjams fixture object.
   */
  function addFixture(lightjamsFixture) {
    const manufacturerName = lightjamsFixture.$.Manufacturer || `Generic`;
    const manufacturerKey = slugify(manufacturerName, { lower: true, strict: true });

    if (!(manufacturerKey in out.manufacturers)) {
      out.manufacturers[manufacturerKey] = {
        name: manufacturerName,
      };
    }

    const fixtureName = lightjamsFixture.$.Name;
    let fixtureKey = `${manufacturerKey}/${slugify(fixtureName, { lower: true, strict: true })}`;
    
    if (fixtureKey in out.fixtures) {
      fixtureKey += `-${Math.random().toString(36).slice(2, 7)}`;
      out.warnings[fixtureKey] = [`Fixture key '${fixtureKey}' is not unique, appended random characters.`];
    }
    else {
      out.warnings[fixtureKey] = [];
    }

    const fixture = {
      $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
      name: fixtureName,
    };

    fixture.categories = getCategories(lightjamsFixture);
    
    fixture.meta = {
      authors: [authorName],
      createDate: timestamp,
      lastModifyDate: timestamp,
      importPlugin: {
        plugin: `lightjams`,
        date: timestamp,
      },
    };

    const channels = {};
    const lightjamsChannels = Array.isArray(lightjamsFixture.Channel)
      ? lightjamsFixture.Channel
      : (lightjamsFixture.Channel ? [lightjamsFixture.Channel] : []);

    for (const lightjamsChannel of lightjamsChannels) {
      const channelKey = slugify(lightjamsChannel.$.Name, { lower: true, strict: true });
      channels[channelKey] = parseChannel(lightjamsChannel);
    }

    fixture.availableChannels = channels;

    const mode = {
      name: `${lightjamsFixture.$.Channels || lightjamsChannels.length}-channel`,
      channels: Object.keys(channels),
    };

    fixture.modes = [mode];

    out.fixtures[fixtureKey] = fixture;
  }

  /**
   * Determines fixture categories based on channel types.
   * @param {object} lightjamsFixture The Lightjams fixture object.
   * @returns {string[]} Array of category strings.
   */
  function getCategories(lightjamsFixture) {
    const lightjamsChannels = Array.isArray(lightjamsFixture.Channel)
      ? lightjamsFixture.Channel
      : (lightjamsFixture.Channel ? [lightjamsFixture.Channel] : []);

    const channelTypes = lightjamsChannels.map(ch => ch.$.Type || ``);
    
    if (channelTypes.some(type => type.includes(`Pan`) || type.includes(`Tilt`))) {
      return [`Moving Head`];
    }
    if (channelTypes.some(type => type.includes(`Color`))) {
      return [`Color Changer`];
    }
    if (channelTypes.some(type => type.includes(`Strobe`))) {
      return [`Strobe`];
    }
    if (channelTypes.some(type => type.includes(`Intensity`) || type.includes(`Dimmer`))) {
      return [`Dimmer`];
    }
    
    return [`Other`];
  }

  /**
   * Parses a Lightjams channel into OFL format.
   * @param {object} lightjamsChannel The Lightjams channel object.
   * @returns {object} OFL channel object.
   */
  function parseChannel(lightjamsChannel) {
    const channel = {
      name: lightjamsChannel.$.Name,
    };

    const channelType = lightjamsChannel.$.Type || ``;
    const isFine = lightjamsChannel.$.Fine === `true`;

    if (isFine) {
      channel.fineChannelAliases = [`${channel.name} fine`];
    }

    const capability = parseCapability(channelType, channel.name);
    
    // Use singular 'capability' for single capability channels (without dmxRange)
    channel.capability = capability;

    return channel;
  }

  /**
   * Parses a channel type into an OFL capability.
   * @param {string} channelType The Lightjams channel type.
   * @param {string} channelName The channel name.
   * @returns {object} OFL capability object (without dmxRange for single capabilities).
   */
  function parseCapability(channelType, channelName) {
    const capability = {};

    // Map Lightjams types to OFL types
    if (channelType.includes(`Pan`)) {
      capability.type = `Pan`;
      capability.angleStart = `0deg`;
      capability.angleEnd = `540deg`;
    }
    else if (channelType.includes(`Tilt`)) {
      capability.type = `Tilt`;
      capability.angleStart = `0deg`;
      capability.angleEnd = `270deg`;
    }
    else if (channelType.includes(`Color.Red`)) {
      capability.type = `ColorIntensity`;
      capability.color = `Red`;
    }
    else if (channelType.includes(`Color.Green`)) {
      capability.type = `ColorIntensity`;
      capability.color = `Green`;
    }
    else if (channelType.includes(`Color.Blue`)) {
      capability.type = `ColorIntensity`;
      capability.color = `Blue`;
    }
    else if (channelType.includes(`Color.White`)) {
      capability.type = `ColorIntensity`;
      capability.color = `White`;
    }
    else if (channelType.includes(`Color.Amber`)) {
      capability.type = `ColorIntensity`;
      capability.color = `Amber`;
    }
    else if (channelType.includes(`ColorWheel`)) {
      capability.type = `ColorPreset`;
      capability.comment = channelName;
    }
    else if (channelType.includes(`Strobe`)) {
      capability.type = `ShutterStrobe`;
      capability.shutterEffect = `Strobe`;
    }
    else if (channelType.includes(`Intensity`) || channelType.includes(`Dimmer`)) {
      capability.type = `Intensity`;
    }
    else if (channelType.includes(`Gobo`) && !channelType.includes(`Rotation`)) {
      capability.type = `Generic`;
      capability.comment = `Gobo: ${channelName}`;
    }
    else if (channelType.includes(`GoboRotation`)) {
      capability.type = `Rotation`;
      capability.angleStart = `0deg`;
      capability.angleEnd = `360deg`;
    }
    else if (channelType.includes(`Prism`)) {
      capability.type = `Prism`;
      capability.comment = channelName;
    }
    else if (channelType.includes(`Focus`)) {
      capability.type = `Focus`;
      capability.distanceStart = `near`;
      capability.distanceEnd = `far`;
    }
    else if (channelType.includes(`Iris`)) {
      capability.type = `Iris`;
      capability.openPercent = `0%`;
      capability.closePercent = `100%`;
    }
    else if (channelType.includes(`Zoom`)) {
      capability.type = `Zoom`;
      capability.angleStart = `narrow`;
      capability.angleEnd = `wide`;
    }
    else if (channelType.includes(`Speed`)) {
      capability.type = `Speed`;
      capability.speedStart = `slow`;
      capability.speedEnd = `fast`;
    }
    else if (channelType.includes(`Effect`)) {
      capability.type = `Effect`;
      capability.effectName = channelName;
    }
    else {
      capability.type = `Generic`;
      capability.comment = channelName;
    }

    return capability;
  }
}

/**
 * @param {string} string The string to slugify.
 * @returns {string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
