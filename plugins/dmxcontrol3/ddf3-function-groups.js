const xmlbuilder = require(`xmlbuilder`);

module.exports = [
  {
    functions: [`pan`, `tilt`],
    getXmlGroup: (pan, tilt) => {
      const xmlPosition = xmlbuilder.create(`position`);
      xmlPosition.importDocument(pan);
      xmlPosition.importDocument(tilt);
      return xmlPosition;
    }
  }
];
