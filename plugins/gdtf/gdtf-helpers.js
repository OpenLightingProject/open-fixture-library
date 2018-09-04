/**
 * @param {!object} startNode The XML object the reference should be resolved against.
 * @param {!string} nodeReference A string of the form "Name.Name.Name…", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-node
 * @returns {?object} The referenced XML node object, or null if it could not be found.
 */
function followXmlNodeReference(startNode, nodeReference) {
  if (!startNode || !nodeReference) {
    return null;
  }

  const nameParts = nodeReference.split(`.`);
  let currentNode = startNode;

  for (const nameAttr of nameParts) {
    const nodeWithNameAttr = getChildNodes(currentNode).find(
      node => `$` in node && node.$.Name === nameAttr
    );

    if (nodeWithNameAttr) {
      currentNode = nodeWithNameAttr;
    }
    else {
      return null;
    }
  }

  return currentNode;


  /**
   * @param {!object} node The XML object.
   * @returns {!array.<!object>} The XML objects of this node's child nodes.
   */
  function getChildNodes(node) {
    return [].concat(
      ...Object.keys(node).filter(
        tagName => tagName !== `$`
      ).map(
        tagName => node[tagName]
      )
    );
  }
}


/**
 * Convert from CIE color representation xyY 1931 to RGB.
 * See https://wolfcrow.com/blog/what-is-the-difference-between-cie-lab-cie-rgb-cie-xyy-and-cie-xyz/
 * @param {!string} gdtfColorStr A string in the form "0.3127, 0.3290, 100.0", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-colorCIE
 * @returns {!string} The RGB hex code string in the form "#rrggbb".
 */
function getRgbColorFromGdtfColor(gdtfColorStr) {
  // TODO: This is not correct at all :(


  /* eslint-disable camelcase, space-in-parens */

  let X, Y, Z;

  const [x, y, Y_orig] = gdtfColorStr.split(/\s*,\s*/).map(parseFloat);
  // console.log(gdtfColorStr, gdtfColorStr.split(/\s*,\s*/), x, y, Y_orig);

  // see http://www.brucelindbloom.com/index.html?Eqn_xyY_to_XYZ.html
  if (y === 0) {
    X = 0;
    Y = 0;
    Z = 0;
  }
  else {
    X = x * Y_orig / y;
    Y = Y_orig;
    Z = (1 - x - y) * Y_orig / y;
  }

  X /= 100;
  Y /= 100;
  Z /= 100;

  // console.log(X, Y, Z);

  // see http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_RGB.html
  // and http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html

  // CIE RGB
  //          [  2.3706743 -0.9000405 -0.4706338 ]
  // M^(-1) = [ -0.5138850  1.4253036  0.0885814 ]
  //          [  0.0052982 -0.0146949  1.0093968 ]

  const r = ( 2.3706743 * X) + (-0.9000405 * Y) + (-0.4706338 * Z);
  const g = (-0.5138850 * X) + ( 1.4253036 * Y) + ( 0.0885814 * Z);
  const b = ( 0.0052982 * X) + (-0.0146949 * Y) + ( 1.0093968 * Z);

  // Wide Gamut RGB
  //          [  1.4628067 -0.1840623 -0.2743606 ]
  // M^(-1) = [ -0.5217933  1.4472381  0.0677227 ]
  //          [  0.0349342 -0.0968930  1.2884099 ]

  // const r = ( 1.4628067 * X) + (-0.1840623 * Y) + (-0.2743606 * Z);
  // const g = (-0.5217933 * X) + ( 1.4472381 * Y) + ( 0.0677227 * Z);
  // const b = ( 0.0349342 * X) + (-0.0968930 * Y) + ( 1.2884099 * Z);


  const gamma = 2.2;

  const R = Math.min(255, Math.max(Math.floor((Math.pow(r, 1 / gamma) || 0) * 255 * 5), 0));
  const G = Math.min(255, Math.max(Math.floor((Math.pow(g, 1 / gamma) || 0) * 255 * 5), 0));
  const B = Math.min(255, Math.max(Math.floor((Math.pow(b, 1 / gamma) || 0) * 255 * 5), 0));

  // see https://en.wikipedia.org/wiki/CIE_1931_color_space
  //          [  0.41847    -0.15866   -0.082835 ]
  // M^(-1) = [ -0.091169    0.25243    0.015708 ]
  //          [  0.00092090 -0.0025498  0.17860  ]

  // const R = (0.41847 * X) + (-0.15866 * Y) + (-0.082835 * Z);
  // const G = (-0.091169 * X) + (0.25243 * Y) + (0.015708 * Z);
  // const B = (0.00092090 * X) + (-0.0025498 * Y) + (0.17860 * Z);

  // console.log(R, G, B);
  // console.log();

  return `#${getHexComponent(R)}${getHexComponent(G)}${getHexComponent(B)}`;

  /* eslint-enable camelcase, space-in-parens */


  /**
   * @param {!number} componentValue The red / green /blue component value in the range 0…255.
   * @returns {!string} The component value encoded as a two-digit hex number.
   */
  function getHexComponent(componentValue) {
    const hex = componentValue.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }
}

module.exports = {
  followXmlNodeReference,
  getRgbColorFromGdtfColor
};
