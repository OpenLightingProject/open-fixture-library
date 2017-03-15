module.exports = function(options) {
  options.title = 'Open Fixture Library';
  
  let str = require('../includes/header')(options);

  str += '<h1>Open Fixture Library</h1>';

  str += '<p>To use lighting control software like <a href="http://www.qlcplus.org/">QLC+</a> or <a href="http://www.ecue.de/">e:cue</a>, you need proprietary fixture definition files that describe your lighting hardware. Those can be difficult to create, find or convert from one format into another.</p>';

  str += '<p><abbr title="Open Fixture Library">OFL</abbr> tries to solve those problems by collecting fixture definitions and making them downloadable in various formats. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve! Thanks!</p>';

  str += '<div class="banner grid">';
  str += '<a href="/manufacturers/" class="card">' + require('../includes/svg')({svgBasename: 'folder-multiple'}) + '<h2>Browse fixtures</h2></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" class="card">' + require('../includes/svg')({svgBasename: 'bug'}) + '<h2>Report problem</h2></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Abug" class="card">' + require('../includes/svg')({svgBasename: 'lightbulb-on-outline'}) + '<h2>Request feature</h2></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library" class="card">' + require('../includes/svg')({svgBasename: 'github-circle'}) + '<h2>View source</h2></a>';
  str += '</div>';

  str += require('../includes/footer')(options);

  return str;
};