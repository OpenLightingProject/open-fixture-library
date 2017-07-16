module.exports = function(options) {
  options.title = 'Open Fixture Library';
  
  let str = require('../includes/header.js')(options);

  str += '<h1>Open Fixture Library</h1>';

  str += '<h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>';

  str += '<p><abbr title="Open Fixture Library">OFL</abbr> collects fixture definitions in a JSON format and automatically exports them to the right format for every supported software. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve! Thanks!</p>';

  str += '<div class="banner grid">';
  str += '<a href="/manufacturers" class="card dark blue">' + require('../includes/svg.js')({svgBasename: 'folder-multiple'}) + '<h2>Browse fixtures</h2></a>';
  str += '<a href="/fixture-editor" class="card dark light-green">' + require('../includes/svg.js')({svgBasename: 'plus'}) + '<h2>Add fixture</h2></a>';
  str += '</div>';

  str += '<div class="list grid">';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Atype-bug" class="card">' + require('../includes/svg.js')({svgBasename: 'lightbulb-on-outline', className: 'left'}) + '<span>Request feature</span></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" class="card">' + require('../includes/svg.js')({svgBasename: 'bug', className: 'left'}) + '<span>Report problem</span></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library" class="card">' + require('../includes/svg.js')({svgBasename: 'github-circle', className: 'left'}) + '<span>View source</span></a>';
  str += '</div>';

  str += require('../includes/footer.js')(options);

  return str;
};