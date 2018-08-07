const xml2js = require(`xml2js`);

/**
 * @param {object} exportFile The file returned by the plugins' export module.
 * @param {!string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {!string} exportFile.content File content.
 * @param {!string} exportFile.mimetype File mime type.
 * @param {?Array.<Fixture>} exportFile.fixtures Fixture objects that are described in given file; may be ommited if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {?string} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {!Promise} Resolve when the test passes or reject with an array of errors if the test fails.
**/
module.exports = function testAttributesCorrectness(exportFile) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();

    parser.parseString(exportFile.content, (parseError, xml) => {
      if (parseError) {
        return reject([`Error parsing XML: ${parseError.toString()}`]);
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
