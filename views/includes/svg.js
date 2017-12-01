const fs = require('fs');
const path = require('path');

module.exports = {
  getSvg,
  getCategoryIcon,
  getChannelTypeIcon
};

/**
 * Returns the contents of the provided SVG file as an inline SVG.
 * @param {!string} svgBasename Name of the file (withoug extension).
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag or an empty string if the file was not found.
 */
function getSvg(svgBasename, classNames = []) {
  const filename = path.join(__dirname, '..', '..', 'static', 'icons', `${svgBasename}.svg`);

  if (!fs.existsSync(filename)) {
    console.error(`svg file '${svgBasename}.svg' not found`);
    return '';
  }

  let svg = fs.readFileSync(filename, 'utf8');

  if (classNames.length > 0) {
    svg = svg.replace(/<svg([^>]*)>/, `<svg$1 class="${classNames.join(' ')}">`);
  }

  return svg;
}

/**
 * Get an icon for the provided category.
 * @param {!string} categoryName Name of the category.
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag or an empty string if the file was not found.
 */
function getCategoryIcon(categoryName, classNames = []) {
  const sanitzedCategoryName = categoryName.toLowerCase().replace(/[^\w]+/g, '-');
  classNames.push(`category-${sanitzedCategoryName}`, 'category-icon', 'icon');

  const svg = getSvg(`categories/${sanitzedCategoryName}`, classNames);
  return svg.replace(/(<svg[^>]*>)/, `$1<title>Category: ${categoryName}</title>`);
}

/**
 * Get an icon for the provided channel type.
 * @param {!string} channelType Channel type to find the icon for.
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag or an empty string if the file was not found.
 */
function getChannelTypeIcon(channelType, classNames = []) {
  const sanitzedChannelType = channelType.toLowerCase().replace(/[^\w]+/g, '-');
  classNames.push(`channel${sanitzedChannelType}`, 'channel-icon', 'icon');

  const svg = getSvg(`channel-types/${sanitzedChannelType}`, classNames);
  return svg.replace(/(<svg[^>]*>)/, `$1<title>Channel type: ${channelType}</title>`);
}
