const xml2js = require(`xml2js`);

module.exports = function testAttributesCorrectness(exportFileData) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();

    parser.parseString(exportFileData, (parseError, xml) => {
      if (parseError) {
        return reject(`Error parsing XML: ${parseError.toString()}`);
      }

      const errors = [];

      const attrDefs = xml.Device.Attributes[0].AttributesDefinition;
      for (const attrDef of attrDefs) {
        const usedNames = [];
        const attrName = attrDef.$.id;

        for (const attr of attrDef.ThisAttribute) {
          const name = attr.parameterName[0].$.id;
          if (usedNames.includes(name)) {
            errors.push(`Duplicate parameter name: ${attrName}/${name}`);
          }
          else {
            usedNames.push(name);
          }
        }
      }

      if (errors.length > 0) {
        return reject(errors);
      }
      return resolve();
    });
  });
};
