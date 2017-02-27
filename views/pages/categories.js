module.exports = function(options) {
  options.title = 'Categories - Open Fixture Library';
  
  const {typesIndex} = options;

  let str = require('../partials/header')(options);

  str += '<h1>Categories</h1>';

  for (type in typesIndex) {
    const num = typesIndex[type].length;
    const numFixtures = `${num} fixture${num == 1 ? '' : 's'}`;
    const link = '/categories/' + encodeURIComponent(type);

    str += '<section class="type">';
    str += '<h2>' + (num > 0 ? `<a href="${link}">${type}</a>` : type) + '</h2>';

    str += '<div class="fixtures">' + numFixtures;
    if (num > 0) {
      str += ` - <a href="${link}">View them</a>`;
    }
    str += '</div>';

    str += '</section>';
  }

  str += require('../partials/footer')(options);

  return str;
};