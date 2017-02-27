const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, typesIndex, type} = options;

  options.title = type + ' - Open Fixture Library';


  let str = require('../partials/header')(options);

  str += `<h1>${type} fixtures</h1>`;

  str += '<ul class="fixtures">';
  
  for (let filename of typesIndex[type]) {
    const [man, fix] = filename.split('/');
    const fixData = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));
    const manData = manufacturers[man];

    str += `<li><a href="/${man}/${fix}">${manData.name} ${fixData.name}</a></li>`;
  }

  str += '</ul>';

  str += require('../partials/footer')(options);

  return str;
};