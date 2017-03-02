module.exports = function(options) {
  const {manufacturers, register} = options;

  options.title = 'Manufacturers - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Manufacturers</h1>';

  str += '<div class="manufacturers">';
  for (man in manufacturers) {
    const manufacturer = manufacturers[man];

    let num = 0;
    let link = '';
    if (man in register.manufacturers) {
      num = register.manufacturers[man].length;
      link = `href="${encodeURIComponent(man)}"`;
    }
    const numFixtures = `${num} fixture${num == 1 ? '' : 's'}`;

    str += `<a ${link} class="card">`;
    str += `<h2>${manufacturer.name}</h2>`;
    str += `<div class="fixtures">${numFixtures}</div>`;
    str += '</a>';
  }
  str += '</div>'

  str += require('../includes/footer')(options);

  return str;
};
