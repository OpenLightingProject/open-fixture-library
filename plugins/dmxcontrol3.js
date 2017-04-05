const xml2js = require('xml2js');

module.exports.name = 'DMXControl 3';
module.exports.version = '0.1.0';

module.exports.import = function importDmxControl3(str, filename, resolve, reject) {

  new xml2js.Parser().parseString(str, (parseError, xml) => {
    if (parseError) {
      return reject(`Error parsing '${filename}' as XML.\n` + parseError.toString());
    }

    let out = {
      manufacturers: {},
      fixtures: {},
      warnings: {}
    };

    try {
      const device = xml.device;
      const info = device.information[0];
      const manName = info.vendor[0];
      const manKey = manName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
      out.manufacturers[manKey] = {
        name: manName
      }

      const fixKey = manKey + '/' + info.model[0].toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
      out.warnings[fixKey] = [];

      let fix = {
        name: info.model[0],
        shortName: fixKey
      };

      if (info.author) {
        fix.meta = {
          authors: [info.author[0]]
        };
      }

      out.fixtures[fixKey] = fix;
    }
    catch (parseError) {
      return reject(`Error parsing '${filename}'.\n` + parseError.toString());
    }

    resolve(out);
  });
}