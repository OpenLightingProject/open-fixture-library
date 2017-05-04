module.exports = function(options) {
  options.title = 'Open Fixture Library';
  
  let str = require('../includes/header')(options);

  str += '<h1>Open Fixture Library</h1>';

  str += '<h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>';

  str += '<p><abbr title="Open Fixture Library">OFL</abbr> collects fixture definitions in a JSON format and automatically exports them to the right format for every supported software. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve! Thanks!</p>';

  str += '<div class="banner grid">';
  str += '<a href="/manufacturers" class="card dark blue-grey">' + require('../includes/svg')({svgBasename: 'folder-multiple'}) + '<h2>Browse fixtures</h2></a>';
  str += '<a href="/fixture-editor" class="card dark light-green">' + require('../includes/svg')({svgBasename: 'plus'}) + '<h2>Add fixture</h2></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Atype-bug" class="card yellow">' + require('../includes/svg')({svgBasename: 'lightbulb-on-outline'}) + '<h2>Request feature</h2></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" class="card dark red">' + require('../includes/svg')({svgBasename: 'bug'}) + '<h2>Report problem</h2></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library" class="card dark blue">' + require('../includes/svg')({svgBasename: 'github-circle'}) + '<h2>View source</h2></a>';
  str += '</div>';

  str += require('../includes/footer')(options);

  return str;
};