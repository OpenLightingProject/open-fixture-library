module.exports = function(options) {
  const {register} = options;
  
  options.title = 'Categories - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Categories</h1>';

  str += '<div class="categories">';
  for (cat in register.categories) {
    const num = register.categories[cat].length;
    const numFixtures = `${num} fixture${num == 1 ? '' : 's'}`;
    const link = '/categories/' + encodeURIComponent(cat);

    str += `<a href="${link}" class="card">`;
    str += `<h2>${cat}</h2>`;
    str += `<div class="fixtures">${numFixtures}</div>`;
    str += '</a>';
  }
  str += '</div>'

  str += require('../includes/footer')(options);

  return str;
};