const svg = require(`../includes/svg.js`);

module.exports = function(options) {
  const {register} = options;

  options.title = `Categories - Open Fixture Library`;

  let str = require(`../includes/header.js`)(options);

  str += `<h1>Categories</h1>`;

  str += `<div class="categories grid">`;
  for (const cat of Object.keys(register.categories).sort(sortCategories)) {
    const num = register.categories[cat].length;
    const numFixtures = `${num} fixture${num === 1 ? `` : `s`}`;
    const link = `/categories/${encodeURIComponent(cat)}`;

    str += `<a href="${link}" class="card card-category">`;
    str += svg.getCategoryIcon(cat);
    str += `<h2>${cat}</h2>`;
    str += `<div class="fixtures">${numFixtures}</div>`;
    str += `</a>`;
  }
  str += `</div>`;

  str += require(`../includes/footer.js`)(options);

  return str;

  function sortCategories(a, b) {
    const aName = a.toLowerCase();
    const bName = b.toLowerCase();

    if (aName < bName) {
      return -1;
    }
    return aName > bName ? 1 : 0;
  }
};
