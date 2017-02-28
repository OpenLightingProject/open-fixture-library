module.exports = function(options) {
  const {query, namesIndex} = options;

  const searchQueryEscaped = query.q; // TODO htmlescape
  let results = [];

  options.title = `Search "${searchQueryEscaped}" - Open Fixture Library`;

  for (const fix in namesIndex) {
    const fixData = namesIndex[fix];
    if (fix.indexOf(query.q.toLowerCase()) > -1 || (fixData.manufacturerName + ' ' + fixData.name).toLowerCase().indexOf(query.q.toLowerCase()) > -1) {
      results.push(fix);
    }
  }
  
  let str = require('../partials/header')(options);

  str += `<h1>Search "${searchQueryEscaped}"</h1>`;

  if (results.length > 0) {
    for (const fix of results) {
      str += `<p>${fix}</p>`;
    }
  }

  str += require('../partials/footer')(options);

  return str;
};