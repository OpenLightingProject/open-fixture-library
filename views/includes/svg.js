module.exports = function(options) {
  if ('categoryName' in options) {
    options.svgBasename = 'category-' + options.categoryName.toLowerCase().replace(/[^\w]+/g, '-');

    if ('className' in options) {
      options.className += ` ${options.svgBasename}`;
    }
    else {
      options.className = options.svgBasename;
    }
  }

  let svg = require('fs').readFileSync(require('path').join(__dirname, '..', '..', 'static', 'icons', options.svgBasename + '.svg'), 'utf8');

  if ('className' in options) {
    svg = svg.replace(/<svg([^>]*)>/, `<svg$1 class="${options.className}">`);
  }
  if ('categoryName' in options) {
    svg = svg.replace(/(<svg[^>]*>)/, `$1<title>Category: ${options.categoryName}</title>`);
  }

  return svg;
};