/**
 * @param {object} startNode The XML object the reference should be resolved against.
 * @param {string} nodeReference A string of the form "Name.Name.Name…", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-node
 * @returns {object | null} The referenced XML node object, or null if it could not be found.
 */
export function followXmlNodeReference(startNode, nodeReference) {
  if (!startNode || !nodeReference) {
    return null;
  }

  const nameParts = nodeReference.split(`.`);
  let currentNode = startNode;

  for (const nameAttribute of nameParts) {
    const nodeWithNameAttribute = getChildNodes(currentNode).find(
      node => `$` in node && node.$.Name === nameAttribute,
    );

    if (nodeWithNameAttribute) {
      currentNode = nodeWithNameAttribute;
    }
    else {
      return null;
    }
  }

  return currentNode;


  /**
   * @param {object} node The XML object.
   * @returns {object[]} The XML objects of this node's child nodes.
   */
  function getChildNodes(node) {
    return Object.entries(node).flatMap(
      ([tagName, nodes]) => (tagName === `$` ? [] : nodes),
    );
  }
}


/**
 * Convert from CIE color representation xyY 1931 to RGB.
 * See https://wolfcrow.com/blog/what-is-the-difference-between-cie-lab-cie-rgb-cie-xyy-and-cie-xyz/
 * @param {string} gdtfColorString A string in the form "0.3127, 0.3290, 100.0", see https://gdtf-share.com/wiki/GDTF_File_Description#attrType-colorCIE
 * @returns {string} The RGB hex code string in the form "#rrggbb".
 */
export function getRgbColorFromGdtfColor(gdtfColorString) {
  /* eslint-disable camelcase, space-in-parens, unicorn/no-zero-fractions */

  // functions ported from https://github.com/njsmith/colorspacious
  const xyY_to_XYZ = (([x, y, Y]) => {
    const X = Y / y * x;
    const Z = Y / y * (1 - x - y);
    return [X, Y, Z];
  });
  const XYZ1_to_XYZ100 = (XYZ1 => XYZ1.map(c => c * 100));
  const XYZ100_to_sRGB1_linear = (([X, Y, Z]) => {
    const R = ( 3.2406 * X / 100) + (-1.5372 * Y / 100) + (-0.4986 * Z / 100);
    const G = (-0.9689 * X / 100) + ( 1.8758 * Y / 100) + ( 0.0415 * Z / 100);
    const B = ( 0.0557 * X / 100) + (-0.2040 * Y / 100) + ( 1.0570 * Z / 100);
    return [R, G, B];
  });
  const sRGB1_linear_to_sRGB1 = (RGB_linear => RGB_linear.map(c => {
    if (c <= 0.003_130_8) {
      return 12.92 * c;
    }

    const a = 0.055;

    return ((1 + a) * Math.pow(c, 1 / 2.4)) - a;
  }));
  const sRGB1_to_sRGB255 = (RGB1 => RGB1.map(c => c * 255));


  // parse starting values as array
  const [x, y, Y] = gdtfColorString.split(/\s*,\s*/).map(
    colorComponent => Number.parseFloat(colorComponent),
  );


  // ported from https://gitlab.com/petrvanek/gdtf-libraries/blob/e3194638c552321ad06af630ba83f49dcf5b0016/gdtf2json.py#L10-25
  const RGB = sRGB1_to_sRGB255(sRGB1_linear_to_sRGB1(XYZ100_to_sRGB1_linear(XYZ1_to_XYZ100(xyY_to_XYZ([x, y, Y])))));

  let r, g, b;
  if (Y > 1) {
    [r, g, b] = RGB.map(c => (c > 0 ? c / 255 : 0));
  }
  else {
    [r, g, b] = RGB;
  }

  let count = 0;
  while (Math.max(r, g, b) < 127 && count < 5) {
    r *= 2;
    g *= 2;
    b *= 2;
    count++;
  }

  // clip to integers in range 0…255
  [r, g, b] = [r, g, b].map(c => Math.floor(Math.min(255, Math.max(0, c || 0))));

  return `#${getHexComponent(r)}${getHexComponent(g)}${getHexComponent(b)}`;

  /* eslint-enable camelcase, space-in-parens, unicorn/no-zero-fractions */


  /**
   * @param {number} componentValue The red / green /blue component value in the range 0…255.
   * @returns {string} The component value encoded as a two-digit hex number.
   */
  function getHexComponent(componentValue) {
    const hex = componentValue.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }
}

/**
 * @param {object} gdtfCapability The enhanced <ChannelSet> XML object.
 */
export function normalizeAngularSpeedDirection(gdtfCapability) {
  if (/CCW|counter[\s-]*clockwise/.test(gdtfCapability.$.Name)) {
    gdtfCapability._physicalFrom = -Math.abs(gdtfCapability._physicalFrom);
    gdtfCapability._physicalTo = -Math.abs(gdtfCapability._physicalTo);
  }
  else if (/CW|clockwise/.test(gdtfCapability.$.Name)) {
    gdtfCapability._physicalFrom = Math.abs(gdtfCapability._physicalFrom);
    gdtfCapability._physicalTo = Math.abs(gdtfCapability._physicalTo);
  }
}
