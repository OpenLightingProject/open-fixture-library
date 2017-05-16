module.exports = function(options) {
  const {manufacturers, register} = options;

  options.title = 'Manufacturers - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Manufacturers</h1>';

  str += '<div class="manufacturers grid">';
  for (const man of Object.keys(register.manufacturers).sort(sortManufacturers)) {
    const manufacturer = manufacturers[man];
    const num = register.manufacturers[man].length;
    const numFixtures = `${num} fixture${num === 1 ? '' : 's'}`;

    str += `<a href="/${man}" class="card">`;
    str += `<h2>${manufacturer.name}</h2>`;
    str += `<div class="fixtures">${numFixtures}</div>`;
    str += '</a>';
  }
  str += '</div>';

  str += require('../includes/footer')(options);

  return str;

  function sortManufacturers(a, b) {
    const aName = manufacturers[a].name.toLowerCase();
    const bName = manufacturers[b].name.toLowerCase();

    if (aName < bName) {
      return -1;
    }
    return aName > bName ? 1 : 0;
  }
};