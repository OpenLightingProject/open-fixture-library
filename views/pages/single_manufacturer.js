const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, register, man} = options;
  const manufacturer = manufacturers[man];

  options.title = man + ' - Open Fixture Library';

  
  let str = require('../partials/header')(options);

  str += `<h1>${manufacturer.name} fixtures</h1>`;

  str += '<section class="manufacturer manufacturer-info">';
  if ('website' in manufacturer) {
    str += `<div class="website"><a href="${manufacturer.website}">Website</a></div>`;
  }
  if ('comment' in manufacturer) {
    str += `<p class="comment">${manufacturer.comment}</p>`;
  }
  str += '</section>';

  str += '<ul class="fixtures">';

  for (let fix of register.manufacturers[man]) {
    const fixData = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));

    str += `<li><a href="/${man}/${fix}">${fixData.name}</a></li>`;
  }

  str += '</ul>';

  str += require('../partials/footer')(options);

  return str;
};