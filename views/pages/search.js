module.exports = function(options) {
  const {query, register} = options;

  let searchQuery;

  if (!('q' in query) || (searchQuery = query.q.trim()).length == 0) {
    options.title = 'Search - Open Fixture Library';

    let str = require('../partials/header')(options);

    str += '<h1>Search</h1>';
    str += '<p>Please enter a search query in the form above.</p>';

    str += require('../partials/footer')(options);

    return str;
  }

  const searchQueryEscaped = htmlescape(searchQuery);

  options.title = `Search "${searchQueryEscaped}" - Open Fixture Library`;

  let results = [];
  for (const fix in register.filesystem) {
    const fixData = register.filesystem[fix];
    if (fix.indexOf(query.q.toLowerCase()) > -1 || (fixData.manufacturerName + ' ' + fixData.name).toLowerCase().indexOf(query.q.toLowerCase()) > -1) {
      results.push(fix);
    }
  }
  
  let str = require('../partials/header')(options);

  str += `<h1>Search <em>${searchQueryEscaped}</em></h1>`;

  if (results.length > 0) {
    for (const fix of results) {
      const fixData = register.filesystem[fix];
      str += `<p><a href="/${fix}">${fixData.manufacturerName} ${fixData.name}</p>`;
    }
  }
  else {
    str += `<p>Your search for <em>${searchQueryEscaped}</em> did not match any fixtures. Try using another query or browse by <a href="/manufacturers">manufacturer</a> or <a href="/categories">category</a>.</p>`;
  }

  str += require('../partials/footer')(options);

  return str;
};

function htmlescape(str) {
  return str.replace(/[^0-9A-Za-z ]/g, c => `&#${c.charCodeAt(0)};`);
}