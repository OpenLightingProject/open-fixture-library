module.exports = function(options) {
  options.title = 'Open Fixture Library';
  
  let str = require('../includes/header')(options);

  str += '<h1>Open Fixture Library</h1>';

  str += '<p>To use lighting control software like <a href="http://www.qlcplus.org/">QLC+</a> or <a href="http://www.ecue.de/">e:cue</a>, you need fixture definition files for your specific hardware. Those can be difficult to create or find for your software or they may be wrong because nobody peer-reviewed them.</p>';

  str += '<p><abbr title="Open Fixture Library">OFL</abbr> tries to solve those problems by collecting fixture definitions and making them downloadable in various formats. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve!</p>';

  str += '<p>The project is still in a very early state, but you can still check out the progress on <a href="https://github.com/FloEdelmann/open-fixture-library">GitHub</a> and also already report issues or feature requests or even contribute some code. Thanks!</p>';

  str += require('../includes/footer')(options);

  return str;
};