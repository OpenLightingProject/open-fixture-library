module.exports.export = function exportQLCplus(library) {
  let outfiles = [];

  for (const data of library) {
    outfiles.push({
      'name': data.manufacturerKey + '/' + data.fixtureKey + '.qxf',
      'content': 'Hello ' + data.fixtureKey + ' from QLC+',
      'mimetype': 'application/x-qlc-fixture'
    });
  }

  return outfiles;
}