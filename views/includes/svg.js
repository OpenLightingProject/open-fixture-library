module.exports = function(options) {
  return require("fs").readFileSync(require("path").join(__dirname, '..', '..', 'static', 'icons', options.svgBasename + '.svg'), 'utf8');
}