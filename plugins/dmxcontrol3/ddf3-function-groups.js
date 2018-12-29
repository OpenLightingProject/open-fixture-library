const xmlbuilder = require(`xmlbuilder`);

module.exports = [
  {
    functions: [`pan`, `tilt`],
    getXmlGroup: mergeIntoNew(`position`)
  },
  {
    functions: [`red`, `green`, `blue`],
    getXmlGroup: mergeIntoNew(`rgb`)
  },
  {
    functions: [`cyan`, `magenta`, `yellow`],
    getXmlGroup: mergeIntoNew(`cmy`)
  },
  {
    functions: [`rgb`, `white`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`rgb`, `amber`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`rgb`, `uv`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`rgb`, `cyan`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`rgb`, `yellow`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`rgb`, `lime`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`rgb`, `indigo`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`gobowheel`, `goboindex`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`gobowheel`, `goborotation`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`gobowheel`, `goboshake`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`prism`, `prismindex`],
    getXmlGroup: mergeIntoFirst
  },
  {
    functions: [`prism`, `prismrotation`],
    getXmlGroup: mergeIntoFirst
  }
];

/**
 * @param {string} tagName The XML tag name of the new parent element.
 * @returns {function} A function that returns a new XML element with the given elements as children.
 */
function mergeIntoNew(tagName) {
  return (...xmlElements) => {
    const xmlParent = xmlbuilder.create(tagName);
    xmlElements.forEach(ele => xmlParent.importDocument(ele));
    return xmlParent;
  };
}

/**
 * @param {XMLElement} firstElement The element in which the other elements should be merged into.
 * @param {...XMLElement} xmlElements The elements that should be merge into the first element.
 * @returns {XMLElement} The first element with the other elements as children.
 */
function mergeIntoFirst(firstElement, ...xmlElements) {
  xmlElements.forEach(ele => firstElement.importDocument(ele));
  return firstElement;
}
