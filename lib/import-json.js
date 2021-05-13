const { readFile } = require(`fs/promises`);
const path = require(`path`);

/**
 * @param {String|URL} jsonPath The JSON file path.
 * @param {String|URL|undefined} basePath A path from which the JSON path is resolved relative to.
 * @returns {Promise.<*>} A Promise that resolves to the parsed JSON file content.
 */
module.exports = async function importJson(jsonPath, basePath) {
  if (typeof basePath === `string` && !basePath.startsWith(`file:`)) {
    jsonPath = path.resolve(basePath, jsonPath);
  }
  else if (basePath) {
    jsonPath = new URL(jsonPath, basePath);
  }

  return JSON.parse(await readFile(jsonPath, `utf8`));
};
