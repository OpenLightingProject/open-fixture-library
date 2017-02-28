module.exports = function(svgBasename) {
  return require("fs").readFileSync(require("path").join(__dirname, '..', '..', 'public', svgBasename + '.svg'), 'utf8');
}