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
      out.warnings[fixKey] = [`Fixture key '${fixKey}' is not unique, appended random characters.`];
      fixKey += `-${Math.random().toString(36).substr(2, 5)}`;
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
      authors: [],
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


    const channels = getCombinedEcueChannels(ecueFixture);

    for (const ecueChannel of channels) {
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

  const name = ecueChannel.$.Name;

  let channelKey = name;
  if (channelKey in fixture.availableChannels) {
    warningsArray.push(`Channel key '${channelKey}' is not unique, appended random characters.`);
    channelKey += `-${Math.random().toString(36).substr(2, 5)}`;
    channel.name = name;
  }

  channel.type = getChannelType(ecueChannel);

  if (channel.type === null) {
    channel.type = `Intensity`;

    warningsArray.push(`Please check the type of channel '${channelKey}'.`);
  }
  else if (channel.type === `Single Color`) {
    const colorFound = [`Red`, `Green`, `Blue`, `Cyan`, `Magenta`, `Yellow`, `Amber`, `White`, `UV`, `Lime`].some(color => {
      if (name.toLowerCase().includes(color.toLowerCase())) {
        channel.color = color;
        return true;
      }
      return false;
    });

    if (!colorFound) {
      warningsArray.push(`Please add a color to channel '${channelKey}'.`);
    }
  }

  if (ecueChannel.$.DmxByte1 !== `0`) {
    const shortNameFine = `${channelKey} fine`;
    channel.fineChannelAliases = [shortNameFine];
    fixture.modes[0].channels[parseInt(ecueChannel.$.DmxByte1) - 1] = shortNameFine;
  }

  addDmxValues();

  if (`Range` in ecueChannel) {
    channel.capabilities = ecueChannel.Range.map((range, i) => getCapability(range, i, ecueChannel));
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

    if (ecueChannel.$.Invert === `1`) {
      channel.invert = true;
    }

    if (ecueChannel.$.Constant === `1`) {
      channel.constant = true;
    }

    if (ecueChannel.$.Crossfade === `1`) {
      channel.crossfade = true;
    }

    if (ecueChannel.$.Precedence === `HTP`) {
      channel.precedence = `HTP`;
    }
  }
}

/**
 * @param {!object} ecueChannel The e:cue channel object.
 * @returns {?string} The OFL channel type, or null if it could not be determined.
 */
function getChannelType(ecueChannel) {
  const testName = ecueChannel.$.Name.toLowerCase();

  if (testName.match(/\b(?:colou?r[\s-]*temperature|ctc|cto)\b/)) {
    return `Color Temperature`;
  }

  if (ecueChannel._ecueChannelType === `ChannelColor`) {
    if ((`Range` in ecueChannel && ecueChannel.Range.length > 1) || /colou?r\s*macro/.test(testName)) {
      return `Multi-Color`;
    }

    return `Single Color`;
  }

  const nameRegexps = {
    Speed: /\bspeed\b/,
    Gobo: /\bgobo\b/,
    Effect: /\b(?:program|effect|macro)\b/,
    Prism: /\bprism\b/,
    Shutter: /\bshutter\b/,
    Strobe: /\bstrob/,
    Iris: /\biris\b/,
    Focus: /\bfocus\b/,
    Zoom: /\bzoom\b/,
    Pan: /\bpan\b/,
    Tilt: /\btilt\b/,
    Maintenance: /\b(?:reset|maintenance)\b/,
    Intensity: /\b(?:intensity|master|dimmer)\b/
  };

  return Object.keys(nameRegexps).find(channelType => testName.match(nameRegexps[channelType]));
}

/**
 *
 * @param {*} ecueRange The e:cue range object.
 * @param {*} index The index of the capability / range.
 * @param {!object} ecueChannel The e:cue channel object.
 * @returns {!object} The OFL capability object.
 */
function getCapability(ecueRange, index, ecueChannel) {
  const cap = {
    range: [parseInt(ecueRange.$.Start), parseInt(ecueRange.$.End)],
    name: ecueRange.$.Name
  };

  if (cap.range[1] === -1) {
    cap.range[1] = (index + 1 < ecueChannel.Range.length) ? parseInt(ecueChannel.Range[index + 1].$.Start) - 1 : 255;
  }

  // try to read a color
  const color = cap.name.toLowerCase().replace(/\s/g, ``);
  if (color in colors) {
    cap.color = colors[color];
  }

  if (ecueRange.$.AutoMenu !== `1`) {
    cap.menuClick = `hidden`;
  }
  else if (ecueRange.$.Centre !== `0`) {
    cap.menuClick = `center`;
  }

  return cap;
}

/**
 * @param {!string} str The string to slugify.
 * @returns {!string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
