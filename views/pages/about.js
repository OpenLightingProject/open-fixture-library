module.exports = function(options) {
  options.title = 'About - Open Fixture Library';
  
  let str = require('../includes/header.js')(options);

  str += '<h1>About</h1>';

  str += '<p>Created by Florian and Felix Edelmann.</p>';
  str += '<p>The full code of the <em>Open Fixture Library</em> is <a href="https://github.com/FloEdelmann/open-fixture-library">open source</a> (licensed under the <a href="https://tldrclegal.com/license/mit-license" title="Massachusetts Institute of Technology License">MIT License</a>) and everybody is invited to contribute!</p>';

  str += '<h2>History</h2>';
  str += '<p>We were used to programming lighting shows with the <a href="http://www.ecue.de/">e:cue</a> software and – because at some point we found it being limited in functionality – wanted to try out other programs. I built a DMX interface with <a href="https://www.openlighting.org/ola/">Open Lighting Architecture</a> and tried <a href="http://www.qlcplus.org/">QLC+</a> and we kept on using that combination since then.</p>';
  str += '<p>The problem we noticed during our testing phase was that all the fixture definitions we created for e:cue could not be easily converted for use with other software.</p>';
  str += '<p>The idea for a converter was born. Since we wanted our work to be as useful for other people as possible, we decided to build a website that would store the fixtures in a wiki-like way (everybody can help improve it) and allow auto-generated fixture files in various formats to be downloaded. Creating new fixtures should be made as simple as possible with an online <a href="/fixture-editor">Fixture Editor</a> that could also import from existing fixture definitions.</p>';

  str += '<h2>Contribute</h2>';
  str += '<p>See the <a href="https://github.com/FloEdelmann/open-fixture-library#contribute">project page on GitHub</a> to see how you can help.</p>';

  str += '<h2>Used fonts</h2>';
  str += '<p><a href="http://www.latofonts.com/">Lato</a> and <a href="http://levien.com/type/myfonts/inconsolata.html">Inconsolata</a></p>';

  str += require('../includes/footer.js')(options);

  return str;
};
