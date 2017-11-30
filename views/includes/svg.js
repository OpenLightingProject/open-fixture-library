const fs = require('fs');

module.exports = {
  getSvg,
  getCategoryIcon
};

/**
 * Returns the contents of the provided SVG file as an inline SVG.
 * @param {!string} svgBasename Name of the file (withoug extension).
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag.
 */
function getSvg(svgBasename, classNames = []) {
  let svg = fs.readFileSync(require('path').join(__dirname, '..', '..', 'static', 'icons', `${svgBasename}.svg`), 'utf8');

  if (classNames.length > 0) {
    svg = svg.replace(/<svg([^>]*)>/, `<svg$1 class="${classNames.join(' ')}">`);
  }

  return svg;
}

/**
 * Get an icon for the provided category.
 * @param {!string} categoryName Name of the category.
 * @param {!Array.<string>} classNames List of class names the <svg> tag should have.
 * @returns {!string} The inline <svg> tag.
 */
function getCategoryIcon(categoryName, classNames = []) {
  const sanitzedCategoryName = categoryName.toLowerCase().replace(/[^\w]+/g, '-');
  const svgBasename = `category-${sanitzedCategoryName}`;
  classNames.push(svgBasename);

  const svg = getSvg(svgBasename, classNames);
  return svg.replace(/(<svg[^>]*>)/, `$1<title>Category: ${categoryName}</title>`);
}
