const xml2js = require(`xml2js`);

const manufacturers = require(`../../fixtures/manufacturers.json`);

module.exports.name = `GDTF 0.87`;
module.exports.version = `0.1.0`;

module.exports.import = function importGdtf(str, filename, resolve, reject) {
  const parser = new xml2js.Parser();

  const out = {
    manufacturers: {},
    fixtures: {},
    warnings: {}
  };
  const fixture = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`
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
      //console.log(JSON.stringify(xml, null, 2));

      const gdtfFixture = xml.GDTF.FixtureType[0];
      fixture.name = gdtfFixture.$.Name;
      fixture.shortName = gdtfFixture.$.ShortName;

      const manKey = slugify(gdtfFixture.$.Manufacturer);
      const fixKey = `${manKey}/${slugify(fixture.name)}`;
      out.warnings[fixKey] = [];

      let manufacturer;
      if (manKey in manufacturers) {
        manufacturer = manufacturers[manKey];
      }
      else {
        manufacturer = {
          name: gdtfFixture.$.Manufacturer
        };
        out.manufacturers[manKey] = manufacturer;
        out.warnings[fixKey].push(`Please add manufacturer URL.`);
      }

      fixture.categories = [`Other`]; // TODO: can we find out categories?
      out.warnings[fixKey].push(`Please add fixture categories.`);

      const timestamp = new Date().toISOString().replace(/T.*/, ``);
      const revisions = gdtfFixture.Revisions[0].Revision;

      fixture.meta = {
        authors: [`Anonymous`],
        createDate: getIsoDateFromGdtfDate(revisions[0].$.Date) || timestamp,
        lastModifyDate: getIsoDateFromGdtfDate(revisions[revisions.length - 1].$.Date) || timestamp,
        importPlugin: {
          plugin: `gdtf`,
          date: timestamp,
          comment: `GDTF fixture type ID: ${gdtfFixture.$.FixtureTypeID}`
        }
      };
      out.warnings[fixKey].push(`Please add yourself as a fixture author.`);

      fixture.comment = gdtfFixture.$.Description;

      out.warnings[fixKey].push(`Please add relevant links to the fixture.`);

      addRdmInfo(fixture, manufacturer, gdtfFixture);

      // TODO: import physical data and matrix

      addChannels(fixture, gdtfFixture);


      // // fill in one empty mode so we don't have to check this case anymore
      // if (!(`Mode` in qlcPlusFixture)) {
      //   qlcPlusFixture.Mode = [{
      //     Physical: [{}]
      //   }];
      // }

      // fixture.physical = getOflPhysical(qlcPlusFixture.Mode[0].Physical[0], {});
      // fixture.matrix = {};
      // fixture.availableChannels = {};
      // fixture.templateChannels = {};

      // const doubleByteChannels = [];
      // for (const channel of qlcPlusFixture.Channel || []) {
      //   fixture.availableChannels[channel.$.Name] = getOflChannel(channel);

      //   if (channel.Group[0].$.Byte === `1`) {
      //     doubleByteChannels.push(channel.$.Name);
      //   }
      // }

      // mergeFineChannels(fixture, doubleByteChannels, out.warnings[fixKey]);

      // fixture.modes = qlcPlusFixture.Mode.map(mode => getOflMode(mode, fixture.physical, out.warnings[fixKey]));

      // cleanUpFixture(fixture, qlcPlusFixture);

      out.fixtures[fixKey] = fixture;

      resolve(out);
    })
    .catch(parseError => {
      reject(`Error parsing '${filename}'.\n${parseError.toString()}`);
    });
};


/**
 * @param {!string} dateStr A date string in the form "dd.MM.yyyy HH:mm:ss", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-date
 * @returns {?string} A date string in the form "YYYY-MM-DD", or null if the string could not be parsed.
 */
function getIsoDateFromGdtfDate(dateStr) {
  const timeRegex = /^([0-3]?\d)\.([01]?\d)\.(\d{4})\s+\d?\d:\d?\d:\d?\d$/;
  const match = dateStr.match(timeRegex);

  try {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, day);

    return date.toISOString().replace(/T.*/, ``);
  }
  catch (error) {
    return null;
  }
}

/**
 * Adds an RDM section to the OFL fixture and manufacturer if applicable.
 * @param {!object} fixture The OFL fixture object.
 * @param {!object} manufacturer The OFL manufacturer object.
 * @param {!object} gdtfFixture The GDTF fixture object.
 */
function addRdmInfo(fixture, manufacturer, gdtfFixture) {
  if (!(`Protocols` in gdtfFixture) || !(`RDM` in gdtfFixture.Protocols[0])) {
    return;
  }

  const rdmData = gdtfFixture.Protocols[0].RDM[0];

  manufacturer.rdmId = parseInt(rdmData.$.ManufacturerID, 16);
  fixture.rdm = {
    modelId: parseInt(rdmData.$.DeviceModelID, 16),
    softwareVersion: rdmData.$.SoftwareVersionID
  };
}

/**
 * @param {!object} fixture The OFL fixture object.
 * @param {!object} gdtfFixture The GDTF fixture object.
 */
function addChannels(fixture, gdtfFixture) {
  const availableChannels = [];
  const templateChannels = [];

  gdtfFixture.DMXModes[0].DMXMode.forEach(gdtfMode => {
    gdtfMode.DMXChannels[0].DMXChannel.forEach(gdtfChannel => {
      if (gdtfChannel.$.DMXBreak === `Overwrite`) {
        addChannel(templateChannels, gdtfChannel, gdtfFixture);
      }
      else {
        addChannel(availableChannels, gdtfChannel, gdtfFixture);
      }
    });
  });

  // append $pixelKey to templateChannels' keys and names
  templateChannels.forEach(channelWrapper => {
    channelWrapper.key += ` $pixelKey`;
    channelWrapper.channel.name += ` $pixelKey`;
  });

  // remove unnecessary name property and fill/remove fineChannelAliases
  availableChannels.concat(templateChannels).forEach(channelWrapper => {
    const chKey = channelWrapper.key;

    if (chKey === channelWrapper.channel.name) {
      delete channelWrapper.channel.name;
    }

    if (channelWrapper.maxFineness === 0) {
      delete channelWrapper.channel.fineChannelAliases;
    }
    else {
      channelWrapper.channel.fineChannelAliases.push(`${chKey} fine`);

      for (let i = 2; i <= channelWrapper.maxFineness; i++) {
        channelWrapper.channel.fineChannelAliases.push(`${chKey} fine^${i}`);
      }
    }
  });

  // convert availableChannels array to object and add it to fixture
  if (availableChannels.length > 0) {
    fixture.availableChannels = {};
    availableChannels.forEach(channelWrapper => {
      fixture.availableChannels[channelWrapper.key] = channelWrapper.channel;
    });
  }

  // convert templateChannels array to object and add it to fixture
  if (templateChannels.length > 0) {
    fixture.templateChannels = {};
    templateChannels.forEach(channelWrapper => {
      fixture.templateChannels[channelWrapper.key] = channelWrapper.channel;
    });
  }
}

/**
 * @typedef ChannelWrapper
 * @type object
 * @property {!string} key The channel key.
 * @property {!object} channel The OFL channel object.
 * @property {!number} maxFineness The highest used fineness of this channel.
 */

/**
 * @param {!array.<!Channel>} channels The OFL availableChannels or templateChannels object.
 * @param {!object} gdtfChannel The GDTF channel object.
 * @param {!object} gdtfFixture The GDTF fixture object.
 */
function addChannel(channels, gdtfChannel, gdtfFixture) {
  const name = getChannelName();

  const channel = {
    name: name,
    fineChannelAliases: []
  };

  if (`Default` in gdtfChannel.$) {
    channel.defaultValue = gdtfDmxValueToNumber(gdtfChannel.$.Default)[0];
  }

  if (`Highlight` in gdtfChannel.$ && gdtfChannel.$.Highlight !== `None`) {
    channel.highlightValue = gdtfDmxValueToNumber(gdtfChannel.$.Highlight)[0];
  }

  // check if we already added the same channel
  const sameChannel = channels.find(
    ch => JSON.stringify(ch.channel) === JSON.stringify(channel)
  );
  if (sameChannel) {
    gdtfChannel._oflChannelKey = sameChannel.key;

    sameChannel.maxFineness = Math.max(sameChannel.maxFineness, getChannelFineness());
    return;
  }

  const channelKey = getChannelKey();

  gdtfChannel._oflChannelKey = channelKey;
  channels.push({
    key: channelKey,
    channel: channel,
    maxFineness: getChannelFineness()
  });


  /**
   * @returns {!string} The channel name.
   */
  function getChannelName() {
    const channelAttribute = gdtfChannel.LogicalChannel[0].$.Attribute;
    return gdtfFixture.AttributeDefinitions[0].Attributes[0].Attribute.find(
      attribute => attribute.$.Name === channelAttribute
    ).$.Pretty || channelAttribute;
  }

  /**
   * @returns {!number} The fineness of this channel.
   */
  function getChannelFineness() {
    if (`Uber ` in gdtfChannel.$ && gdtfChannel.$.Uber !== `None`) {
      return 3;
    }

    if (`Ultra` in gdtfChannel.$ && gdtfChannel.$.Ultra !== `None`) {
      return 2;
    }

    if (`Fine` in gdtfChannel.$ && gdtfChannel.$.Fine !== `None`) {
      return 1;
    }

    return 0;
  }

  /**
   * @returns {!string} The channel key, derived from the name and made unique.
   */
  function getChannelKey() {
    let key = name;

    // make unique by appending ' 2', ' 3', ... if necessary
    let duplicates = 1;
    const hasChannelKey = ch => ch.key === key;
    while (channels.some(hasChannelKey)) {
      duplicates++;
      key = `${name} ${duplicates}`;
    }

    return key;
  }
}

/**
 * @param {!string} dmxValue GDTF DMX value in the form "128/2", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-DMXValue
 * @returns {!array.<!number>} Array containing DMX value and DMX fineness.
 */
function gdtfDmxValueToNumber(dmxValue) {
  try {
    const [, value, fineness] = dmxValue.match(/^(\d+)\/(\d)$/);
    return [parseInt(value), parseInt(fineness)];
  }
  catch (error) {
    return [parseInt(dmxValue), 1];
  }
}

/**
 * @param {!string} str The string to slugify.
 * @returns {!string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
