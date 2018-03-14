module.exports = function(options) {
  options.title = `Page not found - Open Fixture Library`;

  let str = require(`../includes/header.js`)(options);

  str += `<h1>404 - Not found</h1>`;

  str += `<p>The requested page was not found. Maybe you've got the wrong URL? If not, consider <a href="https://github.com/FloEdelmann/open-fixture-library/issues">filing a bug</a>.</p>`;

  str += require(`../includes/footer.js`)(options);

  return str;
};