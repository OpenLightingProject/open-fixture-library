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

module.exports = {
  followXmlNodeReference
};
