module.exports = function(options) {
  options.title = 'Search - Open Fixture Library';
  
  let str = require('../partials/header')(options);

  str += '<h1>Search</h1>';
  str += '<p>search results</p>';

  str += require('../partials/footer')(options);

  return str;
};