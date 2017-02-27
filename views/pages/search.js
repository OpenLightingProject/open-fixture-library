module.exports = function(options) {
  let str = require('../partials/header')(options);

  str += '<h1>Search</h1>';
  str += '<p>search results</p>';

  str += require('../partials/footer')(options);

  return str;
};