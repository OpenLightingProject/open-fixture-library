module.exports = function(options) {
  const {register} = options;
  
  options.title = 'Categories - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Categories</h1>';

  str += '<div class="categories grid">';
  for (cat of Object.keys(register.categories).sort()) {
    const num = register.categories[cat].length;
    const numFixtures = `${num} fixture${num == 1 ? '' : 's'}`;
    const link = '/categories/' + encodeURIComponent(cat);
    const icon = 'category-' + cat.toLowerCase().replace(/[^\w]+/g, '-');

    str += `<a href="${link}" class="card card-category">`;
    str += require('../includes/svg')({svgBasename: icon});
    str += `<h2>${cat}</h2>`;
    str += `<div class="fixtures">${numFixtures}</div>`;
    str += '</a>';
  }
  str += '</div>'

  str += require('../includes/footer')(options);

  return str;
};