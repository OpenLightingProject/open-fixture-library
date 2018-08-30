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

      const revisions = gdtfFixture.Revisions[0].Revision;

      fixture.meta = {
        authors: [`Anonymous`],
        createDate: getIsoDateFromGtdfDate(revisions[0].$.Date),
        lastModifyDate: getIsoDateFromGtdfDate(revisions[revisions.length - 1].$.Date),
        importPlugin: {
          plugin: `gdtf`,
          date: new Date().toISOString().replace(/T.*/, ``),
          comment: `GDTF fixture type ID: ${gdtfFixture.$.FixtureTypeID}`
        }
      };
      out.warnings[fixKey].push(`Please add yourself as a fixture author.`);

      fixture.comment = gdtfFixture.$.Description;

      out.warnings[fixKey].push(`Please add relevant links to the fixture.`);

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
 * @param {!string} dateStr A date string in the form "dd.MM.yyyy HH:mm:ss", see https://gdtf-share.com/wiki/GDTF_File_Description#Definition
 * @returns {?string} A date string in the form "YYYY-MM-DD", or null if the string could not be parsed.
 */
function getIsoDateFromGtdfDate(dateStr) {
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
 * @param {!string} str The string to slugify.
 * @returns {!string} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
