const importJson = require(`../../../lib/import-json.js`);

let register;
let manufacturers;

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../index.js').ApiResponse} ApiResponse */

/**
 * Return search results for given parameters. Very primitive match algorithm, maybe put more effort into it sometime.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {Promise.<ApiResponse>} The handled response.
 */
async function getSearchResults({ request }) {
  const { searchQuery, manufacturersQuery, categoriesQuery } = request.requestBody;

  register = await importJson(`../../../fixtures/register.json`, __dirname);
  manufacturers = await importJson(`../../../fixtures/manufacturers.json`, __dirname);

  const results = Object.keys(register.filesystem).filter(
    key => queryMatch(searchQuery, key) && manufacturerMatch(manufacturersQuery, key) && categoryMatch(categoriesQuery, key),
  );
  return {
    body: results,
  };
}

/**
 * Test if a fixture matches the search query.
 * @param {String} searchQuery Search query that the user entered.
 * @param {String} fixtureKey Key of the fixture to test.
 * @returns {Boolean} True if the fixture matches the search query, false otherwise.
 */
function queryMatch(searchQuery, fixtureKey) {
  const manufacturer = fixtureKey.split(`/`)[0];
  const fixtureData = register.filesystem[fixtureKey];

  return fixtureKey.includes(searchQuery.toLowerCase()) || `${manufacturers[manufacturer].name} ${fixtureData.name}`.toLowerCase().includes(searchQuery.toLowerCase());
}

/**
 * Test if a fixture matches the manufacturer query.
 * @param {Array.<String>} manufacturersQuery Selected manufacturers.
 * @param {String} fixtureKey Key of the fixture to test.
 * @returns {Boolean} True if the fixture matches the manufacturer query, false otherwise.
 */
function manufacturerMatch(manufacturersQuery, fixtureKey) {
  const manufacturer = fixtureKey.split(`/`)[0];

  return manufacturersQuery.length === 0 ||
    (manufacturersQuery.length === 1 && manufacturersQuery[0] === ``) ||
    manufacturersQuery.includes(manufacturer);
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

module.exports = { getSearchResults };
