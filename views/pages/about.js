module.exports = function(options) {
  options.title = 'About - Open Fixture Library';
  
  let str = require('../includes/header')(options);

  str += '<h1>About</h1>';

  str += '<p><em>Open Fixture Library</em> is a project by Florian Edelmann. It is <a href="https://github.com/FloEdelmann/open-fixture-library">open source</a> (licensed under <a href="https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)" title="Gnu General Public License v3">GPL-3</a>) and everybody is invited to contribute!</p>';

  str += '<h2>Contribute</h2>';
  str += '<p>See the <a href="https://github.com/FloEdelmann/open-fixture-library#contribute">project page on GitHub</a> to see how you can help.</p>';

  str += '<h2>Used fonts</h2>';
  str += '<p><a href="http://www.latofonts.com/">Lato</a> and <a href="http://levien.com/type/myfonts/inconsolata.html">Inconsolata</a></p>';

  str += require('../includes/footer')(options);

  return str;
};