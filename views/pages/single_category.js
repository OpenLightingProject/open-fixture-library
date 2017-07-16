const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, register, category} = options;
  const categoryClass = category.toLowerCase().replace(/[^\w]+/g, '-');

  options.title = category + ' - Open Fixture Library';


  let str = require('../includes/header.js')(options);

  str += `<h1>${category} fixtures</h1>`;

  str += `<ul class="card list fixtures category-${categoryClass}">`;
  for (let filename of register.categories[category]) {
    const [man, fix] = filename.split('/');
    const fixData = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));
    const manData = manufacturers[man];

    str += `<li><a href="/${man}/${fix}">`;
    str += `<span class="name">${manData.name} ${fixData.name}</span>`;
    for (const cat of fixData.categories) {
      str += require('../includes/svg.js')({categoryName: cat, className: 'right'});
    }
    str += '</a></li>';
  }
  str += '</ul>';

  str += require('../includes/footer.js')(options);

  return str;
};