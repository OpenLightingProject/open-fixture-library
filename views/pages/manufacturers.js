module.exports = function(options) {
  const {manufacturers, register} = options;

  options.title = 'Manufacturers - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Manufacturers</h1>';

  str += '<div class="manufacturers">';

  // we can rely on register's sorting here
  for (man in register.manufacturers) {
    const manufacturer = manufacturers[man];
    const num = register.manufacturers[man].length;
    const numFixtures = `${num} fixture${num == 1 ? '' : 's'}`;

    str += `<a href="${man}" class="card">`;
    str += `<h2>${manufacturer.name}</h2>`;
    str += `<div class="fixtures">${numFixtures}</div>`;
    str += '</a>';
  }
  str += '</div>'

  str += require('../includes/footer')(options);

  return str;
};
