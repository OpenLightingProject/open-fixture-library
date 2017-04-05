module.exports.name = 'DMXControl 3';
module.exports.version = '0.1.0';

module.exports.import = function importDmxControl3(str, filename, resolve, reject) {

  // const parser = new xml2js.Parser();

  let out = {
    manufacturers: {},
    fixtures: {},
    warnings: {'general': [
      'Plugin not implemented yet!'
    ]}
  };

  resolve(out);
}