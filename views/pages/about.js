module.exports = function(options) {
  let str = require('../partials/header')(options);

  str += '<h1>About</h1>';

  str += '<p><em>Open Fixture Library</em> is a project by Florian Edelmann. It is <a href="http://github.com/FloEdelmann/open-fixture-library/">open source</a> (licensed under <a href="https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)" title="Gnu General Public License v3">GPL-3</a>) and everybody is invited to contribute!</p>';

  str += require('../partials/footer')(options);

  return str;
};