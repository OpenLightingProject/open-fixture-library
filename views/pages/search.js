module.exports = function(options) {
  const {query, register, manufacturers} = options;

  const searchQuery = (query.q || '').trim();

  if (!('q' in query) || (searchQuery.length == 0)) {
    options.title = 'Search - Open Fixture Library';

    let str = require('../partials/header')(options);

    str += '<h1>Search</h1>';
    str += '<p>Please enter a search query in the form above.</p>';

    str += require('../partials/footer')(options);

    return str;
  }

  const searchQueryCompare = searchQuery.toLowerCase();
  const searchQueryEscaped = htmlescape(searchQuery);

  options.title = `Search "${searchQueryEscaped}" - Open Fixture Library`;
  options.searchQueryEscaped = searchQueryEscaped;

  if (!('m' in query) || query.m === '') {
    query.m = [];
  }
  else if (typeof query.m == 'string') {
    query.m = [query.m];
  }

  if (!('c' in query) || query.c === '') {
    query.c = [];
  }
  else if (typeof query.c == 'string') {
    query.c = [query.c];
  }

  let results = [];
  for (const key in register.filesystem) {
    const [man, fix] = key.split('/');
    const fixData = register.filesystem[key];
    const name = (fixData.manufacturerName + ' ' + fixData.name).toLowerCase();

    // very primitive match algorithm, maybe put more effort into it sometime
    if (
      (key.indexOf(searchQueryCompare) > -1 || name.indexOf(searchQueryCompare) > -1) // name matches
      && (query.m.length == 0 || query.m.indexOf(man) > -1) // manufacturer is not relevant or matches
      && (query.c.length == 0 || categoryMatch(query.c, key, register)) // categories are not relevant or match
      ) {
      results.push(key);
    }
  }

  let str = require('../partials/header')(options);

  str += `<h1>Search <em>${searchQueryEscaped}</em></h1>`;

  str += '<form class="filter" action="/search">';
  str += `  <input type="search" name="q" value="${searchQueryEscaped}" />`;
  str += '  <select name="m" multiple>';
  str += '    <option value="">Filter by manufacturer</option>';
  str += Object.keys(manufacturers).map(man => `<option value="${man}"${query.m.indexOf(man) > -1 ? ' selected' : ''}>${manufacturers[man].name}</option>`).join('');
  str += '  </select>';
  str += '  <select name="c" multiple>';
  str += '    <option value="">Filter by category</option>';
  str += Object.keys(register.categories).map(cat => `<option value="${encodeURIComponent(cat)}"${query.c.indexOf(encodeURIComponent(cat)) > -1 ? ' selected' : ''}>${cat}</option>`).join('');
  str += '  </select>';
  str += '  <button type="submit">Search</button>';
  str += '</form>';

  str += '<div class="search-results">';
  if (results.length > 0) {
    for (const key of results) {
      const fixData = register.filesystem[key];
      str += `<p><a href="/${key}">${fixData.manufacturerName} ${fixData.name}</p>`;
    }
  }
  else {
    str += `<p>Your search for <em>${searchQueryEscaped}</em> did not match any fixtures. Try using another query or browse by <a href="/manufacturers">manufacturer</a> or <a href="/categories">category</a>.</p>`;
  }
  str += '</div>';

  str += require('../partials/footer')(options);

  return str;
};

function categoryMatch(categoryQuery, key, register) {
  for (const category of categoryQuery) {
    const cat = decodeURIComponent(category);
    if (cat in register.categories && register.categories[cat].indexOf(key) > -1) {
      return true;
    }
  }
  return false;
}

function htmlescape(str) {
  return str.replace(/[^0-9A-Za-z ]/g, c => `&#${c.charCodeAt(0)};`);
}