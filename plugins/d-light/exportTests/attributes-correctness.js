const xml2js = require(`xml2js`);
const promisify = require(`util`).promisify;

/**
 * @param {!object} exportFile The file returned by the plugins' export module.
 * @param {!string} exportFile.name File name, may include slashes to provide a folder structure.
 * @param {!string} exportFile.content File content.
 * @param {!string} exportFile.mimetype File mime type.
 * @param {?Array.<!Fixture>} exportFile.fixtures Fixture objects that are described in given file; may be omitted if the file doesn't belong to any fixture (e.g. manufacturer information).
 * @param {?string} exportFile.mode Mode's shortName if given file only describes a single mode.
 * @returns {!Promise.<undefined, !Array.<!string>|!string>} Resolve when the test passes or reject with an array of errors or one error if the test fails.
**/
module.exports = function testAttributesCorrectness(exportFile) {
  const parser = new xml2js.Parser();

  return promisify(parser.parseString)(exportFile.content)
    .then(xml => {
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
        return Promise.reject(errors);
      }

      return Promise.resolve();
    })
    .catch(parseError => Promise.reject(`Error parsing XML: ${parseError.toString()}`));
};
