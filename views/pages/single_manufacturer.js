const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, register, man} = options;
  const manufacturer = manufacturers[man];

  options.title = manufacturer.name + ' - Open Fixture Library';

  
  let str = require('../includes/header')(options);

  str += `<h1>${manufacturer.name} fixtures</h1>`;

  if ('website' in manufacturer) {
    str += `<div class="website"><a href="${manufacturer.website}">Website</a></div>`;
  }
  if ('comment' in manufacturer) {
    str += `<p class="comment">${manufacturer.comment}</p>`;
  }

  str += '<ul class="card list manufacturer-fixtures">';
  for (let fix of register.manufacturers[man]) {
    const fixData = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));

    str += `<li><a href="/${man}/${fix}">`
    str += `<span class="name">${fixData.name}</span>`;
    for (const cat of fixData.categories) {
      const icon = 'category-' + cat.toLowerCase().replace(/[^\w]+/g, '-');
      str += require('../includes/svg')({svgBasename: icon});
    }
    str += '</a></li>';
  }
  str += '</ul>';

  str += require('../includes/footer')(options);

  return str;
};