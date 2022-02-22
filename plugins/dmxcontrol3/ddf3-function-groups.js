import xmlbuilder from 'xmlbuilder';

export default [
  {
    functions: [`strobe`, `strobespeed`],
    getXmlGroup: (strobe, strobespeed) => {
      const xmlStrobe = xmlbuilder.create(`strobe`);
      xmlStrobe.attributes = strobespeed.attributes;

      const xmlStrobeType = xmlStrobe.element(`strobetype`);
      xmlStrobeType.attributes = strobe.attributes;

      for (const speedCapability of strobespeed.children) {
        for (const strobeCapability of strobe.children) {
          if (strobeCapability.attributes.type.value !== `open`) {
            const xmlSpeedRange = xmlStrobe.element(`range`);
            xmlSpeedRange.attributes = Object.assign({}, speedCapability.attributes);
            xmlSpeedRange.attributes.type = strobeCapability.attributes.type;

            xmlSpeedRange.element(`step`, {
              handler: `strobetype`,
              mindmx: strobeCapability.attributes.mindmx.value,
              maxdmx: strobeCapability.attributes.maxdmx.value,
            });
          }
        }
      }

      return xmlStrobe;
    },
  },
  {
    functions: [`strobespeed`],
    getXmlGroup: strobespeed => {
      strobespeed.name = `strobe`;
      for (const child of strobespeed.children) {
        child.attribute(`type`, `linear`);
      }

      return strobespeed;
    },
  },
  {
    functions: [`strobe`, `duration`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`pan`, `tilt`],
    getXmlGroup: mergeIntoNew(`position`),
  },
  {
    functions: [`pan`],
    getXmlGroup: rename(`index`),
  },
  {
    functions: [`tilt`],
    getXmlGroup: rename(`index`),
  },
  {
    functions: [`red`, `green`, `blue`],
    getXmlGroup: mergeIntoNew(`rgb`),
  },
  {
    functions: [`cyan`, `magenta`, `yellow`],
    getXmlGroup: mergeIntoNew(`cmy`),
  },
  {
    functions: [`rgb`, `white`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`rgb`, `amber`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`rgb`, `uv`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`rgb`, `cyan`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`rgb`, `yellow`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`rgb`, `lime`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`rgb`, `indigo`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`gobowheel`, `goboindex`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`goboindex`],
    getXmlGroup: rename(`index`),
  },
  {
    functions: [`gobowheel`, `goborotation`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`goborotation`],
    getXmlGroup: rename(`rotation`),
  },
  {
    functions: [`gobowheel`, `goboshake`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`prism`, `prismindex`],
    getXmlGroup: mergeIntoFirst,
  },
  {
    functions: [`prism`, `prismrotation`],
    getXmlGroup: mergeIntoFirst,
  },
];

/**
 * @param {string} tagName The XML tag name of the new parent element.
 * @returns {function} A function that returns a new XML element with the given elements as children.
 */
function mergeIntoNew(tagName) {
  return (...xmlElements) => {
    const xmlParent = xmlbuilder.create(tagName);
    for (const ele of xmlElements) {
      xmlParent.importDocument(ele);
    }
    return xmlParent;
  };
}

/**
 * @param {XMLElement} firstElement The element in which the other elements should be merged into.
 * @param {...XMLElement} xmlElements The elements that should be merge into the first element.
 * @returns {XMLElement} The first element with the other elements as children.
 */
function mergeIntoFirst(firstElement, ...xmlElements) {
  for (const ele of xmlElements) {
    firstElement.importDocument(ele);
  }
  return firstElement;
}

/**
 * @param {string} tagName The new XML tag name.
 * @returns {function} A function that alters the given XML element's tag name to the specified new name.
 */
function rename(tagName) {
  return xmlElement => {
    xmlElement.name = tagName;
    return xmlElement;
  };
}
