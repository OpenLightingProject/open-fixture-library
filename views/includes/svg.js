module.exports = function(options) {
  return require("fs").readFileSync(require("path").join(__dirname, '..', '..', 'public', options.svgBasename + '.svg'), 'utf8');
}