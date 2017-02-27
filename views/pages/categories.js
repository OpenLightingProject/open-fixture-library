module.exports = function(options) {
  let str = require('../partials/header')(options);

  str += '<h1>Categories</h1>'
  str += '<p>list of all categories</p>';

  str += require('../partials/footer')(options);

  return str;
};