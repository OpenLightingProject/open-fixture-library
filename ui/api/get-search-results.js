const register = require(`../../fixtures/register.json`);
const manufacturers = require(`../../fixtures/manufacturers.json`);

/**
 * Return search results for given parameters. Very primitive match algorithm, maybe put more effort into it sometime.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
 */
module.exports = function getSearchResults(request, response) {
  const { searchQuery, manufacturersQuery, categoriesQuery } = request.body;

  const results = Object.keys(register.filesystem).filter(
    key => queryMatch(searchQuery, key) && manufacturerMatch(manufacturersQuery, key) && categoryMatch(categoriesQuery, key),
  );
  response.json(results);
};

/**
 * Test if a fixture matches the search query.
 * @param {String} searchQuery Search query that the user entered.
 * @param {String} fixtureKey Key of the fixture to test.
 * @returns {Boolean} True if the fixture matches the search query, false otherwise.
 */
function queryMatch(searchQuery, fixtureKey) {
  const man = fixtureKey.split(`/`)[0];
  const fixData = register.filesystem[fixtureKey];

  return fixtureKey.includes(searchQuery.toLowerCase()) || `${manufacturers[man].name} ${fixData.name}`.toLowerCase().includes(searchQuery.toLowerCase());
}

/**
 * Test if a fixture matches the manufacturer query.
 * @param {Array.<String>} manufacturersQuery Selected manufacturers.
 * @param {String} fixtureKey Key of the fixture to test.
 * @returns {Boolean} True if the fixture matches the manufacturer query, false otherwise.
 */
function manufacturerMatch(manufacturersQuery, fixtureKey) {
  const man = fixtureKey.split(`/`)[0];

  return manufacturersQuery.length === 0 ||
    (manufacturersQuery.length === 1 && manufacturersQuery[0] === ``) ||
    manufacturersQuery.includes(man);
}

/**
 * Test if a fixture matches the category query.
 * @param {Array.<String>} categoriesQuery Selected categories.
 * @param {String} fixtureKey Key of the fixture to test.
 * @returns {Boolean} True if the fixture matches the category query, false otherwise.
 */
function categoryMatch(categoriesQuery, fixtureKey) {
  return categoriesQuery.length === 0 ||
    (categoriesQuery.length === 1 && categoriesQuery[0] === ``) ||
    categoriesQuery.some(
      cat => cat in register.categories && register.categories[cat].includes(fixtureKey),
    );
}
