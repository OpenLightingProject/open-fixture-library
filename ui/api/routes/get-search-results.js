import importJson from '../../../lib/import-json.js';

let register;
let manufacturers;
let searchAttributes;

/** @import { Context as OpenApiBackendContext } from 'openapi-backend' */
/** @import { ApiResponse } from '../index.js' */

/**
 * Return search results for given parameters. Very primitive match algorithm, maybe put more effort into it sometime.
 * @param {OpenApiBackendContext} ctx - Passed from OpenAPI Backend.
 * @returns {Promise<ApiResponse>} The handled response.
 */
export async function getSearchResults({ request }) {
  const {
    searchQuery, manufacturersQuery, categoriesQuery,
    channelsMinQuery, channelsMaxQuery, channelTypesQuery, colorsQuery,
  } = request.requestBody;

  register = await importJson('../../../fixtures/register.json', import.meta.url);
  manufacturers = await importJson('../../../fixtures/manufacturers.json', import.meta.url);
  searchAttributes = await importJson('../../../fixtures/search-attributes.json', import.meta.url);

  const results = Object.keys(register.filesystem).filter(
    (key) => queryMatch(searchQuery, key)
      && manufacturerMatch(manufacturersQuery, key)
      && categoryMatch(categoriesQuery, key)
      && channelCountMatch(channelsMinQuery, channelsMaxQuery, key)
      && channelTypesMatch(channelTypesQuery, key)
      && colorsMatch(colorsQuery, key),
  );
  return {
    body: results,
  };
}

/**
 * Test if a fixture matches the search query.
 * @param {string} searchQuery - Search query that the user entered.
 * @param {string} fixtureKey - Key of the fixture to test.
 * @returns {boolean} True if the fixture matches the search query, false otherwise.
 */
function queryMatch(searchQuery, fixtureKey) {
  const manufacturer = fixtureKey.split('/', 1)[0];
  const fixtureData = register.filesystem[fixtureKey];

  return fixtureKey.includes(searchQuery.toLowerCase()) || `${manufacturers[manufacturer].name} ${fixtureData.name}`.toLowerCase().includes(searchQuery.toLowerCase());
}

/**
 * Test if a fixture matches the manufacturer query.
 * @param {string[]} manufacturersQuery - Selected manufacturers.
 * @param {string} fixtureKey - Key of the fixture to test.
 * @returns {boolean} True if the fixture matches the manufacturer query, false otherwise.
 */
function manufacturerMatch(manufacturersQuery, fixtureKey) {
  const manufacturer = fixtureKey.split('/', 1)[0];

  return (
    manufacturersQuery.length === 0
    || (manufacturersQuery.length === 1 && manufacturersQuery[0] === '')
    || manufacturersQuery.includes(manufacturer)
  );
}

/**
 * Test if a fixture matches the category query.
 * @param {string[]} categoriesQuery - Selected categories.
 * @param {string} fixtureKey - Key of the fixture to test.
 * @returns {boolean} True if the fixture matches the category query, false otherwise.
 */
function categoryMatch(categoriesQuery, fixtureKey) {
  return (
    categoriesQuery.length === 0
    || (categoriesQuery.length === 1 && categoriesQuery[0] === '')
    || categoriesQuery.some(
      (category) => register.categories[category]?.includes(fixtureKey),
    )
  );
}

/**
 * Test if a fixture has a mode whose DMX channel count is within the given range. Fixture redirects
 * use the channel counts of the fixture they point to (see `cli/build-search-attributes.js`).
 * @param {number | null} channelsMinQuery - Minimum number of channels a matching mode must have, if given.
 * @param {number | null} channelsMaxQuery - Maximum number of channels a matching mode must have, if given.
 * @param {string} fixtureKey - Key of the fixture to test.
 * @returns {boolean} True if the fixture matches the channel count query, false otherwise.
 */
function channelCountMatch(channelsMinQuery, channelsMaxQuery, fixtureKey) {
  if (channelsMinQuery === null && channelsMaxQuery === null) {
    return true;
  }

  const min = channelsMinQuery ?? -Infinity;
  const max = channelsMaxQuery ?? Infinity;

  return searchAttributes[fixtureKey].channelCounts.some(
    (channelCount) => channelCount >= min && channelCount <= max,
  );
}

/**
 * Test if a fixture matches the channel types query. A fixture matches if it has a channel of at
 * least one of the selected types (e.g. selecting "Gobo" and "Prism" finds fixtures that have either).
 * @param {string[]} channelTypesQuery - Selected channel types, see `CHANNEL_TYPES` in `lib/model/CoarseChannel.js`.
 * @param {string} fixtureKey - Key of the fixture to test.
 * @returns {boolean} True if the fixture matches the channel types query, false otherwise.
 */
function channelTypesMatch(channelTypesQuery, fixtureKey) {
  return (
    channelTypesQuery.length === 0
    || channelTypesQuery.some(
      (channelType) => searchAttributes[fixtureKey].channelTypes.includes(channelType),
    )
  );
}

/**
 * Test if a fixture matches the colors query.
 *
 * Design decision: unlike `channelTypesMatch()`, this uses AND semantics instead of OR – selecting
 * "Red" and "Green" should only return fixtures that have *both* a Red and a Green channel (e.g. to
 * find RGB(W) fixtures or rebadges of a known fixture), not fixtures that have either one.
 * @param {string[]} colorsQuery - Selected single colors, see `SINGLE_COLORS` in `lib/single-colors.js`.
 * @param {string} fixtureKey - Key of the fixture to test.
 * @returns {boolean} True if the fixture matches the colors query, false otherwise.
 */
function colorsMatch(colorsQuery, fixtureKey) {
  return colorsQuery.every(
    (color) => searchAttributes[fixtureKey].colors.includes(color),
  );
}
